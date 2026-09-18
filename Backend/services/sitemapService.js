/**
 * Dynamic sitemap.xml, blogs.xml, pages.xml and robots.txt.
 *
 * These are generated per request from MySQL rather than written to disk as
 * static files. A static sitemap is correct for exactly as long as nobody
 * publishes anything; after that it is a list of stale URLs that actively wastes
 * crawl budget and reports the wrong <lastmod> for everything. Generating means
 * publishing a post updates the sitemap in the same instant.
 *
 * Output is cached in memory for a few minutes and the cache is dropped
 * explicitly whenever a post is created, updated or deleted, so the common case
 * costs nothing and a publish is still reflected immediately.
 */

const { SITE, AI_CRAWLERS } = require("../config/site");
const { absoluteUrl, cleanSlug, toIso } = require("./structuredData");

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

const getCached = (key) => {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;
  return null;
};

const setCached = (key, value) => {
  cache.set(key, { at: Date.now(), value });
  return value;
};

/** Called from every blog write path so a publish is never served from cache. */
const invalidateSitemapCache = () => cache.clear();

const escapeXml = (value) =>
  String(value === null || value === undefined ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const isoDate = (value) => {
  const iso = toIso(value);
  return iso ? iso.split("T")[0] : new Date().toISOString().split("T")[0];
};

const query = (db, sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });

// ---------------------------------------------------------------------------
// Static routes
// ---------------------------------------------------------------------------

/**
 * Every public route the SPA serves, with a priority that reflects how much of
 * the business each one carries. `changefreq` is advisory only — modern crawlers
 * mostly ignore it — but `lastmod` is respected and is worth getting right.
 */
const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/about", priority: "0.8", changefreq: "monthly" },
  { path: "/services", priority: "0.9", changefreq: "monthly" },
  { path: "/digital_marketing", priority: "0.9", changefreq: "monthly" },
  { path: "/web_development", priority: "0.9", changefreq: "monthly" },
  { path: "/production_house", priority: "0.9", changefreq: "monthly" },
  { path: "/podcast_studio", priority: "0.9", changefreq: "monthly" },
  { path: "/projects", priority: "0.7", changefreq: "weekly" },
  { path: "/reviews", priority: "0.6", changefreq: "monthly" },
  { path: "/blogs", priority: "0.8", changefreq: "daily" },
  { path: "/contact", priority: "0.7", changefreq: "monthly" },
];

