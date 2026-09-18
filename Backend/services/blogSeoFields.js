/**
 * Translates what the admin form posts into what the `blogs` table stores.
 *
 * Three jobs:
 *  1. Coerce and length-clamp every field so a long paste cannot turn into a
 *     500 from MySQL strict mode rejecting an over-width VARCHAR.
 *  2. Derive the fields the editor must not be trusted to supply by hand —
 *     word count, reading time and the internal-link list are computed from the
 *     content itself, every single save.
 *  3. Maintain `slug_history`, so changing a permalink leaves a redirect trail
 *     instead of a 404 and a pile of lost inbound links.
 */

const { deriveContentMetrics } = require("./contentAnalysis");
const { parseJsonColumn, asArray, cleanSlug } = require("./structuredData");

const ROBOTS_VALUES = ["index,follow", "noindex,follow", "noindex,nofollow"];
const SCHEMA_TYPES = ["Article", "BlogPosting", "FAQPage", "HowTo", "NewsArticle"];

/** Column widths, mirroring the migration. Values are cut, never rejected. */
const WIDTHS = {
  meta_title: 60,
  metaDescription: 160,
  focus_keyword: 100,
  canonical_url: 255,
  og_image_url: 255,
  alt_text: 200,
  author_name: 150,
  reviewer_name: 150,
  reviewer_role: 100,
};

const clamp = (value, max) => {
  const str = String(value === null || value === undefined ? "" : value).trim();
  if (!str) return null;
  return str.length > max ? str.slice(0, max).trim() : str;
};

const nullable = (value) => {
  const str = String(value === null || value === undefined ? "" : value).trim();
  return str === "" ? null : str;
};

/**
 * Form fields arrive as strings because the request is multipart/form-data —
 * an array or object has been JSON-stringified by the browser before it was
 * appended. Anything unparseable degrades to an empty array rather than
 * throwing, because a malformed FAQ field must not be able to block a save.
 */
const jsonArrayField = (value) => {
  const parsed = parseJsonColumn(value, []);
  return Array.isArray(parsed) ? parsed : [];
};

const sanitiseFaq = (value) =>
  jsonArrayField(value)
    .map((item) => ({
      question: String(item.question || "").trim().slice(0, 300),
      answer: String(item.answer || "").trim().slice(0, 1200),
    }))
    .filter((item) => item.question || item.answer)
    .slice(0, 20);

const sanitiseFacts = (value) =>
  jsonArrayField(value)
    .map((item) => ({
      fact: String(item.fact || "").trim().slice(0, 500),
      source: String(item.source || item.source_url || "").trim().slice(0, 500),
    }))
    .filter((item) => item.fact)
    .slice(0, 20);

const sanitiseDefinitions = (value) =>
  jsonArrayField(value)
    .map((item) => ({
      term: String(item.term || "").trim().slice(0, 120),
      definition: String(item.definition || "").trim().slice(0, 600),
    }))
    .filter((item) => item.term)
    .slice(0, 20);

/**
 * Place names for `areas_covered`.
 *
 * Accepts either a JSON array or a comma-separated string, because the tag
 * input posts an array but a hand-built request may well send the string form.
 * Duplicates are removed case-insensitively so "Vizag" and "vizag" do not both
 * end up in areaServed as if they were two different places.
 */
const sanitiseAreas = (value) => {
  const parsed = parseJsonColumn(value, null);
  const list = Array.isArray(parsed)
    ? parsed
    : String(value || "")
        .split(",")
        .map((a) => a.trim());

  const seen = new Set();
  const out = [];

  for (const raw of list) {
    const area = String(raw || "").trim().slice(0, 100);
    if (!area) continue;
    const key = area.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(area);
  }

  return out.slice(0, 30);
};

/**
 * `reviewed_at` arrives as an ISO string from the "Mark as reviewed today"
 * button, or empty when the reviewer has been cleared. MySQL wants a Date or
 * null; an unparseable value becomes null rather than throwing, since a bad
 * timestamp must not be able to block a save.
 */
const sanitiseTimestamp = (value) => {
  const str = String(value === null || value === undefined ? "" : value).trim();
  if (!str) return null;
  const date = new Date(str);
  return Number.isNaN(date.getTime()) ? null : date;
};

const sanitiseKeywords = (value) => {
  const parsed = parseJsonColumn(value, null);
  const list = Array.isArray(parsed)
    ? parsed
    : String(value || "")
        .split(",")
        .map((k) => k.trim());
  return [...new Set(list.map((k) => String(k).trim()).filter(Boolean))].slice(0, 25);
};

