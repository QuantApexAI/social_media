/**
 * data-card.ts
 * Renders HTML templates to 1600×900 PNG images via Playwright.
 *
 * Exports:
 *   renderDashboardCard(data, outputPath) → Promise<string>
 *   renderDataCard(template, data, outputPath) → Promise<string>
 *   DashboardData (type)
 *   CardData (type)
 */

import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DashboardData {
  date: string;
  btc: { price: string; change: string; direction: 'up' | 'down' | 'neutral' };
  alts: Array<{ ticker: string; price: string; change: string; direction: 'up' | 'down' | 'neutral' }>;
  fearGreed: { value: number; label: string };
  macro: Array<{ label: string; value: string; direction: 'up' | 'down' | 'neutral' }>;
  keyLevels: Array<{ ticker: string; support: string; resistance: string }>;
}

export interface CardData {
  title: string;
  items: Array<{ label: string; value: string; note: string }>;
}

// ---------------------------------------------------------------------------
// Template directory (relative to this file)
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'brand', 'templates', 'visuals');

// ---------------------------------------------------------------------------
// Helper: build inner HTML for each dashboard section
// ---------------------------------------------------------------------------

/**
 * Builds HTML for the alts list inside the Altcoins card.
 * Dashboard template uses `.alts-list` which contains these items.
 * We generate simple ticker rows matching the card's style.
 */
function buildAltsHtml(alts: DashboardData['alts']): string {
  return alts
    .map(
      (a) => `
        <div style="display:flex; align-items:center; gap:24px;">
          <div style="font-size:16px; font-weight:700; color:#f59e0b; min-width:60px; letter-spacing:1px;">${esc(a.ticker)}</div>
          <div style="font-size:22px; font-weight:700; flex:1;">${esc(a.price)}</div>
          <div style="font-size:18px; font-weight:600;" class="${a.direction === 'up' ? 'up' : a.direction === 'down' ? 'down' : ''}">${esc(a.change)}</div>
        </div>`,
    )
    .join('\n');
}

/**
 * Builds HTML for the macro grid items.
 * Template uses `.macro-card` with `.macro-ticker`, `.macro-price`, `.macro-change`.
 */
function buildMacroHtml(macro: DashboardData['macro']): string {
  return macro
    .map(
      (m) => `
        <div class="macro-card">
          <div class="macro-ticker">${esc(m.label)}</div>
          <div class="macro-price">${esc(m.value)}</div>
          <div class="macro-change ${m.direction === 'up' ? 'up' : m.direction === 'down' ? 'down' : ''}"></div>
        </div>`,
    )
    .join('\n');
}

/**
 * Builds HTML for the key levels row items.
 * Template uses `.levels-items` containing inline level chips.
 */
function buildLevelsHtml(levels: DashboardData['keyLevels']): string {
  return levels
    .map(
      (l) => `
        <div style="display:flex; gap:12px; align-items:center;">
          <span style="font-size:14px; font-weight:700; color:#f59e0b; letter-spacing:1px;">${esc(l.ticker)}</span>
          <span style="font-size:13px; color:#64748b;">S:</span>
          <span style="font-size:14px; font-weight:600; color:#22c55e;">${esc(l.support)}</span>
          <span style="font-size:13px; color:#64748b;">R:</span>
          <span style="font-size:14px; font-weight:600; color:#ef4444;">${esc(l.resistance)}</span>
        </div>`,
    )
    .join('\n');
}

// ---------------------------------------------------------------------------
// Helper: build inner HTML for generic CardData templates
// ---------------------------------------------------------------------------

/**
 * Builds comparison item rows.
 * Template uses `.item-card` with `.item-label`, `.item-value`, `.item-note`.
 */
function buildComparisonItemsHtml(items: CardData['items']): string {
  return items
    .map(
      (item) => `
        <div class="item-card">
          <div class="item-label">${esc(item.label)}</div>
          <div class="item-value">${esc(item.value)}</div>
          <div class="item-note">${esc(item.note)}</div>
        </div>`,
    )
    .join('\n');
}

