// =========================================================================
// ========================= AI ASSIST (GEMINI) ============================
// Suggestions are drafts. Nothing here writes to a published configuration,
// a page or a keyword: the admin reviews each suggestion and applies it to a
// draft, which still needs their explicit Save / Publish.
//
// Every prompt is grounded in the page's real content (fetched from the live
// site), its current SEO configuration, its active keywords, Search Console
// queries when connected, and the business facts in config/site.js. The model
// is told not to invent facts, and every answer is checked: figures and claims
// that do not appear in that context are flagged for the admin.
// =========================================================================

const express = require("express");
const axios = require("axios");
const { Type } = require("@google/genai");
const { inspectHtml } = require("../services/htmlInspect");

const KEYWORD_TYPES = ["PRIMARY", "SECONDARY", "RELATED", "LONG_TAIL", "LOCAL", "QUESTION", "SEMANTIC", "BRANDED", "SUPPORTING"];
const INTENTS = ["INFORMATIONAL", "COMMERCIAL", "TRANSACTIONAL", "NAVIGATIONAL", "LOCAL"];
const FIX_FIELDS = ["seoTitle", "metaDescription", "preferredH1", "primaryTopic", "secondaryTopics", "none"];
const CLAIM_WORDS = ["best", "top", "#1", "number one", "leading", "award", "award-winning", "guaranteed", "guarantee", "certified", "official partner", "cheapest", "fastest", "largest", "trusted by", "years of experience", "happy clients"];
const PAGE_TTL_MS = 10 * 60 * 1000;
const PROMPT_VERSION = 1;

const S = (description) => ({ type: Type.STRING, description });
const ARR = (items, description) => ({ type: Type.ARRAY, items, description });
const OBJ = (properties, required) => ({ type: Type.OBJECT, properties, required: required || Object.keys(properties) });

const TASKS = {
  metadata: {
    label: "SEO title & meta description",
    ask: "Suggest 3 SEO titles (50–60 characters) and 3 meta descriptions (140–160 characters) for this page. Each must describe what the page actually offers, use the primary topic naturally, and avoid keyword stuffing. Give a one-sentence rationale for each.",
    schema: OBJ({
      titles: ARR(OBJ({ text: S("title"), rationale: S("why") })),
      descriptions: ARR(OBJ({ text: S("meta description"), rationale: S("why") })),
    }),
  },
  topics: {
    label: "Topics & keywords",
    ask: "Suggest the page's primary topic, up to 6 secondary topics, and up to 12 keyword ideas that this page's existing content genuinely supports. Mark each keyword's type and search intent. Do not claim search volume or ranking potential.",
    schema: OBJ({
      primaryTopic: OBJ({ text: S("primary topic"), rationale: S("why") }),
      secondaryTopics: ARR(OBJ({ text: S("topic"), rationale: S("why") })),
      keywords: ARR(OBJ({ keyword: S("keyword phrase"), type: { type: Type.STRING, enum: KEYWORD_TYPES }, intent: { type: Type.STRING, enum: INTENTS }, rationale: S("why it fits this page's content") })),
    }),
  },
  intent: {
    label: "Search intent",
    ask: "Analyse which search intent this page serves best, how well its content and metadata match that intent, and what to change. Base the analysis only on the content given.",
    schema: OBJ({
      intent: { type: Type.STRING, enum: INTENTS },
      confidence: { type: Type.STRING, enum: ["low", "medium", "high"] },
      reasoning: S("why"),
      mismatches: ARR(S("where content or metadata does not match the intent")),
      recommendations: ARR(S("concrete change")),
    }),
  },
  content_gap: {
    label: "Content gaps",
    ask: "Identify subtopics a visitor searching for this page's primary topic would expect but the page does not cover yet. For each gap explain why it matters and suggest a section heading. Only suggest content the business could truthfully write given its stated services.",
    schema: OBJ({
      coverageSummary: S("short summary of what the page already covers"),
      gaps: ARR(OBJ({ topic: S("missing subtopic"), why: S("why visitors expect it"), suggestedHeading: S("section heading") })),
    }),
  },
  faq_outline: {
    label: "FAQs & blog outlines",
    ask: "Suggest up to 6 FAQ questions this page's visitors are likely to ask, each with a short answer drafted ONLY from facts in the page content (if the content does not contain the answer, set answer to an empty string and say what information is needed in 'needs'). Also suggest up to 3 blog post outlines that would support this page.",
    schema: OBJ({
      faqs: ARR(OBJ({ question: S("question"), answer: S("answer from page facts, or empty"), needs: S("information the business must supply, or empty") })),
      blogOutlines: ARR(OBJ({ title: S("post title"), audience: S("who it is for"), outline: ARR(S("section")) })),
    }),
  },
  internal_links: {
    label: "Internal links",
    ask: "From the list of existing pages provided, choose up to 6 pages this page should link to. Use only URLs from that list. Suggest natural, varied anchor text and explain the relevance.",
    schema: OBJ({ links: ARR(OBJ({ target: S("URL exactly as listed"), anchor: S("anchor text"), reason: S("why it helps the visitor") })) }),
  },
  fix_warning: {
    label: "Explain & draft a fix",
    ask: "Explain the SEO warning below in plain language for a non-technical admin, then propose a fix. If the fix is a new value for one of the configuration fields, set 'field' and 'proposedValue' (for secondaryTopics, a comma-separated list). If it needs a content change, set field to 'none' and describe the steps.",
    schema: OBJ({
      explanation: S("plain-language explanation"),
      field: { type: Type.STRING, enum: FIX_FIELDS },
      proposedValue: S("new value or empty"),
      steps: ARR(S("step")),
    }),
  },
  quality: {
    label: "Content quality & topical coverage",
    ask: "Review the page content for quality and topical coverage of its primary topic: strengths, weaknesses, which expected subtopics are covered, and prioritised recommendations. Do not give a numeric score.",
    schema: OBJ({
      strengths: ARR(S("strength")),
      weaknesses: ARR(S("weakness")),
      coverage: ARR(OBJ({ subtopic: S("subtopic"), covered: { type: Type.BOOLEAN }, note: S("note") })),
      recommendations: ARR(S("recommendation")),
    }),
  },
};

