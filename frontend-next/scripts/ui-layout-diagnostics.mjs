import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/Praveen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const browser = await chromium.launch({ executablePath: "C:/Users/Praveen/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe", headless: true });
for (const [route, width] of [["/podcast_studio", 768], ["/podcast_studio", 1024], ["/about", 320], ["/", 1024]]) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
  await page.route("**/*", (r) => !r.request().url().startsWith("http://127.0.0.1") && ["xhr", "fetch", "script", "media"].includes(r.request().resourceType()) ? r.abort() : r.continue());
  await page.goto(`http://127.0.0.1:5173${route}`);
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 10)); } scrollTo(0, 0); });
  await page.waitForTimeout(1400);
  console.log(JSON.stringify({ route, width, detail: await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    imageFacts: [...document.querySelectorAll("main img")].slice(0, 8).map((el) => ({ alt: el.alt, loaded: el.complete && el.naturalWidth > 0, opacity: getComputedStyle(el.parentElement).opacity, transform: getComputedStyle(el.parentElement).transform, src: el.getAttribute("src") })),
    overflow: [...document.querySelectorAll("main *")].flatMap((el) => {
      const r = el.getBoundingClientRect(), s = getComputedStyle(el);
      if (!r.width || !r.height || s.visibility === "hidden" || el.tagName === "svg" || el.closest("svg") || r.right <= innerWidth + 1 && r.left >= -1) return [];
      return [{ tag: el.tagName, text: el.textContent.trim().slice(0, 45), left: Math.round(r.left), right: Math.round(r.right), y: Math.round(r.y), classes: String(el.className).slice(0, 230) }];
    }).slice(0, 20),
    header: [...document.querySelectorAll("header a")].filter((el) => el.getBoundingClientRect().width).map((el) => ({ text: el.textContent.trim(), x: Math.round(el.getBoundingClientRect().x), width: Math.round(el.getBoundingClientRect().width), height: Math.round(el.getBoundingClientRect().height) })),
  })) }, null, 2));
  await page.close();
}
await browser.close();
