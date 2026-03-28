import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Data Model
// ---------------------------------------------------------------------------

export interface Post {
  title: string;
  type: 'recap' | 'ta' | 'news' | 'ai';
  platforms: ('x' | 'telegram')[];
  tickers: string[];
  status: 'draft' | 'approved' | 'published';
  chartPath: string | null;
  created: string;
  published: string | null;
  body: string;
}

// ---------------------------------------------------------------------------
// YAML frontmatter helpers
// ---------------------------------------------------------------------------

/**
 * Serialize a Post (minus body) into simple YAML frontmatter lines.
 * Arrays are written as `key: [val1, val2]`.
 * Strings that contain special chars are quoted; null is written as `null`.
 * Title is always quoted to handle em-dashes and other special characters.
 */
function serializeFrontmatter(data: Omit<Post, 'body'>): string {
  const lines: string[] = [];

  lines.push(`title: "${data.title}"`);
  lines.push(`type: ${data.type}`);
  lines.push(`platforms: [${data.platforms.join(', ')}]`);
  lines.push(`tickers: [${data.tickers.join(', ')}]`);
  lines.push(`status: ${data.status}`);
  lines.push(`chartPath: ${data.chartPath === null ? 'null' : data.chartPath}`);
  lines.push(`created: ${data.created}`);
  lines.push(`published: ${data.published === null ? 'null' : data.published}`);

  return lines.join('\n');
}

/**
 * Parse a raw markdown string (with YAML frontmatter) into a Post object.
 */
function parseMarkdown(raw: string): Post {
  // Split on `---` delimiters.  The file looks like:
  //   ---\n<frontmatter>\n---\n\n<body>
  // After splitting on `---\n` we get:
  //   parts[0] = ''  (empty string before first ---)
  //   parts[1] = frontmatter block
  //   parts[2..] = body (may itself contain --- if the body has horizontal rules)
  const parts = raw.split('---\n');

  if (parts.length < 3) {
    throw new Error('Invalid markdown: missing frontmatter delimiters');
  }

  const frontmatter = parts[1];
  const body = parts.slice(2).join('---\n').trim();

  // Parse frontmatter key-value pairs
  const data: Record<string, string> = {};
  for (const line of frontmatter.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;
    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();
    data[key] = value;
  }

  // Helper: parse array literal "[a, b, c]" → ['a','b','c']
  function parseArray(raw: string): string[] {
    const inner = raw.trim().replace(/^\[/, '').replace(/\]$/, '').trim();
    if (!inner) return [];
    return inner.split(',').map((s) => s.trim()).filter(Boolean);
  }

  // Helper: strip surrounding quotes from a string value
  function unquote(val: string): string {
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      return val.slice(1, -1);
    }
    return val;
  }

  const chartPathRaw = data['chartPath'] ?? 'null';

  return {
    title: unquote(data['title'] ?? ''),
    type: (data['type'] ?? 'ta') as Post['type'],
    platforms: parseArray(data['platforms'] ?? '') as Post['platforms'],
    tickers: parseArray(data['tickers'] ?? ''),
    status: (data['status'] ?? 'draft') as Post['status'],
    chartPath: chartPathRaw === 'null' ? null : chartPathRaw,
    created: data['created'] ?? '',
    published: (data['published'] === 'null' || !data['published']) ? null : data['published'],
    body,
  };
}

/**
 * Generate a filename timestamp string: {YYYYMMDD}-{HHmm}
 */
function timestampFilenamePrefix(date: Date): string {
  const yyyy = date.getUTCFullYear().toString();
  const mm = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const dd = date.getUTCDate().toString().padStart(2, '0');
  const hh = date.getUTCHours().toString().padStart(2, '0');
  const min = date.getUTCMinutes().toString().padStart(2, '0');
  return `${yyyy}${mm}${dd}-${hh}${min}`;
}

/**
 * Build markdown string from a Post object.
 */
