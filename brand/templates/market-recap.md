# Template: Daily Market Recap

## Instructions for Claude

Use this template to generate the daily Market Pulse post. Fill every `[PLACEHOLDER]` with live data provided in the prompt context. Follow the formatting exactly — spacing, em dashes, and line breaks are intentional.

**"Brief commentary"** means one sentence about price action relative to a key moving average, pattern, or recent structure. Examples:
- "Reclaimed 20D EMA, volume confirming" (bullish reclaim)
- "Consolidating below $3,200 resistance" (neutral/range)
- "Leading alts, breakout above descending wedge" (breakout)
- "Rejected at 50D EMA, watching for retest of $X" (bearish rejection)

**Order of assets:**
1. BTC first, always
2. ETH second, always
3. Top 2–3 movers from the crypto watchlist (SOL, BNB, XRP, AVAX, etc.) — prioritize by % change
4. Macro section: S&P 500, NASDAQ, DXY (always include all three)

**Key levels:** Use the nearest meaningful support and resistance based on recent structure, not arbitrary round numbers.

---

## Template

```
Market Pulse | [DATE e.g. Mar 28]

BTC $[PRICE] ([+/-PCT]%) — [brief commentary]
ETH $[PRICE] ([+/-PCT]%) — [brief commentary]
[COIN3] $[PRICE] ([+/-PCT]%) — [brief commentary]
[COIN4 if notable] $[PRICE] ([+/-PCT]%) — [brief commentary]

S&P 500: [PRICE] ([+/-PCT]%) | NASDAQ: [PRICE] ([+/-PCT]%)
DXY: [VALUE] ([+/-PCT]%)

Key levels to watch:
- BTC: Support $[SUPPORT] | Resistance $[RESISTANCE]
- ETH: Support $[SUPPORT] | Resistance $[RESISTANCE]
[- COIN3: Support $[SUPPORT] | Resistance $[RESISTANCE]]

#Crypto #BTC #ETH #MarketUpdate #QuantApexAI
```

---

## Example Output

```
Market Pulse | Mar 28

BTC $89,420 (+2.1%) — Reclaimed 20D EMA, volume confirming
ETH $3,180 (-0.4%) — Consolidating below $3,200 resistance
SOL $142 (+5.3%) — Leading alts, breakout above descending wedge

S&P 500: 5,420 (+0.3%) | NASDAQ: 17,100 (+0.5%)
DXY: 103.8 (-0.2%)

Key levels to watch:
- BTC: Support $87,500 | Resistance $91,000
- ETH: Support $3,050 | Resistance $3,250

#Crypto #BTC #ETH #MarketUpdate #QuantApexAI
```

---

## Platform Variants

**X (Twitter):** Use the template as-is. If it exceeds 280 characters, start a thread — first tweet is BTC/ETH only, second tweet covers alts and macro, third tweet is key levels + hashtags.

**Telegram:** Post as a single message. You may expand the commentary to 2 sentences per asset if there is meaningful context to add.
