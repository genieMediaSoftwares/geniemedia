/**
 * Post-deploy check of what public/.htaccess controls, against the live site:
 * status codes, redirects, the 404 for unknown paths, and each route's raw
 * <title> and canonical. Nothing here can be tested locally — `vite preview`
 * does not read .htaccess — so run it right after every deploy:
 *
 *   node scripts/verify-live-http.mjs            (defaults to https://geniemedia.in)
 *   node scripts/verify-live-http.mjs https://staging.example
 *
 * Hostinger's CDN may answer a burst of requests with a JavaScript challenge
 * (403 + "Checking your browser"). The script pauses between requests and
 * reports a challenge separately rather than as a failure; re-run it later if
 * one appears.
 */

import { ROUTE_META, canonicalFor } from "../src/seo/routeMeta.js";

const BASE = (process.argv[2] || "https://geniemedia.in").replace(/\/+$/, "");
const HOST = new URL(BASE).host;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const decode = (s) => String(s || "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'");

let failures = 0;
let challenged = 0;

const get = async (url) => {
  await sleep(400);
  const res = await fetch(url, { redirect: "manual", headers: { "User-Agent": UA } });
  const body = res.status === 200 || res.status === 404 || res.status === 403 ? await res.text() : "";
  return { status: res.status, location: res.headers.get("location"), body };
};

const report = (ok, label, detail = "") => {
  if (!ok) failures += 1;
  console.log(`  ${ok ? "✅" : "❌"} ${label}${detail ? `  (${detail})` : ""}`);
};

const check = async (label, url, expect) => {
  const r = await get(url);
  if (r.status === 403 && /Checking your browser/i.test(r.body)) {
    challenged += 1;
    console.log(`  ⚠️  ${label}  (CDN challenge — re-run later)`);
    return r;
  }
  const statusOk = r.status === expect.status;
  const locOk = expect.location === undefined || r.location === expect.location;
  report(statusOk && locOk, label, `${r.status}${r.location ? ` → ${r.location}` : ""}`);
  return r;
};

console.log(`\nLive HTTP checks for ${BASE}\n`);

console.log("Every route answers 200 with its own title and canonical:");
for (const path of Object.keys(ROUTE_META)) {
  const r = await check(path, BASE + path, { status: 200 });
  if (r.status !== 200) continue;
  const title = decode((r.body.match(/<title>([^<]*)<\/title>/) || [])[1]);
  const canonicals = [...r.body.matchAll(/rel="canonical" href="([^"]+)"/g)].map((m) => m[1]);
  report(title === ROUTE_META[path].title, `${path} raw title`, title);
  report(canonicals.length === 1 && canonicals[0] === canonicalFor(path), `${path} one raw canonical`, canonicals.join(", "));
}

console.log("\nDuplicate forms redirect in one hop to the canonical URL:");
for (const path of Object.keys(ROUTE_META).filter((p) => p !== "/")) {
  await check(`${path}/`, `${BASE}${path}/`, { status: 301, location: canonicalFor(path) });
  await check(`${path}.html`, `${BASE}${path}.html`, { status: 301, location: canonicalFor(path) });
}
await check("http://", `http://${HOST}/about`, { status: 301, location: `https://${HOST}/about` });
if (!HOST.startsWith("www.")) {
  await check("www", `https://www.${HOST}/about`, { status: 301, location: `https://${HOST}/about` });
}

console.log("\nApp routes without their own head still load:");
await check("/Digital_Marketing (case-insensitive)", `${BASE}/Digital_Marketing`, { status: 200 });
await check("/admin", `${BASE}/admin`, { status: 200 });

console.log("\nUnknown paths are a real 404:");
await check("/this-page-does-not-exist", `${BASE}/this-page-does-not-exist`, { status: 404 });
await check("/about/extra", `${BASE}/about/extra`, { status: 404 });

console.log("\nCrawler files:");
for (const file of ["/robots.txt", "/sitemap.xml", "/pages.xml"]) {
  await check(file, BASE + file, { status: 200 });
}

console.log(
  `\n${failures === 0 ? "✅ All checks passed" : `❌ ${failures} check(s) failed`}` +
    (challenged ? ` — ${challenged} blocked by the CDN challenge, re-run to cover them` : "")
);
process.exit(failures === 0 ? 0 : 1);
