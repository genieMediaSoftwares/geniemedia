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
