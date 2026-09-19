require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const sharp = require("sharp");

// ---- SEO / AEO / GEO layer ------------------------------------------------
const { migrateBlogSeo, loadBlogColumns, filterToExistingColumns } = require("./db/migrateBlogSeo");
const seoRoutes = require("./routes/seoRoutes");
const { buildSeoColumns, hydrateSeoRow, clampMetaDescription } = require("./services/blogSeoFields");
const { validateForPublish, describeBlockers } = require("./services/seoValidation");
const { invalidateSitemapCache } = require("./services/sitemapService");
const { createOgVariant, validateFeaturedImage, safeUnlink } = require("./services/imageVariants");
const htmlInjector = require("./services/htmlInjector");
const { SITE } = require("./config/site");
const { metaForRoute } = require("./config/routeMeta");

const PORT = process.env.PORT || 5000;
const app = express();

// ================= CORS =================
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://geniemedia.in",
  "https://www.geniemedia.in",  // ✅ FIX 1: added www variant (no trailing slash)
  "https://genie-media-studio.vercel.app/",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some((allowed) =>
      origin.startsWith(allowed)
    );

    if (isAllowed) return callback(null, true);

    console.log("❌ Blocked by CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Per-request CORS options, so same-origin traffic can be waved through.
//
// The browser attaches an Origin header to module scripts, stylesheets and
// fetches even when they are served by this very process. That was harmless
// while this server only answered /api — but now that it also hosts the built
// SPA, every /assets/*.js and /assets/*.css request arrives with an Origin of
// the host it was just loaded from. That host is not in `allowedOrigins`
// (which lists the public site, not whatever host:port the server happens to
// run on), so the whitelist rejected them and Express turned the rejection
// into a 500. The page loaded, no JavaScript ran, and nothing rendered.
//
// Genuine cross-origin API calls still go through the whitelist unchanged.
const corsOptionsDelegate = (req, callback) => {
  const origin = req.headers.origin;

  let sameOrigin = false;
  if (origin) {
    try {
      sameOrigin = new URL(origin).host === req.headers.host;
    } catch (_) {
      sameOrigin = false;
    }
  }

  if (!origin || sameOrigin) return callback(null, { ...corsOptions, origin: true });
  return callback(null, corsOptions);
};

app.use(cors(corsOptionsDelegate));

// ✅ FIX 2: Respond to ALL preflight OPTIONS requests immediately.
// Express v5 dropped support for "*" and "(.*)" string wildcards in path-to-regexp v8,
// so we pass a RegExp directly to bypass that parser entirely.
app.options(/.*/, cors(corsOptionsDelegate));

app.use(express.json());

// ================= STATIC FILES =================
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ================= DB CONNECTION =================
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.query("SELECT 1", (err) => {
  if (err) console.log("❌ DB ERROR:", err);
  else console.log("✅ DB Connected Stable");
});

// ================= PROJECTS TABLE (auto-provision) =================
// Additive only — this never reads from or writes to the existing `blogs` table.
// Runs on boot so Hostinger/Render deployments provision the table automatically.
const PROJECTS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS projects (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(255) NOT NULL,
    description  TEXT         NULL,
    category     VARCHAR(150) NULL,
    image        VARCHAR(500) NULL,
    projectUrl   VARCHAR(500) NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'published',
    displayOrder INT          NOT NULL DEFAULT 0,
    createdAt    BIGINT       NULL,
    updatedAt    BIGINT       NULL,
    INDEX idx_projects_status (status),
    INDEX idx_projects_order (displayOrder)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`;

db.query(PROJECTS_TABLE_SQL, (err) => {
  if (err) console.log("❌ PROJECTS TABLE ERROR:", err);
  else console.log("✅ projects table ready");
});

// ================= BLOG SEO SCHEMA (auto-provision) =================
// Adds the SEO / AEO / GEO columns to `blogs` if they are not there yet, then
// caches the resulting column list. Every blog write filters its payload
// through that cache, so a column that failed to be added degrades one field
// instead of breaking every save. See db/migrateBlogSeo.js.
migrateBlogSeo(db).then(() => loadBlogColumns(db));

// ================= MULTER =================
// Multer is only used as a temp buffer before uploading to Hostinger
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "public/uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only images are allowed"));
  },
});

// ================= HELPER: Optimise an uploaded image =================
// Admin-uploaded artwork arrives straight from a design tool — typically a
// ~1 MB, 1900px-wide PNG. The site never displays those wider than about 640
// CSS px, so six of them on the home page accounted for several megabytes of
// page weight on their own.
//
// Before upload, each image is therefore capped at MAX_UPLOAD_WIDTH and
// re-encoded as WebP, which is roughly 15-25x smaller for this kind of
// screenshot while staying visually identical at display size. Transparency is
// preserved. The public URL keeps a normal image extension, so nothing on the
// frontend needs to know this happened.
//
// If optimisation fails for any reason the original file is uploaded unchanged —
// a publish must never fail because an image could not be re-encoded.
const MAX_UPLOAD_WIDTH = 1280;

const optimiseImage = async (tempFilePath) => {
  try {
    const meta = await sharp(tempFilePath).metadata();

    const optimisedPath = `${tempFilePath}.opt.webp`;
    let pipeline = sharp(tempFilePath, { failOn: "none" }).rotate(); // honour EXIF orientation

    if (meta.width > MAX_UPLOAD_WIDTH) {
      pipeline = pipeline.resize({ width: MAX_UPLOAD_WIDTH, withoutEnlargement: true });
    }

    await pipeline.webp({ quality: 82, effort: 5 }).toFile(optimisedPath);

    const before = fs.statSync(tempFilePath).size;
    const after = fs.statSync(optimisedPath).size;

    if (after >= before) {
      // Already well optimised — keep whatever the admin uploaded.
      fs.unlinkSync(optimisedPath);
      return { path: tempFilePath, extra: null };
    }

    console.log(
      `🖼️  Optimised upload: ${Math.round(before / 1024)} KB -> ${Math.round(after / 1024)} KB ` +
        `(${meta.width}x${meta.height}${meta.width > MAX_UPLOAD_WIDTH ? ` -> ${MAX_UPLOAD_WIDTH}px wide` : ""})`
    );
    return { path: optimisedPath, extra: tempFilePath };
  } catch (err) {
    console.error("Image optimisation skipped:", err.message);
    return { path: tempFilePath, extra: null };
  }
};

// ================= HELPER: Upload file to Hostinger =================
// Uploads temp file to upload.php, returns full HTTPS URL, cleans up temp files
const uploadToHostinger = async (tempFilePath) => {
  const { path: fileToSend, extra } = await optimiseImage(tempFilePath);

  try {
    const formData = new FormData();
    // The remote endpoint names the stored file from the upload's filename, so
    // send the optimised basename to keep the extension truthful.
    formData.append("file", fs.createReadStream(fileToSend), {
      filename: path.basename(fileToSend).replace(/\.opt\.webp$/, ".webp"),
    });

    const response = await axios.post(
      "https://geniemedia.in/upload.php",
      formData,
      { headers: formData.getHeaders() }
    );

    return response.data.url; // full HTTPS URL from Hostinger
  } finally {
    // Always clean up temp files, whether upload succeeded or failed
    for (const p of [fileToSend, extra]) {
      if (!p) continue;
      try {
        if (fs.existsSync(p)) fs.unlinkSync(p);
      } catch (_) {}
    }
  }
};

// ================= HELPER: Raw upload (no optimisation) =================
// Used for files that have already been processed — notably the Open Graph
// variant, which is generated at an exact 1200x630 and must not be resized
// again on the way out.
const uploadProcessedFile = async (filePath, filename) => {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath), { filename });
  const response = await axios.post("https://geniemedia.in/upload.php", formData, {
    headers: formData.getHeaders(),
  });
  return response.data.url;
};

// ================= HELPER: Featured image + OG variant =================
// A blog hero has to exist at two ratios: 16:9 for the article layout and
// 1.91:1 for every social and chat preview card. Generating the second one here
// is what stops WhatsApp and LinkedIn centre-cropping the 16:9 file and cutting
// heads off. See services/imageVariants.js for the reasoning.
//
// Returns { imageUrl, ogImageUrl, warnings, errors }. An OG failure is never
// fatal — the 16:9 original is a usable fallback, and a publish must not fail
// because a derived image could not be encoded.
const uploadFeaturedImage = async (tempFilePath) => {
  const check = await validateFeaturedImage(tempFilePath);

  let ogImageUrl = null;
  let ogPath = null;

  try {
    ogPath = await createOgVariant(tempFilePath);
    if (ogPath) {
      const ogName = path.basename(tempFilePath).replace(/\.[^.]+$/, "") + "-og.webp";
      ogImageUrl = await uploadProcessedFile(ogPath, ogName);
    }
  } catch (err) {
    console.error("OG variant upload skipped:", err.message);
  } finally {
    safeUnlink(ogPath);
  }

  // uploadToHostinger consumes and deletes the temp file, so it runs last.
  const imageUrl = await uploadToHostinger(tempFilePath);

  return { imageUrl, ogImageUrl, warnings: check.warnings, errors: check.errors, meta: check.meta };
};

// ================= HELPER: Normalize image URL =================
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return String(imagePath);
};

// ================= JWT MIDDLEWARE =================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(403).json({ success: false, message: "No token provided" });

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    req.user = decoded;
    next();
  });
};

app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.headers["x-forwarded-proto"] &&
    req.headers["x-forwarded-proto"] !== "https"
  ) {
    return res.redirect("https://" + req.headers.host + req.url);
  }
  next();
});

// ================= ROOT =================
// A health banner for the API-only deployment, where nothing else answers "/".
//
// It must NOT answer when this process is also serving the built SPA: it is
// registered long before the SPA fallback, so it would intercept the home page
// and hand every visitor the words "Backend is Working" instead of the site.
// `next()` lets the request fall through to the SPA handler further down.
app.get("/", (req, res, next) => {
  if (htmlInjector.DIST_DIR) return next();
  res.send("🚀 geniemedia Backend is Working!");
});

// ================= LOGIN =================
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: "Email and password required" });

  db.query("SELECT * FROM admins WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    if (result.length === 0)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const user = result[0];
    const isHashed = user.password.startsWith("$2b$") || user.password.startsWith("$2a$");
    const passwordMatch = isHashed
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!passwordMatch)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({ success: true, token });
  });
});

// ================= CREATE BLOG =================
app.post("/api/blogs", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const isPublishing = String(req.body.status || "").trim() === "published";

    // ---- Publish gate -----------------------------------------------------
    // Runs BEFORE the image upload so a rejected publish does not leave an
    // orphaned file on the upload host. Drafts skip the gate entirely: half
    // finished work has to be saveable.
    if (isPublishing) {
      const verdict = validateForPublish({
        ...req.body,
        image: req.file ? "pending-upload" : req.body.existingImage,
      });

      if (!verdict.ok) {
        if (req.file) safeUnlink(req.file.path);
        return res.status(422).json({
          success: false,
          message: "This post is not ready to publish yet.",
          detail: describeBlockers(verdict),
          validation: verdict,
        });
      }
    }

    let imageUrl = null;
    let ogImageUrl = null;
    let imageWarnings = [];

    if (req.file) {
      // Dimensions are checked against the temp file BEFORE the upload. A wrong
      // aspect ratio breaks the article layout, so it blocks a publish — and
      // rejecting after the upload would leave an orphaned file on the upload
      // host that nothing ever references or cleans up.
      //
      // On a draft it is only a warning: an editor should be able to save work
      // in progress and fix the image later.
      const check = await validateFeaturedImage(req.file.path);

      if (isPublishing && check.errors.length) {
        safeUnlink(req.file.path);
        return res.status(422).json({
          success: false,
          message: check.errors.join(" "),
          detail: check.errors.join(" "),
          validation: { ok: false, blockers: check.errors.map((m) => ({ id: "image-ratio", message: m })) },
        });
      }

      const uploaded = await uploadFeaturedImage(req.file.path);
      imageUrl = uploaded.imageUrl;
      ogImageUrl = uploaded.ogImageUrl;
      imageWarnings = uploaded.warnings;
    }

    const seo = filterToExistingColumns(buildSeoColumns(req.body, { ogImageUrl }));
    const now = Date.now();

    const base = {
      title: req.body.title,
      permalink: req.body.permalink,
      metaDescription: clampMetaDescription(req.body.metaDescription),
      description: req.body.description,
      category: req.body.category,
      image: imageUrl,
      keywords: req.body.keywords,
      status: req.body.status,
      createdAt: now,
      updatedAt: now,
    };

    // last_modified_at is kept as a real TIMESTAMP alongside the legacy
    // epoch-millisecond updatedAt, because schema.org dateModified and the
    // sitemap <lastmod> both want a date, not a number.
    base.last_modified_at = new Date();

    const values = filterToExistingColumns({ ...base, ...seo });
    const columns = Object.keys(values);

    const sql = `INSERT INTO blogs (${columns.map((c) => `\`${c}\``).join(", ")}) VALUES (${columns
      .map(() => "?")
      .join(", ")})`;

    db.query(sql, Object.values(values), (err, result) => {
      if (err) {
        console.error("DB error creating blog:", err);
        return res.status(500).json({ success: false, message: "Failed to create blog" });
      }
      invalidateSitemapCache();
      res.json({
        success: true,
        message: "Blog created",
        id: result.insertId,
        warnings: imageWarnings,
      });
    });
  } catch (err) {
    console.error("Error creating blog:", err);
    if (req.file) safeUnlink(req.file.path);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ================= GET PUBLIC BLOGS =================
app.get("/api/blogs", (req, res) => {
  db.query("SELECT * FROM blogs WHERE status = 'published' ORDER BY createdAt DESC", (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to fetch blogs" });

    const blogs = results.map((blog) => ({
      ...hydrateSeoRow(blog),
      image: getImageUrl(blog.image),
    }));

    res.json(blogs);
  });
});

// ================= GET ALL BLOGS (ADMIN) =================
app.get("/api/admin/blogs", verifyToken, (req, res) => {
  db.query("SELECT * FROM blogs ORDER BY createdAt DESC", (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to fetch blogs" });

    const blogs = results.map((blog) => ({
      ...hydrateSeoRow(blog),
      image: getImageUrl(blog.image),
    }));

    res.json(blogs);
  });
});

// ================= GET SINGLE BLOG BY SLUG =================
app.use("/api/blog", (req, res) => {
  const slug = req.path.replace(/^\//, "");
  if (!slug)
    return res.status(404).json({ success: false, message: "No slug provided" });

  db.query("SELECT * FROM blogs WHERE permalink = ?", [slug], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    if (result.length === 0)
      return res.status(404).json({ success: false, message: "Blog not found" });

    const blog = { ...hydrateSeoRow(result[0]), image: getImageUrl(result[0].image) };
    res.json(blog);
  });
});

// ================= UPDATE BLOG =================
app.put("/api/blogs/:id", verifyToken, upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { existingImage } = req.body; // sent when no new file is chosen — preserve current image

  try {
    // The previous row is needed for two things: appending to slug_history when
    // the permalink changed, and merging SEO fields that this particular request
    // did not send (the quick publish/unpublish buttons post a partial form).
    const previousRow = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM blogs WHERE id = ? LIMIT 1", [id], (err, rows) =>
        err ? reject(err) : resolve(rows[0] ? hydrateSeoRow(rows[0]) : null)
      );
    });

    if (!previousRow) {
      if (req.file) safeUnlink(req.file.path);
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const isPublishing = String(req.body.status || "").trim() === "published";

    // Partial submissions (the publish / unpublish toggles) carry only the core
    // fields. Validating those against an empty SEO payload would reject a post
    // that is actually complete, so the stored values are merged in first.
    //
    // A field that was SENT but is empty is an explicit clear and must win over
    // the stored value — otherwise deleting a canonical URL or an FAQ entry
    // silently does nothing. A field that was not sent at all is simply absent
    // from req.body and keeps its stored value. Multipart bodies only ever
    // contain the keys the client actually appended, so the distinction is
    // exactly "present" versus "absent", which is what this relies on.
    const merged = {
      ...previousRow,
      ...Object.fromEntries(Object.entries(req.body).filter(([, v]) => v !== undefined)),
      image: req.file ? "pending-upload" : existingImage || previousRow.image,
    };

    if (isPublishing) {
      const verdict = validateForPublish(merged);
      if (!verdict.ok) {
        if (req.file) safeUnlink(req.file.path);
        return res.status(422).json({
          success: false,
          message: "This post is not ready to publish yet.",
          detail: describeBlockers(verdict),
          validation: verdict,
        });
      }
    }

    let imageUrl;
    let ogImageUrl = null;
    let imageWarnings = [];

    if (req.file) {
      // Checked before the upload for the same reason as the create route: a
      // rejection after uploading orphans the file on the upload host.
      const check = await validateFeaturedImage(req.file.path);

      if (isPublishing && check.errors.length) {
        safeUnlink(req.file.path);
        return res.status(422).json({
          success: false,
          message: check.errors.join(" "),
          detail: check.errors.join(" "),
          validation: { ok: false, blockers: check.errors.map((m) => ({ id: "image-ratio", message: m })) },
        });
      }

      const uploaded = await uploadFeaturedImage(req.file.path);
      imageUrl = uploaded.imageUrl;
      ogImageUrl = uploaded.ogImageUrl;
      imageWarnings = uploaded.warnings;
    } else if (existingImage && existingImage.trim() !== "") {
      imageUrl = existingImage.trim();
    } else {
      // No file and no existingImage → the editor deliberately removed it. The
      // OG variant is dropped with it, since it was derived from that image.
      imageUrl = null;
      ogImageUrl = null;
    }

    const seo = filterToExistingColumns(
      buildSeoColumns(merged, { previousRow, ogImageUrl, content: merged.description })
    );

    // Removing the image must actually clear the stored OG URL, which
    // buildSeoColumns would otherwise carry over from the previous row.
    if (!req.file && !(existingImage && existingImage.trim()) && "og_image_url" in seo) {
      seo.og_image_url = null;
    }

    const base = {
      title: merged.title,
      permalink: merged.permalink,
      metaDescription: clampMetaDescription(merged.metaDescription),
      description: merged.description,
      category: merged.category,
      keywords: merged.keywords,
      status: merged.status,
      image: imageUrl,
      updatedAt: Date.now(),
      last_modified_at: new Date(),
    };

    const values = filterToExistingColumns({ ...base, ...seo });
    const columns = Object.keys(values);

    const sql = `UPDATE blogs SET ${columns.map((c) => `\`${c}\` = ?`).join(", ")} WHERE id = ?`;

    db.query(sql, [...Object.values(values), id], (err, result) => {
      if (err) {
        console.error("DB error updating blog:", err);
        return res.status(500).json({ success: false, message: "Failed to update blog" });
      }
      if (result.affectedRows === 0)
        return res.status(404).json({ success: false, message: "Blog not found" });

      invalidateSitemapCache();
      res.json({ success: true, message: "Blog updated", warnings: imageWarnings });
    });
  } catch (err) {
    console.error("Error updating blog:", err);
    if (req.file) safeUnlink(req.file.path);
    res.status(500).json({ success: false, message: "Server error uploading image" });
  }
});

// ================= DELETE BLOG =================
app.delete("/api/blogs/:id", verifyToken, (req, res) => {
  db.query("SELECT image FROM blogs WHERE id = ?", [req.params.id], (err, result) => {
    // Note: images are stored on Hostinger, not locally, so local file deletion is skipped
    // If you want to also delete from Hostinger you'd need a delete endpoint on upload.php

    db.query("DELETE FROM blogs WHERE id = ?", [req.params.id], (err2) => {
      if (err2) return res.status(500).json({ success: false, message: "Failed to delete blog" });
      // The sitemap must stop advertising a URL that now 404s.
      invalidateSitemapCache();
      res.json({ success: true, message: "Blog deleted" });
    });
  });
});

// =========================================================================
// ============================ PROJECTS API ===============================
// Portfolio ("Our Portfolio") CRUD. Completely independent from the blog
// routes above — it only reuses the shared db pool, multer instance,
// uploadToHostinger() helper and verifyToken middleware.
// =========================================================================

const PROJECT_STATUSES = ["published", "draft"];

// Removes the multer temp file when a request is rejected before upload.
const discardTempFile = (req) => {
  try {
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  } catch (_) {}
};

// multer wrapper that converts upload errors into clean JSON instead of
// letting them bubble up as an HTML 500 page.
const uploadProjectImage = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (!err) return next();

    let message = "Image upload failed. Please try again.";
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "Image is too large. Maximum allowed size is 5MB.";
    } else if (String(err.message).includes("Only images are allowed")) {
      message = "Unsupported file type. Please upload a JPG, PNG or WebP image.";
    }
    return res.status(400).json({ success: false, message });
  });
};

const isValidHttpUrl = (value) => /^https?:\/\/\S+$/i.test(String(value || "").trim());

const parseDisplayOrder = (value) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const normalizeStatus = (value) =>
  PROJECT_STATUSES.includes(String(value || "").trim()) ? String(value).trim() : "draft";

const mapProjectRow = (row) => ({ ...row, image: getImageUrl(row.image) });

// Validates the text fields shared by create + update. Returns an error string or null.
const validateProjectFields = ({ title, projectUrl }) => {
  if (!title || !String(title).trim()) return "Project title is required.";
  if (String(title).trim().length > 255) return "Project title is too long (max 255 characters).";
  if (projectUrl && String(projectUrl).trim() && !isValidHttpUrl(projectUrl))
    return "Project URL must be a valid link starting with http:// or https://";
  return null;
};

// ---------- GET PUBLISHED PROJECTS (PUBLIC) ----------
app.get("/api/projects", (req, res) => {
  db.query(
    "SELECT * FROM projects WHERE status = 'published' ORDER BY displayOrder ASC, createdAt DESC",
    (err, results) => {
      if (err) {
        console.error("DB error fetching projects:", err);
        return res.status(500).json({ success: false, message: "Failed to fetch projects" });
      }
      res.json(results.map(mapProjectRow));
    }
  );
});

// ---------- GET ALL PROJECTS (ADMIN) ----------
app.get("/api/admin/projects", verifyToken, (req, res) => {
  db.query(
    "SELECT * FROM projects ORDER BY displayOrder ASC, createdAt DESC",
    (err, results) => {
      if (err) {
        console.error("DB error fetching admin projects:", err);
        return res.status(500).json({ success: false, message: "Failed to fetch projects" });
      }
      res.json(results.map(mapProjectRow));
    }
  );
});

// ---------- GET SINGLE PROJECT (ADMIN) ----------
app.get("/api/admin/projects/:id", verifyToken, (req, res) => {
  db.query("SELECT * FROM projects WHERE id = ?", [req.params.id], (err, result) => {
    if (err) {
      console.error("DB error fetching project:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch project" });
    }
    if (result.length === 0)
      return res.status(404).json({ success: false, message: "Project not found" });

    res.json(mapProjectRow(result[0]));
  });
});

// ---------- CREATE PROJECT (ADMIN) ----------
app.post("/api/projects", verifyToken, uploadProjectImage, async (req, res) => {
  const { title, description, category, projectUrl, displayOrder, status } = req.body;

  const validationError = validateProjectFields({ title, projectUrl });
  if (validationError) {
    discardTempFile(req);
    return res.status(400).json({ success: false, message: validationError });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: "A project image is required." });
  }

  try {
    const imageUrl = await uploadToHostinger(req.file.path);

    // Never persist an empty / malformed URL returned by the upload host
    if (!isValidHttpUrl(imageUrl)) {
      return res
        .status(502)
        .json({ success: false, message: "Image upload failed — please try uploading the image again." });
    }

    const now = Date.now();
    const sql = `
      INSERT INTO projects
      (title, description, category, image, projectUrl, status, displayOrder, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        String(title).trim(),
        description || null,
        category || null,
        imageUrl,
        projectUrl ? String(projectUrl).trim() : null,
        normalizeStatus(status),
        parseDisplayOrder(displayOrder),
        now,
        now,
      ],
      (err, result) => {
        if (err) {
          console.error("DB error creating project:", err);
          return res.status(500).json({ success: false, message: "Failed to create project" });
        }
        res.json({ success: true, message: "Project created", id: result.insertId });
      }
    );
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ success: false, message: "Server error while uploading the project image" });
  }
});

