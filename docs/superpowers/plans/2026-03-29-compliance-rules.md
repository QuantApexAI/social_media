# Compliance Rules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three-layer compliance enforcement (soft guidance, hard validation, safety-net hook) for X/Twitter ToS and multi-jurisdiction financial advice protection.

**Architecture:** Three markdown documents in `brand/compliance/` provide the rules. CLAUDE.md workflow is updated to read rules during drafting and validate against checklist before preview. A PreToolUse prompt hook on publishing commands acts as a safety net. No new code — all enforcement is instruction-based and hook-based.

**Tech Stack:** Markdown, Claude Code hooks (prompt type), JSON config

**Spec:** `docs/superpowers/specs/2026-03-29-compliance-rules-design.md`

---

## File Map

### New Files to Create

| File | Responsibility |
|------|---------------|
| `brand/compliance/x-platform-rules.md` | X/Twitter ToS: automation, content policy, financial promotion rules |
| `brand/compliance/financial-disclaimer.md` | US SEC/FINRA + UK/EU FCA/MiFID II financial advice guardrails |
| `brand/compliance/compliance-checklist.md` | Structured pass/fail checklist for hard validation |

### Files to Modify

| File | Change |
|------|--------|
| `config/posting-rules.json` | Add `compliance` section with reportMode and blockOnFail |
| `CLAUDE.md` | Add compliance steps to workflow, add compliance section |
| `.claude/settings.json` | Add PreToolUse prompt hook for safety net |

---

## Task 1: X Platform Rules Document

**Files:**
- Create: `brand/compliance/x-platform-rules.md`

- [ ] **Step 1: Create brand/compliance/ directory**

```bash
mkdir -p brand/compliance
```

- [ ] **Step 2: Write brand/compliance/x-platform-rules.md**

Include version header:
```
Last updated: 2026-03-29
Version: 1.0
```

Three sections per spec (lines 49-75):

**Section 1: Automation Rules**
- Rate limits: 1,500 tweets/month free tier, 50 requests per 15 min
- No duplicate content across accounts
- No bulk/aggressive follow/unfollow, like, retweet
- No automated engagement farming (follow-for-follow, RT-to-win)
- Disclose AI-assisted content where required by platform policy
- Minimum 15-minute spacing between posts

**Section 2: Content Policy**
- No platform manipulation or coordinated inauthentic behavior
- No misleading content about markets, assets, or performance
- No spam or repetitive low-value content
- No impersonation
- No hashtag/trending manipulation
- Credit sources, respect IP

**Section 3: Financial Promotion Rules**
- No misleading financial claims or guaranteed returns
- No pump-and-dump patterns
- No undisclosed paid promotions
- No misleading $TICKER cashtag inflation
- Howey test awareness: avoid framing tokens as securities
- All analysis framed as opinion, not recommendation

- [ ] **Step 3: Commit**

```bash
git add brand/compliance/x-platform-rules.md
git commit -m "feat: add X/Twitter platform compliance rules"
```

---

## Task 2: Financial Disclaimer Document

**Files:**
- Create: `brand/compliance/financial-disclaimer.md`

- [ ] **Step 1: Ensure directory exists and write file**

Run: `mkdir -p brand/compliance`

Then write `brand/compliance/financial-disclaimer.md`:

Include version header:
```
Last updated: 2026-03-29
Version: 1.0
```

Two sections per spec (lines 77-118):

**Section 1: US (SEC/FINRA) Guidelines**
- What constitutes investment advice (personalized recommendation + compensation + individual circumstances)
- Rules: no directive language, no guaranteed outcomes, no risk-free claims, conditional framing, invalidation conditions on TA
- Howey test awareness for crypto: avoid implying tokens are investment contracts, no "investing in" framing

**Section 2: UK/EU (FCA/MiFID II) Guidelines**
- Financial promotion rules: fair, clear, not misleading. Prominent risk warnings.
- FCA crypto marketing: risk warning requirement, no suitability claims, no FOMO language
- MiFID II: distinguish marketing from research, label as opinion, no targeting vulnerable audiences

Per spec (lines 296-304), include a note:
> QuantApexAI posts are classified as analysis/opinion, not financial promotions. Posts analyze publicly available data, make no personalized recommendations, receive no issuer compensation, and are framed as observations.

- [ ] **Step 2: Commit**

```bash
git add brand/compliance/financial-disclaimer.md
git commit -m "feat: add multi-jurisdiction financial disclaimer rules"
```

---

## Task 3: Compliance Checklist

