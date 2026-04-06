# QuantApexAI Social Media Captivation Overhaul — Design Spec

**Date:** 2026-04-06
**Status:** Draft
**Scope:** Voice strategy, visual pipeline, Telegram enhancements, template & config updates

---

## 1. Problem Statement

QuantApexAI's published posts (10 posts across 4 dates, Mar 31 — Apr 5 2026) are analytically excellent but underperforming on engagement. A 4-agent independent evaluation found:

- **Content Strategy score:** 7.0/10 average — strong hooks on macro posts, weak on Market Pulse and TA
- **Visual coverage:** 1 out of 10 posts includes a visual (10%) despite infrastructure existing
- **Platform optimization:** 5.7/10 — hashtags penalizing reach, zero reply-generation mechanics
- **Audience engagement:** 5.8/10 — informative but lacking opinion, personality, and shareability

**Best post (unanimous):** Post 7 "Three Signals That Matter More Than Any Iran Speech" — scored 8.5-8.8 across all agents. Succeeds because it provides a framework for thinking (prioritization) rather than just reporting data.

**Worst post (consensus):** Post 1 "Market Pulse Mar 31" — scored 3.7-5.0. Generic data recap indistinguishable from hundreds of other crypto accounts.

**Root cause:** Content is built to inform, not to engage. The compliance framework is robust but has created a culture of caution that avoids even compliant forms of opinion and editorial judgment.

---

## 2. Design Decisions

### 2.1 Opinion Framing: Prioritization Takes (Not Directional Calls)

Every post includes at least one sentence that tells the reader what to pay attention to and what to ignore. This is expressed through natural, varied language — never a repeated label like "What matters:" or "Signal vs. Noise:".

**The principle:** Each post contains editorial prioritization woven into the narrative. No two posts phrase it the same way.

**Examples of varied phrasing:**

| Post Context | Prioritization Take |
|---|---|
| Fear & Greed divergence | "Fear & Greed at 9 — yet crypto bounces. Everyone's watching the fear index. The ETF flow reversal underneath is the real story." |
| Iran rhetoric whiplash | "Traders keep whiplashing on rhetoric. But the physical world tells a clearer story — watch the ships, not the speeches." |
| Ultimatum weekend | "The headline is the 48-hour ultimatum. The signal underneath: institutions quietly flipped to net buyers for the first time since February." |
| ETF fee war | "You don't build the cheapest product in the market if you think demand is dying. The fee war tells you more than the Fear & Greed index." |
| AI weekly roundup | "Seven stories this week. Six are noise. Oracle gutting 30K jobs while net income is up 95% — that's the one reshaping the industry." |
| TA monthly chart | "The chart says: four consecutive red weekly closes with expanding volume. The burden of proof is on the bulls until $72,600 reclaims with conviction." |

**Compliance guardrail:** All opinions are observational prioritization ("this matters more than that"). Never directive ("buy/sell"), never certainty claims ("price will go to $X"), never FOMO ("don't miss this"). The existing compliance checklist continues to gate every post before publishing. This framing is editorial judgment — the same as any financial journalist choosing which story leads the broadcast — not financial advice.

### 2.2 Hashtag Strategy: Max 2 Per Tweet, Topic-Specific

**X (Twitter):**
- Maximum 2 hashtags per tweet
- Drop `#QuantApexAI` — zero search volume
- Inline ticker hashtags on first mention remain (`₿ #BTC`, `#ETH`, `#SOL`)
- Footer gets 1 category/topic hashtag — the highest-search-volume tag for that content

| Post Type | Inline (first mention) | Footer | Total |
|---|---|---|---|
| Market Pulse | `₿ #BTC` (always) + `#ETH` or `#SOL` if they have a unique story | `#Crypto` (only if total hashtags in tweet is under 2) | 2 max per tweet |
| Technical Analysis | `₿ #BTC` (or relevant ticker) | `#Crypto` | 2 |
| Macro/News | `₿ #BTC` if mentioned | Topic-specific: `#Oil`, `#Iran`, `#Fed`, `#ETF`, `#Tariffs`, etc. | 1-2 |
| AI/Tech | `#AI` inline | `#Tech` | 2 |

