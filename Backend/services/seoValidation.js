/**
 * Server-side publish gate.
 *
 * The admin panel renders the same checklist live so nobody is surprised at the
 * end, but this file is what actually decides. A check that only exists in the
 * browser is a suggestion; a post can still be published by replaying the
 * request with curl, and the one time that happens is the time an unindexable
 * post goes live.
 *
 * Drafts are never blocked — half-finished work has to be saveable. The gate
 * applies only to `status = 'published'`.
 */

const { deriveContentMetrics, auditHeadings, countWords } = require("./contentAnalysis");
const { asArray } = require("./structuredData");

const LIMITS = {
  metaTitleMax: 60,
  metaTitleMin: 30,
  metaDescriptionMax: 160,
  metaDescriptionMin: 70,
  directAnswerMinWords: 25,
  directAnswerMaxWords: 80,
  altTextMax: 200,
  focusKeywordMax: 100,
  faqRequiredAboveWords: 800,
  faqMinimum: 3,
};

const text = (value) => String(value === null || value === undefined ? "" : value).trim();
const wordsIn = (value) => text(value).split(/\s+/).filter(Boolean).length;

/**
 * Runs every publish rule against a candidate post.
 *
 * Returns `{ ok, blockers, warnings, checks }` where `checks` is the full
 * red/green list for the UI, `blockers` are the failures that stop a publish and
 * `warnings` are things worth fixing that do not.
 *
 * @param {object} blog   The post as it would be stored (snake_case SEO fields).
 * @param {object} [opts] `{ enforce }` — false returns the checklist without gating.
 */