**Files:**
- Create: `brand/compliance/compliance-checklist.md`

- [ ] **Step 1: Ensure directory exists and write file**

Run: `mkdir -p brand/compliance`

Then write `brand/compliance/compliance-checklist.md`:

Include version header:
```
Last updated: 2026-03-29
Version: 1.0
```

This is the machine-readable checklist Claude validates each draft against. Include an **Instructions** section at the top explaining:
- Claude must run every draft through this checklist after composition, before saving
- Each category contains specific pass/fail criteria
- Report PASS, WARNING (borderline, include explanation + suggested rewrite), or FAIL (hard violation, must fix)
- Default report mode: warnings-only (show report only if WARNING or FAIL). User can request "show full compliance" for complete report.
- FAIL status blocks publishing — cannot proceed until fixed.

Five categories per spec (lines 120-165):

**Category 1: X Platform Compliance** (6 items)
- Post length within limit (280 X / 4096 Telegram)
- No duplicate content vs. last 7 days of `content/published/` (>80% sentence overlap = WARNING, exact copy = FAIL)
- No banned engagement patterns ("follow for follow", "RT to win", "like and retweet")
- No misleading platform metrics claims
- Hashtag count <= 5 for X
- Minimum 15 min since last published post (read most recent from `content/published/` today, parse `published` timestamp)

