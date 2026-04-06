# Captivation Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul QuantApexAI's social media posting system to increase engagement through voice strategy changes, a visual pipeline, Telegram enhancements, and template/config updates.

**Architecture:** The changes split into three layers: (1) brand/config files that guide Claude's post composition, (2) new `lib/data-card.ts` module + extensions to existing libs for visual generation, and (3) wiring `publish-draft.ts` to attach visuals. All HTML templates are rendered to PNG via Playwright (already a dependency). Chart post-processing uses `sharp` (new dependency).

**Tech Stack:** TypeScript, pnpm, Playwright, sharp, Node.js built-in test runner (`node:test`), Telegraf, twitter-api-v2

**Spec:** `docs/superpowers/specs/2026-04-06-captivation-overhaul-design.md`

---

## Task 1: Brand Assets & Color Palette

**Files:**
- Create: `brand/assets/colors.json`
- Create: `brand/assets/logo-light.png` (placeholder)
- Create: `brand/assets/logo-dark.png` (placeholder)

- [ ] **Step 1: Create the color palette JSON**

```json
{
  "primary": "#6366f1",
  "primaryLight": "#818cf8",
  "background": "#0f172a",
  "surface": "#1e293b",
  "surfaceLight": "#334155",
  "text": "#f8fafc",
  "textMuted": "#94a3b8",
  "up": "#22c55e",
  "down": "#ef4444",
  "neutral": "#64748b",
  "border": "#475569"
}
```

Write this to `brand/assets/colors.json`.

- [ ] **Step 2: Generate placeholder logo PNGs**

Create a simple text-based logo using a Node.js script. This uses `playwright` (already installed) to render a small HTML snippet to PNG:

```typescript
// Run: pnpm exec tsx scripts/generate-logo.ts
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(__dirname, '..', 'brand', 'assets');

async function generateLogo(variant: 'light' | 'dark') {
  const bg = variant === 'light' ? 'transparent' : 'transparent';
  const fg = variant === 'light' ? '#f8fafc' : '#0f172a';
  const html = `
    <html><body style="margin:0;background:${bg};display:inline-block;padding:8px 16px;">
      <span style="font-family:Inter,system-ui,sans-serif;font-weight:700;font-size:24px;color:${fg};letter-spacing:-0.5px;">
        QuantApex<span style="color:#6366f1">AI</span>
      </span>
    </body></html>`;

  const browser = await chromium.launch();
  const page = await (await browser.newContext()).newPage();
  await page.setContent(html);
  const el = page.locator('body > span');
  await el.screenshot({ path: path.join(assetsDir, `logo-${variant}.png`), omitBackground: true });
  await browser.close();
}

fs.mkdirSync(assetsDir, { recursive: true });
await generateLogo('light');
await generateLogo('dark');
console.log('Logos written to brand/assets/');
```

Write this to `scripts/generate-logo.ts` and run it: `pnpm exec tsx scripts/generate-logo.ts`

- [ ] **Step 3: Verify assets exist**

Run: `ls -la brand/assets/`

Expected: `colors.json`, `logo-light.png`, `logo-dark.png` all present.

- [ ] **Step 4: Commit**

```bash
git add brand/assets/ scripts/generate-logo.ts
git commit -m "feat: add brand color palette and placeholder logo assets"
```

---

## Task 2: Update Voice Guide

**Files:**
- Modify: `brand/voice-guide.md`

- [ ] **Step 1: Read the current voice guide**

Read `brand/voice-guide.md` to understand the current structure.

- [ ] **Step 2: Add Prioritization Take Principle section**

After the "Hook-First Narrative Structure" section, add:

```markdown
## Prioritization Take Principle

Every post contains at least one sentence of editorial prioritization — telling the reader what to pay attention to and what to ignore. This is the account's analytical voice. It is woven naturally into the narrative with varied phrasing — never a repeated label like "What matters:" or "Signal vs. Noise:".

**The principle:** Each post says "this matters more than that" in a way unique to the story.

**Examples of varied phrasing:**
- "Everyone's watching the fear index. The ETF flow reversal underneath is the real story."
- "Traders keep whiplashing on rhetoric. The physical world tells a clearer story — watch the ships, not the speeches."
- "You don't build the cheapest product in the market if you think demand is dying."
- "Seven stories this week. Six are noise. Oracle gutting 30K jobs while net income is up 95% — that's the one reshaping the industry."

**Compliance:** Prioritization takes are editorial judgment, not financial advice. They never include buy/sell directives, price predictions, certainty claims, or FOMO language. "This signal matters more than that headline" is journalism, not a trade recommendation.
```

- [ ] **Step 3: Add Engagement Close Principle section**

After the Prioritization Take section, add:

```markdown
## Engagement Close Principle

Every X thread ends with a debatable question that flows from the prioritization take. The question must be binary or pick-a-side — never vague ("thoughts?").

**Good closing questions:**
- "Institutions buying while retail capitulates — front-running the bottom or catching a knife?"
- "Is the oil supply shock transitory or structural? That answer decides Q2."
- "Four red weekly closes with expanding volume. Where does the burden of proof sit — bulls or bears?"

**Bad closing questions:**
- "What do you think?" (too vague, no position to react to)
- "Will BTC go up?" (too simplistic, invites one-word answers)
```

- [ ] **Step 4: Update the Thread Structure section in Platform-Specific Guidance > X (Twitter)**

Replace the current thread guidance with:

```markdown
- **Default thread: 5 tweets.** Structure: (1) narrative hook + visual, (2) BTC + headline data, (3) alts + macro, (4) prioritization take, (5) closing question + key levels.
- **Tweet 1 target: 80-140 chars.** Short, punchy, no data — just the story. Attach the visual (dashboard card, chart, or data card).
- **Tweet 5 must end with a debatable question** — not just key levels and hashtags.
- **Exceptions:** TA posts may use 3-4 tweets. AI roundups may extend to 6-7 tweets.
```

- [ ] **Step 5: Add Visual Asset section**

After the Platform-Specific Guidance section, add:

