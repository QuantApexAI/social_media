# Compliance Rules for QuantApexAI Social Media — Design Spec

**Date:** 2026-03-29
**Status:** Approved
**Author:** Claude + Plamen Savchev
**Parent spec:** `docs/superpowers/specs/2026-03-28-social-media-automation-design.md`

## Overview

Add compliance rules to the QuantApexAI social media posting system. Three layers of enforcement: soft guidance during drafting, hard validation before preview, and a safety-net hook before publishing. Covers X/Twitter terms of service (automation, content, financial promotion) and multi-jurisdiction financial advice protection (US SEC/FINRA + UK/EU FCA/MiFID II).

## Goals

- Prevent posts that violate X/Twitter's terms of service
- Ensure no post can be interpreted as financial advice across US and UK/EU jurisdictions
- Provide visible compliance status on drafts (configurable verbosity)
- Block non-compliant posts from being published as a last resort
- Make rules easy to update (markdown files, not code)

## Architecture

### Three-Layer Enforcement

| Layer | When | How | Failure Mode |
|-------|------|-----|-------------|
| Soft guidance | During drafting | Claude reads compliance docs before composing | Claude follows rules during writing |
| Hard validation | After drafting, before preview | Claude runs each draft against structured checklist | PASS/WARNING/FAIL report attached to draft |
| Safety net hook | Before API call to publish | PreToolUse prompt hook checks post content | BLOCK prevents publishing |

### File Structure

```
brand/compliance/
├── x-platform-rules.md         # X/Twitter ToS compliance rules
├── financial-disclaimer.md     # Multi-jurisdiction financial advice rules
└── compliance-checklist.md     # Structured pass/fail checklist for validation
```

### Files to Modify

| File | Change |
|------|--------|
| `CLAUDE.md` | Add compliance reading + validation steps to workflow |
| `config/posting-rules.json` | Add `compliance` config section |
| `.claude/settings.json` | Add PreToolUse prompt hook for safety net |

## Compliance Documents

### brand/compliance/x-platform-rules.md

Three sections covering all X/Twitter compliance areas:

**1. Automation Rules**
- Respect rate limits: 1,500 tweets/month on free tier, 50 requests per 15 minutes
- No duplicate content posted across multiple accounts
- No bulk or aggressive follow/unfollow, like, or retweet actions
- No automated engagement farming (follow-for-follow, RT-to-win campaigns)
- Disclose that content may be AI-assisted where required by platform policy
- Space posts with reasonable intervals (no rapid-fire bursts)

**2. Content Policy**
- No platform manipulation or coordinated inauthentic behavior
- No misleading content about markets, assets, or performance
- No spam or repetitive low-value content
- No impersonation of other accounts or entities
- No manipulation of trending topics or hashtags
- Respect intellectual property (credit sources, don't copy other analysts' work verbatim)

**3. Financial Promotion Rules**
- No misleading financial claims or guaranteed returns
- No pump-and-dump patterns (promoting an asset while secretly planning to sell)
- No undisclosed paid promotions or sponsored content
- No misleading use of "$TICKER" formatting to artificially inflate cashtag visibility
- Crypto-specific: avoid language that frames tokens as securities (Howey test awareness)
- All analysis must be clearly framed as opinion/analysis, not recommendation

### brand/compliance/financial-disclaimer.md

Two sections covering US and UK/EU jurisdictions:

**1. US (SEC/FINRA) Guidelines**

What constitutes investment advice under US law:
- A personalized recommendation to buy, sell, or hold a specific security
- Delivered for compensation
- Based on individual circumstances

Rules to avoid crossing this line:
- Never use personalized directive language ("you should buy X")
- Never claim to know what will happen ("BTC will hit $100K")
- Never imply guaranteed returns or risk-free opportunities
- Always frame as analysis of publicly available data
- Use conditional language: "if", "watching for", "should X hold Y level"
- Include invalidation conditions in every technical analysis post

Howey test awareness for crypto content:
- Avoid implying tokens are investment contracts
- Don't suggest profits from efforts of a specific team or organization
- Don't frame token purchases as "investing in" a project's future

**2. UK/EU (FCA/MiFID II) Guidelines**

Financial promotion rules:
- All financial promotions must be fair, clear, and not misleading
- Risk warnings must be prominent and not buried
- No claims of "risk-free" returns
- No minimization of the risk of loss

Crypto-asset marketing (UK FCA):
- Must include risk warning: "Don't invest unless you're prepared to lose all the money you invest"
- No suggestion that crypto is suitable for most investors
- No urgency or FOMO-inducing language in crypto promotions
- No misleading comparisons to regulated investments

