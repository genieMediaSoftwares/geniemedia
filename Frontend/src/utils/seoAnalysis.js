/**
 * Live SEO / AEO / GEO analysis for the blog editor.
 *
 * This runs in the browser on every keystroke so the editor gets instant
 * feedback. It is intentionally a mirror of Backend/services/contentAnalysis.js
 * and Backend/services/seoValidation.js rather than the authority: the server
 * recomputes all of it before anything is stored or published, because a check
 * that only lives in the browser is a suggestion, not a rule.
 *
 * Keeping the two in step matters. If this file says a post is ready and the
 * server disagrees, the editor fixes everything the panel asks for and still
 * cannot publish, which is a worse experience than having no panel at all. The
 * thresholds below are the same constants the server uses.
 */

export const LIMITS = {
  metaTitleMin: 30,
  metaTitleIdeal: 50,
  metaTitleMax: 60,
  metaDescriptionMin: 70,
  metaDescriptionIdeal: 150,
  metaDescriptionMax: 160,
  directAnswerMinWords: 25,
  directAnswerIdealMin: 40,
  directAnswerIdealMax: 60,
  directAnswerMaxWords: 80,
  altTextMax: 200,
  densityMin: 0.5,
  densityMax: 2.5,
  faqRequiredAboveWords: 800,
  faqMinimum: 3,
  minWordCount: 300,
};

const WORDS_PER_MINUTE = 225;

/* ────────────────────────────────────────────────────────────────────────
   Text extraction
   ──────────────────────────────────────────────────────────────────────── */

export const stripHtml = (html) =>
  String(html || "")
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
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

export const countWords = (html) => toWords(stripHtml(html)).length;

export const readingTime = (html) => Math.max(1, Math.round(countWords(html) / WORDS_PER_MINUTE));

export const firstWords = (html, n = 100) => toWords(stripHtml(html)).slice(0, n).join(" ");

const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const containsKeyword = (haystack, keyword) => {
  const kw = String(keyword || "").trim().toLowerCase();
  if (!kw) return false;
  const text = String(haystack || "").toLowerCase().replace(/[-_/]+/g, " ");
  return new RegExp(`\\b${escapeRegex(kw)}\\b`, "i").test(text);
};

/**
 * Keyword density as a share of total words.
 *
 * Multi-word phrases count their own length, so "digital marketing agency"
 * appearing 4 times in a 600-word post reads as 2%, not 0.67%.
 */