function validateForPublish(blog, opts = {}) {
  const content = blog.description || "";
  const metrics = deriveContentMetrics(content);
  const headingAudit = auditHeadings(content);
  const wordCount = metrics.word_count || countWords(content);

  const metaTitle = text(blog.meta_title) || text(blog.title);
  const metaDescription = text(blog.metaDescription || blog.meta_description);
  const focusKeyword = text(blog.focus_keyword);
  const altText = text(blog.alt_text);
  const directAnswer = text(blog.direct_answer);
  const faqs = asArray(blog.faq_schema).filter((f) => text(f.question) && text(f.answer));
  const hasImage = Boolean(text(blog.image) || text(blog.existingImage));

  /** @type {{id:string,label:string,passed:boolean,severity:'blocker'|'warning',message:string}[]} */
  const checks = [];
  const add = (id, label, passed, message, severity = "blocker") =>
    checks.push({ id, label, passed, severity, message });

  // ---- Core SERP metadata -------------------------------------------------
  add(
    "meta-title",
    `Meta title present and under ${LIMITS.metaTitleMax} characters`,
    Boolean(metaTitle) && metaTitle.length <= LIMITS.metaTitleMax,
    !metaTitle
      ? "Add a meta title. Without one, Google writes its own from the page and it is usually worse."
      : `Meta title is ${metaTitle.length} characters. Trim it to ${LIMITS.metaTitleMax} or fewer or it gets cut off in results.`
  );

  add(
    "meta-title-length",
    `Meta title is at least ${LIMITS.metaTitleMin} characters`,
    metaTitle.length >= LIMITS.metaTitleMin,
    "Very short titles waste the width Google gives you and usually get rewritten.",
    "warning"
  );

  add(
    "meta-description",
    `Meta description present and under ${LIMITS.metaDescriptionMax} characters`,
    Boolean(metaDescription) && metaDescription.length <= LIMITS.metaDescriptionMax,
    !metaDescription
      ? "Add a meta description — it is the snippet a searcher reads before deciding to click."
      : `Meta description is ${metaDescription.length} characters and will be truncated at ${LIMITS.metaDescriptionMax}.`
  );

  add(
    "meta-description-length",
    `Meta description is at least ${LIMITS.metaDescriptionMin} characters`,
    metaDescription.length >= LIMITS.metaDescriptionMin,
    "Under 70 characters leaves most of the snippet empty.",
    "warning"
  );

  add(
    "focus-keyword",
    "Focus keyword set",
    Boolean(focusKeyword) && focusKeyword.length <= LIMITS.focusKeywordMax,
    focusKeyword
      ? `Focus keyword is longer than ${LIMITS.focusKeywordMax} characters.`
      : "Set the one phrase this post should rank for. Everything else on this checklist is measured against it."
  );

  // ---- Imagery ------------------------------------------------------------
  add(
    "featured-image",
    "Featured image uploaded",
    hasImage,
    "A post with no image gets no image-search traffic and a blank social preview card."
  );

  add(
    "alt-text",
    "Featured image alt text present",
    Boolean(altText) && altText.length <= LIMITS.altTextMax,
    altText
      ? `Alt text is longer than ${LIMITS.altTextMax} characters.`
      : "Describe the image in a sentence. Screen readers read it aloud and image search indexes it."
  );

  // ---- AEO ----------------------------------------------------------------
  const answerWords = wordsIn(directAnswer);
  add(
    "direct-answer",
    "Direct answer written",
    Boolean(directAnswer),
    "Write the one-paragraph answer. It is the block answer engines lift when they cite this page."
  );

  add(
    "direct-answer-length",
    `Direct answer is ${LIMITS.directAnswerMinWords}-${LIMITS.directAnswerMaxWords} words (currently ${answerWords})`,
    !directAnswer || (answerWords >= LIMITS.directAnswerMinWords && answerWords <= LIMITS.directAnswerMaxWords),
    answerWords < LIMITS.directAnswerMinWords
      ? "Too short to stand on its own once it is quoted away from the page."
      : "Too long to be pulled as a snippet — tighten it to a single self-contained paragraph.",
    "warning"
  );

  // ---- Internal linking ---------------------------------------------------
  add(
    "internal-link",
    "At least one internal link in the content",
    metrics.internal_links.length > 0,
    "Link to at least one other page on the site so this post is not a dead end for crawlers or readers."
  );

  // ---- GEO / structure ----------------------------------------------------
  add(
    "heading-hierarchy",
    "Heading hierarchy is valid (one H1, no skipped levels)",
    headingAudit.valid,
    headingAudit.issues.map((i) => i.message).join(" ") || "",
    "warning"
  );

  const faqRequired = wordCount > LIMITS.faqRequiredAboveWords;
  add(
    "faq-block",
    faqRequired
      ? `At least ${LIMITS.faqMinimum} FAQ pairs (post is ${wordCount} words)`
      : "FAQ pairs added (optional below 800 words)",
    faqRequired ? faqs.length >= LIMITS.faqMinimum : true,
    `This post is over ${LIMITS.faqRequiredAboveWords} words, so it needs at least ${LIMITS.faqMinimum} question-and-answer pairs to qualify for FAQ rich results.`
  );

  add(
    "key-facts",
    "At least one attributed fact or statistic",
    asArray(blog.key_facts).filter((f) => text(f.fact)).length > 0,
    "Answer engines cite pages with attributable facts far more often than pages of narrative prose.",
    "warning"
  );

  add(
    "author",
    "Author named",
    Boolean(text(blog.author_name)),
    "Named authorship is a direct experience-and-expertise signal.",
    "warning"
  );

  add(
    "content-length",
    "Content is at least 300 words",
    wordCount >= 300,
    `This post is ${wordCount} words. Thin pages rarely earn a citation.`,
    "warning"
  );

  const blockers = checks.filter((c) => !c.passed && c.severity === "blocker");
  const warnings = checks.filter((c) => !c.passed && c.severity === "warning");

  return {
    ok: blockers.length === 0,
    enforced: opts.enforce !== false,
    blockers,
    warnings,
    checks,
    stats: {
      wordCount,
      readingTime: metrics.reading_time_minutes,
      internalLinks: metrics.internal_links.length,
      faqCount: faqs.length,
      metaTitleLength: metaTitle.length,
      metaDescriptionLength: metaDescription.length,
      directAnswerWords: answerWords,
      headingIssues: headingAudit.issues,
    },
  };
}

/** Human-readable summary for the toast the admin panel shows on rejection. */
const describeBlockers = (result) =>
  result.blockers.map((b) => b.message || b.label).join(" ");

module.exports = { validateForPublish, describeBlockers, LIMITS };
