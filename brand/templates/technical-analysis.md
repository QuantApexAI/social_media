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

[Hashtags — category tags only, ticker already hashtagged in title]
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
