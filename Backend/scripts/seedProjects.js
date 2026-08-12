/**
 * ONE-TIME MIGRATION SCRIPT — not part of the running server.
 * =========================================================================
 * Moves the projects that used to be hardcoded inside
 *   Frontend/src/Pages/HomePage.jsx  and
 *   Frontend/src/components/ProjectsSection.jsx
 * into the `projects` database table, uploading each local asset image to
 * Hostinger so the public site keeps showing exactly the same portfolio
 * after the section becomes database-driven.
 *
 * Run once, from the Backend folder:
 *     npm run seed:projects
 *
 * Safe to re-run — it skips any project whose title already exists.
 * Add --dry-run to preview without uploading or writing anything.
 *
 * NOTE: this file intentionally keeps its own DB pool + uploader so that
 * nothing in server.js has to be exported or changed for a one-off task.
 * The uploader here does NOT delete the source file (those are repo assets).
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const mysql = require("mysql2/promise");

const DRY_RUN = process.argv.includes("--dry-run");
const UPLOAD_ENDPOINT = process.env.IMAGE_UPLOAD_URL || "https://geniemedia.in/upload.php";
const ASSETS_DIR = path.join(__dirname, "..", "..", "Frontend", "src", "assets");

/**
 * The portfolio exactly as it was hardcoded in the frontend.
 * `displayOrder` reproduces the order the site showed them in — the first six
 * are what the Home page portfolio grid rendered, the rest follow as they
 * appeared on the /projects page.
 */
const LEGACY_PROJECTS = [
  { title: "Meera Basu",                  asset: "meerabasuWebsite.png", projectUrl: "https://meerabasu.co.in/",             category: "E-Commerce",      displayOrder: 1 },
  { title: "Avantta Gems",                asset: "AvanttaGems.png",      projectUrl: "https://8z2bgt-68.myshopify.com/",     category: "E-Commerce",      displayOrder: 2 },
  { title: "KNS Metal Solutions",         asset: "knsMetals.png",        projectUrl: "https://knsmetalsolutions.com.au/",    category: "Web Development", displayOrder: 3 },
  { title: "Laserfold",                   asset: "LaserFold.png",        projectUrl: "https://laserfold.com.au/",            category: "Web Development", displayOrder: 4 },
  { title: "Nucon Aerospace - by Snapbrio", asset: "nuconaerospace.png", projectUrl: "https://www.nuconaerospace.com/",      category: "Web Development", displayOrder: 5 },
  { title: "Synergene - by Snapbrio",     asset: "synergeneapi.png",     projectUrl: "https://synergeneapi.com/",            category: "Web Development", displayOrder: 6 },
  { title: "GenieStudio",                 asset: "GenieStudio.png",      projectUrl: "https://geniestudio.in/",              category: "Web Development", displayOrder: 7 },
  { title: "Buildzone",                   asset: "buildzon.png",         projectUrl: "https://www.buildzonprojects.com/",    category: "Web Development", displayOrder: 8 },
  { title: "Vivodyne - by Snapbrio",      asset: "vivodyne.png",         projectUrl: "https://www.vivodyne.com//",           category: "Web Development", displayOrder: 9 },
  { title: "Decagon - by Snapbrio",       asset: "decagon.png",          projectUrl: "https://decagon.ai/",                  category: "Web Development", displayOrder: 10 },
  { title: "Freenome - by Snapbrio",      asset: "freenome.png",         projectUrl: "https://www.freenome.com/",            category: "Web Development", displayOrder: 11 },
];

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

// Uploads a repo asset to Hostinger and returns the public HTTPS URL.
// Unlike the server helper, this never deletes the source file.
async function uploadAsset(filePath) {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));

  const response = await axios.post(UPLOAD_ENDPOINT, formData, {
    headers: formData.getHeaders(),
    maxBodyLength: Infinity,
  });

  const url = response.data && response.data.url;
  if (!url || !/^https?:\/\/\S+$/i.test(String(url))) {
    throw new Error(`Upload host returned no usable URL: ${JSON.stringify(response.data)}`);
  }
  return String(url);
}

async function main() {
  console.log(`\n📦 Project migration${DRY_RUN ? " (DRY RUN — nothing will be written)" : ""}`);
  console.log(`   Upload endpoint: ${UPLOAD_ENDPOINT}`);
  console.log(`   Assets folder:   ${ASSETS_DIR}\n`);

  const missing = LEGACY_PROJECTS.filter((p) => !fs.existsSync(path.join(ASSETS_DIR, p.asset)));
  if (missing.length) {
    console.error("❌ Missing asset files — aborting:");
    missing.forEach((p) => console.error(`   • ${p.asset} (for "${p.title}")`));
    process.exit(1);
  }

  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await db.query(PROJECTS_TABLE_SQL);

    let created = 0;
    let skipped = 0;

    for (const project of LEGACY_PROJECTS) {
      const [rows] = await db.query("SELECT id FROM projects WHERE title = ? LIMIT 1", [project.title]);

      if (rows.length) {
        console.log(`⏭️  Skipped "${project.title}" — already in the database (id ${rows[0].id})`);
        skipped++;
        continue;
      }

      if (DRY_RUN) {
        console.log(`🔍 Would create "${project.title}" from ${project.asset}`);
        created++;
        continue;
      }

      const imageUrl = await uploadAsset(path.join(ASSETS_DIR, project.asset));
      const now = Date.now();

      await db.query(
        `INSERT INTO projects
         (title, description, category, image, projectUrl, status, displayOrder, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, 'published', ?, ?, ?)`,
        [
          project.title,
          null,
          project.category,
          imageUrl,
          project.projectUrl,
          project.displayOrder,
          now,
          now,
        ]
      );

      console.log(`✅ Created "${project.title}" → ${imageUrl}`);
      created++;
    }

    console.log(`\n🎉 Done — ${created} created, ${skipped} skipped.\n`);
  } finally {
    await db.end();
  }
}

main().catch((err) => {
  console.error("\n❌ Migration failed:", err.message);
  process.exit(1);
});
