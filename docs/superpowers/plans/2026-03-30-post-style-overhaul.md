# Post Style Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update brand voice guide and post templates to produce less repetitive, more captivating social media posts with consistent emoji identity, hook-first narrative structure, alt grouping, dynamic TA timeframe selection, and inline ticker hashtags (first mention only).

**Architecture:** All changes are to markdown instruction files that Claude reads when composing posts. No code changes. Five files modified, each with specific content updates per the approved design spec at `docs/superpowers/specs/2026-03-30-post-style-overhaul-design.md`.

**Tech Stack:** Markdown content files (brand guidelines and templates)

---

### Task 1: Update Voice Guide

**Files:**
- Modify: `brand/voice-guide.md`

- [ ] **Step 1: Add emoji identity system section after "Tone Principles"**

Insert the following new section after the `## Tone Principles` section (after line 17):

```markdown
---

## Emoji Identity System

Every post type has a fixed emoji placed first in the title. This is the leftmost visual anchor when scrolling — followers learn to recognize post categories at a glance.

| Post Type | Emoji | Title Format |
|---|---|---|
| Market Recap | 📊 | `📊 Market Pulse \| {date}` |
| Technical Analysis | 🔍 | `🔍 ₿ BTC {timeframe} Analysis` |
| Macro / News | 🌍 | `🌍 {Event} — {Context}` |
| AI / Tech News | 🤖 | `🤖 {Headline}` |

**Ticker emoji:** Only BTC gets a symbol (₿). All other tickers use plain text.

## Inline Ticker Hashtags

Hashtag tickers inline on their **first mention only** in the post body (e.g. `₿ #BTC`, `#ETH`, `#SOL`). Subsequent mentions of the same ticker use plain text. The footer hashtag block does NOT repeat ticker hashtags already used inline — it only contains category hashtags (`#Crypto`, `#MarketUpdate`, `#QuantApexAI`, etc.).

This keeps total hashtag count low while improving discoverability on X.
```

- [ ] **Step 2: Add hook-first and alt grouping section after emoji identity**

Insert the following new section immediately after the emoji identity system:

```markdown
---

## Hook-First Narrative Structure

Every post opens with a 1-2 sentence narrative hook that frames *why today matters*, before any data. The hook is the most important line on X — it must give the reader a reason to stop scrolling.

**Good hooks frame the story:** "Extreme Fear grips crypto as oil crosses $100 for the first time since 2022."
**Bad hooks state the obvious:** "Market Pulse for March 30."

## Alt Grouping Rules

When crypto assets are moving in the same direction, do not list each one in identical format. Group and summarize.

**Group alts when:**
- All alts move in the same direction and no individual alt has a move >2x the group average
- No individual alt has a unique story (breakout, protocol event, regulatory news)
- Format: "Alts bleeding in lockstep. #SOL leads losses at -5.8%, down 72% from peak. #ETH back below $2K."

**Break out an alt individually when:**
- Moving opposite to the group
- Significantly larger move (>2x the group average)
- Ticker-specific catalyst

**BTC always gets its own line** — it is the reference point and is never grouped with alts.

**Telegram expansion:** When grouped, alts can get 1-2 extra sentences each on Telegram (room within 4096 chars). X stays tight.
```

- [ ] **Step 3: Update the Do/Don't table**

Replace the existing Do/Don't table (lines 22-29) with:

```markdown
| Do | Don't |
|----|-------|
| Open with a narrative hook that frames why today matters | Open with a date label or raw data as the first element |
| Lead with data and levels after the hook | Hype or shill ("to the moon!") |
| Explain the "why" behind moves | Give financial advice ("you should buy") |
| Acknowledge uncertainty ("watching for...") | Be overly bearish or bullish |
| Use vivid, active verbs ("clinging to", "rips higher", "bleeds into") | Use passive/textbook language ("testing support zone") |
| Use emoji system consistently — post type emoji in title, ₿ for BTC | Overuse emoji for decoration or hype |
| Group correlated alts — summarize, don't repeat | List assets in identical format when they're all moving together |
| Credit sources | Claim predictions as certainties |
```

- [ ] **Step 4: Add vivid vs hype section before "Signature Style"**

Insert the following new section before `## Signature Style` (before line 72):

