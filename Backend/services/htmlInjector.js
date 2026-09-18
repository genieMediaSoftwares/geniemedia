/**
 * Part 4, Option A — server-side head injection for the Vite SPA.
 *
 * THE PROBLEM
 * A Vite build ships an index.html whose <head> is a single hardcoded set of
 * home-page tags, and whose <body> is an empty <div id="root">. Everything a
 * blog post says about itself is written by React after the bundle downloads,
 * parses and runs. Googlebot will usually render that; GPTBot, ClaudeBot,
 * PerplexityBot, facebookexternalhit and Twitterbot largely will not. They read
 * the first HTML response and leave. On that response, every blog post on the
 * site is byte-for-byte identical and titled "GenieMedia & Studio".
 *
 * THE FIX
 * Intercept /blog/:slug before the static handler, pull the post from MySQL,
 * rewrite the <head> of the built index.html as a string, and serve that. No
 * SSR, no build change, no second framework. React hydrates afterwards exactly
 * as it does now, because the <body> is untouched.
 *
 * The conflicting tags that Vite baked in are REMOVED before the new ones are
 * added. Appending without removing leaves two <title> elements and two
 * canonicals in the document, and the crawler picks whichever it likes.
 */

const fs = require("fs");
const path = require("path");

const { SITE } = require("../config/site");
const {
  generateStructuredData,
  generateSiteSchema,
  generateBlogListSchema,
  absoluteUrl,
  blogUrl,
  parseJsonColumn,
  asArray,
  toIso,
} = require("./structuredData");
const { stripHtml } = require("./contentAnalysis");

// ---------------------------------------------------------------------------
// Locating the built SPA
// ---------------------------------------------------------------------------

/**
 * Where the Vite build lives. Configurable because the backend and frontend are
 * deployed together on a VPS but separately on the current Render + Hostinger
 * split; on the split deployment this simply finds nothing and every helper
 * below degrades to "not available" rather than throwing.
 */
const DIST_CANDIDATES = [
  process.env.FRONTEND_DIST,
  path.join(__dirname, "..", "..", "Frontend", "dist"),
  path.join(__dirname, "..", "public", "dist"),
  path.join(__dirname, "..", "dist"),
].filter(Boolean);

const findDistDir = () => {
  for (const dir of DIST_CANDIDATES) {
    try {
      if (fs.existsSync(path.join(dir, "index.html"))) return dir;
    } catch (_) {}
  }
  return null;
};

const DIST_DIR = findDistDir();
const INDEX_PATH = DIST_DIR ? path.join(DIST_DIR, "index.html") : null;

// The template is cached and invalidated by mtime, so a redeploy is picked up
// without a restart but a busy crawl does not hit the disk on every request.
let cachedTemplate = null;
let cachedMtime = 0;

const readTemplate = () => {
  if (!INDEX_PATH) return null;
  try {
    const { mtimeMs } = fs.statSync(INDEX_PATH);
    if (!cachedTemplate || mtimeMs !== cachedMtime) {
      cachedTemplate = fs.readFileSync(INDEX_PATH, "utf8");
      cachedMtime = mtimeMs;
    }
    return cachedTemplate;
  } catch (err) {
    console.error("htmlInjector: cannot read index.html:", err.message);
    return null;
  }
};

const isAvailable = () => Boolean(INDEX_PATH);

// ---------------------------------------------------------------------------
// Escaping
// ---------------------------------------------------------------------------

