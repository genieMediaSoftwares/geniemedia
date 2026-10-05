/**
 * Page-level SEO audit for the public pages (/, /digital_marketing, ...).
 *
 * The blog editor has its own analyzer (seoAnalysis.ts). This one scores a
 * whole published page, and it never reads raw HTML: it takes a clean
 * SeoDocument that the caller has already extracted from the visible main
 * content (see scripts/seo-audit.mjs). That separation is the fix for
 * impossible numbers such as "6,879 keyword occurrences in 910 words":
 * a Next.js page carries a second copy of all its text inside <script> tags
 * (the React payload), plus class names, JSON-LD and URLs, and any tool that
 * counts raw HTML counts all of that as prose.
 *
 * Every category is passed checks / total checks, so a score of 100% means
 * every listed check passed, nothing more. Keyword density is reported but is
 * only ever a ceiling: overuse fails a check, more mentions never earn points.
 */

export interface SeoImage {
  src: string;
  /** null when the alt attribute is missing; "" when marked decorative. */
  alt: string | null;
  hasDimensions: boolean;
}

export interface SeoLink {
  href: string;
  text: string;
  internal: boolean;
}

export interface SeoMetadata {
  titles: string[];
  descriptions: string[];
  canonicals: string[];
  robots: string;
  lang: string;
  hasViewport: boolean;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  twitterCard: string;
}

/** Everything the audit needs, already reduced to what a visitor can read. */
export interface SeoDocument {
  url: string;
  /** Visible prose of the main content, one entry per paragraph or list item. */
  paragraphs: string[];
  /** All visible text of the main content (paragraphs, headings, buttons...). */
  text: string;
  /** Visible text of the whole page, header and footer included (for NAP). */
  pageText: string;
  headings: Array<{ level: number; text: string }>;
  links: SeoLink[];
  images: SeoImage[];
  metadata: SeoMetadata;
  /** Parsed JSON-LD blocks; a block that failed to parse is recorded as null. */
  structuredData: Array<Record<string, unknown> | null>;
}

export interface AuditOptions {
  /** Main topic phrase, e.g. "digital marketing". */
  keyword: string;
  /** Location names that count as local relevance. */
  locations: string[];
  /** Phrases the business's address/phone are recognised by. */
  napPhrases: string[];
  /** Minimum useful word count for this kind of page. */
  minWords: number;
  /** Paths that exist on the site (for broken-link checks). */
  knownPaths?: Set<string>;
}

export interface AuditCheck {
  id: string;
  label: string;
  passed: boolean;
  detail?: string;
}

export interface AuditCategory {
  name: string;
  weight: number;
  score: number;
  checks: AuditCheck[];
}

export interface AuditResult {
  score: number;
  categories: AuditCategory[];
  stats: {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    keywordOccurrences: number;
    keywordDensity: number;
    readability: number | null;
    readabilityLabel: string;
    avgSentenceLength: number;
    transitionShare: number;
    images: number;
    imagesWithAlt: number;
    decorativeImages: number;
    internalLinks: number;
    externalLinks: number;
    topWords: Array<[string, number]>;
  };
}

export const AUDIT_LIMITS = {
  titleMin: 30,
  titleMax: 60,
  descriptionMin: 120,
  descriptionMax: 160,
  readabilityMin: 50,
  sentenceLengthMax: 20,
  transitionShareMin: 20,
  /** Above this, the keyword is flagged as overused. */
  densityMax: 3,
  internalLinksMin: 5,
  minProseWords: 100,
  minProseSentences: 3,
} as const;

/* ── Text helpers ───────────────────────────────────────────────────────── */

const normalise = (s: string): string =>
  s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const words = (s: string): string[] => {
  const n = normalise(s);
  return n ? n.split(" ") : [];
};