**Category 2: Financial Content** (7 items)
- No directive language ("buy", "sell", "load up", "don't miss", "get in now")
- No guaranteed outcomes ("will hit $X", "guaranteed", "100%", "can't lose")
- No personalized recommendations ("you should", "I recommend you", "your portfolio")
- Uses conditional framing ("watching for", "if X breaks Y", "should Z hold")
- No urgency pressure ("act now", "last chance", "hurry", "before it's too late")
- No Howey-test triggers (tokens as investment contracts, profits from others' efforts)
- No risk minimization ("safe bet", "easy money", "risk-free", "no downside")

**Category 3: Disclaimers & Disclosures** (5 items)
- No language reasonably interpreted as financial advice
- TA posts include invalidation condition
- No insider knowledge or guaranteed alpha claims
- No misleading track record claims ("I called the bottom", "always right")
- No undisclosed affiliations or paid promotions

**Category 4: Crypto-Specific UK/EU** (7 items)
- No "risk-free" or "guaranteed returns"
- No risk minimization
- No targeting vulnerable/inexperienced audiences
- No promotional exaggeration for specific protocols/tokens
- No misleading comparisons to regulated investments
- No FOMO language ("don't miss out", "once in a lifetime")
- If promotional for small-cap token, suggest risk awareness note (WARNING)

**Category 5: Thread Compliance — X only** (3 items)
- Each tweet individually passes all above checks
- No directive language in any tweet even if earlier tweets used conditional framing
- Thread as a whole does not construct a recommendation when read sequentially

Include the **compliance report format** examples from the spec (lines 191-218):
- warnings-only format
- full report format
- FAIL format

- [ ] **Step 2: Commit**

```bash
git add brand/compliance/compliance-checklist.md
git commit -m "feat: add structured compliance validation checklist"
```

---

## Task 4: Configuration Update

**Files:**
- Modify: `config/posting-rules.json`

- [ ] **Step 1: Add compliance section to posting-rules.json**

Add the `compliance` object to the existing JSON (preserve all existing fields):

```json
{
  "platforms": {
    "x": {
      "maxLength": 280,
      "threadMaxTweets": 8,
      "mediaTypes": ["png", "jpg"]
    },
    "telegram": {
      "maxLength": 4096,
      "mediaTypes": ["png", "jpg", "gif"]
    }
  },
  "defaults": {
    "postToBoth": true,
    "includeHashtags": true,
    "includeChart": true
  },
  "compliance": {
    "reportMode": "warnings-only",
    "blockOnFail": true
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add config/posting-rules.json
git commit -m "feat: add compliance config to posting rules"
```

---

## Task 5: CLAUDE.md Workflow Update

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update Section 3 (Workflow Steps)**

Replace the current 7-step workflow (lines 23-29) with the 8-step version that inserts compliance validation and safety net:

```markdown
1. **Fetch data** — Query MCP servers: TradingView analysis + screener, crypto RSS feeds, Brave search for breaking news.
2. **Capture charts** — Run `lib/chart-capture.ts`. Falls back to text-only post if capture fails.
3. **Compose posts** — Apply `brand/voice-guide.md` rules, templates from `brand/templates/`, AND compliance rules from `brand/compliance/x-platform-rules.md` and `brand/compliance/financial-disclaimer.md`.
4. **Compliance validation** — Run each draft against `brand/compliance/compliance-checklist.md`. Attach compliance report (default: warnings-only). FAIL blocks publishing.
5. **Save drafts** — Write to `content/drafts/` and send to user's Telegram for mobile preview (includes compliance report if warnings/failures).
6. **Review & approve** — User responds in this Claude Code session: "publish all", "publish 1,3", "show full compliance", or provides feedback for revision.
7. **Publish** — Post approved content to X and the Telegram channel. Safety-net hook automatically checks content before API call.
8. **Archive** — Move published posts to `content/published/YYYY-MM-DD/`.
```

- [ ] **Step 2: Update Section 4 (Brand Voice)**

Add after the existing Don't list (after line 45):

```markdown
**Compliance:** Before composing any post, read `brand/compliance/x-platform-rules.md` and `brand/compliance/financial-disclaimer.md`. Run every finished draft against `brand/compliance/compliance-checklist.md` before saving. See `config/posting-rules.json` for report mode settings.
```

- [ ] **Step 3: Add "show full compliance" to Quick Commands table**

Add a new row to the Quick Commands table (Section 2):

```markdown
| "Show full compliance" | Display full compliance report for current drafts |
```

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "feat: integrate compliance validation into CLAUDE.md workflow"
```

---

## Task 6: Safety Net Hook

**Files:**
- Modify: `.claude/settings.json`

- [ ] **Step 1: Read current settings.json**

Current content (for reference):
```json
{
  "permissions": {
    "allow": [
      "WebFetch",
      "WebSearch",
      "Bash(*/Users/plamensavchev/Development/QuantApex/social_media/*)"
    ]
  },
  "enabledPlugins": {
    "ralph-loop@claude-plugins-official": true
  }
}
```

- [ ] **Step 2: Add hooks section**

Add the `hooks` key with the PreToolUse prompt hook, preserving all existing settings:

```json
{
  "permissions": {
    "allow": [
      "WebFetch",
      "WebSearch",
      "Bash(*/Users/plamensavchev/Development/QuantApex/social_media/*)"
    ]
  },
  "enabledPlugins": {
    "ralph-loop@claude-plugins-official": true
  },
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

- [ ] **Step 3: Validate JSON syntax**

Run: `jq -e '.hooks.PreToolUse[] | select(.matcher == "Bash(*twitter-client*)|Bash(*telegram-client*)") | .hooks[] | select(.type == "prompt") | .prompt' .claude/settings.json`

Expected: exit 0, prints the prompt string.

- [ ] **Step 4: Commit**

```bash
git add .claude/settings.json
git commit -m "feat: add compliance safety-net hook for publishing commands"
```

---

## Task 7: Verification

- [ ] **Step 1: Verify all compliance files exist**

```bash
ls -la brand/compliance/
```

Expected: three files (x-platform-rules.md, financial-disclaimer.md, compliance-checklist.md)

- [ ] **Step 2: Verify posting-rules.json has compliance section**

```bash
jq '.compliance' config/posting-rules.json
```

Expected: `{"reportMode": "warnings-only", "blockOnFail": true}`

- [ ] **Step 3: Verify CLAUDE.md mentions compliance**

Check that Section 3 has 8 steps (not 7), Section 4 has compliance reference, and Quick Commands has "show full compliance."

- [ ] **Step 4: Verify hook is in settings.json**

```bash
jq '.hooks.PreToolUse[0].matcher' .claude/settings.json
```

Expected: `"Bash(*twitter-client*)|Bash(*telegram-client*)"`

- [ ] **Step 5: Run all existing tests to verify nothing broken**

```bash
pnpm test
```

Expected: All 46 tests pass. No compliance changes should break existing code.

- [ ] **Step 6: Final commit (if any cleanup needed)**

```bash
git add -A
git commit -m "chore: verify compliance rules integration"
```

---

## Execution Order Summary

| Task | Dependencies | Description |
|------|-------------|-------------|
| 1 | None | X Platform Rules document |
| 2 | None | Financial Disclaimer document |
| 3 | None | Compliance Checklist document |
| 4 | None | Config update (posting-rules.json) |
| 5 | 1, 2, 3 | CLAUDE.md workflow update (references compliance files) |
| 6 | None | Safety net hook in settings.json |
| 7 | All | Verification |

**Parallelizable:** Tasks 1, 2, 3, 4, and 6 can all run in parallel. Task 5 depends on 1-3 (references the files). Task 7 runs last.
