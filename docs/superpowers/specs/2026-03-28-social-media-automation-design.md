# QuantApexAI Social Media Automation — Design Spec

**Date:** 2026-03-28
**Status:** Approved
**Author:** Claude + Plamen Savchev

## Overview

A semi-automated social media posting system for the QuantApexAI brand, operated from the `social_media/` repo via Claude Code. Claude drafts posts using market data and news, sends drafts to a private Telegram chat for approval, and publishes approved posts to X (Twitter) and a Telegram channel.

## Goals

- Post daily market recaps and technical analysis for crypto, stocks, and forex
- Cover major AI developments
- Maintain a professional, data-driven, community-friendly brand voice
- Keep credential-handling code fully auditable (no third-party MCP for sensitive ops)
- Support future expansion to more accounts and platforms

## Architecture

### Trust-Tiered Approach

MCP servers handle read-only public data. Custom TypeScript handles all credential-touching and publishing operations.

| Layer | Tool | Type | Rationale |
|-------|------|------|-----------|
| Market Analysis | `atilaahmettaner/tradingview-mcp` | MCP (no creds) | 470 stars, public data, multi-agent analysis with BUY/SELL signals |
| Market Screening | `fiale-plus/tradingview-mcp-server` | MCP (no creds) | 100+ screening fields, public scanner API |
| News Feed | `kukapay/crypto-rss-mcp` | MCP (no creds) | 100+ crypto RSS feeds, keyword filtering |
| News Search | `brave-search` MCP | Already installed | Breaking news research |
| Chart Capture | Custom `lib/chart-capture.ts` | Own code (Playwright) | Uses TV session cookies, fully auditable |
| X/Twitter Posting | Custom `lib/twitter-client.ts` | Own code (twitter-api-v2) | Handles posting credentials, fully auditable |
| Telegram Posting | Custom `lib/telegram-client.ts` | Own code (Telegraf) | Bot credentials, channel posting + approval flow |

### Directory Structure

```
social_media/
├── .claude/
│   ├── .mcp.json              # MCP server configurations
│   ├── settings.json
│   └── settings.local.json
├── CLAUDE.md                  # Project instructions, workflows, brand voice guide
├── account_setup/
│   ├── x-developer-setup.md   # Step-by-step X Developer account setup
│   └── telegram-setup.md      # Step-by-step Telegram channel + bot setup
├── brand/
│   ├── voice-guide.md         # Tone, style, dos/don'ts
│   ├── hashtags.md            # Standard hashtag sets by content type
│   └── templates/
│       ├── market-recap.md    # Template for daily market recaps
│       └── technical-analysis.md  # Template for TA posts
├── content/
│   ├── drafts/                # Pending drafts (markdown + chart refs)
│   ├── published/             # Archive of published posts (by date)
│   └── charts/                # Generated chart images
├── config/
│   ├── watchlist.json         # Coins/indices to track
│   └── posting-rules.json     # Frequency rules, platform-specific limits
├── lib/
│   ├── twitter-client.ts      # X/Twitter posting wrapper
│   ├── telegram-client.ts     # Telegram bot + channel posting
│   ├── chart-capture.ts       # TradingView chart screenshots
│   └── post-manager.ts        # Draft/publish lifecycle management
├── x/                         # X-specific assets if needed
├── .env                       # Credentials (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
└── docs/
    └── superpowers/
        └── specs/
```

## MCP Server Configuration

Three read-only MCP servers added to `.claude/.mcp.json`:

### tradingview-mcp (Docker, SSE)

Multi-agent financial analysis. Tools: `multi_agent_analysis`, `coin_analysis`, `top_gainers`, `top_losers`, `bollinger_scan`, `rating_filter`. Runs in Docker for filesystem isolation.

### tradingview-screener (npx, stdio)

Market screener with 100+ fields across stocks, forex, crypto, ETFs. Tools: `screen_crypto`, `screen_stocks`, `lookup_symbols`. 14 pre-built strategies.

### crypto-rss (uvx, stdio)

100+ crypto RSS feeds. Tools: `get_crypto_rss_list`, `get_rss_feed`, `analyze_rss_feed`. Keyword filtering and AI trend analysis.

## Custom TypeScript Libraries

### lib/twitter-client.ts (~80 lines)

Thin wrapper around `twitter-api-v2` using OAuth 1.0a.

- `postTweet(text, mediaPath?)` — single tweet with optional image
- `postThread(tweets[])` — multi-tweet thread for longer TA
- `uploadMedia(imagePath)` — upload chart image, return media ID

### lib/telegram-client.ts (~120 lines)

Uses `telegraf` with Bot API (not MTProto).

- `postToChannel(channelId, text, imagePath?)` — publish to @QuantApexAI channel
- `sendDraft(userId, draft)` — send draft to private chat for review
- `listenForApproval(callback)` — long-poll for approval reply

### lib/chart-capture.ts (~100 lines)

Uses `playwright` to screenshot TradingView charts.

- `captureChart(ticker, interval, indicators?)` — navigate to chart URL, wait for render, screenshot
- Saves to `content/charts/` with timestamped filename
- Uses TV session cookies from `.env` (refreshed manually when expired)

### lib/post-manager.ts (~60 lines)

Draft and publish lifecycle.

