#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const HTACCESS = path.join(ROOT, "dist", ".htaccess");

const readEnv = (name) => {
  if (process.env[name]) return process.env[name];
  for (const file of [".env"]) {
    const p = path.join(ROOT, file);
    if (!fs.existsSync(p)) continue;
    const m = fs.readFileSync(p, "utf8").match(new RegExp(`^${name}=(.*)$`, "m"));
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  }
  return "";
};

const DIST = path.join(ROOT, "dist");
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });

const CASE_STUDY_PLACEHOLDER = path.join(DIST, "case-studies", "none");
const placeholderHtml = `${CASE_STUDY_PLACEHOLDER}.html`;
if (fs.existsSync(placeholderHtml) && /<title>Page not found/.test(fs.readFileSync(placeholderHtml, "utf8"))) {
  for (const p of [CASE_STUDY_PLACEHOLDER, placeholderHtml, `${CASE_STUDY_PLACEHOLDER}.txt`]) fs.rmSync(p, { recursive: true, force: true });
  console.log("postbuild: no published case studies yet, placeholder page removed");
}

let prefetchCopies = 0;
if (fs.existsSync(DIST)) {
  for (const file of walk(DIST)) {
    const rel = path.relative(DIST, file).split(path.sep);
    if (rel[0] === "_next" || !file.endsWith(".txt")) continue;
    const i = rel.findIndex((part, idx) => idx < rel.length - 1 && part.startsWith("__next."));
    if (i < 0) continue;
    const flat = path.join(DIST, ...rel.slice(0, i), rel.slice(i).join("."));
    if (!fs.existsSync(flat)) {
      fs.copyFileSync(file, flat);
      prefetchCopies += 1;
    }
  }
}
console.log(`postbuild: ${prefetchCopies} prefetch file(s) copied to the names the browser requests`);

if (!fs.existsSync(HTACCESS)) {
  console.warn("postbuild: dist/.htaccess not found — skipping slug redirects.");
  process.exit(0);
}

const api = readEnv("NEXT_PUBLIC_API_BASE_URL").replace(/\/+$/, "");
let rules = [];
try {
  const res = await fetch(`${api}/seo/redirects.htaccess`, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  rules = text.split("\n").filter((l) => /^RewriteRule \^blog\/\S+ \/blog\/\S+ \[R=301,L\]$/.test(l.trim()));
} catch (err) {
  console.warn(`postbuild: could not fetch slug redirects (${err.message}); continuing without them.`);
}

const siteUrl = readEnv("NEXT_PUBLIC_SITE_URL").replace(/\/+$/, "");
if (!siteUrl) {
  console.error("postbuild: NEXT_PUBLIC_SITE_URL is not set in .env — cannot write dist/.htaccess.");
  process.exit(1);
}

const s = fs.readFileSync(HTACCESS, "utf8");
const block = ["  # BEGIN GENIE SLUG REDIRECTS", ...rules.map((r) => `  ${r.trim()}`), "  # END GENIE SLUG REDIRECTS"].join("\n");
fs.writeFileSync(
  HTACCESS,
  s.replace(/  # BEGIN GENIE SLUG REDIRECTS[\s\S]*?  # END GENIE SLUG REDIRECTS/, block).split("__SITE_URL__").join(siteUrl),
);
console.log(`postbuild: ${rules.length} retired blog slug redirect(s) and site URL ${siteUrl} written to dist/.htaccess`);

const SITEMAP = path.join(ROOT, "dist", "sitemap.xml");
const SITEMAP_PHP = path.join(ROOT, "dist", "sitemap.php");
if (fs.existsSync(SITEMAP) && fs.existsSync(SITEMAP_PHP)) {
  const full = fs.readFileSync(SITEMAP, "utf8");
  fs.writeFileSync(path.join(ROOT, "dist", "sitemap-static.xml"), full);
  const pagesOnly = full.replace(/<url>\s*<loc>[^<]*\/blog\/[^<]*<\/loc>[\s\S]*?<\/url>\s*/g, "");
  fs.writeFileSync(path.join(ROOT, "dist", "sitemap-pages.xml"), pagesOnly);

  if (!api) {
    console.error("postbuild: NEXT_PUBLIC_API_BASE_URL is not set in .env — cannot write dist/sitemap.php.");
    process.exit(1);
  }
  let php = fs.readFileSync(SITEMAP_PHP, "utf8");
  php = php.split("__API_BASE_URL__").join(api).split("__SITE_URL__").join(siteUrl);
  fs.writeFileSync(SITEMAP_PHP, php);
  const pageCount = (pagesOnly.match(/<url>/g) || []).length;
  console.log(`postbuild: live sitemap configured (${pageCount} fixed pages + published posts from ${api})`);
}

const DELETE_PHP = path.join(ROOT, "dist", "delete-upload.php");
if (fs.existsSync(DELETE_PHP)) {
  const secret = readEnv("UPLOAD_DELETE_SECRET");
  if (!/^[A-Za-z0-9]{32,}$/.test(secret)) {
    console.error("postbuild: UPLOAD_DELETE_SECRET in .env must be at least 32 letters/digits — cannot write dist/delete-upload.php.");
    process.exit(1);
  }
  fs.writeFileSync(DELETE_PHP, fs.readFileSync(DELETE_PHP, "utf8").split("__UPLOAD_DELETE_SECRET__").join(secret));
  console.log("postbuild: delete-upload.php configured");
}

const CONTACT_PHP = path.join(ROOT, "dist", "contact.php");
if (fs.existsSync(CONTACT_PHP)) {
  const values = {
    __CONTACT_TO_EMAIL__: readEnv("CONTACT_TO_EMAIL"),
    __CONTACT_FROM_EMAIL__: readEnv("CONTACT_FROM_EMAIL"),
    __SITE_URL__: siteUrl,
  };
  const missing = Object.entries(values).filter(([, v]) => !v).map(([k]) => k.replace(/^__|__$/g, ""));
  if (missing.length) {
    console.error(`postbuild: ${missing.join(", ")} not set in .env — cannot write dist/contact.php.`);
    process.exit(1);
  }
  let php = fs.readFileSync(CONTACT_PHP, "utf8");
  for (const [placeholder, value] of Object.entries(values)) {
    php = php.split(placeholder).join(value.replace(/\\/g, "\\\\").replace(/'/g, "\\'"));
  }
  fs.writeFileSync(CONTACT_PHP, php);
  console.log(`postbuild: contact.php configured (enquiries go to ${values.__CONTACT_TO_EMAIL__})`);
}