export const keywordDensity = (html, keyword) => {
  const text = stripHtml(html).toLowerCase();
  const kw = String(keyword || "").trim().toLowerCase();
  if (!kw || !text) return { occurrences: 0, density: 0, totalWords: countWords(html) };

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

/* ────────────────────────────────────────────────────────────────────────
   Structure
   ──────────────────────────────────────────────────────────────────────── */

export const extractHeadings = (html) => {
  const out = [];
  const re = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m;
  while ((m = re.exec(String(html || "")))) {
    out.push({ level: Number(m[1]), text: stripHtml(m[2]) });
  }
  return out;
};

/**
 * Heading audit: one H1, no skipped levels.
 *
 * The page template renders the post title as the H1, so any H1 inside the body
 * is a second one and is flagged. A jump from H2 to H4 leaves the H4's parent
 * section ambiguous, and an extraction engine will attach it to the wrong topic.
 */
export const auditHeadings = (html) => {
  const headings = extractHeadings(html);
  const issues = [];
  const h1Count = headings.filter((h) => h.level === 1).length;

  if (h1Count > 0) {
    issues.push({
      type: "duplicate-h1",
      message: `Content contains ${h1Count} H1 heading${h1Count > 1 ? "s" : ""}. The post title is already the page H1 — use H2 for top-level sections.`,
    });
  }

  let previous = 1;
  for (const h of headings) {
    if (h.level === 1) continue;
    if (h.level > previous + 1) {
      issues.push({
        type: "skipped-level",
        message: `"${h.text.slice(0, 50)}" jumps from H${previous} to H${h.level}. Use H${previous + 1} instead.`,
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

/** Same-site links only — an outbound link does not satisfy internal linking. */
export const extractInternalLinks = (html, siteHost = "geniemedia.in") => {
  const links = [];
  const re = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const host = String(siteHost).replace(/^www\./, "").toLowerCase();
  let m;

  while ((m = re.exec(String(html || "")))) {
    const href = m[1].trim();
    const anchor_text = stripHtml(m[2]);
    if (/^(mailto:|tel:|#|javascript:)/i.test(href)) continue;

    if (/^https?:\/\//i.test(href)) {
      try {
        const parsed = new URL(href);
        if (parsed.hostname.replace(/^www\./, "").toLowerCase() === host) {
          links.push({ anchor_text, target_slug: parsed.pathname });
        }
      } catch {
        /* malformed href — not a usable link either way */
      }
    } else if (href.startsWith("/")) {
      links.push({ anchor_text, target_slug: href });
    }
  }

  return links;
};

/**
 * Finds terms the post introduces without defining them.
 *
 * Heuristic and deliberately conservative: it looks for capitalised multi-word
 * product-style names and acronyms, then checks whether a definitional pattern
 * ("X is", "X refers to", "X means") appears within roughly a sentence of the
 * first mention. It exists to prompt the editor, not to block them, which is why
 * nothing it reports is ever a publish blocker.
 */
export const findUndefinedTerms = (html, declaredTerms = []) => {
  const text = stripHtml(html);
  if (!text) return [];

  const declared = new Set(declaredTerms.map((t) => String(t.term || "").trim().toLowerCase()).filter(Boolean));

  const candidates = new Map();

  // Acronyms: 2-6 capitals, optionally with digits.
  for (const match of text.matchAll(/\b([A-Z]{2,6}[0-9]?)\b/g)) {
    const term = match[1];
    if (!candidates.has(term)) candidates.set(term, match.index);
  }

  // Capitalised multi-word names, excluding sentence starts where possible.
  for (const match of text.matchAll(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})\b/g)) {
    const term = match[1];
    if (!candidates.has(term)) candidates.set(term, match.index);
  }

  const undefinedTerms = [];

  for (const [term, index] of candidates) {
    if (declared.has(term.toLowerCase())) continue;

    // A definition counts if it appears in the 200 characters following the
    // first mention — roughly the same sentence or the next one.
    const window = text.slice(index, index + 220);
    const defined = new RegExp(
      `${escapeRegex(term)}\\s+(is|are|was|were|refers to|means|stands for|describes|denotes)\\b`,
      "i"
    ).test(window);

    if (!defined) undefinedTerms.push({ term, firstIndex: index });
  }

  return undefinedTerms.sort((a, b) => a.firstIndex - b.firstIndex).slice(0, 8);
};

/* ────────────────────────────────────────────────────────────────────────
   Focus keyword checklist
   ──────────────────────────────────────────────────────────────────────── */

export const analyseFocusKeyword = ({
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
  const kw = String(keyword || "").trim();

  const checks = [
    {
      id: "kw-title",
      label: "In the title",
      passed: containsKeyword(metaTitle || title, kw),
      hint: "Put it as close to the start of the title as reads naturally.",
    },
    {
      id: "kw-intro",
      label: "In the first 100 words",
      passed: containsKeyword(intro, kw),
      hint: "Confirms the topic before a reader decides whether to stay.",
    },
    {
      id: "kw-h2",
      label: "In at least one H2",
      passed: inAnyH2,
      hint: "Section headings are what answer engines quote as passage titles.",
    },
    {
      id: "kw-meta",
      label: "In the meta description",
      passed: containsKeyword(metaDescription, kw),
      hint: "Google bolds matched query terms in the snippet.",
    },
    {
      id: "kw-slug",
      label: "In the URL slug",
      passed: containsKeyword(permalink, kw),
      hint: "A descriptive slug still describes the page when pasted with no anchor text.",
    },
    {
      id: "kw-alt",
      label: "In the image alt text",
      passed: containsKeyword(altText, kw),
      hint: "Drives image search and is read aloud by screen readers.",
    },
    {
      id: "kw-density",
      label: `Density ${density.density}% (target ${LIMITS.densityMin}–${LIMITS.densityMax}%)`,
      passed: density.density >= LIMITS.densityMin && density.density <= LIMITS.densityMax,
      hint:
        density.density > LIMITS.densityMax
          ? "Too high — this reads as stuffing. Swap some mentions for synonyms."
          : "Too low — the page does not clearly commit to this topic.",
    },
  ];

  return {
    keyword: kw,
    density,
    checks,
    score: checks.filter((c) => c.passed).length,
    total: checks.length,
  };
};

/* ────────────────────────────────────────────────────────────────────────
   Publish gate (mirror of the server's)
   ──────────────────────────────────────────────────────────────────────── */

const txt = (v) => String(v === null || v === undefined ? "" : v).trim();
const wordsIn = (v) => txt(v).split(/\s+/).filter(Boolean).length;

/**
 * The red/green checklist shown next to the publish buttons.
 *
 * `severity: "blocker"` entries are the ones that stop a publish. Everything
 * else is advice.
 */
export const validateForPublish = (form) => {
  const content = form.description || "";
  const wordCount = countWords(content);
  const internalLinks = extractInternalLinks(content);
  const headingAudit = auditHeadings(content);

  const metaTitle = txt(form.meta_title) || txt(form.title);
  const metaDescription = txt(form.metaDescription);
  const answerWords = wordsIn(form.direct_answer);
  const faqs = (form.faq_schema || []).filter((f) => txt(f.question) && txt(f.answer));
  const facts = (form.key_facts || []).filter((f) => txt(f.fact));
  const hasImage = Boolean(form.imagePreview || form.existingImageUrl || form.image);
  const faqRequired = wordCount > LIMITS.faqRequiredAboveWords;

  const checks = [
    {
      id: "meta-title",
      label: `Meta title set, ${LIMITS.metaTitleMax} characters or fewer`,
      passed: Boolean(metaTitle) && metaTitle.length <= LIMITS.metaTitleMax,
      severity: "blocker",
      hint: metaTitle
        ? `Currently ${metaTitle.length} characters.`
        : "Without one, Google writes its own and it is usually worse.",
    },
    {
      id: "meta-description",
      label: `Meta description set, ${LIMITS.metaDescriptionMax} characters or fewer`,
      passed: Boolean(metaDescription) && metaDescription.length <= LIMITS.metaDescriptionMax,
      severity: "blocker",
      hint: metaDescription
        ? `Currently ${metaDescription.length} characters.`
        : "This is the snippet a searcher reads before deciding to click.",
    },
    {
      id: "focus-keyword",
      label: "Focus keyword set",
      passed: Boolean(txt(form.focus_keyword)),
      severity: "blocker",
      hint: "Everything else on this checklist is measured against it.",
    },
    {
      id: "featured-image",
      label: "Featured image uploaded",
      passed: hasImage,
      severity: "blocker",
      hint: "No image means no image search traffic and a blank social card.",
    },
    {
      id: "alt-text",
      label: "Featured image alt text written",
      passed: Boolean(txt(form.alt_text)),
      severity: "blocker",
      hint: "Describe the image in a sentence. Required, not optional.",
    },
    {
      id: "direct-answer",
      label: "Direct answer written",
      passed: Boolean(txt(form.direct_answer)),
      severity: "blocker",
      hint: "The block answer engines lift when they cite this page.",
    },
    {
      id: "internal-link",
      label: "At least one internal link in the content",
      passed: internalLinks.length > 0,
      severity: "blocker",
      hint: "Link to another page on the site so this post is not a dead end.",
    },
    {
      id: "faq-block",
      label: faqRequired
        ? `At least ${LIMITS.faqMinimum} FAQ pairs (post is ${wordCount} words)`
        : `FAQ pairs (required above ${LIMITS.faqRequiredAboveWords} words)`,
      passed: faqRequired ? faqs.length >= LIMITS.faqMinimum : true,
      severity: "blocker",
      hint: `Long posts need ${LIMITS.faqMinimum} question-and-answer pairs to qualify for FAQ rich results.`,
    },
    {
      id: "direct-answer-length",
      label: `Direct answer is ${LIMITS.directAnswerIdealMin}–${LIMITS.directAnswerIdealMax} words (now ${answerWords})`,
      passed:
        !txt(form.direct_answer) ||
        (answerWords >= LIMITS.directAnswerMinWords && answerWords <= LIMITS.directAnswerMaxWords),
      severity: "warning",
      hint: "Short enough to quote whole, long enough to stand on its own.",
    },
    {
      id: "heading-hierarchy",
      label: "Heading hierarchy is valid",
      passed: headingAudit.valid,
      severity: "warning",
      hint: headingAudit.issues.map((i) => i.message).join(" "),
    },
    {
      id: "key-facts",
      label: "At least one attributed fact",
      passed: facts.length > 0,
      severity: "warning",
      hint: "Answer engines cite attributable facts far more often than prose.",
    },
    {
      id: "author",
      label: "Author named",
      passed: Boolean(txt(form.author_name)),
      severity: "warning",
      hint: "Named authorship is a direct expertise signal.",
    },
    {
      id: "content-length",
      label: `Content is at least ${LIMITS.minWordCount} words (now ${wordCount})`,
      passed: wordCount >= LIMITS.minWordCount,
      severity: "warning",
      hint: "Thin pages rarely earn a citation.",
    },
  ];

  const blockers = checks.filter((c) => !c.passed && c.severity === "blocker");
  const warnings = checks.filter((c) => !c.passed && c.severity === "warning");

  return {
    ok: blockers.length === 0,
    checks,
    blockers,
    warnings,
    stats: {
      wordCount,
      readingTime: readingTime(content),
      internalLinks,
      faqCount: faqs.length,
      factCount: facts.length,
      headingIssues: headingAudit.issues,
      answerWords,
    },
  };
};

/** Counter colour band for a length-limited field. */
export const counterState = (length, { min, ideal, max }) => {
  if (length === 0) return "empty";
  if (length > max) return "over";
  if (length >= (ideal ?? min) && length <= max) return "good";
  if (length < min) return "short";
  return "ok";
};

/* ────────────────────────────────────────────────────────────────────────
   Outbound links
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Links pointing at other websites.
 *
 * Citing a credible outside source is a trust signal in its own right, and it
 * is the counterpart to internal linking: one shows the post is connected to
 * the rest of the site, the other shows it is connected to the wider web.
 */
export const extractExternalLinks = (html, siteHost = "geniemedia.in") => {
  const out = [];
  const re = /<a\b[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const host = String(siteHost).replace(/^www\./, "").toLowerCase();
  let m;

  while ((m = re.exec(String(html || "")))) {
    try {
      const linkHost = new URL(m[1]).hostname.replace(/^www\./, "").toLowerCase();
      if (linkHost !== host) out.push({ anchor_text: stripHtml(m[2]), url: m[1] });
    } catch {
      /* malformed href — not a usable link either way */
    }
  }

  return out;
};

/* ────────────────────────────────────────────────────────────────────────
   Score
   ──────────────────────────────────────────────────────────────────────── */

// The six checks that also block a publish. Each is worth an equal share of the
// 60% band, scored pass/fail — there is no partial credit for half an alt text.
const SCORE_REQUIRED_IDS = [
  "meta-description",
  "focus-keyword",
  "featured-image",
  "alt-text",
  "direct-answer",
  "internal-link",
];

const SCORE_WEIGHTS = { required: 60, keyword: 25, extras: 15 };

/**
 * Plain-language replacements for the check labels.
 *
 * The stored labels are accurate but written for someone who already knows what
 * a meta description is. These say what to actually go and do instead, which is
 * the only thing a non-technical editor can act on.
 */
const PLAIN_TIPS = {
  "meta-description":
    "Write the one or two sentences that show under your title in Google. Think of it as the reason someone should click.",
  "focus-keyword":
    "Pick the one phrase someone would type into Google to find this post, and put it in the keyword box.",
  "featured-image": "Upload a photo for this post. Posts with a picture get noticeably more clicks.",
  "alt-text":
    "Write one sentence describing what is in your photo. Blind readers hear this, and Google reads it too.",
  "direct-answer":
    "Write the short answer to the question this post asks. This is the part ChatGPT and Google quote when they mention you.",
  "internal-link":
    "Link to at least one other page on your own site from inside the article, so readers have somewhere to go next.",
  "meta-title": "Give the post a short title for Google — around 50 to 60 characters works best.",
  "faq-block":
    "This post is long, so add at least three common questions and answers at the bottom.",
  "direct-answer-length":
    "Aim for roughly 40 to 60 words in the short answer — a full thought, but not a paragraph.",
  "heading-hierarchy": "Use subheadings in order without skipping. Break the post into clear sections.",
  "key-facts":
    "Add a fact or statistic with a link to where it came from. AI tools quote sourced facts far more often.",
  author: "Put your name on the post. Readers and Google both trust a named writer more than an anonymous one.",
  "content-length": "This post is quite short. A bit more detail usually helps it rank.",
  "areas-covered": "If this post is about a specific city or area, list it so nearby people can find it.",
  reviewer: "Add who checked this post. A second name is a strong trust signal, especially for advice.",
};

/**
 * Plain-language labels for the checklist.
 *
 * The check objects carry accurate labels written for someone who already knows
 * the vocabulary. These are what a non-technical editor actually reads, so they
 * name the thing on screen rather than the field in the database. Nothing here
 * changes what is checked — only how it is described.
 */
const PLAIN_LABELS = {
  "meta-description": "Description for Google written",
  "focus-keyword": "Main keyword chosen",
  "featured-image": "Photo added",
  "alt-text": "Photo described",
  "direct-answer": "Short answer written",
  "internal-link": "Links to another page on your site",
  "kw-title": "Keyword appears in the title",
  "kw-intro": "Keyword appears in the opening paragraph",
  "kw-h2": "Keyword appears in a subheading",
  "kw-meta": "Keyword appears in the Google description",
  "kw-slug": "Keyword appears in the page address",
  "kw-alt": "Keyword appears in the photo description",
  "kw-density": "Keyword used about the right number of times",
};

const KEYWORD_TIPS = {
  "kw-title": "Try including your main keyword in the title.",
  "kw-intro": "Try using your main keyword in the first paragraph.",
  "kw-h2": "Try including your main keyword in one of your subheadings.",
  "kw-meta": "Try using your main keyword in the Google description.",
  "kw-slug": "Try including your main keyword in the page address.",
  "kw-alt": "Try mentioning your main keyword when describing your photo.",
  "kw-density":
    "Use your main keyword a few more times — or a few less, if it is starting to read oddly.",
};

/**
 * One 0-100 number built from the checks that already exist.
 *
 * Deliberately NOT a new scoring engine: every input here is a pass/fail that
 * `validateForPublish` or `analyseFocusKeyword` already computed. The score only
 * decides how much each one is worth, so it can never disagree with the
 * checklist shown right below it.
 *
 * Returns `{ score, band, mustFix, niceToHave, items, visible }`. `visible` is
 * false on an untouched form — showing a hard 0 to someone who has typed
 * nothing is discouraging and tells them nothing they do not already know.
 */
export const computeSeoScore = (form) => {
  const validation = validateForPublish(form);
  const keyword = analyseFocusKeyword({
    keyword: form.focus_keyword,
    title: form.title,
    metaTitle: form.meta_title,
    metaDescription: form.metaDescription,
    permalink: form.permalink,
    altText: form.alt_text,
    content: form.description || "",
  });

  const byId = Object.fromEntries(validation.checks.map((c) => [c.id, c]));

  // ---- Required band ------------------------------------------------------
  const requiredItems = SCORE_REQUIRED_IDS.map((id) => ({
    id,
    label: PLAIN_LABELS[id] || (byId[id] ? byId[id].label : id),
    passed: Boolean(byId[id] && byId[id].passed),
    tip: PLAIN_TIPS[id] || "",
    group: "required",
  }));

  const requiredPassed = requiredItems.filter((i) => i.passed).length;
  const requiredScore = (requiredPassed / SCORE_REQUIRED_IDS.length) * SCORE_WEIGHTS.required;

  // ---- Keyword band -------------------------------------------------------
  // Worth nothing until a focus keyword exists, because every check inside it is
  // measured against that keyword and would otherwise all read as failures.
  const hasKeyword = Boolean(String(form.focus_keyword || "").trim());

  const keywordItems = keyword.checks.map((c) => ({
    id: c.id,
    label: PLAIN_LABELS[c.id] || c.label,
    passed: hasKeyword && c.passed,
    tip: KEYWORD_TIPS[c.id] || c.hint || "",
    group: "keyword",
  }));

  const keywordScore = hasKeyword
    ? (keyword.checks.filter((c) => c.passed).length / keyword.checks.length) * SCORE_WEIGHTS.keyword
    : 0;

  // ---- Extras band --------------------------------------------------------
  const areas = Array.isArray(form.areas_covered) ? form.areas_covered.filter(Boolean) : [];
  const facts = (form.key_facts || []).filter((f) => f && String(f.fact || "").trim());
  const faqs = (form.faq_schema || []).filter(
    (f) => f && String(f.question || "").trim() && String(f.answer || "").trim()
  );

  const extraItems = [
    {
      id: "faq-present",
      label: "Common questions added",
      passed: faqs.length > 0,
      tip: "Add a few questions people actually ask. Google shows these directly in search results.",
      group: "extra",
    },
    {
      id: "key-facts",
      label: "A fact with a source",
      passed: facts.length > 0,
      tip: PLAIN_TIPS["key-facts"],
      group: "extra",
    },
    {
      id: "areas-covered",
      label: "Areas this post covers",
      passed: areas.length > 0,
      tip: PLAIN_TIPS["areas-covered"],
      group: "extra",
    },
    {
      id: "reviewer",
      label: "Checked by someone",
      passed: Boolean(String(form.reviewer_name || "").trim()),
      tip: PLAIN_TIPS.reviewer,
      group: "extra",
    },
    {
      id: "heading-hierarchy",
      label: "Sections are in a clear order",
      passed: Boolean(byId["heading-hierarchy"] && byId["heading-hierarchy"].passed),
      tip: PLAIN_TIPS["heading-hierarchy"],
      group: "extra",
    },
  ];

  const extrasScore =
    (extraItems.filter((i) => i.passed).length / extraItems.length) * SCORE_WEIGHTS.extras;

  const score = Math.round(requiredScore + keywordScore + extrasScore);
  const band = score >= 75 ? "green" : score >= 40 ? "amber" : "red";

  const items = [...requiredItems, ...keywordItems, ...extraItems];

  return {
    score,
    band,
    // "Must fix" comes from the real publish gate rather than from the required
    // band above, so the count can never promise a publish the server refuses.
    mustFix: validation.blockers.length,
    niceToHave: items.filter((i) => !i.passed && i.group !== "required").length,
    items,
    validation,
    keyword,
    visible: Boolean(String(form.title || "").trim() || String(form.description || "").trim()),
  };
};

/** Colours for a score band, shared by the widget and the checklist. */
export const SCORE_BANDS = {
  red: { bg: "#fee2e2", fg: "#b91c1c", bar: "#dc2626", label: "Needs work" },
  amber: { bg: "#fef3c7", fg: "#b45309", bar: "#d97706", label: "Getting there" },
  green: { bg: "#dcfce7", fg: "#15803d", bar: "#16a34a", label: "Looking good" },
};

/**
 * Which panel section a score item belongs to, so clicking it can scroll there.
 * Keys match the section ids rendered by SeoPanel.
 */
export const ITEM_SECTION = {
  "meta-description": "seo",
  "focus-keyword": "seo",
  "meta-title": "seo",
  "kw-title": "seo",
  "kw-intro": "seo",
  "kw-h2": "seo",
  "kw-meta": "seo",
  "kw-slug": "seo",
  "kw-alt": "seo",
  "kw-density": "seo",
  "direct-answer": "aeo",
  "direct-answer-length": "aeo",
  "faq-present": "aeo",
  "faq-block": "aeo",
  "key-facts": "geo",
  "heading-hierarchy": "geo",
  "content-length": "geo",
  "areas-covered": "areas",
  reviewer: "people",
  author: "people",
  "featured-image": "photo",
  "alt-text": "photo",
  "internal-link": "links",
};
