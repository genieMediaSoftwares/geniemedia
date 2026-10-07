export type KeywordType = "PRIMARY" | "SECONDARY" | "RELATED" | "LONG_TAIL" | "LOCAL" | "QUESTION" | "SEMANTIC";
export type SearchIntent = "INFORMATIONAL" | "COMMERCIAL" | "TRANSACTIONAL" | "NAVIGATIONAL" | "LOCAL";

export interface HealthPage {
  title: string;
  description: string;
  h1s: string[];
  h2s: string[];
  openingText: string;
  text: string;
  links: Array<{ href: string; text: string }>;
}

export interface HealthKeyword {
  keyword: string;
  type: KeywordType;
  intent: SearchIntent;
  active: boolean;
}

export interface HealthConfig {
  primaryTopic: string;
  secondaryTopics: string[];
  contentTopics: string[];
  faqTopics: string[];
}

export interface HealthLocation {
  name: string;
  aliases: string[];
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

export interface HealthCategory {
  id: string;
  label: string;
  score: number;
  max: number;
}

export interface HealthReport {
  score: number;
  categories: HealthCategory[];
  warnings: string[];
  suggestions: string[];
  coverage: CoverageItem[];
  wordCount: number;
  locationMentions: number;
}

const STOP = new Set("a an and the of in for to with on at by from or is are your our we you how what does do much".split(" "));

export const normalizeText = (s: string): string =>
  ` ${String(s || "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim()} `;

export const countPhrase = (text: string, phrase: string): number => {
  const p = normalizeText(phrase).trim().split(" ").filter(Boolean);
  if (!p.length) return 0;
  const t = normalizeText(text).trim().split(" ");
  let n = 0;
  for (let i = 0; i + p.length <= t.length; i++) {
    if (p.every((w, j) => t[i + j] === w)) {
      n++;
      i += p.length - 1;
    }
  }
  return n;
};

const significant = (phrase: string): string[] => normalizeText(phrase).trim().split(" ").filter((w) => w && !STOP.has(w));

export const coversTopic = (text: string, phrase: string): boolean => {
  if (countPhrase(text, phrase) > 0) return true;
  const words = significant(phrase);
  if (!words.length) return false;
  const hay = normalizeText(text);
  return words.every((w) => hay.includes(` ${w} `) || hay.includes(` ${w}s `));
};

const wordsIn = (text: string): number => normalizeText(text).trim().split(" ").filter(Boolean).length;

const ratio = (part: number, whole: number): number => (whole ? part / whole : 1);

const isInternal = (href: string): boolean => /^\/(?!\/)/.test(href) || /^https?:\/\/(www\.)?geniemedia\.in(\/|$)/i.test(href);

export function analyzePageHealth(
  page: HealthPage,
  config: HealthConfig,
  keywords: HealthKeyword[],
  locations: HealthLocation[],
  { cannibalized = [] }: { cannibalized?: string[] } = {}
): HealthReport {
  const active = keywords.filter((k) => k.active);
  const wordCount = wordsIn(page.text);
  const allText = `${page.title} ${page.description} ${page.h1s.join(" ")} ${page.h2s.join(" ")} ${page.text}`;
  const h2Text = page.h2s.join(" | ");
  const h1Text = page.h1s.join(" ");
  const primary = config.primaryTopic || active.find((k) => k.type === "PRIMARY")?.keyword || "";
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const coverage: CoverageItem[] = [
    ...active.map((k) => ({ keyword: k.keyword, type: k.type as CoverageItem["type"] })),
    ...config.contentTopics.map((t) => ({ keyword: t, type: "TOPIC" as const })),
  ].map(({ keyword, type }) => {
    const count = countPhrase(page.text, keyword);
    const phraseWords = Math.max(1, wordsIn(keyword));
    const repetitive = wordCount >= 100 && (count * phraseWords) / wordCount > 0.03 && count >= 5;
    return {
      keyword,
      type,
      found: coversTopic(allText, keyword),
      count,
      inTitle: coversTopic(page.title, keyword),
      inH1: coversTopic(h1Text, keyword),
      inH2: coversTopic(h2Text, keyword),
      repetitive,
    };
  });

  const core = coverage.filter((c) => ["PRIMARY", "SECONDARY", "SEMANTIC", "RELATED", "TOPIC"].includes(c.type));
  const longTail = coverage.filter((c) => ["LONG_TAIL", "QUESTION", "LOCAL"].includes(c.type));

  const locationTerms = locations.flatMap((l) => [l.name, ...l.aliases]).filter(Boolean);
  const locationMentions = locationTerms.reduce((n, t) => n + countPhrase(page.text, t), 0);
  const hasLocation = locationMentions > 0 || locationTerms.some((t) => coversTopic(`${page.title} ${h1Text}`, t));

  const internal = page.links.filter((l) => isInternal(l.href));
  const linksTo = (re: RegExp) => internal.some((l) => re.test(l.href.replace(/^https?:\/\/[^/]+/i, "")));
  const contactLink = linksTo(/^\/contact\b/) || page.links.some((l) => /^tel:/.test(l.href));
  const caseStudyLink = linksTo(/^\/case-studies\b/);

  const needsAction = active.some((k) => k.intent === "COMMERCIAL" || k.intent === "TRANSACTIONAL");
  const needsLocal = active.some((k) => k.intent === "LOCAL" || k.type === "LOCAL");

  const titleLen = page.title.length;
  const descLen = page.description.length;
  const descWordCounts: Record<string, number> = {};
  for (const w of normalizeText(page.description).trim().split(" ").filter((x) => x && !STOP.has(x))) descWordCounts[w] = (descWordCounts[w] || 0) + 1;
  const descRepetitive = Object.values(descWordCounts).some((n) => n > 3);

  const secondaryInH2 = config.secondaryTopics.filter((t) => coversTopic(h2Text, t));
  const faqCovered = config.faqTopics.filter((t) => coversTopic(allText, t));

  const categories: HealthCategory[] = [
    { id: "topic", label: "Topic coverage", max: 20, score: 20 * ratio(core.filter((c) => c.found).length, core.length) },
    { id: "semantic", label: "Semantic coverage", max: 10, score: 10 * ratio(longTail.filter((c) => c.found).length, longTail.length) },
    {
      id: "intent",
      label: "Search intent alignment",
      max: 10,
      score: (needsAction ? (contactLink ? 5 : 0) : 5) + (needsLocal ? (hasLocation ? 5 : 0) : 5),
    },
    {
      id: "title",
      label: "Title relevance",
      max: 10,
      score: (primary && coversTopic(page.title, primary) ? 6 : 0) + (titleLen >= 30 && titleLen <= 60 ? 4 : 0),
    },
    {
      id: "h1",
      label: "H1 relevance",
      max: 10,
      score: (page.h1s.length === 1 ? 4 : 0) + (primary && coversTopic(h1Text, primary) ? 6 : 0),
    },
    { id: "h2", label: "H2 coverage", max: 10, score: 10 * ratio(secondaryInH2.length, config.secondaryTopics.length) },
    {
      id: "links",
      label: "Internal linking",
      max: 10,
      score: (internal.length >= 3 ? 4 : 0) + (caseStudyLink ? 3 : 0) + (contactLink ? 3 : 0),
    },
    {
      id: "local",
      label: "Local relevance",
      max: 10,
      score: locationTerms.length ? (hasLocation ? 6 : 0) + (wordCount && locationMentions / wordCount > 0.01 ? 0 : 4) : 10,
    },
    {
      id: "complete",
      label: "Content completeness",
      max: 10,
      score: (wordCount >= 600 ? 5 : 5 * Math.min(1, wordCount / 600)) + 5 * ratio(faqCovered.length, config.faqTopics.length),
    },
    {
      id: "meta",
      label: "Metadata quality",
      max: 10,
      score: (descLen >= 120 && descLen <= 160 ? 4 : 0) + (primary && coversTopic(page.description, primary) ? 3 : 0) + (descLen && !descRepetitive ? 3 : 0),
    },
  ].map((c) => ({ ...c, score: Math.round(c.score * 10) / 10 }));

  if (primary && !coversTopic(page.openingText, primary)) warnings.push(`Primary topic “${primary}” is missing from the opening section.`);
  if (primary && !coversTopic(page.title, primary)) warnings.push(`The title does not mention the primary topic “${primary}”.`);
  if (page.h1s.length !== 1) warnings.push(`The page has ${page.h1s.length} H1 headings; it should have exactly one.`);
  if (descLen < 120 || descLen > 160) warnings.push(`Meta description is ${descLen} characters; 120–160 works best.`);
  if (descRepetitive) warnings.push("The meta description repeats the same word several times.");
  if (!caseStudyLink) warnings.push("No internal link to a relevant case study.");
  if (locationTerms.length && wordCount && locationMentions / wordCount > 0.01) warnings.push("The location is mentioned very often. Potentially repetitive — review content.");
  for (const c of coverage.filter((x) => x.repetitive)) warnings.push(`“${c.keyword}” appears ${c.count} times. Potentially repetitive — review content.`);
  for (const k of cannibalized) warnings.push(`“${k}” is also a primary keyword of another page (keyword cannibalization).`);

  for (const t of config.secondaryTopics.filter((t) => !coversTopic(allText, t))) {
    suggestions.push(`Consider adding a section about ${t}, if it is a service you offer on this page.`);
  }
  for (const t of config.secondaryTopics.filter((t) => coversTopic(allText, t) && !coversTopic(h2Text, t))) {
    suggestions.push(`${t} is mentioned but has no heading of its own. Consider a dedicated section if it deserves one.`);
  }
  for (const t of config.faqTopics.filter((t) => !coversTopic(allText, t))) suggestions.push(`Consider answering “${t}” on the page.`);
  if (!caseStudyLink) suggestions.push("Consider linking to a related case study once one is published.");
  if (needsAction && !contactLink) suggestions.push("Add a clear call to action that links to the contact page.");
  if (needsLocal && !hasLocation) suggestions.push("Explain how the service helps local businesses, mentioning the city where it is relevant.");
  if (wordCount < 600) suggestions.push("The page is short. Consider explaining the process, pricing factors or common questions.");

  const score = Math.round(categories.reduce((n, c) => n + c.score, 0));
  return { score, categories, warnings, suggestions, coverage, wordCount, locationMentions };
}