```markdown
---

## Vivid vs. Hype

Active, descriptive language makes posts captivating without crossing into hype. The test: is it *describing what happened* or *telling you what to feel*?

**Vivid (OK):** "clinging to $67K", "bleeds into support", "rips to 10-month highs", "slammed into resistance", "grinding lower"

**Hype (NOT OK):** "to the moon", "unstoppable rally", "guaranteed breakout", "don't miss this", "easy money"

Vivid language passes every compliance check because it is observational — it describes price action, not emotions or directives.
```

- [ ] **Step 5: Verify the file reads correctly**

Read `brand/voice-guide.md` end-to-end and confirm all new sections are properly placed and formatted.

- [ ] **Step 6: Commit**

```bash
git add brand/voice-guide.md
git commit -m "brand: update voice guide with emoji identity, hook-first structure, alt grouping, vivid vs hype"
```

---

### Task 2: Update Market Recap Template

**Files:**
- Modify: `brand/templates/market-recap.md`

- [ ] **Step 1: Replace the full file content**

Replace the entire contents of `brand/templates/market-recap.md` with:

```markdown
# Template: Daily Market Recap

## Instructions for Claude

Use this template to generate the daily Market Pulse post. Follow the structure exactly — the hook-first narrative, BTC solo line, and alt grouping rules are intentional.

**Structure:**
1. 📊 Title with emoji
2. Narrative hook (1-2 sentences framing why today matters — the story, not the data)
3. ₿ BTC solo line (always its own line, never grouped)
4. Alts — grouped if correlated, broken out if diverging (see `brand/voice-guide.md` > Alt Grouping Rules)
5. Commodities — only if significant move (oil, gold, gas)
6. Macro line — S&P 500, NASDAQ, DXY (always include all three)
7. Key levels — ₿ prefix for BTC, plain text for others
8. Hashtags

**Brief commentary** means vivid, active language — not textbook phrasing:
- "Clinging to $67K support" (not "testing critical support zone")
- "Rips to 10-month highs" (not "increased to the highest level")
- "Back below $2K" (not "trading below the $2,000 level")

**Order of assets:**
1. BTC first, always — its own line with ₿ prefix
2. Alts grouped or broken out per voice guide rules. Reference `config/watchlist.json` for the crypto watchlist (currently BTC, ETH, SOL).
3. Commodities: oil (CL), gold (GLD), natural gas (NG) — only include if significant move
4. Macro section: S&P 500, NASDAQ, DXY (always include all three)

**Key levels:** Use the nearest meaningful support and resistance based on recent structure, not arbitrary round numbers. Prefix BTC levels with ₿.

---

## Template

```
📊 Market Pulse | [DATE e.g. Mar 30]

[NARRATIVE HOOK — 1-2 sentences framing why today matters. Lead with the biggest story: macro event, sentiment shift, cross-asset dynamic. This is what stops the scroll.]

₿ #BTC $[PRICE] ([+/-PCT]%) — [vivid commentary]
[ALT SECTION — grouped if correlated, individual if diverging. Hashtag each ticker on first mention only. See voice guide.]

[COMMODITIES if significant — e.g. Oil $102.88 (+3.25%)]
S&P 500: [PRICE] ([+/-PCT]%) | NASDAQ: [PRICE] ([+/-PCT]%)
DXY: [VALUE] ([+/-PCT]%)

Key levels:
₿ BTC: $[SUPPORT] / $[RESISTANCE]
ETH: $[SUPPORT] / $[RESISTANCE]

#Crypto #MarketUpdate #QuantApexAI
```

---

## Example Output — Correlated Red Day (alts grouped)

```
📊 Market Pulse | Mar 30

Extreme Fear grips crypto as oil crosses $100 for the first time since 2022. DXY rips to 10-month highs — risk assets under pressure across the board.

₿ #BTC $67,500 (-4.2%) — Clinging to $67K support
Alts bleeding in lockstep. #SOL leads losses at -5.8%, down 72% from peak. #ETH back below $2K.

