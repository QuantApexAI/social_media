# CLAUDE.md — QuantApexAI Social Media

## 1. Project Overview

Semi-automated social media posting for **QuantApexAI**. Trust-tiered architecture: MCP servers handle read-only market data; custom TypeScript libraries handle all posting actions. Package manager: **pnpm**.

---

## 2. Quick Commands

| Natural language | Action |
|---|---|
| "Draft today's posts" | Full daily workflow (data → charts → drafts → Telegram preview) |
| "What's moving today?" | Data scan only — no drafts created |
| "Capture {TICKER} {timeframe} chart" | Single chart screenshot via `lib/chart-capture.ts` |
| "Publish draft {N}" or "Publish all" | Publish approved draft(s) to X + Telegram channel |
| "Post about {topic}" | Compose and publish a single reactive post |
| "Show full compliance" | Display full compliance report for current drafts |

---

## 3. Workflow Steps

1. **Fetch data** — Query MCP servers: TradingView analysis + screener, crypto RSS feeds, Brave search for breaking news. Check for newsworthy triggers (see `config/posting-rules.json` > `postingCriteria`). If no triggers are found (no significant moves, no breaking news, no macro events), report to user and do NOT draft posts.
2. **Capture charts** — Run `lib/chart-capture.ts`. Falls back to text-only post if capture fails.
3. **Compose posts** — Apply `brand/voice-guide.md` rules, templates from `brand/templates/`, AND compliance rules from `brand/compliance/x-platform-rules.md` and `brand/compliance/financial-disclaimer.md`.
4. **Compliance validation** — Run each draft against `brand/compliance/compliance-checklist.md`. Attach compliance report (default: warnings-only). FAIL blocks publishing.
5. **Save drafts** — Write to `content/drafts/` and send to user's Telegram for mobile preview (includes compliance report if warnings/failures).
6. **Review & approve** — User responds in this Claude Code session: "publish all", "publish 1,3", "show full compliance", or provides feedback for revision.
7. **Publish** — Post approved content to X and the Telegram channel. Safety-net hook automatically checks content before API call.
8. **Archive** — Move published posts to `content/published/YYYY-MM-DD/`.

---

## 4. Brand Voice

Full guide: `brand/voice-guide.md`

**Do:**
- Lead with data and chart evidence
- Explain the *why* behind a move
- Acknowledge uncertainty ("watch for", "if this holds")

**Don't:**
- Hype or use superlatives without data
- Give financial advice or claim certainties
- Use phrases like "guaranteed", "moon", "100x"

**Compliance:** Before composing any post, read `brand/compliance/x-platform-rules.md` and `brand/compliance/financial-disclaimer.md`. Run every finished draft against `brand/compliance/compliance-checklist.md` before saving. See `config/posting-rules.json` for report mode settings.

---

## 5. File Structure

```
brand/          Voice guide, hashtag sets, post templates, compliance/ rules
config/         Posting rules, watchlist, environment config
content/        drafts/ and published/YYYY-MM-DD/ archives
lib/            Custom TypeScript libraries (chart, posting, clients)
account_setup/  Setup docs and credential notes
docs/           Architecture, workflow, and reference docs
```

---

## 6. MCP Servers

| Server | Transport | Purpose |
|---|---|---|
| `tradingview-mcp` | Docker / SSE | Multi-agent analysis, signals, screener scans |
| `tradingview-screener` | npx / stdio | Market screener with 100+ queryable fields |
| `crypto-rss` | uvx / stdio | Aggregates 100+ crypto RSS feeds |
| `brave-search` | Already installed | Breaking news research and context |

---

## 7. Custom Libraries

Invoke directly: `pnpm exec tsx lib/<file>.ts`

| File | Key exports |
|---|---|
| `lib/post-manager.ts` | `saveDraft`, `listDrafts`, `listPublished`, `publishPost` |
| `lib/twitter-client.ts` | `createTwitterClient`, `postTweet`, `uploadMedia`, `postThread` |
| `lib/telegram-client.ts` | `createTelegramBot`, `postToChannel`, `sendDraft` |
| `lib/chart-capture.ts` | `buildChartUrl`, `captureChart` |

---

## 8. Credential Refresh

- **TradingView** — Open TradingView in browser > DevTools > Application tab > Cookies > copy `sessionid` and `sessionid_sign` > update `.env`.
- **X / Twitter** — If auth fails, regenerate access values at `developer.x.com` > Project > App > Keys and Tokens.
- **Telegram** — Bot credentials from @BotFather are long-lived and rarely need refresh.

---

## 9. Content Rules

Full rules: `config/posting-rules.json`

- **X:** 280 characters per tweet; use threads for longer TA (max 8 tweets per thread).
- **Telegram:** 4096 characters; single message with full chart attached.
- Always include `#QuantApexAI` hashtag.
- See `brand/hashtags.md` for full hashtag sets per content type.
