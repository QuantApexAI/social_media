# QuantApexAI Social Media Automation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a semi-automated social media posting system for the QuantApexAI brand, operated via Claude Code, posting to X (Twitter) and Telegram.

**Architecture:** MCP servers for read-only market data (TradingView, crypto RSS). Custom TypeScript libraries for all credential-touching operations (posting to X, posting to Telegram, capturing TradingView charts). Drafts are sent to Telegram for mobile preview; approval and publishing happen within the Claude Code session.

**Tech Stack:** TypeScript, pnpm, twitter-api-v2, telegraf, playwright, dotenv, tsx

**Spec:** `docs/superpowers/specs/2026-03-28-social-media-automation-design.md`

---

## File Map

### New Files to Create

| File | Responsibility |
|------|---------------|
| `.gitignore` | Exclude `.env`, `node_modules/`, `dist/`, `content/charts/`, `*.log` |
| `.env.example` | Document canonical env var names with empty values and comments |
| `package.json` | Project dependencies and metadata |
| `tsconfig.json` | TypeScript configuration for ESM + tsx execution |
| `config/watchlist.json` | Crypto, indices, forex tickers to track |
| `config/posting-rules.json` | Platform limits and default posting behavior |
| `brand/voice-guide.md` | Brand voice rules, dos/don'ts, tone guidelines |
| `brand/hashtags.md` | Standard hashtag sets by content type |
| `brand/templates/market-recap.md` | Template for daily market recap posts |
| `brand/templates/technical-analysis.md` | Template for TA posts |
| `lib/twitter-client.ts` | X/Twitter posting: postTweet, postThread, uploadMedia |
| `lib/telegram-client.ts` | Telegram: postToChannel, sendDraft |
| `lib/chart-capture.ts` | TradingView chart screenshots via Playwright |
| `lib/post-manager.ts` | Draft/publish lifecycle: saveDraft, publishPost, listDrafts |
| `account_setup/x-developer-setup.md` | Step-by-step X Developer account setup guide |
| `account_setup/telegram-setup.md` | Step-by-step Telegram channel + bot setup guide |
| `CLAUDE.md` | Project instructions for Claude Code sessions |

### Files to Modify

| File | Change |
|------|--------|
| `.claude/.mcp.json` | Add tradingview-mcp, tradingview-screener, crypto-rss servers |

### Directories to Create