/** Non-overlapping occurrences of a phrase, matched on whole words. */
export const countPhrase = (text: string, phrase: string): number => {
  const hay = words(text);
  const needle = words(phrase);
  if (!needle.length) return 0;
  let count = 0;
  for (let i = 0; i + needle.length <= hay.length; ) {
    let match = true;
    for (let j = 0; j < needle.length; j++) {
      if (hay[i + j] !== needle[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      count += 1;
      i += needle.length;
    } else {
      i += 1;
    }
  }
  return count;
};

/** (occurrences / total words) x 100. Bounded at 100 because a phrase cannot occur more often than there are words. */
export const phraseDensity = (text: string, phrase: string): { occurrences: number; totalWords: number; density: number } => {
  const totalWords = words(text).length;
  const occurrences = countPhrase(text, phrase);
  const density = totalWords ? Math.min(100, (occurrences / totalWords) * 100) : 0;
  return { occurrences, totalWords, density: Number(density.toFixed(2)) };
};

export const sentencesOf = (paragraphs: string[]): string[] =>
  paragraphs
    .flatMap((p) => p.split(/(?<=[.!?])\s+/))
    .map((s) => s.trim())
    .filter((s) => words(s).length >= 3);

const syllables = (word: string): number => {
  const w = word.replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const groups = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "").match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
};

/** Flesch reading ease of the prose, or null when there is too little prose to measure. */
export const readability = (paragraphs: string[]): number | null => {
  const sentences = sentencesOf(paragraphs);
  const w = sentences.flatMap(words);
  if (w.length < AUDIT_LIMITS.minProseWords || sentences.length < AUDIT_LIMITS.minProseSentences) return null;
  const syl = w.reduce((sum, x) => sum + syllables(x), 0);
  const score = 206.835 - 1.015 * (w.length / sentences.length) - 84.6 * (syl / w.length);
  return Number(Math.max(0, Math.min(100, score)).toFixed(1));
};

const TRANSITIONS = [
  "first", "second", "third", "next", "then", "finally", "also", "in addition", "additionally", "however",
  "for example", "for instance", "as a result", "because", "therefore", "so", "meanwhile", "after that",
  "instead", "plus", "that means", "this means", "in short", "above all", "on top of that", "at the same time",
  "once", "while", "when", "since", "even", "but", "besides", "similarly", "likewise", "in other words", "to start",
  "after", "before", "later", "that way", "this way", "otherwise", "of course",
];

const hasTransition = (sentence: string): boolean => {
  const w = ` ${normalise(sentence)} `;
  return TRANSITIONS.some((t) => w.includes(` ${t} `));
};

const STOP = new Set(
  "a an and are as at be by can for from has have in is it its of on or our that the their them they this to we with you your will more into not but all any what how who when which do does".split(" "),
);

/* ── Audit ──────────────────────────────────────────────────────────────── */

const category = (name: string, weight: number, checks: AuditCheck[]): AuditCategory => ({
  name,
  weight,
  checks,
  score: checks.length ? Math.round((checks.filter((c) => c.passed).length / checks.length) * 100) : 100,
});

const has = (haystack: string, needle: string): boolean => countPhrase(haystack, needle) > 0;
const hasAny = (haystack: string, needles: string[]): boolean => needles.some((n) => has(haystack, n));

const schemaNodes = (blocks: SeoDocument["structuredData"]): Array<Record<string, unknown>> =>
  blocks.flatMap((b) => {
    if (!b) return [];
    const graph = b["@graph"];
    return Array.isArray(graph) ? (graph as Array<Record<string, unknown>>) : [b];
  });

const typesOf = (node: Record<string, unknown>): string[] => {
  const t = node["@type"];
  return Array.isArray(t) ? t.map(String) : t ? [String(t)] : [];
};

/**
 * A phone number matches on its digits alone, so "+91 90328 45433" and
 * "+91 9032845433" are the same number; any other phrase matches on words.
 */
const napVisible = (text: string, phrase: string): boolean =>
  /\d/.test(phrase) ? text.replace(/\D/g, "").includes(phrase.replace(/\D/g, "")) : has(text, phrase);

const sameUrl = (a: string, b: string): boolean => a.replace(/\/+$/, "") === b.replace(/\/+$/, "");

const VAGUE_ANCHORS = new Set(["click here", "here", "read more", "learn more", "more", "link", "this"]);

export const auditPage = (doc: SeoDocument, opts: AuditOptions): AuditResult => {
  const m = doc.metadata;
  const title = m.titles[0] ?? "";
  const description = m.descriptions[0] ?? "";
  const h1s = doc.headings.filter((h) => h.level === 1);
  const h2s = doc.headings.filter((h) => h.level === 2);
  const prose = doc.paragraphs.join(" ");
  const sentences = sentencesOf(doc.paragraphs);
  const wordCount = words(doc.text).length;
  const density = phraseDensity(doc.text, opts.keyword);
  const flesch = readability(doc.paragraphs);
  const sentenceWords = sentences.map((s) => words(s).length);
  const avgSentence = sentenceWords.length ? sentenceWords.reduce((a, b) => a + b, 0) / sentenceWords.length : 0;
  const transitionShare = sentences.length ? (sentences.filter(hasTransition).length / sentences.length) * 100 : 0;
  const internal = doc.links.filter((l) => l.internal);
  const external = doc.links.filter((l) => !l.internal);
  const contentImages = doc.images;
  const nodes = schemaNodes(doc.structuredData);
  const allTypes = nodes.flatMap(typesOf);
  const isHome = new URL(doc.url).pathname === "/";

  // Skipped heading levels (h2 -> h4) make the outline hard to follow.
  let skipped = false;
  doc.headings.reduce((prev, h) => {
    if (h.level > prev + 1) skipped = true;
    return h.level;
  }, 1);

  const technical = category("Technical SEO", 20, [
    { id: "one-title", label: "Exactly one <title>", passed: m.titles.length === 1, detail: `${m.titles.length} found` },
    { id: "one-description", label: "Exactly one meta description", passed: m.descriptions.length === 1, detail: `${m.descriptions.length} found` },
    { id: "one-canonical", label: "Exactly one canonical", passed: m.canonicals.length === 1, detail: `${m.canonicals.length} found` },
    { id: "self-canonical", label: "Canonical points to this page", passed: !!m.canonicals[0] && sameUrl(m.canonicals[0], doc.url), detail: m.canonicals[0] },
    { id: "indexable", label: "Page is indexable", passed: !/noindex/i.test(m.robots), detail: m.robots || "no robots meta" },
    { id: "lang", label: "<html lang> is set", passed: !!m.lang },
    { id: "viewport", label: "Mobile viewport meta", passed: m.hasViewport },
    { id: "ssr-content", label: "Main content is in the initial HTML", passed: wordCount >= 50, detail: `${wordCount} words server-rendered` },
  ]);

  const metadata = category("Metadata", 15, [
    { id: "title-length", label: `Title ${AUDIT_LIMITS.titleMin}-${AUDIT_LIMITS.titleMax} characters`, passed: title.length >= AUDIT_LIMITS.titleMin && title.length <= AUDIT_LIMITS.titleMax, detail: `${title.length}: "${title}"` },
    { id: "description-length", label: `Description ${AUDIT_LIMITS.descriptionMin}-${AUDIT_LIMITS.descriptionMax} characters`, passed: description.length >= AUDIT_LIMITS.descriptionMin && description.length <= AUDIT_LIMITS.descriptionMax, detail: `${description.length}` },
    { id: "kw-title", label: "Topic in the title", passed: has(title, opts.keyword) },
    { id: "kw-description", label: "Topic in the description", passed: has(description, opts.keyword) },
    { id: "og", label: "Open Graph title, description and URL", passed: !!m.ogTitle && !!m.ogDescription && !!m.ogUrl && sameUrl(m.ogUrl, doc.url) },
    { id: "twitter", label: "Twitter card", passed: !!m.twitterCard },
  ]);

  const content = category("Content Quality", 20, [
    { id: "length", label: `At least ${opts.minWords} words of content`, passed: wordCount >= opts.minWords, detail: `${wordCount} words` },
    { id: "kw-body", label: "Topic used in the body", passed: density.occurrences > 0, detail: `${density.occurrences} times` },
    { id: "kw-overuse", label: `No keyword overuse (density at most ${AUDIT_LIMITS.densityMax}%)`, passed: density.density <= AUDIT_LIMITS.densityMax, detail: density.density > AUDIT_LIMITS.densityMax ? `Potential keyword overuse: ${density.density}%` : `${density.density}%` },
    { id: "kw-early", label: "Topic in the opening paragraph", passed: !!doc.paragraphs[0] && has(doc.paragraphs.slice(0, 2).join(" "), opts.keyword) },
    { id: "readability", label: `Readability (Flesch) at least ${AUDIT_LIMITS.readabilityMin}`, passed: flesch !== null && flesch >= AUDIT_LIMITS.readabilityMin, detail: flesch === null ? "insufficient prose" : String(flesch) },
    { id: "sentence-length", label: `Average sentence at most ${AUDIT_LIMITS.sentenceLengthMax} words`, passed: avgSentence > 0 && avgSentence <= AUDIT_LIMITS.sentenceLengthMax, detail: avgSentence.toFixed(1) },
    { id: "transitions", label: `Transition words in at least ${AUDIT_LIMITS.transitionShareMin}% of sentences`, passed: transitionShare >= AUDIT_LIMITS.transitionShareMin, detail: `${transitionShare.toFixed(0)}%` },
  ]);

  const headings = category("Headings", 10, [
    { id: "one-h1", label: "Exactly one H1", passed: h1s.length === 1, detail: `${h1s.length} found` },
    { id: "kw-h1", label: "Topic in the H1", passed: !!h1s[0] && has(h1s[0].text, opts.keyword) },
    { id: "h2s", label: "At least three H2 sections", passed: h2s.length >= 3, detail: `${h2s.length}` },
    { id: "kw-h2", label: "Topic in at least one H2", passed: h2s.some((h) => has(h.text, opts.keyword)) },
    { id: "no-skips", label: "No skipped heading levels", passed: !skipped },
  ]);

  const broken = opts.knownPaths ? internal.filter((l) => !opts.knownPaths!.has(new URL(l.href, doc.url).pathname.replace(/\/+$/, "") || "/")) : [];
  const vague = internal.filter((l) => VAGUE_ANCHORS.has(normalise(l.text)));
  const linking = category("Internal Linking", 10, [
    { id: "count", label: `At least ${AUDIT_LIMITS.internalLinksMin} internal links in the content`, passed: internal.length >= AUDIT_LIMITS.internalLinksMin, detail: `${internal.length}` },
    { id: "contact", label: "Links to the contact page", passed: new URL(doc.url).pathname === "/contact" || internal.some((l) => new URL(l.href, doc.url).pathname === "/contact") },
    { id: "descriptive", label: "Descriptive anchor text", passed: vague.length === 0, detail: vague.map((l) => l.text).join(", ") || undefined },
    { id: "not-broken", label: "No broken internal links", passed: broken.length === 0, detail: broken.map((l) => l.href).join(", ") || undefined },
  ]);

  const missingAlt = contentImages.filter((i) => i.alt === null);
  const images = category("Image SEO", 5, [
    { id: "alt", label: "Every image has alt text (or alt=\"\" if decorative)", passed: missingAlt.length === 0, detail: missingAlt.map((i) => i.src).join(", ") || undefined },
    { id: "alt-length", label: "Alt text is a description, not a keyword list (at most 125 characters)", passed: contentImages.every((i) => (i.alt ?? "").length <= 125) },
    { id: "dimensions", label: "Width and height set (no layout shift)", passed: contentImages.every((i) => i.hasDimensions) },
  ]);

  const faqNode = nodes.find((n) => typesOf(n).includes("FAQPage"));
  const faqQuestions = faqNode && Array.isArray(faqNode.mainEntity) ? (faqNode.mainEntity as Array<Record<string, unknown>>).map((q) => String(q.name ?? "")) : [];
  const visibleHeadingText = doc.headings.map((h) => normalise(h.text));
  const structured = category("Structured Data", 10, [
    { id: "valid", label: "All JSON-LD blocks are valid JSON", passed: doc.structuredData.length > 0 && doc.structuredData.every((b) => b !== null) },
    { id: "org", label: "Organization / LocalBusiness entity", passed: allTypes.some((t) => ["Organization", "LocalBusiness", "ProfessionalService"].includes(t)) },
    { id: "page", label: "WebPage / WebSite entity", passed: allTypes.some((t) => /Page$|^WebSite$/.test(t)) },
    { id: "breadcrumb", label: "BreadcrumbList (inner pages)", passed: isHome || allTypes.includes("BreadcrumbList") },
    { id: "faq-visible", label: "FAQ schema only for questions shown on the page", passed: faqQuestions.every((q) => visibleHeadingText.includes(normalise(q)) || has(doc.text, q)) },
    { id: "no-fake-ratings", label: "No self-awarded ratings", passed: !nodes.some((n) => "aggregateRating" in n) },
  ]);

  const local = category("Local SEO", 10, [
    { id: "loc-title", label: "Location in the title", passed: hasAny(title, opts.locations) },
    { id: "loc-description", label: "Location in the description", passed: hasAny(description, opts.locations) },
    { id: "loc-h1", label: "Location in the H1", passed: !!h1s[0] && hasAny(h1s[0].text, opts.locations) },
    { id: "loc-body", label: "Location used in the content", passed: hasAny(prose, opts.locations) },
    { id: "nap", label: "Address and phone visible on the page", passed: opts.napPhrases.every((p) => napVisible(doc.pageText, p)) },
    { id: "postal-address", label: "PostalAddress in structured data", passed: nodes.some((n) => typeof n.address === "object" && n.address !== null) },
  ]);

  const categories = [technical, metadata, content, headings, linking, images, structured, local];
  const totalWeight = categories.reduce((s, c) => s + c.weight, 0);
  const score = Math.round(categories.reduce((s, c) => s + c.score * c.weight, 0) / totalWeight);

  const freq = new Map<string, number>();
  for (const w of words(doc.text)) if (w.length > 2 && !STOP.has(w)) freq.set(w, (freq.get(w) ?? 0) + 1);

  return {
    score,
    categories,
    stats: {
      wordCount,
      sentenceCount: sentences.length,
      paragraphCount: doc.paragraphs.length,
      keywordOccurrences: density.occurrences,
      keywordDensity: density.density,
      readability: flesch,
      readabilityLabel: flesch === null ? "insufficient prose" : String(flesch),
      avgSentenceLength: Number(avgSentence.toFixed(1)),
      transitionShare: Number(transitionShare.toFixed(1)),
      images: contentImages.length,
      imagesWithAlt: contentImages.filter((i) => i.alt).length,
      decorativeImages: contentImages.filter((i) => i.alt === "").length,
      internalLinks: internal.length,
      externalLinks: external.length,
      topWords: [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10),
    },
  };
};
