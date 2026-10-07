export type KeywordType = "PRIMARY" | "SECONDARY" | "RELATED" | "LONG_TAIL" | "LOCAL" | "QUESTION" | "SEMANTIC";
export type SearchIntent = "INFORMATIONAL" | "COMMERCIAL" | "TRANSACTIONAL" | "NAVIGATIONAL" | "LOCAL";

export interface HealthBlock {
  section: string;
  text: string;
}

export interface HealthPage {
  title: string;
  description: string;
  h1s: string[];
  h2s: string[];
  h3s?: string[];
  openingText: string;
  text: string;
  links: Array<{ href: string; text: string }>;
  blocks?: HealthBlock[];
}

export interface HealthKeyword {
  keyword: string;
  type: KeywordType;
  intent: SearchIntent;
  active: boolean;
  priority?: string;
}

export interface HealthConfig {
  primaryTopic: string;
  secondaryTopics: string[];
  contentTopics: string[];
  faqTopics: string[];
  robotsIndex?: boolean;
  canonicalUrl?: string;
}

export interface HealthLocation {
  name: string;
  aliases: string[];
}

export interface HealthCaseStudy {
  title: string;
  clientName: string;
  href: string;
  services: string[];
  category: string;
}

export interface HealthOptions {
  cannibalized?: string[];
  caseStudies?: HealthCaseStudy[];
  pagePath?: string;
  siteName?: string;
  shortSiteName?: string;
}

export interface CoverageItem {
  keyword: string;
  type: KeywordType | "TOPIC";
  found: boolean;
  count: number;
  inTitle: boolean;
  inH1: boolean;
  inH2: boolean;
  repetitive: boolean;
}

export type CategoryId = "topic" | "semantic" | "intent" | "title" | "h1" | "h2" | "links" | "local" | "complete" | "meta";

export interface HealthCheck {
  label: string;
  ok: boolean;
}

export interface HealthCategory {
  id: CategoryId;
  label: string;
  score: number;
  max: number;
  measured: string;
  checks: HealthCheck[];
  needsFix: boolean;
}

export type IssueId =
  | "ROBOTS_NOINDEX"
  | "CANONICAL_EXTERNAL"
  | "H1_MISSING"
  | "H1_MULTIPLE"
  | "TITLE_RELEVANCE_LOW"
  | "TITLE_LENGTH"
  | "H1_RELEVANCE_LOW"
  | "META_DESCRIPTION_LENGTH"
  | "META_DESCRIPTION_REPETITION"
  | "META_DESCRIPTION_TOPIC"
  | "PRIMARY_MISSING_OPENING"
  | "MISSING_CASE_STUDY_LINK"
  | "MISSING_CONTACT_LINK"
  | "INTERNAL_LINKS_FEW"
  | "LOCATION_REPETITION"
  | "LOCAL_RELEVANCE_MISSING"
  | "KEYWORD_REPETITION"
  | "KEYWORD_CANNIBALIZATION"
  | "SECONDARY_TOPIC_MISSING"
  | "H2_TOPIC_MISSING"
  | "FAQ_TOPIC_MISSING"
  | "SEMANTIC_COVERAGE_LOW"
  | "CONTENT_SHORT";

export type IssueSeverity = "critical" | "high" | "medium" | "low" | "info";
export type FixMode = "SAFE_AUTO_FIX" | "REVIEW_REQUIRED" | "MANUAL_ONLY";
export type FixTarget = "metadata" | "title" | "description" | "h1" | "sections" | "links" | "topics" | "robots" | "canonical" | "content" | "keywords";

export type Suggestion =
  | { kind: "set-field"; field: "seoTitle" | "metaDescription" | "preferredH1" | "robotsIndex" | "canonicalUrl"; value: string | boolean; label: string; reason: string; source: "rule" }
  | { kind: "add-link"; link: { label: string; href: string }; label: string; reason: string; source: "rule" }
  | { kind: "add-section"; section: { heading: string; body: string }; label: string; reason: string; source: "rule" };

export interface Occurrence {
  section: string;
  text: string;
  count: number;
  terms: string[];
}

export interface SeoIssue {
  id: IssueId;
  category: CategoryId | null;
  severity: IssueSeverity;
  title: string;
  why: string;
  currentValue?: string;
  expectedValue?: string;
  recommendation: string;
  target: FixTarget;
  mode: FixMode;
  suggestions: Suggestion[];
  occurrences?: Occurrence[];
  detail?: string[];
}

export interface HealthReport {
  score: number;
  categories: HealthCategory[];
  warnings: string[];
  suggestions: string[];
  coverage: CoverageItem[];
  wordCount: number;
  locationMentions: number;
  primaryTopic: string;
  issues: SeoIssue[];
}

export const FIX_THRESHOLD = 0.9;

const STOP = new Set("a an and the of in for to with on at by from or is are your our we you how what does do much".split(" "));

export const normalizeText = (s: string): string =>
  ` ${String(s || "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim()} `;

const tokenize = (s: string): string[] => normalizeText(s).trim().split(" ").filter(Boolean);

