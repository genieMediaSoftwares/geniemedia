import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/Praveen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const browser = await chromium.launch({ executablePath: "C:/Users/Praveen/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe", headless: true });
const results = [];
const goto = (page, route) => page.goto(`http://127.0.0.1:5173${route}`, { waitUntil: "domcontentloaded" });
const check = async (name, width, work) => {
  try { await work(); results.push({ name, width, passed: true }); }
  catch (error) { results.push({ name, width, passed: false, error: error.message }); }
};
const inViewport = async (page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);

try {
  for (const width of [320, 375, 425, 768, 1024, 1440, 1920]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    await context.route("**/*", (route) => {
      const request = route.request();
      if (request.method() !== "GET" && request.method() !== "HEAD") return route.abort();
      if (!request.url().startsWith("http://127.0.0.1:5173") && ["xhr", "fetch", "script", "media"].includes(request.resourceType())) return route.abort();
      return route.continue();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(7000);
    await check("Navigation keyboard, service dropdown and Escape", width, async () => {
      await goto(page, "/");
      await page.waitForTimeout(250);
      const skip = page.getByRole("link", { name: "Skip to main content", exact: true });
      await skip.focus();
      await page.keyboard.press("Enter");
      assert.equal(await page.evaluate(() => document.activeElement.id), "main-content");
      if (width < 1280) {
        const toggle = page.getByRole("button", { name: "Toggle menu" });
        await toggle.click();
        assert.equal(await toggle.getAttribute("aria-expanded"), "true");
        const nav = page.locator("#mobile-navigation");
        await nav.getByRole("button", { name: "Services", exact: true }).click();
        await nav.getByRole("button", { name: "Show Website Development services" }).click();
        assert(await nav.locator('a[href="/web_development/react-native"]').isVisible());
        const controls = nav.locator("a,button");
        await controls.last().focus();
        await page.keyboard.press("Tab");
        assert(await toggle.evaluate((el) => document.activeElement === el));
        await page.keyboard.press("Shift+Tab");
        assert(await controls.last().evaluate((el) => document.activeElement === el));
        assert(await inViewport(page));
        await page.keyboard.press("Escape");
        assert.equal(await toggle.getAttribute("aria-expanded"), "false");
        assert.equal(await page.evaluate(() => document.body.style.overflow), "");
        assert(await toggle.evaluate((el) => document.activeElement === el));
        assert.equal(await toggle.evaluate((el) => getComputedStyle(el).outlineStyle), "solid");
      } else {
        const services = page.locator("header").getByRole("link", { name: "Services", exact: true });
        await services.focus();
        assert.equal(await services.getAttribute("aria-expanded"), "true");
        await page.locator('header a[href="/digital_marketing"]').focus();
        const child = page.locator('header a[href="/digital_marketing/seo-services"]');
        await child.waitFor({ state: "visible" });
        const box = await child.boundingBox();
        assert(box.x >= 0 && box.x + box.width <= width, "submenu fits viewport");
        await child.focus();
        await page.keyboard.press("Escape");
        assert.equal(await services.getAttribute("aria-expanded"), "false");
      }
    });
    await check("Service tabs preserve links and support arrow keys", width, async () => {
      await goto(page, "/services");
      const tabs = page.getByRole("tab");
      const hrefs = await tabs.evaluateAll((els) => els.map((el) => el.getAttribute("href")));
      assert.deepEqual(hrefs, ["/digital_marketing", "/web_development", "/production_house", "/podcast_studio"]);
      await tabs.first().focus();
      for (let index = 1; index < 4; index += 1) {
        await page.keyboard.press("ArrowRight");
        assert.equal(await tabs.nth(index).getAttribute("aria-selected"), "true");
        assert(await inViewport(page));
      }
      await page.keyboard.press("Home");
      assert.equal(await tabs.first().getAttribute("aria-selected"), "true");
      assert.equal(await page.getByRole("tabpanel").getAttribute("aria-labelledby"), "service-tab-dm");
    });
    await check("FAQ keyboard expansion and testimonial navigation", width, async () => {
      await goto(page, "/");
      const summary = page.locator("main details summary").first();
      await summary.focus();
      await page.keyboard.press("Enter");
      assert(await summary.evaluate((el) => el.parentElement.open));
      const dots = page.locator('main button[aria-current="true"]');
      const before = await dots.getAttribute("aria-label");
      await page.getByRole("button", { name: "Next testimonial" }).click();
      assert.notEqual(await dots.getAttribute("aria-label"), before);
      await page.waitForTimeout(100);
      const active = page.locator('main [class~="order-2"] h3').first();
      const box = await active.boundingBox();
      assert(box.x >= 0 && box.x + box.width <= width, "active testimonial stays on screen");
      await page.route("**/embed/**", (route) => route.fulfill({ contentType: "text/html", body: "<html><body>Local video embed verification</body></html>" }));
      await page.locator('main [class~="order-2"] button[aria-label^="Play video testimonial"]').click();
      await page.locator('main [class~="order-2"] iframe').waitFor();
      assert((await page.locator('main [class~="order-2"] iframe').getAttribute("src")).includes("youtube-nocookie.com/embed/"));
      await page.unroute("**/embed/**");
    });
    await check("Contact form native validation, success and failure (mocked)", width, async () => {
      const requests = [];
      await page.route("**/contact.php", async (route) => {
        requests.push(route.request().postDataJSON());
        await route.fulfill({ status: requests.length === 1 ? 200 : 500, contentType: "application/json", body: JSON.stringify({ success: requests.length === 1 }) });
      });
      await goto(page, "/contact");
      const send = page.getByRole("button", { name: "Send Message" });
      await send.click();
      assert.equal(requests.length, 0);
      const fill = async () => {
        await page.locator("#contact-name").fill("UI verification");
        await page.locator("#contact-email").fill("ui-test@example.invalid");
        await page.locator("#contact-phone").fill("9000000000");
        await page.locator("#contact-service").selectOption({ index: 1 });
        await page.locator("#contact-message").fill("Local verification only. This request is intercepted and never sent.");
      };
      await fill();
      await send.click();
      await page.getByText("Message Sent Successfully!", { exact: true }).waitFor();
      assert.equal(requests.length, 1);
      assert.equal(requests[0].email, "ui-test@example.invalid");
      await fill();
      await send.click();
      await page.getByText("Failed to send message. Please try again or contact us directly.", { exact: true }).waitFor();
      assert.equal(requests.length, 2);
      assert(await inViewport(page));
      await page.unroute("**/contact.php");
    });
    await check("Booking keyboard controls, validation, Back and WhatsApp payload (intercepted)", width, async () => {
      await goto(page, "/podcast_studio");
      const packageButton = page.locator('button[aria-pressed]').filter({ hasText: "Podcast Shoot (Only Studio)" }).first();
      await packageButton.focus();
      await page.keyboard.press("Enter");
      assert.equal(await packageButton.getAttribute("aria-pressed"), "true");
      await page.getByRole("button", { name: "Next", exact: true }).click();
      await page.getByRole("button", { name: "Next month", exact: true }).waitFor();
      const date = page.locator('button[aria-pressed="false"][aria-label]:enabled').first();
      await date.focus();
      await page.keyboard.press("Enter");
      await page.getByRole("button", { name: /10:00 am - 11:00 am/ }).click();
      assert(await inViewport(page));
      await page.getByRole("button", { name: "Next", exact: true }).click();
      await page.locator("#booking-name").waitFor();
      await page.getByRole("button", { name: "Next", exact: true }).click();
      assert(await page.locator("#booking-name").isVisible(), "empty details must not advance");
      await page.getByLabel("Full Name", { exact: true }).fill("UI verification");
      await page.getByLabel("Email", { exact: true }).fill("invalid-email");
      await page.getByLabel("Phone", { exact: true }).fill("9000000000");
      await page.getByRole("button", { name: "Next", exact: true }).click();
      assert(await page.locator("#booking-email").evaluate((el) => document.activeElement === el));
      await page.getByLabel("Email", { exact: true }).fill("ui-test@example.invalid");
      await page.getByRole("button", { name: "Next", exact: true }).click();
      await page.getByText("Booking Summary", { exact: true }).waitFor();
      assert(await inViewport(page));
      await page.getByRole("button", { name: "Back", exact: true }).click();
      await page.locator("#booking-name").waitFor();
      assert(await page.evaluate(() => scrollY > 1000), "Back must stay at booking section");
      await page.getByRole("button", { name: "Next", exact: true }).click();
      await page.getByText("Booking Summary", { exact: true }).waitFor();
      await page.evaluate(() => { window.__testPopup = ""; window.open = (url) => { window.__testPopup = String(url); return null; }; });
      await page.getByRole("button", { name: "Confirm Booking", exact: true }).click();
      await page.waitForTimeout(400);
      const url = await page.evaluate(() => window.__testPopup);
      assert(url.includes("919032845433"), "WhatsApp company destination preserved");
      assert(decodeURIComponent(url).includes("UI verification"), "booking details included");
    });
    await context.close();
    console.log(`${width}px interaction checks: ${results.filter((r) => r.width === width && r.passed).length}/5 passed`);
    fs.writeFileSync(path.join(root, "audits/ui-alignment/interactions.json"), JSON.stringify(results, null, 2));
  }
} finally { await browser.close(); }
const failed = results.filter((r) => !r.passed);
console.log(JSON.stringify({ checks: results.length, passed: results.length - failed.length, failed }, null, 2));
if (failed.length) process.exitCode = 1;
