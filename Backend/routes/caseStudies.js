// =========================================================================
// ============================ CASE STUDIES API ===========================
// Detailed write-ups of real client projects, shown at /case-studies/<slug>.
// A case study can point at a row in `projects` (project_id), which is how the
// portfolio card links to its write-up. Reuses the shared db pool, multer
// instance, Hostinger upload helper and verifyToken middleware from server.js.
//
// Content rule: nothing here may be invented. Publishing is blocked until the
// story fields are filled in, and every measurable result must say where the
// number came from, so a thin or unverified page can never reach the site.
// =========================================================================

const express = require("express");
const sharp = require("sharp");

const CATEGORIES = ["digital-marketing", "web-development", "production", "podcast"];
const SERVICE_PAGES = ["/digital_marketing", "/web_development", "/production_house", "/podcast_studio"];
const STATUSES = ["published", "draft"];
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const BLOG_SLUG_RE = /^[a-z0-9][a-z0-9/_-]{0,250}$/i;
const VIDEO_RE = /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|vimeo\.com\/)[\w-]+/i;
const MAX_UPLOAD_WIDTH = 1280;

const TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS case_studies (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    project_id         INT          NULL,
    slug               VARCHAR(120) NOT NULL,
    title              VARCHAR(200) NOT NULL,
    client_name        VARCHAR(150) NOT NULL,
    client_logo        VARCHAR(500) NULL,
    short_description  VARCHAR(320) NULL,
    category           VARCHAR(40)  NOT NULL,
    industry           VARCHAR(120) NULL,
    location           VARCHAR(150) NULL,
    project_date       VARCHAR(7)   NULL,
    project_type       VARCHAR(150) NULL,
    overview           TEXT         NULL,
    challenge          TEXT         NULL,
    goals              TEXT         NULL,
    approach           JSON         NULL,
    services           JSON         NULL,
    technologies       JSON         NULL,
    deliverables       JSON         NULL,
    features           JSON         NULL,
    outcomes           JSON         NULL,
    metrics            JSON         NULL,
    cover_image        VARCHAR(500) NULL,
    cover_alt          VARCHAR(250) NULL,
    cover_width        INT          NULL,
    cover_height       INT          NULL,
    gallery            JSON         NULL,
    video_url          VARCHAR(500) NULL,
    testimonial        TEXT         NULL,
    testimonial_author VARCHAR(150) NULL,
    testimonial_role   VARCHAR(150) NULL,
    website_url        VARCHAR(500) NULL,
    related_services   JSON         NULL,
    related_blogs      JSON         NULL,
    seo_title          VARCHAR(70)  NULL,
    seo_description    VARCHAR(170) NULL,
    og_image           VARCHAR(500) NULL,
    status             VARCHAR(20)  NOT NULL DEFAULT 'draft',
    display_order      INT          NOT NULL DEFAULT 0,
    published_at       BIGINT       NULL,
    createdAt          BIGINT       NULL,
    updatedAt          BIGINT       NULL,
    UNIQUE KEY uq_case_studies_slug (slug),
    INDEX idx_case_studies_status (status),
    INDEX idx_case_studies_project (project_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`;

const JSON_FIELDS = ["approach", "services", "technologies", "deliverables", "features", "outcomes", "metrics", "gallery", "related_services", "related_blogs"];

// ---------------------------------------------------------------- helpers --

const text = (value, max) => {
  if (value === null || value === undefined) return null;
  const s = String(value).replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
  if (!s) return null;
  return max ? s.slice(0, max) : s;
};

const line = (value, max) => {
  const s = text(value, max);
  return s ? s.replace(/\s+/g, " ") : null;
};

const isHttpUrl = (value) => /^https?:\/\/[^\s<>"]+$/i.test(String(value || ""));
const isHttpsUrl = (value) => /^https:\/\/[^\s<>"]+$/i.test(String(value || ""));

const parseJson = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }
  return [];
};

const stringList = (value, { maxItems = 30, maxLen = 160 } = {}) =>
  [...new Set(parseJson(value).map((v) => line(v, maxLen)).filter(Boolean))].slice(0, maxItems);

const toInt = (value) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
};

const mapRow = (row) => {
  const out = { ...row };
  for (const f of JSON_FIELDS) out[f] = parseJson(row[f]);
  return out;
};

const imagesOf = (row) =>
  [row.cover_image, row.og_image, row.client_logo, ...parseJson(row.gallery).map((g) => g && g.url)].filter(Boolean);

// -------------------------------------------------------------- validation --

// Turns the request body into a clean row. Returns { row, errors }.
function buildRow(body) {
  const errors = [];
  const b = body || {};

  const row = {
    project_id: toInt(b.project_id),
    slug: line(b.slug, 120),
    title: line(b.title, 200),
    client_name: line(b.client_name, 150),
    client_logo: line(b.client_logo, 500),
    short_description: line(b.short_description, 320),
    category: line(b.category, 40),
    industry: line(b.industry, 120),
    location: line(b.location, 150),
    project_date: line(b.project_date, 7),
    project_type: line(b.project_type, 150),
    overview: text(b.overview, 8000),
    challenge: text(b.challenge, 8000),
    goals: text(b.goals, 8000),
    cover_image: line(b.cover_image, 500),
    cover_alt: line(b.cover_alt, 250),
    cover_width: toInt(b.cover_width),
    cover_height: toInt(b.cover_height),
    video_url: line(b.video_url, 500),
    testimonial: text(b.testimonial, 2000),
    testimonial_author: line(b.testimonial_author, 150),
    testimonial_role: line(b.testimonial_role, 150),
    website_url: line(b.website_url, 500),
    seo_title: line(b.seo_title, 70),
    seo_description: line(b.seo_description, 170),
    og_image: line(b.og_image, 500),
    display_order: Math.max(0, toInt(b.display_order) || 0),
  };

  row.approach = parseJson(b.approach)
    .map((s) => ({ title: line(s && s.title, 120), description: text(s && s.description, 2000) }))
    .filter((s) => s.title || s.description)
    .slice(0, 12);
  row.services = stringList(b.services, { maxItems: 20, maxLen: 80 });
  row.technologies = stringList(b.technologies, { maxItems: 30, maxLen: 60 });
  row.deliverables = stringList(b.deliverables, { maxItems: 30, maxLen: 300 });
  row.features = stringList(b.features, { maxItems: 30, maxLen: 300 });
  row.outcomes = stringList(b.outcomes, { maxItems: 20, maxLen: 400 });
  row.metrics = parseJson(b.metrics)
    .map((m) => ({ label: line(m && m.label, 120), value: line(m && m.value, 60), source: line(m && m.source, 300) }))
    .filter((m) => m.label || m.value || m.source)
    .slice(0, 12);
  row.gallery = parseJson(b.gallery)
    .map((g) => ({
      url: line(g && g.url, 500),
      alt: line(g && g.alt, 250),
      caption: line(g && g.caption, 250),
      width: toInt(g && g.width),
      height: toInt(g && g.height),
    }))
    .filter((g) => g.url)
    .slice(0, 24);
  row.related_services = stringList(b.related_services, { maxItems: 4 }).filter((p) => SERVICE_PAGES.includes(p));
  row.related_blogs = stringList(b.related_blogs, { maxItems: 6, maxLen: 255 })
    .map((p) => p.replace(/^\/+/, "").replace(/^blog\//, "").replace(/\/+$/, ""))
    .filter((p) => BLOG_SLUG_RE.test(p));

  if (!row.title) errors.push("Title is required.");
  if (!row.client_name) errors.push("Client name is required.");
  if (!row.slug || !SLUG_RE.test(row.slug)) errors.push("Slug must use lowercase letters, numbers and single hyphens (e.g. kns-metal-solutions).");
  if (!CATEGORIES.includes(row.category)) errors.push("Choose a category.");
  if (row.project_date && !MONTH_RE.test(row.project_date)) errors.push("Project date must be a month (YYYY-MM).");
  if (row.website_url && !isHttpUrl(row.website_url)) errors.push("Project website must start with http:// or https://");
  if (row.video_url && !VIDEO_RE.test(row.video_url)) errors.push("Video must be a YouTube or Vimeo link.");
  for (const [field, label] of [["cover_image", "Cover image"], ["og_image", "Social share image"], ["client_logo", "Client logo"]]) {
    if (row[field] && !isHttpsUrl(row[field])) errors.push(`${label} must be an https:// image URL.`);
  }
  if (row.gallery.some((g) => !isHttpsUrl(g.url))) errors.push("Every gallery image must be an https:// URL.");
  if (row.gallery.some((g) => !g.alt)) errors.push("Every gallery image needs a description (alt text).");
  if (row.metrics.some((m) => !m.label || !m.value || !m.source))
    errors.push("Every result needs a label, a value and the source it was measured in (e.g. Google Search Console, Jan–Jun 2025).");
  if (row.testimonial && !row.testimonial_author) errors.push("A testimonial needs the name of the person who gave it.");

  return { row, errors };
}

