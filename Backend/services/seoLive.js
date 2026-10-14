// Live SEO publishing for the static site on Hostinger.
//
// The public site is a static Next.js export, so a published title or
// description cannot reach it through Next.js revalidation. Instead the
// backend sends a signed request to seo-sync.php on Hostinger, which pulls
// the published configuration from GET /api/seo/published and stores it next
// to the site. seo.php then applies the head fields (title, description,
// canonical, robots, Open Graph, Twitter) to the pre-built pages at request
// time. Body content (H1, sections, links) still needs a rebuild.
//
// After every sync the live URL is fetched and its head is compared with the
// published values, so the admin only ever sees "Live" for verified changes.

const crypto = require("crypto");
const axios = require("axios");

const SYNC_URL = (process.env.SEO_SYNC_URL || "").trim();
const SYNC_SECRET = (process.env.SEO_SYNC_SECRET || "").trim();

const configured = () => Boolean(SYNC_URL && SYNC_SECRET.length >= 32);

const decode = (s) =>
  String(s || "")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

function readHead(html) {
  const head = String(html || "").split("</head>")[0];
  const pick = (re) => {
    const m = head.match(re);
    return m ? decode(m[1]) : null;
  };
  return {
    title: pick(/<title>([^<]*)<\/title>/),
    description: pick(/<meta name="description" content="([^"]*)"\/?>/),
    canonical: pick(/<link rel="canonical" href="([^"]*)"\/?>/),
    robots: pick(/<meta name="robots" content="([^"]*)"\/?>/),
    ogImage: pick(/<meta property="og:image" content="([^"]*)"\/?>/),
  };
}

// Sends the signed sync request. Resolves to { ok, status, data, error }.
async function syncLive({ reason = "publish" } = {}) {
  if (!configured()) {
    return { ok: false, skipped: true, error: "Live publishing is not configured (SEO_SYNC_URL / SEO_SYNC_SECRET)." };
  }
  const body = JSON.stringify({ action: "sync", reason });
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = crypto.randomBytes(16).toString("hex");
  const signature = crypto.createHmac("sha256", SYNC_SECRET).update(`${timestamp}\n${nonce}\n${body}`).digest("hex");
  try {
    const res = await axios.post(SYNC_URL, body, {
      headers: {
        "Content-Type": "application/json",
        "X-Seo-Timestamp": timestamp,
        "X-Seo-Nonce": nonce,
        "X-Seo-Signature": signature,
      },
      timeout: 45000,
      validateStatus: () => true,
    });
    const data = res.data && typeof res.data === "object" ? res.data : null;
    if (res.status !== 200 || !data || !data.ok) {
      return { ok: false, status: res.status, data, error: (data && data.error) || `Sync endpoint answered HTTP ${res.status}` };
    }
    return { ok: true, status: res.status, data };
  } catch (err) {
    return { ok: false, error: `Could not reach the sync endpoint: ${err.message}` };
  }
}

const robotsFor = (cfg) => {
  const index = cfg.robotsIndex !== false;
  const follow = cfg.robotsFollow !== false;
  return index && follow ? null : `${index ? "index" : "noindex"}, ${follow ? "follow" : "nofollow"}`;
};

// Page configs are keyed by the pre-2026-10-14 underscore paths, but the public site moved to
// hyphenated URLs and 301s the old ones. Keep in sync with frontend-next/src/lib/legacyPaths.ts.
const LEGACY_SECTION_PATHS = {
  "/digital_marketing": "/digital-marketing",
  "/web_development": "/web-development",
  "/production_house": "/production-house",
  "/podcast_studio": "/podcast-studio",
};
const publicPath = (path) => {
  for (const [from, to] of Object.entries(LEGACY_SECTION_PATHS)) {
    if (path === from || path.startsWith(`${from}/`)) return to + path.slice(from.length);
  }
  return path;
};

// Fetches the public page and compares the head with the published config.
async function verifyPage({ siteUrl, path, cfg, version }) {
  const url = `${siteUrl.replace(/\/+$/, "")}${path === "/" ? "/" : publicPath(path)}`;
  const checks = [];
  let res;
  try {
    res = await axios.get(`${url}${url.includes("?") ? "&" : "?"}seo_verify=${Date.now()}`, {
      timeout: 30000,
      maxRedirects: 0,
      responseType: "text",
      headers: { "Cache-Control": "no-cache", "User-Agent": "GenieMediaSeoVerifier/1.0" },
      validateStatus: () => true,
    });
  } catch (err) {
    return { status: "failed", url, checks: [{ field: "http", ok: false, detail: err.message }] };
  }
  checks.push({ field: "http", ok: res.status === 200, detail: `HTTP ${res.status}` });
  const head = readHead(res.data);
  const want = [
    ["title", cfg.seoTitle],
    ["description", cfg.metaDescription],
    ["canonical", cfg.canonicalUrl && cfg.canonicalUrl.replace(/^(https?:\/\/[^/]+)(\/[^?#]*)/, (_, origin, p) => origin + publicPath(p))],
    ["ogImage", cfg.ogImage],
    ["robots", robotsFor(cfg)],
  ];
  for (const [field, expected] of want) {
    if (!expected) continue;
    const actual = head[field];
    checks.push({ field, ok: actual === expected, expected, actual });
  }
  const liveHeader = String(res.headers["x-seo-live"] || "");
  checks.push({
    field: "gateway",
    ok: liveHeader === `live-v${version}` || (liveHeader === "static" && checks.every((c) => c.ok)) || (!liveHeader && checks.every((c) => c.ok)),
    detail: liveHeader || "(not served by the live SEO gateway)",
  });
  const failed = checks.filter((c) => !c.ok);
  const status = res.status !== 200 ? "failed" : failed.length ? "warning" : "live";
  return { status, url, checks, liveHeader };
}

module.exports = { configured, syncLive, verifyPage, readHead, publicPath };
