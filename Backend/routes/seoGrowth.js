// =========================================================================
// ============== INTERNAL LINKS, CONTENT PLANNER, BACKLINKS ===============
// ===================== LOCAL SEO & TRUST CHECKLISTS ======================
// Recommendations here are rule-based and always carry their evidence. They
// never publish anything: an approved internal link is added to the source
// page's SEO draft; content ideas and backlinks are records for the team.
// =========================================================================

const express = require("express");
const axios = require("axios");
const { inspectHtml } = require("../services/htmlInspect");
const { isPublicHttpUrl, publicRequestOptions } = require("../services/safeFetch");

const SERVICE_FOR_CATEGORY = {
  "digital-marketing": "/digital_marketing",
  "web-development": "/web_development",
  production: "/production_house",
  podcast: "/podcast_studio",
};
const BLOG_SERVICE_RULES = [
  [/seo|search|marketing|social|ads|content|audience|brand|digital/i, "/digital_marketing"],
  [/web|website|ecommerce|shopify|wordpress|next|react/i, "/web_development"],
  [/video|production|photo|film/i, "/production_house"],
  [/podcast/i, "/podcast_studio"],
];
const STOP = new Set("a an and the of in for to with on at by from or is are your our we you how what why does do much can best top".split(" "));
const QUESTION = /^(how|what|why|which|when|where|who|is|are|can|do|does|should)\b|\?$/i;
const COMMERCIAL = /\b(agency|company|services?|cost|price|pricing|near me|hire|rental|book|quote|packages?)\b/i;

