# Template: Technical Analysis Post

## Instructions for Claude

**Visual:** Always generate an annotated + watermarked TradingView chart. The chart image is attached to Tweet 1.

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

**Override rule:** If a lower timeframe has a significantly more interesting setup (e.g. clear 4H breakout pattern), use that instead but reference the higher timeframe context in the opening. Example: "🔍 ₿ #BTC 4H Analysis" with opening line: "Weekly candle closed bearish, but 4H showing bullish divergence at support."

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
- "The chart says: [direct attribution of what the structure implies]"

**Never use:**
- "This will break down"
- "Price is going to $X"
- "Load up before the move"
- "Don't miss this setup"

**Always include an invalidation condition.** This shows intellectual honesty and protects the brand. Format: `Invalidation below $X on [timeframe] close.`

**Always close with a question** that invites the audience to engage. The question should be debatable — not rhetorical. Example: "Where does the burden of proof sit — bulls or bears?"

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

The chart says: [direct read of what the structure implies — burden of proof, who controls price, what the setup demands].
Watching for [thesis — what would confirm the setup].
Invalidation [condition] on [timeframe] close.

[Chart Image]

[Where does the burden of proof sit — or similar debatable question?]

#Crypto
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

The chart says: the burden of proof is on the bulls until $72,600 reclaims with conviction.
Watching for a weekly close above $71,800 to signal trend reversal.
Invalidation below $64,500 on weekly close.

[Chart Image]

Where does the burden of proof sit — bulls or bears?

#Crypto
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

The chart says: sellers are in control until the channel breaks with volume.
Watching for a bounce off $67K with volume confirmation.
Invalidation below $64,500 on daily close.

[Chart Image]

Does $67K hold, or is this channel heading lower?

#Crypto
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

The chart says: this is the most important monthly close since the 2022 bear market low — structure demands respect.
Watching for March close above $67K to hold the higher-low structure.
Invalidation below $61,500 on monthly close — would break the 2024 uptrend.

[Chart Image]

Does this monthly close change your macro thesis?

#Crypto
```

---

## Platform Variants

**X (Twitter):** For detailed setups, use a thread:
- Tweet 1: 🔍 title + narrative hook + chart image
- Tweet 2: Key observations + "The chart says:" thesis + invalidation
- Tweet 3: Debatable question close + #Crypto

**Telegram:** Full template in one message. You may add 1–2 sentences of additional context (e.g., macro backdrop, correlation with BTC dominance). Attach chart image inline.

---

## Hashtag Reference

Ticker hashtags go inline on first mention in the title/body. The footer contains only the category tag:

- BTC analysis: title `🔍 ₿ #BTC ...`, footer `#Crypto`
- ETH analysis: title `🔍 #ETH ...`, footer `#Crypto`
- Altcoin analysis: title `🔍 #[COIN] ...`, footer `#Crypto`