function toMarkdown(post: Post): string {
  const { body, ...meta } = post;
  return `---\n${serializeFrontmatter(meta)}\n---\n\n${body}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Write a new draft to content/drafts/{YYYYMMDD}-{HHmm}-{type}.md.
 *
 * @param post     Post data (without status/created/published — those are generated).
 * @param rootDir  Optional override for the project root (used in tests).
 * @returns        Absolute path to the written draft file.
 */
export function saveDraft(
  post: Omit<Post, 'status' | 'created' | 'published'>,
  rootDir: string = process.cwd(),
): string {
  const now = new Date();
  const prefix = timestampFilenamePrefix(now);
  const filename = `${prefix}-${post.type}.md`;

  const draftsDir = path.join(rootDir, 'content', 'drafts');
  fs.mkdirSync(draftsDir, { recursive: true });

  const fullPost: Post = {
    ...post,
    status: 'draft',
    created: now.toISOString(),
    published: null,
  };

  const filePath = path.join(draftsDir, filename);
  fs.writeFileSync(filePath, toMarkdown(fullPost), 'utf8');
  return filePath;
}

/**
 * List all draft posts from content/drafts/.
 *
 * @param rootDir  Optional override for the project root (used in tests).
 * @returns        Array of parsed Post objects.
 */
export function listDrafts(rootDir: string = process.cwd()): Post[] {
  const draftsDir = path.join(rootDir, 'content', 'drafts');

  if (!fs.existsSync(draftsDir)) return [];

  const files = fs.readdirSync(draftsDir).filter((f) => f.endsWith('.md'));
  return files.map((f) => parseMarkdown(fs.readFileSync(path.join(draftsDir, f), 'utf8')));
}

/**
 * List published posts.
 *
 * @param date     Optional ISO date string `YYYY-MM-DD` to filter by day.
 * @param rootDir  Optional override for the project root (used in tests).
 * @returns        Array of parsed Post objects.
 */
export function listPublished(date?: string, rootDir: string = process.cwd()): Post[] {
  const publishedRoot = path.join(rootDir, 'content', 'published');

  if (!fs.existsSync(publishedRoot)) return [];

  // Determine which date-dirs to scan
  let dateDirs: string[];
  if (date) {
    dateDirs = [path.join(publishedRoot, date)];
  } else {
    dateDirs = fs
      .readdirSync(publishedRoot)
      .map((d) => path.join(publishedRoot, d))
      .filter((d) => fs.statSync(d).isDirectory());
  }

  const posts: Post[] = [];
  for (const dir of dateDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
    for (const f of files) {
      posts.push(parseMarkdown(fs.readFileSync(path.join(dir, f), 'utf8')));
    }
  }

  return posts;
}

/**
 * Publish a draft: update metadata, move to content/published/YYYY-MM-DD/, return updated Post.
 *
 * @param draftPath          Absolute path to the draft file.
 * @param publishedPlatforms Platforms the post was actually published to.
 * @param rootDir            Optional override for the project root (used in tests).
 * @returns                  Updated Post object.
 */
export function publishPost(
  draftPath: string,
  publishedPlatforms: ('x' | 'telegram')[],
  rootDir: string = process.cwd(),
): Post {
  const raw = fs.readFileSync(draftPath, 'utf8');
  const post = parseMarkdown(raw);

  const now = new Date();
  const updatedPost: Post = {
    ...post,
    status: 'published',
    platforms: publishedPlatforms,
    published: now.toISOString(),
  };

  const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const publishedDir = path.join(rootDir, 'content', 'published', dateStr);
  fs.mkdirSync(publishedDir, { recursive: true });

  const destPath = path.join(publishedDir, path.basename(draftPath));
  fs.writeFileSync(destPath, toMarkdown(updatedPost), 'utf8');
  fs.unlinkSync(draftPath);

  return updatedPost;
}
