/**
 * Idempotent schema migration that adds the SEO / AEO / GEO columns to `blogs`.
 *
 * Why a runtime migration instead of a .sql file someone runs by hand:
 * the app is deployed to hosts where there is no shell step between `git push`
 * and `node server.js`. Anything that has to be remembered will eventually be
 * forgotten, and a missing column here means every blog write starts failing in
 * production. So this runs on boot, checks what already exists, and adds only
 * what is missing.
 *
 * `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` is deliberately NOT used: it is a
 * MariaDB extension and is a syntax error on MySQL 8. Instead every column is
 * checked against information_schema first, which behaves identically on both.
 */

// Column definitions, in the order they should be appended to the table.
// The DDL fragment is applied verbatim after `ADD COLUMN <name>`.
const BLOG_SEO_COLUMNS = [
  // ---- Core SERP metadata -------------------------------------------------
  ["meta_title", "VARCHAR(60) NULL"],
  ["focus_keyword", "VARCHAR(100) NULL"],
  ["secondary_keywords", "JSON NULL"],
  ["canonical_url", "VARCHAR(255) NULL"],
  [
    "robots_directive",
    "ENUM('index,follow','noindex,follow','noindex,nofollow') NOT NULL DEFAULT 'index,follow'",
  ],

  // ---- Structured data ----------------------------------------------------
  [
    "schema_type",
    "ENUM('Article','BlogPosting','FAQPage','HowTo','NewsArticle') NOT NULL DEFAULT 'BlogPosting'",
  ],
  ["faq_schema", "JSON NULL"],

  // ---- AEO: the extractable one-paragraph answer --------------------------
  ["direct_answer", "TEXT NULL"],

  // ---- GEO: attributed, quotable facts ------------------------------------
  ["key_facts", "JSON NULL"],
  ["definitions", "JSON NULL"],

  // ---- Imagery ------------------------------------------------------------
  ["og_image_url", "VARCHAR(255) NULL"],
  ["alt_text", "VARCHAR(200) NULL"],

  // ---- E-E-A-T ------------------------------------------------------------
  ["author_id", "INT NULL"],
  ["author_name", "VARCHAR(150) NULL"],
  ["author_bio", "TEXT NULL"],

  // A named reviewer who is not the author is a separate, stronger credibility
  // signal than authorship alone, and schema.org models it separately too
  // (`editor` alongside `author` on an Article). It matters most for advice
  // content, where "who checked this" is the question a reader actually has.
  ["reviewer_name", "VARCHAR(150) NULL"],
  ["reviewer_role", "VARCHAR(100) NULL"],
  ["reviewed_at", "TIMESTAMP NULL DEFAULT NULL"],

  // ---- Local relevance ----------------------------------------------------
  // The cities or regions a post is written for. Emitted as areaServed so a
  // search for "<service> near me" in one of those places can match the post.
  ["areas_covered", "JSON NULL"],

  // ---- Derived / auto-calculated -----------------------------------------
  ["reading_time_minutes", "INT NULL"],
  ["word_count", "INT NULL"],
  ["last_modified_at", "TIMESTAMP NULL DEFAULT NULL"],

  // ---- Link graph ---------------------------------------------------------
  ["internal_links", "JSON NULL"],
  ["slug_history", "JSON NULL"],
];

// Indexes that make the sitemap, redirect lookup and admin filters cheap.
const BLOG_SEO_INDEXES = [
  ["idx_blogs_permalink", "(permalink)"],
  ["idx_blogs_status_modified", "(status, last_modified_at)"],
];

const AUTHORS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS blog_authors (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(150) NOT NULL,
    slug       VARCHAR(150) NOT NULL,
    job_title  VARCHAR(150) NULL,
    bio        TEXT         NULL,
    avatar_url VARCHAR(500) NULL,
    profile_url VARCHAR(500) NULL,
    same_as    JSON         NULL,
    createdAt  BIGINT       NULL,
    updatedAt  BIGINT       NULL,
    UNIQUE KEY uniq_blog_authors_slug (slug)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`;

/**
 * JSON is a native type on MySQL 5.7+/MariaDB 10.2+. On anything older the
 * CREATE/ALTER fails, and the honest fallback is LONGTEXT — the application
 * always reads and writes these columns as JSON strings anyway, so behaviour is
 * identical apart from server-side validation.
 */
const downgradeJsonType = (ddl) => ddl.replace(/\bJSON\b/g, "LONGTEXT");

const query = (db, sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)));
  });

const listExistingColumns = async (db, table) => {
  const rows = await query(
    db,
    `SELECT COLUMN_NAME AS name
       FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table]
  );
  return new Set(rows.map((r) => String(r.name).toLowerCase()));
};