/**
 * Appends the previous slug to the history when the permalink changes.
 *
 * Stored newest-first with a timestamp, capped at 20 entries — enough to cover
 * any realistic editing history without the column growing without bound. The
 * new slug is never added to its own history, and a slug already present is not
 * duplicated when an editor flips back and forth between two permalinks.
 */
const buildSlugHistory = (previousRow, nextPermalink) => {
  const history = asArray(previousRow && previousRow.slug_history);
  const oldSlug = cleanSlug(previousRow && previousRow.permalink);
  const newSlug = cleanSlug(nextPermalink);

  if (!oldSlug || oldSlug === newSlug) return history;
  if (history.some((h) => cleanSlug(h.slug) === oldSlug)) return history;

  return [{ slug: oldSlug, changed_at: new Date().toISOString() }, ...history].slice(0, 20);
};

/**
 * Builds the complete set of SEO column values for an INSERT or UPDATE.
 *
 * @param {object} body        The parsed request body.
 * @param {object} [options]
 * @param {object} [options.previousRow] The existing row, when updating.
 * @param {string} [options.ogImageUrl]  URL of the generated OG variant, if any.
 * @param {string} [options.content]     Post HTML, when it differs from body.description.
 */
const buildSeoColumns = (body, options = {}) => {
  const { previousRow = null, ogImageUrl = null } = options;
  const content = options.content !== undefined ? options.content : body.description || "";

  const metrics = deriveContentMetrics(content);

  const robots = ROBOTS_VALUES.includes(String(body.robots_directive || "").trim())
    ? String(body.robots_directive).trim()
    : "index,follow";

  const schemaType = SCHEMA_TYPES.includes(String(body.schema_type || "").trim())
    ? String(body.schema_type).trim()
    : "BlogPosting";

  // The OG URL follows this precedence: a freshly generated variant wins, then
  // an explicit value from the form, then whatever was already stored. Without
  // the last step, saving a post without re-uploading the image would wipe the
  // OG variant that a previous upload generated.
  const ogImage =
    ogImageUrl ||
    clamp(body.og_image_url, WIDTHS.og_image_url) ||
    (previousRow ? nullable(previousRow.og_image_url) : null);

  const authorId = Number.parseInt(body.author_id, 10);

  return {
    meta_title: clamp(body.meta_title, WIDTHS.meta_title),
    focus_keyword: clamp(body.focus_keyword, WIDTHS.focus_keyword),
    secondary_keywords: JSON.stringify(sanitiseKeywords(body.secondary_keywords)),
    canonical_url: clamp(body.canonical_url, WIDTHS.canonical_url),
    robots_directive: robots,
    schema_type: schemaType,
    faq_schema: JSON.stringify(sanitiseFaq(body.faq_schema)),
    direct_answer: nullable(body.direct_answer),
    key_facts: JSON.stringify(sanitiseFacts(body.key_facts)),
    definitions: JSON.stringify(sanitiseDefinitions(body.definitions)),
    og_image_url: ogImage,
    alt_text: clamp(body.alt_text, WIDTHS.alt_text),
    author_id: Number.isFinite(authorId) ? authorId : null,
    author_name: clamp(body.author_name, WIDTHS.author_name),
    author_bio: nullable(body.author_bio),
    reviewer_name: clamp(body.reviewer_name, WIDTHS.reviewer_name),
    reviewer_role: clamp(body.reviewer_role, WIDTHS.reviewer_role),
    reviewed_at: sanitiseTimestamp(body.reviewed_at),
    areas_covered: JSON.stringify(sanitiseAreas(body.areas_covered)),
    reading_time_minutes: metrics.reading_time_minutes,
    word_count: metrics.word_count,
    internal_links: JSON.stringify(metrics.internal_links),
    slug_history: JSON.stringify(buildSlugHistory(previousRow, body.permalink)),
  };
};

/**
 * Normalises a row on the way OUT of the database so the API always returns the
 * JSON columns as real arrays, whether the engine stored them natively or as
 * LONGTEXT.
 */
const hydrateSeoRow = (row) => {
  if (!row) return row;
  return {
    ...row,
    secondary_keywords: asArray(row.secondary_keywords),
    faq_schema: asArray(row.faq_schema),
    key_facts: asArray(row.key_facts),
    definitions: asArray(row.definitions),
    areas_covered: asArray(row.areas_covered),
    internal_links: asArray(row.internal_links),
    slug_history: asArray(row.slug_history),
  };
};

/** Clamps metaDescription to its 160-character limit before it is stored. */
const clampMetaDescription = (value) => clamp(value, WIDTHS.metaDescription);

module.exports = {
  buildSeoColumns,
  hydrateSeoRow,
  buildSlugHistory,
  clampMetaDescription,
  ROBOTS_VALUES,
  SCHEMA_TYPES,
  WIDTHS,
};