const SYSTEM = (site) => `You are an SEO assistant inside the admin dashboard of ${site.name}, a business in ${site.address.addressLocality}, ${site.address.addressRegion}, India.
Rules you must follow:
- Use ONLY facts present in the PAGE CONTENT, CURRENT SEO CONFIGURATION, KEYWORDS, SEARCH CONSOLE DATA and BUSINESS FACTS sections. Never invent clients, results, statistics, prices, years, awards, certifications, team members, testimonials, reviews, locations or services.
- If something needed is missing, say what information the business must supply instead of guessing.
- Never claim a keyword has search volume, difficulty or ranking potential unless SEARCH CONSOLE DATA shows it, and then cite those numbers.
- No keyword stuffing, no hidden text, no misleading superlatives.
- Write in clear British/Indian English for a non-technical admin.
- Output must match the JSON schema exactly.`;

const clip = (v, max) => String(v === null || v === undefined ? "" : v).replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
const safeText = (v, max) => clip(v, max).replace(/[<>]/g, "");
const list = (v, n) => (Array.isArray(v) ? v.slice(0, n) : []);

module.exports = function seoAiRoutes({ db, verifyToken, siteUrl, site, ai }) {
  const router = express.Router();
  const host = new URL(siteUrl).host;
  const query = (sql, params = []) =>
    new Promise((resolve, reject) => db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows))));
  const fail = (res, status, message, extra = {}) => res.status(status).json({ success: false, message, ...extra });
  const adminOf = (req) => String((req.user && (req.user.email || req.user.id)) || "unknown").slice(0, 190);
  const parse = (v, d) => {
    if (v === null || v === undefined) return d;
    if (typeof v === "object") return v;
    try {
      return JSON.parse(v);
    } catch (_) {
      return d;
    }
  };
  const tableExists = async (name) => (await query("SHOW TABLES LIKE ?", [name])).length > 0;

  const pageCache = new Map();
  const pageContent = async (path) => {
    const hit = pageCache.get(path);
    if (hit && Date.now() - hit.at < PAGE_TTL_MS) return hit.value;
    const url = `${siteUrl}${path === "/" ? "/" : path}`;
    if (new URL(url).host !== host) throw new Error("off-site");
    const r = await axios.get(url, { timeout: 20000, maxRedirects: 3, responseType: "text", headers: { "User-Agent": "GenieMediaSeoAssistant/1.0" }, validateStatus: () => true });
    if (r.status !== 200) return { url, available: false, status: r.status };
    const i = inspectHtml(String(r.data || ""), url);
    const value = {
      url,
      available: true,
      title: i.titles[0] || "",
      description: i.descriptions[0] || "",
      h1: i.h1.slice(0, 3),
      h2: i.h2.slice(0, 30),
      wordCount: i.wordCount,
      text: i.visibleText.slice(0, 12000),
    };
    pageCache.set(path, { at: Date.now(), value });
    return value;
  };

  const draftFromBody = (d) => {
    if (!d || typeof d !== "object") return null;
    return {
      seoTitle: clip(d.seoTitle, 120),
      metaDescription: clip(d.metaDescription, 300),
      preferredH1: clip(d.preferredH1, 160),
      primaryTopic: clip(d.primaryTopic, 120),
      primaryKeyword: clip(d.primaryKeyword, 120),
      secondaryTopics: list(d.secondaryTopics, 12).map((x) => clip(x, 80)).filter(Boolean),
      searchIntent: clip(d.searchIntent, 20),
      pageType: clip(d.pageType, 40),
    };
  };

  const buildContext = async (pageId, draft, task) => {
    const page = (await query("SELECT * FROM seo_pages WHERE id = ?", [pageId]))[0];
    if (!page) return null;
    const configRow = async (status) => (await query("SELECT payload FROM seo_page_configs WHERE page_id = ? AND status = ? ORDER BY id DESC LIMIT 1", [pageId, status]))[0];
    const stored = (await configRow("draft")) || (await configRow("published"));
    const config = draft || draftFromBody(stored ? parse(stored.payload, {}) : {}) || {};
    const keywords = (await query("SELECT keyword, keyword_type, search_intent FROM seo_keywords WHERE page_id = ? AND status = 'ACTIVE' ORDER BY keyword_type", [pageId])).slice(0, 60);
    let content;
    try {
      content = await pageContent(page.path);
    } catch (_) {
      content = { available: false };
    }
    let gsc = null;
    if (await tableExists("seo_gsc_rows")) {
      const since = new Date(Date.now() - 93 * 864e5).toISOString().slice(0, 10);
      const pageUrl = `${siteUrl}${page.path === "/" ? "/" : page.path}`;
      const rows = await query(
        `SELECT query, SUM(clicks) AS clicks, SUM(impressions) AS impressions, SUM(position * impressions) / NULLIF(SUM(impressions), 0) AS position
         FROM seo_gsc_rows WHERE date >= ? AND page = ? GROUP BY query ORDER BY SUM(impressions) DESC LIMIT 20`,
        [since, pageUrl]
      ).catch(() => []);
      if (rows.length) gsc = rows.map((r) => ({ query: r.query, clicks: Number(r.clicks), impressions: Number(r.impressions), position: Math.round(Number(r.position) * 10) / 10 }));
    }
    let candidates = null;
    if (task === "internal_links") {
      const pages = (await query("SELECT path, name FROM seo_pages")).filter((p) => p.path !== page.path).map((p) => ({ url: `${siteUrl}${p.path === "/" ? "/" : p.path}`, title: p.name }));
      const studies = (await tableExists("case_studies")) ? (await query("SELECT slug, title FROM case_studies WHERE status = 'published'")).map((c) => ({ url: `${siteUrl}/case-studies/${c.slug}`, title: c.title })) : [];
      const blogs = (await query("SELECT title, permalink FROM blogs WHERE status = 'published' ORDER BY createdAt DESC LIMIT 60").catch(() => [])).map((b) => ({ url: `${siteUrl}/blog/${String(b.permalink || "").replace(/^\/+|\/+$/g, "").replace(/^blog\//, "")}`, title: b.title }));
      candidates = [...pages, ...studies, ...blogs].slice(0, 120);
    }
    const business = {
      name: site.name,
      description: site.description,
      locality: `${site.address.addressLocality}, ${site.address.addressRegion}`,
      telephone: site.contact.telephone,
      email: site.contact.email,
      website: siteUrl,
    };
    return { page: { id: page.id, path: page.path, name: page.name }, config, keywords, content, gsc, candidates, business };
  };

  const promptFor = (task, ctx, issue) => {
    const parts = [
      `TASK: ${TASKS[task].ask}`,
      `PAGE: ${ctx.page.name} (${ctx.page.path})`,
      `BUSINESS FACTS: ${JSON.stringify(ctx.business)}`,
      `CURRENT SEO CONFIGURATION: ${JSON.stringify(ctx.config)}`,
      `KEYWORDS (planned by the team, no volume data): ${JSON.stringify(ctx.keywords)}`,
      ctx.gsc ? `SEARCH CONSOLE DATA (last 90 days, this page): ${JSON.stringify(ctx.gsc)}` : "SEARCH CONSOLE DATA: not connected — make no claims about search volume or rankings.",
      ctx.content.available
        ? `PAGE CONTENT (live page): title=${JSON.stringify(ctx.content.title)} description=${JSON.stringify(ctx.content.description)} h1=${JSON.stringify(ctx.content.h1)} h2=${JSON.stringify(ctx.content.h2)} words=${ctx.content.wordCount}\nVISIBLE TEXT:\n${ctx.content.text}`
        : "PAGE CONTENT: the live page could not be read; base suggestions only on the configuration and say so.",
    ];
    if (ctx.candidates) parts.push(`EXISTING PAGES YOU MAY LINK TO: ${JSON.stringify(ctx.candidates)}`);
    if (issue) parts.push(`SEO WARNING: ${JSON.stringify(issue)}`);
    return parts.join("\n\n");
  };

  // Figures and promotional claims in a suggestion must be traceable to the
  // context the model was given; anything else is flagged for review.
  const unverified = (values, source) => {
    const hay = source.toLowerCase();
    const out = new Set();
    for (const v of values) {
      const s = String(v || "");
      for (const m of s.match(/[₹$]?\d[\d,.]*\s?(%|\+|k|lakh|crore|years?|clients?|projects?)?/gi) || []) {
        const digits = m.replace(/[^\d.]/g, "").replace(/\.$/, "");
        if (digits && !hay.includes(digits)) out.add(m.trim());
      }
      for (const w of CLAIM_WORDS) if (new RegExp(`(^|\\W)${w.replace(/[.*+?^${}()|[\]\\#]/g, "\\$&")}(\\W|$)`, "i").test(s) && !hay.includes(w)) out.add(w);
    }
    return [...out];
  };

  const clean = (task, data, ctx) => {
    const notes = [];
    if (task === "metadata") {
      const t = list(data.titles, 5).map((x) => ({ text: safeText(x.text, 90), rationale: clip(x.rationale, 300) })).filter((x) => x.text);
      const d = list(data.descriptions, 5).map((x) => ({ text: safeText(x.text, 220), rationale: clip(x.rationale, 300) })).filter((x) => x.text);
      const brand = ctx.business.name;
      const [brandHead, brandTail] = brand.split(/\s*&\s*/);
      const variant = brandTail ? new RegExp(`${brandHead}[^a-z0-9]*(and[^a-z0-9]*)?${brandTail}`, "gi") : null;
      const misnamed = variant ? [...t, ...d].filter((x) => (x.text.match(variant) || []).some((m) => m !== brand)) : [];
      if (misnamed.length) notes.push(`Check before using: ${misnamed.length} suggestion(s) write the business name differently from “${brand}”.`);
      return { result: { titles: t.map((x) => ({ ...x, length: x.text.length, lengthOk: x.text.length >= 30 && x.text.length <= 65, nameOk: !misnamed.includes(x) })), descriptions: d.map((x) => ({ ...x, length: x.text.length, lengthOk: x.text.length >= 110 && x.text.length <= 165, nameOk: !misnamed.includes(x) })) }, check: [...t, ...d].map((x) => x.text), notes };
    }
    if (task === "topics") {
      const kw = list(data.keywords, 15)
        .map((k) => ({ keyword: safeText(k.keyword, 100).toLowerCase(), type: KEYWORD_TYPES.includes(k.type) ? k.type : "RELATED", intent: INTENTS.includes(k.intent) ? k.intent : "INFORMATIONAL", rationale: clip(k.rationale, 300) }))
        .filter((k) => k.keyword && k.keyword.split(" ").length <= 10);
      const existing = new Set(ctx.keywords.map((k) => String(k.keyword).toLowerCase()));
      notes.push("Keyword ideas are AI suggestions: no search volume or ranking data is implied. Check them against Search Console before relying on them.");
      return {
        result: {
          primaryTopic: { text: safeText(data.primaryTopic && data.primaryTopic.text, 100), rationale: clip(data.primaryTopic && data.primaryTopic.rationale, 300) },
          secondaryTopics: list(data.secondaryTopics, 8).map((x) => ({ text: safeText(x.text, 80), rationale: clip(x.rationale, 300) })).filter((x) => x.text),
          keywords: kw.map((k) => ({ ...k, alreadyPlanned: existing.has(k.keyword), seenInSearchConsole: Boolean(ctx.gsc && ctx.gsc.some((g) => String(g.query).toLowerCase() === k.keyword)) })),
        },
        check: [],
        notes,
      };
    }
    if (task === "intent") {
      return {
        result: {
          intent: INTENTS.includes(data.intent) ? data.intent : null,
          confidence: ["low", "medium", "high"].includes(data.confidence) ? data.confidence : "low",
          reasoning: clip(data.reasoning, 800),
          mismatches: list(data.mismatches, 8).map((x) => clip(x, 300)),
          recommendations: list(data.recommendations, 8).map((x) => clip(x, 300)),
        },
        check: list(data.recommendations, 8),
        notes,
      };
    }
    if (task === "content_gap") {
      const gaps = list(data.gaps, 10).map((g) => ({ topic: safeText(g.topic, 120), why: clip(g.why, 400), suggestedHeading: safeText(g.suggestedHeading, 120) })).filter((g) => g.topic);
      return { result: { coverageSummary: clip(data.coverageSummary, 800), gaps }, check: gaps.map((g) => g.suggestedHeading), notes };
    }
    if (task === "faq_outline") {
      const faqs = list(data.faqs, 8).map((f) => ({ question: safeText(f.question, 200), answer: safeText(f.answer, 800), needs: clip(f.needs, 300) })).filter((f) => f.question);
      const blogs = list(data.blogOutlines, 4).map((b) => ({ title: safeText(b.title, 150), audience: clip(b.audience, 200), outline: list(b.outline, 10).map((o) => safeText(o, 150)) })).filter((b) => b.title);
      return { result: { faqs, blogOutlines: blogs }, check: faqs.map((f) => f.answer), notes };
    }
    if (task === "internal_links") {
      const allowed = new Map((ctx.candidates || []).map((c) => [c.url.replace(/\/+$/, ""), c]));
      const raw = list(data.links, 10);
      const links = raw
        .map((l) => ({ target: String(l.target || "").replace(/\/+$/, ""), anchor: safeText(l.anchor, 90), reason: clip(l.reason, 300) }))
        .filter((l) => allowed.has(l.target) && l.anchor)
        .map((l) => ({ ...l, title: allowed.get(l.target).title }));
      if (links.length < raw.length) notes.push(`${raw.length - links.length} suggestion(s) pointed to pages that do not exist on the site and were removed.`);
      return { result: { links }, check: [], notes };
    }
    if (task === "fix_warning") {
      const field = FIX_FIELDS.includes(data.field) ? data.field : "none";
      return { result: { explanation: clip(data.explanation, 1200), field, proposedValue: field === "none" ? "" : safeText(data.proposedValue, 300), steps: list(data.steps, 8).map((x) => clip(x, 300)) }, check: [data.proposedValue], notes };
    }
    if (task === "quality") {
      return {
        result: {
          strengths: list(data.strengths, 8).map((x) => clip(x, 300)),
          weaknesses: list(data.weaknesses, 8).map((x) => clip(x, 300)),
          coverage: list(data.coverage, 15).map((c) => ({ subtopic: clip(c.subtopic, 120), covered: Boolean(c.covered), note: clip(c.note, 300) })),
          recommendations: list(data.recommendations, 10).map((x) => clip(x, 300)),
        },
        check: list(data.recommendations, 10),
        notes,
      };
    }
    return { result: {}, check: [], notes };
  };

  router.get("/api/admin/seo/ai/status", verifyToken, async (req, res) => {
    try {
      res.json({ success: true, ...(await ai.status()), tasks: Object.fromEntries(Object.entries(TASKS).map(([k, v]) => [k, v.label])) });
    } catch (err) {
      fail(res, 500, "Failed to load AI status");
    }
  });

  router.post("/api/admin/seo/ai/test", verifyToken, async (req, res) => {
    try {
      const r = await ai.testConnection(adminOf(req));
      res.json({ success: true, message: `Connected to ${r.model}.`, model: r.model, testedAt: Date.now() });
    } catch (err) {
      const e = err instanceof ai.AiError ? err : null;
      if (!e) console.error("AI test failed:", err);
      fail(res, e ? e.httpStatus : 500, e ? e.message : "AI test failed", { code: e ? e.code : "error" });
    }
  });

  router.post("/api/admin/seo/ai/suggest", verifyToken, async (req, res) => {
    const b = req.body || {};
    const task = String(b.task || "");
    if (!TASKS[task]) return fail(res, 400, "Unknown AI task.");
    const pageId = Number(b.pageId);
    if (!Number.isInteger(pageId) || pageId <= 0) return fail(res, 400, "pageId is required.");
    if (!ai.configured()) return fail(res, 503, ai.MESSAGES.not_configured, { code: "not_configured", aiAvailable: false });
    let issue = null;
    if (task === "fix_warning") {
      const i = b.issue || {};
      issue = { id: clip(i.id, 60), title: clip(i.title, 200), detail: clip(i.detail, 600), field: clip(i.field, 40) };
      if (!issue.id || !issue.title) return fail(res, 400, "The warning to explain is missing.");
    }
    try {
      const ctx = await buildContext(pageId, draftFromBody(b.draft), task);
      if (!ctx) return fail(res, 404, "Page not found");
      const prompt = promptFor(task, ctx, issue);
      const out = await ai.generateJson({
        task,
        system: SYSTEM(site),
        prompt,
        schema: TASKS[task].schema,
        cacheInput: { v: PROMPT_VERSION, prompt },
        admin: adminOf(req),
        pageId,
        force: Boolean(b.force),
      });
      const { result, check, notes } = clean(task, out.data || {}, ctx);
      if (!out.cached && out.store) await out.store();
      const source = [ctx.content.text, ctx.content.title, ctx.content.description, JSON.stringify(ctx.config), JSON.stringify(ctx.business), JSON.stringify(ctx.keywords), JSON.stringify(ctx.gsc || [])].join(" ");
      const flagged = unverified(check, source);
      res.json({
        success: true,
        task,
        label: TASKS[task].label,
        draft: true,
        model: out.model,
        cached: out.cached,
        generatedAt: out.cached ? out.cachedAt : Date.now(),
        dataSources: { pageContent: Boolean(ctx.content.available), searchConsole: Boolean(ctx.gsc), keywords: ctx.keywords.length },
        unverified: flagged,
        notes: [
          ...notes,
          ...(ctx.content.available ? [] : ["The live page could not be read, so suggestions are based on the configuration only."]),
          ...(flagged.length ? [`Check before using: ${flagged.join(", ")} — not found in the page content or business facts.`] : []),
        ],
        result,
      });
    } catch (err) {
      const e = err instanceof ai.AiError ? err : null;
      if (!e) console.error("AI suggest failed:", err);
      fail(res, e ? e.httpStatus : 500, e ? e.message : "AI request failed", { code: e ? e.code : "error" });
    }
  });

  return router;
};