Oil $102.88 (+3.25%) | S&P 500: 6,344 (-0.39%)
NASDAQ: 20,795 (-0.73%) | DXY: 100.54 (+0.4%)

Key levels:
₿ BTC: $64,500 / $71,800
ETH: $1,950 / $2,200

#Crypto #MarketUpdate #QuantApexAI
```

## Example Output — Diverging Day (alts broken out)

```
📊 Market Pulse | Apr 3

#BTC reclaims $72K as ETF inflows return, but altcoins tell a different story — #SOL surges on network upgrade while #ETH stalls at resistance.

₿ BTC $72,100 (+3.8%) — Reclaimed 50D EMA, volume confirming
SOL $98 (+8.2%) — Firedancer upgrade live, breakout above descending wedge
ETH $2,180 (-0.6%) — Stuck below $2,200, volume fading

S&P 500: 6,410 (+0.5%) | NASDAQ: 21,020 (+0.8%)
DXY: 99.80 (-0.3%)

Key levels:
₿ BTC: $69,500 / $74,450
SOL: $92 / $105
ETH: $2,050 / $2,250

#Crypto #MarketUpdate #QuantApexAI
```

---

## Platform Variants

**X (Twitter):** If the post exceeds 280 characters, start a thread:
- Tweet 1: 📊 title + narrative hook + ₿ BTC line
- Tweet 2: Alts + macro/commodities
- Tweet 3: Key levels + hashtags

**Telegram:** Post as a single message. You may expand the hook to 2-3 sentences and add 1-2 extra sentences per asset for additional context.
```

- [ ] **Step 2: Verify the file reads correctly**

Read `brand/templates/market-recap.md` end-to-end and confirm formatting.

- [ ] **Step 3: Commit**

```bash
git add brand/templates/market-recap.md
git commit -m "brand: update market recap template with hook-first structure, emoji, alt grouping"
```

---

### Task 3: Update Technical Analysis Template

**Files:**
- Modify: `brand/templates/technical-analysis.md`

- [ ] **Step 1: Replace the full file content**

Replace the entire contents of `brand/templates/technical-analysis.md` with:

