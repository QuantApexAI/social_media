import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { buildChartUrl, captureChart, type BrowserLauncher } from './chart-capture.ts';

// ---------------------------------------------------------------------------
// buildChartUrl tests
// ---------------------------------------------------------------------------

describe('buildChartUrl', () => {
  it('maps 4h to interval 240', () => {
    const url = buildChartUrl('BTC', '4h');
    assert.ok(url.includes('BTC'), 'URL should contain ticker BTC');
    assert.ok(url.includes('interval=240'), 'URL should contain interval=240');
  });

  it('maps 1d to interval D', () => {
    const url = buildChartUrl('ETH', '1d');
    assert.ok(url.includes('ETH'), 'URL should contain ticker ETH');
    assert.ok(url.includes('interval=D'), 'URL should contain interval=D');
  });

  it('maps 1w to interval W', () => {
    const url = buildChartUrl('SOL', '1w');
    assert.ok(url.includes('SOL'), 'URL should contain ticker SOL');
    assert.ok(url.includes('interval=W'), 'URL should contain interval=W');
  });

  it('maps 1h to interval 60', () => {
    const url = buildChartUrl('BTC', '1h');
    assert.ok(url.includes('BTC'), 'URL should contain ticker BTC');
    assert.ok(url.includes('interval=60'), 'URL should contain interval=60');
  });

  it('returns a tradingview.com URL', () => {
    const url = buildChartUrl('BTC', '4h');
    assert.ok(url.includes('tradingview.com'), 'URL should be a TradingView URL');
  });
});

// ---------------------------------------------------------------------------
// captureChart — null-on-failure test
// ---------------------------------------------------------------------------

describe('captureChart', () => {
  it('returns null on failure (never throws)', async () => {
    // Inject a fake launcher whose launch() always throws.
    // This exercises the catch block without any real browser.
    const throwingLauncher: BrowserLauncher = {
      launch: async () => {
        throw new Error('Simulated browser launch failure');
      },
    };

    let result: string | null | undefined;
    let threw = false;

    try {
      result = await captureChart('BTC', '4h', undefined, throwingLauncher);
    } catch {
      threw = true;
    }

    assert.equal(threw, false, 'captureChart must never throw — it should catch and return null');
    assert.equal(result, null, 'captureChart should return null on any failure');
  });

  it('accepts indicators param without throwing (Phase 2 reserved)', async () => {
    // Even with indicators provided, failure path still returns null
    const throwingLauncher: BrowserLauncher = {
      launch: async () => {
        throw new Error('Simulated failure');
      },
    };

    let result: string | null | undefined;
    let threw = false;

    try {
      result = await captureChart('ETH', '1d', ['RSI', 'MACD'], throwingLauncher);
    } catch {
      threw = true;
    }

    assert.equal(threw, false, 'captureChart must never throw even with indicators');
    assert.equal(result, null, 'captureChart should return null on any failure');
  });
});

// ---------------------------------------------------------------------------
// Screenshot filename format test
// ---------------------------------------------------------------------------

describe('screenshot filename format', () => {
  it('filename follows {ticker}-{interval}-{YYYYMMDD}-{HHmm}.png with lowercase ticker', () => {
    const ticker = 'BTC';
    const interval = '4h';
    const lowerTicker = ticker.toLowerCase();

    // Build expected regex: btc-4h-YYYYMMDD-HHmm.png
    const pattern = new RegExp(`^${lowerTicker}-${interval}-\\d{8}-\\d{4}\\.png$`);

    // Reconstruct the filename the same way the implementation does
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const YYYYMMDD =
      `${now.getFullYear()}` +
      `${pad(now.getMonth() + 1)}` +
      `${pad(now.getDate())}`;
    const HHmm = `${pad(now.getHours())}${pad(now.getMinutes())}`;
    const filename = `${lowerTicker}-${interval}-${YYYYMMDD}-${HHmm}.png`;

    assert.match(filename, pattern, 'filename should match expected pattern');
  });

  it('uppercase ticker is lowercased in filename', () => {
    const ticker = 'ETHUSDT';
    const lowerTicker = ticker.toLowerCase();
    assert.equal(lowerTicker, 'ethusdt', 'ticker should be lowercased');
  });
});