// ---------- UPDATE PROJECT (ADMIN) ----------
app.put("/api/projects/:id", verifyToken, uploadProjectImage, async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    category,
    projectUrl,
    displayOrder,
    status,
    existingImage, // sent by the admin panel when no new file was chosen — keeps the current image
  } = req.body;

  const validationError = validateProjectFields({ title, projectUrl });
  if (validationError) {
    discardTempFile(req);
    return res.status(400).json({ success: false, message: validationError });
  }

  try {
    let imageUrl;

    if (req.file) {
      // New file chosen → upload it and replace the stored URL
      imageUrl = await uploadToHostinger(req.file.path);
      if (!isValidHttpUrl(imageUrl)) {
        return res
          .status(502)
          .json({ success: false, message: "Image upload failed — the existing image was kept unchanged." });
      }
    } else if (existingImage && String(existingImage).trim() !== "") {
      // No new file → keep whatever image the project already has
      imageUrl = String(existingImage).trim();
    } else {
      return res
        .status(400)
        .json({ success: false, message: "A project image is required — please upload one before saving." });
    }

    const sql = `
      UPDATE projects SET
        title        = ?,
        description  = ?,
        category     = ?,
        image        = ?,
        projectUrl   = ?,
        status       = ?,
        displayOrder = ?,
        updatedAt    = ?
      WHERE id = ?
    `;

    db.query(
      sql,
      [
        String(title).trim(),
        description || null,
        category || null,
        imageUrl,
        projectUrl ? String(projectUrl).trim() : null,
        normalizeStatus(status),
        parseDisplayOrder(displayOrder),
        Date.now(),
        id,
      ],
      (err, result) => {
        if (err) {
          console.error("DB error updating project:", err);
          return res.status(500).json({ success: false, message: "Failed to update project" });
        }
        if (result.affectedRows === 0)
          return res.status(404).json({ success: false, message: "Project not found" });

        res.json({ success: true, message: "Project updated" });
      }
    );
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).json({ success: false, message: "Server error while uploading the project image" });
  }
});