const listExistingIndexes = async (db, table) => {
  const rows = await query(
    db,
    `SELECT DISTINCT INDEX_NAME AS name
       FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table]
  );
  return new Set(rows.map((r) => String(r.name).toLowerCase()));
};

const tableExists = async (db, table) => {
  const rows = await query(
    db,
    `SELECT COUNT(*) AS n
       FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table]
  );
  return Number(rows[0] && rows[0].n) > 0;
};

/**
 * Adds every missing SEO column to `blogs`, creates the author table and the
 * supporting indexes.
 *
 * Never throws: a migration problem must not stop the server from booting and
 * taking the rest of the site down with it. It logs loudly instead, and the
 * write paths all treat the new columns as optional.
 */
async function migrateBlogSeo(db) {
  try {
    if (!(await tableExists(db, "blogs"))) {
      console.log("ℹ️  SEO migration skipped — `blogs` table does not exist yet.");
      return { skipped: true };
    }

    const existing = await listExistingColumns(db, "blogs");
    const added = [];

    for (const [name, ddl] of BLOG_SEO_COLUMNS) {
      if (existing.has(name.toLowerCase())) continue;
      try {
        await query(db, `ALTER TABLE blogs ADD COLUMN \`${name}\` ${ddl}`);
        added.push(name);
      } catch (err) {
        // Older engine without native JSON — retry the same column as LONGTEXT.
        if (/\bJSON\b/.test(ddl)) {
          try {
            await query(db, `ALTER TABLE blogs ADD COLUMN \`${name}\` ${downgradeJsonType(ddl)}`);
            added.push(`${name} (as LONGTEXT)`);
            continue;
          } catch (retryErr) {
            console.log(`❌ SEO migration: could not add \`${name}\`:`, retryErr.message);
            continue;
          }
        }
        console.log(`❌ SEO migration: could not add \`${name}\`:`, err.message);
      }
    }

    // Backfill last_modified_at from the existing epoch-millisecond updatedAt so
    // sitemap <lastmod> and schema dateModified are correct for older posts
    // instead of all reading "never modified".
    if (added.some((c) => c.startsWith("last_modified_at"))) {
      try {
        await query(
          db,
          `UPDATE blogs
              SET last_modified_at = FROM_UNIXTIME(COALESCE(updatedAt, createdAt) / 1000)
            WHERE last_modified_at IS NULL
              AND COALESCE(updatedAt, createdAt) IS NOT NULL`
        );
      } catch (err) {
        console.log("⚠️  SEO migration: last_modified_at backfill skipped:", err.message);
      }
    }

    const indexes = await listExistingIndexes(db, "blogs");
    for (const [name, cols] of BLOG_SEO_INDEXES) {
      if (indexes.has(name.toLowerCase())) continue;
      try {
        await query(db, `ALTER TABLE blogs ADD INDEX \`${name}\` ${cols}`);
      } catch (err) {
        // A duplicate or unsupported index is not worth failing a boot over.
        console.log(`⚠️  SEO migration: index ${name} skipped:`, err.message);
      }
    }

    try {
      await query(db, AUTHORS_TABLE_SQL);
    } catch (err) {
      try {
        await query(db, downgradeJsonType(AUTHORS_TABLE_SQL));
      } catch (retryErr) {
        console.log("⚠️  SEO migration: blog_authors table skipped:", retryErr.message);
      }
    }

    if (added.length) console.log(`✅ blogs SEO columns added: ${added.join(", ")}`);
    else console.log("✅ blogs SEO columns already present");

    return { added };
  } catch (err) {
    console.log("❌ SEO migration failed (server continues):", err.message);
    return { error: err.message };
  }
}

/**
 * The set of columns `blogs` actually has, cached after boot.
 *
 * Every write path filters its payload through this. If one ALTER failed — an
 * old engine, a permissions problem, a column the migration could not add — the
 * app keeps working with the columns that did land instead of every single save
 * failing on "Unknown column". Degrading is the right behaviour here: a post
 * saved without its FAQ column is recoverable, a blog admin that cannot save
 * anything is not.
 */
let blogColumnCache = null;

async function loadBlogColumns(db) {
  try {
    blogColumnCache = await listExistingColumns(db, "blogs");
  } catch (err) {
    console.log("⚠️  Could not read blogs columns:", err.message);
    blogColumnCache = null;
  }
  return blogColumnCache;
}

/** True when the column exists, and true when the cache is unavailable. */
const hasBlogColumn = (name) =>
  blogColumnCache === null ? true : blogColumnCache.has(String(name).toLowerCase());

/** Keeps only the entries of `values` whose column exists. */
const filterToExistingColumns = (values) => {
  const out = {};
  for (const [key, value] of Object.entries(values)) {
    if (hasBlogColumn(key)) out[key] = value;
  }
  return out;
};

module.exports = {
  migrateBlogSeo,
  loadBlogColumns,
  hasBlogColumn,
  filterToExistingColumns,
  BLOG_SEO_COLUMNS,
};