```markdown
## Visual Assets

Every post includes a visual attachment. The visual type is determined by post type:

| Post Type | Visual | How |
|---|---|---|
| Market Pulse | Branded dashboard card | Generated via `lib/data-card.ts` |
| Technical Analysis | Annotated + watermarked TradingView chart | Via `lib/chart-capture.ts` |
| Macro/News | Data card (comparison, key numbers, or signal dashboard) | Generated via `lib/data-card.ts` |
| AI/Tech Roundup | Key numbers card | Generated via `lib/data-card.ts` |

Visuals are saved to `content/charts/` and referenced in the draft's `chartPath` frontmatter.
```

- [ ] **Step 6: Commit**

```bash
git add brand/voice-guide.md
git commit -m "feat: add prioritization take, engagement close, visual asset guidance to voice guide"
```

---

## Task 3: Update Hashtag Guide

**Files:**
- Modify: `brand/hashtags.md`

- [ ] **Step 1: Read the current hashtag guide**

Read `brand/hashtags.md`.

- [ ] **Step 2: Rewrite the hashtag guide**

Replace the full contents of `brand/hashtags.md` with:

```markdown
# QuantApexAI Hashtag Strategy

## X (Twitter) — Max 2 Hashtags Per Tweet

### Rules
- **Maximum 2 hashtags per tweet** — research shows 3+ triggers ~40% reach penalty
- Inline ticker hashtags on **first mention only** (e.g. `₿ #BTC`, `#ETH`, `#SOL`)
- Subsequent mentions of the same ticker use plain text
- Footer gets **at most 1** category/topic hashtag — only if the tweet has fewer than 2 hashtags already
- No `#QuantApexAI` — zero search volume

### By Post Type

| Post Type | Inline | Footer | Example |
|---|---|---|---|
| Market Pulse | `₿ #BTC` (always) | `#Crypto` (only if under 2 total) | Tweet has `₿ #BTC` inline → footer adds `#Crypto` = 2 total |
| Technical Analysis | `₿ #BTC` or relevant ticker | `#Crypto` | 2 total |
| Macro/News | `₿ #BTC` if mentioned | **Topic-specific** tag | Iran → `#Iran`, Oil → `#Oil`, Fed → `#Fed`, ETF → `#ETF` |
| AI/Tech | `#AI` inline | `#Tech` | 2 total |

### Topic-Specific Tags for Macro/News
Choose the single most-searched tag for the story's primary subject:
- Geopolitical: `#Iran`, `#China`, `#Tariffs`, `#War`
- Commodity: `#Oil`, `#Gold`, `#CrudeOil`
- Central bank: `#Fed`, `#ECB`, `#RateDecision`
- Regulatory: `#ETF`, `#SEC`, `#Regulation`
- Economic data: `#CPI`, `#GDP`, `#Jobs`

---

## Telegram — Keep Category Tags

Telegram uses hashtags as in-channel search/filter tags, not algorithm signals. Keep the full category set for subscriber navigation:

- Market Recap: `#Crypto #MarketUpdate`
- Technical Analysis: `#TechnicalAnalysis #CryptoTrading`
- Macro/News: `#MacroAnalysis #Markets`
- AI/Tech: `#AI #ArtificialIntelligence #Tech`
```

- [ ] **Step 3: Commit**

```bash
git add brand/hashtags.md
git commit -m "feat: overhaul hashtag strategy — max 2 per tweet, topic-specific macro tags"
```

---

## Task 4: Update Post Templates

**Files:**
- Modify: `brand/templates/market-recap.md`
- Modify: `brand/templates/technical-analysis.md`
- Modify: `brand/templates/fundamental-analysis.md`

- [ ] **Step 1: Read all three current templates**

Read `brand/templates/market-recap.md`, `brand/templates/technical-analysis.md`, `brand/templates/fundamental-analysis.md`.

- [ ] **Step 2: Update market-recap.md X template to 5-tweet structure**

Replace the existing X thread template section with the new 5-tweet format. The template block should become:

````markdown
## Template — X Thread (5 tweets)

```
### Tweet 1 (Hook + Visual)
📊 Market Pulse | [DATE]

[NARRATIVE HOOK — 1-2 sentences framing why today matters. No data. This is what stops the scroll. Target: 80-140 chars.]

[ATTACH: Dashboard card image]

### Tweet 2 (BTC + Headlines)
₿ #BTC $[PRICE] ([+/-PCT]%) — [vivid commentary]
[COMMODITY if significant — e.g. Oil $102 (+3%)]
[MACRO — S&P 500, NASDAQ, DXY]

### Tweet 3 (Alts + Context)
[ALT SECTION — grouped if correlated, individual if diverging. Hashtag each ticker on first mention only.]
[Additional context — Fear & Greed, ETF flows, notable events]

### Tweet 4 (Prioritization Take)
[Editorial prioritization — what matters vs. what to ignore. Varied phrasing, never a fixed label. See voice guide.]

### Tweet 5 (Question Close + Key Levels)
Key levels:
₿ BTC: $[SUPPORT] / $[RESISTANCE]
ETH: $[SUPPORT] / $[RESISTANCE]

[DEBATABLE QUESTION flowing from the take — binary or pick-a-side, never vague.]

#Crypto
```
````

- [ ] **Step 3: Update market-recap.md Telegram template to use HTML formatting**

Update the Telegram section to include formatting markers and reaction prompt:

````markdown
## Template — Telegram

```
📊 <b>Market Pulse | [DATE]</b>

[NARRATIVE HOOK — 2-3 sentences, expanded from X version.]

₿ #BTC <b>$[PRICE]</b> (<b>[+/-PCT]%</b>) — [vivid commentary with additional context]
[ALT SECTION with 1-2 extra sentences each]

[COMMODITIES + MACRO data]

<b>Key levels:</b>
₿ BTC: $[SUPPORT] / $[RESISTANCE]
ETH: $[SUPPORT] / $[RESISTANCE]

<i>[Prioritization take — editorial insight in italic]</i>

#Crypto #MarketUpdate

Your outlook? React below.
```
````

- [ ] **Step 4: Update technical-analysis.md with chart attribution and question close**

Add the "The chart says:" attribution pattern to the TA template's opinion section. Update the final tweet to include a question close. Add visual guidance note at the top:

```markdown
**Visual:** Always generate an annotated + watermarked TradingView chart. The chart image is attached to Tweet 1.
```

Update the thesis section to use the attribution pattern:

```
[The chart says: — attribute the opinion to the chart data. Example: "The chart says: the burden of proof is on the bulls until $72,600 reclaims."]
Invalidation [condition] on [timeframe] close.

