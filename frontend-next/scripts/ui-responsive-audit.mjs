import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/Praveen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "audits", "ui-alignment");
const motion = process.argv.includes("--motion");
const label = motion ? "after-motion" : process.argv.includes("--after") ? "after" : "before";
const baseline = JSON.parse(fs.readFileSync(path.join(output, "preservation-baseline.json"), "utf8"));
const routes = Object.entries(baseline.pages)
  .filter(([file]) => !/^(admin(?:\/|\.)|404\.|_not-found\.|blog-view\.|case-study-view\.)/.test(file))
  .map(([file]) => file === "index.html" ? "/" : `/${file.slice(0, -5)}`)
  .filter((route) => !motion || ["/", "/about", "/podcast_studio", "/services", "/contact", "/web_development"].includes(route));
const widths = [320, 375, 425, 768, 1024, 1440, 1920];
const selected = new Set(["/", "/services", "/about", "/contact", "/web_development", "/podcast_studio", "/digital_marketing", "/production_house", "/projects", "/blogs", "/digital_marketing/aeo", "/web_development/react-native"]);
fs.mkdirSync(path.join(output, label), { recursive: true });
const browser = await chromium.launch({ executablePath: "C:/Users/Praveen/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe", headless: true });
const results = [];
const run = async (width, route) => {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: motion ? "no-preference" : "reduce" });
  await context.route("**/*", async (requestRoute) => {
    const request = requestRoute.request();
    const url = request.url();
    if (!url.startsWith("http://127.0.0.1:5173") && ["fetch", "xhr", "script", "media"].includes(request.resourceType())) return requestRoute.abort();
    return requestRoute.continue();
  });
  const page = await context.newPage();
  const errors = [];
  const missingAssets = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => { if (response.status() >= 400 && response.url().startsWith("http://127.0.0.1:5173/_next")) missingAssets.push(response.url()); });
  const start = Date.now();
  try {
    const response = await page.goto(`http://127.0.0.1:5173${route}`, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(motion ? 1600 : 650);
    const metrics = await page.evaluate(() => {
      const viewport = innerWidth;
      const visible = (el) => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
      const clipped = (el) => {
        for (let ancestor = el.parentElement; ancestor && ancestor !== document.body; ancestor = ancestor.parentElement) {
          if (["auto", "scroll"].includes(getComputedStyle(ancestor).overflowX)) return true;
          if (ancestor.matches("[aria-hidden='true']")) return true;
        }
        return false;
      };
      const outliers = [...document.querySelectorAll("h1,h2,h3,button,input,select,textarea,header a")].filter(visible).filter((el) => !clipped(el)).flatMap((el) => {
        const r = el.getBoundingClientRect();
        if (r.left >= -1 && r.right <= viewport + 1) return [];
        return [{ tag: el.tagName, text: (el.textContent || el.getAttribute("aria-label") || el.name || "").trim().slice(0, 80), left: Math.round(r.left), right: Math.round(r.right), classes: String(el.className).slice(0, 180) }];
      });
      const h1 = document.querySelector("main h1")?.getBoundingClientRect();
      const header = document.querySelector("header")?.getBoundingClientRect();
      const nav = [...document.querySelectorAll("header > div > div > nav")].find(visible);
      const buttons = [...document.querySelectorAll("header a")].filter(visible);
      const overlap = nav && buttons.some((el) => {
        if (nav.contains(el)) return false;
        const a = nav.getBoundingClientRect(), b = el.getBoundingClientRect();
        return a.left < b.right - 2 && a.right > b.left + 2 && a.top < b.bottom - 2 && a.bottom > b.top + 2;
      });
      const images = [...document.querySelectorAll("img")].filter(visible);
      const resourceBytes = performance.getEntriesByType("resource").reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
      return { scrollWidth: document.documentElement.scrollWidth, viewport, overflow: document.documentElement.scrollWidth > viewport + 1, outliers, headerOverlap: Boolean(overlap), headingUnderHeader: Boolean(h1 && header && h1.top < header.bottom - 1), h1Count: document.querySelectorAll("main h1").length, imageCount: images.length, resourceBytes, loadMs: Math.round(performance.getEntriesByType("navigation")[0]?.domContentLoadedEventEnd || 0) };
    });
    if (selected.has(route) && [375, 1024, 1440].includes(width)) {
      await page.screenshot({ path: path.join(output, label, `${route === "/" ? "home" : route.slice(1).replaceAll("/", "-")}-${width}.png`), fullPage: true });
    }
    results.push({ route, width, status: response.status(), elapsedMs: Date.now() - start, ...metrics, errors, missingAssets });
  } catch (error) { results.push({ route, width, failure: error.message }); }
  await context.close();
};
try {
  for (const width of widths) {
    let cursor = 0;
    await Promise.all(Array.from({ length: 4 }, async () => { while (cursor < routes.length) await run(width, routes[cursor++]); }));
    const rows = results.filter((row) => row.width === width);
    console.log(`${label}: ${width}px — ${rows.length} pages; ${rows.filter((row) => row.overflow || row.headerOverlap || row.headingUnderHeader || row.outliers?.length || row.failure).length} layout findings`);
    fs.writeFileSync(path.join(output, `responsive-${label}.json`), JSON.stringify(results, null, 2));
  }
} finally { await browser.close(); }
const problems = results.filter((row) => row.overflow || row.headerOverlap || row.headingUnderHeader || row.outliers?.length || row.failure);
console.log(JSON.stringify({ checks: results.length, routes: routes.length, findings: problems.length, issues: problems.map(({ route, width, overflow, headerOverlap, headingUnderHeader, outliers, failure }) => ({ route, width, overflow, headerOverlap, headingUnderHeader, outliers, failure })) }, null, 2));
