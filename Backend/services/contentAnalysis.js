/**
 * Content analysis for blog HTML: word count, reading time, headings, internal
 * links and keyword placement.
 *
 * The admin panel runs an equivalent analysis in the browser so the editor gets
 * live feedback while typing (Frontend/src/utils/seoAnalysis.js). That copy is a
 * convenience; THIS one is the authority. Anything the client computes is
 * recomputed here before it is stored or used to gate a publish, because the
 * client can be bypassed with a single curl request.
 */

const { SITE } = require("../config/site");

const WORDS_PER_MINUTE = 225;

/** Strips tags and decodes the handful of entities TipTap actually emits. */
const stripHtml = (html) =>
  String(html || "")
    // Drop entire script/style blocks including their contents.
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    // Turn block boundaries into spaces so "</p><p>" cannot glue two words.
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote|section|article)>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const toWords = (text) =>
  String(text || "")
    .toLowerCase()
    .split(/[^a-z0-9'’-]+/i)
    .filter(Boolean);

const countWords = (html) => toWords(stripHtml(html)).length;

const readingTime = (html) => Math.max(1, Math.round(countWords(html) / WORDS_PER_MINUTE));

/** First N words of the body — where the focus keyword has the most weight. */
const firstWords = (html, n = 100) => toWords(stripHtml(html)).slice(0, n).join(" ");

/** Every heading in document order: `[{ level, text }]`. */
const extractHeadings = (html) => {
  const out = [];
  const re = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m;
  while ((m = re.exec(String(html || "")))) {
    out.push({ level: Number(m[1]), text: stripHtml(m[2]) });
  }
  return out;
};

/**
 * Heading-hierarchy audit.
 *
 * Two things matter to an extraction engine: exactly one H1 (so the document has
 * one unambiguous subject) and no skipped levels (so the outline it builds
 * matches the outline a human sees). A jump from H2 straight to H4 makes the
 * H4's parent ambiguous, and the section gets attached to the wrong topic.
 *
 * Note the page template already renders the post title as the page's only H1,
 * so an H1 *inside* the body is a duplicate and is reported as such.
 */
const auditHeadings = (html) => {
  const headings = extractHeadings(html);
  const issues = [];
  const h1Count = headings.filter((h) => h.level === 1).length;

  if (h1Count > 0) {
    issues.push({
      type: "duplicate-h1",
      message: `Content contains ${h1Count} H1 heading${h1Count > 1 ? "s" : ""}. The post title is already the page H1 — use H2 for top-level sections.`,
    });
  }

  let previous = 1; // the title H1
  for (const h of headings) {
    if (h.level === 1) continue;
    if (h.level > previous + 1) {
      issues.push({
        type: "skipped-level",
        message: `"${h.text.slice(0, 60)}" jumps from H${previous} to H${h.level}. Use H${previous + 1} instead.`,
      });
    }
    previous = h.level;
  }

  return {
    headings,
    h1Count,
    h2Count: headings.filter((h) => h.level === 2).length,
    issues,
    valid: issues.length === 0,
  };
};

/**
 * Pulls internal links out of the body.
 *
 * "Internal" means same-site: a root-relative href, or an absolute one pointing
 * at the site's own domain. Everything else is an outbound link and does not
 * count toward the internal-linking requirement.
 */
const extractInternalLinks = (html) => {
  const links = [];
  const re = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const host = SITE.url.replace(/^https?:\/\//, "").replace(/^www\./, "").toLowerCase();
  let m;

  while ((m = re.exec(String(html || "")))) {
    const href = m[1].trim();
    const anchorText = stripHtml(m[2]);

    if (/^(mailto:|tel:|#|javascript:)/i.test(href)) continue;

    let isInternal = false;
    let targetSlug = href;

    if (/^https?:\/\//i.test(href)) {
      try {
        const parsed = new URL(href);
        const linkHost = parsed.hostname.replace(/^www\./, "").toLowerCase();
        isInternal = linkHost === host;
        if (isInternal) targetSlug = parsed.pathname + (parsed.search || "");
      } catch (_) {
        isInternal = false;
      }
    } else if (href.startsWith("/")) {
      isInternal = true;
      targetSlug = href;
    }

    if (isInternal) links.push({ anchor_text: anchorText, target_slug: targetSlug });
  }

  return links;
};

const extractExternalLinks = (html) => {
  const out = [];
  const re = /<a\b[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const host = SITE.url.replace(/^https?:\/\//, "").replace(/^www\./, "").toLowerCase();
  let m;
  while ((m = re.exec(String(html || "")))) {
    try {
      const linkHost = new URL(m[1]).hostname.replace(/^www\./, "").toLowerCase();
      if (linkHost !== host) out.push({ anchor_text: stripHtml(m[2]), url: m[1] });
    } catch (_) {}
  }
  return out;
};

/** Escapes a user-supplied keyword so it can be used inside a RegExp. */
const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * How often the focus keyword appears, as a percentage of total words.
 *
 * Counts the whole phrase, not its individual words, and uses word boundaries so
 * "seo" does not match inside "season". Below ~0.5% the page reads as unrelated
 * to the term; above ~2.5% it reads as stuffed, which is actively penalised.
 */
const keywordDensity = (html, keyword) => {
  const text = stripHtml(html).toLowerCase();
  const kw = String(keyword || "").trim().toLowerCase();
  if (!kw || !text) return { occurrences: 0, density: 0, totalWords: 0 };

  const totalWords = toWords(text).length;
  if (!totalWords) return { occurrences: 0, density: 0, totalWords: 0 };

  const matches = text.match(new RegExp(`\\b${escapeRegex(kw)}\\b`, "gi"));
  const occurrences = matches ? matches.length : 0;
  const keywordWords = Math.max(1, toWords(kw).length);

  return {
    occurrences,
    totalWords,
    density: Number((((occurrences * keywordWords) / totalWords) * 100).toFixed(2)),
  };
};

const containsKeyword = (haystack, keyword) => {
  const kw = String(keyword || "").trim().toLowerCase();
  if (!kw) return false;
  const text = String(haystack || "").toLowerCase().replace(/[-_/]+/g, " ");
  return new RegExp(`\\b${escapeRegex(kw)}\\b`, "i").test(text);
};

/**
 * The full focus-keyword checklist.
 *
 * Each entry is `{ id, label, passed, detail }` so the admin panel can render it
 * directly and the API can return the same shape.
 */
const analyseFocusKeyword = ({
  keyword,
  title,
  metaTitle,
  metaDescription,
  permalink,
  altText,
  content,
}) => {
  const density = keywordDensity(content, keyword);
  const headings = extractHeadings(content);
  const inAnyH2 = headings.some((h) => h.level === 2 && containsKeyword(h.text, keyword));
  const intro = firstWords(content, 100);

  const checks = [
    {
      id: "kw-title",
      label: "Focus keyword in the blog title",
      passed: containsKeyword(metaTitle || title, keyword),
      detail: "The closer to the start of the title, the stronger the signal.",
    },
    {
      id: "kw-intro",
      label: "Focus keyword in the first 100 words",
      passed: containsKeyword(intro, keyword),
      detail: "Confirms the topic before a reader or a crawler decides to bounce.",
    },
    {
      id: "kw-h2",
      label: "Focus keyword in at least one H2",
      passed: inAnyH2,
      detail: "Section headings are what answer engines quote as passage titles.",
    },
    {
      id: "kw-meta",
      label: "Focus keyword in the meta description",
      passed: containsKeyword(metaDescription, keyword),
      detail: "Google bolds the matched query terms in the result snippet.",
    },
    {
      id: "kw-slug",
      label: "Focus keyword in the URL slug",
      passed: containsKeyword(permalink, keyword),
      detail: "A descriptive slug survives being copied into a link with no anchor text.",
    },
    {
      id: "kw-alt",
      label: "Focus keyword in the featured image alt text",
      passed: containsKeyword(altText, keyword),
      detail: "Drives image search traffic and is read verbatim by screen readers.",
    },
    {
      id: "kw-density",
      label: `Keyword density between 0.5% and 2.5% (currently ${density.density}%)`,
      passed: density.density >= 0.5 && density.density <= 2.5,
      detail:
        density.density > 2.5
          ? "Too high — this reads as keyword stuffing. Replace some mentions with synonyms."
          : "Too low — the page does not clearly commit to this topic.",
    },
  ];

  return {
    keyword: String(keyword || "").trim(),
    density,
    checks,
    score: checks.filter((c) => c.passed).length,
    total: checks.length,
  };
};

/** Everything the write path needs to derive and store in one call. */
const deriveContentMetrics = (html) => ({
  word_count: countWords(html),
  reading_time_minutes: readingTime(html),
  internal_links: extractInternalLinks(html),
});

module.exports = {
  WORDS_PER_MINUTE,
  stripHtml,
  countWords,
  readingTime,
  firstWords,
  extractHeadings,
  auditHeadings,
  extractInternalLinks,
  extractExternalLinks,
  keywordDensity,
  containsKeyword,
  analyseFocusKeyword,
  deriveContentMetrics,
};
