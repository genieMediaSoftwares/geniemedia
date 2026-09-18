/**
 * Responsive layout audit, desktop through small phone.
 *
 * Checks the things that are invisible at whatever width you happen to have
 * your own browser open at:
 *
 *  1. Horizontal overflow — one element wider than the viewport makes the whole
 *     page scroll sideways, which feels broken even when nothing is cut off.
 *  2. Featured images being cropped — compares each image's rendered box
 *     against its natural dimensions and reports how much of the picture the
 *     visitor is actually being shown. This is the check that would have caught
 *     the 21:9 container slicing the caption row off a 16:9 cover.
 *  3. Content hidden behind the fixed navbar, which sits at z-50 over whatever
 *     the page puts at the top.
 *  4. Tap targets under 44x44, which is where a fingertip starts missing.
 *
 * Usage:
 *   node scripts/audit-responsive.mjs http://localhost:5000 /blogs /blog/<slug>
 */

import puppeteer from "puppeteer-core";

const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";

const BASE = process.argv[2] || "http://localhost:4173";
const ROUTES = process.argv.slice(3).length ? process.argv.slice(3) : ["/blogs"];

const VIEWPORTS = [
  { name: "1920 desktop", width: 1920, height: 1080 },
  { name: "1600 desktop", width: 1600, height: 900 },
  { name: "1440 laptop", width: 1440, height: 900 },
  { name: "1366 laptop", width: 1366, height: 768 },
  { name: "1280 laptop", width: 1280, height: 800 },
  { name: "1024 tablet", width: 1024, height: 768 },
  { name: "768 tablet", width: 768, height: 1024 },
  { name: "480 phone", width: 480, height: 854 },
  { name: "375 phone", width: 375, height: 812 },
  { name: "320 phone", width: 320, height: 640 },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox"],
});

let failures = 0;

for (const route of ROUTES) {
  const url = `${BASE}${route}`;
  console.log(`\n${"=".repeat(70)}\n${url}\n${"=".repeat(70)}`);

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({
      width: vp.width,
      height: vp.height,
      isMobile: vp.width < 768,
      deviceScaleFactor: 1,
    });

    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
      // The blog pages fetch their content, so give React time to paint it and
      // the images time to report their natural size.
      await new Promise((r) => setTimeout(r, 1500));

      const report = await page.evaluate((viewportWidth) => {
        // An element inside a deliberately scrollable strip (a swipeable filter
        // row, a wide table in its own scroller) is not a layout bug — the
        // container scrolls, the page does not.
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
          if (rect.right > viewportWidth + 2 || rect.left < -2) {
            overflowing.push({
              tag: el.tagName.toLowerCase(),
              cls: (el.className || "").toString().slice(0, 60),
              left: Math.round(rect.left),
              right: Math.round(rect.right),
            });
          }
        }

        // ---- Image cropping -------------------------------------------------
        // For object-fit: cover, the visible fraction is the ratio of the box's
        // aspect to the image's aspect (whichever way round is smaller). 1.0
        // means the whole picture is on screen.
        const images = [];
        for (const img of document.querySelectorAll("img")) {
          const rect = img.getBoundingClientRect();
          if (rect.width < 120 || rect.height < 80) continue;
          if (!img.naturalWidth || !img.naturalHeight) continue;

          const fit = getComputedStyle(img).objectFit;
          const boxRatio = rect.width / rect.height;
          const imgRatio = img.naturalWidth / img.naturalHeight;

          let visible = 1;
          if (fit === "cover") {
            visible = boxRatio > imgRatio ? imgRatio / boxRatio : boxRatio / imgRatio;
          } else if (fit === "fill") {
            visible = 1; // nothing lost, but distorted
          }

          images.push({
            src: img.currentSrc.split("/").pop().slice(0, 32),
            fit,
            box: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
            natural: `${img.naturalWidth}x${img.naturalHeight}`,
            boxRatio: boxRatio.toFixed(2),
            imgRatio: imgRatio.toFixed(2),
            visible: Math.round(visible * 100),
            distorted: fit === "fill",
          });
        }

        // ---- Fixed navbar covering content ---------------------------------
        let navBottom = 0;
        for (const el of document.querySelectorAll("header, nav")) {
          const s = getComputedStyle(el);
          if (s.position !== "fixed") continue;
          const r = el.getBoundingClientRect();
          if (r.top <= 1 && r.height > navBottom) navBottom = r.height;
        }

        const covered = [];
        if (navBottom > 0) {
          const interesting = document.querySelectorAll("h1, h2, article img, section > img, main img");
          for (const el of interesting) {
            const r = el.getBoundingClientRect();
            if (r.height === 0) continue;
            // Only the top of the document matters; further down the page the
            // navbar legitimately floats over things as you scroll.
            if (r.top < navBottom && r.bottom > 0 && r.top + window.scrollY < navBottom + 40) {
              covered.push({
                tag: el.tagName.toLowerCase(),
                top: Math.round(r.top),
                hidden: Math.round(Math.min(navBottom - r.top, r.height)),
              });
            }
          }
        }

        const smallTargets = [];
        for (const el of document.querySelectorAll("a, button, input, select, textarea")) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          if (r.width < 44 || r.height < 44) {
            smallTargets.push(`${el.tagName.toLowerCase()} ${Math.round(r.width)}x${Math.round(r.height)}`);
          }
        }

        return {
          docWidth: document.documentElement.scrollWidth,
          overflowing: overflowing.slice(0, 5),
          overflowCount: overflowing.length,
          images: images.slice(0, 4),
          navBottom: Math.round(navBottom),
          covered,
          smallTargetCount: smallTargets.length,
          smallTargets: smallTargets.slice(0, 4),
        };
      }, vp.width);

      const scrolls = report.docWidth > vp.width + 2;
      console.log(`\n  ${vp.name.padEnd(14)} (${vp.width}x${vp.height})`);
      console.log(`    ${scrolls ? "❌" : "✅"} No horizontal scroll (document ${report.docWidth}px)`);

      if (report.overflowCount) {
        console.log(`    ❌ ${report.overflowCount} element(s) past the viewport:`);
        for (const o of report.overflowing) console.log(`         <${o.tag}> ${o.left}→${o.right}  ${o.cls}`);
        failures += 1;
      }

      for (const img of report.images) {
        const ok = img.visible >= 99 && !img.distorted;
        const note = img.distorted
          ? "STRETCHED"
          : img.visible >= 99
          ? "whole image visible"
          : `${100 - img.visible}% of the picture is cropped away`;
        console.log(
          `    ${ok ? "✅" : "❌"} img ${img.box} (source ${img.natural}, ${img.fit}) — ${note}`
        );
        if (!ok) failures += 1;
      }

      if (report.covered.length) {
        console.log(`    ❌ navbar (${report.navBottom}px) covers:`);
        for (const c of report.covered) console.log(`         <${c.tag}> hidden by ${c.hidden}px`);
        failures += 1;
      } else if (report.navBottom) {
        console.log(`    ✅ Nothing hidden behind the ${report.navBottom}px navbar`);
      }

      if (report.smallTargetCount) {
        console.log(`    ⚠️  ${report.smallTargetCount} tap target(s) under 44px: ${report.smallTargets.join(", ")}`);
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

console.log(`\n${"=".repeat(70)}`);
console.log(failures === 0 ? "✅ No responsive failures." : `❌ ${failures} failure(s) reported above.`);
process.exit(failures === 0 ? 0 : 1);
