/**
 * Loads every public route of the production build in headless Chrome and
 * reports what a real browser sees: console errors, failed requests, the LCP
 * element, layout shift, transferred bytes and the accessibility basics that
 * Lighthouse checks (single <main>, one <h1>, images without dimensions,
 * controls without an accessible name).
 *
 * Run against a running `vite preview`:
 *   node scripts/verify-routes.mjs http://localhost:4321
 */
import puppeteer from 'puppeteer-core';

const BASE = process.argv[2] || 'http://localhost:4321';
const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROUTES = [
  '/', '/about', '/services', '/digital_marketing', '/web_development',
  '/production_house', '/podcast_studio', '/projects', '/reviews',
  '/contact', '/blogs', '/admin',
];

const VIEWPORTS = {
  mobile: { width: 412, height: 823, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desktop: { width: 1350, height: 940, deviceScaleFactor: 1 },
};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

let failures = 0;

for (const [label, viewport] of Object.entries(VIEWPORTS)) {
  console.log(`\n${'='.repeat(72)}\n  ${label.toUpperCase()}  (${viewport.width}x${viewport.height})\n${'='.repeat(72)}`);

  for (const route of ROUTES) {
    const page = await browser.newPage();
    await page.setViewport(viewport);

    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];
    let transferred = 0;

    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200));
    });
    page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 200)));
    page.on('requestfailed', (r) =>
      failedRequests.push(`${r.failure()?.errorText} ${r.url().slice(0, 120)}`)
    );
    page.on('response', async (r) => {
      const status = r.status();
      if (status >= 400) {
        failedRequests.push(`HTTP ${status} ${r.url().slice(0, 120)}`);
      }
      try {
        const len = r.headers()['content-length'];
        if (len) transferred += Number(len);
      } catch { /* body already gone */ }
    });

    await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 45000 });
    // Let lazy sections and the router settle.
    await new Promise((r) => setTimeout(r, 900));

    const audit = await page.evaluate(() => {
      const imgs = [...document.querySelectorAll('img')];
      const noDims = imgs.filter(
        (i) => !i.getAttribute('width') || !i.getAttribute('height')
      ).length;
      const noAlt = imgs.filter((i) => i.getAttribute('alt') === null).length;

      const namelessLinks = [...document.querySelectorAll('a')].filter((a) => {
        const text = (a.innerText || '').trim();
        return !text && !a.getAttribute('aria-label') && !a.getAttribute('title');
      }).length;

      const namelessControls = [...document.querySelectorAll('button,select,input,textarea')]
        .filter((el) => {
          if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')) return false;
          if (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) return false;
          if (el.closest('label')) return false;
          return !(el.innerText || '').trim();
        }).length;

      const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) =>
        Number(h.tagName[1])
      );
      let skips = 0;
      for (let i = 1; i < headings.length; i++) {
        if (headings[i] > headings[i - 1] + 1) skips++;
      }

      return {
        mains: document.querySelectorAll('main').length,
        h1s: document.querySelectorAll('h1').length,
        headingSkips: skips,
        imgs: imgs.length,
        noDims,
        noAlt,
        namelessLinks,
        namelessControls,
        iframes: document.querySelectorAll('iframe').length,
        rootChildren: document.getElementById('root')?.children.length ?? 0,
        bodyText: (document.body.innerText || '').trim().length,
      };
    });

    // Core Web Vitals, measured in-page.
    const vitals = await page.evaluate(
      () =>
        new Promise((resolve) => {
          const out = { lcp: 0, lcpEl: '', cls: 0 };
          try {
            new PerformanceObserver((list) => {
              const e = list.getEntries().at(-1);
              out.lcp = Math.round(e.startTime);
              out.lcpEl = e.element
                ? `${e.element.tagName.toLowerCase()}${e.element.className ? '.' + String(e.element.className).split(' ')[0] : ''}`
                : e.url?.slice(-40) || '';
            }).observe({ type: 'largest-contentful-paint', buffered: true });

            new PerformanceObserver((list) => {
              for (const e of list.getEntries()) if (!e.hadRecentInput) out.cls += e.value;
            }).observe({ type: 'layout-shift', buffered: true });
          } catch { /* unsupported */ }

          const fcp = performance.getEntriesByName('first-contentful-paint')[0];
          setTimeout(() => resolve({ ...out, cls: +out.cls.toFixed(4), fcp: Math.round(fcp?.startTime ?? 0) }), 600);
        })
    );

    const problems = [];
    if (audit.mains !== 1) problems.push(`main=${audit.mains}`);
    if (audit.h1s !== 1) problems.push(`h1=${audit.h1s}`);
    if (audit.headingSkips) problems.push(`headingSkips=${audit.headingSkips}`);
    if (audit.noDims) problems.push(`imgNoDims=${audit.noDims}`);
    if (audit.noAlt) problems.push(`imgNoAlt=${audit.noAlt}`);
    if (audit.namelessLinks) problems.push(`unnamedLinks=${audit.namelessLinks}`);
    if (audit.namelessControls) problems.push(`unnamedControls=${audit.namelessControls}`);
    if (audit.bodyText < 200) problems.push(`EMPTY PAGE (${audit.bodyText} chars)`);
    if (consoleErrors.length) problems.push(`consoleErrors=${consoleErrors.length}`);
    if (pageErrors.length) problems.push(`pageErrors=${pageErrors.length}`);
    if (failedRequests.length) problems.push(`failedReq=${failedRequests.length}`);
    if (problems.length) failures++;

    console.log(
      `${problems.length ? 'FAIL' : ' ok '} ${route.padEnd(20)} ` +
        `LCP ${String(vitals.lcp).padStart(5)}ms  FCP ${String(vitals.fcp).padStart(5)}ms  ` +
        `CLS ${String(vitals.cls).padEnd(7)} ` +
        `${String(Math.round(transferred / 1024)).padStart(5)}KB  ` +
        `imgs=${String(audit.imgs).padStart(2)} iframes=${audit.iframes}  ` +
        `[${vitals.lcpEl}]` +
        (problems.length ? `\n       ${problems.join(', ')}` : '')
    );
    for (const e of [...consoleErrors, ...pageErrors].slice(0, 4)) console.log(`         ! ${e}`);
    for (const r of failedRequests.slice(0, 4)) console.log(`         x ${r}`);

    await page.close();
  }
}

await browser.close();
console.log(`\n${failures ? `${failures} route/viewport combinations reported problems` : 'All routes clean'}`);
process.exit(failures ? 1 : 0);