const urlEntry = ({ loc, lastmod, changefreq, priority, image }) => {
  const lines = [
    "  <url>",
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <lastmod>${escapeXml(lastmod)}</lastmod>`,
  ];
  if (changefreq) lines.push(`    <changefreq>${changefreq}</changefreq>`);
  if (priority) lines.push(`    <priority>${priority}</priority>`);
  if (image && image.url) {
    // The image sitemap extension is what gets a featured image into Google
    // Images, which for a blog is a meaningful second traffic source.
    lines.push("    <image:image>");
    lines.push(`      <image:loc>${escapeXml(image.url)}</image:loc>`);
    if (image.caption) lines.push(`      <image:caption>${escapeXml(image.caption)}</image:caption>`);
    lines.push("    </image:image>");
  }
  lines.push("  </url>");
  return lines.join("\n");
};

const urlSet = (entries) =>
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.join("\n")}
</urlset>`;

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

/** Sitemap of the fixed marketing pages. */
const generatePagesSitemap = async (db) => {
  const cached = getCached("pages");
  if (cached) return cached;

  // The static pages have no per-page modification date in the database, so the
  // most recent publish is used as a conservative stand-in: it is the last time
  // anything on the site demonstrably changed.
  let lastmod = new Date().toISOString().split("T")[0];
  try {
    const rows = await query(
      db,
      "SELECT MAX(COALESCE(updatedAt, createdAt)) AS latest FROM blogs WHERE status = 'published'"
    );
    if (rows[0] && rows[0].latest) lastmod = isoDate(rows[0].latest);
  } catch (_) {}

  const entries = STATIC_ROUTES.map((route) =>
    urlEntry({
      loc: `${SITE.url}${route.path}`,
      lastmod,
      changefreq: route.changefreq,
      priority: route.priority,
    })
  );

  return setCached("pages", urlSet(entries));
};

/** Sitemap of every published post, newest first. */
const generateBlogSitemap = async (db) => {
  const cached = getCached("blogs");
  if (cached) return cached;

  const rows = await query(
    db,
    `SELECT permalink, title, image, alt_text, last_modified_at, updatedAt, createdAt, canonical_url, robots_directive
       FROM blogs
      WHERE status = 'published'
      ORDER BY COALESCE(updatedAt, createdAt) DESC`
  );

  const entries = rows
    // A post explicitly marked noindex must not be advertised in the sitemap —
    // submitting a URL you have also told the crawler to ignore is a
    // contradiction Search Console reports as an error.
    .filter((row) => !String(row.robots_directive || "").startsWith("noindex"))
    .map((row) =>
      urlEntry({
        loc: row.canonical_url || `${SITE.url}/blog/${cleanSlug(row.permalink)}`,
        lastmod: isoDate(row.last_modified_at || row.updatedAt || row.createdAt),
        changefreq: "weekly",
        priority: "0.8",
        image: row.image
          ? { url: absoluteUrl(row.image), caption: row.alt_text || row.title }
          : null,
      })
    );

  return setCached("blogs", urlSet(entries));
};

/**
 * The sitemap index.
 *
 * `services.xml` is a pre-existing static file on the web host, so it is listed
 * here but not generated here.
 */
const generateSitemapIndex = async (db) => {
  const cached = getCached("index");
  if (cached) return cached;

  let blogLastmod = new Date().toISOString().split("T")[0];
  try {
    const rows = await query(
      db,
      "SELECT MAX(COALESCE(updatedAt, createdAt)) AS latest FROM blogs WHERE status = 'published'"
    );
    if (rows[0] && rows[0].latest) blogLastmod = isoDate(rows[0].latest);
  } catch (_) {}

  const today = new Date().toISOString().split("T")[0];
  const maps = [
    { loc: `${SITE.url}/pages.xml`, lastmod: today },
    { loc: `${SITE.url}/services.xml`, lastmod: today },
    { loc: `${SITE.url}/blogs.xml`, lastmod: blogLastmod },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${maps
  .map((m) => `  <sitemap>\n    <loc>${escapeXml(m.loc)}</loc>\n    <lastmod>${m.lastmod}</lastmod>\n  </sitemap>`)
  .join("\n")}
</sitemapindex>`;

  return setCached("index", xml);
};

// ---------------------------------------------------------------------------
// robots.txt
// ---------------------------------------------------------------------------

/**
 * robots.txt that welcomes the AI crawlers by name.
 *
 * The important detail is what is NOT here: no blanket disallow, and no attempt
 * to block scrapers with a wildcard. GPTBot, ClaudeBot, PerplexityBot,
 * Google-Extended and CCBot are the crawlers that decide whether this site can
 * be cited in an AI answer, and they are commonly blocked by accident. Each one
 * is therefore granted access explicitly rather than relying on the `*` rule, so
 * that a future tightening of the wildcard cannot silently remove the site from
 * every AI surface.
 *
 * Only /admin and /api are closed — one has no public value, the other returns
 * JSON that would compete with the real pages in the index.
 */
const generateRobotsTxt = () => {
  const disallow = ["/admin", "/admin/", "/api/", "/share/", "/*?*replytocom="];

  const block = (agent, extra = []) =>
    [`User-agent: ${agent}`, "Allow: /", ...disallow.map((d) => `Disallow: ${d}`), ...extra, ""].join("\n");

  const header = [
    `# robots.txt for ${SITE.name}`,
    `# Generated dynamically — edit Backend/services/sitemapService.js, not a static file.`,
    "",
  ].join("\n");

  const general = block("*");

  const aiSection = [
    "# ---------------------------------------------------------------",
    "# AI / answer-engine crawlers.",
    "# These are allowed deliberately. They are what make this site",
    "# eligible to be cited in AI Overviews, ChatGPT search, Perplexity",
    "# and Claude. Do not add a blanket Disallow above without",
    "# re-checking these blocks.",
    "# ---------------------------------------------------------------",
    "",
    ...AI_CRAWLERS.map((agent) => block(agent)),
  ].join("\n");

  const crawlHints = [
    "# Image crawlers need the uploads host reachable.",
    "User-agent: Googlebot-Image",
    "Allow: /",
    "",
    `Host: ${SITE.url.replace(/^https?:\/\//, "")}`,
    `Sitemap: ${SITE.url}/sitemap.xml`,
    `Sitemap: ${SITE.url}/pages.xml`,
    `Sitemap: ${SITE.url}/services.xml`,
    `Sitemap: ${SITE.url}/blogs.xml`,
    "",
  ].join("\n");

  return [header, general, aiSection, crawlHints].join("\n");
};

// ---------------------------------------------------------------------------
// llms.txt
// ---------------------------------------------------------------------------

/**
 * llms.txt — a plain-Markdown map of the site for retrieval engines.
 *
 * Not a standard anybody is obliged to honour yet, but it is cheap, and the
 * blog section has to be generated or it goes stale the same way a static
 * sitemap does.
 */
const generateLlmsTxt = async (db) => {
  const cached = getCached("llms");
  if (cached) return cached;

  let posts = [];
  try {
    posts = await query(
      db,
      `SELECT permalink, title, meta_title, metaDescription, direct_answer, category
         FROM blogs
        WHERE status = 'published'
        ORDER BY COALESCE(updatedAt, createdAt) DESC
        LIMIT 100`
    );
  } catch (_) {}

  const lines = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    `- Location: ${SITE.address.streetAddress}, ${SITE.address.addressLocality} - ${SITE.address.postalCode}`,
    `- Phone: ${SITE.contact.telephone}`,
    `- Email: ${SITE.contact.email}`,
    "",
    "## Pages",
    "",
    ...STATIC_ROUTES.map((r) => `- [${r.path === "/" ? "Home" : r.path.replace(/^\//, "").replace(/_/g, " ")}](${SITE.url}${r.path})`),
    "",
    "## Articles",
    "",
    ...posts.map((p) => {
      const summary = String(p.direct_answer || p.metaDescription || "").replace(/\s+/g, " ").trim();
      return `- [${p.meta_title || p.title}](${SITE.url}/blog/${cleanSlug(p.permalink)})${summary ? `: ${summary}` : ""}`;
    }),
    "",
  ];

  return setCached("llms", lines.join("\n"));
};

module.exports = {
  generateSitemapIndex,
  generatePagesSitemap,
  generateBlogSitemap,
  generateRobotsTxt,
  generateLlmsTxt,
  invalidateSitemapCache,
  STATIC_ROUTES,
};
