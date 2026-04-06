# Template: Daily Market Recap

## Instructions for Claude

**Visual:** Always generate a branded dashboard card via `lib/data-card.ts`. Attach to Tweet 1.

Use this template to generate the daily Market Pulse post. Follow the structure exactly — the hook-first narrative, BTC solo line, and alt grouping rules are intentional.

**Structure:**
1. 📊 Title with emoji
2. Narrative hook (1-2 sentences framing why today matters — the story, not the data)
3. ₿ BTC solo line (always its own line, never grouped)
4. Alts — grouped if correlated, broken out if diverging (see `brand/voice-guide.md` > Alt Grouping Rules)
5. Commodities — only if significant move (oil, gold, gas)
6. Macro line — S&P 500, NASDAQ, DXY (always include all three)
7. Key levels — ₿ prefix for BTC, plain text for others
8. Footer hashtags — category tags only (ticker hashtags are inline on first mention)

**Brief commentary** means vivid, active language — not textbook phrasing:
- "Clinging to $67K support" (not "testing critical support zone")
- "Rips to 10-month highs" (not "increased to the highest level")
- "Back below $2K" (not "trading below the $2,000 level")

**Order of assets:**
1. BTC first, always — its own line with ₿ prefix, hashtagged on first mention
2. Alts grouped or broken out per voice guide rules. Hashtag each ticker on first mention only. Reference `config/watchlist.json` for the crypto watchlist (currently BTC, ETH, SOL).
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

### X (Twitter) — 5-Tweet Thread

- **Tweet 1 (Hook + Visual):** 📊 title + narrative hook (80–140 chars, no data) + [ATTACH: Dashboard card image]
- **Tweet 2 (BTC + Headlines):** ₿ #BTC price + commodities + macro (S&P, NASDAQ, DXY)
- **Tweet 3 (Alts + Context):** Alt section + additional context (Fear & Greed, ETF flows)
- **Tweet 4 (Prioritization Take):** Editorial prioritization — what matters vs what to ignore, varied phrasing
- **Tweet 5 (Question Close + Key Levels):** Key levels + debatable question + #Crypto footer

#### X Thread Example — Correlated Red Day

```
Tweet 1:
📊 Market Pulse | Mar 30

Oil crosses $100 for the first time since 2022 and DXY is ripping. The macro regime just shifted — crypto isn't the story today, it's the casualty.

[ATTACH: Dashboard card image]
```

```
Tweet 2:
₿ #BTC $67,500 (-4.2%) — Clinging to $67K support

Oil $102.88 (+3.25%) | S&P 500: 6,344 (-0.39%)
NASDAQ: 20,795 (-0.73%) | DXY: 100.54 (+0.4%)
```

```
Tweet 3:
Alts bleeding in lockstep. #SOL leads losses at -5.8%, down 72% from peak. #ETH back below $2K.

Fear & Greed: 14 (Extreme Fear) — capitulation readings, but no bounce trigger yet.
```

```
Tweet 4:
What matters here: DXY direction and whether BTC holds $64,500. Altcoin moves are noise until macro stabilizes — focus on the macro, not the alts.
```

```
Tweet 5:
Key levels:
₿ BTC: $64,500 / $71,800
ETH: $1,950 / $2,200

Does BTC hold support here or does $64.5K give way? Drop your level below.

#Crypto
```

#### X Thread Example — Diverging Day

```
Tweet 1:
📊 Market Pulse | Apr 3

ETF inflows are back and BTC is leading — but the altcoin market is telling two completely different stories depending on where you're looking.

[ATTACH: Dashboard card image]
```

```
Tweet 2:
₿ #BTC $72,100 (+3.8%) — Reclaimed 50D EMA, volume confirming

S&P 500: 6,410 (+0.5%) | NASDAQ: 21,020 (+0.8%)
DXY: 99.80 (-0.3%)
```

```
Tweet 3:
#SOL $98 (+8.2%) — Firedancer upgrade live, breakout above descending wedge
#ETH $2,180 (-0.6%) — Stuck below $2,200, volume fading

ETF flows: BTC +$320M net inflow yesterday — institutional demand returning.
```

```
Tweet 4:
The only move that matters today is BTC reclaiming the 50D EMA with volume. SOL's upgrade pop is real but narrow. ETH underperformance vs. BTC is the signal worth tracking.
```

```
Tweet 5:
Key levels:
₿ BTC: $69,500 / $74,450
SOL: $92 / $105
ETH: $2,050 / $2,250

ETH/BTC ratio sitting at multi-year lows — is this the start of a rotation, or just BTC dominance holding? Your read?

#Crypto
```

---

### Telegram

Post as a single message with HTML formatting. You may expand the hook to 2-3 sentences and add 1-2 extra sentences per asset for additional context.

```
<b>Market Pulse | [DATE]</b>

[NARRATIVE HOOK — 2-3 sentences framing why today matters.]

₿ #BTC <b>$[PRICE]</b> (<b>[+/-PCT]%</b>) — [vivid commentary]
[ALT SECTION]

[COMMODITIES if significant]
S&P 500: [PRICE] ([+/-PCT]%) | NASDAQ: [PRICE] ([+/-PCT]%)
DXY: [VALUE] ([+/-PCT]%)

Key levels:
₿ BTC: $[SUPPORT] / $[RESISTANCE]
ETH: $[SUPPORT] / $[RESISTANCE]

<i>[PRIORITIZATION TAKE — what matters most and what to ignore today]</i>

#Crypto #MarketUpdate #QuantApexAI

Your outlook? React below.
```

#### Telegram Example — Correlated Red Day

```
<b>Market Pulse | Mar 30</b>

Extreme Fear grips crypto as oil crosses $100 for the first time since 2022. DXY rips to 10-month highs — risk assets under pressure across the board. This is a macro-driven move, not a crypto-specific one.

₿ #BTC <b>$67,500</b> (<b>-4.2%</b>) — Clinging to $67K support
Alts bleeding in lockstep. #SOL leads losses at -5.8%, down 72% from peak. #ETH back below $2K.

Oil $102.88 (+3.25%) | S&P 500: 6,344 (-0.39%)
NASDAQ: 20,795 (-0.73%) | DXY: 100.54 (+0.4%)

Key levels:
₿ BTC: $64,500 / $71,800
ETH: $1,950 / $2,200

<i>The only number that matters today is DXY. Everything else — the alt losses, the Fear & Greed readings — is downstream of that move. Watch whether 100.54 holds or extends.</i>

#Crypto #MarketUpdate #QuantApexAI

Your outlook? React below.
```
