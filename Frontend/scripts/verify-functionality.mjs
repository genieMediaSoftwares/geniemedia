// Functional checks on the behaviours this optimisation pass changed:
// the click-to-play YouTube facade, the stat-bar reveal, the services tabs,
// the mobile menu, and the contact form's labelling.
import puppeteer from 'puppeteer-core';

const BASE = process.argv[2];
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });

const check = (name, pass, detail = '') =>
  console.log(`${pass ? ' ok ' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);

// ── 1. YouTube facade: no iframe until clicked, real player after ────────────
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1350, height: 940 });
  await page.goto(BASE + '/reviews', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));

  const before = await page.evaluate(() => ({
    ytIframes: [...document.querySelectorAll('iframe')].filter((f) => /youtube/.test(f.src)).length,
    facades: document.querySelectorAll('.lite-yt').length,
    posters: [...document.querySelectorAll('.lite-yt img')].map((i) => i.src.includes('i.ytimg.com')),
  }));
  check('no YouTube iframe before interaction', before.ytIframes === 0, `iframes=${before.ytIframes}`);
  check('facade rendered for every testimonial', before.facades === 5, `facades=${before.facades}`);
  check('posters point at YouTube thumbnails', before.posters.every(Boolean) && before.posters.length === 5);

  // Click the centre card's facade.
  await page.evaluate(() => {
    document.querySelector('.carousel-item.center .lite-yt').click();
  });
  await new Promise((r) => setTimeout(r, 1200));

  const after = await page.evaluate(() => {
    const f = [...document.querySelectorAll('iframe')].find((x) => /youtube/.test(x.src));
    return { has: !!f, src: f ? f.src : '', nocookie: f ? f.src.includes('youtube-nocookie.com') : false };
  });
  check('clicking the facade mounts the real player', after.has, after.src.slice(0, 70));
  check('player uses youtube-nocookie.com', after.nocookie);
  await page.close();
}

// ── 2. Stat bars reveal via transform ───────────────────────────────────────
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1350, height: 940 });
  await page.goto(BASE + '/about', { waitUntil: 'networkidle2' });
  await page.evaluate(() => document.querySelector('#about')?.scrollIntoView());
  await new Promise((r) => setTimeout(r, 2600));

  const res = await page.evaluate(() => {
    // Both the desktop (vertical) and mobile (horizontal) bars are always in the
    // DOM; only one set is displayed at a given breakpoint. Assert against the
    // visible ones — a display:none element reports transform "none".
    const all = [...document.querySelectorAll('.stat-bar, .stat-bar-horizontal')];
    const bars = all.filter((b) => {
      const r = b.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    const counters = [...document.querySelectorAll('.counter-number')].map((c) => c.textContent.trim());
    return {
      bars: bars.length,
      revealed: bars.filter((b) => b.classList.contains('is-revealed')).length,
      composited: bars.filter((b) => {
        const s = getComputedStyle(b);
        // Must animate transform, and must NOT animate a layout property.
        return (
          s.transform !== 'none' &&
          s.transitionProperty.includes('transform') &&
          !/\b(width|height|all)\b/.test(s.transitionProperty)
        );
      }).length,
      heights: bars.map((b) => Math.round(b.getBoundingClientRect().height)),
      counters,
    };
  });
  check('stat bars revealed', res.bars > 0 && res.revealed === res.bars, `${res.revealed}/${res.bars}`);
  check(
    'bars animate transform only (composited, no layout)',
    res.bars > 0 && res.composited === res.bars,
    `${res.composited}/${res.bars} heights=${res.heights.join(',')}`
  );
  check('counters reached their targets', res.counters.join(',').includes('800+'), res.counters.join(' '));
  await page.close();
}

// ── 3. Services tabs still switch ───────────────────────────────────────────
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1350, height: 940 });
  await page.goto(BASE + '/services', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 900));

  const first = await page.evaluate(() => document.querySelector('h2, h1')?.innerText);
  await page.evaluate(() => {
    [...document.querySelectorAll('button')].find((b) => b.innerText.includes('Podcast Studio'))?.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  const res = await page.evaluate(() => {
    const img = document.querySelector('img[alt="Podcast Studio Rentals"]');
    return {
      title: [...document.querySelectorAll('h2')].map((h) => h.innerText).join('|'),
      imgSized: img ? !!(img.getAttribute('width') && img.getAttribute('height')) : false,
      hasImg: !!img,
    };
  });
  check('tab switch changes content', res.title.includes('Podcast Studio Rentals'), first);
  check('tab image carries width/height', res.hasImg && res.imgSized);
  await page.close();
}

// ── 4. Mobile menu opens and its CTAs are real links ────────────────────────
{
  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 823, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 800));

  await page.evaluate(() => document.querySelector('button[aria-label="Toggle menu"]').click());
  await new Promise((r) => setTimeout(r, 500));
  const res = await page.evaluate(() => {
    const menu = document.querySelector('.mobile-menu');
    const ctas = [...(menu?.querySelectorAll('a') ?? [])].map((a) => a.getAttribute('href'));
    return { open: !!menu, ctas };
  });
  check('mobile menu opens', res.open);
  check('mobile CTAs link somewhere', res.ctas.includes('/contact') && res.ctas.some((h) => h?.includes('wa.me')),
    res.ctas.filter(Boolean).join(' '));
  await page.close();
}

// ── 5. Contact form: every control has an accessible name ───────────────────
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1350, height: 940 });
  await page.goto(BASE + '/contact', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 900));

  const res = await page.evaluate(() => {
    const controls = [...document.querySelectorAll('input, select, textarea')];
    const named = controls.filter(
      (el) =>
        (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) ||
        el.getAttribute('aria-label')
    );
    // Fill and read back, to be sure the controls are still wired to state.
    const input = document.querySelector('#contact-name');
    return { total: controls.length, named: named.length, canType: !!input };
  });
  check('all form controls have an associated label', res.total > 0 && res.named === res.total,
    `${res.named}/${res.total}`);

  await page.type('#contact-name', 'Test User');
  await page.select('#contact-service', 'Web Development');
  const values = await page.evaluate(() => ({
    name: document.querySelector('#contact-name').value,
    service: document.querySelector('#contact-service').value,
  }));
  check('form still updates on input', values.name === 'Test User' && values.service === 'Web Development',
    JSON.stringify(values));
  await page.close();
}

await browser.close();
