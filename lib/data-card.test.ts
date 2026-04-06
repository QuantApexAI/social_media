import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

import {
  renderDashboardCard,
  renderDataCard,
  type DashboardData,
  type CardData,
} from './data-card.ts';

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const FIXTURES_DIR = join(import.meta.dirname, '..', 'test-fixtures');

const sampleDashboard: DashboardData = {
  date: 'April 6, 2026',
  btc: { price: '$83,200', change: '+2.4%', direction: 'up' },
  alts: [
    { ticker: 'ETH', price: '$1,840', change: '-1.1%', direction: 'down' },
    { ticker: 'SOL', price: '$128', change: '+3.2%', direction: 'up' },
    { ticker: 'BNB', price: '$590', change: '0.0%', direction: 'neutral' },
  ],
  fearGreed: { value: 42, label: 'Fear' },
  macro: [
    { label: 'S&P 500', value: '5,210', direction: 'up' },
    { label: 'DXY', value: '104.2', direction: 'down' },
    { label: 'Gold', value: '$3,120', direction: 'up' },
    { label: '10Y Yield', value: '4.32%', direction: 'neutral' },
  ],
  keyLevels: [
    { ticker: 'BTC', support: '$80,000', resistance: '$86,000' },
    { ticker: 'ETH', support: '$1,750', resistance: '$2,000' },
  ],
};

const sampleCard: CardData = {
  title: 'Test Card',
  items: [
    { label: 'Item A', value: '$1.2T', note: 'Some context' },
    { label: 'Item B', value: '42%', note: 'Another note' },
    { label: 'Item C', value: '7.8x', note: '' },
  ],
};

// Track output files for cleanup
const outputFiles: string[] = [];

afterEach(() => {
  for (const f of outputFiles) {
    if (existsSync(f)) rmSync(f);
  }
  outputFiles.length = 0;
});

// ---------------------------------------------------------------------------
// renderDashboardCard
// ---------------------------------------------------------------------------

describe('renderDashboardCard', () => {
  it('generates a 1600x900 PNG from sample dashboard data', async () => {
    const outputPath = join(FIXTURES_DIR, 'test-dashboard.png');
    outputFiles.push(outputPath);

    const result = await renderDashboardCard(sampleDashboard, outputPath);

    assert.equal(result, outputPath, 'should return the output path');
    assert.ok(existsSync(result), 'output file should exist');

    const meta = await sharp(result).metadata();
    assert.equal(meta.format, 'png', 'output should be PNG format');
    assert.equal(meta.width, 1600, 'width should be 1600px');
    assert.equal(meta.height, 900, 'height should be 900px');
  });
});

// ---------------------------------------------------------------------------
// renderDataCard — key-numbers template
// ---------------------------------------------------------------------------

describe("renderDataCard with 'key-numbers' template", () => {
  it('generates a valid 1600x900 PNG', async () => {
    const outputPath = join(FIXTURES_DIR, 'test-key-numbers.png');
    outputFiles.push(outputPath);

    const result = await renderDataCard('key-numbers', sampleCard, outputPath);

    assert.equal(result, outputPath, 'should return the output path');
    assert.ok(existsSync(result), 'output file should exist');

    const meta = await sharp(result).metadata();
    assert.equal(meta.format, 'png', 'output should be PNG format');
    assert.equal(meta.width, 1600, 'width should be 1600px');
    assert.equal(meta.height, 900, 'height should be 900px');
  });
});

// ---------------------------------------------------------------------------
// renderDataCard — comparison template
// ---------------------------------------------------------------------------

describe("renderDataCard with 'comparison' template", () => {
  it('generates a valid PNG', async () => {
    const outputPath = join(FIXTURES_DIR, 'test-comparison.png');
    outputFiles.push(outputPath);

    const result = await renderDataCard('comparison', sampleCard, outputPath);

    assert.equal(result, outputPath, 'should return the output path');
    assert.ok(existsSync(result), 'output file should exist');

    const meta = await sharp(result).metadata();
    assert.equal(meta.format, 'png', 'output should be PNG format');
    assert.equal(meta.width, 1600, 'width should be 1600');
    assert.equal(meta.height, 900, 'height should be 900');
  });
});

// ---------------------------------------------------------------------------
// renderDataCard — signal-dashboard template
// ---------------------------------------------------------------------------

describe("renderDataCard with 'signal-dashboard' template", () => {
  it('generates a valid PNG', async () => {
    const outputPath = join(FIXTURES_DIR, 'test-signal-dashboard.png');
    outputFiles.push(outputPath);

    const result = await renderDataCard('signal-dashboard', sampleCard, outputPath);

    assert.equal(result, outputPath, 'should return the output path');
    assert.ok(existsSync(result), 'output file should exist');

    const meta = await sharp(result).metadata();
    assert.equal(meta.format, 'png', 'output should be PNG format');
    assert.equal(meta.width, 1600, 'width should be 1600');
    assert.equal(meta.height, 900, 'height should be 900');
  });
});