```
brand/templates/
config/
content/drafts/
content/published/
content/charts/
lib/
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `.gitignore`
- Create: `.env.example`
- Create: `package.json`
- Create: `tsconfig.json`
- Create: directories (`brand/templates/`, `config/`, `content/drafts/`, `content/published/`, `content/charts/`, `lib/`)
- Create: `.gitkeep` files in empty directories

- [ ] **Step 1: Create .gitignore**

```
.env
node_modules/
dist/
content/charts/
*.log
```

- [ ] **Step 2: Create .env.example**

Document the canonical env var names with empty values and comments explaining where to get each one. Variable names per spec:
- X/Twitter: `X_CONSUMER`, `X_CONSUMER_PAIR`, `X_ACCESS`, `X_ACCESS_PAIR`
- Telegram: `TG_BOT`, `TG_CHANNEL`, `TG_APPROVAL_USER`
- TradingView: `TV_SESSION`, `TV_SIGNATURE`

Each variable should have a comment above it explaining what it is and where to obtain it (e.g., "# From X Developer Portal > Project > Keys and Tokens").

- [ ] **Step 3: Create package.json**

```json
{
  "name": "quantapex-social-media",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "QuantApexAI social media automation — semi-automated posting to X and Telegram",
  "dependencies": {
    "twitter-api-v2": "^1.18.2",
    "telegraf": "^4.16.3",
    "playwright": "^1.49.1",
    "dotenv": "^16.4.7"
  },
  "devDependencies": {
    "typescript": "^5.7.2",
    "tsx": "^4.19.2",
    "@types/node": "^22.10.2"
  }
}
```

- [ ] **Step 4: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": ".",
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["lib/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 5: Create directory structure with .gitkeep files**

Create all directories listed in the spec. Add `.gitkeep` to empty content directories so they are tracked by git:
- `content/drafts/.gitkeep`
- `content/published/.gitkeep`
- `content/charts/.gitkeep`
- `brand/templates/` (will be populated in Task 3)
- `config/` (will be populated in Task 2)
- `lib/` (will be populated in Tasks 5-8)

- [ ] **Step 6: Run pnpm install**

Run: `pnpm install`
Expected: `node_modules/` created, `pnpm-lock.yaml` generated. Verify playwright, twitter-api-v2, telegraf, dotenv all resolve.

- [ ] **Step 7: Install Playwright browsers**

Run: `pnpm exec playwright install chromium`
Expected: Chromium browser downloaded for Playwright. Only chromium is needed (not firefox/webkit).

- [ ] **Step 8: Commit**

```bash
git add .gitignore .env.example package.json pnpm-lock.yaml tsconfig.json content/ brand/ config/ lib/
git commit -m "feat: scaffold project with dependencies and directory structure"
```

---

## Task 2: Configuration Files

**Files:**
- Create: `config/watchlist.json`
- Create: `config/posting-rules.json`

- [ ] **Step 1: Create config/watchlist.json**

```json
{
  "crypto": ["BTC", "ETH", "SOL", "XRP", "BNB", "ADA", "AVAX", "DOT", "LINK", "MATIC"],
  "indices": ["SPX", "NDX"],
  "forex": ["DXY"],
  "custom": []
}
```

- [ ] **Step 2: Create config/posting-rules.json**

```json
{
  "platforms": {
    "x": {
      "maxLength": 280,
      "threadMaxTweets": 8,
      "mediaTypes": ["png", "jpg"]
    },
    "telegram": {
      "maxLength": 4096,
      "mediaTypes": ["png", "jpg", "gif"]
    }
  },
  "defaults": {
    "postToBoth": true,
    "includeHashtags": true,
    "includeChart": true
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add config/
git commit -m "feat: add watchlist and posting rules configuration"
```

---

## Task 3: Brand Assets

**Files:**
- Create: `brand/voice-guide.md`
- Create: `brand/hashtags.md`
- Create: `brand/templates/market-recap.md`
- Create: `brand/templates/technical-analysis.md`

- [ ] **Step 1: Create brand/voice-guide.md**

Content per spec's Content Strategy section. Include:
- Brand description: "Analytical authority with community warmth. The smart friend who works at a trading desk."
- Do/Don't table (lead with data, explain the why, acknowledge uncertainty vs. hype, financial advice, overconfidence)
- Tone examples for each content type
- Platform-specific guidance (X: concise, 280-char aware, threads for long TA; Telegram: longer format, full chart + detailed commentary)
- Disclaimer note: never give financial advice, always "watching for..." not "you should..."

- [ ] **Step 2: Create brand/hashtags.md**

```markdown
# QuantApexAI Hashtag Sets

## Market Recap
#Crypto #BTC #ETH #MarketUpdate #QuantApexAI

## Technical Analysis
#TechnicalAnalysis #CryptoTrading #QuantApexAI
Plus coin-specific: #BTC #ETH #SOL etc.

## AI / Tech News
#AI #ArtificialIntelligence #Tech #QuantApexAI

## General (always include)
#QuantApexAI
```

- [ ] **Step 3: Create brand/templates/market-recap.md**

Template based on spec example. Include placeholders:
```
Market Pulse | {date}

{for each crypto in watchlist.crypto top movers:}
{TICKER} ${price} ({change}%) — {brief commentary}

{for indices and forex:}
{NAME}: {value} ({change}%)

Key levels to watch:
- {TICKER}: Support ${level} | Resistance ${level}

{hashtags from brand/hashtags.md#market-recap}
```

Include a section explaining how Claude should fill in each placeholder and what "brief commentary" means (one sentence about price action relative to key moving averages or patterns).

- [ ] **Step 4: Create brand/templates/technical-analysis.md**

Template based on spec example. Include placeholders:
```
{TICKER} {timeframe} Analysis

{Setup description — pattern name, duration, key observation}

Key observations:
- {observation 1 with specific level}
- {observation 2 with specific level}
- {observation 3 — volume/momentum context}
- {observation 4 — indicator reading}

{Thesis — what to watch for, with confirmation level}
{Invalidation — level that negates the thesis}

[Chart Image]

{hashtags from brand/hashtags.md#technical-analysis}
```

Include guidance on: which timeframes to use (4H for swing setups, 1D for trend context), which indicators to reference (RSI, MACD, volume, key EMAs), and how to phrase the thesis (always "watching for..." never "will happen").

- [ ] **Step 5: Commit**

```bash
git add brand/
git commit -m "feat: add brand voice guide, hashtags, and content templates"
```

---

## Task 4: Account Setup Guides

**Files:**
- Create: `account_setup/x-developer-setup.md`
- Create: `account_setup/telegram-setup.md`

- [ ] **Step 1: Create account_setup/x-developer-setup.md**

Step-by-step guide covering:
1. Go to developer.x.com and sign in with @QuantApexAI account
2. Apply for developer access (select "Making a bot" or "Building tools")
3. Create a new Project (name: "QuantApexAI Automation")
4. Create an App within the project
5. Set App permissions to "Read and Write"
6. Navigate to "Keys and Tokens" tab
7. Generate Consumer Keys (copy both values)
8. Generate Access Token and its pair value (copy both values)
9. Copy all four values into `.env` using the canonical variable names from `.env.example`
10. Test: how to verify credentials work (we'll add a test script later)

Include notes on:
- Free tier limits: 1,500 tweets/month, 50 requests/15 min
- OAuth 1.0a is required for posting (not OAuth 2.0 app-only)
- Keep credentials secure, never share or commit

- [ ] **Step 2: Create account_setup/telegram-setup.md**

Step-by-step guide covering:
1. Create a Telegram account (if not already have one)
2. Create the @QuantApexAI channel:
   - Open Telegram > New Channel > Name: "QuantApexAI" > Set as Public > Choose username
3. Create a bot via BotFather:
   - Open @BotFather in Telegram
   - Send `/newbot`
   - Name: "QuantApexAI Bot"
   - Username: `quantapexai_bot` (or similar available name)
   - Copy the bot token
4. Add bot as channel admin:
   - Open channel settings > Administrators > Add Administrator > Search for your bot
   - Grant "Post Messages" permission
5. Get your personal user ID (for draft approval DMs):
   - Open @userinfobot in Telegram, send `/start`, copy the numeric ID
6. Get channel ID:
   - Forward a message from the channel to @userinfobot, or use the channel username with `-100` prefix
7. Copy all three values into `.env` using canonical names from `.env.example`
8. Test: send a test message to yourself via the bot to verify

- [ ] **Step 3: Commit**

```bash
git add account_setup/
git commit -m "feat: add X Developer and Telegram account setup guides"
```

---

## Task 5: Post Manager Library (lib/post-manager.ts)

**Files:**
- Create: `lib/post-manager.ts`
- Create: `lib/post-manager.test.ts`

This task is first because it has no external dependencies (no credentials needed) and other libraries will use it.

- [ ] **Step 1: Write tests for post-manager**

Create `lib/post-manager.test.ts` with tests for:

1. `saveDraft(post)` — creates a markdown file in `content/drafts/` with correct YAML frontmatter (title, type, platforms, tickers, status: "draft", chartPath, created timestamp) and body text. Filename follows `{timestamp}-{type}.md` convention.
2. `listDrafts()` — returns array of draft objects parsed from `content/drafts/`, excluding non-markdown files.
3. `listPublished(date?)` — returns array from `content/published/YYYY-MM-DD/`, filters by date if provided.
4. `publishPost(draftPath, publishedPlatforms)` — reads draft, updates status to "published", sets `published` timestamp, moves file to `content/published/YYYY-MM-DD/{timestamp}-{type}.md`, returns the parsed post object.
5. `publishPost` with partial platforms — when only one platform succeeded, updates frontmatter `platforms` to reflect which actually published.

Use `node:fs` and `node:path`. Use a temporary directory for test isolation (create temp content dirs in beforeEach, clean up in afterEach).

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec tsx --test lib/post-manager.test.ts`
Expected: FAIL — `post-manager.ts` doesn't exist yet.

- [ ] **Step 3: Implement lib/post-manager.ts**

Implement with these functions:

```typescript
import { readFileSync, writeFileSync, mkdirSync, readdirSync, renameSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

interface Post {
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
```

- `saveDraft(post: Omit<Post, 'status' | 'created' | 'published'>)` — generates timestamp, writes markdown with YAML frontmatter to `content/drafts/{timestamp}-{type}.md`, returns the file path.
- `listDrafts()` — reads `content/drafts/`, parses each `.md` file, returns `Post[]`.
- `listPublished(date?: string)` — reads `content/published/{date}/` (or all dates), parses, returns `Post[]`.
- `publishPost(draftPath: string, publishedPlatforms: ('x' | 'telegram')[])` — reads draft, updates status/platforms/published timestamp, creates date directory under `content/published/`, moves file there, returns updated Post.

Use simple string-based YAML frontmatter parsing (split on `---` delimiters, parse key-value pairs). No external YAML library needed for this simple schema.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec tsx --test lib/post-manager.test.ts`
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/post-manager.ts lib/post-manager.test.ts
git commit -m "feat: add post manager for draft/publish lifecycle"
```

---

## Task 6: Twitter Client Library (lib/twitter-client.ts)

**Files:**
- Create: `lib/twitter-client.ts`
- Create: `lib/twitter-client.test.ts`

- [ ] **Step 1: Write tests for twitter-client**

Create `lib/twitter-client.test.ts`. Since this wraps an external API, tests should:

1. Test `createTwitterClient()` — verifies it reads env vars and creates a `TwitterApi` instance. Mock `dotenv` to provide test values.
2. Test `postTweet(client, text)` — verify it calls `client.v2.tweet()` with the text. Use a mock/stub for the TwitterApi client.
3. Test `postTweet(client, text, mediaId)` — verify it passes media_ids in the tweet payload.
4. Test `uploadMedia(client, imagePath)` — verify it calls `client.v1.uploadMedia()` with the path and returns a media ID string.
5. Test `postThread(client, tweets[])` — verify it calls tweet for each item, chaining `reply_to` IDs. Verify it throws if any tweet exceeds 280 characters.
6. Test thread validation — `postThread` with a tweet over 280 chars should throw before making any API calls.

Use `node:test` with `mock` for stubbing the TwitterApi methods.

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec tsx --test lib/twitter-client.test.ts`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement lib/twitter-client.ts**

```typescript
import { TwitterApi } from 'twitter-api-v2';
import 'dotenv/config';

export function createTwitterClient(): TwitterApi {
  // Read the four OAuth 1.0a env vars: X_CONSUMER, X_CONSUMER_PAIR, X_ACCESS, X_ACCESS_PAIR
  // Pass to TwitterApi constructor as appKey, appPair, accessToken, accessPair
  return new TwitterApi({ /* credentials from env */ });
}

export async function postTweet(
  client: TwitterApi,
  text: string,
  mediaId?: string
): Promise<string> {
  // Returns tweet ID
  // Throws on failure with descriptive error (include HTTP status, rate limit info if 429)
}

export async function uploadMedia(
  client: TwitterApi,
  imagePath: string
): Promise<string> {
  // Uses v1 media upload endpoint
  // Returns media ID string
}

export async function postThread(
  client: TwitterApi,
  tweets: string[]
): Promise<string[]> {
  // 1. Validate ALL tweets are <= 280 chars BEFORE posting any
  // 2. Post first tweet
  // 3. Reply-chain subsequent tweets using in_reply_to_tweet_id
  // Returns array of tweet IDs
}
```

Each function should throw descriptive errors on failure (include HTTP status, rate limit info if 429).

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec tsx --test lib/twitter-client.test.ts`
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/twitter-client.ts lib/twitter-client.test.ts
git commit -m "feat: add Twitter client for posting tweets and threads"
```

---

## Task 7: Telegram Client Library (lib/telegram-client.ts)

**Files:**
- Create: `lib/telegram-client.ts`
- Create: `lib/telegram-client.test.ts`

- [ ] **Step 1: Write tests for telegram-client**

Create `lib/telegram-client.test.ts`. Tests:

1. Test `createTelegramBot()` — reads `TG_BOT` env var, creates Telegraf instance.
2. Test `postToChannel(bot, channelId, text)` — calls `bot.telegram.sendMessage()` with channel ID and text, using HTML parse mode.
3. Test `postToChannel(bot, channelId, text, imagePath)` — calls `bot.telegram.sendPhoto()` with the image and text as caption.
4. Test `sendDraft(bot, userId, draft)` — formats the draft as a readable preview message (includes title, type, body, platform tags) and sends to the user's DM via `bot.telegram.sendMessage()`.
5. Test `sendDraft` with chart — includes a note about the attached chart path in the preview.

Mock Telegraf's `telegram` property methods.

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec tsx --test lib/telegram-client.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement lib/telegram-client.ts**

```typescript
import { Telegraf } from 'telegraf';
import { readFileSync } from 'node:fs';
import 'dotenv/config';

export function createTelegramBot(): Telegraf {
  return new Telegraf(process.env.TG_BOT!);
}

export async function postToChannel(
  bot: Telegraf,
  channelId: string,
  text: string,
  imagePath?: string
): Promise<void> {
  // If imagePath provided: sendPhoto with caption
  // Otherwise: sendMessage with HTML parse mode
  // Throw on failure with descriptive error
}

export async function sendDraft(
  bot: Telegraf,
  userId: string,
  draft: { title: string; type: string; body: string; chartPath: string | null; platforms: string[] }
): Promise<void> {
  // Format draft as readable preview:
  // Title, type badge, platform tags, body text
  // If chartPath, note that a chart is attached
  // Send to user's DM
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec tsx --test lib/telegram-client.test.ts`
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/telegram-client.ts lib/telegram-client.test.ts
git commit -m "feat: add Telegram client for channel posting and draft previews"
```

---

## Task 8: Chart Capture Library (lib/chart-capture.ts)

**Files:**
- Create: `lib/chart-capture.ts`
- Create: `lib/chart-capture.test.ts`

- [ ] **Step 1: Write tests for chart-capture**

Create `lib/chart-capture.test.ts`. Tests:

1. Test `captureChart(ticker, interval)` — verify it launches a Playwright browser, navigates to TradingView chart URL with correct ticker/interval, waits for chart to render, takes screenshot, saves to `content/charts/{ticker}-{interval}-{timestamp}.png`, returns the file path.
2. Test `captureChart` returns `null` on failure — when Playwright throws (e.g., timeout), function catches and returns `null` instead of throwing.
3. Test `buildChartUrl(ticker, interval)` — returns correct TradingView URL format.
4. Test screenshot filename format — verify `{ticker}-{interval}-{YYYYMMDD}-{HHmm}.png` pattern (lowercase ticker).

For Playwright tests: mock `playwright.chromium.launch()` to return a stub browser/page. The actual browser interaction can't be unit tested — integration testing requires real TV session cookies.

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec tsx --test lib/chart-capture.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement lib/chart-capture.ts**

```typescript
import { chromium, type Browser } from 'playwright';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import 'dotenv/config';

export function buildChartUrl(ticker: string, interval: string): string {
  // Returns TradingView chart URL with ticker and interval params
  // Map interval shorthand: '4h' -> '240', '1d' -> 'D', '1w' -> 'W'
}

export async function captureChart(
  ticker: string,
  interval: string
): Promise<string | null> {
  // Try/catch entire flow, return null on any failure
  try {
    // 1. Launch chromium with TV session cookies
    //    Cookies from env: TV_SESSION, TV_SIGNATURE
    //    Set as cookies on .tradingview.com domain
    // 2. Navigate to buildChartUrl(ticker, interval)
    // 3. Wait for chart canvas to render (wait for selector, networkidle)
    // 4. Take screenshot of chart area
    // 5. Save to content/charts/{ticker}-{interval}-{YYYYMMDD}-{HHmm}.png
    // 6. Close browser
    // 7. Return file path
  } catch (error) {
    console.error(`Chart capture failed for ${ticker} ${interval}:`, error);
    return null;
  }
  // Always close browser in finally block
}
```

Key implementation details:
- Cookie injection: set `sessionid` and `sessionid_sign` cookies on `.tradingview.com` domain before navigating
- Wait strategy: `page.waitForSelector('canvas', { timeout: 15000 })` then `page.waitForTimeout(3000)` for chart data to populate
- Screenshot: `page.locator('.chart-container').screenshot()` or full page if container not found
- Always close browser in finally block

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec tsx --test lib/chart-capture.test.ts`
Expected: All tests PASS (unit tests with mocks).

- [ ] **Step 5: Commit**

```bash
git add lib/chart-capture.ts lib/chart-capture.test.ts
git commit -m "feat: add TradingView chart capture via Playwright"
```

---

## Task 9: MCP Server Configuration

**Files:**
- Modify: `.claude/.mcp.json`

- [ ] **Step 1: Read current .mcp.json**

Read `.claude/.mcp.json` to see existing servers (github-remote, brave-search).

- [ ] **Step 2: Add three MCP servers**

Add to the `mcpServers` object in `.claude/.mcp.json`:

```json
"tradingview-mcp": {
  "type": "sse",
  "url": "http://localhost:8080/sse",
  "command": "docker",
  "args": ["run", "--rm", "-p", "8080:8000", "atilaahmet/tradingview-mcp:latest"]
},
"tradingview-screener": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "tradingview-mcp-server"]
},
"crypto-rss": {
  "type": "stdio",
  "command": "uvx",
  "args": ["crypto-rss-mcp"]
}
```

Preserve existing github-remote and brave-search entries.

- [ ] **Step 3: Verify Docker is available for tradingview-mcp**

Run: `docker --version`
Expected: Docker version output. If Docker is not installed, add a note in the commit and the CLAUDE.md that tradingview-mcp requires Docker.

- [ ] **Step 4: Commit**

```bash
git add .claude/.mcp.json
git commit -m "feat: add TradingView and crypto RSS MCP servers"
```

---

## Task 10: CLAUDE.md Project Instructions

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Write CLAUDE.md**

Create `CLAUDE.md` with all nine sections from the spec outline:

1. **Project Overview** — What this repo does (semi-automated social media posting for QuantApexAI), the trust-tiered architecture, pnpm as package manager
2. **Quick Commands** — Natural language commands:
   - "Draft today's posts" — full daily workflow (fetch data, capture charts, compose, send drafts to TG, await approval)
   - "What's moving today?" — data scan only, no drafts
   - "Capture {TICKER} {timeframe} chart" — single chart screenshot
   - "Publish draft {N}" or "Publish all" — publish approved drafts
   - "Post about {topic}" — single reactive post
3. **Workflow Steps** — The 8-step daily posting flow from the spec
4. **Brand Voice** — Link to `brand/voice-guide.md`, inline the key rules (do/don't table)
5. **File Structure** — Brief description of each top-level directory
6. **MCP Servers** — List the three new servers with what tools they provide
7. **Custom Libraries** — How to invoke: `pnpm exec tsx lib/{file}.ts`. List each library's exports.
8. **Credential Refresh** — How to update TV session cookies (open TV in browser, copy cookies from DevTools > Application > Cookies), what to do if X auth fails (regenerate tokens at developer.x.com)
9. **Content Rules** — Link to `config/posting-rules.json`, platform limits (X: 280 chars, TG: 4096), hashtag conventions from `brand/hashtags.md`

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "feat: add CLAUDE.md with project instructions and workflows"
```

---

## Task 11: Integration Smoke Test

**Files:**
- Create: `lib/smoke-test.ts`

This task verifies all libraries load correctly and the project is properly configured.

- [ ] **Step 1: Create lib/smoke-test.ts**

A script that:
1. Imports all four libraries
2. Verifies env vars are present (checks `.env` has all required vars, reports which are missing)
3. Tests post-manager by creating and reading a test draft (using a temp directory)
4. Reports status for each component:
   - Post Manager: OK/FAIL
   - Twitter Client: CONFIGURED/MISSING_CREDENTIALS (checks if env vars exist, does NOT make API calls)
   - Telegram Client: CONFIGURED/MISSING_CREDENTIALS
   - Chart Capture: CONFIGURED/MISSING_CREDENTIALS
   - MCP Servers: lists which are configured in .mcp.json

- [ ] **Step 2: Run smoke test**

Run: `pnpm exec tsx lib/smoke-test.ts`
Expected: Post Manager shows OK. Other components show MISSING_CREDENTIALS (since .env is not populated yet). No crashes.

- [ ] **Step 3: Commit**

```bash
git add lib/smoke-test.ts
git commit -m "feat: add integration smoke test for all components"
```

---

## Task 12: Final Cleanup and Documentation

- [ ] **Step 1: Remove x/ directory**

The spec removed the `x/` directory from the design. Delete it if empty.

Run: `rmdir x/` (only if empty)

- [ ] **Step 2: Run all tests**

Run: `pnpm exec tsx --test lib/*.test.ts`
Expected: All tests across all libraries PASS.

- [ ] **Step 3: Verify directory structure matches spec**

Run: `find . -not -path './node_modules/*' -not -path './.git/*' | sort`
Compare against the spec's directory structure. Verify all files exist.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup — remove x/ directory, verify structure"
```

---

## Execution Order Summary

| Task | Dependencies | Description |
|------|-------------|-------------|
| 1 | None | Project scaffolding (.gitignore, package.json, tsconfig, dirs) |
| 2 | 1 | Configuration files (watchlist, posting-rules) |
| 3 | 1 | Brand assets (voice guide, hashtags, templates) |
| 4 | 1 | Account setup guides (X Developer, Telegram) |
| 5 | 1 | Post Manager library + tests |
| 6 | 1 | Twitter Client library + tests |
| 7 | 1 | Telegram Client library + tests |
| 8 | 1 | Chart Capture library + tests |
| 9 | 1 | MCP server configuration |
| 10 | 2, 3, 5-9 | CLAUDE.md (references all other components) |
| 11 | 5-8 | Integration smoke test |
| 12 | All | Final cleanup and verification |

**Parallelizable groups:**
- Tasks 2, 3, 4 can run in parallel (no code dependencies)
- Tasks 5, 6, 7, 8 can run in parallel (independent libraries)
- Tasks 10, 11 depend on prior tasks
- Task 12 runs last
