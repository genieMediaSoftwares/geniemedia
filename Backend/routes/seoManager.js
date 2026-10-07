// =========================================================================
// ========================== SEO KEYWORD MANAGER ==========================
// Admin-managed keywords and per-page SEO configuration for the service
// pages. This is a content-planning tool: keywords never render on the site.
// Only an admin-approved, published configuration (title, description, H1,
// visible sections and internal links) reaches the public pages, and only
// through GET /api/seo/published, which never exposes keywords or notes.
//
// Configurations are versioned: one working draft per page, one published
// version, and the previous published versions kept as "superseded" so an
// unpublish can fall back to the last good one. With no published version
// the page keeps the metadata defined in the frontend code.
// =========================================================================

const express = require("express");

const KEYWORD_TYPES = ["PRIMARY", "SECONDARY", "RELATED", "LONG_TAIL", "LOCAL", "QUESTION", "SEMANTIC"];
const INTENTS = ["INFORMATIONAL", "COMMERCIAL", "TRANSACTIONAL", "NAVIGATIONAL", "LOCAL"];
const PRIORITIES = ["HIGH", "MEDIUM", "LOW"];
const KEYWORD_STATUSES = ["ACTIVE", "ARCHIVED"];
const PAGE_PATH_RE = /^\/[a-z0-9][a-z0-9_-]{0,80}$/;
const MAX_IMPORT_ROWS = 2000;

const DEFAULT_PAGES = [
  ["/digital_marketing", "Digital Marketing"],
  ["/web_development", "Website Development"],
  ["/production_house", "Production House"],
  ["/podcast_studio", "Podcast Studio"],
];

