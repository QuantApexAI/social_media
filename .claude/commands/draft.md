Draft today's posts using the full daily workflow:

1. **Fetch data** — Query MCP servers: TradingView multi-agent analysis for BTC, ETH, SOL; TradingView screener for top movers; Brave search for breaking crypto/macro/AI news. Check for newsworthy triggers per `config/posting-rules.json` > `postingCriteria`. If no triggers found, report to user and stop.

2. **Generate visuals** — For Market Pulse: generate a branded dashboard card via `lib/data-card.ts`. For TA posts: capture chart via `lib/chart-capture.ts`, then annotate with key levels and watermark via `lib/chart-annotate.ts`. For Macro/News: generate the appropriate data card (comparison, key-numbers, or signal-dashboard). Save all visuals to `content/charts/`.

3. **Compose posts** — Follow the updated templates in `brand/templates/` and voice guide in `brand/voice-guide.md`:
   - **X threads: 5 tweets** — (1) short narrative hook 80-140 chars + visual attached, (2) BTC + headline data, (3) alts + macro, (4) prioritization take woven naturally, (5) debatable question + key levels
   - **Telegram** — HTML formatting: `<b>` for headers/key numbers, `<i>` for the prioritization take. End with reaction prompt: "Your outlook? React below."
   - **Hashtags** — Max 2 per tweet on X. Inline ticker on first mention. Footer: `#Crypto` for market/TA, topic-specific tag for macro/news (`#Oil`, `#Iran`, `#Fed`, etc.), `#Tech` for AI roundups.
   - **Prioritization take** — Every post includes at least one sentence of editorial prioritization ("this matters more than that"), varied phrasing, never a fixed label.
   - **Engagement close** — Every X thread ends with a debatable binary question flowing from the take.

4. **Compliance validation** — Run each draft against `brand/compliance/compliance-checklist.md`. FAIL blocks publishing.

5. **Save drafts** — Write to `content/drafts/` with `chartPath` in frontmatter pointing to the generated visual. Send previews to user's Telegram DM.

6. **Present drafts** — Show drafts to user for review. Wait for approval ("publish all", "publish 1,3", or feedback for revision).
