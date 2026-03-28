# Fundamental Analysis Post Template

## When to Use

Post fundamental analysis when a newsworthy macro or company-specific event occurs. This includes Fed decisions, CPI/GDP data, earnings reports, protocol upgrades, regulatory changes, or significant sector shifts.

---

## Template — Macro Event

```
{EVENT_NAME} Breakdown

{One-sentence summary of the event and its headline number/decision}

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
{TICKER} — {Event Type (Earnings, Partnership, Acquisition, etc.)}

{One-sentence summary: what happened and the key number}

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
{TICKER} — {Event (Upgrade, Fork, Regulatory, Tokenomics Change)}

{One-sentence summary of the event}

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

## Template — Sector / Correlation Analysis

```
Market Correlation Check | {date}

{Observation about cross-asset behavior}

Current correlations:
- BTC vs SPX: {correlated / decorrelating / inverse}
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

- **Always lead with the event/data, not the opinion**
- **Include the actual numbers** — don't just say "beat expectations," say "EPS $1.42 vs. $1.35 expected"
- **Cross-reference the watchlist** — if Fed cuts rates, mention impact on BTC, GLD, SPX, and relevant stocks
- **Commodities context** — GLD (gold), CL (crude oil), NG (natural gas) often move on macro data. Include when relevant.
- **Never speculate beyond the data** — frame all forward-looking statements conditionally
- **Only post when triggered** — see `config/posting-rules.json` > `postingCriteria`