interface Indexed {
  tokens: string[];
  positions: Map<string, number[]>;
}

const indexText = (s: string): Indexed => {
  const tokens = tokenize(s);
  const positions = new Map<string, number[]>();
  tokens.forEach((t, i) => {
    const list = positions.get(t);
    if (list) list.push(i);
    else positions.set(t, [i]);
  });
  return { tokens, positions };
};

const countIn = (doc: Indexed, phrase: string): number => {
  const p = tokenize(phrase);
  if (!p.length) return 0;
  const starts = doc.positions.get(p[0]);
  if (!starts) return 0;
  let n = 0;
  let next = 0;
  for (const pos of starts) {
    if (pos < next || pos + p.length > doc.tokens.length) continue;
    if (p.every((w, j) => doc.tokens[pos + j] === w)) {
      n++;
      next = pos + p.length;
    }
  }
  return n;
};

const significant = (phrase: string): string[] => tokenize(phrase).filter((w) => !STOP.has(w));

const coversIn = (doc: Indexed, phrase: string): boolean => {
  if (countIn(doc, phrase) > 0) return true;
  const words = significant(phrase);
  if (!words.length) return false;
  return words.every((w) => doc.positions.has(w) || doc.positions.has(`${w}s`));
};

export const countPhrase = (text: string, phrase: string): number => countIn(indexText(text), phrase);
export const coversTopic = (text: string, phrase: string): boolean => coversIn(indexText(text), phrase);

const ratio = (part: number, whole: number): number => (whole ? part / whole : 1);

const isInternal = (href: string): boolean => /^\/(?!\/)/.test(href) || /^https?:\/\/(www\.)?geniemedia\.in(\/|$)/i.test(href);

const ACRONYMS = new Set(["seo", "ppc", "sem", "ui", "ux", "crm", "ai", "cro", "roi", "ap"]);
const BRANDS: Record<string, string> = { wordpress: "WordPress", woocommerce: "WooCommerce", youtube: "YouTube", linkedin: "LinkedIn", whatsapp: "WhatsApp", nextjs: "Next.js", "next.js": "Next.js", "node.js": "Node.js" };
const SMALL = new Set(["in", "for", "and", "of", "the", "a", "an", "to", "on", "at", "by", "with", "or"]);

