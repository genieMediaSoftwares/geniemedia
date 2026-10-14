import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const groups = ["digital-marketing", "web-development", "podcast-studio"];
const routes = groups.flatMap((group) => fs.readdirSync(path.join(dist, group))
  .filter((file) => file.endsWith(".html"))
  .map((file) => `/${group}/${file.slice(0, -5)}`));
assert.equal(routes.length, 34, "All 34 specialist service pages must be exported");
const sitemap = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8");
const directory = new JSDOM(fs.readFileSync(path.join(dist, "services.html"), "utf8")).window.document;
const directoryLinks = new Set([...directory.querySelectorAll("main a[href]")].map((link) => link.getAttribute("href")));
const titles = new Set();
const descriptions = new Set();
let faqCount = 0;
const normalise = (text) => String(text).replace(/\s+/g, " ").trim();

for (const route of routes) {
  const doc = new JSDOM(fs.readFileSync(path.join(dist, `${route.slice(1)}.html`), "utf8")).window.document;
  const main = doc.querySelector("main");
  assert(main, `${route}: missing main content`);
  const description = doc.querySelector('meta[name="description"]')?.getAttribute("content") || "";
  assert(doc.title.length >= 30 && doc.title.length <= 60, `${route}: title length ${doc.title.length}`);
  assert(description.length >= 120 && description.length <= 160, `${route}: description length ${description.length}`);
  assert(!titles.has(doc.title), `${route}: duplicate title`);
  assert(!descriptions.has(description), `${route}: duplicate description`);
  titles.add(doc.title);
  descriptions.add(description);
  assert.equal(main.querySelectorAll("h1").length, 1, `${route}: expected one H1`);
  assert.match(main.querySelector("h1").textContent, /Vizag|Visakhapatnam/i, `${route}: local H1`);
  const visible = main.cloneNode(true);
  visible.querySelectorAll("script,style,[hidden],[aria-hidden='true']").forEach((el) => el.remove());
  const text = normalise(visible.textContent);
  for (const area of ["Yendada", "Rushikonda", "MVP Colony", "Madhurawada", "Andhra Pradesh", "India"]) {
    assert(text.includes(area), `${route}: missing visible service area ${area}`);
  }
  assert(directoryLinks.has(route), `${route}: missing from services directory`);
  assert(sitemap.includes(`${route}</loc>`), `${route}: missing from static sitemap`);
  assert(!doc.querySelector('meta[name="robots"]')?.getAttribute("content").includes("noindex"), `${route}: noindex`);
  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute("href");
  assert.equal(canonical, `https://geniemedia.in${route}`, `${route}: incorrect canonical`);
  const graphs = [...doc.querySelectorAll('script[type="application/ld+json"]')].flatMap((script) => {
    const data = JSON.parse(script.textContent);
    return data["@graph"] || [data];
  });
  const service = graphs.find((node) => node["@type"] === "Service");
  assert(service?.areaServed?.length, `${route}: missing structured service areas`);
  const physical = ["rental", "video-podcast", "pricing", "booking"].some((slug) => route === `/podcast-studio/${slug}`);
  assert.equal(service.areaServed.some((area) => area["@type"] === "Country"), !physical, `${route}: recording vs remote service scope`);
  const faq = graphs.find((node) => node["@type"] === "FAQPage");
  assert(faq?.mainEntity?.length, `${route}: missing FAQs`);
  for (const question of faq.mainEntity) {
    assert(text.includes(normalise(question.name)), `${route}: schema question missing from visible text`);
    assert(text.includes(normalise(question.acceptedAnswer.text)), `${route}: schema answer missing from visible text`);
    faqCount += 1;
  }
  for (const link of main.querySelectorAll("a[href]")) {
    const href = link.getAttribute("href");
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const target = href.split(/[?#]/)[0];
    const targetFile = target === "/" ? "index.html" : `${target.slice(1)}.html`;
    assert(fs.existsSync(path.join(dist, targetFile)) || fs.existsSync(path.join(dist, target)), `${route}: broken internal link ${href}`);
  }
  assert(!/KKDigitalGrowth|kkdigitalgrowth\.com/i.test(doc.body.textContent), `${route}: unrelated footer brand`);
}
console.log(`Verified ${routes.length} specialist pages: unique metadata, local content, canonicals, indexability, service areas, directory links, sitemap and ${faqCount} visible FAQ answers.`);
