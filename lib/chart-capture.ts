import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

/** Map interval shorthand to TradingView format. */
function mapInterval(interval: string): string {
  const map: Record<string, string> = {
    '1h': '60',
    '4h': '240',
    '1d': 'D',
    '1w': 'W',
  };
  return map[interval] ?? interval;
}

/** Zero-pad a number to at least 2 digits. */
function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Format a Date as YYYYMMDD. */
function formatDate(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

/** Format a Date as HHmm. */
function formatTime(d: Date): string {
  return `${pad(d.getHours())}${pad(d.getMinutes())}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build a TradingView chart URL for the given ticker and interval.
 *
 * Example:
 *   buildChartUrl('BTC', '4h')  →  'https://www.tradingview.com/chart/?symbol=BTC&interval=240'
 */
export function buildChartUrl(ticker: string, interval: string): string {
  const tvInterval = mapInterval(interval);
  return `https://www.tradingview.com/chart/?symbol=${ticker}&interval=${tvInterval}`;
}

/** Minimal interface for the Playwright Browser type (for test injection). */
export interface BrowserLauncher {
  launch: (options?: Record<string, unknown>) => Promise<{
    newContext: () => Promise<{
      addCookies: (cookies: unknown[]) => Promise<void>;
      newPage: () => Promise<{
        goto: (url: string) => Promise<unknown>;
        waitForSelector: (selector: string, options?: Record<string, unknown>) => Promise<unknown>;
        screenshot: (options?: Record<string, unknown>) => Promise<unknown>;
        locator: (selector: string) => {
          count: () => Promise<number>;
          screenshot: (options?: Record<string, unknown>) => Promise<unknown>;
        };
      }>;
    }>;
    close: () => Promise<void>;
  }>;
}

/**
 * Capture a TradingView chart screenshot via Playwright.
 *
 * Returns the absolute file path on success, or null on ANY failure.
 * The `indicators` parameter is reserved for Phase 2 and is currently ignored.
 *
 * @param ticker   Ticker symbol (e.g. 'BTC')
 * @param interval Interval shorthand (e.g. '4h', '1d')
 * @param _indicators Reserved for Phase 2 — currently ignored
 * @param _launcher  Optional launcher override for testing
 */
export async function captureChart(
  ticker: string,
  interval: string,
  _indicators?: string[],
  _launcher?: BrowserLauncher,
): Promise<string | null> {
  const launcher = (_launcher ?? chromium) as BrowserLauncher;
  let browser;
  try {
    // 1. Launch chromium
    browser = await launcher.launch();

    // 2. Create browser context with TradingView session cookies
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: 'sessionid',
        value: process.env.TV_SESSION ?? '',
        domain: '.tradingview.com',
        path: '/',
      },
      {
        name: 'sessionid_sign',
        value: process.env.TV_SIGNATURE ?? '',
        domain: '.tradingview.com',
        path: '/',
      },
    ]);

    const page = await context.newPage();

    // 3. Navigate to the chart URL
    const url = buildChartUrl(ticker, interval);
    await page.goto(url);

    // 4. Wait for chart canvas to render
    await page.waitForSelector('canvas', { timeout: 15000 });

    // 4.5 Dismiss any promotional popups / modals / overlays
    // First try clicking close buttons
    const dismissSelectors = [
      '[data-dialog-name] button[aria-label="Close"]',
      '.tv-dialog__close',
      'button.close-button',
      '[class*="modalClose"]',
      '[data-role="toast-close"]',
      'button[aria-label="Close"]',
      'button[aria-label="Dismiss"]',
    ];
    for (const sel of dismissSelectors) {
      const btn = page.locator(sel).first();
      if (await btn.count() > 0) {
        await btn.click().catch(() => {});
        await new Promise<void>((r) => setTimeout(r, 300));
      }
    }
    // Press Escape multiple times as catch-all
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Escape');
      await new Promise<void>((r) => setTimeout(r, 300));
    }
    // Nuclear option: remove all overlays, modals, and popups from the DOM
    await page.evaluate(() => {
      const selectors = [
        '[class*="modal"]', '[class*="Modal"]',
        '[class*="popup"]', '[class*="Popup"]',
        '[class*="overlay"]', '[class*="Overlay"]',
        '[class*="dialog"]', '[class*="Dialog"]',
        '[class*="toast"]', '[class*="Toast"]',
        '[class*="banner"]', '[class*="Banner"]',
        '[class*="promo"]', '[class*="Promo"]',
        '[role="dialog"]',
        '[data-dialog-name]',
      ];
      for (const sel of selectors) {
        document.querySelectorAll(sel).forEach((el) => {
          // Don't remove chart-related elements
          if (!el.closest('.chart-container') && !el.closest('.chart-markup-table')) {
            (el as HTMLElement).style.display = 'none';
          }
        });
      }
      // Also remove any fixed/absolute positioned elements covering the viewport
      document.querySelectorAll('*').forEach((el) => {
        const style = window.getComputedStyle(el);
        if ((style.position === 'fixed' || style.position === 'absolute') &&
            parseInt(style.zIndex || '0') > 100 &&
            !el.closest('.chart-container') &&
            !el.closest('.chart-markup-table') &&
            !el.closest('#header-toolbar-symbol-search')) {
          (el as HTMLElement).style.display = 'none';
        }
      });
    });
    await new Promise<void>((r) => setTimeout(r, 500));

    // 5. Wait additional 3s for data to populate
    await new Promise<void>((resolve) => setTimeout(resolve, 3000));

    // 6. Screenshot the chart area, fall back to full page
    const now = new Date();
    const lowerTicker = ticker.toLowerCase();
    const filename = `${lowerTicker}-${interval}-${formatDate(now)}-${formatTime(now)}.png`;

    // 7. Save to content/charts/
    const chartsDir = path.join(PROJECT_ROOT, 'content', 'charts');
    fs.mkdirSync(chartsDir, { recursive: true });
    const filePath = path.join(chartsDir, filename);

    const chartLocator = page.locator('.chart-container');
    const count = await chartLocator.count();
    if (count > 0) {
      await chartLocator.screenshot({ path: filePath });
    } else {
      await page.screenshot({ path: filePath, fullPage: true });
    }

    // 8. Return file path
    return filePath;
  } catch (err) {
    console.error('[chart-capture] Failed to capture chart:', err);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