// ---------- PUBLISH / UNPUBLISH PROJECT (ADMIN) ----------
// Status-only update, so toggling visibility can never disturb the stored image.
// Uses PUT (not PATCH) to stay within the existing CORS `methods` whitelist.
app.put("/api/projects/:id/status", verifyToken, (req, res) => {
  const { status } = req.body || {};

  if (!PROJECT_STATUSES.includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Status must be either 'published' or 'draft'." });
  }

  db.query(
    "UPDATE projects SET status = ?, updatedAt = ? WHERE id = ?",
    [status, Date.now(), req.params.id],
    (err, result) => {
      if (err) {
        console.error("DB error updating project status:", err);
        return res.status(500).json({ success: false, message: "Failed to update project status" });
      }
      if (result.affectedRows === 0)
        return res.status(404).json({ success: false, message: "Project not found" });

      res.json({
        success: true,
        message: status === "published" ? "Project published" : "Project moved to drafts",
      });
    }
  );
});

// ---------- DELETE PROJECT (ADMIN) ----------
app.delete("/api/projects/:id", verifyToken, (req, res) => {
  // Images live on Hostinger (uploaded via upload.php), not on this server's disk —
  // same architecture as blogs, so no local file removal is performed here.
  db.query("DELETE FROM projects WHERE id = ?", [req.params.id], (err, result) => {
    if (err) {
      console.error("DB error deleting project:", err);
      return res.status(500).json({ success: false, message: "Failed to delete project" });
    }
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "Project not found" });

    res.json({ success: true, message: "Project deleted" });
  });
});