export const titleCase = (phrase: string): string =>
  phrase
    .trim()
    .split(/\s+/)
    .map((w, i) => {
      const lower = w.toLowerCase();
      if (ACRONYMS.has(lower)) return lower.toUpperCase();
      if (BRANDS[lower]) return BRANDS[lower];
      if (i > 0 && SMALL.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");

const PRIORITY_RANK: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

export function dedupeRepeatedTerms(text: string, repeated: string[]): string {
  let out = text;
  for (const word of repeated) {
    let seen = 0;
    out = out.replace(new RegExp(`(^|[\\s(])(${word})(\\s+)(?=[A-Za-z])`, "gi"), (match, pre: string) => {
      seen++;
      return seen <= 2 ? match : pre;
    });
  }
  out = out.replace(/\s{2,}/g, " ").replace(/(^|[.!?]\s+)([a-z])/g, (_m, p: string, c: string) => p + c.toUpperCase());
  return out.trim();
}

export function analyzePageHealth(
  page: HealthPage,
  config: HealthConfig,
  keywords: HealthKeyword[],
  locations: HealthLocation[],
  options: HealthOptions = {}
): HealthReport {
  const { cannibalized = [], caseStudies = [], pagePath = "", siteName = "Genie Media & Studio", shortSiteName = "Genie Media" } = options;
  const active = keywords.filter((k) => k.active);
  const allText = `${page.title} ${page.description} ${page.h1s.join(" ")} ${page.h2s.join(" ")} ${page.text}`;
  const h2Text = page.h2s.join(" | ");
  const h1Text = page.h1s.join(" ");

  const docText = indexText(page.text);
  const docAll = indexText(allText);
  const docH2 = indexText(h2Text);
  const docH1 = indexText(h1Text);
  const docTitle = indexText(page.title);
  const docDesc = indexText(page.description);
  const docOpening = indexText(page.openingText);
  const docTitleH1 = indexText(`${page.title} ${h1Text}`);
  const wordCount = docText.tokens.length;

  const primaryKeyword = active.find((k) => k.type === "PRIMARY")?.keyword || "";
  const primary = config.primaryTopic || primaryKeyword;
  const primarySource = config.primaryTopic ? "the configured primary topic" : primaryKeyword ? "the first active PRIMARY keyword" : "";
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const coverage: CoverageItem[] = [
    ...active.map((k) => ({ keyword: k.keyword, type: k.type as CoverageItem["type"] })),
    ...config.contentTopics.map((t) => ({ keyword: t, type: "TOPIC" as const })),
  ].map(({ keyword, type }) => {
    const count = countIn(docText, keyword);
    const phraseWords = Math.max(1, tokenize(keyword).length);
    const repetitive = wordCount >= 100 && (count * phraseWords) / wordCount > 0.03 && count >= 5;
    return {
      keyword,
      type,
      found: coversIn(docAll, keyword),
      count,
      inTitle: coversIn(docTitle, keyword),
      inH1: coversIn(docH1, keyword),
      inH2: coversIn(docH2, keyword),
      repetitive,
    };
  });

  const core = coverage.filter((c) => ["PRIMARY", "SECONDARY", "SEMANTIC", "RELATED", "TOPIC"].includes(c.type));
  const longTail = coverage.filter((c) => ["LONG_TAIL", "QUESTION", "LOCAL"].includes(c.type));

  const locationTerms = locations.flatMap((l) => [l.name, ...l.aliases]).filter(Boolean);
  const termCounts = locationTerms.map((t) => ({ term: t, count: countIn(docText, t) }));
  const locationMentions = termCounts.reduce((n, t) => n + t.count, 0);
  const hasLocation = locationMentions > 0 || locationTerms.some((t) => coversIn(docTitleH1, t));
  const locationDensity = wordCount ? locationMentions / wordCount : 0;
  const locationRepetitive = locationTerms.length > 0 && wordCount > 0 && locationDensity > 0.01;
  const preferredLocation = [...termCounts].sort((a, b) => b.count - a.count)[0]?.term || locations[0]?.name || "";

  const internal = page.links.filter((l) => isInternal(l.href));
  const pathOf = (href: string) => href.replace(/^https?:\/\/[^/]+/i, "");
  const linksTo = (re: RegExp) => internal.some((l) => re.test(pathOf(l.href)));
  const contactLink = linksTo(/^\/contact\b/) || page.links.some((l) => /^tel:/.test(l.href));
  const caseStudyLink = linksTo(/^\/case-studies\b/);

  const needsAction = active.some((k) => k.intent === "COMMERCIAL" || k.intent === "TRANSACTIONAL");
  const needsLocal = active.some((k) => k.intent === "LOCAL" || k.type === "LOCAL");

  const titleLen = page.title.length;
  const descLen = page.description.length;
  const descWordCounts: Record<string, number> = {};
  for (const w of docDesc.tokens.filter((x) => !STOP.has(x))) descWordCounts[w] = (descWordCounts[w] || 0) + 1;
  const repeatedDescWords = Object.entries(descWordCounts).filter(([, n]) => n > 3).map(([w]) => w);
  const descRepetitive = repeatedDescWords.length > 0;

  const secondaryInH2 = config.secondaryTopics.filter((t) => coversIn(docH2, t));
  const faqCovered = config.faqTopics.filter((t) => coversIn(docAll, t));
  const primaryInTitle = Boolean(primary) && coversIn(docTitle, primary);
  const primaryInH1 = Boolean(primary) && coversIn(docH1, primary);
  const primaryInDesc = Boolean(primary) && coversIn(docDesc, primary);
  const coreFound = core.filter((c) => c.found).length;
  const longFound = longTail.filter((c) => c.found).length;

  const raw: Array<Omit<HealthCategory, "needsFix">> = [
    {
      id: "topic",
      label: "Topic coverage",
      max: 20,
      score: 20 * ratio(coreFound, core.length),
      measured: "Share of your active primary, secondary, semantic and related keywords and content topics that the page covers.",
      checks: [{ label: `${coreFound} of ${core.length} core keywords and topics covered`, ok: coreFound === core.length }],
    },
    {
      id: "semantic",
      label: "Semantic coverage",
      max: 10,
      score: 10 * ratio(longFound, longTail.length),
      measured: "Share of your active long-tail, question and local keywords whose words appear on the page.",
      checks: [{ label: `${longFound} of ${longTail.length} long-tail, question and local keywords covered`, ok: longFound === longTail.length }],
    },
    {
      id: "intent",
      label: "Search intent alignment",
      max: 10,
      score: (needsAction ? (contactLink ? 5 : 0) : 5) + (needsLocal ? (hasLocation ? 5 : 0) : 5),
      measured: "Commercial keywords need a way to get in touch; local keywords need the location on the page.",
      checks: [
        { label: needsAction ? "Has a contact link or phone link for commercial searches" : "No commercial keywords to satisfy", ok: !needsAction || contactLink },
        { label: needsLocal ? "Mentions the location for local searches" : "No local keywords to satisfy", ok: !needsLocal || hasLocation },
      ],
    },
    {
      id: "title",
      label: "Title relevance",
      max: 10,
      score: (primaryInTitle ? 6 : 0) + (titleLen >= 30 && titleLen <= 60 ? 4 : 0),
      measured: primary ? `Measured against “${primary}” (${primarySource}).` : "No primary topic or PRIMARY keyword is set.",
      checks: [
        { label: primary ? `Title mentions “${primary}”` : "A primary topic is set", ok: primaryInTitle },
        { label: `Title is 30–60 characters (now ${titleLen})`, ok: titleLen >= 30 && titleLen <= 60 },
      ],
    },
    {
      id: "h1",
      label: "H1 relevance",
      max: 10,
      score: (page.h1s.length === 1 ? 4 : 0) + (primaryInH1 ? 6 : 0),
      measured: primary ? `Measured against “${primary}” (${primarySource}).` : "No primary topic or PRIMARY keyword is set.",
      checks: [
        { label: `Exactly one H1 (found ${page.h1s.length})`, ok: page.h1s.length === 1 },
        { label: primary ? `H1 mentions “${primary}”` : "A primary topic is set", ok: primaryInH1 },
      ],
    },
    {
      id: "h2",
      label: "H2 coverage",
      max: 10,
      score: 10 * ratio(secondaryInH2.length, config.secondaryTopics.length),
      measured: "Share of the configured secondary topics that have their own H2 heading.",
      checks: config.secondaryTopics.length
        ? config.secondaryTopics.map((t) => ({ label: `H2 heading about “${t}”`, ok: coversIn(docH2, t) }))
        : [{ label: "No secondary topics configured (counts as covered)", ok: true }],
    },
    {
      id: "links",
      label: "Internal linking",
      max: 10,
      score: (internal.length >= 3 ? 4 : 0) + (caseStudyLink ? 3 : 0) + (contactLink ? 3 : 0),
      measured: "At least three internal links, a link to a case study and a link to the contact page.",
      checks: [
        { label: `At least 3 internal links (found ${internal.length})`, ok: internal.length >= 3 },
        { label: "Links to a relevant case study", ok: caseStudyLink },
        { label: "Links to the contact page", ok: contactLink },
      ],
    },
    {
      id: "local",
      label: "Local relevance",
      max: 10,
      score: locationTerms.length ? (hasLocation ? 6 : 0) + (wordCount && locationMentions / wordCount > 0.01 ? 0 : 4) : 10,
      measured: locationTerms.length
        ? `Location mentioned at all, and not more than about once per 100 words (now ${locationMentions} in ${wordCount} words = ${(locationDensity * 100).toFixed(2)}%).`
        : "No locations configured.",
      checks: locationTerms.length
        ? [
            { label: "Location appears on the page", ok: hasLocation },
            { label: "Location is not repeated excessively", ok: !locationRepetitive },
          ]
        : [{ label: "No locations configured", ok: true }],
    },
    {
      id: "complete",
      label: "Content completeness",
      max: 10,
      score: (wordCount >= 600 ? 5 : 5 * Math.min(1, wordCount / 600)) + 5 * ratio(faqCovered.length, config.faqTopics.length),
      measured: "At least 600 words of content, and the configured FAQ topics answered.",
      checks: [
        { label: `At least 600 words (now ${wordCount})`, ok: wordCount >= 600 },
        { label: `${faqCovered.length} of ${config.faqTopics.length} FAQ topics answered`, ok: faqCovered.length === config.faqTopics.length },
      ],
    },
    {
      id: "meta",
      label: "Metadata quality",
      max: 10,
      score: (descLen >= 120 && descLen <= 160 ? 4 : 0) + (primaryInDesc ? 3 : 0) + (descLen && !descRepetitive ? 3 : 0),
      measured: "Meta description length, mention of the primary topic and no word repeated more than three times.",
      checks: [
        { label: `Description is 120–160 characters (now ${descLen})`, ok: descLen >= 120 && descLen <= 160 },
        { label: primary ? `Description mentions “${primary}”` : "A primary topic is set", ok: primaryInDesc },
        { label: descRepetitive ? `Repeated words: ${repeatedDescWords.join(", ")}` : "No word repeated more than three times", ok: Boolean(descLen) && !descRepetitive },
      ],
    },
  ];
  const categories: HealthCategory[] = raw.map((c) => {
    const score = Math.round(c.score * 10) / 10;
    return { ...c, score, needsFix: score < c.max * FIX_THRESHOLD };
  });

  if (primary && !coversIn(docOpening, primary)) warnings.push(`Primary topic “${primary}” is missing from the opening section.`);
  if (primary && !primaryInTitle) warnings.push(`The title does not mention the primary topic “${primary}”.`);
  if (page.h1s.length !== 1) warnings.push(`The page has ${page.h1s.length} H1 headings; it should have exactly one.`);
  if (descLen < 120 || descLen > 160) warnings.push(`Meta description is ${descLen} characters; 120–160 works best.`);
  if (descRepetitive) warnings.push("The meta description repeats the same word several times.");
  if (!caseStudyLink) warnings.push("No internal link to a relevant case study.");
  if (locationRepetitive) warnings.push("The location is mentioned very often. Potentially repetitive — review content.");
  for (const c of coverage.filter((x) => x.repetitive)) warnings.push(`“${c.keyword}” appears ${c.count} times. Potentially repetitive — review content.`);
  for (const k of cannibalized) warnings.push(`“${k}” is also a primary keyword of another page (keyword cannibalization).`);

  for (const t of config.secondaryTopics.filter((t) => !coversIn(docAll, t))) suggestions.push(`Consider adding a section about ${t}, if it is a service you offer on this page.`);
  for (const t of config.secondaryTopics.filter((t) => coversIn(docAll, t) && !coversIn(docH2, t))) suggestions.push(`${t} is mentioned but has no heading of its own. Consider a dedicated section if it deserves one.`);
  for (const t of config.faqTopics.filter((t) => !coversIn(docAll, t))) suggestions.push(`Consider answering “${t}” on the page.`);
  if (!caseStudyLink) suggestions.push("Consider linking to a related case study once one is published.");
  if (needsAction && !contactLink) suggestions.push("Add a clear call to action that links to the contact page.");
  if (needsLocal && !hasLocation) suggestions.push("Explain how the service helps local businesses, mentioning the city where it is relevant.");
  if (wordCount < 600) suggestions.push("The page is short. Consider explaining the process, pricing factors or common questions.");

  // ---- Rule-based suggestions -------------------------------------------
  const docVisible = indexText(`${h1Text} ${h2Text} ${page.text}`);
  const supported = (phrase: string) => significant(phrase).every((w) => docVisible.positions.has(w) || docVisible.positions.has(`${w}s`));
  const hasLocationTerm = (phrase: string) => locationTerms.some((t) => coversTopic(phrase, t));

  const headingSuggestion = (): string => {
    if (!primary) return "";
    const candidates = active
      .filter((k) => ["LONG_TAIL", "LOCAL", "PRIMARY"].includes(k.type) && coversTopic(k.keyword, primary) && supported(k.keyword))
      .filter((k) => tokenize(k.keyword).length <= 7 && !/\b(best|top|leading|no 1|cheapest)\b/i.test(k.keyword))
      .sort(
        (a, b) =>
          Number(hasLocationTerm(b.keyword)) - Number(hasLocationTerm(a.keyword)) ||
          (PRIORITY_RANK[a.priority || "MEDIUM"] ?? 1) - (PRIORITY_RANK[b.priority || "MEDIUM"] ?? 1) ||
          a.keyword.length - b.keyword.length
      );
    const best = candidates[0]?.keyword || primary;
    const chosen = !hasLocationTerm(best) && preferredLocation && hasLocation ? `${best} in ${preferredLocation}` : best;
    return titleCase(chosen);
  };

  const issues: SeoIssue[] = [];
  const currentH1 = page.h1s[0] || "";
  const titleFor = (phraseText: string) =>
    [`${phraseText} | ${siteName}`, `${phraseText} | ${shortSiteName}`, phraseText].find((t) => t.length >= 30 && t.length <= 60) ||
    [`${phraseText} | ${shortSiteName}`, phraseText].find((t) => t.length <= 60) ||
    phraseText;

  if (config.robotsIndex === false) {
    issues.push({
      id: "ROBOTS_NOINDEX", category: null, severity: "critical", title: "The page is set to noindex",
      why: "With indexing turned off, Google removes the page from search results.",
      currentValue: "noindex", expectedValue: "index", recommendation: "Allow indexing unless you deliberately want the page hidden from Google.",
      target: "robots", mode: "REVIEW_REQUIRED",
      suggestions: [{ kind: "set-field", field: "robotsIndex", value: true, label: "Allow indexing", reason: "Service pages should be indexable.", source: "rule" }],
    });
  }
  if (config.canonicalUrl && pagePath && !config.canonicalUrl.replace(/\/+$/, "").endsWith(pagePath)) {
    issues.push({
      id: "CANONICAL_EXTERNAL", category: null, severity: "critical", title: "The canonical URL points to another page",
      why: "A canonical that points elsewhere tells Google to index the other URL instead of this page.",
      currentValue: config.canonicalUrl, expectedValue: `The page's own URL (${pagePath})`, recommendation: "Clear the canonical so the page uses its own URL.",
      target: "canonical", mode: "REVIEW_REQUIRED",
      suggestions: [{ kind: "set-field", field: "canonicalUrl", value: "", label: "Use the page's own URL", reason: "Self-referencing canonicals are the default for unique pages.", source: "rule" }],
    });
  }
  if (page.h1s.length === 0) {
    const s = headingSuggestion();
    issues.push({
      id: "H1_MISSING", category: "h1", severity: "high", title: "The page has no H1",
      why: "The H1 tells visitors and search engines what the page is about.", currentValue: "(none)", recommendation: "Add one clear H1 that names the service.",
      target: "h1", mode: "REVIEW_REQUIRED",
      suggestions: s ? [{ kind: "set-field", field: "preferredH1", value: s, label: `Use “${s}”`, reason: "Built from your primary topic and keywords that the page content supports.", source: "rule" }] : [],
    });
  } else if (page.h1s.length > 1) {
    issues.push({
      id: "H1_MULTIPLE", category: "h1", severity: "high", title: `The page has ${page.h1s.length} H1 headings`,
      why: "One H1 keeps the page's main topic unambiguous.", currentValue: page.h1s.join(" / "), recommendation: "Keep one H1 and turn the others into H2s in the page code.",
      target: "content", mode: "MANUAL_ONLY", suggestions: [],
    });
  }

  const titleCat = categories.find((c) => c.id === "title")!;
  if (titleCat.needsFix && !primary) {
    issues.push({
      id: "TITLE_RELEVANCE_LOW", category: "title", severity: "info", title: "No primary topic is set, so title relevance cannot be measured",
      why: "Title and H1 relevance are measured against the page's primary topic.", currentValue: page.title,
      recommendation: "Set the primary topic in the configuration, or import the page's keywords with at least one PRIMARY keyword.",
      target: "topics", mode: "MANUAL_ONLY", suggestions: [],
    });
  } else if (titleCat.needsFix) {
    const phraseText = primaryInH1 && currentH1 ? currentH1 : headingSuggestion();
    const proposal = phraseText ? titleFor(phraseText) : "";
    const ok = proposal && proposal !== page.title && proposal.length <= 60 && (!primary || coversTopic(proposal, primary));
    issues.push({
      id: primaryInTitle ? "TITLE_LENGTH" : "TITLE_RELEVANCE_LOW", category: "title", severity: primaryInTitle ? "low" : "high",
      title: primaryInTitle ? `Title length is ${titleLen} characters` : `The title does not mention “${primary}”`,
      why: primaryInTitle
        ? "Titles of about 30–60 characters are shown in full in search results."
        : "The title is the main signal of what the page offers and is the headline people click in search results.",
      currentValue: page.title, expectedValue: primaryInTitle ? "30–60 characters" : `A natural title that mentions “${primary}”`,
      recommendation: "Use one natural phrase that names the service, followed by the brand. Mention the location at most once.",
      target: "title", mode: "REVIEW_REQUIRED",
      suggestions: ok ? [{ kind: "set-field", field: "seoTitle", value: proposal, label: `Use “${proposal}”`, reason: primaryInH1 ? "Matches your current H1, which already names the primary topic." : "Built from your primary topic and keywords that the page content supports.", source: "rule" }] : [],
    });
  }

  const h1Cat = categories.find((c) => c.id === "h1")!;
  if (page.h1s.length === 1 && primary && !primaryInH1) {
    const s = headingSuggestion();
    issues.push({
      id: "H1_RELEVANCE_LOW", category: "h1", severity: "medium", title: `The H1 does not mention “${primary}”`,
      why: "Visitors and search engines read the H1 first to confirm they are on the right page.",
      currentValue: currentH1, expectedValue: `A natural H1 that mentions “${primary}”`,
      recommendation: "Name the service clearly in the H1. Do not add words the page does not support.",
      target: "h1", mode: "REVIEW_REQUIRED",
      suggestions: s && s.toLowerCase() !== currentH1.toLowerCase()
        ? [{ kind: "set-field", field: "preferredH1", value: s, label: `Use “${s}”`, reason: "Every word of this heading already appears in your page content and keyword plan.", source: "rule" }]
        : [],
    });
  } else if (h1Cat.needsFix && page.h1s.length === 1 && !primary) {
    issues.push({
      id: "H1_RELEVANCE_LOW", category: "h1", severity: "medium", title: "No primary topic is set, so H1 relevance cannot be measured",
      why: "Relevance is measured against the page's primary topic.", currentValue: currentH1,
      recommendation: "Set the primary topic in the configuration, or add a PRIMARY keyword.", target: "topics", mode: "MANUAL_ONLY", suggestions: [],
    });
  }

  if (descLen && descRepetitive) {
    const proposal = dedupeRepeatedTerms(page.description, repeatedDescWords);
    const counts: Record<string, number> = {};
    for (const w of tokenize(proposal).filter((x) => !STOP.has(x))) counts[w] = (counts[w] || 0) + 1;
    const fixed = proposal !== page.description && !Object.values(counts).some((n) => n > 3) && proposal.length >= 70;
    issues.push({
      id: "META_DESCRIPTION_REPETITION", category: "meta", severity: "low", title: "The meta description repeats the same word several times",
      why: "A description that reads naturally earns more clicks than one that repeats a keyword.",
      currentValue: page.description, expectedValue: `No word more than three times (repeated: ${repeatedDescWords.join(", ")})`,
      recommendation: "Keep the first mentions and drop repeats where the meaning stays clear.",
      target: "description", mode: "REVIEW_REQUIRED",
      detail: repeatedDescWords.map((w) => `“${w}” appears ${descWordCounts[w]} times`),
      suggestions: fixed ? [{ kind: "set-field", field: "metaDescription", value: proposal, label: "Use the shorter wording", reason: `Removes repeated “${repeatedDescWords.join("”, “")}” where it only modifies the next word.`, source: "rule" }] : [],
    });
  }
  if (descLen && (descLen < 120 || descLen > 160)) {
    issues.push({
      id: "META_DESCRIPTION_LENGTH", category: "meta", severity: "low", title: `Meta description is ${descLen} characters`,
      why: "Descriptions of 120–160 characters are usually shown in full.", currentValue: page.description, expectedValue: "120–160 characters",
      recommendation: descLen < 120 ? "Add one concrete detail about what the service includes." : "Shorten it to the most important point.",
      target: "description", mode: "MANUAL_ONLY", suggestions: [],
    });
  }
  if (descLen && primary && !primaryInDesc) {
    issues.push({
      id: "META_DESCRIPTION_TOPIC", category: "meta", severity: "low", title: `The meta description does not mention “${primary}”`,
      why: "Search engines bold matching words in the snippet, which helps people recognise the page.", currentValue: page.description,
      recommendation: `Mention “${primary}” once, naturally.`, target: "description", mode: "MANUAL_ONLY", suggestions: [],
    });
  }

  if (primary && !coversIn(docOpening, primary)) {
    issues.push({
      id: "PRIMARY_MISSING_OPENING", category: "topic", severity: "medium", title: `The opening section does not mention “${primary}”`,
      why: "The first paragraphs confirm to visitors that they are in the right place.", currentValue: page.openingText.slice(0, 220),
      recommendation: "Mention the service naturally in the first paragraph. This text is part of the page code.", target: "content", mode: "MANUAL_ONLY", suggestions: [],
    });
  }

  if (!caseStudyLink) {
    const relevant = caseStudies.filter((cs) => !pagePath || cs.services.includes(pagePath)).slice(0, 3);
    issues.push({
      id: "MISSING_CASE_STUDY_LINK", category: "links", severity: "medium", title: "No internal link to a relevant case study",
      why: "A real project write-up shows first-hand experience and helps visitors judge your work.",
      currentValue: "No link to /case-studies", expectedValue: "One link to a relevant published case study",
      recommendation: relevant.length ? "Add a link to the most relevant published case study." : "No published case study for this service exists yet. Publish one first; never link to drafts.",
      target: "links", mode: "REVIEW_REQUIRED",
      suggestions: relevant.map((cs) => ({
        kind: "add-link" as const,
        link: { label: `${cs.clientName}: ${cs.title}`.slice(0, 100), href: cs.href },
        label: `Link to “${cs.title}”`,
        reason: `Published ${cs.category} case study for this service.`,
        source: "rule" as const,
      })),
    });
  }
  if (needsAction && !contactLink) {
    issues.push({
      id: "MISSING_CONTACT_LINK", category: "links", severity: "medium", title: "No link to the contact page",
      why: "People searching with commercial intent need an obvious next step.", currentValue: "No /contact or phone link", expectedValue: "A visible link to /contact",
      recommendation: "Add a contact link.", target: "links", mode: "SAFE_AUTO_FIX",
      suggestions: [{ kind: "add-link", link: { label: "Contact Genie Media & Studio", href: "/contact" }, label: "Add a link to /contact", reason: "/contact is an existing page on this site.", source: "rule" }],
    });
  }
  if (internal.length < 3) {
    issues.push({
      id: "INTERNAL_LINKS_FEW", category: "links", severity: "low", title: `Only ${internal.length} internal links`,
      why: "Links to related pages help visitors and search engines find your other services.", currentValue: String(internal.length), expectedValue: "3 or more",
      recommendation: "Link to the most related service, case study or article.", target: "links", mode: "MANUAL_ONLY", suggestions: [],
    });
  }

  if (locationRepetitive) {
    const blocks = page.blocks || [];
    const occurrences: Occurrence[] = blocks
      .map((b) => {
        const doc = indexText(b.text);
        const terms = locationTerms.filter((t) => countIn(doc, t) > 0);
        return { section: b.section || "Top of page", text: b.text, count: locationTerms.reduce((n, t) => n + countIn(doc, t), 0), terms };
      })
      .filter((o) => o.count > 0)
      .sort((a, b) => b.count - a.count);
    issues.push({
      id: "LOCATION_REPETITION", category: "local", severity: "medium", title: `The location is mentioned ${locationMentions} times`,
      why: "Repeating a place name reads unnaturally. Local relevance comes from genuine local context, not frequency.",
      currentValue: `${termCounts.filter((t) => t.count).map((t) => `${t.term} ×${t.count}`).join(", ")} in ${wordCount} words (${(locationDensity * 100).toFixed(2)}%)`,
      expectedValue: "Natural mentions where they help the reader",
      recommendation: "Keep the location in the title, H1, introduction and local/contact sections. Elsewhere, “our team”, “local businesses” or the neighbourhood often reads better. Review each paragraph; do not delete mentions blindly.",
      target: "content", mode: "MANUAL_ONLY", suggestions: [], occurrences,
    });
  }
  if (needsLocal && !hasLocation) {
    issues.push({
      id: "LOCAL_RELEVANCE_MISSING", category: "local", severity: "medium", title: "The page never mentions the location",
      why: "Local keywords are in your plan, but nothing on the page tells visitors where you work.",
      recommendation: "Add genuine local context: where you are based, the areas you serve, real local projects.", target: "sections", mode: "MANUAL_ONLY", suggestions: [],
    });
  }

  const repetitive = coverage.filter((c) => c.repetitive);
  if (repetitive.length) {
    issues.push({
      id: "KEYWORD_REPETITION", category: "topic", severity: "medium", title: `${repetitive.length} keyword${repetitive.length > 1 ? "s" : ""} repeated heavily`,
      why: "Heavy repetition reads as keyword stuffing and does not help rankings.", detail: repetitive.map((c) => `“${c.keyword}” appears ${c.count} times`),
      recommendation: "Potentially repetitive — review content. Vary the wording where the keyword is not needed.", target: "content", mode: "MANUAL_ONLY", suggestions: [],
    });
  }
  if (cannibalized.length) {
    issues.push({
      id: "KEYWORD_CANNIBALIZATION", category: null, severity: "medium", title: "Primary keyword shared with another page",
      why: "Two pages targeting the same primary keyword compete with each other.", detail: cannibalized.map((k) => `“${k}”`),
      recommendation: "Keep the keyword as PRIMARY on the page that best matches it and change its type on the other page.", target: "keywords", mode: "MANUAL_ONLY", suggestions: [],
    });
  }

  const missingTopics = config.secondaryTopics.filter((t) => !coversIn(docAll, t));
  if (missingTopics.length) {
    issues.push({
      id: "SECONDARY_TOPIC_MISSING", category: "h2", severity: "medium", title: `${missingTopics.length} secondary topic${missingTopics.length > 1 ? "s are" : " is"} not covered`,
      why: "Covering the services you actually offer helps visitors and gives search engines the full picture.", detail: missingTopics,
      recommendation: "Add a short section only for topics you genuinely offer on this page.", target: "sections", mode: "REVIEW_REQUIRED",
      suggestions: missingTopics.map((t) => ({ kind: "add-section" as const, section: { heading: titleCase(t), body: "" }, label: `Start a section about ${t}`, reason: "Adds a heading; you write the text before publishing.", source: "rule" as const })),
    });
  }
  const unheaded = config.secondaryTopics.filter((t) => coversIn(docAll, t) && !coversIn(docH2, t));
  if (unheaded.length) {
    const h3s = page.h3s || [];
    const h3For = (t: string) => h3s.find((h) => coversTopic(h, t));
    const withH3 = unheaded.filter((t) => h3For(t));
    const without = unheaded.filter((t) => !h3For(t));
    issues.push({
      id: "H2_TOPIC_MISSING", category: "h2", severity: without.length ? "low" : "info",
      title: `${unheaded.length} topic${unheaded.length > 1 ? "s have" : " has"} no H2 heading of their own`,
      why: "A heading makes an important service easy to find when people skim the page. This check only counts H2 headings.",
      detail: [
        ...withH3.map((t) => `${t}: already has an H3 heading (“${h3For(t)}”) — a new section would duplicate it`),
        ...without.map((t) => `${t}: mentioned in the text without any heading`),
      ],
      recommendation: without.length
        ? "Add a dedicated section only for topics that deserve one. Topics with an H3 card are already easy to find."
        : "Every topic already has an H3 heading. Keeping the current layout is fine; no new sections are needed.",
      target: "sections", mode: "REVIEW_REQUIRED",
      suggestions: without.map((t) => ({ kind: "add-section" as const, section: { heading: titleCase(t), body: "" }, label: `Start a section about ${t}`, reason: "The page mentions this topic but has no heading for it.", source: "rule" as const })),
    });
  }
  const missingFaq = config.faqTopics.filter((t) => !coversIn(docAll, t));
  if (missingFaq.length) {
    issues.push({
      id: "FAQ_TOPIC_MISSING", category: "complete", severity: "info", title: `${missingFaq.length} customer question${missingFaq.length > 1 ? "s are" : " is"} not answered`,
      why: "Answering real customer questions makes the page more useful.", detail: missingFaq,
      recommendation: "Answer the question in a short section.", target: "sections", mode: "REVIEW_REQUIRED",
      suggestions: missingFaq.map((q) => ({ kind: "add-section" as const, section: { heading: q.charAt(0).toUpperCase() + q.slice(1), body: "" }, label: `Answer “${q}”`, reason: "Configured as an FAQ topic.", source: "rule" as const })),
    });
  }
  const missingLong = longTail.filter((c) => !c.found);
  if (longTail.length && missingLong.length / longTail.length > 0.1) {
    issues.push({
      id: "SEMANTIC_COVERAGE_LOW", category: "semantic", severity: "info", title: `${missingLong.length} long-tail keywords are not covered`,
      why: "Long-tail keywords describe specific needs. Cover them only where they match something you really offer.", detail: missingLong.slice(0, 15).map((c) => c.keyword),
      recommendation: "Review the list; archive keywords that do not describe your service instead of forcing them into the page.", target: "keywords", mode: "MANUAL_ONLY", suggestions: [],
    });
  }
  if (wordCount < 600) {
    issues.push({
      id: "CONTENT_SHORT", category: "complete", severity: "low", title: `The page has ${wordCount} words`,
      why: "Short pages often leave customer questions unanswered.", recommendation: "Explain the process, pricing factors or common questions in a new section.",
      target: "sections", mode: "REVIEW_REQUIRED", suggestions: [],
    });
  }

  const score = Math.round(categories.reduce((n, c) => n + c.score, 0));
  return { score, categories, warnings, suggestions, coverage, wordCount, locationMentions, primaryTopic: primary, issues };
}
