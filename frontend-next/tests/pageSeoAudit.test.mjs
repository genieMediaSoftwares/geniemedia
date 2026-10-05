import { test } from "node:test";
import assert from "node:assert/strict";

import { auditPage, countPhrase, phraseDensity } from "../src/utils/pageSeoAudit.ts";
import { buildDocument } from "../scripts/seo-audit.mjs";

const OPTS = { keyword: "digital marketing", locations: ["Vizag", "Visakhapatnam"], napPhrases: ["Yendada", "90328 45433"], minWords: 50 };

const page = (main, extraBody = "", head = "") => `<!doctype html><html lang="en"><head>
<title>Digital Marketing Agency in Vizag | Genie Media</title>
<meta name="description" content="Genie Media & Studio offers digital marketing in Vizag: SEO, Google Ads, social media marketing, content, websites and branding for local businesses.">
<link rel="canonical" href="https://geniemedia.in/digital_marketing">
<meta name="viewport" content="width=device-width">${head}
</head><body><header><nav><a href="/">Home</a></nav></header>
<main data-seo-content="true">${main}</main>
<footer>KP Icon, Yendada, Visakhapatnam. Call +91 9032845433.</footer>${extraBody}</body></html>`;

test("phrases are counted on whole words, without overlaps", () => {
  assert.equal(countPhrase("Digital marketing, digital-marketing and DIGITAL MARKETING.", "digital marketing"), 3);
  assert.equal(countPhrase("digitalmarketing digital marketer", "digital marketing"), 0);
  assert.equal(countPhrase("seo seo seo", "seo seo"), 1);
});

test("density is occurrences / words x 100 and can never exceed 100%", () => {
  assert.deepEqual(phraseDensity("one two three four digital marketing", "digital marketing"), { occurrences: 1, totalWords: 6, density: 16.67 });
  assert.ok(phraseDensity("seo ".repeat(500), "seo").density <= 100);
});

test("scripts, JSON-LD, the React payload and hidden text are not counted", () => {
  const visible = "<h1>Digital Marketing Services in Vizag</h1><p>We offer digital marketing for local businesses.</p>";
  const noise = [
    `<script>self.__next_f.push([1,"${"digital marketing ".repeat(3000)}"])</script>`,
    `<script type="application/ld+json">{"@type":"Organization","description":"${"digital marketing ".repeat(500)}"}</script>`,
    `<div hidden>${"digital marketing ".repeat(200)}</div>`,
    `<div aria-hidden="true">${"digital marketing ".repeat(200)}</div>`,
    `<div class="hidden">${"digital marketing ".repeat(200)}</div>`,
    `<style>.digital-marketing{color:red}</style>`,
  ].join("");
  const doc = buildDocument(page(visible + noise), "https://geniemedia.in/digital_marketing");
  const result = auditPage(doc, OPTS);
  assert.equal(result.stats.keywordOccurrences, 2);
  assert.equal(result.stats.wordCount, 12); // 5 heading words + 7 paragraph words
});

test("a responsive Tailwind 'hidden md:block' element still counts as visible", () => {
  const doc = buildDocument(page('<p class="hidden md:block">Digital marketing in Vizag for local shops.</p>'), "https://geniemedia.in/digital_marketing");
  assert.equal(countPhrase(doc.text, "digital marketing"), 1);
});

test("keyword stuffing fails the overuse check instead of earning points", () => {
  const stuffed = buildDocument(page(`<h1>Digital Marketing in Vizag</h1><p>${"Digital marketing. ".repeat(60)}</p>`), "https://geniemedia.in/digital_marketing");
  const check = auditPage(stuffed, OPTS).categories.find((c) => c.name === "Content Quality").checks.find((c) => c.id === "kw-overuse");
  assert.equal(check.passed, false);
  assert.match(check.detail, /Potential keyword overuse/);
});

test("metadata is read once per tag and title length is checked", () => {
  const doc = buildDocument(page("<h1>Digital Marketing in Vizag</h1>", "", "<title>Second title</title>"), "https://geniemedia.in/digital_marketing");
  const tech = auditPage(doc, OPTS).categories.find((c) => c.name === "Technical SEO");
  assert.equal(tech.checks.find((c) => c.id === "one-title").passed, false);
});

test("phone numbers match whatever their spacing", () => {
  const doc = buildDocument(page("<h1>Digital Marketing in Vizag</h1>"), "https://geniemedia.in/digital_marketing");
  const local = auditPage(doc, OPTS).categories.find((c) => c.name === "Local SEO");
  assert.equal(local.checks.find((c) => c.id === "nap").passed, true);
});
