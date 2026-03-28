/**
 * smoke-test.ts
 * Integration smoke test for QuantApexAI social media automation.
 *
 * Run with: node --import tsx lib/smoke-test.ts
 *
 * Checks:
 *  1. Post Manager — always safe (no credentials needed)
 *  2. Twitter Client — only loaded when all required env vars are present
 *  3. Telegram Client — only loaded when all required env vars are present
 *  4. Chart Capture — only loaded when all required env vars are present
 *  5. MCP Server configuration — reads .claude/.mcp.json
 */

import 'dotenv/config';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

type CheckResult =
  | { status: 'OK'; detail?: string }
  | { status: 'MISSING_CREDENTIALS'; missing: string[] }
  | { status: 'ERROR'; error: string };

/**
 * Check which of the given env var names are absent from process.env.
 * Returns a result object: present = all found, missing = list of absent names.
 */
function checkEnvVars(vars: string[]): { present: boolean; missing: string[] } {
  const missing = vars.filter((v) => !process.env[v]);
  return { present: missing.length === 0, missing };
}

// ---------------------------------------------------------------------------
// Component checks
// ---------------------------------------------------------------------------

/** Test post-manager using a temp directory (never touches real content/). */
async function checkPostManager(): Promise<CheckResult> {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'smoke-post-manager-'));
  try {
    const { saveDraft, listDrafts } = await import('./post-manager.js');

    saveDraft(
      {
        title: 'Smoke Test Draft',
        type: 'ta',
        platforms: ['x'],
        tickers: ['BTC'],
        chartPath: null,
        body: 'This is a smoke-test draft — safe to ignore.',
      },
      tempDir,
    );

    const drafts = listDrafts(tempDir);

    if (drafts.length !== 1) {
      return { status: 'ERROR', error: `Expected 1 draft, found ${drafts.length}` };
    }

    return { status: 'OK', detail: 'saveDraft + listDrafts working' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { status: 'ERROR', error: message };
  } finally {
    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

/** Check Twitter client — dynamic import only when all vars are present. */
async function checkTwitterClient(): Promise<CheckResult> {
  const twitterVars = ['X_CONSUMER', 'X_CONSUMER_PAIR', 'X_ACCESS', 'X_ACCESS_PAIR'];
  const { present, missing } = checkEnvVars(twitterVars);

  if (!present) {
    return { status: 'MISSING_CREDENTIALS', missing };
  }

  try {
    const { createTwitterClient } = await import('./twitter-client.js');
    createTwitterClient();
    return { status: 'OK', detail: 'client instantiated' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { status: 'ERROR', error: message };
  }
}

/** Check Telegram client — dynamic import only when all vars are present. */
async function checkTelegramClient(): Promise<CheckResult> {
  const telegramVars = ['TG_BOT', 'TG_CHANNEL', 'TG_APPROVAL_USER'];
  const { present, missing } = checkEnvVars(telegramVars);

  if (!present) {
    return { status: 'MISSING_CREDENTIALS', missing };
  }

  try {
    const { createTelegramBot } = await import('./telegram-client.js');
    createTelegramBot();
    return { status: 'OK', detail: 'bot instantiated' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { status: 'ERROR', error: message };
  }
}

/** Check chart capture — dynamic import only when all vars are present. */
async function checkChartCapture(): Promise<CheckResult> {
  const chartVars = ['TV_SESSION', 'TV_SIGNATURE'];
  const { present, missing } = checkEnvVars(chartVars);

  if (!present) {
    return { status: 'MISSING_CREDENTIALS', missing };
  }

  try {
    // Just verify the module loads and buildChartUrl works — no real browser launched.
    const { buildChartUrl } = await import('./chart-capture.js');
    const url = buildChartUrl('BTC', '4h');
    if (!url.startsWith('https://www.tradingview.com/chart/')) {
      return { status: 'ERROR', error: `Unexpected chart URL: ${url}` };
    }
    return { status: 'OK', detail: 'module loaded, buildChartUrl working' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { status: 'ERROR', error: message };
  }
}

/** Read .claude/.mcp.json and return configured server names. */
function readMcpServers(): string[] {
  const mcpPath = path.join(PROJECT_ROOT, '.claude', '.mcp.json');
  try {
    const raw = fs.readFileSync(mcpPath, 'utf8');
    const parsed = JSON.parse(raw) as { mcpServers?: Record<string, unknown> };
    return Object.keys(parsed.mcpServers ?? {});
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Report formatting
// ---------------------------------------------------------------------------

function formatResult(label: string, result: CheckResult): string {
  const pad = 18;
  const paddedLabel = `${label}:`.padEnd(pad);

  switch (result.status) {
    case 'OK':
      return `${paddedLabel} OK${result.detail ? ` (${result.detail})` : ''}`;
    case 'MISSING_CREDENTIALS':
      return `${paddedLabel} MISSING_CREDENTIALS (${result.missing.join(', ')})`;
    case 'ERROR':
      return `${paddedLabel} ERROR: ${result.error}`;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('=== QuantApexAI Smoke Test ===\n');

  const [postManagerResult, twitterResult, telegramResult, chartResult] = await Promise.all([
    checkPostManager(),
    checkTwitterClient(),
    checkTelegramClient(),
    checkChartCapture(),
  ]);

  console.log(formatResult('Post Manager', postManagerResult));
  console.log(formatResult('Twitter Client', twitterResult));
  console.log(formatResult('Telegram Client', telegramResult));
  console.log(formatResult('Chart Capture', chartResult));

  const mcpServers = readMcpServers();
  console.log('\nMCP Servers configured:');
  if (mcpServers.length === 0) {
    console.log('  (none found — check .claude/.mcp.json)');
  } else {
    for (const name of mcpServers) {
      console.log(`  - ${name}`);
    }
  }

  console.log(
    '\nSetup guides: account_setup/x-developer-setup.md, account_setup/telegram-setup.md',
  );
}

main().catch((err: unknown) => {
  console.error('Smoke test failed unexpectedly:', err);
  process.exit(1);
});
