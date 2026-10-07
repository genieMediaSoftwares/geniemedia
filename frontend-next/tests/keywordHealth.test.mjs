import { test } from "node:test";
import assert from "node:assert/strict";

import { analyzePageHealth, countPhrase, coversTopic } from "../src/lib/seo/keywordHealth.ts";

const LOCATIONS = [{ name: "Visakhapatnam", aliases: ["Vizag"] }];

const body = (extra = "") =>
  `Genie Media & Studio offers digital marketing services in Vizag. We plan SEO, Google Ads and social media marketing for local businesses. ${"Our team explains every step clearly and reports on leads every month. ".repeat(60)} ${extra}`;

const page = (overrides = {}) => ({
  title: "Digital Marketing Agency in Vizag | Genie Media & Studio",
  description: "Digital marketing company in Visakhapatnam (Vizag): SEO, local SEO, Google Ads, social media, content and lead generation for local businesses.",
  h1s: ["Digital Marketing Services in Vizag"],
  h2s: ["Our Digital Marketing Services", "SEO Services in Vizag", "Google Ads & PPC Management"],
  openingText: "Genie Media & Studio offers digital marketing services in Vizag.",
  text: body(),
  links: [
    { href: "/contact", text: "Contact" },
    { href: "/case-studies", text: "Case studies" },
    { href: "/web_development", text: "Web" },
  ],
  ...overrides,
});

const config = {
  primaryTopic: "digital marketing",
  secondaryTopics: ["SEO", "Google Ads", "social media marketing"],
  contentTopics: ["lead generation"],
  faqTopics: [],
};

const keywords = [
  { keyword: "digital marketing", type: "PRIMARY", intent: "COMMERCIAL", active: true },
  { keyword: "digital marketing agency in Vizag", type: "LONG_TAIL", intent: "LOCAL", active: true },
  { keyword: "archived thing", type: "SECONDARY", intent: "INFORMATIONAL", active: false },
];

test("phrase matching is whole-word and case-insensitive", () => {
  assert.equal(countPhrase("Digital marketing, DIGITAL-marketing and digitalmarketing", "digital marketing"), 2);
  assert.ok(coversTopic("We manage Google Ads campaigns", "Google Ads management") === false);
  assert.ok(coversTopic("Google Ads management for clinics", "Google Ads management"));
  assert.ok(coversTopic("agency for digital marketing based in Vizag", "digital marketing agency in Vizag"));
});

test("a well-covered page scores high and ignores archived keywords", () => {
  const r = analyzePageHealth(page(), config, keywords, LOCATIONS);
  assert.ok(r.score >= 80, `score ${r.score}`);
  assert.ok(!r.coverage.some((c) => c.keyword === "archived thing"));
});

test("missing topics produce suggestions, never automatic content", () => {
  const r = analyzePageHealth(page({ h2s: [] }), { ...config, secondaryTopics: ["SEO", "email marketing"] }, keywords, LOCATIONS);
  assert.ok(r.suggestions.some((s) => s.includes("email marketing")));
  assert.ok(r.categories.find((c) => c.id === "h2").score === 0);
});

test("repetition is flagged as a warning instead of being rewarded", () => {
  const stuffed = page({ text: body("digital marketing ".repeat(80)) });
  const r = analyzePageHealth(stuffed, config, keywords, LOCATIONS);
  assert.ok(r.warnings.some((w) => w.includes("Potentially repetitive")));
  const clean = analyzePageHealth(page(), config, keywords, LOCATIONS);
  assert.ok(r.score <= clean.score, "stuffing must never raise the score");
});

test("missing case study link, wrong H1 count and cannibalization are reported", () => {
  const r = analyzePageHealth(page({ links: [{ href: "/contact", text: "c" }], h1s: ["A", "B"] }), config, keywords, LOCATIONS, {
    cannibalized: ["digital marketing"],
  });
  assert.ok(r.warnings.some((w) => w.includes("case study")));
  assert.ok(r.warnings.some((w) => w.includes("2 H1")));
  assert.ok(r.warnings.some((w) => w.includes("cannibalization")));
});