// The bar a case study has to clear before it can be public. Drafts skip it.
function publishBlockers(row) {
  const blockers = [];
  const len = (s) => (s ? s.length : 0);
  if (len(row.short_description) < 50) blockers.push("Short description (at least 50 characters).");
  if (len(row.overview) < 150) blockers.push("Project overview (at least 150 characters): who the client is and what we delivered.");
  if (!row.challenge && !row.goals) blockers.push("The challenge or the project goals.");
  if (!row.approach.length) blockers.push("At least one step in Our Approach.");
  if (!row.deliverables.length) blockers.push("At least one deliverable.");
  if (!row.cover_image) blockers.push("A cover image (a real screenshot or photo from the project).");
  if (row.cover_image && !row.cover_alt) blockers.push("A description (alt text) for the cover image.");
  return blockers;
}

// ------------------------------------------------------------------ routes --

module.exports = function caseStudyRoutes({ db, verifyToken, upload, uploadToHostinger, removeUploadsIfUnused, discardTempFile }) {
  const router = express.Router();

  db.query(TABLE_SQL, (err) => {
    if (err) console.log("❌ CASE STUDIES TABLE ERROR:", err);
    else console.log("✅ case_studies table ready");
  });

  const query = (sql, params = []) =>
    new Promise((resolve, reject) => db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows))));

  const serialize = (row) => {
    const out = { ...row };
    for (const f of JSON_FIELDS) if (f in out) out[f] = JSON.stringify(out[f] || []);
    return out;
  };

  const fail = (res, status, message, extra = {}) => res.status(status).json({ success: false, message, ...extra });

  // ---------- PUBLIC: published case studies ----------
  router.get("/api/case-studies", async (req, res) => {
    try {
      const rows = await query("SELECT * FROM case_studies WHERE status = 'published' ORDER BY display_order ASC, published_at DESC");
      res.json(rows.map(mapRow));
    } catch (err) {
      console.error("DB error fetching case studies:", err);
      fail(res, 500, "Failed to fetch case studies");
    }
  });

  router.get("/api/case-studies/:slug", async (req, res) => {
    try {
      const rows = await query("SELECT * FROM case_studies WHERE slug = ? AND status = 'published' LIMIT 1", [req.params.slug]);
      if (!rows.length) return fail(res, 404, "Case study not found");
      res.json(mapRow(rows[0]));
    } catch (err) {
      console.error("DB error fetching case study:", err);
      fail(res, 500, "Failed to fetch case study");
    }
  });

  // ---------- ADMIN: list + single ----------
  router.get("/api/admin/case-studies", verifyToken, async (req, res) => {
    try {
      const rows = await query("SELECT * FROM case_studies ORDER BY display_order ASC, updatedAt DESC");
      res.json(rows.map(mapRow));
    } catch (err) {
      console.error("DB error fetching admin case studies:", err);
      fail(res, 500, "Failed to fetch case studies");
    }
  });

  router.get("/api/admin/case-studies/:id", verifyToken, async (req, res) => {
    try {
      const rows = await query("SELECT * FROM case_studies WHERE id = ?", [req.params.id]);
      if (!rows.length) return fail(res, 404, "Case study not found");
      res.json(mapRow(rows[0]));
    } catch (err) {
      console.error("DB error fetching case study:", err);
      fail(res, 500, "Failed to fetch case study");
    }
  });

  // ---------- ADMIN: image upload (cover, logo, gallery, share image) ----------
  router.post(
    "/api/admin/case-studies/upload",
    verifyToken,
    (req, res, next) =>
      upload.single("image")(req, res, (err) => {
        if (!err) return next();
        const message =
          err.code === "LIMIT_FILE_SIZE"
            ? "Image is too large. Maximum allowed size is 5MB."
            : "Unsupported file type. Please upload a JPG, PNG or WebP image.";
        return fail(res, 400, message);
      }),
    async (req, res) => {
      if (!req.file) return fail(res, 400, "Choose an image to upload.");
      try {
        let width = null;
        let height = null;
        try {
          const meta = await sharp(req.file.path).metadata();
          const rotated = meta.orientation && meta.orientation >= 5;
          width = rotated ? meta.height : meta.width;
          height = rotated ? meta.width : meta.height;
          if (width > MAX_UPLOAD_WIDTH) {
            height = Math.round((height * MAX_UPLOAD_WIDTH) / width);
            width = MAX_UPLOAD_WIDTH;
          }
        } catch (_) {}
        const url = await uploadToHostinger(req.file.path);
        if (!isHttpsUrl(url)) return fail(res, 502, "Image upload failed. Please try again.");
        res.json({ success: true, url, width, height });
      } catch (err) {
        console.error("Case study image upload failed:", err);
        discardTempFile(req);
        fail(res, 500, "Image upload failed. Please try again.");
      }
    }
  );

  // ---------- ADMIN: create ----------
  router.post("/api/case-studies", verifyToken, async (req, res) => {
    const { row, errors } = buildRow(req.body);
    if (errors.length) return fail(res, 400, errors[0], { errors });

    const status = STATUSES.includes(req.body && req.body.status) ? req.body.status : "draft";
    if (status === "published") {
      const blockers = publishBlockers(row);
      if (blockers.length) return fail(res, 422, "This case study is not ready to publish yet.", { blockers });
    }

    const now = Date.now();
    const values = serialize({ ...row, status, published_at: status === "published" ? now : null, createdAt: now, updatedAt: now });
    const cols = Object.keys(values);
    try {
      const result = await query(
        `INSERT INTO case_studies (${cols.map((c) => `\`${c}\``).join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`,
        Object.values(values)
      );
      res.json({ success: true, message: status === "published" ? "Case study published" : "Case study saved as draft", id: result.insertId });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") return fail(res, 409, "Another case study already uses this slug.");
      console.error("DB error creating case study:", err);
      fail(res, 500, "Failed to create case study");
    }
  });

  // ---------- ADMIN: update ----------
  router.put("/api/case-studies/:id", verifyToken, async (req, res) => {
    const { row, errors } = buildRow(req.body);
    if (errors.length) return fail(res, 400, errors[0], { errors });

    let previous;
    try {
      const rows = await query("SELECT * FROM case_studies WHERE id = ?", [req.params.id]);
      previous = rows[0];
    } catch (err) {
      console.error("DB error loading case study:", err);
      return fail(res, 500, "Failed to update case study");
    }
    if (!previous) return fail(res, 404, "Case study not found");

    const status = STATUSES.includes(req.body && req.body.status) ? req.body.status : previous.status;
    if (status === "published") {
      const blockers = publishBlockers(row);
      if (blockers.length) return fail(res, 422, "This case study is not ready to publish yet.", { blockers });
    }

    const previousImages = imagesOf(previous);
    const publishedAt = status === "published" ? previous.published_at || Date.now() : previous.published_at;
    const values = serialize({ ...row, status, published_at: publishedAt, updatedAt: Date.now() });
    const cols = Object.keys(values);
    try {
      await query(`UPDATE case_studies SET ${cols.map((c) => `\`${c}\` = ?`).join(", ")} WHERE id = ?`, [...Object.values(values), req.params.id]);
      res.json({ success: true, message: status === "published" ? "Case study updated" : "Draft saved" });
      const kept = new Set(imagesOf(row));
      removeUploadsIfUnused(previousImages.filter((url) => !kept.has(url)));
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") return fail(res, 409, "Another case study already uses this slug.");
      console.error("DB error updating case study:", err);
      fail(res, 500, "Failed to update case study");
    }
  });

  // ---------- ADMIN: publish / unpublish ----------
  // A status change is not a content change, so updatedAt (the sitemap
  // lastmod) is left alone.
  router.put("/api/case-studies/:id/status", verifyToken, async (req, res) => {
    const status = req.body && req.body.status;
    if (!STATUSES.includes(status)) return fail(res, 400, "Status must be either 'published' or 'draft'.");
    try {
      const rows = await query("SELECT * FROM case_studies WHERE id = ?", [req.params.id]);
      if (!rows.length) return fail(res, 404, "Case study not found");
      if (status === "published") {
        const blockers = publishBlockers(mapRow(rows[0]));
        if (blockers.length) return fail(res, 422, "This case study is not ready to publish yet.", { blockers });
      }
      await query("UPDATE case_studies SET status = ?, published_at = COALESCE(published_at, ?) WHERE id = ?", [
        status,
        status === "published" ? Date.now() : null,
        req.params.id,
      ]);
      res.json({ success: true, message: status === "published" ? "Case study published" : "Case study moved to drafts" });
    } catch (err) {
      console.error("DB error updating case study status:", err);
      fail(res, 500, "Failed to update case study status");
    }
  });

  // ---------- ADMIN: delete ----------
  router.delete("/api/case-studies/:id", verifyToken, async (req, res) => {
    try {
      const rows = await query("SELECT * FROM case_studies WHERE id = ?", [req.params.id]);
      if (!rows.length) return fail(res, 404, "Case study not found");
      await query("DELETE FROM case_studies WHERE id = ?", [req.params.id]);
      res.json({ success: true, message: "Case study deleted" });
      removeUploadsIfUnused(imagesOf(rows[0]));
    } catch (err) {
      console.error("DB error deleting case study:", err);
      fail(res, 500, "Failed to delete case study");
    }
  });

  return router;
};

module.exports.buildRow = buildRow;
module.exports.publishBlockers = publishBlockers;
