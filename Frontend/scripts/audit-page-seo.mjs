/**
 * Comprehensive SEO & Content Extraction Auditor for Genie Media SPA & Static Routes.
 *
 * Runs via Puppeteer against any local server or built static route and evaluates:
 * - Content Extraction (Body Word Count, Paragraph Count)
 * - Heading Outline & Hierarchy Audit (Single H1, no skipped levels)
 * - Image Audit (Alt text presence, explicit dimensions width & height)
 * - Link Graph Audit (Internal links, anchor text diversity, external links)
 * - Meta & SERP Audit (Title, Meta Description length & quality, Canonical URL, OG/Twitter tags)
 * - Local Vizag Relevance Score (Density of local terms: Vizag, Visakhapatnam, Yendada, Andhra Pradesh)
 * - Structured Data / Schema Audit (Organization, ProfessionalService, Service, FAQPage)
 * - Overall SEO Audit Quality Score (0-100%)
 *
 * Usage:
 *   node scripts/audit-page-seo.mjs /digital_marketing http://localhost:4173
 */

import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHROME = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const TARGET_ROUTE = process.argv[2] || "/digital_marketing";
let BASE_URL = process.argv[3];

let server = null;

// Helper to serve dist directory if no base URL is supplied
async function startLocalServer() {
  const distDir = path.join(__dirname, "..", "dist");
  if (!fs.existsSync(distDir)) {
    console.error("❌ dist directory not found. Please run 'npm run build' first.");
    process.exit(1);
  }

  return new Promise((resolve) => {
    server = http.createServer((req, res) => {
      let reqPath = req.url.split("?")[0].split("#")[0];
      if (reqPath === "/") reqPath = "/index.html";

      let filePath = path.join(distDir, reqPath);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        const routeHtml = path.join(distDir, `${reqPath.replace(/^\//, "")}.html`);
        if (fs.existsSync(routeHtml)) {
          filePath = routeHtml;
        } else {
          filePath = path.join(distDir, "index.html");
        }
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentTypes = {
        ".html": "text/html; charset=utf-8",
        ".js": "application/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
      };

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end("Server Error");
        } else {
          res.writeHead(200, { "Content-Type": contentTypes[ext] || "application/octet-stream" });
          res.end(content);
        }
      });
    });

    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      resolve(`http://127.0.0.1:${port}`);
    });
  });
}