**Rationale:** Research shows 3+ hashtags trigger a ~40% reach penalty on X. The algorithm uses NLP to categorize content — it knows the topic from the text. Niche category tags (`#TechnicalAnalysis`, `#MacroAnalysis`, `#MarketUpdate`) have low search volume and contribute to the penalty without meaningful discovery. Topic-specific tags for macro/news (`#Iran`, `#Oil`, `#Fed`) align with what traders actually search during breaking events.

**Telegram:** Keep current 3-4 tag approach. Telegram uses hashtags as in-channel search/filter tags, not algorithm signals. Category tags are useful for subscriber navigation.

### 2.3 Posting Cadence: 15-Minute Window Retained

The current posting pattern (2-3 posts within a 15-minute window) is retained. This is a practical constraint — the user has limited morning time to review and approve posts. No changes to timing or cadence.

---

## 3. Thread Restructure: 3 Tweets to 5 Tweets

### New Thread Architecture

| Tweet | Purpose | Character Target | Visual |
|---|---|---|---|
| **1** | Pure narrative hook — no data, just the story/tension | 80-140 chars | Attach primary visual (dashboard card, chart, or data card) |
| **2** | BTC + headline data payload | 200-260 chars | None |
| **3** | Alts + macro + supporting data | 200-260 chars | None |
| **4** | Prioritization take — the editorial opinion | 180-250 chars | None |
| **5** | Closing question (debatable, flows from the take) + key levels | 180-250 chars | None |

### Key Changes from Current

- **Tweet 1** is shorter and punchier. Currently 220-250 chars with data embedded. New target: 80-140 chars, narrative only, visual attached.
- **Tweet 4** is new — a dedicated space for the prioritization take that does not exist today.
- **Tweet 5** ends with a debatable question, not just key levels. Questions must be binary or pick-a-side, not vague. Examples:
  - "Institutions buying while retail capitulates — front-running the bottom or catching a knife?"
  - "Is the oil supply shock transitory or structural? That answer decides Q2."
  - "Four red weekly closes with expanding volume. Where does the burden of proof sit — bulls or bears?"
- Thread length increases from 3 to 5 tweets, within the optimal 4-8 range identified by platform research.

### Exceptions

- **TA posts** may use 3-4 tweets if the analysis is focused on a single chart setup. The chart image goes in Tweet 1.
- **AI/Tech roundups** may extend to 6-7 tweets given the multi-story format. The key numbers card goes in Tweet 1.
- The 5-tweet structure is a default, not a rigid constraint. Post length is dictated by content.

---

## 4. Visual Pipeline

### 4.1 Fix Publish Wiring (Quick Win)

**Problem:** `publish-draft.ts` ignores the `chartPath` frontmatter field. The Telegram client already accepts `imagePath`, and the Twitter client already has `uploadMedia()`. Charts exist in `content/charts/` but are never attached to published posts.

**Fix:** Read `chartPath` from the draft frontmatter and pass it through to both the Twitter and Telegram posting functions. Approximately 10 lines of code.

### 4.2 Branded Market Dashboard Card

A reusable HTML template rendered to PNG via Playwright (already a project dependency for chart capture).

**Used for:** Every Market Pulse post.

**Contents:**
- QuantApexAI branding (logo/name in header)
- Date
- BTC price + % change (large, prominent)
- ETH, SOL prices (smaller)
- Fear & Greed indicator
- Key macro numbers grid (Oil, Gold, S&P, DXY)
- Key levels at the bottom
- Color-coded: green for up, red for down

**Implementation:**
- New module: `lib/data-card.ts`
- New function: `renderDashboardCard(data: DashboardData): Promise<string>` — returns path to generated PNG
- Template: `brand/templates/visuals/dashboard.html` with CSS for branded styling
- Rendering: Playwright navigates to the local HTML file with data injected, screenshots to PNG
- Output: saved to `content/charts/` with naming convention `dashboard-YYYYMMDD-HHMM.png`
- Dimensions: 1600x900px (16:9 for optimal X feed display)

### 4.3 Data Card Generator for Macro/News

Same Playwright-to-PNG approach with multiple templates:

