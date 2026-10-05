#!/usr/bin/env node
/**
 * SEO audit of the built pages in dist/ (run `npm run build` first).
 *
 *   npm run seo:audit                      all main public pages
 *   npm run seo:audit -- /digital_marketing one page, every check listed
 *   npm run seo:audit -- --url https://geniemedia.in/digital_marketing
 *                                          audit the live page instead
 *   npm run seo:audit -- --coverage        also show where each target term
 *                                          appears (scripts/seo-keywords.mjs)
 *
 * The page HTML is parsed (jsdom) and reduced to what a visitor can read in
 * <main data-seo-content="true">: scripts, styles, JSON-LD, the React payload,
 * hidden elements, class names and URLs are never counted as words. The
 * scoring itself lives in src/utils/pageSeoAudit.ts.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import { auditPage, keywordCoverage } from "../src/utils/pageSeoAudit.ts";
import { PAGE_KEYWORDS } from "./seo-keywords.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const DIST = path.join(ROOT, "dist");

const readEnv = (name) => {
  if (process.env[name]) return process.env[name];
  const p = path.join(ROOT, ".env");
  const m = fs.existsSync(p) && fs.readFileSync(p, "utf8").match(new RegExp(`^${name}=(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
};
const SITE = readEnv("NEXT_PUBLIC_SITE_URL").replace(/\/+$/, "");
if (!SITE) {
  console.error("NEXT_PUBLIC_SITE_URL is not set in .env");
  process.exit(1);
}

/** Topic and minimum length per page. Support pages are shorter by nature. */
const PAGES = {
  "/": { keyword: "digital marketing", minWords: 600 },
  "/digital_marketing": { keyword: "digital marketing", minWords: 1500 },
  "/web_development": { keyword: "web development", minWords: 600 },
  "/production_house": { keyword: "production house", minWords: 400 },
  "/podcast_studio": { keyword: "podcast studio", minWords: 600 },
  "/projects": { keyword: "projects", minWords: 150 },
  "/blogs": { keyword: "digital marketing", minWords: 150 },
  "/about": { keyword: "Genie Media", minWords: 400 },
  "/contact": { keyword: "contact", minWords: 100 },
};
const LOCATIONS = ["Vizag", "Visakhapatnam"];
const NAP = ["Yendada", "90328 45433"];

// Elements whose text a visitor never reads as content.
const NON_CONTENT = "script, style, noscript, template, svg, iframe, [hidden], [aria-hidden='true']";
// Tailwind `hidden` with no breakpoint display class is hidden at every size.
const isAlwaysHidden = (el) => {
  const cls = (el.getAttribute("class") || "").split(/\s+/);
  return cls.includes("hidden") && !cls.some((c) => /^(sm|md|lg|xl|2xl):(block|flex|grid|inline|inline-block|inline-flex|table)$/.test(c));
};

const BLOCK = new Set("ADDRESS ARTICLE ASIDE BLOCKQUOTE BR BUTTON DD DIV DL DT FIGCAPTION FIGURE FOOTER FORM H1 H2 H3 H4 H5 H6 HEADER LI MAIN NAV OL P SECTION SPAN TABLE TD TH TR UL A".split(" "));
/** Visible text with a space between elements, so "<h3>A</h3><p>B" reads "A B", not "AB". */
const visibleText = (el) => {
  const parts = [];
  const walk = (node) => {
    if (node.nodeType === 3) parts.push(node.nodeValue);
    else if (node.nodeType === 1) {
      if (BLOCK.has(node.tagName)) parts.push(" ");
      node.childNodes.forEach(walk);
      if (BLOCK.has(node.tagName)) parts.push(" ");
    }
  };
  walk(el);
  return parts.join("").replace(/\s+/g, " ").trim();
};

// Screen-reader-only text is not prose a visitor reads, but it is part of a
// link's accessible name ("Learn more about our Shopify work"), so link text
// is taken from a copy that keeps it.
const clean = (root, { keepSrOnly = false } = {}) => {
  const copy = root.cloneNode(true);
  copy.querySelectorAll(NON_CONTENT).forEach((el) => el.remove());
  if (!keepSrOnly) copy.querySelectorAll(".sr-only").forEach((el) => el.remove());
  copy.querySelectorAll("[class~='hidden']").forEach((el) => isAlwaysHidden(el) && el.remove());
  return copy;
};

