import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import {
  saveDraft,
  listDrafts,
  listPublished,
  publishPost,
  type Post,
} from './post-manager.ts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTempContentDir(): string {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-test-'));
  fs.mkdirSync(path.join(tmp, 'content', 'drafts'), { recursive: true });
  fs.mkdirSync(path.join(tmp, 'content', 'published'), { recursive: true });
  return tmp;
}

const MINIMAL_INPUT: Omit<Post, 'status' | 'created' | 'published'> = {
  title: 'BTC 4H Analysis — Rising Wedge',
  type: 'ta',
  platforms: ['x', 'telegram'],
  tickers: ['BTC'],
  chartPath: 'content/charts/btc-4h-20260328-1430.png',
  body: 'Post body text here...',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('saveDraft', () => {
  let tmpRoot: string;

  beforeEach(() => {
    tmpRoot = makeTempContentDir();
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('creates file with correct YAML frontmatter and body', () => {
    const filePath = saveDraft(MINIMAL_INPUT, tmpRoot);

    assert.ok(fs.existsSync(filePath), 'draft file should exist');

    const raw = fs.readFileSync(filePath, 'utf8');
    assert.ok(raw.startsWith('---\n'), 'should start with frontmatter delimiter');

    // Frontmatter is between first and second ---
    const parts = raw.split('---\n');
    // parts[0] = '' (before first ---), parts[1] = frontmatter, parts[2] = body
    assert.ok(parts.length >= 3, 'should have frontmatter and body');

    const frontmatter = parts[1];
    assert.ok(frontmatter.includes('title: "BTC 4H Analysis — Rising Wedge"'), 'title in frontmatter');
    assert.ok(frontmatter.includes('type: ta'), 'type in frontmatter');
    assert.ok(frontmatter.includes('platforms: [x, telegram]'), 'platforms in frontmatter');
    assert.ok(frontmatter.includes('tickers: [BTC]'), 'tickers in frontmatter');
    assert.ok(frontmatter.includes('status: draft'), 'status is draft');
    assert.ok(frontmatter.includes('chartPath: content/charts/btc-4h-20260328-1430.png'), 'chartPath in frontmatter');
    assert.ok(frontmatter.includes('created:'), 'created timestamp present');
    assert.ok(frontmatter.includes('published: null'), 'published is null');

    const body = parts.slice(2).join('---\n').trim();
    assert.equal(body, 'Post body text here...', 'body should match input');
  });

  it('filename follows {YYYYMMDD}-{HHmm}-{type}.md pattern', () => {
    const filePath = saveDraft(MINIMAL_INPUT, tmpRoot);
    const filename = path.basename(filePath);

    // e.g. 20260328-1430-ta.md
    assert.match(filename, /^\d{8}-\d{4}-ta\.md$/, 'filename pattern mismatch');
  });

  it('returns path inside content/drafts/', () => {
    const filePath = saveDraft(MINIMAL_INPUT, tmpRoot);
    const expectedDir = path.join(tmpRoot, 'content', 'drafts');
    assert.equal(path.dirname(filePath), expectedDir, 'file should be in drafts dir');
  });

  it('sets status to draft', () => {
    const filePath = saveDraft(MINIMAL_INPUT, tmpRoot);
    const raw = fs.readFileSync(filePath, 'utf8');
    assert.ok(raw.includes('status: draft'), 'status should be draft');
  });
});

describe('listDrafts', () => {
  let tmpRoot: string;

  beforeEach(() => {
    tmpRoot = makeTempContentDir();
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('returns empty array when no drafts exist', () => {
    const drafts = listDrafts(tmpRoot);
    assert.deepEqual(drafts, []);
  });

  it('returns parsed Post array for each .md file', () => {
    saveDraft(MINIMAL_INPUT, tmpRoot);
    saveDraft({ ...MINIMAL_INPUT, type: 'news', tickers: ['ETH'] }, tmpRoot);

    const drafts = listDrafts(tmpRoot);
    assert.equal(drafts.length, 2, 'should return 2 drafts');

    for (const draft of drafts) {
      assert.equal(draft.status, 'draft', 'each post should have status draft');
      assert.ok(Array.isArray(draft.platforms), 'platforms should be an array');
      assert.ok(Array.isArray(draft.tickers), 'tickers should be an array');
    }
  });

  it('ignores non-.md files', () => {
    fs.writeFileSync(path.join(tmpRoot, 'content', 'drafts', 'ignore.txt'), 'nope');
    fs.writeFileSync(path.join(tmpRoot, 'content', 'drafts', 'ignore.json'), '{}');
    saveDraft(MINIMAL_INPUT, tmpRoot);

    const drafts = listDrafts(tmpRoot);
    assert.equal(drafts.length, 1, 'should only return .md files');
  });

  it('correctly parses multi-value arrays', () => {
    saveDraft({ ...MINIMAL_INPUT, platforms: ['x', 'telegram'], tickers: ['BTC', 'ETH'] }, tmpRoot);

    const [draft] = listDrafts(tmpRoot);
    assert.deepEqual(draft.platforms, ['x', 'telegram'], 'platforms parsed correctly');
    assert.deepEqual(draft.tickers, ['BTC', 'ETH'], 'tickers parsed correctly');
  });
});

describe('listPublished', () => {
  let tmpRoot: string;

  beforeEach(() => {
    tmpRoot = makeTempContentDir();
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('returns empty array when no published posts exist', () => {
    const posts = listPublished(undefined, tmpRoot);
    assert.deepEqual(posts, []);
  });

  it('returns posts from a specific date subdirectory', () => {
    // Manually create a published post under a date dir
    const dateDir = path.join(tmpRoot, 'content', 'published', '2026-03-28');
    fs.mkdirSync(dateDir, { recursive: true });

    const postContent = [
      '---',
      'title: "Test Post"',
      'type: ta',
      'platforms: [x]',
      'tickers: [BTC]',
      'status: published',
      'chartPath: null',
      'created: 2026-03-28T10:00:00Z',
      'published: 2026-03-28T11:00:00Z',
      '---',
      '',
      'Body text.',
    ].join('\n');

    fs.writeFileSync(path.join(dateDir, '20260328-1000-ta.md'), postContent);

    const posts = listPublished('2026-03-28', tmpRoot);
    assert.equal(posts.length, 1, 'should find 1 published post');
    assert.equal(posts[0].title, 'Test Post');
    assert.equal(posts[0].status, 'published');
    assert.equal(posts[0].published, '2026-03-28T11:00:00Z');
  });

  it('returns all published posts when no date is given', () => {
    for (const date of ['2026-03-27', '2026-03-28']) {
      const dateDir = path.join(tmpRoot, 'content', 'published', date);
      fs.mkdirSync(dateDir, { recursive: true });

      const postContent = [
        '---',
        `title: "Post on ${date}"`,
        'type: news',
        'platforms: [telegram]',
        'tickers: [ETH]',
        'status: published',
        'chartPath: null',
        `created: ${date}T10:00:00Z`,
        `published: ${date}T11:00:00Z`,
        '---',
        '',
        'Body.',
      ].join('\n');

      fs.writeFileSync(path.join(dateDir, `${date.replace(/-/g, '')}-1000-news.md`), postContent);
    }

    const posts = listPublished(undefined, tmpRoot);
    assert.equal(posts.length, 2, 'should return posts from all date directories');
  });
});

describe('publishPost', () => {
  let tmpRoot: string;

  beforeEach(() => {
    tmpRoot = makeTempContentDir();
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('moves file from drafts to published/YYYY-MM-DD/ directory', () => {
    const draftPath = saveDraft(MINIMAL_INPUT, tmpRoot);
    assert.ok(fs.existsSync(draftPath), 'draft should exist before publish');

    const updated = publishPost(draftPath, ['x', 'telegram'], tmpRoot);

    assert.ok(!fs.existsSync(draftPath), 'draft should be removed after publish');

    // Verify it's in the published dir
    const publishedDateDir = path.join(
      tmpRoot,
      'content',
      'published',
      updated.published!.slice(0, 10),
    );
    const publishedFile = path.join(publishedDateDir, path.basename(draftPath));
    assert.ok(fs.existsSync(publishedFile), 'file should exist in published dir');
  });

  it('updates status to published', () => {
    const draftPath = saveDraft(MINIMAL_INPUT, tmpRoot);
    const updated = publishPost(draftPath, ['x', 'telegram'], tmpRoot);
    assert.equal(updated.status, 'published', 'status should be published');
  });

  it('sets published timestamp', () => {
    const draftPath = saveDraft(MINIMAL_INPUT, tmpRoot);
    const before = new Date();
    const updated = publishPost(draftPath, ['x', 'telegram'], tmpRoot);
    const after = new Date();

    assert.ok(updated.published !== null, 'published should not be null');
    const publishedTime = new Date(updated.published!);
    assert.ok(publishedTime >= before && publishedTime <= after, 'published time should be recent');
  });

  it('updates platforms to the published platforms', () => {
    const draftPath = saveDraft({ ...MINIMAL_INPUT, platforms: ['x', 'telegram'] }, tmpRoot);
    const updated = publishPost(draftPath, ['x'], tmpRoot);
    assert.deepEqual(updated.platforms, ['x'], 'platforms should be updated to published platforms');
  });

  it('returns updated Post object with correct fields', () => {
    const draftPath = saveDraft(MINIMAL_INPUT, tmpRoot);
    const updated = publishPost(draftPath, ['telegram'], tmpRoot);

    assert.equal(updated.title, MINIMAL_INPUT.title);
    assert.equal(updated.type, MINIMAL_INPUT.type);
    assert.equal(updated.body, MINIMAL_INPUT.body);
    assert.equal(updated.status, 'published');
    assert.deepEqual(updated.platforms, ['telegram']);
    assert.ok(updated.published !== null);
  });
});
