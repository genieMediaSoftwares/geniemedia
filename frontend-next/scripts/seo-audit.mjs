#!/usr/bin/env node
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

const PAGES = {
  "/": { keyword: "digital marketing", minWords: 600 },
  "/digital_marketing": { keyword: "digital marketing", minWords: 1500 },
  "/digital_marketing/seo-services": { keyword: "SEO services", minWords: 900 },
  "/digital_marketing/local-seo": { keyword: "local SEO", minWords: 900 },
  "/digital_marketing/technical-seo": { keyword: "technical SEO", minWords: 900 },
  "/digital_marketing/on-page-seo": { keyword: "on-page SEO", minWords: 900 },
  "/digital_marketing/ecommerce-seo": { keyword: "ecommerce SEO", minWords: 900 },
  "/digital_marketing/seo-audit": { keyword: "SEO audit", minWords: 900 },
  "/digital_marketing/aeo": { keyword: "answer engine optimization", minWords: 900 },
  "/digital_marketing/geo": { keyword: "generative engine optimization", minWords: 900 },
  "/digital_marketing/google-ads": { keyword: "Google Ads", minWords: 900 },
  "/digital_marketing/content-marketing": { keyword: "content marketing", minWords: 900 },
  "/digital_marketing/social-media-marketing": { keyword: "social media marketing", minWords: 900 },
  "/digital_marketing/lead-generation": { keyword: "lead generation", minWords: 900 },
  "/digital_marketing/conversion-optimization": { keyword: "conversion", minWords: 900 },
  "/web_development": { keyword: "web development", minWords: 600 },
  "/web_development/website-development": { keyword: "website development", minWords: 900 },
  "/web_development/website-design": { keyword: "website design", minWords: 900 },
  "/web_development/business-websites": { keyword: "business website", minWords: 900 },
  "/web_development/ecommerce-websites": { keyword: "e-commerce website", minWords: 900 },
  "/web_development/seo-friendly-websites": { keyword: "SEO-friendly", minWords: 900 },
  "/web_development/wordpress": { keyword: "WordPress", minWords: 900 },
  "/web_development/shopify": { keyword: "Shopify", minWords: 900 },
  "/web_development/woocommerce": { keyword: "WooCommerce", minWords: 900 },
  "/web_development/react-development": { keyword: "React", minWords: 900 },
  "/web_development/nextjs-development": { keyword: "Next.js", minWords: 900 },
  "/web_development/react-native": { keyword: "React Native", minWords: 900 },
  "/web_development/website-redesign": { keyword: "website redesign", minWords: 900 },
  "/web_development/website-maintenance": { keyword: "website maintenance", minWords: 900 },
  "/web_development/website-speed-optimization": { keyword: "speed optimization", minWords: 900 },
  "/production_house": { keyword: "production house", minWords: 400 },
  "/podcast_studio": { keyword: "podcast studio", minWords: 600 },
  "/podcast_studio/rental": { keyword: "podcast studio rental", minWords: 700 },
  "/podcast_studio/video-podcast": { keyword: "video podcast", minWords: 700 },
  "/podcast_studio/production": { keyword: "podcast production", minWords: 700 },
  "/podcast_studio/editing": { keyword: "podcast editing", minWords: 700 },
  "/podcast_studio/pricing": { keyword: "podcast studio", minWords: 700 },
  "/podcast_studio/booking": { keyword: "podcast studio", minWords: 700 },
  "/podcast_studio/content-repurposing": { keyword: "repurposing", minWords: 700 },
  "/projects": { keyword: "projects", minWords: 150 },
  "/case-studies": { keyword: "case studies", minWords: 300 },
  "/blogs": { keyword: "digital marketing", minWords: 150 },
  "/about": { keyword: "Genie Media", minWords: 400 },
  "/contact": { keyword: "contact", minWords: 100 },
};
const LOCATIONS = ["Vizag", "Visakhapatnam"];
const NAP = ["Yendada", "90328 45433"];

const NON_CONTENT = "script, style, noscript, template, svg, iframe, [hidden], [aria-hidden='true']";
const isAlwaysHidden = (el) => {
  const cls = (el.getAttribute("class") || "").split(/\s+/);
  return cls.includes("hidden") && !cls.some((c) => /^(sm|md|lg|xl|2xl):(block|flex|grid|inline|inline-block|inline-flex|table)$/.test(c));
};

const BLOCK = new Set("ADDRESS ARTICLE ASIDE BLOCKQUOTE BR BUTTON DD DIV DL DT FIGCAPTION FIGURE FOOTER FORM H1 H2 H3 H4 H5 H6 HEADER LI MAIN NAV OL P SECTION SPAN TABLE TD TH TR UL A".split(" "));
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