- `saveDraft(post)` — write to `content/drafts/` as markdown with frontmatter
- `publishPost(draftPath)` — post to X + Telegram, move to `content/published/`
- `listDrafts()` / `listPublished(date?)` — browse history

## Workflow

### Daily Posting Flow

1. User opens Claude Code in `social_media/`, says "draft today's posts"
2. Claude fetches data via MCP servers (TradingView analysis, screener scans, RSS news, Brave search)
3. Claude captures charts via `lib/chart-capture.ts` (Playwright + TV session)
4. Claude composes posts using `brand/voice-guide.md` and `brand/templates/`
5. Drafts saved to `content/drafts/` AND sent to user's private Telegram via `lib/telegram-client.ts`
6. User reviews on phone, replies "approve", "approve 1,3", or gives feedback
7. Claude publishes approved posts to X + Telegram channel
8. Published posts archived to `content/published/YYYY-MM-DD/`

### Quick Flows

- `"Post about BTC hitting 90k"` — single reactive post, sent for approval
- `"What's moving today?"` — data summary without drafting posts
- `"Repost yesterday's TA with updated levels"` — reads from published archive, updates

## Content Strategy

### Brand Voice: QuantApexAI

Analytical authority with community warmth. "The smart friend who works at a trading desk."

**Do:** Lead with data and levels. Explain the "why." Acknowledge uncertainty. Use clean formatting. Credit sources.

**Don't:** Hype or shill. Give financial advice. Be overly bearish/bullish. Wall of text. Claim predictions as certainties.

### Phase 1 Content Types (Starting Now)

#### A) Daily Market Recap — 1x/day

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

#### B) Technical Analysis — 1-3x/day, when setups appear

```
BTC 4H Analysis

Rising wedge forming since Mar 22. RSI divergence
on the 4H — price making higher highs, RSI making lower highs.

Key observations:
- Wedge support: $88,200
- Wedge resistance: $91,000
- Volume declining into the wedge (bearish)
- MACD histogram fading

Watching for a break below $88,200 for confirmation.
Invalidation above $91,500.

[Chart Image]

#BTC #TechnicalAnalysis #CryptoTrading #QuantApexAI
```

### Platform Differences

- **X:** Concise, 280-char aware, thread for longer TA
- **Telegram:** Longer format, full chart + detailed commentary in one message

### Hashtag Sets

- Market recap: `#Crypto #BTC #ETH #MarketUpdate #QuantApexAI`
- TA posts: `#TechnicalAnalysis #CryptoTrading #QuantApexAI` + coin-specific
- AI news: `#AI #ArtificialIntelligence #Tech #QuantApexAI`

### Phase 2 (Future Expansion)

- C) Fundamental analysis / news commentary
- D) Trading signals with entry/exit/risk levels
- E) Educational threads
- F) AI development coverage

## Configuration

### config/watchlist.json

```json
{
  "crypto": ["BTC", "ETH", "SOL", "XRP", "BNB", "ADA", "AVAX", "DOT", "LINK", "MATIC"],
  "indices": ["SPX", "NDX"],
  "forex": ["DXY"],
  "custom": []
}
```

### config/posting-rules.json

```json
{
  "platforms": {
    "x": { "maxLength": 280, "threadMaxTweets": 8, "mediaTypes": ["png", "jpg"] },
    "telegram": { "maxLength": 4096, "mediaTypes": ["png", "jpg", "gif"] }
  },
  "defaults": {
    "postToBoth": true,
    "includeHashtags": true,
    "includeChart": true
  }
}
```

### Credentials (.env, gitignored)

The `.env` file stores all sensitive credentials. See `account_setup/` guides for how to obtain each value. Required credentials:

- **X/Twitter:** Four OAuth 1.0a values from the X Developer Portal (consumer pair + access pair)
- **Telegram:** Bot token from BotFather, channel ID, and your personal user ID for approval DMs
- **TradingView:** Two session cookie values from your browser (session ID + signature)

## Dependencies

```json
{
  "dependencies": {
    "twitter-api-v2": "^1.x",
    "telegraf": "^4.x",
    "playwright": "^1.x",
    "dotenv": "^16.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/node": "^22.x"
  }
}
```

## Account Setup Required

Step-by-step guides will be created in `account_setup/`:

1. **X Developer Account** — Apply at developer.x.com, create project + app, generate OAuth 1.0a credentials, configure for read+write
2. **Telegram** — Create @QuantApexAI channel, create bot via BotFather, add bot as channel admin, get your user ID for approval DMs

## Security Considerations

- MCP servers are read-only, no credentials passed
- All credential-handling code is custom TypeScript, fully auditable
- `.env` is gitignored, never committed
- TV session cookies are short-lived, refreshed manually
- Telegram bot uses official Bot API (not MTProto account access)
- X posting uses OAuth 1.0a with scoped app permissions
- Docker isolates the tradingview-mcp process

## Future Evolution Path

- **Phase 2 content:** Add fundamental analysis, trading signals, educational content, AI news
- **More accounts:** Add additional brand accounts by extending config
- **Automation (Approach B):** Add persistent draft queue + Telegram webhook server for approval flow independent of Claude session
- **Scheduling:** Add cron-based triggers for morning market recaps
- **Analytics:** Track engagement via MongoDB, optimize content strategy
