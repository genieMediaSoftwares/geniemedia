#!/usr/bin/env node
/**
 * Crawlability / SEO verification against a running deployment.
 *
 *   node scripts/verify-routes.mjs                      # http://localhost:3000
 *   node scripts/verify-routes.mjs http://localhost:3100
 *   node scripts/verify-routes.mjs https://geniemedia.in
 *
 * Fetches each URL exactly as a crawler would (no JavaScript) and asserts on
 * the raw HTML: status, title, description, a single self-referencing
 * canonical, one H1, real body text, parseable JSON-LD, and robots rules.
 * Exits non-zero on any failure.
 */

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/+$/, "");
const SITE = "https://geniemedia.in";
const UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

let failures = 0;
const ok = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg) => {
  failures += 1;
  console.log(`  ✗ ${msg}`);
};
const check = (cond, msg) => (cond ? ok(msg) : fail(msg));
// "https://geniemedia.in" and "https://geniemedia.in/" are the same URL.
const sameUrl = (a, b) => String(a || "").replace(/\/$/, "") === String(b || "").replace(/\/$/, "");

const get = (path, { redirect = "manual" } = {}) =>
  fetch(`${BASE}${path}`, { redirect, headers: { "User-Agent": UA } });

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

const attr = (html, re) => {
  const m = html.match(re);
  return m ? decode(m[1]) : null;
};

const visibleText = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function inspect(html) {
  const canonicals = [...html.matchAll(/<link[^>]+rel="canonical"[^>]*>/gi)].map((m) => attr(m[0], /href="([^"]+)"/));
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => visibleText(m[1]));
  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  const parsed = [];
  let jsonOk = true;
  for (const block of jsonLd) {
    try {
      parsed.push(JSON.parse(block));
    } catch {
      jsonOk = false;
    }
  }
  const types = parsed.flatMap((p) => (p["@graph"] || [p]).flatMap((n) => [].concat(n["@type"] || [])));
  return {
    title: attr(html, /<title>([\s\S]*?)<\/title>/i),
    description: attr(html, /<meta name="description" content="([^"]*)"/i),
    robots: attr(html, /<meta name="robots" content="([^"]*)"/i),
    canonicals,
    h1s,
    jsonOk,
    jsonLdCount: jsonLd.length,
    types,
    words: visibleText(html).split(" ").filter(Boolean).length,
    links: (html.match(/<a\s[^>]*href="\/[^"]*"/gi) || []).length,
    images: (html.match(/<img\b/gi) || []).length,
  };
}

const PAGES = [
  ["/", `${SITE}/`],
  ["/about", `${SITE}/about`],
  ["/services", `${SITE}/services`],
  ["/digital_marketing", `${SITE}/digital_marketing`],
  ["/web_development", `${SITE}/web_development`],
  ["/production_house", `${SITE}/production_house`],
  ["/podcast_studio", `${SITE}/podcast_studio`],
  ["/projects", `${SITE}/projects`],
  ["/reviews", `${SITE}/reviews`],
  ["/blogs", `${SITE}/blogs`],
  ["/contact", `${SITE}/contact`],
  ["/privacy-policy", `${SITE}/privacy-policy`],
  ["/terms-and-conditions", `${SITE}/terms-and-conditions`],
];

async function verifyPage(path, expectedCanonical, { minWords = 150, schemaType } = {}) {
  console.log(`\n${path}`);
  const res = await get(path);
  check(res.status === 200, `status ${res.status}`);
  const html = await res.text();
  const p = inspect(html);
  check(Boolean(p.title), `title: ${p.title}`);
  check(Boolean(p.description), `meta description (${(p.description || "").length} chars)`);
  check(p.canonicals.length === 1 && sameUrl(p.canonicals[0], expectedCanonical), `canonical: ${p.canonicals.join(", ") || "none"}`);
  check(p.h1s.length === 1, `one H1: ${JSON.stringify(p.h1s)}`);
  check(p.words >= minWords, `server-rendered text: ${p.words} words, ${p.links} internal links, ${p.images} images`);
  check(p.jsonOk && p.jsonLdCount > 0, `JSON-LD blocks: ${p.jsonLdCount} (${[...new Set(p.types)].join(", ")})`);
  if (schemaType) check(p.types.includes(schemaType), `JSON-LD includes ${schemaType}`);
  check(!/noindex/i.test(p.robots || ""), `indexable (robots: ${p.robots || "default"})`);
  return { html, p };
}

