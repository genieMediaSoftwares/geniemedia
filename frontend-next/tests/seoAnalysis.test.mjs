// Run with: npm test   (Node 22.18+ strips TypeScript types natively)
import { test } from "node:test";
import assert from "node:assert/strict";

import { contentStats, countWords, keywordDensity, stripHtml, validateForPublish } from "../src/utils/seoAnalysis.ts";

const ARTICLE = `
  <h2>Digital marketing in Vizag</h2>
  <p>Digital marketing helps local businesses grow. Our digital marketing team plans SEO and ads.</p>
  <p>Read our <a href="/blogs">blog</a> or visit <a href="https://example.com">a source</a>.</p>
  <img src="/a.jpg" alt="Team at work"><img src="/b.jpg">
`;

test("scripts, JSON-LD, styles, hidden blocks and the SEO panel are not counted", () => {
  const noisy = `${ARTICLE}
    <script type="application/ld+json">{"keywords":"digital marketing, digital marketing, digital marketing"}</script>
    <script>const keywords = ["digital marketing","digital marketing"];</script>
    <style>.digital-marketing{}</style>
    <div hidden>digital marketing digital marketing</div>
    <div aria-hidden="true">digital marketing</div>
    <section data-seo-panel>digital marketing keyword density 783%</section>
    <!-- digital marketing -->`;
  assert.equal(countWords(noisy), countWords(ARTICLE));
  assert.deepEqual(keywordDensity(noisy, "digital marketing"), keywordDensity(ARTICLE, "digital marketing"));
  assert.ok(!stripHtml(noisy).includes("783"));
});

test("keyword occurrences and density are computed on visible words only", () => {
  const d = keywordDensity(ARTICLE, "digital marketing");
  assert.equal(d.occurrences, 3);
  assert.equal(d.totalWords, countWords(ARTICLE));
  assert.equal(d.density, Number(((3 * 2 * 100) / d.totalWords).toFixed(2)));
});

test("density can never exceed 100%", () => {
  const spam = "<p>" + "seo ".repeat(5000) + "</p>";
  assert.equal(keywordDensity(spam, "seo").density, 100);
  assert.equal(keywordDensity(spam, "seo seo").density, 100);
  assert.equal(keywordDensity("<p>a b c</p>", "a b c d e").density, 0);
});

test("keywords do not match inside other words", () => {
  assert.equal(keywordDensity("<p>seoul seo seos</p>", "seo").occurrences, 1);
});

test("content statistics", () => {
  const s = contentStats(ARTICLE);
  assert.equal(s.paragraphCount, 2);
  assert.equal(s.headingCount, 1);
  assert.equal(s.imageCount, 2);
  assert.equal(s.imagesMissingAlt, 1);
  assert.equal(s.internalLinkCount, 1);
  assert.equal(s.externalLinkCount, 1);
  assert.ok(s.sentenceCount >= 3);
  // A short article is not enough prose to score.
  assert.equal(s.readability, null);
  assert.equal(s.readabilityLabel, "insufficient prose");
});

test("readability is scored, and bounded, once there is enough prose", () => {
  const sentence = "Our team helps local businesses in Vizag grow with clear and simple marketing plans. ";
  const s = contentStats(`<p>${sentence.repeat(10)}</p>`);
  assert.ok(typeof s.readability === "number" && s.readability >= 0 && s.readability <= 100);
  assert.equal(s.readabilityLabel, String(s.readability));
});

test("publish gate blocks an empty post and passes a complete one", () => {
  assert.equal(validateForPublish({}).ok, false);
  const ok = validateForPublish({
    title: "Digital marketing in Vizag",
    meta_title: "Digital marketing in Vizag | Genie Media",
    metaDescription: "How digital marketing helps businesses in Vizag grow online.",
    focus_keyword: "digital marketing",
    imagePreview: "https://geniemedia.in/uploads/x.webp",
    alt_text: "Team planning a campaign",
    direct_answer: "Digital marketing grows a business online.",
    description: ARTICLE,
  });
  assert.equal(ok.ok, true, JSON.stringify(ok.blockers));
});