const TABLES = [
  `CREATE TABLE IF NOT EXISTS seo_pages (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    path      VARCHAR(100) NOT NULL,
    name      VARCHAR(120) NOT NULL,
    createdAt BIGINT       NULL,
    UNIQUE KEY uq_seo_pages_path (path)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS seo_keywords (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    page_id       INT          NOT NULL,
    keyword       VARCHAR(160) NOT NULL,
    keyword_norm  VARCHAR(160) NOT NULL,
    keyword_type  VARCHAR(20)  NOT NULL,
    search_intent VARCHAR(20)  NOT NULL,
    location      VARCHAR(120) NULL,
    priority      VARCHAR(10)  NOT NULL DEFAULT 'MEDIUM',
    status        VARCHAR(10)  NOT NULL DEFAULT 'ACTIVE',
    notes         VARCHAR(500) NULL,
    createdAt     BIGINT       NULL,
    updatedAt     BIGINT       NULL,
    UNIQUE KEY uq_seo_keywords_page_kw (page_id, keyword_norm),
    INDEX idx_seo_keywords_page (page_id),
    INDEX idx_seo_keywords_norm (keyword_norm),
    INDEX idx_seo_keywords_type (keyword_type),
    INDEX idx_seo_keywords_status (status),
    INDEX idx_seo_keywords_priority (priority)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS seo_page_configs (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    page_id     INT          NOT NULL,
    status      VARCHAR(20)  NOT NULL,
    payload     JSON         NOT NULL,
    created_by  VARCHAR(190) NULL,
    createdAt   BIGINT       NULL,
    publishedAt BIGINT       NULL,
    INDEX idx_seo_configs_page_status (page_id, status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS seo_locations (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(120) NOT NULL,
    aliases    JSON         NULL,
    region     VARCHAR(120) NULL,
    is_primary TINYINT(1)   NOT NULL DEFAULT 0,
    UNIQUE KEY uq_seo_locations_name (name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS seo_audit_log (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    admin      VARCHAR(190) NULL,
    action     VARCHAR(60)  NOT NULL,
    page_id    INT          NULL,
    field      VARCHAR(80)  NULL,
    old_value  TEXT         NULL,
    new_value  TEXT         NULL,
    createdAt  BIGINT       NOT NULL,
    INDEX idx_seo_audit_page (page_id),
    INDEX idx_seo_audit_created (createdAt)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

// ---------------------------------------------------------------- helpers --

const clean = (value, max) => {
  if (value === null || value === undefined) return "";
  const s = String(value).replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
  return max ? s.slice(0, max) : s;
};

const cleanBlock = (value, max) => {
  if (value === null || value === undefined) return "";
  const s = String(value).replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  return max ? s.slice(0, max) : s;
};

const normalizeKeyword = (value) => clean(value, 160).toLowerCase();

const enumValue = (value, allowed, fallback) => {
  const v = clean(value).toUpperCase().replace(/[\s-]+/g, "_");
  return allowed.includes(v) ? v : fallback;
};

const parseJson = (value, fallback) => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch (_) {
    return fallback;
  }
};

const list = (value, { maxItems = 30, maxLen = 120 } = {}) =>
  [...new Set((Array.isArray(value) ? value : []).map((v) => clean(v, maxLen)).filter(Boolean))].slice(0, maxItems);

const SUPERLATIVES = /\b(best|top|no\.?\s*1|number one|leading|cheapest|#1)\b/i;
const repeatedWord = (s) => /\b(\w+)\s+\1\b/i.test(s);

// Warnings shown to the admin for a keyword; they never block saving.
const keywordWarnings = (keyword) => {
  const w = [];
  if (SUPERLATIVES.test(keyword)) w.push("Contains a superlative (best/top/leading). Only use it on the page if you can back it up.");
  if (repeatedWord(keyword)) w.push("Repeats a word (e.g. “local local”). Probably a generated variant, not a real search.");
  if (keyword.split(" ").length > 9) w.push("Very long phrase. Consider the underlying topic instead.");
  return w;
};

// --------------------------------------------------------- config payload --

const emptyConfig = () => ({
  primaryTopic: "",
  secondaryTopics: [],
  targetLocations: [],
  seoTitle: "",
  metaDescription: "",
  preferredH1: "",
  sections: [],
  contentTopics: [],
  faqTopics: [],
  internalLinks: [],
  imageAltSuggestions: [],
  canonicalUrl: "",
  robotsIndex: true,
  robotsFollow: true,
});

const buildConfig = (body) => {
  const b = body && typeof body === "object" ? body : {};
  return {
    primaryTopic: clean(b.primaryTopic, 120),
    secondaryTopics: list(b.secondaryTopics, { maxItems: 20 }),
    targetLocations: list(b.targetLocations, { maxItems: 5, maxLen: 80 }),
    seoTitle: clean(b.seoTitle, 80),
    metaDescription: clean(b.metaDescription, 200),
    preferredH1: clean(b.preferredH1, 120),
    sections: (Array.isArray(b.sections) ? b.sections : [])
      .map((s) => ({ heading: clean(s && s.heading, 100), body: cleanBlock(s && s.body, 2000) }))
      .filter((s) => s.heading || s.body)
      .slice(0, 8),
    contentTopics: list(b.contentTopics, { maxItems: 30 }),
    faqTopics: list(b.faqTopics, { maxItems: 20, maxLen: 200 }),
    internalLinks: (Array.isArray(b.internalLinks) ? b.internalLinks : [])
      .map((l) => ({ label: clean(l && l.label, 100), href: clean(l && l.href, 200) }))
      .filter((l) => l.label || l.href)
      .slice(0, 8),
    imageAltSuggestions: (Array.isArray(b.imageAltSuggestions) ? b.imageAltSuggestions : [])
      .map((a) => ({ image: clean(a && a.image, 200), alt: clean(a && a.alt, 160) }))
      .filter((a) => a.image || a.alt)
      .slice(0, 20),
    canonicalUrl: clean(b.canonicalUrl, 300),
    robotsIndex: b.robotsIndex !== false,
    robotsFollow: b.robotsFollow !== false,
  };
};

const STOPWORDS = new Set("a an and the of in for to with on at by from or & | - your our we you is are".split(" "));

// Rules a configuration must pass before it can be published. They protect
// against keyword-stuffed metadata and against a page without valid metadata.
const publishProblems = (cfg, { siteHost, locationTerms }) => {
  const problems = [];
  const t = cfg.seoTitle;
  const d = cfg.metaDescription;
  if (t.length < 20 || t.length > 65) problems.push(`SEO title must be 20–65 characters (now ${t.length}).`);
  if (d.length < 70 || d.length > 170) problems.push(`Meta description must be 70–170 characters (now ${d.length}).`);
  if (cfg.preferredH1 && (cfg.preferredH1.length < 5 || cfg.preferredH1.length > 90)) problems.push("H1 must be 5–90 characters.");

  const counts = {};
  for (const w of t.toLowerCase().split(/[^a-z0-9]+/).filter((x) => x && !STOPWORDS.has(x))) counts[w] = (counts[w] || 0) + 1;
  const repeated = Object.entries(counts).filter(([, n]) => n > 2).map(([w]) => w);
  if (repeated.length) problems.push(`The title repeats “${repeated.join("”, “")}”. Write it for people, not as a keyword list.`);

  const countLocations = (text) => {
    const lower = ` ${text.toLowerCase()} `;
    return locationTerms.reduce((n, term) => n + (lower.split(term.toLowerCase()).length - 1), 0);
  };
  if (countLocations(t) > 1) problems.push("Mention the location at most once in the title.");
  if (countLocations(d) > 2) problems.push("Mention the location at most twice in the meta description.");
  if ((t.match(/[,|]/g) || []).length > 3) problems.push("The title looks like a list of keywords. Use a natural phrase.");

  cfg.sections.forEach((s, i) => {
    if (s.heading.length < 3) problems.push(`Section ${i + 1} needs a heading.`);
    if (s.body.length < 40) problems.push(`Section ${i + 1} (“${s.heading || "untitled"}”) needs at least 40 characters of real content.`);
  });
  cfg.internalLinks.forEach((l, i) => {
    if (!l.label) problems.push(`Internal link ${i + 1} needs link text.`);
    if (!/^\/(?!\/)[\w\-./#?=&%]*$/.test(l.href)) problems.push(`Internal link ${i + 1} must be a path on this site, starting with “/”.`);
  });
  if (cfg.canonicalUrl) {
    try {
      const u = new URL(cfg.canonicalUrl);
      if (u.protocol !== "https:" || u.host !== siteHost) problems.push(`The canonical URL must be an https://${siteHost} address.`);
    } catch (_) {
      problems.push("The canonical URL is not a valid URL.");
    }
  }
  return problems;
};

