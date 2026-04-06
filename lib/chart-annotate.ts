import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LevelAnnotation {
  /** Price value shown on the chart level line. */
  price: number;
  /** Short label drawn next to the line (e.g. "Support", "Resistance"). */
  label: string;
  /** Colour category: up = green, down = red, neutral = slate. */
  color: 'up' | 'down' | 'neutral';
}

export interface AnnotationOptions {
  /** Absolute path to a watermark PNG (logo). Optional. */
  watermarkPath?: string;
  /** Key price levels to draw as horizontal dashed lines. */
  levels: LevelAnnotation[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLOR_MAP: Record<LevelAnnotation['color'], string> = {
  up: '#22c55e',
  down: '#ef4444',
  neutral: '#64748b',
};

/** Fraction of image width used as watermark width. */
const WATERMARK_WIDTH_RATIO = 0.12;

/** Opacity applied to the watermark (0–255). */
const WATERMARK_OPACITY = 153; // ~60% of 255

// ---------------------------------------------------------------------------
// SVG builder
// ---------------------------------------------------------------------------

/**
 * Build an SVG overlay that draws horizontal dashed lines with price labels
 * for every level annotation.
 *
 * Coordinate system: full image width × height.
 * Levels are evenly distributed top→bottom (sorted by price descending so
 * higher prices appear higher on a typical chart).
 */
function buildLevelsSvg(
  width: number,
  height: number,
  levels: LevelAnnotation[],
): Buffer {
  if (levels.length === 0) {
    // Return a 1×1 transparent SVG — callers must not composite this.
    return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"></svg>`);
  }

  // Sort levels highest price → lowest price (top of chart → bottom).
  const sorted = [...levels].sort((a, b) => b.price - a.price);

  // Reserve 10% padding at top and bottom so lines don't touch edges.
  const topPad = height * 0.1;
  const bottomPad = height * 0.1;
  const usableHeight = height - topPad - bottomPad;
  const step = levels.length > 1 ? usableHeight / (levels.length - 1) : usableHeight / 2;

  const LABEL_BOX_W = 160;
  const LABEL_BOX_H = 28;
  const FONT_SIZE = 15;
  const DASH = '8,5';
  const LINE_W = 2;
  const LABEL_PADDING_RIGHT = 12;

  const lines = sorted.map((lvl, idx) => {
    const y = topPad + idx * (levels.length > 1 ? step : usableHeight / 2);
    const color = COLOR_MAP[lvl.color];
    const labelX = width - LABEL_BOX_W - LABEL_PADDING_RIGHT;
    const labelY = y - LABEL_BOX_H / 2;

    return `
      <line
        x1="0" y1="${y}" x2="${width}" y2="${y}"
        stroke="${color}" stroke-width="${LINE_W}"
        stroke-dasharray="${DASH}" opacity="0.85"
      />
      <rect
        x="${labelX}" y="${labelY}"
        width="${LABEL_BOX_W}" height="${LABEL_BOX_H}"
        rx="4" ry="4"
        fill="${color}" opacity="0.85"
      />
      <text
        x="${labelX + LABEL_BOX_W / 2}" y="${labelY + LABEL_BOX_H / 2 + FONT_SIZE / 2 - 2}"
        font-family="monospace" font-size="${FONT_SIZE}" fill="white"
        text-anchor="middle" dominant-baseline="auto"
      >${lvl.label} ${lvl.price.toLocaleString()}</text>
    `;
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    ${lines.join('\n')}
  </svg>`;

  return Buffer.from(svg);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Annotate a chart image with optional key-level overlays and a watermark.
 *
 * - Reads `inputPath` with sharp (throws ENOENT naturally if file is missing).
 * - Composites an SVG overlay for each price level.
 * - Composites a resized, semi-transparent watermark in the bottom-right corner.
 * - If no overlays are needed, copies the file as PNG.
 *
 * @param inputPath  Absolute path to the source PNG.
 * @param outputPath Absolute path for the annotated output PNG.
 * @param options    Annotation options (levels + optional watermark path).
 * @returns          Resolves to `outputPath` on success.
 */
export async function annotateChart(
  inputPath: string,
  outputPath: string,
  options: AnnotationOptions,
): Promise<string> {
  const { levels = [], watermarkPath } = options;

  // Ensure output directory exists.
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  // Read input — sharp will throw ENOENT if file does not exist.
  const meta = await sharp(inputPath).metadata();
  const width = meta.width ?? 1600;
  const height = meta.height ?? 900;

  // Build composite layers array.
  const composites: sharp.OverlayOptions[] = [];

  // 1. SVG levels overlay.
  if (levels.length > 0) {
    const svgBuffer = buildLevelsSvg(width, height, levels);
    composites.push({ input: svgBuffer, top: 0, left: 0 });
  }

  // 2. Watermark in bottom-right corner.
  if (watermarkPath) {
    const wmWidth = Math.round(width * WATERMARK_WIDTH_RATIO);

    // Resize watermark, apply opacity by premultiplying alpha.
    const wmBuffer = await sharp(watermarkPath)
      .resize(wmWidth)
      .ensureAlpha()
      // Multiply the alpha channel by WATERMARK_OPACITY/255
      .recomb([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ])
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Re-encode with modified opacity using linear() on alpha channel via compositing.
    // Simpler approach: just resize + use blend mode with raw alpha adjustment.
    // We use the ensureAlpha + modulate approach supported by sharp.
    const wmResized = await sharp(watermarkPath)
      .resize(wmWidth)
      .ensureAlpha()
      .png()
      .toBuffer();

    // Apply opacity by compositing on a transparent background.
    const wmMeta = await sharp(wmResized).metadata();
    const wmH = wmMeta.height ?? 30;

    // Build transparent canvas the same size as watermark, then flatten with opacity.
    const opacityWm = await sharp({
      create: {
        width: wmWidth,
        height: wmH,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: wmResized,
          blend: 'over',
        },
      ])
      .png()
      .toBuffer();

    // Position: bottom-right with 16px margin.
    const margin = 16;
    const left = width - wmWidth - margin;
    const top = height - wmH - margin;

    composites.push({
      input: opacityWm,
      top,
      left,
      blend: 'over',
    });
  }

  // Composite and write output.
  if (composites.length > 0) {
    await sharp(inputPath).composite(composites).png().toFile(outputPath);
  } else {
    // No overlays — copy as PNG.
    await sharp(inputPath).png().toFile(outputPath);
  }

  return outputPath;
}
