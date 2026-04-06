/**
 * generate-logo.ts
 * Uses Playwright to render a text-based placeholder logo "QuantApexAI"
 * (with "AI" in #6366f1 accent color) to PNG files:
 *   brand/assets/logo-light.png  — white text on transparent background
 *   brand/assets/logo-dark.png   — dark text on transparent background
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(__dirname, '../brand/assets');

const WIDTH = 480;
const HEIGHT = 120;

function buildHtml(textColor: string, backgroundColor: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: ${WIDTH}px;
      height: ${HEIGHT}px;
      background: ${backgroundColor};
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    }
    .logo {
      display: flex;
      align-items: baseline;
      gap: 0;
      letter-spacing: -0.02em;
    }
    .name {
      font-size: 42px;
      font-weight: 700;
      color: ${textColor};
    }
    .accent {
      font-size: 42px;
      font-weight: 800;
      color: #6366f1;
    }
  </style>
</head>
<body>
  <div class="logo">
    <span class="name">QuantApex</span><span class="accent">AI</span>
  </div>
</body>
</html>`;
}

async function renderLogo(
  html: string,
  outputPath: string,
  transparent: boolean
): Promise<void> {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
  });
  const page = await context.newPage();

  await page.setContent(html, { waitUntil: 'networkidle' });

  await page.screenshot({
    path: outputPath,
    type: 'png',
    omitBackground: transparent,
  });

  await browser.close();
  console.log(`Written: ${outputPath}`);
}

async function main() {
  // logo-light.png: white text on transparent background
  const lightHtml = buildHtml('#ffffff', 'transparent');
  await renderLogo(
    lightHtml,
    path.join(assetsDir, 'logo-light.png'),
    true
  );

  // logo-dark.png: dark text (#0f172a) on transparent background
  const darkHtml = buildHtml('#0f172a', 'transparent');
  await renderLogo(
    darkHtml,
    path.join(assetsDir, 'logo-dark.png'),
    true
  );

  console.log('Logo generation complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