// ================= OG SHARE PREVIEW =================
// When a blog link is shared on WhatsApp / Twitter / LinkedIn / Telegram etc.,
// social crawlers hit this URL, read the OG meta tags, and render the preview card.
// Regular human visitors are instantly JS-redirected to the actual React blog page.
//
// Share URL format:  https://<your-backend-domain>/share/<permalink>
// Example:           https://api.geniemedia.in/share/services/my-blog-post
//
// In AdminBlogs.jsx the "Copy Share Link" button copies exactly this URL.

const escapeHtml = (str) =>
  String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

app.use("/share/", (req, res) => {
  const permalink = req.path.replace(/^\//, "");
  if (!permalink) return res.redirect("https://geniemedia.in");

  db.query(
    "SELECT title, metaDescription, image, permalink FROM blogs WHERE permalink = ?",
    [permalink],
    (err, result) => {
      if (err || result.length === 0) {
        return res.redirect("https://geniemedia.in/blog");
      }
      const blog        = result[0];
      const title       = escapeHtml(blog.title || "geniemedia Blog");
      const description = escapeHtml(blog.metaDescription || "Read this article on geniemedia");
      const image       = escapeHtml(blog.image || "https://geniemedia.in/og-default.jpg");
      const pageUrl     = `https://geniemedia.in/blog/${blog.permalink}`;

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:type"        content="article" />
  <meta property="og:title"       content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image"       content="${image}" />
  <meta property="og:image:width"  content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url"         content="${pageUrl}" />
  <meta property="og:site_name"   content="geniemedia" />
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image"       content="${image}" />
  <meta http-equiv="refresh" content="0;url=${pageUrl}" />
</head>
<body style="margin:0;background:#1a1a1a;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;">
  <div>
    <p style="font-size:14px;color:#aaa;margin-bottom:12px;">Redirecting you to the article…</p>
    <a href="${pageUrl}" style="color:#D4B49A;font-size:16px;font-weight:bold;">${title}</a>
  </div>
  <script>window.location.replace("${pageUrl}");</script>
</body>
</html>`);
    }
  );
});

// =========================================================================
// ================= SEO / AEO / GEO ROUTES ================================
// Sitemaps, robots.txt, llms.txt, the admin analysis endpoints, the
// slug-history 301s and the server-rendered blog <head> (Part 4 Option A).
//
// Mounted here, near the end, so it can never shadow an /api route above it,
// but BEFORE the SPA fallback below so /blog/<slug> is answered with an
// injected document rather than the untouched index.html.
//
// The old hand-rolled /blogs.xml handler lived here and has been replaced by
// services/sitemapService.js, which serves the same URL with correct lastmod
// values, image entries and cache invalidation on publish.
// =========================================================================
app.use("/", seoRoutes(db, verifyToken));

// ================= SPA FALLBACK (single-origin deployments) ==============
// Only active when the Vite build is reachable from this process — that is the
// case on a VPS where Node serves the site, and not on the current split
// deployment where Hostinger serves the static build and this API runs
// elsewhere. When it is not available every route below simply does not exist,
// which is why it is guarded rather than assumed.
const spaDist = htmlInjector.DIST_DIR;

if (spaDist) {
  // Hashed build assets are immutable by construction, so they get a one-year
  // cache. index.html explicitly does not — it has to be revalidated or a
  // deploy would not reach anyone still holding the old one.
  app.use(
    express.static(spaDist, {
      index: false,
      maxAge: "1y",
      setHeaders: (res, filePath) => {
        if (filePath.endsWith("index.html")) {
          res.setHeader("Cache-Control", "no-cache");
        }
      },
    })
  );

  app.get(/^\/(?!api\/|uploads\/|share\/).*/, (req, res, next) => {
    // Per-route title, description and canonical, so a crawler that never runs
    // the React bundle still gets the right metadata for /about, /services and
    // the rest instead of the generic site defaults on every URL.
    const meta = metaForRoute(req.path);

    const html = htmlInjector.renderSiteHtml({
      title: meta.title,
      description: meta.description,
      url: meta.canonical,
    });

    if (!html) return next();
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  });

  console.log(`🧭 Serving SPA from ${spaDist}`);
} else {
  console.log("🧭 SPA build not found next to the API — head injection is idle (split deployment).");
}

// ================= START =================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`👉 Open: http://localhost:${PORT}`);
});