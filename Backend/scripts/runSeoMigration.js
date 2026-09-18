/**
 * Runs the blog SEO schema migration on demand.
 *
 * The migration also runs automatically on every server boot, so this exists
 * for the cases where that is not good enough: verifying the result before a
 * deploy, running it against a staging database, or confirming what the live
 * table actually looks like after a deploy that logged an error.
 *
 * Safe to run repeatedly — it only adds what is missing.
 *
 *   npm run seo:migrate
 */

require("dotenv").config({ quiet: true });

const mysql = require("mysql2");
const { migrateBlogSeo, BLOG_SEO_COLUMNS } = require("../db/migrateBlogSeo");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 2,
});

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });

(async () => {
  try {
    console.log(`Database: ${process.env.DB_NAME} @ ${process.env.DB_HOST}\n`);

    const result = await migrateBlogSeo(db);

    if (result.error) {
      console.error("\n❌ Migration reported an error:", result.error);
      process.exitCode = 1;
    }

    const columns = await query(
      `SELECT COLUMN_NAME AS name, COLUMN_TYPE AS type, IS_NULLABLE AS nullable
         FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'blogs'`
    );

    const present = new Set(columns.map((c) => String(c.name).toLowerCase()));
    const missing = BLOG_SEO_COLUMNS.filter(([name]) => !present.has(name.toLowerCase()));

    console.log("\nSEO columns on `blogs`:");
    for (const [name] of BLOG_SEO_COLUMNS) {
      const col = columns.find((c) => String(c.name).toLowerCase() === name.toLowerCase());
      console.log(col ? `  ✅ ${name.padEnd(22)} ${col.type}` : `  ❌ ${name.padEnd(22)} MISSING`);
    }

    if (missing.length) {
      console.error(`\n❌ ${missing.length} column(s) could not be added. See the errors above.`);
      process.exitCode = 1;
    } else {
      console.log("\n✅ Schema is complete.");
    }

    const [counts] = await query(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN direct_answer IS NOT NULL AND direct_answer <> '' THEN 1 ELSE 0 END) AS with_answer,
              SUM(CASE WHEN alt_text IS NOT NULL AND alt_text <> '' THEN 1 ELSE 0 END) AS with_alt,
              SUM(CASE WHEN focus_keyword IS NOT NULL AND focus_keyword <> '' THEN 1 ELSE 0 END) AS with_keyword
         FROM blogs WHERE status = 'published'`
    );

    // Existing posts predate these fields, so they are all empty until someone
    // opens each post and fills the panel in. Worth stating plainly, because
    // the schema being correct does not mean the content is optimised.
    console.log("\nPublished posts still needing SEO fields:");
    console.log(`  Total published    : ${counts.total}`);
    console.log(`  Missing direct answer: ${counts.total - (counts.with_answer || 0)}`);
    console.log(`  Missing alt text     : ${counts.total - (counts.with_alt || 0)}`);
    console.log(`  Missing focus keyword: ${counts.total - (counts.with_keyword || 0)}`);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exitCode = 1;
  } finally {
    db.end();
  }
})();