const escapeAttr = (value) =>
  String(value === null || value === undefined ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

/**
 * JSON-LD sits inside <script>, so it is NOT HTML-escaped — it is escaped for
 * the one thing that can break out of a script element. A literal "</script>"
 * inside the JSON would close the block early and dump the rest of the graph
 * into the page as markup; "<!--" can start a comment that swallows it.
 */
const escapeJsonLd = (obj) =>
  JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

const collapse = (value, max) => {
  const str = String(value || "").replace(/\s+/g, " ").trim();
  if (!max || str.length <= max) return str;
  return `${str.slice(0, max - 1).trimEnd()}…`;
};

// ---------------------------------------------------------------------------
// Head rewriting
// ---------------------------------------------------------------------------

/**
 * Deletes the tags the new head is about to replace.
 *
 * Only the specific managed tags go — charset, viewport, favicon, the analytics
 * snippet and the module script are all left exactly where they were.
 */
const stripManagedTags = (head) =>
  head
    .replace(/<title>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta\s+name=["'](title|description|keywords|robots|author|language)["'][^>]*>/gi, "")
    .replace(/<meta\s+property=["']og:[^"']*["'][^>]*>/gi, "")
    .replace(/<meta\s+name=["']twitter:[^"']*["'][^>]*>/gi, "")
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "")
    .replace(/<script\s+type=["']application\/ld\+json["'][\s\S]*?<\/script>/gi, "");

const injectIntoHead = (template, headHtml) => {
  const headOpen = template.match(/<head[^>]*>/i);
  if (!headOpen) return template;

  const start = template.indexOf(headOpen[0]) + headOpen[0].length;
  const end = template.toLowerCase().indexOf("</head>");
  if (end === -1) return template;

  const existingHead = stripManagedTags(template.slice(start, end));

  return (
    template.slice(0, start) +
    "\n" +
    headHtml +
    "\n" +
    existingHead +
    template.slice(end)
  );
};

/**
 * Sets <html lang> to the site language so the document is not silently
 * declared as something else by the template default.
 */
const setHtmlLang = (html, lang) =>
  html.replace(/<html\b([^>]*)>/i, (match, attrs) =>
    /\blang=/i.test(attrs) ? match.replace(/lang=["'][^"']*["']/i, `lang="${lang}"`) : `<html${attrs} lang="${lang}">`
  );

// ---------------------------------------------------------------------------
// Tag builders
// ---------------------------------------------------------------------------

const metaTag = (attr, key, value) =>
  value ? `    <meta ${attr}="${escapeAttr(key)}" content="${escapeAttr(value)}" />` : null;

/**
 * Builds the complete managed <head> for a blog post.
 *
 * Deliberately includes `article:*` OG properties and a preload hint for the
 * featured image: the preload is a Largest Contentful Paint win for humans, and
 * page experience now feeds the same quality models that decide citation.
 */
const buildBlogHead = (blog) => {
  const url = blogUrl(blog.permalink);
  const canonical = absoluteUrl(blog.canonical_url, url);
  const title = collapse(blog.meta_title || blog.title, 70) || SITE.name;
  const directAnswer = collapse(blog.direct_answer, 300);
  const description =
    collapse(blog.metaDescription, 160) ||
    collapse(directAnswer, 160) ||
    collapse(stripHtml(blog.description), 160);

  const image = absoluteUrl(blog.og_image_url, null) || absoluteUrl(blog.image, SITE.defaultOgImage);
  const displayImage = absoluteUrl(blog.image, SITE.defaultOgImage);
  const robots = blog.robots_directive || "index,follow";
  const altText = blog.alt_text || blog.title;

  const keywords = [
    String(blog.focus_keyword || "").trim(),
    ...asArray(blog.secondary_keywords).map((k) => String(k).trim()),
    ...String(blog.keywords || "").split(",").map((k) => k.trim()),
  ].filter(Boolean);

  const published = toIso(blog.createdAt);
  const modified = toIso(blog.last_modified_at) || toIso(blog.updatedAt) || published;
  const author = String(blog.author_name || "").trim() || "Genie Media Editorial Team";

  const tags = [
    `    <title>${escapeAttr(title)}</title>`,
    metaTag("name", "title", title),
    metaTag("name", "description", description),
    keywords.length ? metaTag("name", "keywords", [...new Set(keywords)].join(", ")) : null,
    // max-image-preview:large is what makes a post eligible for the big image
    // treatment in results and in AI Overviews; the default is a thumbnail.
    metaTag("name", "robots", `${robots}, max-image-preview:large, max-snippet:-1, max-video-preview:-1`),
    metaTag("name", "googlebot", `${robots}, max-image-preview:large, max-snippet:-1`),
    metaTag("name", "author", author),
    metaTag("name", "language", SITE.language),
    `    <link rel="canonical" href="${escapeAttr(canonical)}" />`,

    // ---- Open Graph ----
    metaTag("property", "og:type", "article"),
    metaTag("property", "og:site_name", SITE.name),
    metaTag("property", "og:locale", SITE.locale),
    metaTag("property", "og:title", title),
    metaTag("property", "og:description", description),
    metaTag("property", "og:url", canonical),
    metaTag("property", "og:image", image),
    metaTag("property", "og:image:secure_url", image),
    metaTag("property", "og:image:width", "1200"),
    metaTag("property", "og:image:height", "630"),
    metaTag("property", "og:image:alt", altText),
    metaTag("property", "article:published_time", published),
    metaTag("property", "article:modified_time", modified),
    metaTag("property", "article:author", author),
    metaTag("property", "article:section", blog.category),
    ...keywords.slice(0, 6).map((k) => metaTag("property", "article:tag", k)),

    // ---- Twitter / X ----
    metaTag("name", "twitter:card", "summary_large_image"),
    metaTag("name", "twitter:site", SITE.twitterHandle),
    metaTag("name", "twitter:title", title),
    metaTag("name", "twitter:description", description),
    metaTag("name", "twitter:image", image),
    metaTag("name", "twitter:image:alt", altText),
    metaTag("name", "twitter:label1", "Reading time"),
    metaTag("name", "twitter:data1", `${blog.reading_time_minutes || 1} min read`),

    // ---- Core Web Vitals ----
    displayImage ? `    <link rel="preload" as="image" href="${escapeAttr(displayImage)}" fetchpriority="high" />` : null,
    `    <link rel="preconnect" href="${escapeAttr(SITE.apiUrl)}" crossorigin />`,
  ].filter(Boolean);

  const jsonLd = generateStructuredData(blog);
  if (jsonLd) {
    tags.push(
      `    <script type="application/ld+json">${escapeJsonLd(jsonLd)}</script>`
    );
  }

  return tags.join("\n");
};

/**
 * A `<noscript>` rendering of the post, injected into #root.
 *
 * The meta tags and JSON-LD above cover machine-readable metadata, but an AI
 * crawler that does not execute JavaScript still sees an empty page where the
 * article should be, and cannot quote a single sentence of it. This puts the
 * headline, the direct answer, the body, the facts and the FAQ in the initial
 * HTML payload as real text.
 *
 * It is inside the React root, so React discards it on the first client render.
 * Humans never see it; it exists purely for the no-JS fetch.
 *
 * It deliberately mirrors what the live page renders, and nothing more. The
 * short answer is NOT included: it is metadata now, shown to no reader, and
 * putting it in the crawler-only payload would be cloaking.
 */
const buildNoscriptBody = (blog) => {
  const facts = asArray(blog.key_facts).filter((f) => String(f.fact || "").trim());
  const faqs = asArray(blog.faq_schema).filter(
    (f) => String(f.question || "").trim() && String(f.answer || "").trim()
  );
  const terms = asArray(blog.definitions).filter(
    (d) => String(d.term || "").trim() && String(d.definition || "").trim()
  );

  const parts = [
    `<article class="seo-prerender">`,
    `<h1>${escapeAttr(blog.title)}</h1>`,
  ];

  if (blog.image) {
    parts.push(
      `<img src="${escapeAttr(absoluteUrl(blog.image))}" alt="${escapeAttr(blog.alt_text || blog.title)}" width="1200" height="675" />`
    );
  }

  // The body is inserted as plain escaped text rather than raw HTML. The stored
  // description is admin-authored and sanitised on render, but this string is
  // being concatenated into a document with no sanitiser in the path, so it is
  // escaped here too rather than trusted twice.
  const body = stripHtml(blog.description);
  if (body) parts.push(`<div class="seo-prerender-body"><p>${escapeAttr(body)}</p></div>`);

  if (terms.length) {
    parts.push("<h2>Definitions</h2><dl>");
    for (const t of terms) {
      parts.push(`<dt>${escapeAttr(t.term)}</dt><dd>${escapeAttr(t.definition)}</dd>`);
    }
    parts.push("</dl>");
  }

  if (facts.length) {
    parts.push("<h2>Key facts</h2><ul>");
    for (const f of facts) {
      const source = String(f.source || f.source_url || "").trim();
      parts.push(
        source
          ? `<li>${escapeAttr(f.fact)} <cite><a href="${escapeAttr(source)}" rel="nofollow noopener">Source</a></cite></li>`
          : `<li>${escapeAttr(f.fact)}</li>`
      );
    }
    parts.push("</ul>");
  }

  if (faqs.length) {
    parts.push("<h2>Frequently asked questions</h2>");
    for (const f of faqs) {
      parts.push(`<h3>${escapeAttr(f.question)}</h3><p>${escapeAttr(f.answer)}</p>`);
    }
  }

  parts.push("</article>");
  return parts.join("\n");
};

const injectIntoRoot = (html, bodyHtml) =>
  html.replace(
    /<div id="root">\s*<\/div>/i,
    `<div id="root">${bodyHtml}</div>`
  );

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Full HTML document for a blog post, or null if the build is not reachable
 * from this process (in which case the caller should fall back to its normal
 * static handling).
 */
const renderBlogHtml = (blog) => {
  const template = readTemplate();
  if (!template) return null;

  let html = injectIntoHead(template, buildBlogHead(blog));
  html = injectIntoRoot(html, buildNoscriptBody(blog));
  return setHtmlLang(html, SITE.language);
};

/** Head for a generic (non-article) page plus the site-wide Organization graph. */
const buildSiteHead = ({ title, description, url, image, robots = "index,follow" } = {}) => {
  const pageUrl = url || `${SITE.url}/`;
  const pageImage = image || SITE.defaultOgImage;
  const pageTitle = collapse(title || SITE.name, 70);
  const pageDescription = collapse(description || SITE.description, 160);

  const tags = [
    `    <title>${escapeAttr(pageTitle)}</title>`,
    metaTag("name", "description", pageDescription),
    metaTag("name", "robots", `${robots}, max-image-preview:large, max-snippet:-1`),
    `    <link rel="canonical" href="${escapeAttr(pageUrl)}" />`,
    metaTag("property", "og:type", "website"),
    metaTag("property", "og:site_name", SITE.name),
    metaTag("property", "og:locale", SITE.locale),
    metaTag("property", "og:title", pageTitle),
    metaTag("property", "og:description", pageDescription),
    metaTag("property", "og:url", pageUrl),
    metaTag("property", "og:image", pageImage),
    metaTag("name", "twitter:card", "summary_large_image"),
    metaTag("name", "twitter:title", pageTitle),
    metaTag("name", "twitter:description", pageDescription),
    metaTag("name", "twitter:image", pageImage),
    `    <script type="application/ld+json">${escapeJsonLd(generateSiteSchema())}</script>`,
  ].filter(Boolean);

  return tags.join("\n");
};

const renderSiteHtml = (meta) => {
  const template = readTemplate();
  if (!template) return null;
  return setHtmlLang(injectIntoHead(template, buildSiteHead(meta)), SITE.language);
};

/** /blogs index: site head plus a CollectionPage ItemList of the posts. */
const renderBlogListHtml = (posts = []) => {
  const template = readTemplate();
  if (!template) return null;

  const head = [
    buildSiteHead({
      title: `Blog — ${SITE.name}`,
      description:
        "Articles on digital marketing, SEO, paid advertising and web development from the Genie Media & Studio team in Visakhapatnam.",
      url: `${SITE.url}/blogs`,
    }).replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, ""),
    `    <script type="application/ld+json">${escapeJsonLd(generateBlogListSchema(posts))}</script>`,
  ].join("\n");

  const list = [
    '<div class="seo-prerender">',
    `<h1>Blog — ${escapeAttr(SITE.name)}</h1>`,
    "<ul>",
    ...posts.slice(0, 50).map(
      (p) =>
        `<li><a href="/blog/${escapeAttr(String(p.permalink || "").replace(/^\/+/, ""))}">${escapeAttr(
          p.meta_title || p.title
        )}</a>${p.metaDescription ? ` — ${escapeAttr(collapse(p.metaDescription, 160))}` : ""}</li>`
    ),
    "</ul>",
    "</div>",
  ].join("\n");

  return setHtmlLang(injectIntoRoot(injectIntoHead(template, head), list), SITE.language);
};

module.exports = {
  isAvailable,
  DIST_DIR,
  INDEX_PATH,
  renderBlogHtml,
  renderSiteHtml,
  renderBlogListHtml,
  buildBlogHead,
  buildSiteHead,
  buildNoscriptBody,
  escapeAttr,
  escapeJsonLd,
  parseJsonColumn,
};
