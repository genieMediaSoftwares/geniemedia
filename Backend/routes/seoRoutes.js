/**
 * Every public SEO / AEO / GEO surface, mounted as one router.
 *
 * Route order inside this file matters and is deliberate: the slug-history 301
 * check runs before the blog renderer, and the blog renderer runs before any
 * static SPA fallback the host mounts afterwards. Getting that order wrong turns
 * a redirect into a 404 or a rendered post into an empty shell.
 */

const express = require("express");

const { SITE, isBotRequest } = require("../config/site");
const {
  generateSitemapIndex,
  generatePagesSitemap,
  generateBlogSitemap,
  generateRobotsTxt,
  generateLlmsTxt,
} = require("../services/sitemapService");
const {
  renderBlogHtml,
  renderBlogListHtml,
  renderSiteHtml,
  isAvailable: isSpaAvailable,
} = require("../services/htmlInjector");
const { generateStructuredData } = require("../services/structuredData");
const { hydrateSeoRow } = require("../services/blogSeoFields");
const { cleanSlug } = require("../services/structuredData");
const { analyseFocusKeyword, auditHeadings, deriveContentMetrics } = require("../services/contentAnalysis");
const { validateForPublish } = require("../services/seoValidation");

const query = (db, sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });

/**
 * @param {object} db      mysql2 pool.
 * @param {Function} verifyToken JWT middleware, reused for the admin-only routes.
 */
