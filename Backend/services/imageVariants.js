/**
 * Featured-image handling: dimension checks and the Open Graph variant.
 *
 * A blog needs the same photograph at two different aspect ratios. The page
 * shows it at 16:9 (1200x675), which is what the article layout is built for.
 * Every social and chat preview card, and several AI answer surfaces, crop to
 * 1.91:1 (1200x630) instead. Serving the 16:9 file to those means the card is
 * centre-cropped by the platform, which reliably decapitates anyone in the shot.
 *
 * So a second variant is generated at upload time. It is derived from the same
 * source with an attention-based crop, which keeps the subject in frame rather
 * than blindly trimming the centre.
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const DISPLAY = { width: 1200, height: 675, ratio: 16 / 9, label: "1200x675 (16:9)" };
const OG = { width: 1200, height: 630, ratio: 1200 / 630, label: "1200x630 (1.91:1)" };

// A 3% tolerance: an editor exporting 1200x674 or 1280x720 has done the right
// thing, and rejecting that would be pedantry rather than quality control.
const RATIO_TOLERANCE = 0.03;

/** Reads width/height/format without decoding the whole image. */
const inspect = async (filePath) => {
  try {
    const meta = await sharp(filePath).metadata();
    return { width: meta.width || 0, height: meta.height || 0, format: meta.format || null };
  } catch (err) {
    return { width: 0, height: 0, format: null, error: err.message };
  }
};

/**
 * Checks a featured image against the 16:9 / 1200x675 requirement.
 *
 * Returns `{ ok, warnings, errors, meta }`. Aspect ratio is an error because a
 * wrong ratio visibly breaks the article layout; being under 1200px wide is a
 * warning, because an otherwise good image that is slightly small is still
 * better than no image.
 */
const validateFeaturedImage = async (filePath) => {
  const meta = await inspect(filePath);
  const errors = [];
  const warnings = [];

  if (!meta.width || !meta.height) {
    return { ok: false, errors: ["The uploaded file could not be read as an image."], warnings, meta };
  }

  const ratio = meta.width / meta.height;
  if (Math.abs(ratio - DISPLAY.ratio) / DISPLAY.ratio > RATIO_TOLERANCE) {
    errors.push(
      `Featured image is ${meta.width}x${meta.height} (${ratio.toFixed(2)}:1). It must be 16:9 — ${DISPLAY.label} is the target.`
    );
  }

  if (meta.width < DISPLAY.width) {
    warnings.push(
      `Featured image is only ${meta.width}px wide. ${DISPLAY.width}px is recommended so it stays sharp on large screens.`
    );
  }

  return { ok: errors.length === 0, errors, warnings, meta };
};

/**
 * Writes the 1.91:1 Open Graph variant next to the source file.
 *
 * `fit: cover` with `position: attention` asks sharp to pick the crop window
 * with the most entropy, which for a photograph is almost always the subject.
 * Returns the new file's path, or null if anything went wrong — a failed variant
 * must never fail the upload, since the 16:9 original is a usable fallback.
 */
const createOgVariant = async (sourcePath) => {
  try {
    const outPath = `${sourcePath}.og.webp`;

    await sharp(sourcePath, { failOn: "none" })
      .rotate()
      .resize({
        width: OG.width,
        height: OG.height,
        fit: "cover",
        position: sharp.strategy.attention,
      })
      .webp({ quality: 82, effort: 5 })
      .toFile(outPath);

    return outPath;
  } catch (err) {
    console.error("OG variant generation skipped:", err.message);
    return null;
  }
};

/**
 * Re-encodes to WebP at the display size if the source is not already WebP.
 *
 * The upload filter accepts JPEG and PNG, but accepting a format is not the same
 * as serving it: a 900 kB PNG hero is a Largest Contentful Paint failure on
 * mobile no matter how good the article is. This guarantees what actually
 * reaches the browser is WebP.
 */
const ensureWebp = async (sourcePath) => {
  try {
    const meta = await inspect(sourcePath);
    if (meta.format === "webp") return null;

    const outPath = `${sourcePath}.display.webp`;
    await sharp(sourcePath, { failOn: "none" })
      .rotate()
      .resize({ width: DISPLAY.width, withoutEnlargement: true })
      .webp({ quality: 85, effort: 5 })
      .toFile(outPath);

    return outPath;
  } catch (err) {
    console.error("WebP conversion skipped:", err.message);
    return null;
  }
};

const safeUnlink = (filePath) => {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (_) {}
};

module.exports = {
  DISPLAY,
  OG,
  inspect,
  validateFeaturedImage,
  createOgVariant,
  ensureWebp,
  safeUnlink,
  basename: path.basename,
};
