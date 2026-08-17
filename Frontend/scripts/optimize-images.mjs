/**
 * One-shot image optimiser for the bundled assets in src/assets.
 *
 * Why this exists
 * ---------------
 * The source photographs were committed straight off the camera — several are
 * 7008x4672 (33 megapixels) but are never displayed wider than ~600 CSS px.
 * That alone accounted for tens of megabytes of deployed weight and was the
 * dominant "Improve image delivery" / "Avoid enormous network payloads" finding.
 *
 * What it does
 * ------------
 *  - Copies every original to src/assets-original/ first (gitignored) so nothing
 *    is destroyed. Re-running the script always re-reads from that backup, which
 *    makes it idempotent: quality never degrades generation-over-generation.
 *  - Downscales so the longest edge is at most 2x the largest size the image is
 *    ever displayed at, which keeps it crisp on 2x DPR screens.
 *  - Re-encodes JPEGs in place as progressive mozjpeg (no import changes needed).
 *  - Converts the large PNG screenshots/illustrations to WebP, which keeps the
 *    alpha channel at a fraction of the size. Those imports are updated to match.
 *
 * Run with:  npm run optimize:images
 */
import { readdir, stat, mkdir, copyFile, rm, access } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ASSETS = path.resolve('src/assets');
const BACKUP = path.resolve('src/assets-original');

// Longest-edge cap per file, chosen as ~2x the largest rendered size so the
// image is still sharp on high-DPR displays. Anything not listed uses DEFAULT.
const DEFAULT_MAX_EDGE = 1400;
const MAX_EDGE = {
  // Home hero — rendered at h-[600px] in a half-width column.
  'genieHeroImg.png': 1000,
  // Portfolio screenshots — rendered in aspect-[11/5] cards, ~640px wide.
  'meerabasuWebsite.png': 1280,
  'AvanttaGems.png': 1280,
  'knsMetals.png': 1280,
  'buildzon.png': 1280,
  'LaserFold.png': 1280,
  'GenieStudio.png': 1280,
  'nuconaerospace.png': 1280,
  'synergeneapi.png': 1280,
  'vivodyne.png': 1280,
  'decagon.png': 1280,
  'freenome.png': 1280,
  // AllServices centre image — rendered inside a max-w-sm (384px) column.
  'lamp.JPG': 800,
  'Production_house.JPG': 800,
  // Header/footer logo — rendered at w-36 (144px) / h-32.
  'GenieMedia-Logo.png': 420,
};

// Large PNGs that are photographs or screenshots: WebP is dramatically smaller
// and keeps transparency. Their import specifiers are rewritten to .webp.
const PNG_TO_WEBP = new Set([
  'genieHeroImg.png',
  'meerabasuWebsite.png',
  'AvanttaGems.png',
  'knsMetals.png',
  'buildzon.png',
  'LaserFold.png',
  'GenieStudio.png',
  'nuconaerospace.png',
  'synergeneapi.png',
  'vivodyne.png',
  'decagon.png',
  'freenome.png',
]);

const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

const exists = (p) => access(p).then(() => true, () => false);

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (IMAGE_EXT.test(entry.name)) out.push(full);
  }
  return out;
}

/** Restore-or-seed the pristine copy, and return the path to read from. */
async function sourceFor(file) {
  const rel = path.relative(ASSETS, file);
  const backup = path.join(BACKUP, rel);
  if (await exists(backup)) return backup;
  await mkdir(path.dirname(backup), { recursive: true });
  await copyFile(file, backup);
  return backup;
}

const kb = (n) => `${String(Math.round(n / 1024)).padStart(5)} KB`;

let before = 0;
let after = 0;
const results = [];

for (const file of await walk(ASSETS)) {
  const name = path.basename(file);
  const src = await sourceFor(file);
  const originalSize = (await stat(src)).size;
  before += originalSize;

  const meta = await sharp(src).metadata();
  const maxEdge = MAX_EDGE[name] ?? DEFAULT_MAX_EDGE;
  const needsResize = Math.max(meta.width, meta.height) > maxEdge;

  let pipeline = sharp(src, { failOn: 'none' });
  if (needsResize) {
    pipeline = pipeline.resize({
      width: meta.width >= meta.height ? maxEdge : undefined,
      height: meta.height > meta.width ? maxEdge : undefined,
      withoutEnlargement: true,
    });
  }

  let outPath = file;
  if (PNG_TO_WEBP.has(name)) {
    outPath = file.replace(/\.png$/i, '.webp');
    pipeline = pipeline.webp({ quality: 80, effort: 6 });
  } else if (/\.png$/i.test(name)) {
    pipeline = pipeline.png({ compressionLevel: 9, palette: true, quality: 90 });
  } else if (/\.webp$/i.test(name)) {
    pipeline = pipeline.webp({ quality: 82, effort: 6 });
  } else {
    // .jpg/.JPG — note some of these are actually HEIF or WebP with a .JPG
    // extension; re-encoding here also fixes that mislabelling.
    pipeline = pipeline.jpeg({ quality: 78, progressive: true, mozjpeg: true });
  }

  const buf = await pipeline.toBuffer();

  // Never make a file bigger than it already was.
  if (outPath === file && buf.length >= originalSize) {
    after += originalSize;
    results.push({ name, originalSize, newSize: originalSize, note: 'kept original' });
    continue;
  }

  const { writeFile } = await import('node:fs/promises');
  await writeFile(outPath, buf);
  if (outPath !== file) await rm(file);

  after += buf.length;
  const outMeta = await sharp(buf).metadata();
  results.push({
    name,
    out: path.basename(outPath),
    originalSize,
    newSize: buf.length,
    dims: `${meta.width}x${meta.height} -> ${outMeta.width}x${outMeta.height}`,
  });
}

results.sort((a, b) => b.originalSize - a.originalSize);
for (const r of results) {
  const arrow = r.out && r.out !== r.name ? ` -> ${r.out}` : '';
  console.log(
    `${kb(r.originalSize)} -> ${kb(r.newSize)}  ${r.name}${arrow}  ${r.dims ?? r.note ?? ''}`
  );
}
console.log(
  `\nTOTAL: ${(before / 1024 / 1024).toFixed(2)} MB -> ${(after / 1024 / 1024).toFixed(2)} MB ` +
    `(-${(((before - after) / before) * 100).toFixed(1)}%)`
);
