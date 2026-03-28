# Getting Started with QuantApexAI Social Media

This guide walks you through going from "accounts set up" to "posting content."

---

## 1. Prerequisites Checklist

Before your first post, verify everything is in place:

- [ ] **X Developer account** configured — see [x-developer-setup.md](./x-developer-setup.md)
- [ ] **Telegram channel + bot** configured — see [telegram-setup.md](./telegram-setup.md)
- [ ] **TradingView chart capture** configured — see [tradingview-setup.md](./tradingview-setup.md)
- [ ] **`.env` file** populated with all 9 credentials (copy from `.env.example`):
  - `X_CONSUMER`, `X_CONSUMER_PAIR`, `X_ACCESS`, `X_ACCESS_PAIR`
  - `TG_BOT`, `TG_CHANNEL`, `TG_APPROVAL_USER`
  - `TV_SESSION`, `TV_SIGNATURE`
- [ ] **Dependencies installed** — run `pnpm install` if not already done
- [ ] **Smoke test passing** — run `pnpm smoke` and verify all components show OK or CONFIGURED

If the smoke test shows MISSING_CREDENTIALS for any component, go back and fill in the corresponding `.env` values.

---

## 2. Your First Post (Step-by-Step)

### Step 1: Open Claude Code

```bash
cd /Users/plamensavchev/Development/QuantApex/social_media
claude
```

### Step 2: Draft posts

Type:
```
Draft today's posts
```

Claude will:
1. Fetch market data via TradingView MCP servers (prices, signals, top movers)
2. Scan crypto RSS feeds and news for notable events
3. Capture TradingView chart screenshots for key setups
4. Compose posts following the brand voice guide and compliance rules
5. Run compliance validation (checks for financial advice language, X ToS, etc.)
6. Save drafts to `content/drafts/` and send previews to your Telegram DM

### Step 3: Review drafts

Check your Telegram for draft previews. Then back in Claude Code:

- **Approve all:** Type `publish all`
- **Approve specific:** Type `publish 1,3` (by draft number)
- **Request changes:** Type feedback like "make the BTC post more concise" or "remove the SOL section"
- **Check compliance:** Type `show full compliance` to see the detailed compliance report

### Step 4: Publish

Once you approve, Claude publishes to both X and the Telegram channel automatically. A safety-net hook runs a final compliance check before each post goes out.

Published posts are archived to `content/published/YYYY-MM-DD/`.

---

## 3. Quick Command Reference

| Command | What it does |
|---------|-------------|
| `Draft today's posts` | Full workflow: data fetch, charts, compose, compliance check, Telegram preview |
| `What's moving today?` | Scans market data and news, gives you a summary — no drafts created |
| `Capture BTC 4H chart` | Takes a single TradingView chart screenshot |
| `Post about [topic]` | Compose a single reactive post (e.g., "Post about ETH breaking $4K") |
| `Publish all` | Publish all approved drafts to X + Telegram |
| `Publish 1,3` | Publish specific drafts by number |
| `Show full compliance` | Display detailed compliance report for current drafts |
| `Repost yesterday's TA with updated levels` | Reads from published archive, updates numbers |

---

## 4. Daily Workflow Tips

### When to post
- **Morning recap** — Post a Market Pulse after major markets open (crypto is 24/7, but traditional markets add context)
- **TA posts** — Post when you spot a notable setup on TradingView, or when Claude identifies one via the MCP servers
- **Breaking events** — Reactive posts for major moves, protocol upgrades, regulatory news, or significant AI developments
- **Flexible frequency** — More during volatile days, less during quiet ones. No fixed schedule required.

### Refreshing TradingView cookies
TV session cookies expire periodically. When chart capture starts failing:
1. Open TradingView in your browser (make sure you're logged in)
2. Open DevTools (F12) > Application tab > Cookies > `www.tradingview.com`
3. Copy the values for `sessionid` and `sessionid_sign`
4. Update `TV_SESSION` and `TV_SIGNATURE` in your `.env` file
5. Chart capture will work again immediately — no restart needed

### Checking post history
- Browse `content/published/` — organized by date (`YYYY-MM-DD/`)
- Each published post is a markdown file with YAML frontmatter (title, type, platforms, tickers, timestamps)
- Use `ls content/published/` to see which days have posts

### Compliance report modes
- Default: warnings-only (you only see issues)
- Full report: type `show full compliance` to see every check
- Configure in `config/posting-rules.json` under `compliance.reportMode`

---

## 5. Troubleshooting

### Chart capture failing
- **Cause:** TradingView session cookies expired
- **Fix:** Refresh cookies (see "Refreshing TradingView cookies" above)
- **Fallback:** Posts will go out text-only. Claude warns you when chart capture fails.

### X/Twitter rate limit errors
- **Cause:** Free tier allows 1,500 tweets/month and 50 requests per 15 minutes
- **Fix:** Wait for the rate limit window to reset (error message includes retry-after time)
- **Prevention:** The compliance checklist enforces minimum 15-minute spacing between posts

### Compliance FAIL blocking a post
- **Cause:** Post contains directive financial language, guaranteed outcomes, or X ToS violations
- **Fix:** Claude shows the specific violation and suggests a rewrite. Edit the draft and re-run compliance.
- **Example:** "you should buy BTC" → reframe as "watching for a move above $91K"

### Telegram bot not sending previews
- **Cause:** Bot not added as channel admin, or wrong channel/user ID in `.env`
- **Fix:** Verify `TG_CHANNEL` and `TG_APPROVAL_USER` values. Re-check the bot's admin permissions in the channel settings.

### Smoke test showing MISSING_CREDENTIALS
- **Cause:** `.env` file is missing or incomplete
- **Fix:** Compare your `.env` against `.env.example`. Fill in any empty values following the setup guides.

### MCP servers not responding
- **tradingview-mcp:** Requires Docker running. Check with `docker ps`. Start with `docker run --rm -p 8080:8000 atilaahmet/tradingview-mcp:latest`
- **tradingview-screener / crypto-rss:** These auto-start via npx/uvx. If they fail, check your internet connection and try again.