/**
 * Builds key number cards.
 * Template uses `.number-card` with `.number-label`, `.number-value`, `.number-subtitle`.
 */
function buildKeyNumbersHtml(items: CardData['items']): string {
  return items
    .map(
      (item) => `
        <div class="number-card">
          <div class="number-label">${esc(item.label)}</div>
          <div class="number-value">${esc(item.value)}</div>
          <div class="number-subtitle">${esc(item.note)}</div>
        </div>`,
    )
    .join('\n');
}

/**
 * Builds signal list items.
 * Template uses `.signal-item` with `.dot` (green/red), `.signal-info`, `.signal-label`,
 * `.signal-note`, `.signal-value`.
 * Items with a non-empty note get a red dot; those without get a green dot.
 */
function buildSignalItemsHtml(items: CardData['items']): string {
  return items
    .map((item) => {
      const dotColor = item.note ? 'red' : 'green';
      return `
        <div class="signal-item">
          <div class="dot ${dotColor}"></div>
          <div class="signal-info">
            <div class="signal-label">${esc(item.label)}</div>
            <div class="signal-note">${esc(item.note)}</div>
          </div>
          <div class="signal-value">${esc(item.value)}</div>
        </div>`;
    })
    .join('\n');
}

// ---------------------------------------------------------------------------
// HTML escape helper
// ---------------------------------------------------------------------------

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// Core renderer: HTML string → PNG file
// ---------------------------------------------------------------------------

async function renderHtmlToPng(html: string, outputPath: string): Promise<string> {
  // Ensure output directory exists
  mkdirSync(dirname(outputPath), { recursive: true });

  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.screenshot({ path: outputPath, type: 'png' });
  } finally {
    await browser.close();
  }

  return outputPath;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Renders the market dashboard card from a DashboardData object.
 * Uses `brand/templates/visuals/dashboard.html`.
 */
export async function renderDashboardCard(
  data: DashboardData,
  outputPath: string,
): Promise<string> {
  const template = readFileSync(join(TEMPLATES_DIR, 'dashboard.html'), 'utf8');

  const html = template
    .replace('{{date}}', esc(data.date))
    .replace('{{btc_price}}', esc(data.btc.price))
    .replace('{{btc_change}}', esc(data.btc.change))
    .replace('{{btc_direction}}', data.btc.direction === 'up' ? 'up' : data.btc.direction === 'down' ? 'down' : '')
    .replace('{{alts_html}}', buildAltsHtml(data.alts))
    .replace('{{fg_value}}', String(data.fearGreed.value))
    .replace('{{fg_label}}', esc(data.fearGreed.label))
    .replace('{{macro_html}}', buildMacroHtml(data.macro))
    .replace('{{levels_html}}', buildLevelsHtml(data.keyLevels));

  return renderHtmlToPng(html, outputPath);
}

/**
 * Renders a generic data card using one of the three named templates.
 * Templates: 'comparison' | 'key-numbers' | 'signal-dashboard'
 */
export async function renderDataCard(
  template: 'comparison' | 'key-numbers' | 'signal-dashboard',
  data: CardData,
  outputPath: string,
): Promise<string> {
  const templateHtml = readFileSync(join(TEMPLATES_DIR, `${template}.html`), 'utf8');

  let itemsHtml: string;
  switch (template) {
    case 'comparison':
      itemsHtml = buildComparisonItemsHtml(data.items);
      break;
    case 'key-numbers':
      itemsHtml = buildKeyNumbersHtml(data.items);
      break;
    case 'signal-dashboard':
      itemsHtml = buildSignalItemsHtml(data.items);
      break;
  }

  const html = templateHtml
    .replace('{{title}}', esc(data.title))
    .replace('{{items_html}}', itemsHtml);

  return renderHtmlToPng(html, outputPath);
}
