// Reports the intrinsic dimensions and weight of every bundled image asset,
// so the optimisation targets can be chosen from real numbers instead of guesses.
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve('src/assets');
const EXT = /\.(jpe?g|png|webp)$/i;

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (EXT.test(entry.name)) out.push(full);
  }
  return out;
}

const rows = [];
for (const file of await walk(ROOT)) {
  const { size } = await stat(file);
  const { width, height, format, hasAlpha } = await sharp(file).metadata();
  rows.push({ file: path.relative(ROOT, file), size, width, height, format, hasAlpha });
}

rows.sort((a, b) => b.size - a.size);
for (const r of rows) {
  console.log(
    `${String(Math.round(r.size / 1024)).padStart(6)} KB  ${String(r.width).padStart(5)}x${String(r.height).padEnd(5)}  ${r.format.padEnd(5)}  alpha=${r.hasAlpha ? 'y' : 'n'}  ${r.file}`
  );
}
console.log(`\nTOTAL: ${(rows.reduce((s, r) => s + r.size, 0) / 1024 / 1024).toFixed(2)} MB across ${rows.length} files`);