| Template File | Use Case | Example |
|---|---|---|
| `brand/templates/visuals/comparison.html` | Fee/price comparisons, before/after | Morgan Stanley ETF: MSBT 0.14% vs IBIT 0.25% vs FBTC 0.25% |
| `brand/templates/visuals/key-numbers.html` | 3-5 headline stats from a macro story | CCI 91.8, Gas $4.02, Inflation expectations: highest since Aug 2025 |
| `brand/templates/visuals/signal-dashboard.html` | Multi-metric status display with red/green indicators | Tanker traffic 21/day (red), Ship insurance 7.5% (red), SPR buffer ~2 weeks (red) |

**Implementation:**
- New function in `lib/data-card.ts`: `renderDataCard(template: string, data: CardData): Promise<string>`
- Template selection is manual — chosen during post composition based on the story
- Same rendering pipeline as dashboard card (Playwright + local HTML)
- Dimensions: 1600x900px

### 4.4 Chart Annotation + Watermark

After Playwright captures a TradingView chart, post-process it:

1. **Watermark:** Composite a small QuantApexAI logo onto the bottom-right corner
2. **Key level annotations:** Overlay horizontal lines + price labels for support/resistance levels mentioned in the post text

**Implementation:**
- New dependency: `sharp` (fast Node.js image processing, added via `pnpm add sharp`)
- New function in `lib/chart-capture.ts`: `annotateChart(imagePath: string, options: AnnotationOptions): Promise<string>`
  - `options.levels`: array of `{ price: number, label: string, color: 'red' | 'green' | 'neutral' }`
  - `options.watermarkPath`: path to logo PNG
- The function composites the watermark and draws level lines onto the chart image using sharp
- Output: overwrites the original chart file (or saves to a new path)

### 4.5 Brand Visual Assets

New files to create:

