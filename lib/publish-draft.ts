/**
 * publish-draft.ts
 * Publishes a single draft to X (as thread) and Telegram channel, then archives.
 *
 * Usage: pnpm exec tsx lib/publish-draft.ts <draft-filename>
 * Example: pnpm exec tsx lib/publish-draft.ts content/drafts/01-market-pulse-2026-04-02.md
 */

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createTwitterClient, postThread, uploadMedia } from './twitter-client.js';
import { createTelegramBot, postToChannel } from './telegram-client.js';
import { publishPost } from './post-manager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Draft parsing
// ---------------------------------------------------------------------------

function extractTweets(content: string): string[] {
  const xMatch = content.match(/## X Thread.*?\n([\s\S]*?)(?=\n---\n)/);
  if (!xMatch) return [];

  const parts = xMatch[1].split(/### Tweet \d+\n/);
  return parts.map((t) => t.trim()).filter(Boolean);
}

function extractTelegram(content: string): string | null {
  const match = content.match(/## Telegram\n\n([\s\S]*?)\n\n---\n/);
  return match ? match[1].trim() : null;
}

function extractChartPath(content: string): string | null {
  const match = content.match(/^chartPath:\s*(.+)$/m);
  if (!match) return null;
  const val = match[1].trim();
  return val === 'null' ? null : val;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: pnpm exec tsx lib/publish-draft.ts <draft-path>');
    process.exit(1);
  }

  const draftPath = path.isAbsolute(arg) ? arg : path.resolve(PROJECT_ROOT, arg);

  if (!fs.existsSync(draftPath)) {
    console.error(`Draft not found: ${draftPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(draftPath, 'utf8');
  const tweets = extractTweets(content);
  const telegramText = extractTelegram(content);
  const chartPath = extractChartPath(content);
  const resolvedChartPath = chartPath
    ? (path.isAbsolute(chartPath) ? chartPath : path.resolve(PROJECT_ROOT, chartPath))
    : null;
  const hasChart = resolvedChartPath && fs.existsSync(resolvedChartPath);

  if (chartPath && !hasChart) {
    console.log(`WARNING: chartPath "${chartPath}" not found — posting without media`);
  }

  console.log(`\n--- Publishing: ${path.basename(draftPath)} ---`);

  // ---- X / Twitter ----
  if (tweets.length === 0) {
    console.error('ERROR: No tweets found in draft');
    process.exit(1);
  }

  for (let i = 0; i < tweets.length; i++) {
    const len = tweets[i].length;
    console.log(`  Tweet ${i + 1}: ${len}/280 chars`);
    if (len > 280) {
      console.error(`ERROR: Tweet ${i + 1} exceeds 280 chars (${len})`);
      process.exit(1);
    }
  }

  console.log(`\nPosting thread (${tweets.length} tweets) to X...`);
  const twitter = createTwitterClient();

  let mediaId: string | undefined;
  if (hasChart) {
    console.log(`  Uploading media: ${resolvedChartPath}`);
    mediaId = await uploadMedia(twitter, resolvedChartPath!);
    console.log(`  Media uploaded: ${mediaId}`);
  }

  const tweetIds = await postThread(twitter, tweets, mediaId);
  console.log(`X: OK — ${tweetIds.length} tweets posted (first ID: ${tweetIds[0]})`);

  // ---- Telegram ----
  if (telegramText) {
    const channelId = process.env['TG_CHANNEL'];
    if (!channelId) {
      console.error('WARNING: TG_CHANNEL not set — skipping Telegram');
    } else {
      console.log('Posting to Telegram channel...');
      const bot = createTelegramBot();
      await postToChannel(bot, channelId, telegramText, hasChart ? resolvedChartPath! : undefined);
      console.log('Telegram: OK');
    }
  } else {
    console.log('No Telegram content found — skipping');
  }

  // ---- Archive ----
  console.log('Archiving...');
  const published = publishPost(draftPath, ['x', 'telegram'], PROJECT_ROOT);
  console.log(`Archived (published: ${published.published})`);
  console.log('--- Done ---\n');
}

main().catch((err: unknown) => {
  console.error('Publish failed:', err);
  process.exit(1);
});
