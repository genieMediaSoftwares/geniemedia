/**
 * Verifies the per-route title, description and canonical.
 *
 * Checks each route twice, because they can disagree and usually do when
 * something is wrong:
 *
 *   RAW      the first HTTP response, no JavaScript executed. This is what
 *            GPTBot, ClaudeBot, PerplexityBot and CCBot read.
 *   RENDERED the DOM after React has mounted and react-helmet-async has run.
 *
 * It also counts canonical and description tags in the rendered DOM. A single
 * page navigation that appends instead of replacing shows up here as a count of
 * two, which is the failure this setup is built to avoid.
 *
 * Finally it walks the routes client-side, the way a visitor clicking links
 * does, to prove the title and canonical follow along without a page load.
 *
 *   node scripts/verify-route-seo.mjs http://localhost:5000
 */

import puppeteer from "puppeteer-core";

const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.argv[2] || "http://localhost:4173";
const ORIGIN = "https://geniemedia.in";

const EXPECTED = {
  "/": {
    title: "Genie Media | Digital Marketing Agency in Visakhapatnam",
    canonical: `${ORIGIN}/`,
  },
  "/services": {
    title: "Digital Marketing Services in Visakhapatnam | Genie Media",
    canonical: `${ORIGIN}/services`,
  },
  "/about": {
    title: "About Genie Media | Digital Marketing Agency in Visakhapatnam",
    canonical: `${ORIGIN}/about`,
  },
  "/projects": {
    title: "Our Projects | Digital Marketing & Web Projects | Genie Media",
    canonical: `${ORIGIN}/projects`,
  },
  "/contact": {
    title: "Contact Genie Media | Digital Marketing Agency in Visakhapatnam",
    canonical: `${ORIGIN}/contact`,
  },
  "/blogs": {
    title: "Digital Marketing Blog | SEO, Marketing & Business Growth | Genie Media",
    canonical: `${ORIGIN}/blogs`,
  },
};

/**
 * `&` is legitimately escaped as `&amp;` inside an HTML attribute or a <title>,
 * so the raw markup has to be decoded before it can be compared with the string
 * a browser reports. Without this, a correctly escaped title reads as a
 * mismatch.
 */
const decodeEntities = (str) =>
  String(str || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");

const pick = (html, re) => {
  const m = html.match(re);
  return m ? decodeEntities(m[1].trim()) : null;
};

let failures = 0;
const check = (label, actual, expected) => {
  const ok = actual === expected;
  if (!ok) failures += 1;
  console.log(`      ${ok ? "✅" : "❌"} ${label}`);
  if (!ok) {
    console.log(`           expected: ${expected}`);
    console.log(`           actual:   ${actual}`);
  }
  return ok;
};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox"],
});

const errors = [];

for (const [route, expected] of Object.entries(EXPECTED)) {
  const url = `${BASE}${route}`;
  console.log(`\n${"=".repeat(68)}\n${route}\n${"=".repeat(68)}`);

  // ---- RAW: what a crawler that does not run JavaScript receives ----------
  const raw = await (await fetch(url, { headers: { "User-Agent": "GPTBot/1.2" } })).text();
  console.log("   RAW (no JavaScript)");
  check("title", pick(raw, /<title>([\s\S]*?)<\/title>/i), expected.title);
  check(
    "canonical",
    pick(raw, /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i),
    expected.canonical
  );
  const rawDesc = pick(raw, /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  console.log(`      ${rawDesc ? "✅" : "❌"} description present (${rawDesc ? rawDesc.length : 0} chars)`);
  if (!rawDesc) failures += 1;

  const rawCanonicals = (raw.match(/rel=["']canonical["']/gi) || []).length;
  const rawDescs = (raw.match(/name=["']description["']/gi) || []).length;
  check("exactly one canonical in raw HTML", String(rawCanonicals), "1");
  check("exactly one description in raw HTML", String(rawDescs), "1");

  // ---- RENDERED: what a browser and Googlebot see after React runs --------
  const page = await browser.newPage();
  page.on("pageerror", (e) => errors.push(`${route}: ${e.message.slice(0, 120)}`));
  page.on("console", (m) => {
    const text = m.text();
    const isNetworkNoise =
      /failed to fetch|err_failed|net::|load resource|could not load|fetch error/i.test(text);
    if (m.type() === "error" && !isNetworkNoise && !/google|favicon|onrender/i.test(text)) {
      errors.push(`${route}: ${text.slice(0, 120)}`);
    }
  });

  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1200));

  const dom = await page.evaluate(() => ({
    title: document.title,
    canonicals: [...document.querySelectorAll('link[rel="canonical"]')].map((l) => l.href),
    descriptions: [...document.querySelectorAll('meta[name="description"]')].map((m) => m.content),
    ogTitle: document.querySelector('meta[property="og:title"]')?.content || null,
    ogUrl: document.querySelector('meta[property="og:url"]')?.content || null,
  }));

  console.log("   RENDERED (after React)");
  check("title", dom.title, expected.title);
  check("exactly one canonical", String(dom.canonicals.length), "1");
  check("canonical", dom.canonicals[0] || null, expected.canonical);
  check("exactly one description", String(dom.descriptions.length), "1");
  check("og:url matches canonical", dom.ogUrl, expected.canonical);
  check("og:title matches title", dom.ogTitle, expected.title);

  await page.close();
}

// ---- Client-side navigation, the way a visitor actually moves around ------
console.log(`\n${"=".repeat(68)}\nClient-side navigation (no page reloads)\n${"=".repeat(68)}`);

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto(`${BASE}/`, { waitUntil: "networkidle2", timeout: 30000 });
await new Promise((r) => setTimeout(r, 1200));

for (const route of ["/about", "/services", "/projects", "/blogs", "/contact", "/"]) {
  // pushState + popstate is how React Router navigates internally; this avoids
  // depending on where a particular link happens to sit in the layout.
  await page.evaluate((r) => {
    window.history.pushState({}, "", r);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, route);
  await new Promise((r) => setTimeout(r, 900));

  const dom = await page.evaluate(() => ({
    title: document.title,
    canonicals: [...document.querySelectorAll('link[rel="canonical"]')].map((l) => l.href),
    descriptions: document.querySelectorAll('meta[name="description"]').length,
  }));

  const expected = EXPECTED[route];
  const okTitle = dom.title === expected.title;
  const okCanon = dom.canonicals.length === 1 && dom.canonicals[0] === expected.canonical;
  const okDesc = dom.descriptions === 1;
  if (!okTitle || !okCanon || !okDesc) failures += 1;

  console.log(
    `   ${okTitle && okCanon && okDesc ? "✅" : "❌"} ${route.padEnd(11)} ` +
      `title ${okTitle ? "ok" : `WRONG (${dom.title})`} · ` +
      `canonical ${okCanon ? "ok" : `WRONG (${dom.canonicals.length}: ${dom.canonicals})`} · ` +
      `descriptions ${dom.descriptions}`
  );
}

await page.close();
await browser.close();

console.log(`\n${"=".repeat(68)}`);
if (errors.length) {
  console.log(`⚠️  React errors:\n   ${[...new Set(errors)].join("\n   ")}`);
} else {
  console.log("✅ No React errors");
}
console.log(failures === 0 ? "✅ All route SEO checks passed." : `❌ ${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