// ----------------------------------------------------------------- csv --

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const s = String(text || "").replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"' && s[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => String(v).trim()));
};

const csvCell = (v) => {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// ------------------------------------------------------------------ routes --

module.exports = function seoManagerRoutes({ db, verifyToken, siteUrl }) {
  const router = express.Router();
  const siteHost = (() => {
    try {
      return new URL(siteUrl).host;
    } catch (_) {
      return "geniemedia.in";
    }
  })();

  const query = (sql, params = []) =>
    new Promise((resolve, reject) => db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows))));

  (async () => {
    try {
      for (const sql of TABLES) await query(sql);
      const now = Date.now();
      for (const [path, name] of DEFAULT_PAGES) {
        await query("INSERT IGNORE INTO seo_pages (path, name, createdAt) VALUES (?, ?, ?)", [path, name, now]);
      }
      await query(
        "INSERT IGNORE INTO seo_locations (name, aliases, region, is_primary) VALUES (?, ?, ?, 1)",
        ["Visakhapatnam", JSON.stringify(["Vizag"]), "Andhra Pradesh"]
      );
      console.log("✅ SEO manager tables ready");
    } catch (err) {
      console.log("❌ SEO MANAGER TABLES ERROR:", err);
    }
  })();

  const fail = (res, status, message, extra = {}) => res.status(status).json({ success: false, message, ...extra });
  const adminOf = (req) => (req.user && (req.user.email || req.user.id)) || "unknown";

  const log = (req, action, pageId, field = null, oldValue = null, newValue = null) => {
    const text = (v) => (v === null || v === undefined ? null : (typeof v === "string" ? v : JSON.stringify(v)).slice(0, 4000));
    return query(
      "INSERT INTO seo_audit_log (admin, action, page_id, field, old_value, new_value, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [String(adminOf(req)).slice(0, 190), action, pageId, field, text(oldValue), text(newValue), Date.now()]
    ).catch((err) => console.error("SEO audit log failed:", err.message));
  };

  const locationTerms = async () => {
    const rows = await query("SELECT name, aliases, region FROM seo_locations");
    return rows.flatMap((r) => [r.name, ...parseJson(r.aliases, [])]).filter(Boolean);
  };

  const configRow = async (pageId, status) => {
    const rows = await query("SELECT * FROM seo_page_configs WHERE page_id = ? AND status = ? ORDER BY id DESC LIMIT 1", [pageId, status]);
    return rows[0] ? { ...rows[0], payload: { ...emptyConfig(), ...parseJson(rows[0].payload, {}) } } : null;
  };

  const pageById = async (id) => (await query("SELECT * FROM seo_pages WHERE id = ?", [id]))[0] || null;

  const cannibalization = async () => {
    const keywordClashes = await query(
      `SELECT k.keyword_norm AS keyword, GROUP_CONCAT(DISTINCT p.name ORDER BY p.name SEPARATOR '||') AS pages
       FROM seo_keywords k JOIN seo_pages p ON p.id = k.page_id
       WHERE k.keyword_type = 'PRIMARY' AND k.status = 'ACTIVE'
       GROUP BY k.keyword_norm HAVING COUNT(DISTINCT k.page_id) > 1`
    );
    const configs = await query(
      `SELECT c.page_id, c.payload, p.name FROM seo_page_configs c JOIN seo_pages p ON p.id = c.page_id
       WHERE c.status IN ('draft', 'published')`
    );
    const byTopic = {};
    for (const c of configs) {
      const topic = normalizeKeyword(parseJson(c.payload, {}).primaryTopic);
      if (!topic) continue;
      (byTopic[topic] = byTopic[topic] || new Set()).add(c.name);
    }
    return [
      ...keywordClashes.map((r) => ({ keyword: r.keyword, pages: String(r.pages).split("||"), kind: "primary keyword" })),
      ...Object.entries(byTopic)
        .filter(([, pages]) => pages.size > 1)
        .map(([keyword, pages]) => ({ keyword, pages: [...pages], kind: "primary topic" })),
    ];
  };

  // ---------- PUBLIC: approved, render-ready configuration only ----------
  router.get("/api/seo/published", async (req, res) => {
    try {
      const rows = await query(
        `SELECT p.path, c.payload, c.publishedAt FROM seo_page_configs c JOIN seo_pages p ON p.id = c.page_id
         WHERE c.status = 'published'`
      );
      res.json(
        rows.map((r) => {
          const c = { ...emptyConfig(), ...parseJson(r.payload, {}) };
          return {
            path: r.path,
            seoTitle: c.seoTitle,
            metaDescription: c.metaDescription,
            preferredH1: c.preferredH1,
            sections: c.sections,
            internalLinks: c.internalLinks,
            canonicalUrl: c.canonicalUrl,
            robotsIndex: c.robotsIndex,
            robotsFollow: c.robotsFollow,
            publishedAt: r.publishedAt,
          };
        })
      );
    } catch (err) {
      console.error("SEO published fetch failed:", err);
      fail(res, 500, "Failed to load SEO configuration");
    }
  });

  // ---------- ADMIN: overview ----------
  router.get("/api/admin/seo/overview", verifyToken, async (req, res) => {
    try {
      const pages = await query("SELECT * FROM seo_pages ORDER BY id ASC");
      const counts = await query(
        "SELECT page_id, status, COUNT(*) AS n FROM seo_keywords GROUP BY page_id, status"
      );
      const configs = await query(
        "SELECT page_id, status, payload, createdAt, publishedAt FROM seo_page_configs WHERE status IN ('draft', 'published')"
      );
      const lastAudit = await query("SELECT page_id, MAX(createdAt) AS at FROM seo_audit_log GROUP BY page_id");
      res.json({
        success: true,
        pages: pages.map((p) => {
          const draft = configs.find((c) => c.page_id === p.id && c.status === "draft");
          const published = configs.find((c) => c.page_id === p.id && c.status === "published");
          return {
            ...p,
            activeKeywords: Number((counts.find((c) => c.page_id === p.id && c.status === "ACTIVE") || {}).n || 0),
            archivedKeywords: Number((counts.find((c) => c.page_id === p.id && c.status === "ARCHIVED") || {}).n || 0),
            hasDraft: Boolean(draft),
            published: published ? { ...emptyConfig(), ...parseJson(published.payload, {}) } : null,
            publishedAt: published ? published.publishedAt : null,
            draftUpdatedAt: draft ? draft.createdAt : null,
            lastUpdated: Number((lastAudit.find((a) => a.page_id === p.id) || {}).at || 0) || null,
          };
        }),
        warnings: await cannibalization(),
      });
    } catch (err) {
      console.error("SEO overview failed:", err);
      fail(res, 500, "Failed to load the SEO overview");
    }
  });

  // ---------- ADMIN: pages ----------
  router.post("/api/admin/seo/pages", verifyToken, async (req, res) => {
    const path = clean(req.body && req.body.path, 100);
    const name = clean(req.body && req.body.name, 120);
    if (!PAGE_PATH_RE.test(path)) return fail(res, 400, "Page path must look like /google_ads (lowercase letters, numbers, - or _).");
    if (!name) return fail(res, 400, "Page name is required.");
    try {
      const r = await query("INSERT INTO seo_pages (path, name, createdAt) VALUES (?, ?, ?)", [path, name, Date.now()]);
      await log(req, "page.create", r.insertId, "path", null, path);
      res.json({ success: true, id: r.insertId });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") return fail(res, 409, "This page is already registered.");
      console.error("SEO page create failed:", err);
      fail(res, 500, "Failed to add the page");
    }
  });

  router.get("/api/admin/seo/pages/:id", verifyToken, async (req, res) => {
    try {
      const page = await pageById(req.params.id);
      if (!page) return fail(res, 404, "Page not found");
      const [draft, published, keywords, audit, history] = await Promise.all([
        configRow(page.id, "draft"),
        configRow(page.id, "published"),
        query("SELECT * FROM seo_keywords WHERE page_id = ? ORDER BY FIELD(priority, 'HIGH', 'MEDIUM', 'LOW'), keyword_norm", [page.id]),
        query("SELECT * FROM seo_audit_log WHERE page_id = ? ORDER BY id DESC LIMIT 100", [page.id]),
        query("SELECT id, status, created_by, createdAt, publishedAt FROM seo_page_configs WHERE page_id = ? ORDER BY id DESC LIMIT 20", [page.id]),
      ]);
      res.json({
        success: true,
        page,
        draft: draft ? draft.payload : null,
        draftUpdatedAt: draft ? draft.createdAt : null,
        published: published ? published.payload : null,
        publishedAt: published ? published.publishedAt : null,
        keywords: keywords.map((k) => ({ ...k, warnings: keywordWarnings(k.keyword) })),
        audit,
        history,
        locations: await query("SELECT * FROM seo_locations ORDER BY is_primary DESC, name ASC").then((rows) =>
          rows.map((r) => ({ ...r, aliases: parseJson(r.aliases, []) }))
        ),
        warnings: (await cannibalization()).filter((w) => w.pages.includes(page.name)),
      });
    } catch (err) {
      console.error("SEO page load failed:", err);
      fail(res, 500, "Failed to load the page configuration");
    }
  });

  router.put("/api/admin/seo/pages/:id/draft", verifyToken, async (req, res) => {
    try {
      const page = await pageById(req.params.id);
      if (!page) return fail(res, 404, "Page not found");
      const cfg = buildConfig(req.body);
      const previous = (await configRow(page.id, "draft")) || (await configRow(page.id, "published"));
      const before = previous ? previous.payload : emptyConfig();
      const existingDraft = await configRow(page.id, "draft");
      if (existingDraft) {
        await query("UPDATE seo_page_configs SET payload = ?, created_by = ?, createdAt = ? WHERE id = ?", [
          JSON.stringify(cfg), String(adminOf(req)).slice(0, 190), Date.now(), existingDraft.id,
        ]);
      } else {
        await query("INSERT INTO seo_page_configs (page_id, status, payload, created_by, createdAt) VALUES (?, 'draft', ?, ?, ?)", [
          page.id, JSON.stringify(cfg), String(adminOf(req)).slice(0, 190), Date.now(),
        ]);
      }
      for (const key of Object.keys(cfg)) {
        if (JSON.stringify(before[key]) !== JSON.stringify(cfg[key])) await log(req, "draft.update", page.id, key, before[key], cfg[key]);
      }
      const problems = publishProblems(cfg, { siteHost, locationTerms: await locationTerms() });
      res.json({ success: true, message: "Draft saved", problems });
    } catch (err) {
      console.error("SEO draft save failed:", err);
      fail(res, 500, "Failed to save the draft");
    }
  });

  router.post("/api/admin/seo/pages/:id/publish", verifyToken, async (req, res) => {
    try {
      const page = await pageById(req.params.id);
      if (!page) return fail(res, 404, "Page not found");
      const draft = await configRow(page.id, "draft");
      if (!draft) return fail(res, 400, "Save a draft before publishing.");
      const problems = publishProblems(draft.payload, { siteHost, locationTerms: await locationTerms() });
      if (problems.length) return fail(res, 422, "This configuration is not ready to publish.", { problems });
      const current = await configRow(page.id, "published");
      const now = Date.now();
      await query("UPDATE seo_page_configs SET status = 'superseded' WHERE page_id = ? AND status = 'published'", [page.id]);
      await query(
        "INSERT INTO seo_page_configs (page_id, status, payload, created_by, createdAt, publishedAt) VALUES (?, 'published', ?, ?, ?, ?)",
        [page.id, JSON.stringify(draft.payload), String(adminOf(req)).slice(0, 190), now, now]
      );
      await log(req, "publish", page.id, "configuration", current ? current.payload : null, draft.payload);
      res.json({ success: true, message: "Published", publishedAt: now });
    } catch (err) {
      console.error("SEO publish failed:", err);
      fail(res, 500, "Failed to publish");
    }
  });

  router.post("/api/admin/seo/pages/:id/unpublish", verifyToken, async (req, res) => {
    try {
      const page = await pageById(req.params.id);
      if (!page) return fail(res, 404, "Page not found");
      const current = await configRow(page.id, "published");
      if (!current) return fail(res, 400, "Nothing is published for this page.");
      await query("UPDATE seo_page_configs SET status = 'unpublished' WHERE id = ?", [current.id]);
      const previous = await configRow(page.id, "superseded");
      if (previous) await query("UPDATE seo_page_configs SET status = 'published' WHERE id = ?", [previous.id]);
      await log(req, "unpublish", page.id, "configuration", current.payload, previous ? previous.payload : "code defaults");
      res.json({
        success: true,
        message: previous ? "Unpublished. The previous published version is active again." : "Unpublished. The page uses its built-in metadata again.",
      });
    } catch (err) {
      console.error("SEO unpublish failed:", err);
      fail(res, 500, "Failed to unpublish");
    }
  });

  // ---------- ADMIN: keywords ----------
  const keywordFromBody = (b) => ({
    keyword: clean(b.keyword, 160),
    keyword_norm: normalizeKeyword(b.keyword),
    keyword_type: enumValue(b.keywordType ?? b.keyword_type, KEYWORD_TYPES, ""),
    search_intent: enumValue(b.searchIntent ?? b.search_intent, INTENTS, ""),
    location: clean(b.location, 120) || null,
    priority: enumValue(b.priority, PRIORITIES, "MEDIUM"),
    status: enumValue(b.status, KEYWORD_STATUSES, "ACTIVE"),
    notes: clean(b.notes, 500) || null,
  });

  const keywordProblem = (k) => {
    if (!k.keyword) return "Keyword is required.";
    if (/[<>{}]/.test(k.keyword)) return "Keywords cannot contain < > { or }.";
    if (!k.keyword_type) return `Keyword type must be one of ${KEYWORD_TYPES.join(", ")}.`;
    if (!k.search_intent) return `Search intent must be one of ${INTENTS.join(", ")}.`;
    return null;
  };

  router.get("/api/admin/seo/keywords", verifyToken, async (req, res) => {
    const where = [];
    const params = [];
    if (req.query.page) {
      where.push("k.page_id = ?");
      params.push(Number(req.query.page));
    }
    if (req.query.q) {
      where.push("k.keyword_norm LIKE ?");
      params.push(`%${normalizeKeyword(req.query.q)}%`);
    }
    if (req.query.type && KEYWORD_TYPES.includes(String(req.query.type))) {
      where.push("k.keyword_type = ?");
      params.push(String(req.query.type));
    }
    if (req.query.status && KEYWORD_STATUSES.includes(String(req.query.status))) {
      where.push("k.status = ?");
      params.push(String(req.query.status));
    }
    try {
      const rows = await query(
        `SELECT k.*, p.name AS page_name, p.path AS page_path FROM seo_keywords k JOIN seo_pages p ON p.id = k.page_id
         ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY p.id, k.keyword_norm LIMIT 5000`,
        params
      );
      res.json(rows.map((k) => ({ ...k, warnings: keywordWarnings(k.keyword) })));
    } catch (err) {
      console.error("SEO keyword list failed:", err);
      fail(res, 500, "Failed to load keywords");
    }
  });

  router.get("/api/admin/seo/keywords/export", verifyToken, async (req, res) => {
    try {
      const pageId = Number(req.query.page) || null;
      const rows = await query(
        `SELECT k.*, p.path FROM seo_keywords k JOIN seo_pages p ON p.id = k.page_id ${pageId ? "WHERE k.page_id = ?" : ""} ORDER BY p.id, k.keyword_norm`,
        pageId ? [pageId] : []
      );
      const header = ["page", "keyword", "keywordType", "searchIntent", "location", "priority", "status", "notes"];
      const csv = [header, ...rows.map((k) => [k.path, k.keyword, k.keyword_type, k.search_intent, k.location || "", k.priority, k.status, k.notes || ""])]
        .map((r) => r.map(csvCell).join(","))
        .join("\r\n");
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="seo-keywords${pageId ? `-${pageId}` : ""}.csv"`);
      res.send(`﻿${csv}`);
    } catch (err) {
      console.error("SEO keyword export failed:", err);
      fail(res, 500, "Failed to export keywords");
    }
  });

  router.post("/api/admin/seo/keywords", verifyToken, async (req, res) => {
    const pageId = Number(req.body && req.body.pageId);
    const k = keywordFromBody(req.body || {});
    const problem = keywordProblem(k);
    if (problem) return fail(res, 400, problem);
    try {
      if (!(await pageById(pageId))) return fail(res, 404, "Page not found");
      const now = Date.now();
      const r = await query(
        `INSERT INTO seo_keywords (page_id, keyword, keyword_norm, keyword_type, search_intent, location, priority, status, notes, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [pageId, k.keyword, k.keyword_norm, k.keyword_type, k.search_intent, k.location, k.priority, k.status, k.notes, now, now]
      );
      await log(req, "keyword.create", pageId, k.keyword, null, k);
      const clashes = k.keyword_type === "PRIMARY" ? (await cannibalization()).filter((w) => w.keyword === k.keyword_norm) : [];
      res.json({ success: true, id: r.insertId, warnings: [...keywordWarnings(k.keyword), ...clashes.map((c) => `This keyword is already a primary keyword for: ${c.pages.join(", ")}.`)] });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") return fail(res, 409, "This keyword is already on this page.");
      console.error("SEO keyword create failed:", err);
      fail(res, 500, "Failed to add the keyword");
    }
  });

  router.put("/api/admin/seo/keywords/:id", verifyToken, async (req, res) => {
    const k = keywordFromBody(req.body || {});
    const problem = keywordProblem(k);
    if (problem) return fail(res, 400, problem);
    try {
      const old = (await query("SELECT * FROM seo_keywords WHERE id = ?", [req.params.id]))[0];
      if (!old) return fail(res, 404, "Keyword not found");
      await query(
        `UPDATE seo_keywords SET keyword = ?, keyword_norm = ?, keyword_type = ?, search_intent = ?, location = ?, priority = ?, status = ?, notes = ?, updatedAt = ? WHERE id = ?`,
        [k.keyword, k.keyword_norm, k.keyword_type, k.search_intent, k.location, k.priority, k.status, k.notes, Date.now(), req.params.id]
      );
      await log(req, "keyword.update", old.page_id, old.keyword, old, k);
      const clashes = k.keyword_type === "PRIMARY" ? (await cannibalization()).filter((w) => w.keyword === k.keyword_norm) : [];
      res.json({ success: true, warnings: [...keywordWarnings(k.keyword), ...clashes.map((c) => `This keyword is already a primary keyword for: ${c.pages.join(", ")}.`)] });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") return fail(res, 409, "This keyword is already on this page.");
      console.error("SEO keyword update failed:", err);
      fail(res, 500, "Failed to update the keyword");
    }
  });

  router.delete("/api/admin/seo/keywords/:id", verifyToken, async (req, res) => {
    try {
      const old = (await query("SELECT * FROM seo_keywords WHERE id = ?", [req.params.id]))[0];
      if (!old) return fail(res, 404, "Keyword not found");
      await query("DELETE FROM seo_keywords WHERE id = ?", [req.params.id]);
      await log(req, "keyword.delete", old.page_id, old.keyword, old, null);
      res.json({ success: true });
    } catch (err) {
      console.error("SEO keyword delete failed:", err);
      fail(res, 500, "Failed to delete the keyword");
    }
  });

  // CSV columns: keyword, keywordType, searchIntent, location, priority, notes.
  // Rows are validated one by one; invalid rows and duplicates are reported,
  // never silently fixed into something the admin did not write.
  router.post("/api/admin/seo/keywords/import", verifyToken, async (req, res) => {
    const pageId = Number(req.body && req.body.pageId);
    const dryRun = Boolean(req.body && req.body.dryRun);
    try {
      if (!(await pageById(pageId))) return fail(res, 404, "Page not found");
      const rows = parseCsv(req.body && req.body.csv);
      if (!rows.length) return fail(res, 400, "The CSV is empty.");
      const header = rows[0].map((h) => clean(h).toLowerCase().replace(/[^a-z]/g, ""));
      const col = (name) => header.indexOf(name);
      if (col("keyword") < 0) return fail(res, 400, "The CSV needs a header row with at least a “keyword” column.");
      const body = rows.slice(1);
      if (body.length > MAX_IMPORT_ROWS) return fail(res, 400, `Import at most ${MAX_IMPORT_ROWS} rows at a time.`);

      const existing = new Set((await query("SELECT keyword_norm FROM seo_keywords WHERE page_id = ?", [pageId])).map((r) => r.keyword_norm));
      const seen = new Set();
      const accepted = [];
      const rejected = [];
      body.forEach((r, i) => {
        const get = (name) => (col(name) >= 0 ? r[col(name)] : "");
        const k = keywordFromBody({
          keyword: get("keyword"),
          keywordType: get("keywordtype") || "RELATED",
          searchIntent: get("searchintent") || "INFORMATIONAL",
          location: get("location"),
          priority: get("priority") || "MEDIUM",
          notes: get("notes"),
        });
        const problem = keywordProblem(k);
        const line = i + 2;
        if (problem) rejected.push({ line, keyword: k.keyword, reason: problem });
        else if (existing.has(k.keyword_norm)) rejected.push({ line, keyword: k.keyword, reason: "Already on this page." });
        else if (seen.has(k.keyword_norm)) rejected.push({ line, keyword: k.keyword, reason: "Duplicate in this file." });
        else {
          seen.add(k.keyword_norm);
          accepted.push({ ...k, line, warnings: keywordWarnings(k.keyword) });
        }
      });

      if (!dryRun && accepted.length) {
        const now = Date.now();
        await query(
          `INSERT INTO seo_keywords (page_id, keyword, keyword_norm, keyword_type, search_intent, location, priority, status, notes, createdAt, updatedAt) VALUES ?`,
          [accepted.map((k) => [pageId, k.keyword, k.keyword_norm, k.keyword_type, k.search_intent, k.location, k.priority, "ACTIVE", k.notes, now, now])]
        );
        await log(req, "keyword.import", pageId, "keywords", null, `${accepted.length} imported, ${rejected.length} rejected`);
      }
      res.json({ success: true, dryRun, imported: dryRun ? 0 : accepted.length, accepted, rejected });
    } catch (err) {
      console.error("SEO keyword import failed:", err);
      fail(res, 500, "Failed to import keywords");
    }
  });

  // ---------- ADMIN: locations ----------
  router.get("/api/admin/seo/locations", verifyToken, async (req, res) => {
    try {
      const rows = await query("SELECT * FROM seo_locations ORDER BY is_primary DESC, name ASC");
      res.json(rows.map((r) => ({ ...r, aliases: parseJson(r.aliases, []) })));
    } catch (err) {
      fail(res, 500, "Failed to load locations");
    }
  });

  router.post("/api/admin/seo/locations", verifyToken, async (req, res) => {
    const name = clean(req.body && req.body.name, 120);
    const aliases = list(req.body && req.body.aliases, { maxItems: 5, maxLen: 60 });
    const region = clean(req.body && req.body.region, 120) || null;
    if (!name) return fail(res, 400, "Location name is required.");
    try {
      const r = await query("INSERT INTO seo_locations (name, aliases, region, is_primary) VALUES (?, ?, ?, 0)", [name, JSON.stringify(aliases), region]);
      await log(req, "location.create", null, name, null, { name, aliases, region });
      res.json({ success: true, id: r.insertId });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") return fail(res, 409, "This location already exists.");
      fail(res, 500, "Failed to add the location");
    }
  });

  router.delete("/api/admin/seo/locations/:id", verifyToken, async (req, res) => {
    try {
      const old = (await query("SELECT * FROM seo_locations WHERE id = ?", [req.params.id]))[0];
      if (!old) return fail(res, 404, "Location not found");
      if (old.is_primary) return fail(res, 400, "The primary location cannot be deleted.");
      await query("DELETE FROM seo_locations WHERE id = ?", [req.params.id]);
      await log(req, "location.delete", null, old.name, old, null);
      res.json({ success: true });
    } catch (err) {
      fail(res, 500, "Failed to delete the location");
    }
  });

  return router;
};

module.exports.buildConfig = buildConfig;
module.exports.publishProblems = publishProblems;
module.exports.parseCsv = parseCsv;
module.exports.keywordWarnings = keywordWarnings;