import { dedupeRepeatedTerms, titleCase, FIX_THRESHOLD } from "../src/lib/seo/keywordHealth.ts";

const ids = (r) => r.issues.map((i) => i.id);

test("issues carry stable ids, severity, target and fix mode", () => {
  const r = analyzePageHealth(page({ links: [{ href: "/contact", text: "c" }] }), config, keywords, LOCATIONS);
  const cs = r.issues.find((i) => i.id === "MISSING_CASE_STUDY_LINK");
  assert.ok(cs);
  assert.equal(cs.severity, "medium");
  assert.equal(cs.target, "links");
  assert.equal(cs.mode, "REVIEW_REQUIRED");
  for (const i of r.issues) {
    assert.match(i.id, /^[A-Z0-9_]+$/);
    assert.ok(["critical", "high", "medium", "low", "info"].includes(i.severity));
    assert.ok(i.why && i.recommendation);
  }
});

test("H1 suggestion is built from keywords the page content supports", () => {
  const p = page({ h1s: ["Online Growth for Local Brands"], h2s: ["Why Businesses Choose Our Agency"] });
  const kws = [...keywords, { keyword: "digital marketing company in Vizag", type: "LONG_TAIL", intent: "LOCAL", active: true, priority: "HIGH" }];
  const r = analyzePageHealth(p, config, kws, LOCATIONS);
  const h1 = r.issues.find((i) => i.id === "H1_RELEVANCE_LOW");
  assert.ok(h1, "low H1 relevance is reported");
  const value = h1.suggestions[0]?.value;
  assert.equal(value, "Digital Marketing Agency in Vizag", "picks a supported long-tail keyword, not the unsupported 'company' one");
  const fixed = analyzePageHealth({ ...p, h1s: [value] }, config, kws, LOCATIONS);
  assert.ok(!ids(fixed).includes("H1_RELEVANCE_LOW"), "issue resolves after applying");
  assert.ok(fixed.categories.find((c) => c.id === "h1").score > r.categories.find((c) => c.id === "h1").score);
});

test("no H1 suggestion invents words the page never uses", () => {
  const p = page({ h1s: ["Welcome"], text: body().replace(/agency/gi, "team") });
  const kws = [{ keyword: "digital marketing", type: "PRIMARY", intent: "COMMERCIAL", active: true }, { keyword: "digital marketing agency in Vizag", type: "LONG_TAIL", intent: "LOCAL", active: true }];
  const r = analyzePageHealth({ ...p, title: "Welcome to our website | Genie Media", description: "x" }, config, kws, LOCATIONS);
  const s = r.issues.find((i) => i.id === "H1_RELEVANCE_LOW").suggestions[0].value;
  assert.ok(!/agency/i.test(s), `unsupported word suggested: ${s}`);
  assert.equal(s, "Digital Marketing in Vizag", "falls back to the primary topic plus the page's location");
});

test("meta description repetition gets a natural deduplicated rewrite", () => {
  const d = "Book a podcast studio in Vizag from ₹1,500 an hour. Podcast recording, video podcast filming with up to three cameras, and podcast editing by our team.";
  const out = dedupeRepeatedTerms(d, ["podcast"]);
  assert.equal(out, "Book a podcast studio in Vizag from ₹1,500 an hour. Podcast recording, video filming with up to three cameras, and editing by our team.");
  const r = analyzePageHealth(page({ description: d }), { ...config, primaryTopic: "podcast studio" }, keywords, LOCATIONS);
  const issue = r.issues.find((i) => i.id === "META_DESCRIPTION_REPETITION");
  assert.equal(issue.suggestions[0].value, out);
  const after = analyzePageHealth(page({ description: out }), { ...config, primaryTopic: "podcast studio" }, keywords, LOCATIONS);
  assert.ok(!ids(after).includes("META_DESCRIPTION_REPETITION"));
});

