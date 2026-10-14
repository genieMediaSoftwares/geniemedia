import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "audits", "ui-alignment");
fs.mkdirSync(output, { recursive: true });
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const file = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});
const counts = (items) => items.reduce((all, value) => { all[value] = (all[value] || 0) + 1; return all; }, {});
const normalise = (value) => String(value).replace(/\s+/g, " ").trim();
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const isColorToken = (token) => !token.includes("[") || /#[\da-fA-F]{3,8}|rgba?\(|hsla?\(|(?:linear|radial)-gradient\(/.test(token);
function snapshot() {
  const pages = {};
  for (const file of walk(path.join(root, "dist")).filter((p) => p.endsWith(".html") && !p.includes(`${path.sep}_next${path.sep}`))) {
    const doc = new JSDOM(fs.readFileSync(file, "utf8")).window.document;
    const clone = doc.body.cloneNode(true);
    clone.querySelectorAll("script,style,noscript,next-route-announcer").forEach((el) => el.remove());
    const nodes = [];
    const visit = (node) => {
      if (node.nodeType === 3 && normalise(node.textContent)) nodes.push(normalise(node.textContent));
      node.childNodes.forEach(visit);
    };
    visit(clone);
    pages[path.relative(path.join(root, "dist"), file).replaceAll(path.sep, "/")] = {
      text: counts(nodes),
      headings: counts([...doc.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((el) => `${el.tagName}:${normalise(el.textContent)}`)),
      links: counts([...doc.querySelectorAll("a[href]")].map((el) => el.getAttribute("href"))),
      media: counts([...doc.querySelectorAll("img,video,source,iframe")].map((el) => JSON.stringify([el.tagName, el.getAttribute("src"), el.getAttribute("srcset"), el.getAttribute("alt"), el.getAttribute("poster")]))),
      fields: counts([...doc.querySelectorAll("input,textarea,select,form")].map((el) => JSON.stringify([el.tagName, el.getAttribute("name"), el.getAttribute("type"), el.getAttribute("required"), el.getAttribute("action")]))),
      metadata: [doc.title, ...[...doc.querySelectorAll("meta[name='description'],meta[name='robots'],link[rel='canonical']")].map((el) => el.outerHTML)],
      schema: [...doc.querySelectorAll("script[type='application/ld+json']")].map((el) => JSON.parse(el.textContent)),
    };
  }
  const sourceColors = {};
  const pattern = /(?:[\w:[\]()./!&=-]*:)?!?(?:bg|text|border|ring|outline|fill|stroke|from|via|to|shadow)-(?:\[[^\s"'`]+\]|(?:orange|gray|slate|red|green|blue|yellow|white|black|transparent|current|inherit)(?:-\d{2,3})?(?:\/\d+)?)(?=[\s"'`}]|$)/g;
  for (const file of walk(path.join(root, "src")).filter((p) => /\.(tsx?|css)$/.test(p))) {
    sourceColors[path.relative(root, file).replaceAll(path.sep, "/")] = counts(fs.readFileSync(file, "utf8").match(pattern) || []);
  }
  const assets = Object.fromEntries(["robots.txt", "sitemap.xml", ".htaccess", "llms.txt"].map((name) => [name, hash(fs.readFileSync(path.join(root, "dist", name)))]));
  return { capturedAt: new Date().toISOString(), pages, sourceColors, assets, tailwindConfig: hash(fs.readFileSync(path.join(root, "tailwind.config.ts"))) };
}
const baselineFile = path.join(output, "preservation-baseline.json");
if (process.argv.includes("--capture")) {
  if (fs.existsSync(baselineFile)) throw new Error("Baseline already exists; do not overwrite it during this task");
  const baseline = snapshot();
  fs.writeFileSync(baselineFile, JSON.stringify(baseline, null, 2));
  console.log(`Recorded ${Object.keys(baseline.pages).length} exported pages, source color utilities, SEO assets and Tailwind configuration.`);
} else {
  const before = JSON.parse(fs.readFileSync(baselineFile, "utf8"));
  const after = snapshot();
  const problems = [];
  for (const [file, page] of Object.entries(before.pages)) {
    const current = after.pages[file];
    if (!current) { problems.push(`${file}: route removed`); continue; }
    for (const field of ["text", "headings", "links", "media", "fields"]) {
      for (const [item, count] of Object.entries(page[field])) if ((current[field][item] || 0) < count) problems.push(`${file}: ${field} removed: ${item.slice(0, 120)}`);
    }
    for (const field of ["metadata", "schema"]) if (JSON.stringify(page[field]) !== JSON.stringify(current[field])) problems.push(`${file}: ${field} changed`);
  }
  for (const [file, tokens] of Object.entries(before.sourceColors)) {
    for (const [token, count] of Object.entries(tokens).filter(([token]) => isColorToken(token))) {
      if ((after.sourceColors[file]?.[token] || 0) < count) problems.push(`${file}: original color utility removed: ${token}`);
    }
  }
  for (const name of Object.keys(before.assets)) if (before.assets[name] !== after.assets[name]) problems.push(`${name}: SEO asset changed`);
  if (before.tailwindConfig !== after.tailwindConfig) problems.push("Tailwind configuration changed");
  fs.writeFileSync(path.join(output, "preservation-result.json"), JSON.stringify({ pages: Object.keys(before.pages).length, problems }, null, 2));
  console.log(`Preservation check: ${Object.keys(before.pages).length} routes, ${problems.length} differences.`);
  problems.forEach((problem) => console.log(problem));
  if (problems.length) process.exitCode = 1;
}
