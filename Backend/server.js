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

app.use(cors(corsOptions));

// ✅ FIX 2: Respond to ALL preflight OPTIONS requests immediately.
// Express v5 dropped support for "*" and "(.*)" string wildcards in path-to-regexp v8,
// so we pass a RegExp directly to bypass that parser entirely.
app.options(/.*/, cors(corsOptions));

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
app.get("/", (req, res) => {
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
    let imageUrl = null;

    if (req.file) {
      // Upload temp file to Hostinger, get back full HTTPS URL
      imageUrl = await uploadToHostinger(req.file.path);
    }

    const sql = `
      INSERT INTO blogs 
      (title, permalink, metaDescription, description, category, image, keywords, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        req.body.title,
        req.body.permalink,
        req.body.metaDescription,
        req.body.description,
        req.body.category,
        imageUrl,
        req.body.keywords,
        req.body.status,
        Date.now(),
        Date.now(),
      ],
      (err) => {
        if (err) {
          console.error("DB error creating blog:", err);
          return res.status(500).json({ success: false, message: "Failed to create blog" });
        }
        res.json({ success: true, message: "Blog created" });
      }
    );
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ================= GET PUBLIC BLOGS =================
app.get("/api/blogs", (req, res) => {
  db.query("SELECT * FROM blogs WHERE status = 'published' ORDER BY createdAt DESC", (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to fetch blogs" });

    const blogs = results.map((blog) => ({
      ...blog,
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
      ...blog,
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

    const blog = { ...result[0], image: getImageUrl(result[0].image) };
    res.json(blog);
  });
});

// ================= UPDATE BLOG =================
app.put("/api/blogs/:id", verifyToken, upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const {
    title,
    permalink,
    metaDescription,
    description,
    category,
    keywords,
    status,
    existingImage, // ✅ sent by frontend when no new file is chosen — preserve current image
  } = req.body;

  try {
    let imageUrl;

    if (req.file) {
      // New file uploaded → send it to Hostinger upload.php, get full HTTPS URL
      imageUrl = await uploadToHostinger(req.file.path);
    } else if (existingImage && existingImage.trim() !== "") {
      // No new file, but frontend passed the current image URL → keep it
      imageUrl = existingImage.trim();
    } else {
      // No file, no existingImage → user intentionally removed the image
      imageUrl = null;
    }

    const sql = `
      UPDATE blogs SET
        title = ?,
        permalink = ?,
        metaDescription = ?,
        description = ?,
        category = ?,
        keywords = ?,
        status = ?,
        image = ?,
        updatedAt = ?
      WHERE id = ?
    `;

    const values = [
      title,
      permalink,
      metaDescription,
      description,
      category,
      keywords,
      status,
      imageUrl,
      Date.now(),
      id,
    ];

    db.query(sql, values, (err) => {
      if (err) {
        console.error("DB error updating blog:", err);
        return res.status(500).json({ success: false, message: "Failed to update blog" });
      }
      res.json({ success: true, message: "Blog updated" });
    });
  } catch (err) {
    console.error("Error updating blog:", err);
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

// ================= DYNAMIC BLOG SITEMAP =================
app.get("/blogs.xml", (req, res) => {
  const sql = `
    SELECT permalink, updatedAt 
    FROM blogs 
    WHERE status = 'published'
    ORDER BY updatedAt DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Sitemap DB Error:", err);
      return res.status(500).send("Error generating sitemap");
    }

    const baseUrl = "https://geniemedia.in";

    const urls = results.map((blog) => {
      // Convert timestamp → YYYY-MM-DD
      const lastmod = blog.updatedAt
        ? new Date(Number(blog.updatedAt)).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      return `
      <url>
        <loc>${baseUrl}/blog/${blog.permalink}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>`;
    }).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  });
});

// ================= START =================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`👉 Open: http://localhost:${PORT}`);
});