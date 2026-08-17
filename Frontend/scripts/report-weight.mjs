// Reports what the browser actually downloads for a given route, grouped by
// resource type, with the wire size (post-compression) for text assets.
import puppeteer from 'puppeteer-core';
import { gzipSync } from 'node:zlib';

const BASE = process.argv[2] || 'http://localhost:5173';
const ROUTES = process.argv.slice(3).length ? process.argv.slice(3) : ['/'];
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });

for (const route of ROUTES) {
  for (const vp of [
    { width: 412, height: 823, label: 'mobile', deviceScaleFactor: 2, isMobile: true },
    { width: 1350, height: 940, label: 'desktop' },
  ]) {
    const page = await browser.newPage();
    await page.setViewport(vp);

    const seen = new Map();
    page.on('response', async (res) => {
      const url = res.url();
      if (seen.has(url) || url.startsWith('data:')) return;
      let raw = 0;
      try {
        const buf = await res.buffer();
        raw = buf.length;
        const type = res.request().resourceType();
        const compressible = ['document', 'script', 'stylesheet', 'xhr', 'fetch'].includes(type);
        seen.set(url, {
          type,
          raw,
          wire: compressible ? gzipSync(buf).length : raw,
          thirdParty: !url.includes('localhost'),
        });
      } catch {
        seen.set(url, { type: res.request().resourceType(), raw: 0, wire: 0, thirdParty: false });
      }
    });

    await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 45000 });
    await new Promise((r) => setTimeout(r, 1500));

    const groups = {};
    let totalRaw = 0;
    let totalWire = 0;
    let thirdPartyWire = 0;
    for (const r of seen.values()) {
      groups[r.type] ??= { count: 0, raw: 0, wire: 0 };
      groups[r.type].count++;
      groups[r.type].raw += r.raw;
      groups[r.type].wire += r.wire;
      totalRaw += r.raw;
      totalWire += r.wire;
      if (r.thirdParty) thirdPartyWire += r.wire;
    }

    const kb = (n) => `${String(Math.round(n / 1024)).padStart(5)} KB`;
    console.log(`\n### ${route}  [${vp.label}]   ${seen.size} requests`);
    for (const [type, g] of Object.entries(groups).sort((a, b) => b[1].wire - a[1].wire)) {
      console.log(`   ${type.padEnd(12)} x${String(g.count).padStart(2)}  raw ${kb(g.raw)}   wire ${kb(g.wire)}`);
    }
    console.log(`   ${'TOTAL'.padEnd(12)}      raw ${kb(totalRaw)}   wire ${kb(totalWire)}   (3rd-party ${kb(thirdPartyWire)})`);

    await page.close();
  }
}
await browser.close();