[DEBATABLE QUESTION — e.g. "Where does the burden of proof sit — bulls or bears?"]

#Crypto
```

- [ ] **Step 5: Update fundamental-analysis.md with topic-specific hashtags and prioritization take**

Update the macro/news template:
- Change footer hashtag guidance to: "Use a single topic-specific hashtag from `brand/hashtags.md` — e.g. `#Oil`, `#Iran`, `#Fed`"
- Add a prioritization take tweet (Tweet 4 in thread)
- Add a question close to the final tweet
- Add visual guidance: "Generate a data card using the most relevant template (comparison, key-numbers, or signal-dashboard)"

- [ ] **Step 6: Commit**

```bash
git add brand/templates/
git commit -m "feat: update post templates — 5-tweet threads, prioritization takes, question closes, visual guidance"
```

---

## Task 5: Update Posting Config

**Files:**
- Modify: `config/posting-rules.json`

- [ ] **Step 1: Read the current config**

Read `config/posting-rules.json`.

- [ ] **Step 2: Update the config**

Replace the contents of `config/posting-rules.json` with:

```json
{
  "platforms": {
    "x": {
      "maxLength": 280,
      "threadMaxTweets": 8,
      "maxHashtagsPerTweet": 2,
      "mediaTypes": ["png", "jpg"]
    },
    "telegram": {
      "maxLength": 4096,
      "parseMode": "HTML",
      "mediaTypes": ["png", "jpg", "gif"]
    }
  },
  "defaults": {
    "postToBoth": true,
    "includeHashtags": true,
    "includeVisual": true
  },
  "visualTypeMap": {
    "market-recap": "dashboard",
    "ta": "annotated-chart",
    "macro-news": "data-card",
    "ai-tech-news": "key-numbers"
  },
  "compliance": {
    "reportMode": "warnings-only",
    "blockOnFail": true
  },
  "postingCriteria": {
    "requireNewsworthyTrigger": true,
    "triggers": [
      "Price move > 3% in 24h",
      "Breaking news (regulatory, hack, partnership, upgrade)",
      "Earnings report or major macro data release (Fed, CPI, GDP, employment)",
      "Significant TA setup (breakout, breakdown, divergence)",
      "Major AI development"
    ],
    "skipIfQuiet": true
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add config/posting-rules.json
git commit -m "feat: update posting config — includeVisual, visualTypeMap, max 2 hashtags"
```

---

## Task 6: Add `sharp` Dependency

**Files:**
- Modify: `package.json` (via pnpm)

- [ ] **Step 1: Install sharp**

Run: `pnpm add sharp`

- [ ] **Step 2: Install sharp types**

Run: `pnpm add -D @types/sharp`

- [ ] **Step 3: Verify installation**

Run: `pnpm exec tsx -e "import sharp from 'sharp'; console.log('sharp version:', sharp.versions?.sharp ?? 'loaded')"`

Expected: prints "sharp version: ..." without error.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat: add sharp dependency for image processing"
```

---

## Task 7: Chart Annotation & Watermark — Tests

**Files:**
- Create: `lib/chart-annotate.test.ts`

This task writes the tests for the chart annotation module. The implementation follows in Task 8.

- [ ] **Step 1: Write test file**

```typescript
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { annotateChart, type AnnotationOptions } from './chart-annotate.ts';

const FIXTURES_DIR = path.resolve('test-fixtures');
const TEST_CHART = path.join(FIXTURES_DIR, 'test-chart.png');
const TEST_LOGO = path.join(FIXTURES_DIR, 'test-logo.png');
const OUTPUT_PATH = path.join(FIXTURES_DIR, 'output.png');

// Create minimal test images before tests
async function createTestImage(filepath: string, width: number, height: number, color: { r: number; g: number; b: number }) {
  const dir = path.dirname(filepath);
  fs.mkdirSync(dir, { recursive: true });
  await sharp({
    create: { width, height, channels: 3, background: color },
  }).png().toFile(filepath);
}

