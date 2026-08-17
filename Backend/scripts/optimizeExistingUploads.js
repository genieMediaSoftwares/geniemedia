/**
 * ONE-TIME MIGRATION SCRIPT — not part of the running server.
 * =========================================================================
 * Re-optimises the images that were uploaded before server.js started
 * compressing them.
 *
 * Why it is needed
 * ----------------
 * Project and blog artwork was uploaded straight from a design tool: typically
 * ~1900px-wide PNGs of 0.9-1.1 MB each. The public site never displays them
 * wider than roughly 640 CSS px. Six of them on the home page and eleven on
 * /projects were the single largest contributor to the page weight that
 * PageSpeed flagged as "Avoid enormous network payloads".
 *
 * server.js now compresses every NEW upload (see optimiseImage there). This
 * script does the same to the images already living on Hostinger:
 *
 *   1. reads every image URL from the `projects` and `blogs` tables
 *   2. downloads the current file
 *   3. caps it at 1280px wide and re-encodes it as WebP
 *   4. re-uploads it through the same https://geniemedia.in/upload.php endpoint
 *   5. points the database row at the new URL
 *
 * The old file is left in place on Hostinger, so nothing 404s if a URL was
 * cached or shared somewhere. Delete them manually once you are satisfied.
 *
 * Run from the Backend folder:
 *     node scripts/optimizeExistingUploads.js --dry-run   # report only, default
 *     node scripts/optimizeExistingUploads.js --apply     # actually migrate
 *
 * Safe to re-run: an image that is already small enough is skipped.
 *
 * NOTE: like seedProjects.js this keeps its own DB pool and uploader so that
 * nothing in server.js has to be exported for a one-off task.
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const fs = require("fs");
const os = require("os");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const mysql = require("mysql2/promise");
const sharp = require("sharp");

const APPLY = process.argv.includes("--apply");
const MAX_WIDTH = 1280;
const UPLOAD_ENDPOINT = "https://geniemedia.in/upload.php";

// Anything at or below this is already fine; leave it alone.
const SKIP_BELOW_BYTES = 150 * 1024;

const kb = (n) => `${Math.round(n / 1024)} KB`;

async function download(url) {
  const res = await axios.get(url, { responseType: "arraybuffer", timeout: 60000 });
  return Buffer.from(res.data);
}

async function upload(buffer, filename) {
  const form = new FormData();
  form.append("file", buffer, { filename });
  const res = await axios.post(UPLOAD_ENDPOINT, form, {
    headers: form.getHeaders(),
    timeout: 120000,
  });
  if (!res.data || !res.data.url) {
    throw new Error(`upload.php did not return a url: ${JSON.stringify(res.data)}`);
  }
  return res.data.url;
}

async function main() {
  if (!APPLY) {
    console.log("DRY RUN — nothing will be uploaded or written. Pass --apply to migrate.\n");
  }

  const db = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 4,
  });

  const targets = [];
  for (const table of ["projects", "blogs"]) {
    try {
      const [rows] = await db.query(
        `SELECT id, image FROM ${table} WHERE image IS NOT NULL AND image <> ''`
      );
      for (const row of rows) targets.push({ table, id: row.id, url: row.image });
    } catch (err) {
      console.error(`Could not read ${table}: ${err.message}`);
    }
  }

  console.log(`Found ${targets.length} image(s) referenced by the database.\n`);

  let totalBefore = 0;
  let totalAfter = 0;
  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const t of targets) {
    const label = `${t.table}#${t.id}`;
    try {
      if (!/^https?:\/\//i.test(t.url)) {
        console.log(`  skip    ${label}  (not an absolute URL: ${t.url})`);
        skipped++;
        continue;
      }

      const original = await download(t.url);
      const meta = await sharp(original).metadata();

      if (original.length <= SKIP_BELOW_BYTES && meta.width <= MAX_WIDTH) {
        console.log(`  skip    ${label}  already ${kb(original.length)} at ${meta.width}px`);
        skipped++;
        totalBefore += original.length;
        totalAfter += original.length;
        continue;
      }

      let pipeline = sharp(original, { failOn: "none" }).rotate();
      if (meta.width > MAX_WIDTH) {
        pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
      }
      const optimised = await pipeline.webp({ quality: 82, effort: 6 }).toBuffer();

      totalBefore += original.length;

      if (optimised.length >= original.length) {
        console.log(`  skip    ${label}  re-encode was not smaller`);
        skipped++;
        totalAfter += original.length;
        continue;
      }

      totalAfter += optimised.length;
      const newMeta = await sharp(optimised).metadata();
      const base = path
        .basename(new URL(t.url).pathname)
        .replace(/\.[^.]+$/, "")
        .slice(0, 80);
      const filename = `${Date.now()}_${base}.webp`;

      console.log(
        `  ${APPLY ? "MIGRATE" : "would  "} ${label}  ` +
          `${kb(original.length)} -> ${kb(optimised.length)}  ` +
          `${meta.width}x${meta.height} -> ${newMeta.width}x${newMeta.height}`
      );

      if (APPLY) {
        const newUrl = await upload(optimised, filename);
        await db.query(`UPDATE ${t.table} SET image = ? WHERE id = ?`, [newUrl, t.id]);
        console.log(`          -> ${newUrl}`);
      } else {
        // Keep a local copy so the result can be eyeballed before committing.
        const outDir = path.join(os.tmpdir(), "geniemedia-optimised");
        fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(path.join(outDir, filename), optimised);
      }

      migrated++;
    } catch (err) {
      console.error(`  FAIL    ${label}  ${err.message}`);
      failed++;
    }
  }

  console.log(
    `\n${APPLY ? "Migrated" : "Would migrate"} ${migrated}, skipped ${skipped}, failed ${failed}.`
  );
  if (totalBefore) {
    console.log(
      `Total image weight: ${kb(totalBefore)} -> ${kb(totalAfter)} ` +
        `(-${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1)}%)`
    );
  }
  if (!APPLY && migrated) {
    console.log(`\nPreview files written to ${path.join(os.tmpdir(), "geniemedia-optimised")}`);
    console.log("Re-run with --apply to upload them and update the database.");
  }

  await db.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
