/**
 * Mobile layout audit.
 *
 * Checks the two things that actually break a page on a phone and are invisible
 * on a desktop monitor:
 *
 *  1. Horizontal overflow — any element wider than the viewport makes the whole
 *     page scroll sideways, which feels broken even when nothing is cut off.
 *  2. Tap targets under 44x44 CSS pixels, which is the size below which a
 *     finger starts missing them.
 *
 * It also reports how far down the page the first heading sits, since a hero
 * image that eats the whole screen is a real usability problem that no overflow
 * check would catch.
 *
 * Usage:
 *   node scripts/audit-mobile.mjs http://localhost:4173 / /blogs /blog/<slug>
 */

import puppeteer from "puppeteer-core";

const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";

const BASE = process.argv[2] || "http://localhost:4173";
const ROUTES = process.argv.slice(3).length ? process.argv.slice(3) : ["/", "/blogs"];

// iPhone SE is the narrowest screen still in meaningful use; Pixel-ish covers
// the common Android width. If it works at 320 it works everywhere.
const VIEWPORTS = [
  { name: "320px (small phone)", width: 320, height: 640 },
  { name: "390px (iPhone)", width: 390, height: 844 },
  { name: "768px (tablet)", width: 768, height: 1024 },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox"],
});

let failures = 0;

for (const route of ROUTES) {
  const url = `${BASE}${route}`;
  console.log(`\n${"=".repeat(64)}\n${url}\n${"=".repeat(64)}`);

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.width < 768, deviceScaleFactor: 2 });

    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
      // The blog pages fetch their content, so give React a moment to paint it.
      await new Promise((r) => setTimeout(r, 1200));

      const report = await page.evaluate((viewportWidth) => {
        const docWidth = document.documentElement.scrollWidth;

        // Elements that stick out past the viewport. Fixed-position elements are
        // skipped: they are positioned against the viewport deliberately and do
        // not contribute to document scroll width.
        // An element inside a deliberately scrollable strip (a swipeable filter
        // row, a wide table in its own scroller) is not a layout bug — the
        // container scrolls, the page does not. Those are skipped.
        const inScroller = (el) => {
          let node = el.parentElement;
          while (node && node !== document.body) {
            const s = getComputedStyle(node);
            if (s.overflowX === "auto" || s.overflowX === "scroll") return true;
            node = node.parentElement;
          }
          return false;
        };

        const overflowing = [];
        for (const el of document.querySelectorAll("body *")) {
          const style = getComputedStyle(el);
          if (style.position === "fixed" || style.display === "none" || style.visibility === "hidden") continue;
          if (inScroller(el)) continue;

          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;

          // A couple of pixels of rounding is not worth reporting.
          if (rect.right > viewportWidth + 2 || rect.left < -2) {
            overflowing.push({
              tag: el.tagName.toLowerCase(),
              cls: (el.className || "").toString().slice(0, 70),
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
            });
          }
        }

        // Tap targets. Only visible, on-screen controls count.
        const smallTargets = [];
        for (const el of document.querySelectorAll("a, button, input, select, textarea, [role=button]")) {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;
          if (rect.bottom < 0 || rect.top > document.documentElement.scrollHeight) continue;
          if (rect.width < 44 || rect.height < 44) {
            smallTargets.push({
              tag: el.tagName.toLowerCase(),
              text: (el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 30),
              size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
            });
          }
        }

        const h1 = document.querySelector("h1");
        const h1Top = h1 ? Math.round(h1.getBoundingClientRect().top + window.scrollY) : null;

        return {
          docWidth,
          overflowing: overflowing.slice(0, 8),
          overflowCount: overflowing.length,
          smallTargets: smallTargets.slice(0, 6),
          smallTargetCount: smallTargets.length,
          h1Top,
          h1Text: h1 ? h1.innerText.trim().slice(0, 50) : null,
        };
      }, vp.width);

      const scrolls = report.docWidth > vp.width + 2;
      console.log(`\n  ${vp.name}`);
      console.log(`    ${scrolls ? "❌" : "✅"} Horizontal scroll: document is ${report.docWidth}px wide`);

      if (report.overflowCount) {
        console.log(`    ⚠️  ${report.overflowCount} element(s) extend past the viewport:`);
        for (const o of report.overflowing) {
          console.log(`         <${o.tag}> ${o.left}→${o.right}px  ${o.cls}`);
        }
        failures += 1;
      }

      if (report.smallTargetCount) {
        console.log(`    ⚠️  ${report.smallTargetCount} tap target(s) under 44px:`);
        for (const t of report.smallTargets) {
          console.log(`         <${t.tag}> ${t.size}  "${t.text}"`);
        }
      }

      if (report.h1Top !== null) {
        const flag = report.h1Top > vp.height ? "⚠️ " : "✅";
        console.log(`    ${flag} First heading at ${report.h1Top}px ("${report.h1Text}")`);
      }

      if (scrolls) failures += 1;
    } catch (err) {
      console.log(`\n  ${vp.name}\n    ❌ ${err.message}`);
      failures += 1;
    } finally {
      await page.close();
    }
  }
}

await browser.close();

console.log(`\n${"=".repeat(64)}`);
console.log(failures === 0 ? "✅ No mobile layout failures." : `⚠️  ${failures} issue group(s) reported above.`);
process.exit(0);