describe('annotateChart', () => {
  beforeEach(async () => {
    await createTestImage(TEST_CHART, 1600, 900, { r: 30, g: 30, b: 30 });
    await createTestImage(TEST_LOGO, 200, 40, { r: 99, g: 102, b: 241 });
  });

  afterEach(() => {
    for (const f of [TEST_CHART, TEST_LOGO, OUTPUT_PATH]) {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
    if (fs.existsSync(FIXTURES_DIR)) {
      const remaining = fs.readdirSync(FIXTURES_DIR);
      if (remaining.length === 0) fs.rmdirSync(FIXTURES_DIR);
    }
  });

  it('adds a watermark to the chart image', async () => {
    const options: AnnotationOptions = {
      watermarkPath: TEST_LOGO,
      levels: [],
    };

    const result = await annotateChart(TEST_CHART, OUTPUT_PATH, options);

    assert.equal(result, OUTPUT_PATH);
    assert.ok(fs.existsSync(OUTPUT_PATH), 'output file should exist');

    const meta = await sharp(OUTPUT_PATH).metadata();
    assert.equal(meta.width, 1600);
    assert.equal(meta.height, 900);
  });

  it('produces a valid PNG even with no levels and no watermark', async () => {
    const options: AnnotationOptions = {
      levels: [],
    };

    const result = await annotateChart(TEST_CHART, OUTPUT_PATH, options);

    assert.equal(result, OUTPUT_PATH);
    const meta = await sharp(OUTPUT_PATH).metadata();
    assert.equal(meta.format, 'png');
  });

  it('produces an image with levels drawn (size changes or pixel data differs)', async () => {
    const withoutLevels: AnnotationOptions = { levels: [] };
    const noLevelsOut = path.join(FIXTURES_DIR, 'no-levels.png');
    await annotateChart(TEST_CHART, noLevelsOut, withoutLevels);

    const withLevels: AnnotationOptions = {
      levels: [
        { price: 65000, label: '$65,000 Support', color: 'down' },
        { price: 69000, label: '$69,000 Resistance', color: 'up' },
      ],
    };
    await annotateChart(TEST_CHART, OUTPUT_PATH, withLevels);

    // Both should be valid PNGs
    const metaNo = await sharp(noLevelsOut).metadata();
    const metaWith = await sharp(OUTPUT_PATH).metadata();
    assert.equal(metaNo.format, 'png');
    assert.equal(metaWith.format, 'png');

    // The file with levels should differ in size (SVG overlay adds data)
    const sizeNo = fs.statSync(noLevelsOut).size;
    const sizeWith = fs.statSync(OUTPUT_PATH).size;
    assert.notEqual(sizeNo, sizeWith, 'annotated image should differ from plain');

    fs.unlinkSync(noLevelsOut);
  });

  it('throws if the input image does not exist', async () => {
    await assert.rejects(
      () => annotateChart('/nonexistent/path.png', OUTPUT_PATH, { levels: [] }),
      /ENOENT|no such file|input file/i,
    );
  });
});
```

Write this to `lib/chart-annotate.test.ts`.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --import tsx --test lib/chart-annotate.test.ts`

Expected: FAIL — `annotateChart` module does not exist yet.

- [ ] **Step 3: Commit**

```bash
git add lib/chart-annotate.test.ts
git commit -m "test: add chart annotation tests (red — implementation pending)"
```

---

## Task 8: Chart Annotation & Watermark — Implementation

**Files:**
- Create: `lib/chart-annotate.ts`

- [ ] **Step 1: Implement the chart annotation module**

```typescript
/**
 * chart-annotate.ts
 * Post-processes chart screenshots: adds watermark and key level annotations.
 * Uses sharp for image compositing.
 */
import sharp from 'sharp';
import fs from 'node:fs';

export interface LevelAnnotation {
  price: number;
  label: string;
  color: 'up' | 'down' | 'neutral';
}

export interface AnnotationOptions {
  watermarkPath?: string;
  levels: LevelAnnotation[];
}

const COLOR_MAP: Record<string, string> = {
  up: '#22c55e',
  down: '#ef4444',
  neutral: '#64748b',
};

/**
 * Annotate a chart image with a watermark and/or key level lines.
 *
 * @param inputPath  Absolute path to the source chart PNG
 * @param outputPath Absolute path for the annotated output PNG
 * @param options    Watermark path and level annotations
 * @returns          The outputPath on success
 */
export async function annotateChart(
  inputPath: string,
  outputPath: string,
  options: AnnotationOptions,
): Promise<string> {
  const { watermarkPath, levels } = options;

  // Read input image metadata
  const meta = await sharp(inputPath).metadata();
  const width = meta.width ?? 1600;
  const height = meta.height ?? 900;

  // Build compositing layers
  const composites: sharp.OverlayOptions[] = [];

  // 1. Key level annotations as SVG overlay
  if (levels.length > 0) {
    const lineSpacing = Math.floor(height / (levels.length + 1));
    const svgLines = levels.map((level, i) => {
      const y = lineSpacing * (i + 1);
      const color = COLOR_MAP[level.color] ?? COLOR_MAP.neutral;
      return `
        <line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${color}" stroke-width="2" stroke-dasharray="8,4" opacity="0.8"/>
        <rect x="${width - 220}" y="${y - 14}" width="210" height="22" rx="4" fill="${color}" opacity="0.85"/>
        <text x="${width - 215}" y="${y + 2}" font-family="Inter,system-ui,sans-serif" font-size="13" font-weight="600" fill="white">${level.label}</text>
      `;
    }).join('\n');

    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${svgLines}</svg>`;
    composites.push({ input: Buffer.from(svg), gravity: 'northwest' });
  }

  // 2. Watermark in bottom-right corner
  if (watermarkPath && fs.existsSync(watermarkPath)) {
    const watermark = await sharp(watermarkPath)
      .resize({ width: Math.floor(width * 0.12), withoutEnlargement: true })
      .ensureAlpha()
      .composite([{
        input: Buffer.from([255, 255, 255, Math.floor(255 * 0.6)]),
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: 'dest-in',
      }])
      .toBuffer();

    composites.push({
      input: watermark,
      gravity: 'southeast',
    });
  }

  // 3. Compose all layers onto the chart
  if (composites.length > 0) {
    await sharp(inputPath).composite(composites).png().toFile(outputPath);
  } else {
    // No annotations — just copy
    fs.copyFileSync(inputPath, outputPath);
  }

  return outputPath;
}
```

Write this to `lib/chart-annotate.ts`.

- [ ] **Step 2: Run the tests**

Run: `node --import tsx --test lib/chart-annotate.test.ts`

Expected: All 4 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/chart-annotate.ts
git commit -m "feat: implement chart annotation with watermark and key level overlays"
```

---

## Task 9: Data Card Renderer — Tests

**Files:**
- Create: `lib/data-card.test.ts`

- [ ] **Step 1: Write test file**