async function main() {
  console.log(`Verifying ${BASE}`);

  for (const [path, canonical] of PAGES) {
    await verifyPage(path, canonical, {
      schemaType: path === "/digital_marketing" ? "FAQPage" : path === "/blogs" ? "CollectionPage" : undefined,
    });
  }

  // Every blog listed in the sitemap must render with its own canonical.
  console.log("\n/sitemap.xml");
  const sm = await get("/sitemap.xml");
  check(sm.status === 200, `status ${sm.status}`);
  const xml = await sm.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1]));
  const blogLocs = locs.filter((l) => l.includes("/blog/"));
  check(locs.length >= PAGES.length, `${locs.length} URLs (${blogLocs.length} blog posts)`);
  check(!locs.some((l) => /\/(admin|api|share)(\/|$)/.test(l)), "no admin/api/share URLs");

  for (const loc of blogLocs) {
    const path = loc.replace(SITE, "");
    const { p } = await verifyPage(path, loc, { minWords: 200, schemaType: "BlogPosting" });
    check(!sameUrl(p.canonicals[0], SITE), "canonical is not the home page");
    check(p.types.includes("BreadcrumbList"), "BreadcrumbList present");
  }

  const target = "/blog/search-engine-optimization-seo/why-genie-media-is-a-top-10-digital-marketing-agency-in-india";
  console.log(`\n${target} (Search Console soft-404 URL)`);
  const t = await get(target);
  check(t.status === 200, `status ${t.status}`);
  const tp = inspect(await t.text());
  check(tp.canonicals[0] === `${SITE}${target}`, `self canonical: ${tp.canonicals[0]}`);

  console.log("\nMissing pages must be real 404s");
  for (const path of ["/blog/non-existing-slug", "/blog/search-engine-optimization-seo/does-not-exist", "/this-page-does-not-exist"]) {
    const r = await get(path);
    const html = await r.text();
    const p = inspect(html);
    check(r.status === 404, `${path} -> ${r.status}`);
    check(/noindex/i.test(p.robots || ""), `${path} is noindex`);
    check(!p.canonicals.some((c) => sameUrl(c, SITE)), `${path} does not canonicalise to the home page`);
  }

  console.log("\nRedirects");
  for (const [from, to] of [
    ["/web-development", "/web_development"],
    ["/digital-marketing", "/digital_marketing"],
    ["/production-house", "/production_house"],
    ["/podcast-studio", "/podcast_studio"],
    ["/about.html", "/about"],
    ["/blog", "/blogs"],
    ["/admin/login", "/admin"],
    ["/about/", "/about"],
  ]) {
    const r = await get(from);
    const loc = r.headers.get("location") || "";
    check([301, 308].includes(r.status) && loc.replace(BASE, "").replace(SITE, "") === to, `${from} -> ${r.status} ${loc}`);
  }

  console.log("\n/robots.txt");
  const rb = await get("/robots.txt");
  const robots = await rb.text();
  check(rb.status === 200, `status ${rb.status}`);
  for (const rule of ["Disallow: /admin", "Disallow: /api/", "Disallow: /share/", `Sitemap: ${SITE}/sitemap.xml`]) {
    check(robots.includes(rule), rule);
  }
  for (const open of ["/digital_marketing", "/blog", "/blogs", "/projects", "/web_development", "/podcast_studio"]) {
    check(!new RegExp(`^Disallow: ${open}$`, "m").test(robots), `${open} not blocked`);
  }

  console.log("\nAdmin is never indexable");
  for (const path of ["/admin", "/admin/blogs", "/admin/projects"]) {
    const r = await get(path);
    const p = inspect(await r.text());
    const header = r.headers.get("x-robots-tag") || "";
    check(/noindex/i.test(p.robots || "") && /noindex/i.test(header), `${path}: meta "${p.robots}", header "${header}"`);
  }

  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
