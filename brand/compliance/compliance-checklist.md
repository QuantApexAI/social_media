# Compliance Validation Checklist

Last updated: 2026-03-29
Version: 1.0

## Instructions

Claude must run every draft through this checklist after composition, before saving to drafts.

**Validation outcomes:**
- **PASS** — all items clear
- **WARNING** — borderline, include explanation + suggested rewrite
- **FAIL** — hard violation, must fix before publishing. Cannot proceed.

**Report mode** (see `config/posting-rules.json`):
- `warnings-only` (default): only show report if WARNING or FAIL detected
- `full`: show complete report for all categories
- User can request full report with "show full compliance"

**FAIL always blocks publishing regardless of config.**

---

## Category 1: X Platform Compliance

- [ ] Post length within limit (280 for X, 4096 for Telegram)
- [ ] No duplicate content vs. last 7 days of `content/published/` (>80% sentence overlap = WARNING, exact copy = FAIL)
- [ ] No banned engagement patterns ("follow for follow", "RT to win", "like and retweet")
- [ ] No misleading claims about platform metrics or account performance
- [ ] Hashtag count <= 5 for X posts
- [ ] Minimum 15 min since last published post (check most recent file in `content/published/` for today, parse `published` timestamp from frontmatter)

---

## Category 2: Financial Content

- [ ] No directive language ("buy", "sell", "load up", "don't miss", "get in now")
- [ ] No guaranteed outcomes ("will hit $X", "guaranteed", "100%", "can't lose")
- [ ] No personalized recommendations ("you should", "I recommend you", "your portfolio")
- [ ] Uses conditional framing ("watching for", "if X breaks Y", "should Z hold")
- [ ] No urgency pressure ("act now", "last chance", "hurry", "before it's too late")
- [ ] No Howey-test triggers (no implication tokens are investment contracts with expected profits from others' efforts)
- [ ] No risk minimization ("safe bet", "easy money", "risk-free", "no downside")

---

## Category 3: Disclaimers & Disclosures

- [ ] Contains no language reasonably interpreted as financial advice
- [ ] TA posts include invalidation condition (demonstrates uncertainty)
- [ ] No claims of insider knowledge or guaranteed alpha
- [ ] No misleading track record claims ("I called the bottom", "always right")
- [ ] No undisclosed affiliations or paid promotions

---

## Category 4: Crypto-Specific UK/EU

- [ ] No "risk-free" or "guaranteed returns" language
- [ ] No minimization of investment risk
- [ ] No targeting vulnerable/inexperienced audiences
- [ ] No promotional exaggeration for specific protocols/tokens
- [ ] No misleading comparisons to regulated investments
- [ ] No FOMO language ("don't miss out", "once in a lifetime")
- [ ] If post could be construed as promotional for a specific small-cap asset, suggest risk awareness note (WARNING level)

---

## Category 5: Thread Compliance — X only

- [ ] Each tweet in thread individually passes all above checks
- [ ] No directive language in any tweet, even if earlier tweets used conditional framing
- [ ] Thread as a whole does not construct a recommendation when read sequentially

---

## Report Format Examples

**Warnings-only format (default):**
```
--- Compliance: 1 WARNING ---
Financial: WARNING — "this is heading to $95K" → reframe as conditional ("watching for a move toward $95K")
---
```

**Full report format:**
```
--- Compliance Report ---
X Platform:     PASS (6/6)
Financial:      PASS (7/7)
Disclaimers:    PASS (5/5)
Crypto UK/EU:   PASS (7/7)
Char Limit:     PASS (214/280)
---
```

**FAIL format:**
```
--- Compliance: FAIL ---
Financial: FAIL — "you should buy BTC here" → directive language detected. Must reframe as observation.
Action: Fix before publishing. Cannot proceed.
---
```