```typescript
import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { renderDashboardCard, renderDataCard, type DashboardData, type CardData } from './data-card.ts';

const OUTPUT_DIR = path.resolve('test-fixtures');

afterEach(() => {
  if (fs.existsSync(OUTPUT_DIR)) {
    for (const f of fs.readdirSync(OUTPUT_DIR)) {
      fs.unlinkSync(path.join(OUTPUT_DIR, f));
    }
    fs.rmdirSync(OUTPUT_DIR);
  }
});

describe('renderDashboardCard', () => {
  it('generates a 1600x900 PNG from dashboard data', async () => {
    const data: DashboardData = {
      date: 'Apr 6',
      btc: { price: '$67,100', change: '+1.2%', direction: 'up' },
      alts: [
        { ticker: 'ETH', price: '$2,038', change: '-0.5%', direction: 'down' },
        { ticker: 'SOL', price: '$80.65', change: '+0.8%', direction: 'up' },
      ],
      fearGreed: { value: 9, label: 'Extreme Fear' },
      macro: [
        { label: 'Oil (Brent)', value: '$106', direction: 'up' },
        { label: 'Gold', value: '$4,590', direction: 'up' },
        { label: 'S&P 500', value: '6,500', direction: 'down' },
        { label: 'DXY', value: '100.08', direction: 'up' },
      ],
      keyLevels: [
        { ticker: 'BTC', support: '$65,000', resistance: '$69,000' },
        { ticker: 'ETH', support: '$1,950', resistance: '$2,200' },
      ],
    };

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    const outPath = path.join(OUTPUT_DIR, 'dashboard-test.png');
    const result = await renderDashboardCard(data, outPath);

    assert.equal(result, outPath);
    assert.ok(fs.existsSync(outPath), 'output PNG should exist');

    const meta = await sharp(outPath).metadata();
    assert.equal(meta.width, 1600);
    assert.equal(meta.height, 900);
    assert.equal(meta.format, 'png');
  });
});

describe('renderDataCard', () => {
  it('generates a valid PNG from key-numbers template', async () => {
    const data: CardData = {
      title: 'Consumer Confidence',
      items: [
        { label: 'CCI', value: '91.8', note: 'Inched up from 91' },
        { label: 'Gas', value: '$4.02/gal', note: 'First time since 2022' },
        { label: 'Inflation Exp.', value: 'Highest since Aug 2025', note: '' },
      ],
    };

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    const outPath = path.join(OUTPUT_DIR, 'keynumbers-test.png');
    const result = await renderDataCard('key-numbers', data, outPath);

    assert.equal(result, outPath);
    assert.ok(fs.existsSync(outPath));

    const meta = await sharp(outPath).metadata();
    assert.equal(meta.format, 'png');
    assert.equal(meta.width, 1600);
    assert.equal(meta.height, 900);
  });

  it('generates a valid PNG from comparison template', async () => {
    const data: CardData = {
      title: 'BTC ETF Fee Comparison',
      items: [
        { label: 'MSBT (Morgan Stanley)', value: '0.14%', note: 'Lowest' },
        { label: 'IBIT (BlackRock)', value: '0.25%', note: '' },
        { label: 'FBTC (Fidelity)', value: '0.25%', note: '' },
      ],
    };

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    const outPath = path.join(OUTPUT_DIR, 'comparison-test.png');
    const result = await renderDataCard('comparison', data, outPath);

    assert.equal(result, outPath);
    const meta = await sharp(outPath).metadata();
    assert.equal(meta.format, 'png');
  });

  it('generates a valid PNG from signal-dashboard template', async () => {
    const data: CardData = {
      title: 'Three Signals That Matter',
      items: [
        { label: 'Tanker Traffic', value: '21/day', note: 'Pre-war: 100+' },
        { label: 'Ship Insurance', value: '7.5%', note: 'Safe: <2%' },
        { label: 'SPR Buffer', value: '~2 weeks', note: 'Threshold: 8+ weeks' },
      ],
    };

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    const outPath = path.join(OUTPUT_DIR, 'signal-test.png');
    const result = await renderDataCard('signal-dashboard', data, outPath);

    assert.equal(result, outPath);
    const meta = await sharp(outPath).metadata();
    assert.equal(meta.format, 'png');
  });
});
```

Write this to `lib/data-card.test.ts`.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --import tsx --test lib/data-card.test.ts`

Expected: FAIL — `data-card.ts` module does not exist yet.

- [ ] **Step 3: Commit**

```bash
git add lib/data-card.test.ts
git commit -m "test: add data card renderer tests (red — implementation pending)"
```

---

## Task 10: Dashboard HTML Template

**Files:**
- Create: `brand/templates/visuals/dashboard.html`

- [ ] **Step 1: Create the dashboard HTML template**

This template uses CSS Grid for layout. Data placeholders use `{{variable}}` syntax that will be string-replaced before rendering.

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1600px; height: 900px;
    font-family: 'Inter', system-ui, sans-serif;
    background: #0f172a; color: #f8fafc;
    display: flex; flex-direction: column;
    padding: 40px 48px;
  }
  .header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 32px;
  }
  .brand { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
  .brand .accent { color: #6366f1; }
  .date { font-size: 20px; color: #94a3b8; font-weight: 600; }
  .btc-row {
    background: #1e293b; border-radius: 16px; padding: 28px 36px;
    margin-bottom: 24px; display: flex; align-items: baseline; gap: 20px;
  }
  .btc-symbol { font-size: 18px; color: #94a3b8; font-weight: 600; }
  .btc-price { font-size: 52px; font-weight: 700; letter-spacing: -1px; }
  .btc-change { font-size: 28px; font-weight: 600; }
  .up { color: #22c55e; }
  .down { color: #ef4444; }
  .neutral { color: #64748b; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; flex: 1; }
  .card {
    background: #1e293b; border-radius: 12px; padding: 20px 28px;
  }
  .card-label { font-size: 14px; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
  .card-value { font-size: 28px; font-weight: 700; }
  .card-sub { font-size: 15px; color: #94a3b8; margin-top: 4px; }
  .alts-row { display: flex; gap: 20px; }
  .alt-card { flex: 1; }
  .alt-ticker { font-size: 16px; font-weight: 600; color: #94a3b8; }
  .alt-price { font-size: 24px; font-weight: 700; }
  .alt-change { font-size: 16px; font-weight: 600; }
  .macro-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .macro-item { text-align: center; }
  .macro-label { font-size: 13px; color: #94a3b8; margin-bottom: 4px; }
  .macro-value { font-size: 22px; font-weight: 700; }
  .fear-greed {
    display: flex; align-items: center; gap: 16px;
  }
  .fg-value { font-size: 48px; font-weight: 700; color: #ef4444; }
  .fg-label { font-size: 16px; color: #94a3b8; }
  .levels-row {
    margin-top: 20px; display: flex; gap: 32px;
    padding: 16px 28px; background: #1e293b; border-radius: 12px;
  }
  .level-item { }
  .level-ticker { font-size: 14px; color: #94a3b8; font-weight: 600; }
  .level-range { font-size: 18px; font-weight: 600; }
  .level-support { color: #ef4444; }
  .level-resistance { color: #22c55e; }
</style>
</head>
<body>
  <div class="header">
    <div class="brand">QuantApex<span class="accent">AI</span></div>
    <div class="date">📊 Market Pulse | {{date}}</div>
  </div>

  <div class="btc-row">
    <span class="btc-symbol">₿ BTC</span>
    <span class="btc-price">{{btc_price}}</span>
    <span class="btc-change {{btc_direction}}">{{btc_change}}</span>
  </div>

  <div class="grid">
    <div class="card">
      <div class="alts-row">{{alts_html}}</div>
    </div>
    <div class="card">
      <div class="fear-greed">
        <div class="fg-value">{{fg_value}}</div>
        <div><div class="fg-label">Fear & Greed</div><div style="font-size:14px;color:#94a3b8;">{{fg_label}}</div></div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:20px;">
    <div class="macro-grid">{{macro_html}}</div>
  </div>

  <div class="levels-row">{{levels_html}}</div>
</body>
</html>
```