export const buildDocument = (html, url) => {
  const { document } = new JSDOM(html).window;
  const attr = (sel, name) => [...document.querySelectorAll(sel)].map((e) => e.getAttribute(name) || "");
  const mainSource = document.querySelector("main[data-seo-content='true']") || document.querySelector("main") || document.body;
  const main = clean(mainSource);
  const body = clean(document.body);

  const paragraphs = [...main.querySelectorAll("p, li, blockquote, dd")]
    .filter((el) => !el.querySelector("p, li"))
    .map(visibleText)
    .filter((t) => t.split(/\s+/).length >= 3);

  const host = new URL(url).host;
  const links = [...clean(mainSource, { keepSrOnly: true }).querySelectorAll("a[href]")]
    .map((a) => ({ href: a.getAttribute("href"), text: visibleText(a) || a.getAttribute("aria-label") || "" }))
    .filter((l) => /^(https?:|\/)/.test(l.href))
    .map((l) => ({ ...l, internal: l.href.startsWith("/") || new URL(l.href).host === host }));

  const images = [...body.querySelectorAll("img")].map((img) => ({
    src: img.getAttribute("src") || "",
    alt: img.hasAttribute("alt") ? img.getAttribute("alt") : null,
    hasDimensions: img.hasAttribute("width") && img.hasAttribute("height"),
  }));

  const structuredData = [...document.querySelectorAll("script[type='application/ld+json']")].map((s) => {
    try {
      return JSON.parse(s.textContent);
    } catch {
      return null;
    }
  });

  return {
    url,
    paragraphs,
    text: visibleText(main),
    pageText: visibleText(body),
    headings: [...main.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((h) => ({ level: Number(h.tagName[1]), text: visibleText(h) })),
    links,
    images,
    structuredData,
    metadata: {
      // Only the document title: an <svg><title> just names an icon.
      titles: [...document.querySelectorAll("head > title")].map((t) => t.textContent.trim()),
      descriptions: attr("meta[name='description']", "content"),
      canonicals: attr("link[rel='canonical']", "href"),
      robots: attr("meta[name='robots']", "content").join(", "),
      lang: document.documentElement.getAttribute("lang") || "",
      hasViewport: !!document.querySelector("meta[name='viewport']"),
      ogTitle: attr("meta[property='og:title']", "content")[0] || "",
      ogDescription: attr("meta[property='og:description']", "content")[0] || "",
      ogUrl: attr("meta[property='og:url']", "content")[0] || "",
      twitterCard: attr("meta[name='twitter:card']", "content")[0] || "",
    },
  };
};

/** Every page path present in dist/ (for broken-link checks). */
const knownPaths = () => {
  const out = new Set(["/"]);
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name !== "_next") walk(p);
      } else if (e.name.endsWith(".html")) {
        out.add("/" + path.relative(DIST, p).split(path.sep).join("/").replace(/\.html$/, "").replace(/(^|\/)index$/, ""));
      }
    }
  };
  walk(DIST);
  out.add("/sitemap.xml");
  return out;
};

const args = process.argv.slice(2);
const liveUrl = args.includes("--url") ? args[args.indexOf("--url") + 1] : null;
const showCoverage = args.includes("--coverage");
const routes = liveUrl ? [new URL(liveUrl).pathname || "/"] : args.filter((a) => a.startsWith("/"));
const targets = routes.length ? routes : Object.keys(PAGES);
const detailed = targets.length === 1;
const known = liveUrl ? undefined : knownPaths();

// Run the audit only when called as a script, not when buildDocument is imported.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  let worst = 100;
  for (const route of targets) {
    const cfg = PAGES[route] || { keyword: "Genie Media", minWords: 300 };
    let html;
    if (liveUrl) {
      html = await (await fetch(liveUrl, { headers: { "User-Agent": "Mozilla/5.0 seo-audit" } })).text();
    } else {
      const file = path.join(DIST, route === "/" ? "index.html" : `${route.slice(1)}.html`);
      if (!fs.existsSync(file)) {
        console.error(`${route}: ${file} not found. Run npm run build first.`);
        process.exitCode = 1;
        continue;
      }
      html = fs.readFileSync(file, "utf8");
    }
    const url = liveUrl || (route === "/" ? `${SITE}/` : `${SITE}${route}`);
    const doc = buildDocument(html, url);
    const result = auditPage(doc, { ...cfg, locations: LOCATIONS, napPhrases: NAP, knownPaths: known });
    worst = Math.min(worst, result.score);
    const s = result.stats;

    console.log(`\n${route}  —  ${result.score}%   (topic "${cfg.keyword}")`);
    console.log(
      `  words ${s.wordCount} · sentences ${s.sentenceCount} · paragraphs ${s.paragraphCount} · keyword ${s.keywordOccurrences}x = ${s.keywordDensity}%` +
        ` · readability ${s.readabilityLabel} · avg sentence ${s.avgSentenceLength} words · transitions ${s.transitionShare}%`,
    );
    console.log(`  images ${s.images} (alt ${s.imagesWithAlt}, decorative ${s.decorativeImages}) · internal links ${s.internalLinks} · external ${s.externalLinks}`);
    if (detailed) console.log(`  top words: ${s.topWords.map(([w, n]) => `${w} ${n}`).join(", ")}`);
    for (const c of result.categories) {
      const failed = c.checks.filter((x) => !x.passed);
      console.log(`  ${String(c.score).padStart(3)}%  ${c.name}${failed.length ? "" : " ✓"}`);
      for (const x of detailed ? c.checks : failed) {
        console.log(`         ${x.passed ? "✓" : "✗"} ${x.label}${x.detail ? `  (${x.detail})` : ""}`);
      }
    }
    if (showCoverage && PAGE_KEYWORDS[route]) {
      const mark = (b) => (b ? "✓" : "·");
      console.log(`\n  ${"keyword coverage".padEnd(38)} ${"tier".padEnd(10)}  title desc  H1  H2/3 open  links alt   uses`);
      const rows = keywordCoverage(doc, PAGE_KEYWORDS[route]);
      // Topic coverage per tier: how many of the planned terms the visible
      // content actually covers. More repetitions never raise it.
      const tiers = ["primary", "secondary", "semantic", "local", "supporting"].map((tier) => {
        const inTier = rows.filter((r) => r.tier === tier);
        const covered = inTier.filter((r) => r.body > 0 || r.title || r.description);
        return `${tier} ${covered.length}/${inTier.length}`;
      });
      console.log(`\n  topic coverage: ${tiers.join(" · ")}`);
      for (const r of rows) {
        console.log(
          `  ${r.term.padEnd(38).slice(0, 38)} ${r.tier.padEnd(10)}  ${mark(r.title)}     ${mark(r.description)}     ${mark(r.h1)}   ${mark(r.h2)}    ${mark(r.opening)}     ${mark(r.linkText)}     ${mark(r.alt)}   ${String(r.body).padStart(3)}`,
        );
      }
    }
  }
  console.log("");
}
