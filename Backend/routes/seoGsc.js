// =========================================================================
// ==================== GOOGLE SEARCH CONSOLE INTEGRATION ==================
// OAuth connection, Search Analytics sync, opportunities, URL Inspection and
// sitemap status — all through Google's official REST APIs.
//
// Only real data is shown. Without a connection every endpoint says so; no
// placeholder numbers are ever returned. The refresh token is encrypted at
// rest (AES-256-GCM with a key derived from GSC_TOKEN_KEY) and never leaves
// the server.
//
// Env: GSC_CLIENT_ID, GSC_CLIENT_SECRET, GSC_REDIRECT_URI (this backend's
// /api/seo/gsc/callback), GSC_TOKEN_KEY (32+ random characters),
// GSC_ADMIN_RETURN_URL (e.g. https://geniemedia.in/admin/seo), optional
// GSC_PROPERTY (e.g. sc-domain:geniemedia.in).
// =========================================================================

const express = require("express");
const crypto = require("crypto");
const axios = require("axios");

const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const env = (k) => (process.env[k] || "").trim();
const COMMERCIAL = /\b(agency|company|companies|services?|cost|price|pricing|charges|near me|hire|rental|book|quote|best|top|affordable|packages?)\b/i;
const QUESTION = /^(how|what|why|which|when|where|who|is|are|can|do|does|should)\b|\?$/i;

