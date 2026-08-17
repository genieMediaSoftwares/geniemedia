// Prints the heading outline of a route so skipped levels can be located.
import puppeteer from 'puppeteer-core';

const BASE = process.argv[2];
const ROUTES = process.argv.slice(3);
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });

for (const route of ROUTES) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1350, height: 940 });
  await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise((r) => setTimeout(r, 1200));

  const outline = await page.evaluate(() =>
    [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => ({
      level: Number(h.tagName[1]),
      text: (h.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 55),
    }))
  );

  console.log(`\n### ${route}`);
  let prev = 0;
  for (const h of outline) {
    const skip = prev && h.level > prev + 1 ? '  <-- SKIP' : '';
    console.log(`  ${'  '.repeat(h.level - 1)}h${h.level}  ${h.text}${skip}`);
    prev = h.level;
  }
  await page.close();
}
await browser.close();
