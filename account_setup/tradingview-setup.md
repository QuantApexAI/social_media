# TradingView Chart Capture Setup Guide

This guide walks you through configuring TradingView session cookies for automated chart screenshots via Playwright.

---

## Prerequisites

- A TradingView account (Ultimate plan recommended for full chart access)
- Google Chrome or a Chromium-based browser
- The `.env` file in the project root (copy from `.env.example` if not created)

---

## Step 1: Sign In to TradingView

1. Open [tradingview.com](https://www.tradingview.com) in your browser
2. Sign in with your TradingView account
3. Open any chart to confirm you're fully logged in (e.g., navigate to a BTC/USD chart)

---

## Step 2: Open Browser DevTools

1. Press **F12** (or **Cmd + Option + I** on Mac) to open Developer Tools
2. Click the **Application** tab at the top of the DevTools panel
   - In Firefox, this is called the **Storage** tab

---

## Step 3: Find the Session Cookies

1. In the left sidebar of the Application tab, expand **Cookies**
2. Click on `https://www.tradingview.com`
3. You'll see a list of cookies. Find these two:

| Cookie Name | What it is |
|-------------|-----------|
| `sessionid` | Your TradingView session identifier |
| `sessionid_sign` | Cryptographic signature for the session |

4. Click on each cookie row to see its full value at the bottom of the panel

---

## Step 4: Copy Values to `.env`

Copy each cookie value and add them to your `.env` file:

```
TV_SESSION=<sessionid cookie value>
TV_SIGNATURE=<sessionid_sign cookie value>
```

The values are long alphanumeric strings. Make sure you copy the complete value with no trailing spaces.

---

## Step 5: Verify

Run the smoke test to confirm Chart Capture is configured:

```bash
pnpm smoke
```

Expected output:
```
Chart Capture:    CONFIGURED
```

---

## Refreshing Cookies

TradingView session cookies expire periodically (typically hours to days, depending on TradingView's rotation schedule). When chart capture starts failing, you need to refresh them.

### How to tell cookies have expired

- Chart capture returns `null` (Claude warns "chart capture failed, posting text-only")
- Playwright screenshots show a TradingView login page instead of a chart

### How to refresh

1. Open TradingView in your browser and confirm you're logged in
2. Repeat Steps 2-4 above (DevTools > Application > Cookies > copy new values)
3. Update `TV_SESSION` and `TV_SIGNATURE` in `.env`
4. No restart needed — the next chart capture will use the new values

### Tips to extend cookie lifetime

- Keep a TradingView tab open in your browser — active sessions last longer
- Avoid signing out of TradingView in the browser (signing out invalidates the session)
- If cookies expire very frequently, try using a Chrome profile dedicated to TradingView

---

## How Chart Capture Works

The `lib/chart-capture.ts` library uses these cookies to:

1. Launch a headless Chromium browser via Playwright
2. Inject `sessionid` and `sessionid_sign` as cookies on the `.tradingview.com` domain
3. Navigate to a TradingView chart URL with the specified ticker and timeframe
4. Wait for the chart to render
5. Take a screenshot and save it to `content/charts/`

This gives you the same chart view as your logged-in TradingView session, including your Ultimate plan features (all indicators, timeframes, and chart types).

---

## Troubleshooting

### Smoke test shows MISSING_CREDENTIALS
- Verify both `TV_SESSION` and `TV_SIGNATURE` are in your `.env` file
- Check for typos in the variable names
- Ensure the values are not wrapped in quotes (paste the raw value only)

### Screenshots show a login page
- Your session cookies have expired — refresh them (see above)
- Verify you copied the correct cookies (`sessionid` and `sessionid_sign`, not other cookies)

### Screenshots are blank or incomplete
- The chart may not have finished loading — this is handled by the wait logic in `lib/chart-capture.ts`
- Check your internet connection
- Try capturing a common ticker (e.g., BTC/USD) to rule out ticker-specific issues

### Playwright browser fails to launch
- Ensure Chromium is installed: `pnpm exec playwright install chromium`
- Check that no other process is blocking headless browser execution