const TABLES = [
  `CREATE TABLE IF NOT EXISTS seo_integrations (
    name      VARCHAR(40)  NOT NULL PRIMARY KEY,
    status    VARCHAR(20)  NOT NULL,
    data      JSON         NULL,
    updatedAt BIGINT       NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS seo_oauth_states (
    state     VARCHAR(64)  NOT NULL PRIMARY KEY,
    admin     VARCHAR(190) NULL,
    createdAt BIGINT       NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS seo_gsc_rows (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    date        DATE         NOT NULL,
    query       VARCHAR(255) NOT NULL,
    page        VARCHAR(500) NOT NULL,
    country     VARCHAR(3)   NOT NULL,
    device      VARCHAR(10)  NOT NULL,
    clicks      INT          NOT NULL,
    impressions INT          NOT NULL,
    ctr         DOUBLE       NOT NULL,
    position    DOUBLE       NOT NULL,
    UNIQUE KEY uq_gsc_row (date, query(150), page(200), country, device),
    INDEX idx_gsc_date (date),
    INDEX idx_gsc_page (page(200)),
    INDEX idx_gsc_query (query(150))
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS seo_gsc_inspections (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    url         VARCHAR(500) NOT NULL,
    verdict     VARCHAR(40)  NULL,
    coverage    VARCHAR(200) NULL,
    result      JSON         NULL,
    inspectedAt BIGINT       NOT NULL,
    INDEX idx_gsc_insp_url (url(200))
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

const keyFromEnv = () => crypto.createHash("sha256").update(env("GSC_TOKEN_KEY")).digest();

function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyFromEnv(), iv);
  const data = Buffer.concat([cipher.update(String(text), "utf8"), cipher.final()]);
  return [iv.toString("base64"), cipher.getAuthTag().toString("base64"), data.toString("base64")].join(".");
}

function decrypt(blob) {
  const [iv, tag, data] = String(blob || "").split(".");
  const decipher = crypto.createDecipheriv("aes-256-gcm", keyFromEnv(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()]).toString("utf8");
}

const configured = () =>
  Boolean(env("GSC_CLIENT_ID") && env("GSC_CLIENT_SECRET") && env("GSC_REDIRECT_URI") && env("GSC_TOKEN_KEY").length >= 32);

const ymd = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d;
};

// Volume / difficulty provider adapter. With no provider configured every
// value is reported as unavailable — never estimated.
const keywordDataProvider = {
  name: env("KEYWORD_DATA_PROVIDER") || "none",
  async lookup(keywords) {
    return keywords.map((k) => ({ keyword: k, volume: null, difficulty: null, source: "unavailable" }));
  },
};

module.exports = function seoGscRoutes({ db, verifyToken }) {
  const router = express.Router();
  const query = (sql, params = []) =>
    new Promise((resolve, reject) => db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows))));
  const fail = (res, status, message, extra = {}) => res.status(status).json({ success: false, message, ...extra });
  const adminOf = (req) => String((req.user && (req.user.email || req.user.id)) || "unknown").slice(0, 190);

  (async () => {
    try {
      for (const sql of TABLES) await query(sql);
    } catch (err) {
      console.log("❌ GSC TABLES ERROR:", err.message);
    }
  })();

  const getIntegration = async () => {
    const row = (await query("SELECT * FROM seo_integrations WHERE name = 'gsc'"))[0];
    if (!row) return null;
    const data = typeof row.data === "string" ? JSON.parse(row.data || "{}") : row.data || {};
    return { status: row.status, data };
  };
  const saveIntegration = (status, data) =>
    query(
      "INSERT INTO seo_integrations (name, status, data, updatedAt) VALUES ('gsc', ?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status), data = VALUES(data), updatedAt = VALUES(updatedAt)",
      [status, JSON.stringify(data), Date.now()]
    );

  const accessToken = async () => {
    const integ = await getIntegration();
    if (!integ || integ.status !== "connected" || !integ.data.refreshToken) {
      const err = new Error("Search Console is not connected.");
      err.code = "NOT_CONNECTED";
      throw err;
    }
    try {
      const { data } = await axios.post(
        "https://oauth2.googleapis.com/token",
        new URLSearchParams({
          client_id: env("GSC_CLIENT_ID"),
          client_secret: env("GSC_CLIENT_SECRET"),
          refresh_token: decrypt(integ.data.refreshToken),
          grant_type: "refresh_token",
        }).toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" }, timeout: 20000 }
      );
      return { token: data.access_token, integ };
    } catch (err) {
      const reason = err.response && err.response.data ? err.response.data.error : err.message;
      if (reason === "invalid_grant") {
        await saveIntegration("expired", { ...integ.data, refreshToken: null, lastError: "Authorization expired or was revoked. Reconnect Search Console." });
      }
      const e = new Error(`Google token refresh failed: ${reason}`);
      e.code = reason === "invalid_grant" ? "EXPIRED" : "TOKEN";
      throw e;
    }
  };

  const google = async (method, url, body) => {
    const { token, integ } = await accessToken();
    try {
      const res = await axios({ method, url, data: body, headers: { Authorization: `Bearer ${token}` }, timeout: 60000 });
      return { data: res.data, integ };
    } catch (err) {
      const status = err.response ? err.response.status : 0;
      const msg = err.response && err.response.data && err.response.data.error ? err.response.data.error.message : err.message;
      const e = new Error(status === 429 ? `Google quota exceeded: ${msg}` : status === 403 ? `No permission for this Search Console property: ${msg}` : msg);
      e.status = status;
      throw e;
    }
  };

  const handleError = (res, err, fallback) => {
    if (err.code === "NOT_CONNECTED" || err.code === "EXPIRED") return fail(res, 409, err.message, { connected: false });
    console.error(fallback, err.message);
    return fail(res, err.status && err.status >= 400 && err.status < 500 ? 502 : 500, err.message || fallback);
  };

  // ---------- status / connect / callback / disconnect ----------
  router.get("/api/admin/seo/gsc/status", verifyToken, async (req, res) => {
    try {
      const integ = await getIntegration();
      const counts = (await query("SELECT COUNT(*) AS n, MIN(date) AS first, MAX(date) AS last FROM seo_gsc_rows"))[0] || {};
      res.json({
        success: true,
        configured: configured(),
        connected: Boolean(integ && integ.status === "connected"),
        status: integ ? integ.status : "not_connected",
        property: integ ? integ.data.property || null : null,
        connectedBy: integ ? integ.data.connectedBy || null : null,
        connectedAt: integ ? integ.data.connectedAt || null : null,
        lastSyncAt: integ ? integ.data.lastSyncAt || null : null,
        lastSyncRows: integ ? integ.data.lastSyncRows || null : null,
        lastError: integ ? integ.data.lastError || null : null,
        rows: Number(counts.n || 0),
        firstDate: counts.first || null,
        lastDate: counts.last || null,
        keywordDataProvider: keywordDataProvider.name,
      });
    } catch (err) {
      fail(res, 500, "Failed to load Search Console status");
    }
  });

  router.post("/api/admin/seo/gsc/connect", verifyToken, async (req, res) => {
    if (!configured()) return fail(res, 400, "Search Console is not configured on the server (GSC_CLIENT_ID, GSC_CLIENT_SECRET, GSC_REDIRECT_URI, GSC_TOKEN_KEY).");
    const state = crypto.randomBytes(24).toString("hex");
    await query("DELETE FROM seo_oauth_states WHERE createdAt < ?", [Date.now() - 15 * 60 * 1000]);
    await query("INSERT INTO seo_oauth_states (state, admin, createdAt) VALUES (?, ?, ?)", [state, adminOf(req), Date.now()]);
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.search = new URLSearchParams({
      client_id: env("GSC_CLIENT_ID"),
      redirect_uri: env("GSC_REDIRECT_URI"),
      response_type: "code",
      scope: SCOPE,
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: "true",
      state,
    }).toString();
    res.json({ success: true, url: url.toString() });
  });

  router.get("/api/seo/gsc/callback", async (req, res) => {
    const back = (status, detail = "") => {
      const target = env("GSC_ADMIN_RETURN_URL") || "/";
      const sep = target.includes("?") ? "&" : "?";
      res.redirect(`${target}${sep}gsc=${encodeURIComponent(status)}${detail ? `&detail=${encodeURIComponent(detail.slice(0, 200))}` : ""}`);
    };
    try {
      const state = String(req.query.state || "");
      const code = String(req.query.code || "");
      if (req.query.error) return back("denied", String(req.query.error));
      if (!/^[a-f0-9]{48}$/.test(state) || !code) return back("error", "Invalid callback");
      const row = (await query("SELECT * FROM seo_oauth_states WHERE state = ?", [state]))[0];
      await query("DELETE FROM seo_oauth_states WHERE state = ?", [state]);
      if (!row || Date.now() - Number(row.createdAt) > 15 * 60 * 1000) return back("error", "The connection request expired. Try again.");
      const { data } = await axios.post(
        "https://oauth2.googleapis.com/token",
        new URLSearchParams({
          code,
          client_id: env("GSC_CLIENT_ID"),
          client_secret: env("GSC_CLIENT_SECRET"),
          redirect_uri: env("GSC_REDIRECT_URI"),
          grant_type: "authorization_code",
        }).toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" }, timeout: 20000 }
      );
      if (!data.refresh_token) return back("error", "Google did not return a refresh token. Remove the app's access in your Google account and connect again.");
      const sites = await axios.get("https://www.googleapis.com/webmasters/v3/sites", { headers: { Authorization: `Bearer ${data.access_token}` }, timeout: 20000 });
      const entries = (sites.data.siteEntry || []).filter((s) => s.permissionLevel !== "siteUnverifiedUser");
      const preferred = env("GSC_PROPERTY");
      const property =
        (preferred && entries.find((s) => s.siteUrl === preferred) && preferred) ||
        (entries.find((s) => s.siteUrl === "sc-domain:geniemedia.in") || entries.find((s) => /^https:\/\/geniemedia\.in\/?$/.test(s.siteUrl)) || entries[0] || {}).siteUrl ||
        null;
      await saveIntegration("connected", {
        refreshToken: encrypt(data.refresh_token),
        property,
        properties: entries.map((s) => ({ siteUrl: s.siteUrl, permissionLevel: s.permissionLevel })),
        connectedBy: row.admin,
        connectedAt: Date.now(),
        lastError: property ? null : "No verified Search Console property was found for this Google account.",
      });
      back("connected");
    } catch (err) {
      console.error("GSC callback failed:", err.response ? err.response.data : err.message);
      back("error", "Google sign-in failed. Check the OAuth client settings.");
    }
  });

  router.post("/api/admin/seo/gsc/property", verifyToken, async (req, res) => {
    try {
      const integ = await getIntegration();
      if (!integ || integ.status !== "connected") return fail(res, 409, "Search Console is not connected.");
      const property = String((req.body && req.body.property) || "");
      if (!(integ.data.properties || []).some((p) => p.siteUrl === property)) return fail(res, 400, "That property is not available for the connected account.");
      await saveIntegration("connected", { ...integ.data, property, lastError: null });
      res.json({ success: true, property });
    } catch (err) {
      fail(res, 500, "Failed to change the property");
    }
  });

  router.post("/api/admin/seo/gsc/disconnect", verifyToken, async (req, res) => {
    try {
      const integ = await getIntegration();
      if (integ && integ.data.refreshToken) {
        try {
          await axios.post(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(decrypt(integ.data.refreshToken))}`, null, { timeout: 15000 });
        } catch (_) {}
      }
      await saveIntegration("not_connected", { disconnectedBy: adminOf(req), disconnectedAt: Date.now() });
      res.json({ success: true });
    } catch (err) {
      fail(res, 500, "Failed to disconnect");
    }
  });

  // ---------- Search Analytics sync ----------
  const syncSearchAnalytics = async (days = 90) => {
    const integ = await getIntegration();
    if (!integ || !integ.data.property) throw Object.assign(new Error("Search Console is not connected."), { code: "NOT_CONNECTED" });
    const site = encodeURIComponent(integ.data.property);
    const startDate = ymd(daysAgo(Math.min(480, Math.max(7, days)) + 3));
    const endDate = ymd(daysAgo(1));
    let startRow = 0;
    let total = 0;
    for (let page = 0; page < 8; page++) {
      const { data } = await google("post", `https://www.googleapis.com/webmasters/v3/sites/${site}/searchAnalytics/query`, {
        startDate,
        endDate,
        dimensions: ["date", "query", "page", "country", "device"],
        rowLimit: 25000,
        startRow,
        dataState: "final",
      });
      const rows = data.rows || [];
      if (!rows.length) break;
      const values = rows.map((r) => [r.keys[0], String(r.keys[1]).slice(0, 255), String(r.keys[2]).slice(0, 500), String(r.keys[3]).slice(0, 3), String(r.keys[4]).slice(0, 10), r.clicks, r.impressions, r.ctr, r.position]);
      for (let i = 0; i < values.length; i += 1000) {
        await query(
          `INSERT INTO seo_gsc_rows (date, query, page, country, device, clicks, impressions, ctr, position) VALUES ?
           ON DUPLICATE KEY UPDATE clicks = VALUES(clicks), impressions = VALUES(impressions), ctr = VALUES(ctr), position = VALUES(position)`,
          [values.slice(i, i + 1000)]
        );
      }
      total += rows.length;
      if (rows.length < 25000) break;
      startRow += 25000;
    }
    await saveIntegration("connected", { ...(await getIntegration()).data, lastSyncAt: Date.now(), lastSyncRows: total, lastSyncRange: [startDate, endDate], lastError: null });
    return { rows: total, startDate, endDate };
  };

  router.post("/api/admin/seo/gsc/sync", verifyToken, async (req, res) => {
    try {
      const result = await syncSearchAnalytics(Number(req.body && req.body.days) || 90);
      res.json({ success: true, ...result });
    } catch (err) {
      const integ = await getIntegration().catch(() => null);
      if (integ && integ.status === "connected") await saveIntegration("connected", { ...integ.data, lastError: err.message }).catch(() => {});
      handleError(res, err, "Search Console sync failed");
    }
  });

  // ---------- reporting ----------
  const filters = (q) => {
    const days = Math.min(480, Math.max(1, Number(q.days) || 28));
    const where = ["date >= ?"];
    const params = [ymd(daysAgo(days + 3))];
    if (q.country) {
      where.push("country = ?");
      params.push(String(q.country).toLowerCase().slice(0, 3));
    }
    if (q.device) {
      where.push("device = ?");
      params.push(String(q.device).toUpperCase().slice(0, 10));
    }
    if (q.page) {
      where.push("page LIKE ?");
      params.push(`%${String(q.page).slice(0, 200)}%`);
    }
    if (q.query) {
      where.push("query LIKE ?");
      params.push(`%${String(q.query).slice(0, 150)}%`);
    }
    return { days, where: where.join(" AND "), params };
  };

  router.get("/api/admin/seo/gsc/performance", verifyToken, async (req, res) => {
    try {
      const integ = await getIntegration();
      if (!integ || integ.status !== "connected") return res.json({ success: true, connected: false });
      const f = filters(req.query);
      const totals = (await query(`SELECT SUM(clicks) AS clicks, SUM(impressions) AS impressions, SUM(position * impressions) / NULLIF(SUM(impressions), 0) AS position, MIN(date) AS first, MAX(date) AS last FROM seo_gsc_rows WHERE ${f.where}`, f.params))[0];
      const series = await query(`SELECT date, SUM(clicks) AS clicks, SUM(impressions) AS impressions, SUM(position * impressions) / NULLIF(SUM(impressions), 0) AS position FROM seo_gsc_rows WHERE ${f.where} GROUP BY date ORDER BY date`, f.params);
      const topQueries = await query(`SELECT query, SUM(clicks) AS clicks, SUM(impressions) AS impressions, SUM(position * impressions) / NULLIF(SUM(impressions), 0) AS position FROM seo_gsc_rows WHERE ${f.where} GROUP BY query ORDER BY clicks DESC, impressions DESC LIMIT 50`, f.params);
      const topPages = await query(`SELECT page, SUM(clicks) AS clicks, SUM(impressions) AS impressions, SUM(position * impressions) / NULLIF(SUM(impressions), 0) AS position FROM seo_gsc_rows WHERE ${f.where} GROUP BY page ORDER BY clicks DESC, impressions DESC LIMIT 50`, f.params);
      const ctr = (r) => (Number(r.impressions) ? Number(r.clicks) / Number(r.impressions) : 0);
      const shape = (r) => ({ ...r, clicks: Number(r.clicks || 0), impressions: Number(r.impressions || 0), ctr: ctr(r), position: r.position === null ? null : Number(r.position) });
      res.json({
        success: true,
        connected: true,
        property: integ.data.property,
        lastSyncAt: integ.data.lastSyncAt || null,
        range: { from: totals.first, to: totals.last, days: f.days },
        totals: shape(totals),
        series: series.map(shape),
        topQueries: topQueries.map(shape),
        topPages: topPages.map(shape),
      });
    } catch (err) {
      fail(res, 500, "Failed to load performance data");
    }
  });

  // Opportunities are derived only from synced rows. Every item carries the
  // numbers it is based on; nothing predicts a ranking.
  router.get("/api/admin/seo/gsc/opportunities", verifyToken, async (req, res) => {
    try {
      const integ = await getIntegration();
      if (!integ || integ.status !== "connected") return res.json({ success: true, connected: false, items: [] });
      const days = Math.min(180, Math.max(7, Number(req.query.days) || 28));
      const country = String(req.query.country === undefined ? "ind" : req.query.country).toLowerCase().slice(0, 3);
      const cWhere = country ? " AND country = ?" : "";
      const cParam = country ? [country] : [];
      const cur = [ymd(daysAgo(days + 3)), ymd(daysAgo(1))];
      const prev = [ymd(daysAgo(2 * days + 3)), ymd(daysAgo(days + 4))];
      const agg = (range, group) =>
        query(
          `SELECT ${group}, SUM(clicks) AS clicks, SUM(impressions) AS impressions, SUM(position * impressions) / NULLIF(SUM(impressions), 0) AS position
           FROM seo_gsc_rows WHERE date BETWEEN ? AND ?${cWhere} GROUP BY ${group}`,
          [...range, ...cParam]
        );
      const qp = await agg(cur, "query, page");
      const qCur = await agg(cur, "query");
      const qPrev = await agg(prev, "query");
      const pCur = await agg(cur, "page");
      const pPrev = await agg(prev, "page");
      const keywords = await query("SELECT keyword_norm FROM seo_keywords WHERE status = 'ACTIVE'");
      const planned = keywords.map((k) => k.keyword_norm);
      const items = [];
      const num = (v) => Number(v || 0);
      const ctrOf = (r) => (num(r.impressions) ? num(r.clicks) / num(r.impressions) : 0);
      const bucket = (pos) => (pos < 3.5 ? "1-3" : pos < 10.5 ? "4-10" : pos < 20.5 ? "11-20" : "21+");
      const bucketCtr = {};
      for (const r of qp) {
        const b = bucket(num(r.position));
        bucketCtr[b] = bucketCtr[b] || { c: 0, i: 0 };
        bucketCtr[b].c += num(r.clicks);
        bucketCtr[b].i += num(r.impressions);
      }
      const evidence = (r, extra = {}) => ({ clicks: num(r.clicks), impressions: num(r.impressions), ctr: ctrOf(r), position: r.position === null ? null : Math.round(num(r.position) * 10) / 10, period: `${cur[0]} to ${cur[1]}`, country: country || "all", ...extra });
      for (const r of qp) {
        const imp = num(r.impressions);
        const pos = num(r.position);
        const b = bucketCtr[bucket(pos)];
        const siteCtr = b && b.i ? b.c / b.i : 0;
        if (imp >= 50 && pos <= 10.5 && ctrOf(r) < siteCtr * 0.5) {
          items.push({ type: "low_ctr", priority: "high", query: r.query, page: r.page, title: "Good visibility, few clicks", action: "Rewrite the title and description so they answer this search more directly.", evidence: evidence(r, { siteCtrAtThisPosition: siteCtr }) });
        }
        if (imp >= 20 && pos > 7.5 && pos <= 20.5) {
          items.push({ type: "striking_distance", priority: imp >= 100 ? "high" : "medium", query: r.query, page: r.page, title: "Close to page one", action: "Strengthen this page for the query: cover it in a heading and a short section, and add an internal link with a natural anchor.", evidence: evidence(r) });
        }
      }
      const prevByQuery = Object.fromEntries(qPrev.map((r) => [r.query, r]));
      for (const r of qCur) {
        const before = prevByQuery[r.query];
        const now = num(r.impressions);
        const then = before ? num(before.impressions) : 0;
        if (now >= 30 && now >= then * 1.5 && now - then >= 20) {
          items.push({ type: "rising", priority: "medium", query: r.query, title: "Rising query", action: "Check that the ranking page fully answers this search.", evidence: evidence(r, { previousImpressions: then }) });
        }
        const norm = String(r.query).toLowerCase();
        if (now >= 20 && !planned.some((k) => norm.includes(k) || k.includes(norm))) {
          items.push({ type: "unmapped", priority: "low", query: r.query, title: "Not in your keyword plan", action: "If it matches a service you offer, add it to the right page's keywords; otherwise ignore it.", evidence: evidence(r) });
        }
        if (now >= 10 && COMMERCIAL.test(norm)) {
          items.push({ type: "commercial", priority: "medium", query: r.query, title: "Commercial-intent query", action: "Make sure a service page, not a blog post, is the best match.", evidence: evidence(r) });
        }
        if (now >= 10 && QUESTION.test(norm)) {
          items.push({ type: "question", priority: "low", query: r.query, title: "Question people ask", action: "Answer it in a FAQ or a blog post if you can answer it accurately.", evidence: evidence(r) });
        }
      }
      const prevByPage = Object.fromEntries(pPrev.map((r) => [r.page, r]));
      for (const r of pCur) {
        const before = prevByPage[r.page];
        if (before && num(before.clicks) >= 10 && num(r.clicks) <= num(before.clicks) * 0.7) {
          items.push({ type: "declining_page", priority: "high", page: r.page, title: "Clicks are down", action: "Compare with the previous period: check for changes to the page, its title, or indexing.", evidence: evidence(r, { previousClicks: num(before.clicks), previousImpressions: num(before.impressions) }) });
        }
      }
      const pagesPerQuery = {};
      for (const r of qp) if (num(r.impressions) >= 10) (pagesPerQuery[r.query] = pagesPerQuery[r.query] || []).push(r);
      for (const [q, rows] of Object.entries(pagesPerQuery)) {
        if (rows.length > 1) {
          items.push({ type: "cannibalization", priority: "medium", query: q, title: "Several pages compete for one query", action: "Decide which page should rank; link the others to it or consolidate overlapping content.", evidence: { pages: rows.map((r) => ({ page: r.page, impressions: num(r.impressions), position: Math.round(num(r.position) * 10) / 10 })), period: `${cur[0]} to ${cur[1]}` } });
        }
      }
      const volumes = await keywordDataProvider.lookup([]);
      const rank = { high: 0, medium: 1, low: 2 };
      items.sort((a, b) => rank[a.priority] - rank[b.priority] || num((b.evidence || {}).impressions) - num((a.evidence || {}).impressions));
      res.json({ success: true, connected: true, lastSyncAt: integ.data.lastSyncAt || null, period: { current: cur, previous: prev }, country: country || "all", items: items.slice(0, 300), volumeProvider: keywordDataProvider.name, volumes });
    } catch (err) {
      fail(res, 500, "Failed to compute opportunities");
    }
  });

  // ---------- URL Inspection ----------
  router.post("/api/admin/seo/gsc/inspect", verifyToken, async (req, res) => {
    try {
      const url = String((req.body && req.body.url) || "");
      if (!/^https:\/\/geniemedia\.in(\/|$)/.test(url)) return fail(res, 400, "Inspect a https://geniemedia.in URL.");
      const recent = (await query("SELECT * FROM seo_gsc_inspections WHERE url = ? ORDER BY id DESC LIMIT 1", [url]))[0];
      if (recent && Date.now() - Number(recent.inspectedAt) < 10 * 60 * 1000 && !(req.body && req.body.force)) {
        return res.json({ success: true, cached: true, url, inspectedAt: recent.inspectedAt, result: typeof recent.result === "string" ? JSON.parse(recent.result) : recent.result });
      }
      const integ = await getIntegration();
      if (!integ || !integ.data.property) return fail(res, 409, "Search Console is not connected.", { connected: false });
      const { data } = await google("post", "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", { inspectionUrl: url, siteUrl: integ.data.property, languageCode: "en" });
      const result = data.inspectionResult || {};
      const idx = result.indexStatusResult || {};
      await query("INSERT INTO seo_gsc_inspections (url, verdict, coverage, result, inspectedAt) VALUES (?, ?, ?, ?, ?)", [url, idx.verdict || null, (idx.coverageState || "").slice(0, 200), JSON.stringify(result), Date.now()]);
      res.json({
        success: true,
        url,
        inspectedAt: Date.now(),
        result,
        requestIndexingUrl: `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(integ.data.property)}&id=${encodeURIComponent(url)}`,
      });
    } catch (err) {
      handleError(res, err, "URL inspection failed");
    }
  });

  router.get("/api/admin/seo/gsc/inspections", verifyToken, async (req, res) => {
    try {
      const rows = await query("SELECT id, url, verdict, coverage, inspectedAt FROM seo_gsc_inspections ORDER BY id DESC LIMIT 100");
      res.json(rows);
    } catch (err) {
      fail(res, 500, "Failed to load inspections");
    }
  });

  router.get("/api/admin/seo/gsc/sitemaps", verifyToken, async (req, res) => {
    try {
      const integ = await getIntegration();
      if (!integ || !integ.data.property) return res.json({ success: true, connected: false, sitemaps: [] });
      const { data } = await google("get", `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(integ.data.property)}/sitemaps`);
      res.json({ success: true, connected: true, sitemaps: data.sitemap || [] });
    } catch (err) {
      handleError(res, err, "Sitemap status failed");
    }
  });

  return { router, syncSearchAnalytics, getIntegration };
};

module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
module.exports.configured = configured;
