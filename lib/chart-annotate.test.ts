import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

import { annotateChart, type AnnotationOptions } from './chart-annotate.ts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.join(__dirname, '__fixtures__');

/** Create a minimal 1600×900 PNG fixture and return its path. */
async function createFixtureImage(filename: string): Promise<string> {
  fs.mkdirSync(FIXTURE_DIR, { recursive: true });
  const filePath = path.join(FIXTURE_DIR, filename);
  await sharp({
    create: {
      width: 1600,
      height: 900,
      channels: 3,
      background: { r: 20, g: 30, b: 40 },
    },
  })
    .png()
    .toFile(filePath);
  return filePath;
}

/** Create a tiny 100×30 PNG to act as a watermark fixture. */
async function createWatermarkFixture(filename: string): Promise<string> {
  fs.mkdirSync(FIXTURE_DIR, { recursive: true });
  const filePath = path.join(FIXTURE_DIR, filename);
  await sharp({
    create: {
      width: 100,
      height: 30,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 200 },
    },
  })
    .png()
    .toFile(filePath);
  return filePath;
}

const createdFiles: string[] = [];

function trackFile(p: string): string {
  createdFiles.push(p);
  return p;
}

// ---------------------------------------------------------------------------
// Teardown
// ---------------------------------------------------------------------------

afterEach(() => {
  for (const f of createdFiles.splice(0)) {
    try {
      fs.unlinkSync(f);
    } catch {
      // best-effort
    }
  }
  // Remove fixture dir if empty
  try {
    fs.rmdirSync(FIXTURE_DIR);
  } catch {
    // not empty or already gone — ignore
  }
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('annotateChart', () => {
  it('adds a watermark — output is a valid 1600×900 PNG', async () => {
    const inputPath = trackFile(await createFixtureImage('input-watermark.png'));
    const watermarkPath = trackFile(await createWatermarkFixture('wm.png'));
    const outputPath = trackFile(path.join(FIXTURE_DIR, 'out-watermark.png'));

    const options: AnnotationOptions = {
      watermarkPath,
      levels: [],
    };

    const result = await annotateChart(inputPath, outputPath, options);

    assert.equal(result, outputPath, 'should return output path');
    assert.ok(fs.existsSync(outputPath), 'output file should exist');

    const meta = await sharp(outputPath).metadata();
    assert.equal(meta.format, 'png', 'output should be PNG');
    assert.equal(meta.width, 1600, 'width should be 1600');
    assert.equal(meta.height, 900, 'height should be 900');
  });

  it('works with no levels and no watermark — just copies the image', async () => {
    const inputPath = trackFile(await createFixtureImage('input-copy.png'));
    const outputPath = trackFile(path.join(FIXTURE_DIR, 'out-copy.png'));

    const options: AnnotationOptions = {
      levels: [],
    };

    const result = await annotateChart(inputPath, outputPath, options);

    assert.equal(result, outputPath, 'should return output path');
    assert.ok(fs.existsSync(outputPath), 'output file should exist');

    const meta = await sharp(outputPath).metadata();
    assert.equal(meta.format, 'png', 'output should be PNG');
    assert.equal(meta.width, 1600, 'width should be 1600');
    assert.equal(meta.height, 900, 'height should be 900');
  });

  it('image with levels differs from one without (file size differs due to SVG overlay)', async () => {
    const inputPath = trackFile(await createFixtureImage('input-levels.png'));
    const outputNoLevels = trackFile(path.join(FIXTURE_DIR, 'out-no-levels.png'));
    const outputWithLevels = trackFile(path.join(FIXTURE_DIR, 'out-with-levels.png'));

    await annotateChart(inputPath, outputNoLevels, { levels: [] });
    await annotateChart(inputPath, outputWithLevels, {
      levels: [
        { price: 85000, label: 'Resistance', color: 'down' },
        { price: 80000, label: 'Support', color: 'up' },
        { price: 82500, label: 'Mid', color: 'neutral' },
      ],
    });

    const sizeNoLevels = fs.statSync(outputNoLevels).size;
    const sizeWithLevels = fs.statSync(outputWithLevels).size;

    assert.notEqual(
      sizeNoLevels,
      sizeWithLevels,
      'file sizes should differ when levels are drawn vs not drawn',
    );
  });

  it('throws if input image does not exist', async () => {
    const nonExistent = path.join(FIXTURE_DIR, 'does-not-exist.png');
    const outputPath = trackFile(path.join(FIXTURE_DIR, 'out-throw.png'));

    const options: AnnotationOptions = { levels: [] };

    await assert.rejects(
      () => annotateChart(nonExistent, outputPath, options),
      (err: unknown) => {
        assert.ok(err instanceof Error, 'should throw an Error');
        return true;
      },
      'annotateChart should reject when input does not exist',
    );
  });
});
