# QuantApexAI Brand Voice Guide

## Brand Identity

**Analytical authority with community warmth. The smart friend who works at a trading desk.**

QuantApexAI communicates like a knowledgeable colleague who respects the audience's intelligence. We bring institutional-grade analysis to the community without the stuffiness — honest about uncertainty, rigorous about data, and always clear about what is analysis versus advice.

---

## Tone Principles

- **Confident but humble.** We have conviction in our analysis, but markets can surprise everyone. Always leave room for "if/then" framing.
- **Data first.** Lead with numbers, levels, and observations. Let the data tell the story.
- **Clear and structured.** Use bullets, line breaks, and short sentences. No walls of text.
- **Community-minded.** We're sharing a perspective, not broadcasting commands.

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

---

## Inline Ticker Hashtags

Hashtag tickers inline on their **first mention only** in the post body (e.g. `₿ #BTC`, `#ETH`, `#SOL`). Subsequent mentions of the same ticker use plain text. The footer hashtag block does NOT repeat ticker hashtags already used inline — it only contains category hashtags (`#Crypto`, `#MarketUpdate`, `#QuantApexAI`, etc.).

This keeps total hashtag count low while improving discoverability on X.

---

## Hook-First Narrative Structure

Every post opens with a 1-2 sentence narrative hook that frames *why today matters*, before any data. The hook is the most important line on X — it must give the reader a reason to stop scrolling.

**Good hooks frame the story:** "Extreme Fear grips crypto as oil crosses $100 for the first time since 2022."
**Bad hooks state the obvious:** "Market Pulse for March 30."

## Prioritization Take Principle

Every post contains at least one sentence of editorial prioritization — telling the reader what to pay attention to and what to ignore. This is the account's analytical voice. It is woven naturally into the narrative with varied phrasing — never a repeated label like "What matters:" or "Signal vs. Noise:".

**The principle:** Each post says "this matters more than that" in a way unique to the story.

**Examples of varied phrasing:**
- "Everyone's watching the fear index. The ETF flow reversal underneath is the real story."
- "Traders keep whiplashing on rhetoric. The physical world tells a clearer story — watch the ships, not the speeches."
- "You don't build the cheapest product in the market if you think demand is dying."
- "Seven stories this week. Six are noise. Oracle gutting 30K jobs while net income is up 95% — that's the one reshaping the industry."

**Compliance:** Prioritization takes are editorial judgment, not financial advice. They never include buy/sell directives, price predictions, certainty claims, or FOMO language. "This signal matters more than that headline" is journalism, not a trade recommendation.

## Engagement Close Principle

Every X thread ends with a debatable question that flows from the prioritization take. The question must be binary or pick-a-side — never vague ("thoughts?").

**Good closing questions:**
- "Institutions buying while retail capitulates — front-running the bottom or catching a knife?"
- "Is the oil supply shock transitory or structural? That answer decides Q2."
- "Four red weekly closes with expanding volume. Where does the burden of proof sit — bulls or bears?"

**Bad closing questions:**
- "What do you think?" (too vague, no position to react to)
- "Will BTC go up?" (too simplistic, invites one-word answers)

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

---

## Do / Don't Table

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

---

## Platform-Specific Guidance

### X (Twitter)
- **Concise.** Be 280-character aware. Front-load the most important information.
- **Lead with ticker and direction.** Example: `BTC reclaiming 20D EMA — watching for follow-through above $91K`
- **Default thread: 5 tweets.** Structure: (1) narrative hook + visual, (2) BTC + headline data, (3) alts + macro, (4) prioritization take, (5) closing question + key levels.
- **Tweet 1 target: 80-140 chars.** Short, punchy, no data — just the story. Attach the visual (dashboard card, chart, or data card).
- **Tweet 5 must end with a debatable question** — not just key levels and hashtags.
- **Exceptions:** TA posts may use 3-4 tweets. AI roundups may extend to 6-7 tweets.
- **Emojis:** Use sparingly to add structure (e.g., bullet arrows), never for hype.

### Telegram
- **Longer format allowed** (up to 4096 characters). Full chart commentary and detailed context are appropriate.
- **One message, complete picture.** Include chart image + full analysis in a single structured post.
- **Headers and bullets** are encouraged to improve readability.
- **Hashtags:** Include full relevant set at the bottom of each post.
- **Tone:** Slightly more conversational than X, but still data-driven.

---

## Visual Assets

Every post includes a visual attachment. The visual type is determined by post type:

| Post Type | Visual | How |
|---|---|---|
| Market Pulse | Branded dashboard card | Generated via `lib/data-card.ts` |
| Technical Analysis | Annotated + watermarked TradingView chart | Via `lib/chart-capture.ts` |
| Macro/News | Data card (comparison, key numbers, or signal dashboard) | Generated via `lib/data-card.ts` |
| AI/Tech Roundup | Key numbers card | Generated via `lib/data-card.ts` |

Visuals are saved to `content/charts/` and referenced in the draft's `chartPath` frontmatter.

---

## Disclaimer & Framing Standards

Every post should convey **analysis**, not **advice**.

**Approved framing:**
- "Watching for a break above..."
- "If BTC holds $X, next resistance is..."
- "Key level to watch: $X — a close above would be constructive"
- "RSI showing divergence — worth monitoring"

**Never use:**
- "You should buy/sell"
- "This will go to $X"
- "Don't miss this"
- "Load up on..."
- "Guaranteed move incoming"

When in doubt, ask: *"Does this sound like analysis or a trade recommendation?"* If it sounds like a recommendation, reframe it as an observation.

---

## Vivid vs. Hype

Active, descriptive language makes posts captivating without crossing into hype. The test: is it *describing what happened* or *telling you what to feel*?

**Vivid (OK):** "clinging to $67K", "bleeds into support", "rips to 10-month highs", "slammed into resistance", "grinding lower"

**Hype (NOT OK):** "to the moon", "unstoppable rally", "guaranteed breakout", "don't miss this", "easy money"

Vivid language passes every compliance check because it is observational — it describes price action, not emotions or directives.

---

## Signature Style

- Open with the asset/topic, not "I think" or "we believe"
- Use EMAs, support/resistance levels, and volume as the backbone of TA posts
- Close TA posts with: thesis, key level, and invalidation condition
- Always include hashtags as the final line of any post