Write this to `brand/templates/visuals/dashboard.html`.

- [ ] **Step 2: Commit**

```bash
git add brand/templates/visuals/dashboard.html
git commit -m "feat: add dashboard card HTML template"
```

---

## Task 11: Data Card HTML Templates (Comparison, Key Numbers, Signal Dashboard)

**Files:**
- Create: `brand/templates/visuals/comparison.html`
- Create: `brand/templates/visuals/key-numbers.html`
- Create: `brand/templates/visuals/signal-dashboard.html`

- [ ] **Step 1: Create comparison.html**

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1600px; height: 900px;
    font-family: 'Inter', system-ui, sans-serif;
    background: #0f172a; color: #f8fafc;
    display: flex; flex-direction: column;
    padding: 48px 64px;
  }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 48px; }
  .brand { font-size: 20px; font-weight: 700; }
  .brand .accent { color: #6366f1; }
  .title { font-size: 36px; font-weight: 700; letter-spacing: -0.5px; }
  .items { display: flex; flex-direction: column; gap: 24px; flex: 1; justify-content: center; }
  .item {
    display: flex; align-items: center; gap: 24px;
    background: #1e293b; border-radius: 16px; padding: 28px 36px;
  }
  .item-label { font-size: 22px; font-weight: 600; flex: 1; }
  .item-value { font-size: 40px; font-weight: 700; color: #6366f1; }
  .item-note { font-size: 16px; color: #22c55e; font-weight: 600; margin-left: 12px; }
</style>
</head>
<body>
  <div class="header">
    <div class="title">{{title}}</div>
    <div class="brand">QuantApex<span class="accent">AI</span></div>
  </div>
  <div class="items">{{items_html}}</div>
</body>
</html>
```

Write to `brand/templates/visuals/comparison.html`.

- [ ] **Step 2: Create key-numbers.html**

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1600px; height: 900px;
    font-family: 'Inter', system-ui, sans-serif;
    background: #0f172a; color: #f8fafc;
    display: flex; flex-direction: column;
    padding: 48px 64px;
  }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 48px; }
  .brand { font-size: 20px; font-weight: 700; }
  .brand .accent { color: #6366f1; }
  .title { font-size: 36px; font-weight: 700; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 28px; flex: 1; align-content: center; }
  .number-card {
    background: #1e293b; border-radius: 16px; padding: 32px;
    border-left: 4px solid #6366f1;
  }
  .num-label { font-size: 16px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
  .num-value { font-size: 36px; font-weight: 700; margin-bottom: 6px; }
  .num-note { font-size: 16px; color: #94a3b8; }
</style>
</head>
<body>
  <div class="header">
    <div class="title">{{title}}</div>
    <div class="brand">QuantApex<span class="accent">AI</span></div>
  </div>
  <div class="grid">{{items_html}}</div>
</body>
</html>
```

Write to `brand/templates/visuals/key-numbers.html`.

- [ ] **Step 3: Create signal-dashboard.html**

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1600px; height: 900px;
    font-family: 'Inter', system-ui, sans-serif;
    background: #0f172a; color: #f8fafc;
    display: flex; flex-direction: column;
    padding: 48px 64px;
  }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 48px; }
  .brand { font-size: 20px; font-weight: 700; }
  .brand .accent { color: #6366f1; }
  .title { font-size: 36px; font-weight: 700; }
  .signals { display: flex; flex-direction: column; gap: 28px; flex: 1; justify-content: center; }
  .signal {
    display: flex; align-items: center;
    background: #1e293b; border-radius: 16px; padding: 28px 36px;
    gap: 24px;
  }
  .signal-dot {
    width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
  }
  .signal-dot.red { background: #ef4444; box-shadow: 0 0 12px rgba(239,68,68,0.4); }
  .signal-dot.green { background: #22c55e; box-shadow: 0 0 12px rgba(34,197,94,0.4); }
  .signal-dot.amber { background: #f59e0b; box-shadow: 0 0 12px rgba(245,158,11,0.4); }
  .signal-info { flex: 1; }
  .signal-label { font-size: 20px; font-weight: 600; margin-bottom: 4px; }
  .signal-note { font-size: 15px; color: #94a3b8; }
  .signal-value { font-size: 36px; font-weight: 700; text-align: right; }
</style>
</head>
<body>
  <div class="header">
    <div class="title">{{title}}</div>
    <div class="brand">QuantApex<span class="accent">AI</span></div>
  </div>
  <div class="signals">{{items_html}}</div>
</body>
</html>
```

Write to `brand/templates/visuals/signal-dashboard.html`.

- [ ] **Step 4: Commit**

```bash
git add brand/templates/visuals/
git commit -m "feat: add comparison, key-numbers, and signal-dashboard HTML templates"
```

---

## Task 12: Data Card Renderer — Implementation

**Files:**
- Create: `lib/data-card.ts`

- [ ] **Step 1: Implement the data card module**

```typescript
/**
 * data-card.ts
 * Renders branded data cards (dashboard, comparison, key-numbers, signal-dashboard)
 * from HTML templates to PNG via Playwright.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, '..', 'brand', 'templates', 'visuals');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DashboardData {
  date: string;
  btc: { price: string; change: string; direction: 'up' | 'down' | 'neutral' };
  alts: Array<{ ticker: string; price: string; change: string; direction: 'up' | 'down' | 'neutral' }>;
  fearGreed: { value: number; label: string };
  macro: Array<{ label: string; value: string; direction: 'up' | 'down' | 'neutral' }>;
  keyLevels: Array<{ ticker: string; support: string; resistance: string }>;
}

export interface CardData {
  title: string;
  items: Array<{ label: string; value: string; note: string }>;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildAltsHtml(alts: DashboardData['alts']): string {
  return alts.map((a) => `
    <div class="alt-card">
      <div class="alt-ticker">${a.ticker}</div>
      <div class="alt-price">${a.price}</div>
      <div class="alt-change ${a.direction}">${a.change}</div>
    </div>
  `).join('');
}

function buildMacroHtml(macro: DashboardData['macro']): string {
  return macro.map((m) => `
    <div class="macro-item">
      <div class="macro-label">${m.label}</div>
      <div class="macro-value ${m.direction}">${m.value}</div>
    </div>
  `).join('');
}

function buildLevelsHtml(levels: DashboardData['keyLevels']): string {
  return levels.map((l) => `
    <div class="level-item">
      <div class="level-ticker">${l.ticker}</div>
      <div class="level-range"><span class="level-support">${l.support}</span> / <span class="level-resistance">${l.resistance}</span></div>
    </div>
  `).join('');
}

function buildComparisonItemsHtml(items: CardData['items']): string {
  return items.map((item) => `
    <div class="item">
      <div class="item-label">${item.label}</div>
      <div class="item-value">${item.value}</div>
      ${item.note ? `<div class="item-note">${item.note}</div>` : ''}
    </div>
  `).join('');
}

function buildKeyNumbersHtml(items: CardData['items']): string {
  return items.map((item) => `
    <div class="number-card">
      <div class="num-label">${item.label}</div>
      <div class="num-value">${item.value}</div>
      ${item.note ? `<div class="num-note">${item.note}</div>` : ''}
    </div>
  `).join('');
}

function buildSignalItemsHtml(items: CardData['items']): string {
  return items.map((item) => {
    // Determine dot color heuristic: if note mentions "Pre-war", "Threshold", or "Safe" → red signal
    const dotColor = item.note ? 'red' : 'green';
    return `
      <div class="signal">
        <div class="signal-dot ${dotColor}"></div>
        <div class="signal-info">
          <div class="signal-label">${item.label}</div>
          <div class="signal-note">${item.note}</div>
        </div>
        <div class="signal-value">${item.value}</div>
      </div>
    `;
  }).join('');
}

async function renderHtmlToPng(html: string, outputPath: string): Promise<string> {
  const browser = await chromium.launch();
  try {
    const page = await (await browser.newContext()).newPage();
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.screenshot({ path: outputPath, type: 'png' });
    return outputPath;
  } finally {
    await browser.close();
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Render a branded Market Dashboard Card to PNG.
 */
export async function renderDashboardCard(data: DashboardData, outputPath: string): Promise<string> {
  const templatePath = path.join(TEMPLATES_DIR, 'dashboard.html');
  let html = fs.readFileSync(templatePath, 'utf8');

  html = html
    .replace('{{date}}', data.date)
    .replace('{{btc_price}}', data.btc.price)
    .replace('{{btc_change}}', data.btc.change)
    .replace('{{btc_direction}}', data.btc.direction)
    .replace('{{alts_html}}', buildAltsHtml(data.alts))
    .replace('{{fg_value}}', String(data.fearGreed.value))
    .replace('{{fg_label}}', data.fearGreed.label)
    .replace('{{macro_html}}', buildMacroHtml(data.macro))
    .replace('{{levels_html}}', buildLevelsHtml(data.keyLevels));

  const dir = path.dirname(outputPath);
  fs.mkdirSync(dir, { recursive: true });
  return renderHtmlToPng(html, outputPath);
}

/**
 * Render a data card (comparison, key-numbers, or signal-dashboard) to PNG.
 */
export async function renderDataCard(
  template: 'comparison' | 'key-numbers' | 'signal-dashboard',
  data: CardData,
  outputPath: string,
): Promise<string> {
  const templatePath = path.join(TEMPLATES_DIR, `${template}.html`);
  let html = fs.readFileSync(templatePath, 'utf8');

  let itemsHtml: string;
  switch (template) {
    case 'comparison':
      itemsHtml = buildComparisonItemsHtml(data.items);
      break;
    case 'key-numbers':
      itemsHtml = buildKeyNumbersHtml(data.items);
      break;
    case 'signal-dashboard':
      itemsHtml = buildSignalItemsHtml(data.items);
      break;
  }

  html = html
    .replace('{{title}}', data.title)
    .replace('{{items_html}}', itemsHtml);

  const dir = path.dirname(outputPath);
  fs.mkdirSync(dir, { recursive: true });
  return renderHtmlToPng(html, outputPath);
}
```

Write this to `lib/data-card.ts`.

- [ ] **Step 2: Run the tests**

Run: `node --import tsx --test lib/data-card.test.ts`

Expected: All 4 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/data-card.ts
git commit -m "feat: implement data card renderer — dashboard, comparison, key-numbers, signal-dashboard"
```

---

## Task 13: Telegram Poll Function — Test

**Files:**
- Modify: `lib/telegram-client.test.ts`

- [ ] **Step 1: Add sendPoll tests to the existing test file**

Append the following test block to the end of `lib/telegram-client.test.ts`:

```typescript
// ---------------------------------------------------------------------------
// sendPoll
// ---------------------------------------------------------------------------

describe('sendPoll', () => {
  it('calls bot.telegram.sendPoll with channelId, question, and options', async () => {
    const sendPoll = mock.fn(async () => ({}));
    const bot = { telegram: { sendMessage: mock.fn(), sendPhoto: mock.fn(), sendPoll } } as any;

    const { sendPoll: sendPollFn } = await import('./telegram-client.ts');
    await sendPollFn(bot, '@quantapexai', 'BTC by Friday?', ['Above $69K', '$65K-$69K', 'Below $65K']);

    assert.equal(sendPoll.mock.calls.length, 1);
    const [chatId, question, options, extra] = sendPoll.mock.calls[0].arguments;
    assert.equal(chatId, '@quantapexai');
    assert.equal(question, 'BTC by Friday?');
    assert.deepEqual(options, ['Above $69K', '$65K-$69K', 'Below $65K']);
    assert.equal(extra?.is_anonymous, true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --import tsx --test lib/telegram-client.test.ts`

Expected: FAIL — `sendPoll` is not exported from `telegram-client.ts` yet.

- [ ] **Step 3: Commit**

```bash
git add lib/telegram-client.test.ts
git commit -m "test: add sendPoll test (red — implementation pending)"
```

---

## Task 14: Telegram Poll Function — Implementation

**Files:**
- Modify: `lib/telegram-client.ts`

- [ ] **Step 1: Add sendPoll function to telegram-client.ts**

Append the following function to the end of `lib/telegram-client.ts` (before the closing of the file):

```typescript
/**
 * Sends a poll to a Telegram channel.
 * Used for weekly engagement polls (e.g., "BTC by Friday?").
 */
export async function sendPoll(
  bot: Telegraf,
  channelId: string,
  question: string,
  options: string[],
): Promise<void> {
  await bot.telegram.sendPoll(channelId, question, options, {
    is_anonymous: true,
  });
}
```

- [ ] **Step 2: Run the tests**

Run: `node --import tsx --test lib/telegram-client.test.ts`

Expected: All tests PASS (existing + new sendPoll test).

- [ ] **Step 3: Commit**

```bash
git add lib/telegram-client.ts
git commit -m "feat: add sendPoll function for weekly Telegram engagement polls"
```

---

## Task 15: Wire Media Through publish-draft.ts — Test

**Files:**
- Modify: `lib/publish-draft.ts` (test is manual — this module is a CLI script)

The publish-draft.ts script currently calls `postThread(twitter, tweets)` without media and `postToChannel(bot, channelId, telegramText)` without `imagePath`. We need to extract `chartPath` from the frontmatter and pass it to both.

- [ ] **Step 1: Read publish-draft.ts to confirm current state**

Read `lib/publish-draft.ts` and verify:
- Line 78: `const tweetIds = await postThread(twitter, tweets);` — no media
- Line 89: `await postToChannel(bot, channelId, telegramText);` — no imagePath

- [ ] **Step 2: Add frontmatter chartPath extraction**

After line 56 (`const telegramText = extractTelegram(content);`), add a new function and call:

```typescript
function extractChartPath(content: string): string | null {
  const match = content.match(/^chartPath:\s*(.+)$/m);
  if (!match) return null;
  const val = match[1].trim();
  return val === 'null' ? null : val;
}
```

And after the existing `extractTelegram` call:

```typescript
const chartPath = extractChartPath(content);
const resolvedChartPath = chartPath
  ? (path.isAbsolute(chartPath) ? chartPath : path.resolve(PROJECT_ROOT, chartPath))
  : null;
const hasChart = resolvedChartPath && fs.existsSync(resolvedChartPath);

if (chartPath && !hasChart) {
  console.log(`WARNING: chartPath "${chartPath}" not found — posting without media`);
}
```

- [ ] **Step 3: Wire media to Twitter posting**

Replace the X posting section (starting from `console.log(\`\nPosting thread...\`)`) with:

```typescript
console.log(`\nPosting thread (${tweets.length} tweets) to X...`);
const twitter = createTwitterClient();

// Upload media for Tweet 1 if chart exists
let mediaId: string | undefined;
if (hasChart) {
  console.log(`  Uploading media: ${resolvedChartPath}`);
  const { uploadMedia } = await import('./twitter-client.js');
  mediaId = await uploadMedia(twitter, resolvedChartPath!);
  console.log(`  Media uploaded: ${mediaId}`);
}

// Post thread — first tweet gets the media
const tweetIds = await postThread(twitter, tweets, mediaId);
console.log(`X: OK — ${tweetIds.length} tweets posted (first ID: ${tweetIds[0]})`);
```

- [ ] **Step 4: Update postThread to accept optional mediaId for first tweet**

In `lib/twitter-client.ts`, update the `postThread` function signature and first-tweet logic:

```typescript
export async function postThread(
  client: TwitterApi,
  tweets: string[],
  firstTweetMediaId?: string,
): Promise<string[]> {
```

And in the loop, update the payload construction for `i === 0`:

```typescript
const payload: Record<string, unknown> = { text: tweets[i] };

if (i === 0 && firstTweetMediaId) {
  payload['media'] = { media_ids: [firstTweetMediaId] };
}

if (i > 0) {
  payload['reply'] = { in_reply_to_tweet_id: ids[i - 1] };
}
```

- [ ] **Step 5: Wire imagePath to Telegram posting**

Replace the Telegram posting call in publish-draft.ts:

```typescript
await postToChannel(bot, channelId, telegramText, hasChart ? resolvedChartPath! : undefined);
```

- [ ] **Step 6: Update the import in publish-draft.ts**

Add `uploadMedia` to the twitter-client import:

```typescript
import { createTwitterClient, postThread, uploadMedia } from './twitter-client.js';
```

Then remove the dynamic `await import('./twitter-client.js')` added in Step 3 and use the static import directly.

- [ ] **Step 7: Run existing tests to verify nothing breaks**

Run: `node --import tsx --test lib/twitter-client.test.ts lib/telegram-client.test.ts`

Expected: All existing tests PASS. The `postThread` signature change is backward-compatible (new param is optional).

- [ ] **Step 8: Commit**

```bash
git add lib/publish-draft.ts lib/twitter-client.ts
git commit -m "feat: wire chartPath media through publish pipeline to X and Telegram"
```

---

## Task 16: Run Full Test Suite

**Files:** None (verification only)

- [ ] **Step 1: Run all tests**

Run: `node --import tsx --test lib/*.test.ts`

Expected: All tests PASS across all test files:
- `lib/post-manager.test.ts`
- `lib/twitter-client.test.ts`
- `lib/telegram-client.test.ts`
- `lib/chart-capture.test.ts`
- `lib/chart-annotate.test.ts`
- `lib/data-card.test.ts`

- [ ] **Step 2: Fix any failures**

If any tests fail, investigate and fix. Common issues:
- Import path issues (ensure `.ts` extension used in test imports)
- Missing `sharp` dependency (ensure Task 6 completed)
- Template file paths (ensure Tasks 10-11 completed)

- [ ] **Step 3: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: resolve test failures from integration"
```

---

## Task 17: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md` (project root)

- [ ] **Step 1: Read the current CLAUDE.md**

Read `/Users/plamensavchev/Development/QuantApex/social_media/CLAUDE.md`.

- [ ] **Step 2: Update the Custom Libraries table**

Add the new modules to the table in Section 7:

```markdown
| `lib/data-card.ts` | `renderDashboardCard`, `renderDataCard` |
| `lib/chart-annotate.ts` | `annotateChart` |
```

- [ ] **Step 3: Update the Workflow Steps section**

Update step 3 (Compose posts) to mention:
- The new 5-tweet thread structure
- Prioritization take principle
- Engagement close (debatable question)
- Max 2 hashtags per tweet on X

Update step 2 (Capture charts) to mention:
- Dashboard card generation for Market Pulse
- Data card generation for Macro/News
- Chart annotation and watermarking for TA

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with new modules and workflow changes"
```