```markdown
# Template: Technical Analysis Post

## Instructions for Claude

Use this template for chart-based TA posts. Follow the framing guidelines strictly — the goal is observations and probabilities, never predictions or advice. Use vivid, active language per the voice guide.

---

## Dynamic Timeframe Selection

Do not always default to 1D. Select the timeframe based on what's closing or what's most interesting:

| Day | Primary Timeframe | Reason |
|---|---|---|
| Sunday/Monday | 1W | Weekly candle just closed — fresh structure to analyze |
| Last 1-2 days of month | 1M | Monthly candle closing — highest-timeframe structure |
| Last day of month + Monday | 1M + 1W combo | Both just closed — combined post or thread |
| All other days | 1D default | Unless a higher timeframe has a more compelling setup |

**Override rule:** If a lower timeframe has a significantly more interesting setup (e.g. clear 4H breakout pattern), use that instead but reference the higher timeframe context in the opening. Example: "🔍 ₿ BTC 4H Analysis" with opening line: "Weekly candle closed bearish, but 4H showing bullish divergence at support."

**Chart capture follows the selected timeframe** — if the post is a 1W analysis, capture the 1W chart.

---

## Timeframe Indicator Reference

| Timeframe | Key Indicators |
|---|---|
| 1W / 1M | 50 EMA, 200 EMA, weekly/monthly levels, macro structure |
| 1D | 50 EMA, 200 EMA, RSI, MACD, daily structure |
| 4H | 20 EMA, 50 EMA, RSI, MACD, volume |
| 1H | Short-term entry/exit only — never standalone, pair with 4H or 1D |

Include observations for any indicators that show a clear signal. Skip indicators with no meaningful reading.

| Indicator | What to note |
|-----------|-------------|
| RSI | Overbought (>70), oversold (<30), or divergence vs. price |
| MACD | Histogram expanding/fading, bullish/bearish crossover |
| Volume | Confirming or diverging from price move; declining in a trend |
| 20 EMA | Short-term momentum; price above/below/reclaiming |
| 50 EMA | Medium-term trend; acting as support or resistance |
| 200 EMA / MA | Long-term trend baseline |
| Pattern | Wedge, flag, triangle, H&S — name it and define its boundaries |

---

## Thesis Framing Rules

**Always use conditional or observational language:**
- "Watching for a break below $X"
- "If price holds above $X, next target is $Y"
- "RSI divergence suggests momentum may be fading"
- "Volume declining into resistance — worth monitoring"

**Never use:**
- "This will break down"
- "Price is going to $X"
- "Load up before the move"
- "Don't miss this setup"

**Always include an invalidation condition.** This shows intellectual honesty and protects the brand. Format: `Invalidation below $X on [timeframe] close.`

---

## Template

```
🔍 [₿ #COIN if BTC, else #COIN] [TIMEFRAME] Analysis

[NARRATIVE HOOK — 1-2 sentences framing the setup in context. What makes this timeframe interesting right now?]

Key observations:
- [Pattern boundary / key level 1]: $[VALUE]
- [Pattern boundary / key level 2]: $[VALUE]
- Volume: [vivid description] ([bullish/bearish/neutral])
- [Indicator]: [observation]

Watching for [thesis — what would confirm the setup].
Invalidation [condition] on [timeframe] close.

[Chart Image]

[Hashtags]
```

---

## Example Output — Weekly Analysis (Monday)

```
🔍 ₿ #BTC 1W Analysis

March's weekly candles paint a clear picture — four consecutive red closes with volume expanding on each selloff.

Key observations:
- Weekly support: $64,500 (2024 range high, now being retested as support)
- Weekly resistance: $74,450 (April 2025 low, rejected twice)
- Volume: Expanding on down weeks (bearish)
- RSI (weekly): 38 — approaching oversold but no divergence yet
- 50W EMA: $71,800, acting as overhead resistance

Watching for a weekly close above $71,800 to signal trend reversal.
Invalidation below $64,500 on weekly close.

[Chart Image]

#TechnicalAnalysis #CryptoTrading #QuantApexAI
```

## Example Output — Daily Analysis (midweek)

```
🔍 ₿ #BTC 1D Analysis

Descending channel tightening since early March. RSI grinding toward oversold while price clings to the $67K floor.

Key observations:
- Channel support: $66,800
- Channel resistance: $71,200
- Volume: Elevated on sell-side (bearish)
- 200D EMA: Overhead resistance at $72,500
- MACD: Bearish crossover, histogram expanding

Watching for a bounce off $67K with volume confirmation.
Invalidation below $64,500 on daily close.

[Chart Image]

#TechnicalAnalysis #CryptoTrading #QuantApexAI
```

## Example Output — Monthly Analysis (end of month)

```
🔍 ₿ #BTC 1M Analysis

March's monthly candle about to close with a -18% body — the largest monthly red candle since June 2022.

Key observations:
- Monthly support: $61,500 (2024 consolidation range)
- Monthly resistance: $74,450 (failed breakout level)
- Volume: Highest monthly volume since Nov 2024
- RSI (monthly): 42 — mid-range, no oversold signal yet

Watching for March close above $67K to hold the higher-low structure.
Invalidation below $61,500 on monthly close — would break the 2024 uptrend.

[Chart Image]

#TechnicalAnalysis #CryptoTrading #QuantApexAI
```

---

## Platform Variants

**X (Twitter):** For detailed setups, use a thread:
- Tweet 1: 🔍 title + narrative hook + key levels + chart image
- Tweet 2: Indicators + thesis + invalidation
- Tweet 3: Hashtags (if needed, can combine with tweet 2)

**Telegram:** Full template in one message. You may add 1–2 sentences of additional context (e.g., macro backdrop, correlation with BTC dominance). Attach chart image inline.

---

## Hashtag Reference

Ticker hashtags go inline on first mention in the title/body. The footer contains only category tags:

- BTC analysis: title `🔍 ₿ #BTC ...`, footer `#TechnicalAnalysis #CryptoTrading #QuantApexAI`
- ETH analysis: title `🔍 #ETH ...`, footer `#TechnicalAnalysis #CryptoTrading #QuantApexAI`
- Altcoin analysis: title `🔍 #[COIN] ...`, footer `#TechnicalAnalysis #CryptoTrading #QuantApexAI`
```

- [ ] **Step 2: Verify the file reads correctly**

Read `brand/templates/technical-analysis.md` end-to-end and confirm formatting.

- [ ] **Step 3: Commit**

```bash
git add brand/templates/technical-analysis.md
git commit -m "brand: update TA template with dynamic timeframe selection, emoji identity, hook-first structure"
```

---

### Task 4: Update Fundamental Analysis Template

**Files:**
- Modify: `brand/templates/fundamental-analysis.md`

- [ ] **Step 1: Replace the full file content**

Replace the entire contents of `brand/templates/fundamental-analysis.md` with:

```markdown
# Fundamental Analysis Post Template

## When to Use

Post fundamental analysis when a newsworthy macro or company-specific event occurs. This includes Fed decisions, CPI/GDP data, earnings reports, protocol upgrades, regulatory changes, or significant sector shifts.

---

## Template — Macro Event

```
🌍 {EVENT_NAME} — {Brief Context}

{NARRATIVE HOOK — 1-2 sentences framing the event and its immediate market impact. Lead with the headline number/decision, then the "so what."}

What it means for markets:
- {Impact on equities — direction + reasoning}
- {Impact on crypto — correlation or divergence from risk assets}
- {Impact on commodities (GLD, oil, gas) — if relevant}
- {DXY / forex implications — if relevant}

Key levels to watch:
- {TICKER}: {level} — {why this level matters post-event}

{Conditional thesis: "If X holds above Y..." or "Watch for Z reaction..."}

#MacroAnalysis #Markets #QuantApexAI
```

### Macro Events to Cover
- **Fed rate decisions** — impact on all asset classes
- **CPI / inflation data** — crypto and gold correlation
- **GDP / employment reports** — equity and forex impact
- **Geopolitical events** — risk-on/risk-off shifts

---

## Template — Earnings / Company Event

```
🌍 {TICKER} — {Event Type (Earnings, Partnership, Acquisition, etc.)}

{NARRATIVE HOOK — what happened and why it matters, not just the number.}

Key takeaways:
- {Revenue/EPS vs. expectations}
- {Guidance — raised, maintained, or lowered}
- {Market reaction — pre/post-market move}

What to watch:
- {Key level for the stock post-event}
- {Sector implications — does this affect COIN, MSTR, etc.?}

{Conditional framing — never directive}

#{TICKER} #Earnings #QuantApexAI
```

### Stocks Watchlist Context
- **AAPL, TSLA, GOOG** — mega-cap tech, macro bellwethers
- **COIN** — crypto exchange, proxy for crypto market health
- **MSTR** — BTC treasury strategy, leveraged BTC exposure
- **STRC** — crypto infrastructure play

---

## Template — Crypto Fundamental

```
🌍 {TICKER} — {Event (Upgrade, Fork, Regulatory, Tokenomics Change)}

{NARRATIVE HOOK — what happened and why it matters for the network/ecosystem.}

Why it matters:
- {Technical impact — network performance, fees, throughput}
- {Economic impact — supply change, staking yield, burn mechanism}
- {Market impact — price reaction, volume, exchange flows}

Key levels:
- Support: ${level} | Resistance: ${level}

{Conditional thesis}

#{TICKER} #CryptoFundamentals #QuantApexAI
```

---

## Template — AI / Tech News

```
🤖 {HEADLINE}

{NARRATIVE HOOK — what happened and why it matters for crypto/markets.}

Key takeaways:
- {Primary impact — what changed}
- {Market implications — which assets/sectors affected}
- {Cross-asset context — if relevant}

Watch for: {what would amplify or reverse this development}

#AI #ArtificialIntelligence #Tech #QuantApexAI
```

---

## Template — Sector / Correlation Analysis

```
🌍 Market Correlation Check | {date}

{NARRATIVE HOOK — observation about cross-asset behavior that frames the analysis.}

Current correlations:
- ₿ #BTC vs SPX: {correlated / decorrelating / inverse}
- Gold vs DXY: {relationship}
- Crypto vs Tech: {relationship}
- Oil/Gas: {direction + driver}

What this suggests:
- {Risk appetite reading}
- {Rotation signals — money flowing where?}

Watch for: {what would change this picture}

#MarketAnalysis #Correlation #QuantApexAI
```

---

## Guidance for Claude

- **Always open with a narrative hook** — frame the event before listing impacts
- **Include the actual numbers** — don't just say "beat expectations," say "EPS $1.42 vs. $1.35 expected"
- **Use vivid language** — "oil rips past $100" not "oil increased above $100"
- **Cross-reference the watchlist** — if Fed cuts rates, mention impact on ₿ #BTC (first mention), GLD, SPX, and relevant stocks
- **Commodities context** — GLD (gold), CL (crude oil), NG (natural gas) often move on macro data. Include when relevant.
- **Never speculate beyond the data** — frame all forward-looking statements conditionally
- **Only post when triggered** — see `config/posting-rules.json` > `postingCriteria`
- **Use 🌍 for macro/news/earnings/crypto fundamentals/correlation posts, 🤖 for AI/tech news**
```

- [ ] **Step 2: Verify the file reads correctly**

Read `brand/templates/fundamental-analysis.md` end-to-end and confirm formatting.

- [ ] **Step 3: Commit**

```bash
git add brand/templates/fundamental-analysis.md
git commit -m "brand: update fundamental analysis template with emoji identity and hook-first structure"
```

---

### Task 5: Update Hashtags File

**Files:**
- Modify: `brand/hashtags.md`

- [ ] **Step 1: Replace the full file content**

Replace the entire contents of `brand/hashtags.md` with:

```markdown
# QuantApexAI Hashtag Sets

## Market Recap
#Crypto #BTC #MarketUpdate #QuantApexAI

## Technical Analysis
#TechnicalAnalysis #CryptoTrading #QuantApexAI
Plus coin-specific: #BTC #ETH #SOL etc.

## Macro / News
#MacroAnalysis #Markets #QuantApexAI

## AI / Tech News
#AI #ArtificialIntelligence #Tech #QuantApexAI

## General (always include)
#QuantApexAI

---

## Usage Rules

- **Always** end every post with `#QuantApexAI`
- **Inline ticker hashtags:** Hashtag each ticker on its **first mention only** in the post body (e.g. `₿ #BTC`, `#ETH`, `#SOL`). Subsequent mentions use plain text.
- **Footer hashtags:** Only category tags (`#Crypto`, `#MarketUpdate`, `#TechnicalAnalysis`, `#QuantApexAI`, etc.). Do NOT repeat ticker hashtags already used inline.
- **X (Twitter):** Total hashtag count (inline + footer) should stay at 3–5 maximum.
- **Telegram:** Full category hashtag set is acceptable at the bottom of the message.
```

- [ ] **Step 2: Verify the file reads correctly**

Read `brand/hashtags.md` and confirm XRP references are removed and Macro/News set is added.

- [ ] **Step 3: Commit**

```bash
git add brand/hashtags.md
git commit -m "brand: update hashtags — remove XRP, add macro/news set, inline-first-mention rule"
```

---

### Task 6: Delete Current Drafts and Regenerate

**Files:**
- Delete: `content/drafts/20260330-1400-recap.md`
- Delete: `content/drafts/20260330-1405-ta.md`
- Delete: `content/drafts/20260330-1410-news.md`

The current drafts were generated using the old templates. After all template updates are complete, the user should run "Draft today's posts" again to regenerate using the new style.

- [ ] **Step 1: Delete old drafts**

```bash
rm content/drafts/20260330-*.md
```

- [ ] **Step 2: Confirm drafts directory is clean**

```bash
ls content/drafts/
```

Expected: only `.gitkeep`

- [ ] **Step 3: Inform user**

Tell the user: "Old drafts deleted. Run 'Draft today's posts' to regenerate using the new templates and voice guide."
