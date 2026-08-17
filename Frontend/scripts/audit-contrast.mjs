// Finds real WCAG AA contrast failures on rendered pages, using the same
// thresholds axe-core / Lighthouse apply (4.5:1 normal text, 3:1 large text).
import puppeteer from 'puppeteer-core';

const BASE = process.argv[2];
const ROUTES = process.argv.slice(3);
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });

const findings = new Map();

for (const route of ROUTES) {
  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 823, deviceScaleFactor: 2, isMobile: true });
  await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise((r) => setTimeout(r, 1200));

  const results = await page.evaluate(() => {
    const lum = ([r, g, b]) => {
      const f = (c) => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const ratio = (a, b) => {
      const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
      return (l1 + 0.05) / (l2 + 0.05);
    };
    const parse = (c) => {
      const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
      return m ? { rgb: [+m[1], +m[2], +m[3]], a: m[4] === undefined ? 1 : +m[4] } : null;
    };

    // Walks up for the first opaque background.
    const bgOf = (el) => {
      let node = el;
      while (node && node !== document.documentElement) {
        const s = getComputedStyle(node);
        const c = parse(s.backgroundColor);
        if (c && c.a >= 0.9) return c.rgb;
        // A background image means we cannot reason about it reliably.
        if (s.backgroundImage && s.backgroundImage !== 'none') return null;
        node = node.parentElement;
      }
      return [255, 255, 255];
    };

    const out = [];
    for (const el of document.querySelectorAll('*')) {
      // Only elements whose own direct text is visible.
      const text = [...el.childNodes]
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent.trim())
        .join(' ')
        .trim();
      if (!text) continue;

      const s = getComputedStyle(el);
      if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity === 0) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if (s.webkitTextFillColor === 'rgba(0, 0, 0, 0)') continue; // gradient text

      const fg = parse(s.color);
      const bg = bgOf(el);
      if (!fg || !bg || fg.a < 0.9) continue;

      const size = parseFloat(s.fontSize);
      const weight = parseInt(s.fontWeight, 10) || 400;
      const isLarge = size >= 24 || (size >= 18.66 && weight >= 700);
      const required = isLarge ? 3 : 4.5;
      const got = ratio(fg.rgb, bg);

      if (got < required) {
        const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
        out.push({
          text: text.slice(0, 42),
          fg: hex(fg.rgb),
          bg: hex(bg),
          ratio: +got.toFixed(2),
          required,
          size: Math.round(size),
          weight,
          cls: String(el.className || '').split(/\s+/).slice(0, 4).join(' '),
        });
      }
    }
    return out;
  });

  for (const f of results) {
    const key = `${f.fg}|${f.bg}|${f.size}|${f.weight}`;
    if (!findings.has(key)) findings.set(key, { ...f, routes: new Set(), samples: new Set() });
    findings.get(key).routes.add(route);
    findings.get(key).samples.add(f.text);
  }
  await page.close();
}
await browser.close();

const sorted = [...findings.values()].sort((a, b) => a.ratio - b.ratio);
if (!sorted.length) console.log('No WCAG AA contrast failures found.');
for (const f of sorted) {
  console.log(
    `${String(f.ratio).padStart(5)}:1 (need ${f.required})  ${f.fg} on ${f.bg}  ` +
      `${f.size}px/${f.weight}  [${[...f.routes].join(',')}]\n` +
      `             e.g. "${[...f.samples].slice(0, 2).join('" / "')}"   .${f.cls}`
  );
}