module.exports = function seoRoutes(db, verifyToken) {
  const router = express.Router();

  // =========================================================================
  // SITEMAPS
  // =========================================================================

  const sendXml = (res, xml, maxAge = 600) => {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", `public, max-age=${maxAge}`);
    res.send(xml);
  };

  router.get("/sitemap.xml", async (req, res) => {
    try {
      sendXml(res, await generateSitemapIndex(db));
    } catch (err) {
      console.error("sitemap index error:", err.message);
      res.status(500).send("Error generating sitemap");
    }
  });

  router.get("/pages.xml", async (req, res) => {
    try {
      sendXml(res, await generatePagesSitemap(db));
    } catch (err) {
      console.error("pages sitemap error:", err.message);
      res.status(500).send("Error generating sitemap");
    }
  });

  router.get("/blogs.xml", async (req, res) => {
    try {
      sendXml(res, await generateBlogSitemap(db));
    } catch (err) {
      console.error("blog sitemap error:", err.message);
      res.status(500).send("Error generating sitemap");
    }
  });

  router.get("/robots.txt", (req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(generateRobotsTxt());
  });

  router.get("/llms.txt", async (req, res) => {
    try {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(await generateLlmsTxt(db));
    } catch (err) {
      res.status(500).send("Error generating llms.txt");
    }
  });

  // =========================================================================
  // ADMIN: live SEO analysis
  // =========================================================================

  /**
   * Same analysis the editor runs in the browser, but authoritative.
   *
   * The admin panel calls this on save so the checklist it shows and the gate
   * the server enforces can never disagree — a mismatch between the two is how
   * you get an editor who fixed everything and still cannot publish.
   */
  router.post("/api/seo/analyze", verifyToken, (req, res) => {
    const body = req.body || {};
    const content = body.description || "";

    const validation = validateForPublish(body, { enforce: false });
    const keyword = analyseFocusKeyword({
      keyword: body.focus_keyword,
      title: body.title,
      metaTitle: body.meta_title,
      metaDescription: body.metaDescription,
      permalink: body.permalink,
      altText: body.alt_text,
      content,
    });

    res.json({
      success: true,
      validation,
      keyword,
      headings: auditHeadings(content),
      metrics: deriveContentMetrics(content),
    });
  });

  /** The JSON-LD a post would emit, for pasting into the Rich Results Test. */
  router.get("/api/seo/preview/:id", verifyToken, async (req, res) => {
    try {
      const rows = await query(db, "SELECT * FROM blogs WHERE id = ?", [req.params.id]);
      if (!rows.length) return res.status(404).json({ success: false, message: "Blog not found" });
      res.json({ success: true, jsonLd: generateStructuredData(hydrateSeoRow(rows[0])) });
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to build preview" });
    }
  });

  /**
   * Apache rewrite rules for every retired slug.
   *
   * .htaccess cannot query MySQL, so the redirects cannot be driven from the
   * database at request time on Apache. This endpoint emits them as a rules
   * block that can be pasted into .htaccess or pulled by a deploy step. Express
   * already handles the same redirects directly (see below), so this is for the
   * case where Apache serves the SPA without proxying through Node.
   */
  router.get("/seo/redirects.htaccess", async (req, res) => {
    try {
      const rows = await query(
        db,
        "SELECT permalink, slug_history FROM blogs WHERE slug_history IS NOT NULL"
      );

      const lines = [
        "# ── Genie Media blog slug redirects ──────────────────────────",
        "# Generated from the blogs.slug_history column.",
        `# Generated at ${new Date().toISOString()}`,
        "# Paste between the RewriteEngine line and the SPA fallback rule.",
        "",
      ];

      for (const row of rows) {
        const hydrated = hydrateSeoRow(row);
        for (const entry of hydrated.slug_history) {
          const from = cleanSlug(entry.slug);
          const to = cleanSlug(row.permalink);
          if (!from || !to || from === to) continue;
          lines.push(`RewriteRule ^blog/${from}/?$ /blog/${to} [R=301,L]`);
        }
      }

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.send(lines.join("\n"));
    } catch (err) {
      res.status(500).send("# Error generating redirects");
    }
  });

  // =========================================================================
  // PART 4 OPTION A — server-rendered <head> for blog pages
  // =========================================================================

  /**
   * Looks a slug up, following the slug history if the live permalink misses.
   *
   * Returns `{ row, redirectTo }`. A hit on the history means the post moved and
   * the caller should answer 301, which is what preserves the ranking and the
   * inbound links that pointed at the old URL.
   */
  const findBySlug = async (slug) => {
    const clean = cleanSlug(slug);
    if (!clean) return { row: null, redirectTo: null };

    const direct = await query(db, "SELECT * FROM blogs WHERE permalink = ? LIMIT 1", [clean]);
    if (direct.length) return { row: hydrateSeoRow(direct[0]), redirectTo: null };

    // Also try the stored form with a leading slash, since older rows were
    // saved inconsistently.
    const alt = await query(db, "SELECT * FROM blogs WHERE permalink = ? LIMIT 1", [`/${clean}`]);
    if (alt.length) return { row: hydrateSeoRow(alt[0]), redirectTo: null };

    // LIKE is a coarse filter to avoid scanning every row's JSON; the exact
    // match is confirmed in JavaScript afterwards.
    const candidates = await query(
      db,
      "SELECT * FROM blogs WHERE slug_history IS NOT NULL AND slug_history LIKE ? LIMIT 25",
      [`%${clean}%`]
    );

    for (const candidate of candidates) {
      const hydrated = hydrateSeoRow(candidate);
      if (hydrated.slug_history.some((entry) => cleanSlug(entry.slug) === clean)) {
        return { row: hydrated, redirectTo: `/blog/${cleanSlug(candidate.permalink)}` };
      }
    }

    return { row: null, redirectTo: null };
  };

  /**
   * Serves /blog/<slug> with a fully-formed head.
   *
   * Mounted with `use` rather than `get` because permalinks contain slashes
   * ("seo/best-services"), which a single :param cannot capture.
   */
  router.use("/blog", async (req, res, next) => {
    // Only HTML navigations are handled here; asset requests fall through.
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (!isSpaAvailable()) return next();

    const slug = req.path.replace(/^\/+/, "");
    if (!slug) return next();
    if (/\.(js|css|png|jpe?g|webp|svg|ico|woff2?|map|json|txt|xml)$/i.test(slug)) return next();

    try {
      const { row, redirectTo } = await findBySlug(slug);

      if (redirectTo) {
        // 301, not 302: a permanent redirect is what transfers the accumulated
        // ranking signals from the old URL to the new one.
        return res.redirect(301, redirectTo);
      }

      if (!row) return next();

      // A draft must not be readable by URL, and must not be indexed if someone
      // guesses it. It is served as a normal SPA shell marked noindex rather
      // than as a 404, so an admin previewing their own draft still sees it.
      if (row.status !== "published") {
        const html = renderSiteHtml({
          title: `${row.title} — draft`,
          description: "This post is not published.",
          url: `${SITE.url}/blog/${cleanSlug(row.permalink)}`,
          robots: "noindex,nofollow",
        });
        res.setHeader("X-Robots-Tag", "noindex, nofollow");
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.send(html);
      }

      const html = renderBlogHtml(row);
      if (!html) return next();

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      // Short public cache with a long stale window: crawlers and repeat readers
      // get an instant response, and a publish is still visible within a minute.
      res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=600");
      res.setHeader("X-SEO-Rendered", isBotRequest(req) ? "bot" : "user");
      return res.send(html);
    } catch (err) {
      console.error("blog render error:", err.message);
      return next();
    }
  });

  /** /blogs index with a CollectionPage graph and a crawlable list of posts. */
  router.get("/blogs", async (req, res, next) => {
    if (!isSpaAvailable()) return next();
    try {
      const rows = await query(
        db,
        `SELECT permalink, title, meta_title, metaDescription
           FROM blogs
          WHERE status = 'published'
          ORDER BY COALESCE(updatedAt, createdAt) DESC
          LIMIT 100`
      );
      const html = renderBlogListHtml(rows);
      if (!html) return next();
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=300");
      return res.send(html);
    } catch (err) {
      return next();
    }
  });

  return router;
};
