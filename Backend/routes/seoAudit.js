// =========================================================================
// =================== TECHNICAL SEO AUDIT & PERFORMANCE ===================
// Crawls the public site from the sitemap and the home page, checks every
// page for technical problems, and stores evidence for each issue. Also
// runs Google PageSpeed Insights and keeps the history.
//
// Nothing here changes the website. Issues that map to an SEO-manager field
// carry a "draft" fix target; the admin applies it to a draft and publishes.
// =========================================================================

const express = require("express");
const axios = require("axios");
const { isPublicHttpUrl, publicRequestOptions } = require("../services/safeFetch");
const { inspectHtml, flattenJsonLd } = require("../services/htmlInspect");

const MAX_PAGES = 250;
const MAX_EXTERNAL = 40;
const UA = "GenieMediaSeoAudit/1.0 (+https://geniemedia.in)";
const SKIP_EXT = /\.(png|jpe?g|webp|gif|svg|ico|css|js|mjs|json|xml|txt|pdf|zip|mp4|webm|woff2?|ttf|php)$/i;
const SEVERITY_RANK = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };

const TABLES = [
  `CREATE TABLE IF NOT EXISTS seo_audit_runs (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    status     VARCHAR(20)  NOT NULL,
    trigger_by VARCHAR(190) NULL,
    startedAt  BIGINT       NOT NULL,
    finishedAt BIGINT       NULL,
    pages      INT          NULL,
    summary    JSON         NULL,
    INDEX idx_audit_runs_started (startedAt)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS seo_audit_issues (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    run_id    INT          NOT NULL,
    url       VARCHAR(500) NOT NULL,
    code      VARCHAR(60)  NOT NULL,
    severity  VARCHAR(10)  NOT NULL,
    category  VARCHAR(30)  NOT NULL,
    message   VARCHAR(500) NOT NULL,
    evidence  JSON         NULL,
    why       VARCHAR(500) NULL,
    fix       VARCHAR(500) NULL,
    auto_fix  VARCHAR(10)  NOT NULL,
    target    JSON         NULL,
    INDEX idx_audit_issues_run (run_id),
    INDEX idx_audit_issues_sev (severity)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS seo_audit_pages (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    run_id  INT          NOT NULL,
    url     VARCHAR(500) NOT NULL,
    status  INT          NULL,
    data    JSON         NULL,
    INDEX idx_audit_pages_run (run_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS seo_psi_runs (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    url           VARCHAR(500) NOT NULL,
    strategy      VARCHAR(10)  NOT NULL,
    fetchedAt     BIGINT       NOT NULL,
    score         INT          NULL,
    lab           JSON         NULL,
    field         JSON         NULL,
    opportunities JSON         NULL,
    error         VARCHAR(500) NULL,
    INDEX idx_psi_url (url(200), strategy)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

const normalizeUrl = (u, siteUrl) => {
  try {
    const url = new URL(u, siteUrl);
    url.hash = "";
    url.search = "";
    let s = url.toString();
    if (url.pathname !== "/") s = s.replace(/\/+$/, "");
    return s;
  } catch (_) {
    return null;
  }
};
const sameCanonical = (a, b) => String(a || "").replace(/\/+$/, "") === String(b || "").replace(/\/+$/, "");

module.exports = function seoAuditRoutes({ db, verifyToken, siteUrl, site }) {
  const router = express.Router();
  const host = new URL(siteUrl).host;
  const query = (sql, params = []) =>
    new Promise((resolve, reject) => db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows))));
  const fail = (res, status, message) => res.status(status).json({ success: false, message });
  const adminOf = (req) => String((req.user && (req.user.email || req.user.id)) || "unknown").slice(0, 190);
  const parse = (v, d) => {
    if (v === null || v === undefined) return d;
    if (typeof v === "object") return v;
    try {
      return JSON.parse(v);
    } catch (_) {
      return d;
    }
  };

  (async () => {
    try {
      for (const sql of TABLES) await query(sql);
      await query("UPDATE seo_audit_runs SET status = 'failed', finishedAt = ? WHERE status = 'running'", [Date.now()]);
    } catch (err) {
      console.log("❌ SEO AUDIT TABLES ERROR:", err.message);
    }
  })();

  // The crawler only ever requests this website's own host. Redirects or
  // sitemap entries that point elsewhere are recorded, never fetched.
  const ownHost = (u) => {
    try {
      const h = new URL(u);
      return ["http:", "https:"].includes(h.protocol) && h.host.toLowerCase() === host.toLowerCase();
    } catch (_) {
      return false;
    }
  };

  const fetchFollow = async (url) => {
    const chain = [];
    let current = url;
    for (let hop = 0; hop < 6; hop++) {
      const started = Date.now();
      let res;
      if (!ownHost(current)) return { url, finalUrl: current, status: 0, offsite: true, error: "Points to another website; not crawled.", chain };
      try {
        res = await axios.get(current, { maxRedirects: 0, timeout: 25000, responseType: "text", headers: { "User-Agent": UA }, validateStatus: () => true });
      } catch (err) {
        return { url, finalUrl: current, status: 0, error: err.message, chain };
      }
      if (res.status >= 300 && res.status < 400 && res.headers.location) {
        const next = new URL(res.headers.location, current).toString();
        chain.push({ from: current, to: next, status: res.status });
        if (chain.some((c) => c.from === next)) return { url, finalUrl: next, status: res.status, loop: true, chain };
        current = next;
        continue;
      }
      return { url, finalUrl: current, status: res.status, headers: res.headers, body: typeof res.data === "string" ? res.data : "", ms: Date.now() - started, chain };
    }
    return { url, finalUrl: current, status: 310, tooMany: true, chain };
  };

  const sitemapUrls = async () => {
    try {
      const res = await axios.get(`${siteUrl}/sitemap.xml`, { timeout: 30000, responseType: "text", headers: { "User-Agent": UA }, validateStatus: () => true });
      if (res.status !== 200) return { ok: false, status: res.status, urls: [] };
      const urls = [...String(res.data).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()).filter((u) => !/\.(png|jpe?g|webp)$/i.test(u));
      return { ok: true, status: 200, urls };
    } catch (err) {
      return { ok: false, status: 0, error: err.message, urls: [] };
    }
  };

  const pool = async (items, size, fn) => {
    const out = [];
    let i = 0;
    await Promise.all(
      Array.from({ length: size }, async () => {
        while (i < items.length) {
          const idx = i++;
          out[idx] = await fn(items[idx]);
        }
      })
    );
    return out;
  };

  const runAudit = async (runId) => {
    const issues = [];
    const add = (url, code, severity, category, message, evidence, why, fix, autoFix = "manual", target = null) =>
      issues.push({ url, code, severity, category, message, evidence, why, fix, autoFix, target });
    const managed = Object.fromEntries((await query("SELECT id, path FROM seo_pages")).map((p) => [p.path, p.id]));
    const pathOf = (u) => {
      try {
        return new URL(u).pathname.replace(/\/+$/, "") || "/";
      } catch (_) {
        return null;
      }
    };
    const draftTarget = (u, field) => {
      const p = pathOf(u);
      return p && managed[p] ? { pageId: managed[p], path: p, field } : null;
    };

    const sm = await sitemapUrls();
    if (!sm.ok) add(`${siteUrl}/sitemap.xml`, "SITEMAP_UNAVAILABLE", "critical", "sitemap", "The sitemap could not be loaded.", { status: sm.status, error: sm.error }, "Search engines use the sitemap to discover pages.", "Check that /sitemap.xml returns valid XML with HTTP 200.");
    const offsite = sm.urls.filter((u) => !ownHost(u));
    if (offsite.length) add(`${siteUrl}/sitemap.xml`, "SITEMAP_OFFSITE_URL", "high", "sitemap", `${offsite.length} sitemap URL(s) point to another host.`, { examples: offsite.slice(0, 5), expectedHost: host }, "Sitemaps may only list URLs on the site's own host; others are ignored.", "Generate the sitemap with this site's address.");
    const inSitemap = new Set(sm.urls.filter(ownHost).map((u) => normalizeUrl(u, siteUrl)));
    const queue = [normalizeUrl(`${siteUrl}/`, siteUrl), ...[...inSitemap]];
    const seen = new Set();
    const pages = [];
    const inlinks = {};
    const externals = new Set();

    while (queue.length && pages.length < MAX_PAGES) {
      const batch = [];
      while (queue.length && batch.length < 4) {
        const u = queue.shift();
        if (!u || seen.has(u)) continue;
        seen.add(u);
        batch.push(u);
      }
      const results = await Promise.all(batch.map((u) => fetchFollow(u)));
      for (const r of results) {
        const page = { url: r.url, status: r.status, finalUrl: r.finalUrl, chain: r.chain, ms: r.ms || null, error: r.error || null };
        const isHtml = r.headers && /text\/html/.test(String(r.headers["content-type"] || ""));
        if (r.status === 200 && isHtml) {
          const info = inspectHtml(r.body, r.finalUrl);
          page.info = info;
          page.xRobots = String((r.headers || {})["x-robots-tag"] || "");
          for (const a of info.anchors) {
            if (!a.url || !/^https?:/.test(a.url)) continue;
            const target = new URL(a.url);
            if (target.host === host || target.host === `www.${host}`) {
              const n = normalizeUrl(a.url, siteUrl);
              if (!n || SKIP_EXT.test(n) || /\/(admin|api|share)(\/|$)/.test(new URL(n).pathname)) continue;
              if (n !== normalizeUrl(r.finalUrl, siteUrl)) (inlinks[n] = inlinks[n] || []).push({ from: r.url, text: a.text });
              if (!seen.has(n) && !queue.includes(n)) queue.push(n);
            } else if (/^https?:/.test(a.url) && !/^(mailto|tel):/.test(a.href)) {
              externals.add(a.url.split("#")[0]);
            }
          }
        }
        pages.push(page);
      }
    }

    const titleSeen = {};
    const descSeen = {};
    const orgFacts = [];
    for (const page of pages) {
      const u = page.url;
      const listed = inSitemap.has(u);
      if (page.loop) add(u, "REDIRECT_LOOP", "critical", "redirects", "Redirect loop.", { chain: page.chain }, "Visitors and crawlers can never reach the content.", "Fix the redirect rules so the chain ends on a 200 page.");
      else if (page.chain && page.chain.length > 1) add(u, "REDIRECT_CHAIN", "medium", "redirects", `Redirect chain with ${page.chain.length} hops.`, { chain: page.chain }, "Each extra hop slows crawling and dilutes signals.", "Point links and redirects straight at the final URL.");
      if (page.status !== 200) {
        const sev = listed ? "critical" : page.status >= 400 || page.status === 0 ? "high" : "low";
        add(u, page.status >= 400 || page.status === 0 ? "HTTP_ERROR" : "NON_200", sev, "status", `Returns HTTP ${page.status || "error"}${listed ? " but is listed in the sitemap" : ""}.`, { status: page.status, error: page.error, linkedFrom: (inlinks[u] || []).slice(0, 5) }, "Pages that do not answer 200 cannot be indexed.", listed ? "Remove it from the sitemap or restore the page." : "Fix or remove the links that point here.");
        continue;
      }
      if (!page.info) continue;
      const i = page.info;
      const noindex = /noindex/i.test(`${i.robots} ${i.googlebot} ${page.xRobots}`);
      if (listed && noindex) add(u, "SITEMAP_NOINDEX", "critical", "indexing", "Listed in the sitemap but marked noindex.", { robots: i.robots, xRobots: page.xRobots }, "Conflicting signals: the sitemap asks Google to index a page that refuses indexing.", "Remove noindex if the page should rank, or drop it from the sitemap.", "draft", draftTarget(u, "robotsIndex"));
      if (!i.titles.length || !i.titles[0]) add(u, "TITLE_MISSING", "high", "metadata", "No title.", {}, "The title is the main headline in search results.", "Add a descriptive title.", "draft", draftTarget(u, "seoTitle"));
      if (i.titles.length > 1) add(u, "TITLE_MULTIPLE", "medium", "metadata", `${i.titles.length} title tags.`, { titles: i.titles }, "Search engines may pick the wrong one.", "Keep exactly one title tag.");
      const title = i.titles[0] || "";
      if (title && (title.length < 25 || title.length > 65)) add(u, "TITLE_LENGTH", "low", "metadata", `Title is ${title.length} characters.`, { title }, "Very short titles waste space; long ones are cut off.", "Aim for about 30–60 characters.", "draft", draftTarget(u, "seoTitle"));
      if (!i.descriptions.length || !i.descriptions[0]) add(u, "DESCRIPTION_MISSING", "medium", "metadata", "No meta description.", {}, "Without one, Google invents a snippet.", "Write a 120–160 character summary.", "draft", draftTarget(u, "metaDescription"));
      const desc = i.descriptions[0] || "";
      if (desc && (desc.length < 70 || desc.length > 170)) add(u, "DESCRIPTION_LENGTH", "low", "metadata", `Meta description is ${desc.length} characters.`, { description: desc }, "Very short or very long descriptions show poorly.", "Aim for 120–160 characters.", "draft", draftTarget(u, "metaDescription"));
      if (!noindex) {
        if (title) (titleSeen[title] = titleSeen[title] || []).push(u);
        if (desc) (descSeen[desc] = descSeen[desc] || []).push(u);
      }
      if (!i.canonicals.length) add(u, "CANONICAL_MISSING", "high", "canonical", "No canonical URL.", {}, "Without a canonical, duplicate URLs can split signals.", "Add a self-referencing canonical.", "draft", draftTarget(u, "canonicalUrl"));
      if (i.canonicals.length > 1) add(u, "CANONICAL_MULTIPLE", "high", "canonical", `${i.canonicals.length} canonical tags.`, { canonicals: i.canonicals }, "Conflicting canonicals are ignored.", "Keep one canonical tag.");
      const canon = i.canonicals[0];
      if (canon) {
        let cu = null;
        try {
          cu = new URL(canon);
        } catch (_) {}
        if (!cu) add(u, "CANONICAL_INVALID", "high", "canonical", "Canonical is not a valid URL.", { canonical: canon }, "Invalid canonicals are ignored.", "Use an absolute https:// URL.", "draft", draftTarget(u, "canonicalUrl"));
        else if (cu.host !== host) add(u, "CANONICAL_CROSS_DOMAIN", "critical", "canonical", `Canonical points to ${cu.host}.`, { canonical: canon }, "Google may index the other domain instead of this page.", "Use the page's own https://geniemedia.in URL.", "draft", draftTarget(u, "canonicalUrl"));
        else if (cu.protocol !== "https:") add(u, "CANONICAL_HTTP", "high", "canonical", "Canonical uses http://.", { canonical: canon }, "Mixed protocol canonicals send conflicting signals.", "Use https://.", "draft", draftTarget(u, "canonicalUrl"));
        else if (!sameCanonical(normalizeUrl(canon, siteUrl), u)) add(u, "CANONICAL_OTHER_PAGE", listed ? "high" : "medium", "canonical", "Canonical points to a different page.", { canonical: canon, page: u }, "This page asks Google to index another URL instead.", "Use a self-referencing canonical unless this page is a deliberate duplicate.", "draft", draftTarget(u, "canonicalUrl"));
      }
      if (!i.h1.length) add(u, "H1_MISSING", "high", "content", "No H1 heading.", {}, "The H1 tells visitors and search engines what the page is about.", "Add one H1 that names the page's topic.", "draft", draftTarget(u, "preferredH1"));
      if (i.h1.length > 1) add(u, "H1_MULTIPLE", "medium", "content", `${i.h1.length} H1 headings.`, { h1: i.h1 }, "One clear main heading is easier to understand.", "Keep one H1; turn others into H2s.");
      if (/(not found|404|page missing)/i.test(title)) add(u, "SOFT_404", "high", "status", "Looks like an error page but returns HTTP 200.", { title }, "Soft 404s waste crawl budget and can be reported in Search Console.", "Return a real 404 status for missing pages.");
      if (!noindex && i.wordCount < 150) add(u, "THIN_CONTENT", "low", "content", `Only ${i.wordCount} words of visible content.`, { words: i.wordCount }, "Very short pages rarely satisfy a search.", "Add genuinely useful detail, or noindex the page if it should not rank.");
      const noAlt = i.images.filter((im) => im.alt === null);
      if (noAlt.length) add(u, "IMAGE_ALT_MISSING", "medium", "images", `${noAlt.length} image(s) without an alt attribute.`, { images: noAlt.slice(0, 10).map((im) => im.src) }, "Alt text describes images to screen readers and search engines.", "Describe what each image shows (decorative images get alt=\"\").");
      const noSize = i.images.filter((im) => !im.width || !im.height);
      if (noSize.length) add(u, "IMAGE_DIMENSIONS", "low", "performance", `${noSize.length} image(s) without width and height.`, { images: noSize.slice(0, 10).map((im) => im.src) }, "Missing dimensions can cause layout shift (CLS).", "Set width and height on images.");
      if (!i.og.title || !i.og.description || !i.og.image) add(u, "OPEN_GRAPH_INCOMPLETE", "low", "metadata", "Open Graph tags are incomplete.", { og: i.og }, "Social and chat previews look broken without them.", "Add og:title, og:description and og:image.", "draft", draftTarget(u, "ogImage"));
      if (!i.viewport) add(u, "VIEWPORT_MISSING", "medium", "mobile", "No viewport meta tag.", {}, "Pages render as desktop pages on phones.", "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">.");
      if (!i.lang) add(u, "LANG_MISSING", "low", "accessibility", "No lang attribute on <html>.", {}, "Helps search engines and screen readers.", "Set <html lang=\"en\">.");
      if (i.mixedContent) add(u, "MIXED_CONTENT", "low", "security", "Loads http:// resources on an https:// page.", {}, "Browsers block or warn about insecure resources.", "Use https:// URLs.");

      const bad = i.jsonLd.filter((b) => !b.ok);
      if (bad.length) add(u, "JSONLD_INVALID", "high", "structured_data", `${bad.length} JSON-LD block(s) cannot be parsed.`, { errors: bad.map((b) => b.error) }, "Invalid structured data is ignored.", "Fix the JSON syntax.");
      const nodes = flattenJsonLd(i.jsonLd);
      const types = nodes.flatMap((n) => [].concat(n["@type"] || []));
      for (const t of ["AggregateRating", "Review"]) {
        if (types.includes(t)) add(u, "JSONLD_REVIEW_MARKUP", "medium", "structured_data", `${t} markup found.`, { types }, "Review markup must reflect genuine, visible reviews; self-serving reviews are not eligible for stars.", "Keep it only if it matches real reviews shown on the page.");
      }
      for (const n of nodes) {
        if ([].concat(n["@type"] || []).includes("FAQPage")) {
          const missing = (n.mainEntity || []).map((q) => String(q.name || "")).filter((q) => q && !i.visibleText.includes(q.slice(0, 60)));
          if (missing.length) add(u, "FAQ_SCHEMA_NOT_VISIBLE", "high", "structured_data", `${missing.length} FAQ question(s) in structured data are not visible on the page.`, { questions: missing.slice(0, 5) }, "Structured data must match visible content.", "Show the questions on the page or remove them from the markup.");
        }
        const t = [].concat(n["@type"] || []);
        if (t.includes("Organization") || t.includes("LocalBusiness") || t.includes("ProfessionalService")) orgFacts.push({ url: u, name: n.name, telephone: n.telephone, postalCode: n.address && n.address.postalCode });
      }
      if (types.filter((t) => t === "BreadcrumbList").length > 1) add(u, "JSONLD_DUPLICATE_BREADCRUMB", "low", "structured_data", "More than one BreadcrumbList.", { types }, "Duplicate markup can conflict.", "Keep one breadcrumb trail per page.");
      page.summary = { title, description: desc, canonical: canon || null, robots: i.robots, h1: i.h1, words: i.wordCount, types, noindex, internalLinks: i.anchors.filter((a) => a.url && new URL(a.url).host === host).map((a) => ({ url: normalizeUrl(a.url, siteUrl), text: a.text })), phoneOnPage: (i.visibleText.replace(/\D/g, "").includes(String(site.contact.telephone).replace(/\D/g, "").slice(-10))) };
    }

    for (const [title, urls] of Object.entries(titleSeen)) if (urls.length > 1) for (const u of urls) add(u, "TITLE_DUPLICATE", "medium", "metadata", `Same title as ${urls.length - 1} other page(s).`, { title, pages: urls }, "Duplicate titles make pages compete and confuse searchers.", "Give each page a unique title.", "draft", draftTarget(u, "seoTitle"));
    for (const [desc, urls] of Object.entries(descSeen)) if (urls.length > 1) for (const u of urls) add(u, "DESCRIPTION_DUPLICATE", "low", "metadata", `Same meta description as ${urls.length - 1} other page(s).`, { description: desc, pages: urls }, "Unique descriptions help each page stand out.", "Write a description specific to this page.", "draft", draftTarget(u, "metaDescription"));

    const okPages = new Set(pages.filter((p) => p.status === 200).map((p) => p.url));
    for (const p of pages) {
      if (p.status >= 400 || p.status === 0) {
        for (const ref of (inlinks[p.url] || []).slice(0, 20)) add(ref.from, "BROKEN_INTERNAL_LINK", "high", "links", `Links to a broken page (${p.status || "error"}).`, { target: p.url, anchor: ref.text }, "Broken links frustrate visitors and waste crawl budget.", "Update or remove the link.");
      } else if (p.chain && p.chain.length) {
        for (const ref of (inlinks[p.url] || []).slice(0, 5)) add(ref.from, "LINK_TO_REDIRECT", "low", "links", "Links to a URL that redirects.", { target: p.url, finalUrl: p.finalUrl, anchor: ref.text }, "Linking to the final URL avoids an extra hop.", "Point the link at the final URL.");
      }
    }
    for (const u of inSitemap) {
      if (!okPages.has(u)) continue;
      const count = (inlinks[u] || []).filter((l) => l.from !== u).length;
      if (count === 0) add(u, "ORPHAN_PAGE", "medium", "links", "No internal links point to this page.", { inlinks: 0 }, "Orphan pages are hard for visitors and crawlers to find.", "Link to it from a related page.");
    }

    const externalList = [...externals].slice(0, MAX_EXTERNAL);
    const extResults = await pool(externalList, 4, async (url) => {
      try {
        if (!isPublicHttpUrl(url)) throw new Error("Not a public web address");
        let res = await axios.head(url, publicRequestOptions({ timeout: 12000, maxRedirects: 5, headers: { "User-Agent": UA }, validateStatus: () => true }));
        if (res.status === 405 || res.status === 403) res = await axios.get(url, publicRequestOptions({ timeout: 12000, maxRedirects: 5, headers: { "User-Agent": UA }, validateStatus: () => true, responseType: "text" }));
        return { url, status: res.status };
      } catch (err) {
        return { url, status: 0, error: err.code || err.message };
      }
    });
    for (const r of extResults) {
      if (r.status === 404 || r.status === 410 || (r.status === 0 && /ENOTFOUND|ECONNREFUSED/.test(String(r.error)))) {
        const from = pages.filter((p) => p.info && p.info.anchors.some((a) => a.url && a.url.split("#")[0] === r.url)).map((p) => p.url).slice(0, 5);
        add(from[0] || r.url, "BROKEN_EXTERNAL_LINK", "low", "links", `External link is broken (${r.status || r.error}).`, { target: r.url, pages: from }, "Dead outbound links hurt trust.", "Update or remove the link.");
      }
    }

    const phones = new Set(orgFacts.map((o) => String(o.telephone || "").replace(/\D/g, "")).filter(Boolean));
    if (phones.size > 1) add(siteUrl, "NAP_PHONE_INCONSISTENT", "medium", "local", "Structured data uses different phone numbers.", { facts: orgFacts.slice(0, 10) }, "Consistent name, address and phone help Google trust the business details.", "Use one phone number everywhere.");
    const contactPage = pages.find((p) => /\/contact$/.test(p.url));
    if (contactPage && contactPage.summary && !contactPage.summary.phoneOnPage) add(contactPage.url, "NAP_PHONE_MISSING", "medium", "local", "The business phone number is not visible on the contact page.", { expected: site.contact.telephone }, "Visitors and Google look for contact details on the contact page.", "Show the phone number on the contact page.");

    issues.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
    for (let k = 0; k < issues.length; k += 200) {
      const chunk = issues.slice(k, k + 200);
      await query(
        "INSERT INTO seo_audit_issues (run_id, url, code, severity, category, message, evidence, why, fix, auto_fix, target) VALUES ?",
        [chunk.map((x) => [runId, String(x.url).slice(0, 500), x.code, x.severity, x.category, String(x.message).slice(0, 500), JSON.stringify(x.evidence || {}), x.why ? String(x.why).slice(0, 500) : null, x.fix ? String(x.fix).slice(0, 500) : null, x.target ? "draft" : x.autoFix === "draft" ? "manual" : x.autoFix, x.target ? JSON.stringify(x.target) : null])]
      );
    }
    for (let k = 0; k < pages.length; k += 100) {
      const chunk = pages.slice(k, k + 100);
      await query("INSERT INTO seo_audit_pages (run_id, url, status, data) VALUES ?", [
        chunk.map((p) => [runId, String(p.url).slice(0, 500), p.status || 0, JSON.stringify({ finalUrl: p.finalUrl, chain: p.chain, ms: p.ms, inSitemap: inSitemap.has(p.url), inlinks: (inlinks[p.url] || []).length, ...(p.summary || {}) })]),
      ]);
    }
    const counts = issues.reduce((acc, x) => ({ ...acc, [x.severity]: (acc[x.severity] || 0) + 1 }), {});
    return { pages: pages.length, sitemapUrls: inSitemap.size, externalChecked: externalList.length, issues: issues.length, bySeverity: counts };
  };

  let running = null;
  const startAudit = async (trigger) => {
    if (running) return running;
    const r = await query("INSERT INTO seo_audit_runs (status, trigger_by, startedAt) VALUES ('running', ?, ?)", [trigger, Date.now()]);
    const runId = r.insertId;
    running = runId;
    runAudit(runId)
      .then((summary) => query("UPDATE seo_audit_runs SET status = 'done', finishedAt = ?, pages = ?, summary = ? WHERE id = ?", [Date.now(), summary.pages, JSON.stringify(summary), runId]))
      .catch((err) => {
        console.error("SEO audit failed:", err);
        return query("UPDATE seo_audit_runs SET status = 'failed', finishedAt = ?, summary = ? WHERE id = ?", [Date.now(), JSON.stringify({ error: err.message }), runId]);
      })
      .finally(() => {
        running = null;
      });
    return runId;
  };

  router.post("/api/admin/seo/audit/run", verifyToken, async (req, res) => {
    try {
      const runId = await startAudit(adminOf(req));
      res.json({ success: true, runId });
    } catch (err) {
      fail(res, 500, "Failed to start the audit");
    }
  });

  router.get("/api/admin/seo/audit/runs", verifyToken, async (req, res) => {
    try {
      const rows = await query("SELECT id, status, trigger_by, startedAt, finishedAt, pages, summary FROM seo_audit_runs ORDER BY id DESC LIMIT 20");
      res.json(rows.map((r) => ({ ...r, summary: parse(r.summary, {}) })));
    } catch (err) {
      fail(res, 500, "Failed to load audits");
    }
  });

  router.get("/api/admin/seo/audit/latest", verifyToken, async (req, res) => {
    try {
      const run = (await query("SELECT * FROM seo_audit_runs WHERE status = 'done' ORDER BY id DESC LIMIT 1"))[0];
      const active = (await query("SELECT id, startedAt FROM seo_audit_runs WHERE status = 'running' ORDER BY id DESC LIMIT 1"))[0] || null;
      if (!run) return res.json({ success: true, run: null, running: active, issues: [], pages: [] });
      const issues = await query("SELECT * FROM seo_audit_issues WHERE run_id = ? ORDER BY FIELD(severity, 'critical', 'high', 'medium', 'low', 'info'), url LIMIT 2000", [run.id]);
      const pages = await query("SELECT url, status, data FROM seo_audit_pages WHERE run_id = ? ORDER BY url", [run.id]);
      res.json({
        success: true,
        running: active,
        run: { ...run, summary: parse(run.summary, {}) },
        issues: issues.map((x) => ({ ...x, evidence: parse(x.evidence, {}), target: parse(x.target, null) })),
        pages: pages.map((p) => ({ url: p.url, status: p.status, ...parse(p.data, {}) })),
      });
    } catch (err) {
      fail(res, 500, "Failed to load the audit");
    }
  });

  // ---------- PageSpeed Insights ----------
  const psi = async (url, strategy) => {
    const params = new URLSearchParams({ url, strategy, category: "performance" });
    if (process.env.PSI_API_KEY) params.set("key", process.env.PSI_API_KEY);
    const { data } = await axios.get(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`, { timeout: 120000 });
    const lr = data.lighthouseResult || {};
    const audit = (id) => (lr.audits || {})[id] || {};
    const lab = {
      lcpMs: audit("largest-contentful-paint").numericValue ?? null,
      cls: audit("cumulative-layout-shift").numericValue ?? null,
      tbtMs: audit("total-blocking-time").numericValue ?? null,
      fcpMs: audit("first-contentful-paint").numericValue ?? null,
      speedIndexMs: audit("speed-index").numericValue ?? null,
      jsBootupMs: audit("bootup-time").numericValue ?? null,
    };
    const fieldFrom = (exp) => {
      if (!exp || !exp.metrics) return null;
      const m = exp.metrics;
      const pick = (k, scale = 1) => (m[k] ? { p75: m[k].percentile / scale, category: m[k].category } : null);
      return { overall: exp.overall_category || null, lcp: pick("LARGEST_CONTENTFUL_PAINT_MS"), inp: pick("INTERACTION_TO_NEXT_PAINT"), cls: pick("CUMULATIVE_LAYOUT_SHIFT_SCORE", 100), originFallback: Boolean(exp.origin_fallback) };
    };
    const opportunities = Object.values(lr.audits || {})
      .filter((a) => a.details && a.details.type === "opportunity" && (a.details.overallSavingsMs || 0) > 100)
      .sort((a, b) => (b.details.overallSavingsMs || 0) - (a.details.overallSavingsMs || 0))
      .slice(0, 8)
      .map((a) => ({ id: a.id, title: a.title, savingsMs: Math.round(a.details.overallSavingsMs || 0) }));
    const thirdParty = ((audit("third-party-summary").details || {}).items || []).slice(0, 8).map((x) => ({ entity: typeof x.entity === "object" ? x.entity.text : x.entity, blockingMs: Math.round(x.blockingTime || 0), kb: Math.round((x.transferSize || 0) / 1024) }));
    return {
      score: lr.categories && lr.categories.performance ? Math.round(lr.categories.performance.score * 100) : null,
      lab,
      field: { url: fieldFrom(data.loadingExperience), origin: fieldFrom(data.originLoadingExperience) },
      opportunities: { items: opportunities, thirdParty },
    };
  };

  router.post("/api/admin/seo/performance/run", verifyToken, async (req, res) => {
    try {
      const strategy = (req.body && req.body.strategy) === "desktop" ? "desktop" : "mobile";
      const url = String((req.body && req.body.url) || `${siteUrl}/`);
      if (new URL(url).host !== host) return fail(res, 400, "Test a page on this website.");
      let result;
      try {
        result = await psi(url, strategy);
      } catch (err) {
        const message = err.response && err.response.data && err.response.data.error ? err.response.data.error.message : err.message;
        await query("INSERT INTO seo_psi_runs (url, strategy, fetchedAt, error) VALUES (?, ?, ?, ?)", [url, strategy, Date.now(), String(message).slice(0, 500)]);
        return fail(res, 502, `PageSpeed Insights failed: ${message}`);
      }
      await query("INSERT INTO seo_psi_runs (url, strategy, fetchedAt, score, lab, field, opportunities) VALUES (?, ?, ?, ?, ?, ?, ?)", [url, strategy, Date.now(), result.score, JSON.stringify(result.lab), JSON.stringify(result.field), JSON.stringify(result.opportunities)]);
      res.json({ success: true, url, strategy, ...result });
    } catch (err) {
      fail(res, 500, "Failed to run PageSpeed Insights");
    }
  });

  router.get("/api/admin/seo/performance", verifyToken, async (req, res) => {
    try {
      const rows = await query("SELECT * FROM seo_psi_runs ORDER BY id DESC LIMIT 200");
      res.json(rows.map((r) => ({ ...r, lab: parse(r.lab, null), field: parse(r.field, null), opportunities: parse(r.opportunities, null) })));
    } catch (err) {
      fail(res, 500, "Failed to load performance history");
    }
  });

  return { router, startAudit, latestRun: () => query("SELECT * FROM seo_audit_runs WHERE status = 'done' ORDER BY id DESC LIMIT 1").then((r) => r[0] || null) };
};

module.exports.normalizeUrl = normalizeUrl;