const TABLES = [
  `CREATE TABLE IF NOT EXISTS seo_content_ideas (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(200) NOT NULL,
    kind         VARCHAR(30)  NOT NULL,
    audience     VARCHAR(200) NULL,
    intent       VARCHAR(20)  NULL,
    target_page  VARCHAR(500) NULL,
    evidence     JSON         NULL,
    outline      JSON         NULL,
    related      JSON         NULL,
    priority     VARCHAR(10)  NOT NULL DEFAULT 'medium',
    rationale    VARCHAR(500) NULL,
    source       VARCHAR(20)  NOT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'idea',
    createdBy    VARCHAR(190) NULL,
    createdAt    BIGINT       NOT NULL,
    updatedAt    BIGINT       NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS seo_backlinks (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    domain        VARCHAR(200) NOT NULL,
    source_url    VARCHAR(500) NOT NULL,
    target_url    VARCHAR(500) NOT NULL,
    relationship  VARCHAR(60)  NULL,
    contact       VARCHAR(200) NULL,
    outreach      VARCHAR(20)  NOT NULL DEFAULT 'none',
    follow_up     DATE         NULL,
    link_status   VARCHAR(20)  NOT NULL DEFAULT 'unverified',
    rel           VARCHAR(60)  NULL,
    last_verified BIGINT       NULL,
    source        VARCHAR(20)  NOT NULL DEFAULT 'manual',
    notes         TEXT         NULL,
    createdAt     BIGINT       NOT NULL,
    updatedAt     BIGINT       NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS seo_checklist (
    item_key  VARCHAR(80)  NOT NULL PRIMARY KEY,
    status    VARCHAR(10)  NOT NULL,
    note      VARCHAR(1000) NULL,
    admin     VARCHAR(190) NULL,
    updatedAt BIGINT       NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

const clean = (v, max) => String(v === null || v === undefined ? "" : v).replace(/[\u0000-\u001F]/g, " ").trim().slice(0, max);
const words = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ").filter((w) => w && !STOP.has(w));
const jaccard = (a, b) => {
  const A = new Set(words(a));
  const B = new Set(words(b));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
};

module.exports = function seoGrowthRoutes({ db, verifyToken, siteUrl, site, ai }) {
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
  const tableExists = async (name) => (await query("SHOW TABLES LIKE ?", [name])).length > 0;

  (async () => {
    try {
      for (const sql of TABLES) await query(sql);
    } catch (err) {
      console.log("❌ SEO GROWTH TABLES ERROR:", err.message);
    }
  })();

  const latestAuditPages = async () => {
    if (!(await tableExists("seo_audit_runs"))) return { run: null, pages: [] };
    const run = (await query("SELECT * FROM seo_audit_runs WHERE status = 'done' ORDER BY id DESC LIMIT 1"))[0];
    if (!run) return { run: null, pages: [] };
    const rows = await query("SELECT url, status, data FROM seo_audit_pages WHERE run_id = ?", [run.id]);
    return { run, pages: rows.map((r) => ({ url: r.url, status: r.status, ...parse(r.data, {}) })) };
  };

  const publishedCaseStudies = async () => {
    if (!(await tableExists("case_studies"))) return [];
    const rows = await query("SELECT slug, title, client_name, category, related_services FROM case_studies WHERE status = 'published'");
    return rows.map((r) => {
      const services = parse(r.related_services, []);
      return { url: `${siteUrl}/case-studies/${r.slug}`, title: r.title, client: r.client_name, services: services.length ? services : [SERVICE_FOR_CATEGORY[r.category]].filter(Boolean) };
    });
  };

  const publishedBlogs = async () =>
    (await query("SELECT * FROM blogs WHERE status = 'published'").catch(() => [])).map((b) => ({
      id: b.id,
      title: b.title,
      category: b.category,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      last_modified_at: b.last_modified_at,
      url: `${siteUrl}/blog/${String(b.permalink || "").replace(/^\/+|\/+$/g, "").replace(/^blog\//, "")}`,
    }));

  const anchorFor = (title) => String(title || "").split(/\s[|–-]\s/)[0].trim().slice(0, 90);

  // ---------- internal link recommendations ----------
  router.get("/api/admin/seo/links/recommendations", verifyToken, async (req, res) => {
    try {
      const { run, pages } = await latestAuditPages();
      if (!run) return res.json({ success: true, auditAvailable: false, items: [] });
      const byUrl = Object.fromEntries(pages.map((p) => [p.url, p]));
      const linksFrom = (u) => new Set(((byUrl[u] || {}).internalLinks || []).map((l) => l.url));
      const managed = Object.fromEntries((await query("SELECT id, path FROM seo_pages")).map((p) => [p.path, p.id]));
      const anchorsTo = {};
      for (const p of pages) for (const l of p.internalLinks || []) (anchorsTo[l.url] = anchorsTo[l.url] || []).push(l.text);
      const items = [];
      const recommend = (source, target, reason, priority, evidence) => {
        const targetPage = byUrl[target];
        if (!targetPage || targetPage.status !== 200 || targetPage.noindex) return;
        if (linksFrom(source).has(target)) return;
        const anchor = anchorFor(targetPage.h1 && targetPage.h1[0] ? targetPage.h1[0] : targetPage.title);
        const existing = (anchorsTo[target] || []).filter((t) => t.toLowerCase() === anchor.toLowerCase()).length;
        const path = new URL(source).pathname.replace(/\/+$/, "") || "/";
        items.push({
          source,
          target,
          anchor,
          anchorNote: existing >= 3 ? `“${anchor}” is already used ${existing} times for this page; consider varied wording.` : null,
          reason,
          priority,
          evidence,
          apply: managed[path] ? { pageId: managed[path], mode: "draft" } : { mode: "manual", where: path.startsWith("/blog/") ? "Edit the article in the blog editor." : "This page's content is in code." },
        });
      };

      for (const cs of await publishedCaseStudies()) {
        for (const service of cs.services) {
          recommend(`${siteUrl}${service}`, cs.url, `“${cs.title}” is a published case study for this service.`, "high", { caseStudy: cs.title });
        }
      }
      for (const b of await publishedBlogs()) {
        const rule = BLOG_SERVICE_RULES.find(([re]) => re.test(`${b.category} ${b.title}`));
        if (rule) recommend(b.url, `${siteUrl}${rule[1]}`, `The article's topic (${b.category || "uncategorised"}) relates to this service.`, "medium", { blog: b.title, category: b.category });
      }
      for (const p of pages) {
        if (p.status !== 200 || p.noindex || !p.inSitemap) continue;
        if ((p.inlinks || 0) < 2) {
          const path = new URL(p.url).pathname;
          const hub = path.startsWith("/blog/") ? `${siteUrl}/blogs` : path.startsWith("/case-studies/") ? `${siteUrl}/case-studies` : `${siteUrl}/services`;
          if (hub !== p.url) recommend(hub, p.url, `Only ${p.inlinks || 0} internal link(s) point to this page.`, (p.inlinks || 0) === 0 ? "high" : "low", { inlinks: p.inlinks || 0 });
        }
      }
      for (const service of Object.values(SERVICE_FOR_CATEGORY)) recommend(`${siteUrl}${service}`, `${siteUrl}/contact`, "Service pages should offer a clear enquiry path.", "medium", {});
      const rank = { high: 0, medium: 1, low: 2 };
      items.sort((a, b) => rank[a.priority] - rank[b.priority]);
      res.json({ success: true, auditAvailable: true, auditRun: run.id, auditFinishedAt: run.finishedAt, items: items.slice(0, 200) });
    } catch (err) {
      console.error("Link recommendations failed:", err);
      fail(res, 500, "Failed to compute link recommendations");
    }
  });

  router.post("/api/admin/seo/links/apply", verifyToken, async (req, res) => {
    try {
      const pageId = Number(req.body && req.body.pageId);
      const target = clean(req.body && req.body.target, 500);
      const anchor = clean(req.body && req.body.anchor, 100);
      if (!anchor) return fail(res, 400, "Link text is required.");
      let path;
      try {
        const u = new URL(target);
        if (u.host !== host) return fail(res, 400, "Only links to this website can be added.");
        path = u.pathname.replace(/\/+$/, "") || "/";
      } catch (_) {
        return fail(res, 400, "Invalid target URL.");
      }
      if (/^\/case-studies\/./.test(path)) {
        const slug = path.split("/")[2];
        const cs = (await query("SELECT status FROM case_studies WHERE slug = ?", [slug]).catch(() => []))[0];
        if (!cs || cs.status !== "published") return fail(res, 400, "That case study is not published.");
      }
      const page = (await query("SELECT * FROM seo_pages WHERE id = ?", [pageId]))[0];
      if (!page) return fail(res, 404, "Page not found");
      const draft = (await query("SELECT * FROM seo_page_configs WHERE page_id = ? AND status = 'draft' ORDER BY id DESC LIMIT 1", [pageId]))[0];
      const base = draft || (await query("SELECT * FROM seo_page_configs WHERE page_id = ? AND status = 'published' ORDER BY id DESC LIMIT 1", [pageId]))[0];
      const payload = base ? parse(base.payload, {}) : {};
      const links = Array.isArray(payload.internalLinks) ? payload.internalLinks : [];
      if (links.some((l) => l.href === path)) return res.json({ success: true, message: "Already in the draft." });
      if (links.length >= 8) return fail(res, 400, "The page already has 8 related links in its draft. Remove one first.");
      const next = { ...payload, internalLinks: [...links, { label: anchor, href: path }] };
      if (draft) await query("UPDATE seo_page_configs SET payload = ?, created_by = ?, createdAt = ? WHERE id = ?", [JSON.stringify(next), adminOf(req), Date.now(), draft.id]);
      else await query("INSERT INTO seo_page_configs (page_id, status, payload, created_by, createdAt) VALUES (?, 'draft', ?, ?, ?)", [pageId, JSON.stringify(next), adminOf(req), Date.now()]);
      await query("INSERT INTO seo_audit_log (admin, action, page_id, field, old_value, new_value, createdAt) VALUES (?, 'link.add', ?, 'internalLinks', ?, ?, ?)", [adminOf(req), pageId, JSON.stringify(links), JSON.stringify(next.internalLinks), Date.now()]);
      res.json({ success: true, message: "Added to the page's draft. Review and publish it from the page editor." });
    } catch (err) {
      console.error("Link apply failed:", err);
      fail(res, 500, "Failed to add the link");
    }
  });

  // ---------- content planner ----------
  router.get("/api/admin/seo/content/suggestions", verifyToken, async (req, res) => {
    try {
      const suggestions = [];
      const blogs = await publishedBlogs();
      const hasGsc = await tableExists("seo_gsc_rows");
      if (hasGsc) {
        const since = new Date(Date.now() - 93 * 864e5).toISOString().slice(0, 10);
        const rows = await query(
          `SELECT query, page, SUM(clicks) AS clicks, SUM(impressions) AS impressions, SUM(position * impressions) / NULLIF(SUM(impressions), 0) AS position
           FROM seo_gsc_rows WHERE date >= ? GROUP BY query, page HAVING SUM(impressions) >= 10 ORDER BY SUM(impressions) DESC LIMIT 2000`,
          [since]
        );
        const best = {};
        for (const r of rows) if (!best[r.query] || Number(r.position) < Number(best[r.query].position)) best[r.query] = r;
        for (const r of Object.values(best)) {
          const q = String(r.query);
          const ev = { query: q, page: r.page, impressions: Number(r.impressions), clicks: Number(r.clicks), position: Math.round(Number(r.position) * 10) / 10, period: "last 90 days" };
          const service = (BLOG_SERVICE_RULES.find(([re]) => re.test(q)) || [])[1] || null;
          if (QUESTION.test(q) && Number(r.position) > 8) {
            suggestions.push({ title: q.charAt(0).toUpperCase() + q.slice(1), kind: "blog", intent: "INFORMATIONAL", audience: "People researching before they buy", target_page: "new article", evidence: [ev], outline: ["Short, direct answer", "Details and examples from your own work", "Common mistakes", `Link to ${service || "the related service page"}`], related: service ? [service] : [], priority: Number(r.impressions) >= 100 ? "high" : "medium", rationale: "People search this question and no page answers it well yet.", source: "gsc" });
          } else if (COMMERCIAL.test(q) && /\/blog\//.test(String(r.page))) {
            suggestions.push({ title: `Improve the service page for “${q}”`, kind: "service_page", intent: "COMMERCIAL", audience: "People ready to hire", target_page: service ? `${siteUrl}${service}` : null, evidence: [ev], outline: ["Make the service page answer this search directly", "Link the article to the service page"], related: [], priority: "medium", rationale: "A commercial search currently lands on a blog post, not a service page.", source: "gsc" });
          }
        }
      }
      const yearAgo = Date.now() - 365 * 864e5;
      for (const b of blogs) {
        const changed = Number(b.updatedAt || 0) || Date.parse(b.last_modified_at || "") || Number(b.createdAt || 0);
        if (changed && changed < yearAgo) suggestions.push({ title: `Refresh “${b.title}”`, kind: "refresh", intent: "INFORMATIONAL", audience: "Existing readers", target_page: b.url, evidence: [{ lastUpdated: new Date(changed).toISOString().slice(0, 10) }], outline: ["Check facts and examples", "Update screenshots and links", "Add what you have learned since"], related: [], priority: "low", rationale: "Not updated for over a year.", source: "rule" });
      }
      for (let i = 0; i < blogs.length; i++) {
        for (let j = i + 1; j < blogs.length; j++) {
          const sim = jaccard(blogs[i].title, blogs[j].title);
          if (sim >= 0.5) suggestions.push({ title: `Overlap: “${blogs[i].title}” and “${blogs[j].title}”`, kind: "consolidate", intent: "INFORMATIONAL", audience: "", target_page: blogs[i].url, evidence: [{ similarity: Math.round(sim * 100) / 100, pages: [blogs[i].url, blogs[j].url] }], outline: ["Decide whether they target different intents", "If not, merge and redirect the weaker one"], related: [], priority: "medium", rationale: "Two articles may compete for the same search.", source: "rule" });
        }
      }
      if (await tableExists("case_studies")) {
        const covered = new Set((await publishedCaseStudies()).flatMap((c) => c.services));
        const projects = await query("SELECT id, title, category FROM projects WHERE status = 'published' ORDER BY displayOrder").catch(() => []);
        for (const service of Object.values(SERVICE_FOR_CATEGORY)) {
          if (covered.has(service)) continue;
          const candidates = projects.filter((p) => (service === "/web_development" && /web|commerce/i.test(p.category || "")) || (service === "/digital_marketing" && /marketing|seo|brand/i.test(p.category || "")) || (service === "/production_house" && /production|video/i.test(p.category || "")) || (service === "/podcast_studio" && /podcast/i.test(p.category || "")));
          suggestions.push({ title: `Case study for ${service}`, kind: "case_study", intent: "COMMERCIAL", audience: "Prospective clients comparing agencies", target_page: `${siteUrl}/case-studies`, evidence: [{ publishedCaseStudiesForService: 0, realProjectsInThisCategory: candidates.map((p) => p.title).slice(0, 5) }], outline: ["Client and challenge", "What you did", "What was delivered", "Verified results only"], related: [service], priority: candidates.length ? "high" : "low", rationale: candidates.length ? "You have real projects in this category but no published case study." : "No published case study and no matching project yet — do not invent one.", source: "rule" });
        }
      }
      const rank = { high: 0, medium: 1, low: 2 };
      suggestions.sort((a, b) => rank[a.priority] - rank[b.priority]);
      res.json({ success: true, searchConsole: hasGsc, aiAvailable: Boolean(ai && ai.configured()), suggestions: suggestions.slice(0, 100) });
    } catch (err) {
      console.error("Content suggestions failed:", err);
      fail(res, 500, "Failed to compute content suggestions");
    }
  });

  router.get("/api/admin/seo/content/ideas", verifyToken, async (req, res) => {
    try {
      const rows = await query("SELECT * FROM seo_content_ideas ORDER BY FIELD(status, 'approved', 'in_progress', 'idea', 'published', 'dismissed'), updatedAt DESC LIMIT 300");
      res.json(rows.map((r) => ({ ...r, evidence: parse(r.evidence, []), outline: parse(r.outline, []), related: parse(r.related, []) })));
    } catch (err) {
      fail(res, 500, "Failed to load ideas");
    }
  });

  router.post("/api/admin/seo/content/ideas", verifyToken, async (req, res) => {
    try {
      const b = req.body || {};
      const title = clean(b.title, 200);
      if (!title) return fail(res, 400, "Title is required.");
      const kind = ["blog", "service_page", "faq", "case_study", "refresh", "consolidate", "other"].includes(b.kind) ? b.kind : "other";
      const r = await query(
        "INSERT INTO seo_content_ideas (title, kind, audience, intent, target_page, evidence, outline, related, priority, rationale, source, status, createdBy, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'idea', ?, ?, ?)",
        [title, kind, clean(b.audience, 200), clean(b.intent, 20), clean(b.target_page, 500), JSON.stringify(Array.isArray(b.evidence) ? b.evidence.slice(0, 20) : []), JSON.stringify(Array.isArray(b.outline) ? b.outline.map((x) => clean(x, 200)).slice(0, 20) : []), JSON.stringify(Array.isArray(b.related) ? b.related.slice(0, 10) : []), ["high", "medium", "low"].includes(b.priority) ? b.priority : "medium", clean(b.rationale, 500), ["gsc", "rule", "admin", "ai"].includes(b.source) ? b.source : "admin", adminOf(req), Date.now(), Date.now()]
      );
      res.json({ success: true, id: r.insertId });
    } catch (err) {
      fail(res, 500, "Failed to save the idea");
    }
  });

  router.put("/api/admin/seo/content/ideas/:id", verifyToken, async (req, res) => {
    try {
      const status = String((req.body && req.body.status) || "");
      if (!["idea", "approved", "in_progress", "published", "dismissed"].includes(status)) return fail(res, 400, "Invalid status.");
      await query("UPDATE seo_content_ideas SET status = ?, updatedAt = ? WHERE id = ?", [status, Date.now(), req.params.id]);
      res.json({ success: true });
    } catch (err) {
      fail(res, 500, "Failed to update the idea");
    }
  });

  router.delete("/api/admin/seo/content/ideas/:id", verifyToken, async (req, res) => {
    try {
      await query("DELETE FROM seo_content_ideas WHERE id = ?", [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      fail(res, 500, "Failed to delete the idea");
    }
  });

  // ---------- backlinks ----------
  const backlinkFromBody = (b) => {
    const source = clean(b.source_url, 500);
    const target = clean(b.target_url, 500) || `${siteUrl}/`;
    let domain = "";
    if (!isPublicHttpUrl(source)) return { error: "The source must be a public http(s) web address." };
    try {
      domain = new URL(source).host.replace(/^www\./, "");
      if (new URL(target).host.replace(/^www\./, "") !== host.replace(/^www\./, "")) return { error: "The target must be a page on this website." };
    } catch (_) {
      return { error: "Source and target must be valid URLs." };
    }
    return {
      row: {
        domain,
        source_url: source,
        target_url: target,
        relationship: clean(b.relationship, 60) || null,
        contact: clean(b.contact, 200) || null,
        outreach: ["none", "planned", "contacted", "replied", "agreed", "declined"].includes(b.outreach) ? b.outreach : "none",
        follow_up: /^\d{4}-\d{2}-\d{2}$/.test(String(b.follow_up || "")) ? b.follow_up : null,
        notes: clean(b.notes, 1000) || null,
      },
    };
  };

  router.get("/api/admin/seo/backlinks", verifyToken, async (req, res) => {
    try {
      res.json(await query("SELECT * FROM seo_backlinks ORDER BY updatedAt DESC LIMIT 500"));
    } catch (err) {
      fail(res, 500, "Failed to load backlinks");
    }
  });

  router.post("/api/admin/seo/backlinks", verifyToken, async (req, res) => {
    const { row, error } = backlinkFromBody(req.body || {});
    if (error) return fail(res, 400, error);
    try {
      const r = await query("INSERT INTO seo_backlinks (domain, source_url, target_url, relationship, contact, outreach, follow_up, notes, source, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'manual', ?, ?)", [row.domain, row.source_url, row.target_url, row.relationship, row.contact, row.outreach, row.follow_up, row.notes, Date.now(), Date.now()]);
      res.json({ success: true, id: r.insertId });
    } catch (err) {
      fail(res, 500, "Failed to save the backlink");
    }
  });

  router.put("/api/admin/seo/backlinks/:id", verifyToken, async (req, res) => {
    const { row, error } = backlinkFromBody(req.body || {});
    if (error) return fail(res, 400, error);
    try {
      await query("UPDATE seo_backlinks SET domain = ?, source_url = ?, target_url = ?, relationship = ?, contact = ?, outreach = ?, follow_up = ?, notes = ?, updatedAt = ? WHERE id = ?", [row.domain, row.source_url, row.target_url, row.relationship, row.contact, row.outreach, row.follow_up, row.notes, Date.now(), req.params.id]);
      res.json({ success: true });
    } catch (err) {
      fail(res, 500, "Failed to update the backlink");
    }
  });

  router.delete("/api/admin/seo/backlinks/:id", verifyToken, async (req, res) => {
    try {
      await query("DELETE FROM seo_backlinks WHERE id = ?", [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      fail(res, 500, "Failed to delete the backlink");
    }
  });

  router.post("/api/admin/seo/backlinks/:id/verify", verifyToken, async (req, res) => {
    try {
      const row = (await query("SELECT * FROM seo_backlinks WHERE id = ?", [req.params.id]))[0];
      if (!row) return fail(res, 404, "Backlink not found");
      let status = "unreachable";
      let rel = null;
      try {
        if (!isPublicHttpUrl(row.source_url)) throw new Error("not public");
        const r = await axios.get(row.source_url, publicRequestOptions({ timeout: 20000, maxRedirects: 5, responseType: "text", headers: { "User-Agent": "GenieMediaLinkCheck/1.0" }, validateStatus: () => true }));
        if (r.status === 200) {
          const info = inspectHtml(String(r.data || ""), row.source_url);
          const norm = (u) => String(u || "").replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "");
          const hit = info.anchors.find((a) => a.url && norm(a.url) === norm(row.target_url)) || info.anchors.find((a) => a.url && norm(a.url).startsWith(norm(`${siteUrl}`)));
          if (hit) {
            rel = hit.rel || "";
            status = /nofollow|sponsored|ugc/i.test(rel) ? "found_nofollow" : "found";
          } else status = "missing";
        } else status = `http_${r.status}`;
      } catch (_) {
        status = "unreachable";
      }
      await query("UPDATE seo_backlinks SET link_status = ?, rel = ?, last_verified = ?, updatedAt = ? WHERE id = ?", [status, rel, Date.now(), Date.now(), row.id]);
      res.json({ success: true, link_status: status, rel });
    } catch (err) {
      fail(res, 500, "Failed to verify the backlink");
    }
  });

  // ---------- checklists + local signals ----------
  router.get("/api/admin/seo/checklist", verifyToken, async (req, res) => {
    try {
      res.json(await query("SELECT * FROM seo_checklist"));
    } catch (err) {
      fail(res, 500, "Failed to load the checklist");
    }
  });

  router.put("/api/admin/seo/checklist/:key", verifyToken, async (req, res) => {
    const key = clean(req.params.key, 80);
    const status = String((req.body && req.body.status) || "");
    if (!/^[a-z0-9_.-]+$/.test(key) || !["todo", "done", "na"].includes(status)) return fail(res, 400, "Invalid checklist update.");
    try {
      await query("INSERT INTO seo_checklist (item_key, status, note, admin, updatedAt) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status), note = VALUES(note), admin = VALUES(admin), updatedAt = VALUES(updatedAt)", [key, status, clean(req.body && req.body.note, 1000) || null, adminOf(req), Date.now()]);
      res.json({ success: true });
    } catch (err) {
      fail(res, 500, "Failed to save");
    }
  });

  router.get("/api/admin/seo/local/signals", verifyToken, async (req, res) => {
    try {
      const { run, pages } = await latestAuditPages();
      const find = (re) => pages.find((p) => re.test(new URL(p.url).pathname));
      const ok = (p) => Boolean(p && p.status === 200);
      const contact = find(/^\/contact$/);
      const caseStudies = await publishedCaseStudies();
      const reviews = find(/^\/reviews$/);
      const signals = [
        { key: "website_live", label: "Website pages respond normally", ok: run ? pages.filter((p) => p.inSitemap).every((p) => p.status === 200) : null, evidence: run ? `${pages.filter((p) => p.inSitemap && p.status === 200).length} of ${pages.filter((p) => p.inSitemap).length} sitemap pages return 200` : "Run a technical audit first" },
        { key: "contact_phone", label: "Phone number visible on the contact page", ok: contact ? Boolean(contact.phoneOnPage) : null, evidence: `Expected ${site.contact.telephone}` },
        { key: "privacy_terms", label: "Privacy policy and terms pages exist", ok: run ? ok(find(/^\/privacy-policy$/)) && ok(find(/^\/terms-and-conditions$/)) : null, evidence: "" },
        { key: "reviews_page", label: "Reviews page exists", ok: run ? ok(reviews) : null, evidence: "" },
        { key: "case_studies", label: "At least one published case study", ok: caseStudies.length > 0, evidence: `${caseStudies.length} published` },
        { key: "about_page", label: "About page has real company information", ok: run ? Boolean(find(/^\/about$/) && find(/^\/about$/).words >= 300) : null, evidence: run && find(/^\/about$/) ? `${find(/^\/about$/).words} words` : "" },
      ];
      res.json({
        success: true,
        auditRun: run ? { id: run.id, finishedAt: run.finishedAt } : null,
        business: { name: site.name, telephone: site.contact.telephone, email: site.contact.email, address: site.address, website: siteUrl },
        signals,
      });
    } catch (err) {
      console.error("Local signals failed:", err);
      fail(res, 500, "Failed to compute local signals");
    }
  });

  return router;
};