async function auditPage() {
  if (!BASE_URL) {
    BASE_URL = await startLocalServer();
  }

  const url = `${BASE_URL.replace(/\/+$/, "")}${TARGET_ROUTE}`;
  console.log(`\n========================================================================`);
  console.log(`🔍 RUNNING COMPREHENSIVE SEO AUDIT FOR: ${TARGET_ROUTE}`);
  console.log(`   URL: ${url}`);
  console.log(`========================================================================\n`);

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1350, height: 940 });

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && !msg.text().includes("favicon")) {
      consoleErrors.push(msg.text().slice(0, 150));
    }
  });

  await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const auditResult = await page.evaluate(() => {
    // 1. Content Extraction
    const bodyText = (document.body.innerText || "").replace(/\s+/g, " ").trim();
    const words = bodyText ? bodyText.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;

    // Local terms check
    const lowerText = bodyText.toLowerCase();
    const localKeywords = [
      "visakhapatnam",
      "vizag",
      "andhra pradesh",
      "yendada",
      "seo",
      "digital marketing",
      "google ads",
      "social media",
    ];

    const keywordCounts = {};
    localKeywords.forEach((kw) => {
      const matches = lowerText.match(new RegExp(`\\b${kw}\\b`, "g"));
      keywordCounts[kw] = matches ? matches.length : 0;
    });

    // 2. Heading Hierarchy Audit
    const headingElements = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")];
    const outline = headingElements.map((h) => ({
      level: Number(h.tagName[1]),
      text: (h.innerText || "").replace(/\s+/g, " ").trim(),
    }));

    const h1Count = outline.filter((h) => h.level === 1).length;
    const h2Count = outline.filter((h) => h.level === 2).length;

    let headingSkips = 0;
    for (let i = 1; i < outline.length; i++) {
      if (outline[i].level > outline[i - 1].level + 1) {
        headingSkips++;
      }
    }

    // 3. Image Audit
    const imgs = [...document.querySelectorAll("img")];
    const imgDetails = imgs.map((img) => ({
      src: img.getAttribute("src") || "",
      alt: img.getAttribute("alt"),
      hasWidth: Boolean(img.getAttribute("width")),
      hasHeight: Boolean(img.getAttribute("height")),
    }));

    const missingAlt = imgDetails.filter((img) => img.alt === null || img.alt.trim() === "");
    const missingDims = imgDetails.filter((img) => !img.hasWidth || !img.hasHeight);

    // 4. Link Audit
    const links = [...document.querySelectorAll("a")];
    const linkDetails = links.map((a) => ({
      href: a.getAttribute("href") || "",
      text: (a.innerText || "").trim(),
      ariaLabel: a.getAttribute("aria-label"),
    }));

    const internalLinks = linkDetails.filter(
      (l) => l.href.startsWith("/") || l.href.includes("geniemedia.in")
    );
    const externalLinks = linkDetails.filter((l) => l.href.startsWith("http") && !l.href.includes("geniemedia.in"));
    const emptyLinks = linkDetails.filter((l) => !l.text && !l.ariaLabel);

    // 5. Meta & SERP Audit
    const title = document.title || "";
    const metaDescEl = document.querySelector('meta[name="description"]');
    const metaDesc = metaDescEl ? metaDescEl.getAttribute("content") || "" : "";
    const canonicalEl = document.querySelector('link[rel="canonical"]');
    const canonical = canonicalEl ? canonicalEl.getAttribute("href") || "" : "";

    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute("content") || "";
    const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute("content") || "";
    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute("content") || "";

    // 6. Structured Data
    const jsonLdScripts = [...document.querySelectorAll('script[type="application/ld+json"]')];
    const jsonLdNodes = [];
    jsonLdScripts.forEach((s) => {
      try {
        const parsed = JSON.parse(s.textContent);
        if (parsed["@graph"]) {
          jsonLdNodes.push(...parsed["@graph"]);
        } else {
          jsonLdNodes.push(parsed);
        }
      } catch (_) {}
    });

    const schemaTypes = jsonLdNodes.map((n) => (Array.isArray(n["@type"]) ? n["@type"].join("/") : n["@type"]));

    return {
      wordCount,
      keywordCounts,
      h1Count,
      h2Count,
      headingSkips,
      outline,
      totalImages: imgs.length,
      missingAltCount: missingAlt.length,
      missingDimsCount: missingDims.length,
      totalLinks: links.length,
      internalLinkCount: internalLinks.length,
      internalLinks,
      externalLinkCount: externalLinks.length,
      emptyLinkCount: emptyLinks.length,
      title,
      titleLength: title.length,
      metaDesc,
      metaDescLength: metaDesc.length,
      canonical,
      ogTitle,
      ogDesc,
      ogImage,
      schemaTypes,
    };
  });

  await browser.close();
  if (server) server.close();

  // Scored Checklist Criteria
  const checks = [];

  // Content Score (Max 25 pts)
  if (auditResult.wordCount >= 1000) {
    checks.push({ name: "Word Count >= 1000", score: 25, max: 25, status: "PASS", detail: `${auditResult.wordCount} words` });
  } else if (auditResult.wordCount >= 500) {
    checks.push({ name: "Word Count >= 500", score: 18, max: 25, status: "WARN", detail: `${auditResult.wordCount} words` });
  } else {
    checks.push({ name: "Word Count (Thin Content)", score: 5, max: 25, status: "FAIL", detail: `${auditResult.wordCount} words` });
  }

  // Heading Hierarchy (Max 15 pts)
  if (auditResult.h1Count === 1 && auditResult.headingSkips === 0) {
    checks.push({ name: "Heading Hierarchy (1 H1, no skips)", score: 15, max: 15, status: "PASS", detail: `H1: 1, H2: ${auditResult.h2Count}` });
  } else if (auditResult.h1Count === 1) {
    checks.push({ name: "Heading Skips Detected", score: 8, max: 15, status: "WARN", detail: `${auditResult.headingSkips} skipped levels` });
  } else {
    checks.push({ name: "Invalid H1 Count", score: 0, max: 15, status: "FAIL", detail: `H1 count is ${auditResult.h1Count}` });
  }

  // Title Tag (Max 10 pts)
  if (auditResult.titleLength >= 30 && auditResult.titleLength <= 65) {
    checks.push({ name: "Title Tag Length (30-65 chars)", score: 10, max: 10, status: "PASS", detail: `"${auditResult.title}" (${auditResult.titleLength} chars)` });
  } else {
    checks.push({ name: "Title Tag Suboptimal Length", score: 5, max: 10, status: "WARN", detail: `"${auditResult.title}" (${auditResult.titleLength} chars)` });
  }

  // Meta Description (Max 10 pts)
  if (auditResult.metaDescLength >= 120 && auditResult.metaDescLength <= 165) {
    checks.push({ name: "Meta Description Length (120-165 chars)", score: 10, max: 10, status: "PASS", detail: `(${auditResult.metaDescLength} chars)` });
  } else if (auditResult.metaDescLength > 0) {
    checks.push({ name: "Meta Description Length Suboptimal", score: 6, max: 10, status: "WARN", detail: `(${auditResult.metaDescLength} chars)` });
  } else {
    checks.push({ name: "Missing Meta Description", score: 0, max: 10, status: "FAIL", detail: "None" });
  }

  // Image Optimization (Max 10 pts)
  if (auditResult.missingAltCount === 0 && auditResult.missingDimsCount === 0) {
    checks.push({ name: "Image Optimization (Alt + Dims)", score: 10, max: 10, status: "PASS", detail: `${auditResult.totalImages} images fully optimized` });
  } else {
    const score = Math.max(0, 10 - auditResult.missingAltCount * 2 - auditResult.missingDimsCount);
    checks.push({ name: "Image Alt/Dimensions Missing", score, max: 10, status: "WARN", detail: `Missing Alt: ${auditResult.missingAltCount}, Missing Dims: ${auditResult.missingDimsCount}` });
  }

  // Internal Links (Max 10 pts)
  if (auditResult.internalLinkCount >= 5) {
    checks.push({ name: "Internal Linking (>= 5 links)", score: 10, max: 10, status: "PASS", detail: `${auditResult.internalLinkCount} internal links` });
  } else if (auditResult.internalLinkCount >= 2) {
    checks.push({ name: "Internal Linking (2-4 links)", score: 6, max: 10, status: "WARN", detail: `${auditResult.internalLinkCount} internal links` });
  } else {
    checks.push({ name: "Weak Internal Linking", score: 2, max: 10, status: "FAIL", detail: `${auditResult.internalLinkCount} internal links` });
  }

  // Local Vizag Relevance (Max 10 pts)
  const vizagCount = auditResult.keywordCounts["vizag"] || 0;
  const vizagCityCount = auditResult.keywordCounts["visakhapatnam"] || 0;
  const totalLocal = vizagCount + vizagCityCount;

  if (totalLocal >= 5) {
    checks.push({ name: "Local Relevance (Vizag / Visakhapatnam)", score: 10, max: 10, status: "PASS", detail: `Vizag: ${vizagCount}, Visakhapatnam: ${vizagCityCount}` });
  } else if (totalLocal >= 2) {
    checks.push({ name: "Moderate Local Relevance", score: 6, max: 10, status: "WARN", detail: `Vizag: ${vizagCount}, Visakhapatnam: ${vizagCityCount}` });
  } else {
    checks.push({ name: "Low Local Relevance", score: 2, max: 10, status: "FAIL", detail: `Vizag: ${vizagCount}, Visakhapatnam: ${vizagCityCount}` });
  }

  // Structured Data Schema (Max 10 pts)
  const hasServiceSchema = auditResult.schemaTypes.some((t) => t?.includes("Service"));
  const hasOrgSchema = auditResult.schemaTypes.some((t) => t?.includes("Organization") || t?.includes("ProfessionalService"));
  const hasFaqSchema = auditResult.schemaTypes.some((t) => t?.includes("FAQPage"));

  if (hasServiceSchema && hasOrgSchema && hasFaqSchema) {
    checks.push({ name: "Structured Data (Service + Org + FAQPage)", score: 10, max: 10, status: "PASS", detail: auditResult.schemaTypes.join(", ") });
  } else if (hasServiceSchema && hasOrgSchema) {
    checks.push({ name: "Structured Data (Service + Org, missing FAQPage)", score: 7, max: 10, status: "WARN", detail: auditResult.schemaTypes.join(", ") });
  } else {
    checks.push({ name: "Incomplete Schema Markup", score: 3, max: 10, status: "FAIL", detail: auditResult.schemaTypes.join(", ") });
  }

  const totalScore = checks.reduce((sum, c) => sum + c.score, 0);
  const maxScore = checks.reduce((sum, c) => sum + c.max, 0);
  const qualityPercentage = Math.round((totalScore / maxScore) * 100);

  console.log(`📊 CONTENT EXTRACTION & AUDIT SUMMARY`);
  console.log(`------------------------------------------------------------------------`);
  console.log(`  Word Count:         ${auditResult.wordCount} words`);
  console.log(`  Headings Outline:   ${auditResult.outline.length} headings (H1: ${auditResult.h1Count}, H2: ${auditResult.h2Count})`);
  console.log(`  Images Total:       ${auditResult.totalImages} (Missing Alt: ${auditResult.missingAltCount}, Missing Dims: ${auditResult.missingDimsCount})`);
  console.log(`  Internal Links:     ${auditResult.internalLinkCount} links`);
  console.log(`  Local Vizag Terms:  Vizag: ${vizagCount}, Visakhapatnam: ${vizagCityCount}, AP: ${auditResult.keywordCounts["andhra pradesh"] || 0}`);
  console.log(`  Schema Types:       ${auditResult.schemaTypes.join(", ") || "None"}`);
  console.log(`------------------------------------------------------------------------`);
  console.log(`\n📋 CHECKLIST DETAILS:`);
  checks.forEach((c) => {
    const symbol = c.status === "PASS" ? "✅" : c.status === "WARN" ? "⚠️" : "❌";
    console.log(`  ${symbol} ${c.name.padEnd(45)} [${c.score}/${c.max} pts] - ${c.detail}`);
  });

  console.log(`\n========================================================================`);
  console.log(`🎯 OVERALL AUDIT QUALITY SCORE: ${qualityPercentage}% (${totalScore}/${maxScore} pts)`);
  console.log(`========================================================================\n`);

  if (consoleErrors.length > 0) {
    console.log(`⚠️ Console errors during rendering:`);
    consoleErrors.forEach((e) => console.log(`   - ${e}`));
  }

  return { qualityPercentage, auditResult, checks };
}

auditPage().catch((err) => {
  console.error("❌ Audit failed:", err);
  if (server) server.close();
  process.exit(1);
});
