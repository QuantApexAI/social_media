# Post Style Overhaul — Design Spec

**Date:** 2026-03-30
**Status:** Approved
**Approach:** B — Templates + Voice Guide Update

## Problem

Current posts are repetitive, dry, and not captivating on X. Specific issues:

1. **Repetitive structure** — When multiple crypto assets move in the same direction, each is listed in identical `TICKER $PRICE (PCT%) — commentary` format. This is especially flat on correlated red/green days.
2. **No visual identity** — Posts lack consistent emoji or visual anchors. Scrolling through a feed, QuantApexAI posts are indistinguishable from each other or other accounts.
3. **No narrative hook** — Posts open with a date label or raw data. Nothing stops the scroll.
4. **Static timeframe** — TA posts default to 1D regardless of what timeframe is most relevant (weekly close, month-end).
5. **Textbook language** — "Testing critical support zone" reads like a report, not a post someone wants to engage with.

## Design

### 1. Emoji Identity System

Each post type gets a fixed emoji as its visual signature, always placed first in the title:

| Post Type | Emoji | Title Format |
|---|---|---|
| Market Recap | 📊 | `📊 Market Pulse \| {date}` |
| Technical Analysis | 🔍 | `🔍 ₿ BTC {timeframe} Analysis` |
| Macro / News | 🌍 | `🌍 {Event} — {Context}` |
| AI / Tech News | 🤖 | `🤖 {Headline}` |

**Ticker emoji:** Only BTC gets a symbol (₿). All other tickers use plain text.

**Rationale:** Emoji goes first so it's the leftmost visual anchor when scrolling. Followers learn to recognize post categories at a glance.

### 1b. Inline Ticker Hashtags

Tickers are hashtagged inline in the body on their **first mention only** (e.g. `₿ #BTC`, `#ETH`, `#SOL`). Subsequent mentions of the same ticker in the post use plain text. The footer hashtag block does NOT repeat ticker hashtags already used inline — it only contains category hashtags (`#Crypto`, `#MarketUpdate`, `#QuantApexAI`, etc.).

This replaces the old rule of "no hashtags mid-post." The new rule keeps total hashtag count low while improving discoverability.

**Example:**
```
₿ #BTC $67,500 (-4.2%) — Clinging to $67K support
Alts bleeding in lockstep. #SOL leads losses at -5.8%. #ETH back below $2K.
...
Key levels:
₿ BTC: $64,500 / $71,800
ETH: $1,950 / $2,200

#Crypto #MarketUpdate #QuantApexAI
```

Note: BTC, SOL, ETH appear as hashtags on first mention only. The footer has no ticker hashtags — just category tags + `#QuantApexAI`.

### 2. Hook-First Narrative Structure

Every post opens with a 1-2 sentence narrative hook that frames *why today matters*, before any data.

**Market Recap structure (new):**
1. 📊 Title
2. Narrative hook (1-2 sentences — the story, not the data)
3. ₿ BTC solo line (always)
4. Alts grouped or broken out (see grouping rules)
5. Macro/commodities line
6. Key levels
7. Hashtags

**Example — current vs. new:**

Current:
```
Market Pulse | Mar 30

BTC $67,500 (-4.2%) — Testing critical $67K support zone. Fear & Greed Index at 27 (Extreme Fear) as risk-off sentiment dominates.
ETH $2,050 (-3.1%) — Slight bounce off sub-$2K levels but still trading below the 50D EMA.
SOL $87 (-5.8%) — Down 72% from its peak, consolidating between $85-$90.
```

New:
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

### 3. Alt Grouping Rules

**Group alts when:**
- 3+ alts move in the same direction and no individual alt has a move >2x the group average
- No individual alt has a unique story (breakout, breakdown, protocol event)
- Format: "Alts bleeding in lockstep. #SOL leads losses at -5.8%, down 72% from peak. #ETH back below $2K."

**Break out an alt individually when:**
- Moving opposite to the group (e.g. SOL green while ETH red)
- Significantly larger move (>2x the group average)
- Ticker-specific catalyst (upgrade, hack, regulatory news, ETF flow)

**BTC always gets its own line** — it's the reference point, never grouped.

**Telegram expansion:** Alts can get 1-2 extra sentences each even when grouped (room within 4096 chars). X stays tight.

### 4. Dynamic TA Timeframe Selection

Instead of always defaulting to 1D, Claude selects timeframe based on context:

| Day | Primary Timeframe | Reason |
|---|---|---|
| Sunday/Monday | 1W | Weekly candle just closed |
| Last 1-2 days of month | 1M | Monthly candle closing |
| Last day of month + Monday | 1M + 1W combo | Both just closed |
| All other days | 1D default | Unless higher timeframe is more compelling |

**Override rule:** If a lower timeframe has a significantly more interesting setup (e.g. clear 4H breakout pattern), Claude can choose that instead but must note the higher timeframe context. Example: "🔍 ₿ BTC 4H Analysis" with opening line referencing "Weekly candle closed bearish, but 4H showing..."

**Chart capture follows the selected timeframe.**

### 5. Voice Guide Updates

**Add to "Do" list:**
- Open with a narrative hook that frames why today matters — the story before the data
- Use vivid, active verbs for observations ("clinging to", "bleeds into", "rips higher")
- Use emoji system consistently — post type emoji in title, ₿ for BTC inline

**Add to "Don't" list:**
- Don't list assets in identical format when they're moving together — group and summarize
- Don't open with title/date as the first attention-grabbing element — the hook comes first
- Don't use passive/textbook language when an active verb is more vivid

**Vivid vs. Hype distinction (new section):**
- Vivid (OK): "clinging to", "bleeds", "rips", "slammed into resistance"
- Hype (not OK): "to the moon", "unstoppable", "guaranteed", "don't miss"
- Test: is it *describing what happened* or *telling you what to feel*? Descriptions are fine. Emotional directives are not.

### 6. Compliance

**No changes to compliance rules.** The compliance checklist, X platform rules, and financial disclaimer all stay as-is. Vivid language passes every check because it's observational, not directive.

## Files to Modify

| File | Changes |
|---|---|
| `brand/voice-guide.md` | Emoji identity system, inline ticker hashtag rule, hook-first narrative rule, vivid verb guidance, grouping philosophy, vivid vs hype distinction |
| `brand/templates/market-recap.md` | 📊 emoji title, narrative hook section, BTC solo + alt grouping format, updated example |
| `brand/templates/technical-analysis.md` | 🔍 emoji title, dynamic timeframe selection rules + priority table, updated examples |
| `brand/templates/fundamental-analysis.md` | 🌍 and 🤖 emoji titles, hook-first opening |
| `brand/hashtags.md` | Remove XRP references, replace "no hashtags mid-post" with inline-first-mention rule |

**Files NOT modified:**
- `brand/compliance/*` — compliance stays strict
- `config/posting-rules.json` — no structural changes
- `lib/*` — no code changes
- `CLAUDE.md` — already points to voice guide and templates