MiFID II considerations:
- Distinction between marketing communication and investment research
- All content should be clearly labeled as marketing communication / opinion
- No targeting of vulnerable or inexperienced audiences with high-risk content

### brand/compliance/compliance-checklist.md

Structured checklist with pass/fail criteria, organized by category. Claude validates each applicable item after drafting.

**Category: X Platform Compliance**
- Post length within platform limit (280 for X, 4096 for Telegram)
- No duplicate content (check against content/published/ last 7 days)
- No banned engagement patterns ("follow for follow", "RT to win", "like and retweet")
- No misleading claims about platform metrics or account performance
- Hashtag count <= 5 for X posts
- No rapid-fire posting (minimum 15 minutes between posts)

**Category: Financial Content**
- No directive language ("buy", "sell", "load up", "don't miss", "get in now")
- No guaranteed outcomes ("will hit $X", "guaranteed", "100%", "can't lose")
- No personalized recommendations ("you should", "I recommend you", "your portfolio")
- Uses conditional framing ("watching for", "if X breaks Y", "should Z hold")
- No urgency pressure ("act now", "last chance", "hurry", "before it's too late")
- No Howey-test triggers (no implication that tokens are investment contracts with expected profits from others' efforts)
- No risk minimization ("safe bet", "easy money", "risk-free", "no downside")

**Category: Disclaimers & Disclosures**
- Contains no language that could be reasonably interpreted as financial advice
- TA posts include invalidation condition (demonstrates uncertainty and analytical rigor)
- No claims of insider knowledge or guaranteed alpha
- No misleading track record claims ("I called the bottom", "always right")
- No undisclosed affiliations or paid promotions

**Category: Crypto-Specific (UK/EU)**
- No "risk-free" or "guaranteed returns" language
- No minimization of investment risk
- No targeting of vulnerable or inexperienced audiences
- If referencing specific protocols/tokens, no promotional exaggeration
- No misleading comparisons to regulated/traditional investments
- No FOMO language ("don't miss out", "once in a lifetime")
- If post could be construed as promotional for a specific small-cap token, consider adding risk awareness note (WARNING level)

**Category: Thread Compliance (X only)**
- Each tweet in thread individually passes all above checks
- No tweet in the thread uses directive language, even if earlier tweets used conditional framing
- Thread as a whole does not construct a recommendation when read sequentially

**Validation outcomes:**
- **PASS** — all items clear
- **WARNING** — borderline items flagged with specific explanation and suggested rewrite
- **FAIL** — hard violations that must be fixed before publishing. Cannot proceed.

## Workflow Integration

### Updated CLAUDE.md Workflow (Section 3)

The existing 7-step workflow gets two new steps inserted:

```
1. Fetch data (existing)
2. Capture charts (existing)
3. Compose posts — apply brand/voice-guide.md AND brand/compliance/ rules during composition
4. NEW: Compliance validation — run each draft against brand/compliance/compliance-checklist.md
5. Save drafts + send to Telegram preview (existing, now includes compliance report)
6. User review & approval (existing)
7. NEW: Safety net hook fires automatically before API call
8. Publish (existing)
9. Archive (existing)
```

### Updated CLAUDE.md Section 4 (Brand Voice)

Add reference to compliance docs:

> **Compliance:** Before composing any post, also read `brand/compliance/x-platform-rules.md` and `brand/compliance/financial-disclaimer.md`. Run every finished draft against `brand/compliance/compliance-checklist.md` before saving.

### Compliance Report Format

**Default mode (`warnings-only`):**
Only shown when there are warnings or failures:
```
--- Compliance: 1 WARNING ---
Financial: WARNING — "this is heading to $95K" → reframe as conditional ("watching for a move toward $95K")
---
```

**Full mode (on user request "show full compliance"):**
```
--- Compliance Report ---
X Platform:     PASS (5/5)
Financial:      PASS (7/7)
Disclaimers:    PASS (4/4)
Crypto UK/EU:   PASS (6/6)
Char Limit:     PASS (214/280)
---
```

**On FAIL:**
```
--- Compliance: FAIL ---
Financial: FAIL — "you should buy BTC here" → directive language detected. Must reframe as observation.
Action: Fix before publishing. Cannot proceed.
---
```

## Configuration

### config/posting-rules.json Update

Add to existing config:

```json
{
  "compliance": {
    "reportMode": "warnings-only",
    "blockOnFail": true
  }
}
```

- `reportMode`: `"warnings-only"` (default) or `"full"` — controls default verbosity
- `blockOnFail`: Always `true` — FAIL status prevents publishing. This is not configurable to prevent accidental bypass. The config field exists for documentation purposes; the workflow hardcodes blocking on FAIL.

## Safety Net Hook

### .claude/settings.json Update

Add a `PreToolUse` prompt hook scoped to publishing commands only. This hook merges with any existing hooks in the project settings file (it does not affect global hooks in `~/.claude/settings.json`).

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(*twitter-client*)|Bash(*telegram-client*)",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "The following Bash command is about to execute: $TOOL_INPUT. If this command posts content to social media (publishing a tweet, sending to a channel — not just creating a client or uploading media), review the post text for: (1) directive financial language like 'buy', 'sell', 'you should', 'load up', (2) guaranteed outcome claims like 'will hit', 'guaranteed', '100%', (3) X/Twitter ToS violations like spam, duplicate content, or platform manipulation. If ANY violation is found, return 'deny' with an explanation of the violation. If the command does not post content or passes all checks, return 'approve'.",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

This hook:
- Only activates on Bash commands containing `twitter-client` or `telegram-client` (narrow matcher avoids adding latency to unrelated commands)
- Uses a `prompt`-type hook (fast model evaluates the content)
- Uses `$TOOL_INPUT` template variable (Claude Code's supported variable for PreToolUse hooks)
- Returns `deny`/`approve` (Claude Code's expected `permissionDecision` format for PreToolUse prompt hooks)
- Checks for the three most critical violation categories
- Adds ~2-3 seconds only to publish actions, not all Bash commands

## Thread Compliance

When posting threads (multi-tweet via `postThread`):
- Each individual tweet is validated against the full compliance checklist independently
- The 280-character limit applies per-tweet
- "No duplicate content" applies across tweets within the same thread (no repeated sentences)
- The thread is also evaluated as a whole: a thread cannot collectively construct a message that would fail compliance if read as a single post (e.g., conditional framing in tweet 1, then directive "buy now" in tweet 5)
- The compliance report for a thread shows per-tweet results and an overall thread assessment

## Duplicate Content Detection

The checklist item "No duplicate content" requires:
1. Read the last 7 days of files from `content/published/`
2. Compare the draft's body text against each published post
3. Flag as WARNING if any published post shares >80% of the same sentences or has the same structure with only numbers changed (e.g., same TA template, same ticker, just updated price levels)
4. Flag as FAIL if the draft is an exact or near-exact copy of a previously published post

## Rapid-Fire Posting Check

The "minimum 15 minutes between posts" rule is enforced by:
1. Reading the most recent file from `content/published/` for today's date
2. Parsing its `published` timestamp from the YAML frontmatter
3. Comparing against the current time
4. If less than 15 minutes have elapsed, flag as WARNING with the time remaining

## FCA Crypto Risk Warning

QuantApexAI posts are classified as **analysis/opinion**, not **financial promotions** under FCA definitions. This is because:
- Posts analyze publicly available market data
- No personalized recommendations are made
- No compensation is received from token issuers
- Posts are clearly framed as analytical observations

However, when a post references a specific crypto asset in a context that could be construed as promotional (e.g., highlighting a breakout pattern on a small-cap token), the compliance check adds a WARNING suggesting inclusion of a risk awareness note. This is a precautionary measure, not a hard requirement.

## AI-Generated Content Disclosure

All posts are published under the @QuantApexAI brand, which inherently signals AI involvement. Additionally:
- The brand bio/description on X and Telegram should include "AI-powered analysis" or similar disclosure
- Individual posts do not require per-post AI disclosure unless X/Twitter's platform policy mandates it
- The compliance checklist includes monitoring for changes in X's AI disclosure requirements

## What This Does NOT Cover

- Legal disclaimer text at the bottom of posts (could be added to templates if desired)
- Specific compliance with any single country's regulations beyond US/UK/EU
- Real-time monitoring of published posts for compliance after the fact
- Automated reporting or audit trail (future Phase 2 consideration)
- Compliance of image/chart content (only post text is validated — misleading chart annotations are not caught)
- Compliance of replies or DMs (only original posts are covered)
- Instagram, LinkedIn, YouTube or other platforms (only X and Telegram)

## Rule Versioning

Each compliance document should include a header with:
```
Last updated: YYYY-MM-DD
Version: 1.0
```

This creates an audit trail for when rules were in effect. When rules change, update the version and date. Published posts in `content/published/` are timestamped, so it's possible to determine which version of the rules was active when any given post was published.