test("case-study suggestions use only published case studies for the same service", () => {
  const caseStudies = [
    { title: "Shopify store", clientName: "A", href: "/case-studies/a", services: ["/web_development"], category: "Website Development" },
    { title: "Local SEO", clientName: "B", href: "/case-studies/b", services: ["/digital_marketing"], category: "Digital Marketing" },
  ];
  const noLink = page({ links: [{ href: "/contact", text: "c" }] });
  const r = analyzePageHealth(noLink, config, keywords, LOCATIONS, { caseStudies, pagePath: "/digital_marketing" });
  const issue = r.issues.find((i) => i.id === "MISSING_CASE_STUDY_LINK");
  assert.deepEqual(issue.suggestions.map((s) => s.link.href), ["/case-studies/b"]);
  const none = analyzePageHealth(noLink, config, keywords, LOCATIONS, { caseStudies: [], pagePath: "/digital_marketing" });
  assert.equal(none.issues.find((i) => i.id === "MISSING_CASE_STUDY_LINK").suggestions.length, 0, "never invents a case study");
  const linked = analyzePageHealth({ ...noLink, links: [...noLink.links, { href: "/case-studies/b", text: "B" }] }, config, keywords, LOCATIONS, { caseStudies, pagePath: "/digital_marketing" });
  assert.ok(!ids(linked).includes("MISSING_CASE_STUDY_LINK"));
});

test("location repetition lists the paragraphs instead of rewriting them", () => {
  const blocks = [
    { section: "Why Choose Us", text: "Our Vizag team helps Vizag businesses across Vizag and Visakhapatnam." },
    { section: "Services", text: "We plan campaigns." },
  ];
  const text = `${"Vizag ".repeat(30)} ${body()}`;
  const r = analyzePageHealth(page({ text, blocks }), config, keywords, LOCATIONS);
  const issue = r.issues.find((i) => i.id === "LOCATION_REPETITION");
  assert.ok(issue);
  assert.equal(issue.mode, "MANUAL_ONLY");
  assert.equal(issue.suggestions.length, 0);
  assert.equal(issue.occurrences[0].section, "Why Choose Us");
  assert.equal(issue.occurrences[0].count, 4);
});

test("noindex and off-page canonical are critical", () => {
  const r = analyzePageHealth(page(), { ...config, robotsIndex: false, canonicalUrl: "https://geniemedia.in/other" }, keywords, LOCATIONS, { pagePath: "/digital_marketing" });
  assert.equal(r.issues.find((i) => i.id === "ROBOTS_NOINDEX").severity, "critical");
  assert.equal(r.issues.find((i) => i.id === "CANONICAL_EXTERNAL").severity, "critical");
});

test("every category explains its score and flags fixes below the threshold", () => {
  const r = analyzePageHealth(page({ links: [{ href: "/contact", text: "c" }] }), config, keywords, LOCATIONS);
  for (const c of r.categories) {
    assert.ok(c.measured && c.checks.length, `${c.id} has an explanation`);
    assert.equal(c.needsFix, c.score < c.max * FIX_THRESHOLD);
  }
  assert.equal(titleCase("seo services in vizag"), "SEO Services in Vizag");
});

test("without a primary topic, relevance issues say so instead of naming an empty topic", () => {
  const r = analyzePageHealth(page(), { ...config, primaryTopic: "" }, [], LOCATIONS);
  const t = r.issues.find((i) => i.id === "TITLE_RELEVANCE_LOW");
  assert.ok(t && t.severity === "info" && !t.title.includes("“”"));
  assert.ok(!r.issues.some((i) => i.title.includes("“”")));
});

test("the draft overlay keeps H3 headings, so topics with an H3 are not re-suggested", async () => {
  const { applyDraft } = await import("../src/lib/seo/pageSnapshot.ts");
  const p = page({ h2s: ["Our Services"], h3s: ["SEO Services in Vizag", "Google Ads & PPC Management", "Social Media Marketing"] });
  const draftPage = applyDraft(p, { seoTitle: "", metaDescription: "", preferredH1: "", sections: [], internalLinks: [] }, null);
  const r = analyzePageHealth(draftPage, config, keywords, LOCATIONS);
  const h2 = r.issues.find((i) => i.id === "H2_TOPIC_MISSING");
  assert.equal(h2.suggestions.length, 0);
  assert.equal(h2.severity, "info");
});