| File | Purpose |
|---|---|
| `brand/assets/logo-light.png` | Watermark for dark chart backgrounds |
| `brand/assets/logo-dark.png` | Watermark for light backgrounds |
| `brand/assets/colors.json` | Color palette: primary brand color, up/green (#22c55e), down/red (#ef4444), neutral/gray, background/dark |

Font: Inter (clean sans-serif, widely available, good for data-dense cards). Loaded via Google Fonts in the HTML templates.

### 4.6 Visual Type Auto-Selection

When composing posts, the visual type is determined by post type:

| Post Type | Visual Generated | Template |
|---|---|---|
| Market Pulse | Dashboard card (always) | `dashboard.html` |
| Technical Analysis | Annotated + watermarked TradingView chart (always) | Chart capture pipeline |
| Macro/News | Data card (template chosen per story) | `comparison.html`, `key-numbers.html`, or `signal-dashboard.html` |
| AI/Tech Roundup | Key numbers card | `key-numbers.html` |

The visual is saved to `content/charts/` and its path is written into the draft's `chartPath` frontmatter. The publish pipeline (Section 4.1 fix) handles attaching it to both X and Telegram posts.

---

## 5. Telegram Enhancements

### 5.1 Rich Text Formatting

The `postToChannel()` function already uses `parse_mode: 'HTML'`. Apply formatting in draft composition:

- **Bold** for headers and section labels: `<b>Key levels:</b>`
- **Bold** for key numbers: `<b>$67,100</b>`, `<b>+2.1%</b>`
- **Italic** for the prioritization take / editorial insight: `<i>The headline is the ultimatum. The signal underneath: institutions quietly flipped to net buyers.</i>`
- No underline, no monospace — bold and italic only for clean readability

**X (Twitter) formatting:** X does not support rich text. Posts remain plain text with emoji anchors, line breaks, and Unicode symbols (₿). The visual pipeline (attached images) provides the visual hierarchy that text formatting cannot.

### 5.2 Reaction Prompt

Add a line at the bottom of every Telegram post (after hashtags):

> Your outlook? React below.

Short, consistent, low-friction. Telegram's channel ranking algorithm ("Loop of Three") weighs reactions as a key signal for channel visibility.

### 5.3 Weekly Poll

One poll per week, posted alongside the weekend Market Pulse or weekly roundup.

- Format: simple 3-option poll
- Example: "BTC by Friday: Above $69K / $65K-$69K / Below $65K"
- Implementation: add a `sendPoll(bot, channelId, question, options)` function to `telegram-client.ts` using Telegraf's `sendPoll` API

---

## 6. Template & Config Updates

### 6.1 Voice Guide (`brand/voice-guide.md`)

Add sections:
- **Prioritization Take Principle** — every post contains at least one sentence of editorial prioritization ("this matters more than that"), woven naturally into the narrative with varied phrasing. Never a fixed label.
- **Engagement Close Principle** — every X thread ends with a debatable question flowing from the take.
- Update **Thread Structure** guidance from 3-tweet to 5-tweet default.
- Update **Hashtag** section to reflect 2-max strategy and topic-specific macro/news tags.
- Add **Visual** section noting that every post type has an associated visual asset.

### 6.2 Post Templates (`brand/templates/`)

**market-recap.md:**
- Restructure X template from 3-tweet to 5-tweet format
- Tweet 1: short hook + dashboard card image
- Tweet 4: prioritization take
- Tweet 5: question close + key levels
- Telegram: add `<b>` and `<i>` formatting markers, reaction prompt
- Add visual guidance: always generate dashboard card

**technical-analysis.md:**
- Add "The chart says:" attribution pattern for opinion section
- Add question close to final tweet
- Add visual guidance: always generate annotated + watermarked chart

**fundamental-analysis.md:**
- Update hashtag guidance: topic-specific tag for macro/news
- Add prioritization take and question close
- Add visual guidance: data card template selection per story type

### 6.3 Hashtag Guide (`brand/hashtags.md`)

- Remove `#QuantApexAI` as mandatory tag
- Set X max to 2 hashtags per tweet
- Add macro/news topic-specific tag guidance with examples
- Telegram hashtags unchanged

### 6.4 Config (`config/posting-rules.json`)

- Rename `includeChart` to `includeVisual`
- Add `visualTypeMap` mapping post types to visual templates
- Update hashtag config to reflect new rules

### 6.5 New Files

| File | Purpose |
|---|---|
| `lib/data-card.ts` | Data card rendering module (`renderDashboardCard`, `renderDataCard`) |
| `brand/templates/visuals/dashboard.html` | Market Dashboard Card HTML template |
| `brand/templates/visuals/comparison.html` | Comparison data card template |
| `brand/templates/visuals/key-numbers.html` | Key numbers data card template |
| `brand/templates/visuals/signal-dashboard.html` | Multi-metric status card template |
| `brand/assets/logo-light.png` | Watermark for dark backgrounds |
| `brand/assets/logo-dark.png` | Watermark for light backgrounds |
| `brand/assets/colors.json` | Brand color palette definition |

---

## 7. Compliance Integration

All changes operate within the existing compliance framework:

- **Prioritization takes** are editorial judgment (what matters vs. what doesn't), not financial advice. They never include buy/sell directives, price predictions, certainty claims, or FOMO language.
- The existing compliance checklist (`brand/compliance/compliance-checklist.md`) continues to gate every post before publishing. No changes to the checklist are needed — prioritization framing already passes all 6 compliance categories.
- **Engagement questions** are debatable analytical questions ("is the oil shock transitory or structural?"), not leading questions ("don't you think BTC will moon?"). They frame uncertainty, which aligns with the compliance principle of acknowledging uncertainty.
- **Visual assets** are branded data representations, not promotional material. Dashboard cards display the same data already in the text — they do not add directional claims.

---

## 8. Success Criteria

After implementation, the following should be measurable within 2-4 weeks of publishing with the new format:

- Every published post includes a visual asset (up from 10%)
- Every X thread includes a closing question
- Every post contains a prioritization take woven into the narrative
- Hashtag count stays at 2 or fewer per tweet on X
- All posts continue to pass the existing compliance checklist
- Telegram posts use bold/italic formatting and include a reaction prompt
- At least 1 weekly poll is posted to Telegram

---

## 9. Out of Scope

- Short-form video content (flagged by agents but deferred — different skillset and tooling)
- Automated posting schedule / cron jobs (user manually approves and publishes)
- X Premium account features (separate decision)
- Community management / reply engagement strategy (operational, not content format)
- Telegram cross-promotion with other channels (growth strategy, not content format)
- Logo design (brand assets will use a text-based placeholder until professional design is available)
