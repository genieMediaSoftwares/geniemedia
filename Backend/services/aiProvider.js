// Gemini (Google Gen AI SDK) provider for the SEO admin. The API key is read
// from the server environment only and never leaves this process: responses
// to the browser carry the model name and status, never the key.
//
// Env:
//   GEMINI_API_KEY      required to enable AI features
//   GEMINI_MODEL        model id, e.g. gemini-3.6-flash ("Gemini 3.6 Flash" is
//                       accepted and normalised)
//   GEMINI_TIMEOUT_MS   per-request timeout (default 45000)
//   GEMINI_DAILY_LIMIT  max non-cached requests per day (default 300)
//   GEMINI_RATE_PER_MINUTE  max requests per admin per minute (default 10)

const crypto = require("crypto");

const DEFAULT_MODEL = "gemini-3.6-flash";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const normaliseModel = (raw) => {
  const v = String(raw || "").trim();
  if (!v) return DEFAULT_MODEL;
  return v.replace(/^models\//i, "").toLowerCase().replace(/\s+/g, "-");
};

const settings = () => ({
  apiKey: String(process.env.GEMINI_API_KEY || "").trim(),
  model: normaliseModel(process.env.GEMINI_MODEL),
  timeoutMs: Math.min(120000, Math.max(5000, Number(process.env.GEMINI_TIMEOUT_MS) || 45000)),
  dailyLimit: Math.max(1, Number(process.env.GEMINI_DAILY_LIMIT) || 300),
  perMinute: Math.max(1, Number(process.env.GEMINI_RATE_PER_MINUTE) || 10),
});

const configured = () => settings().apiKey.length >= 20;

class AiError extends Error {
  constructor(code, message, status = 502) {
    super(message);
    this.code = code;
    this.httpStatus = status;
  }
}

const MESSAGES = {
  not_configured: "AI unavailable: GEMINI_API_KEY is not set on the server.",
  invalid_key: "Gemini rejected the API key. Check GEMINI_API_KEY in the backend environment.",
  permission: "This API key is not allowed to use the Gemini API or this model.",
  quota: "Gemini quota or rate limit reached. Try again later or raise the quota in Google AI Studio.",
  unsupported_model: "The configured model is not available for this API key. Check GEMINI_MODEL.",
  timeout: "Gemini did not respond in time. Try again.",
  network: "Could not reach Gemini (network error).",
  blocked: "Gemini declined to answer this request (safety filter).",
  bad_output: "Gemini returned a response that could not be used. Try again.",
  provider_error: "Gemini returned a server error. Try again shortly.",
  rate_limited: "Too many AI requests. Wait a minute and try again.",
  daily_limit: "The daily AI request limit for this site has been reached.",
};

const classify = (err) => {
  if (err instanceof AiError) return err;
  const status = Number(err && (err.status || err.code)) || 0;
  const msg = String((err && err.message) || "");
  if (err && (err.name === "AbortError" || /abort|timed? ?out|ETIMEDOUT/i.test(msg))) return new AiError("timeout", MESSAGES.timeout, 504);
  if (/API[_ ]KEY[_ ]INVALID|API key not valid|invalid api key/i.test(msg)) return new AiError("invalid_key", MESSAGES.invalid_key, 502);
  if (status === 401) return new AiError("invalid_key", MESSAGES.invalid_key, 502);
  if (status === 403) return new AiError("permission", MESSAGES.permission, 502);
  if (status === 429 || /RESOURCE_EXHAUSTED|quota/i.test(msg)) return new AiError("quota", MESSAGES.quota, 429);
  if (status === 404 || /not found for API version|is not found|not supported for generateContent/i.test(msg)) return new AiError("unsupported_model", MESSAGES.unsupported_model, 502);
  if (status >= 500) return new AiError("provider_error", MESSAGES.provider_error, 502);
  if (status === 400) return new AiError("bad_request", `Gemini rejected the request: ${msg.slice(0, 200)}`, 502);
  if (/fetch failed|ENOTFOUND|ECONNRESET|ECONNREFUSED|EAI_AGAIN|network|socket/i.test(msg)) return new AiError("network", MESSAGES.network, 502);
  return new AiError("provider_error", `Gemini request failed: ${msg.slice(0, 200)}`, 502);
};

const TABLES = [
  `CREATE TABLE IF NOT EXISTS seo_ai_cache (
    cache_key  CHAR(64)    NOT NULL PRIMARY KEY,
    task       VARCHAR(40) NOT NULL,
    model      VARCHAR(80) NOT NULL,
    response   MEDIUMTEXT  NOT NULL,
    createdAt  BIGINT      NOT NULL,
    expiresAt  BIGINT      NOT NULL,
    INDEX idx_seo_ai_cache_exp (expiresAt)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS seo_ai_usage (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    admin         VARCHAR(190) NULL,
    task          VARCHAR(40)  NOT NULL,
    model         VARCHAR(80)  NOT NULL,
    page_id       INT          NULL,
    status        VARCHAR(10)  NOT NULL,
    error_code    VARCHAR(40)  NULL,
    input_tokens  INT          NULL,
    output_tokens INT          NULL,
    ms            INT          NULL,
    createdAt     BIGINT       NOT NULL,
    INDEX idx_seo_ai_usage_created (createdAt),
    INDEX idx_seo_ai_usage_task (task)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

// createAiProvider({ db, clientFactory }) — clientFactory exists for tests;
// production uses the official @google/genai client.
function createAiProvider({ db, clientFactory } = {}) {
  const query = (sql, params = []) =>
    new Promise((resolve, reject) => db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows))));
  const ready = (async () => {
    for (const sql of TABLES) await query(sql);
  })().catch((err) => console.log("❌ SEO AI TABLES ERROR:", err.message));

  let client = null;
  let clientKey = "";
  const getClient = () => {
    const { apiKey, timeoutMs } = settings();
    if (!client || clientKey !== apiKey) {
      if (clientFactory) client = clientFactory(apiKey);
      else {
        const { GoogleGenAI } = require("@google/genai");
        client = new GoogleGenAI({ apiKey, httpOptions: { timeout: timeoutMs } });
      }
      clientKey = apiKey;
    }
    return client;
  };

  const recent = new Map();
  const checkRate = async (admin) => {
    const now = Date.now();
    const list = (recent.get(admin) || []).filter((t) => now - t < 60000);
    if (list.length >= settings().perMinute) throw new AiError("rate_limited", MESSAGES.rate_limited, 429);
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const used = (await query("SELECT COUNT(*) AS n FROM seo_ai_usage WHERE createdAt >= ? AND status IN ('ok', 'error')", [since.getTime()]))[0];
    if (Number((used && used.n) || 0) >= settings().dailyLimit) throw new AiError("daily_limit", MESSAGES.daily_limit, 429);
    list.push(now);
    recent.set(admin, list);
  };

  const logUsage = (row) =>
    query(
      "INSERT INTO seo_ai_usage (admin, task, model, page_id, status, error_code, input_tokens, output_tokens, ms, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [row.admin || null, row.task, row.model, row.pageId || null, row.status, row.errorCode || null, row.inputTokens ?? null, row.outputTokens ?? null, row.ms ?? null, Date.now()]
    ).catch((err) => console.error("AI usage log failed:", err.message));

  const cacheKeyFor = (model, task, input) => crypto.createHash("sha256").update(JSON.stringify([model, task, input])).digest("hex");

  // Calls Gemini for JSON matching `schema`. Identical inputs within 7 days
  // are answered from the cache (unless force=true) and cost nothing.
  const generateJson = async ({ task, system, prompt, schema, cacheInput, admin, pageId, force = false, temperature = 0.4, maxOutputTokens = 8192 }) => {
    await ready;
    const { model, timeoutMs } = settings();
    if (!configured()) throw new AiError("not_configured", MESSAGES.not_configured, 503);
    const key = cacheKeyFor(model, task, cacheInput === undefined ? { system, prompt } : cacheInput);
    if (!force) {
      const hit = (await query("SELECT response, createdAt FROM seo_ai_cache WHERE cache_key = ? AND expiresAt > ?", [key, Date.now()]))[0];
      if (hit) {
        await logUsage({ admin, task, model, pageId, status: "cached" });
        return { data: JSON.parse(hit.response), cached: true, cachedAt: Number(hit.createdAt), model };
      }
    }
    await checkRate(admin || "unknown");
    const started = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await getClient().models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: system,
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature,
          maxOutputTokens,
          abortSignal: controller.signal,
        },
      });
    } catch (err) {
      const e = classify(err);
      await logUsage({ admin, task, model, pageId, status: "error", errorCode: e.code, ms: Date.now() - started });
      throw e;
    } finally {
      clearTimeout(timer);
    }
    const usage = response.usageMetadata || {};
    const text = typeof response.text === "string" ? response.text : "";
    const block = response.promptFeedback && response.promptFeedback.blockReason;
    let data = null;
    let errorCode = null;
    if (block || !text) errorCode = block ? "blocked" : "bad_output";
    else {
      try {
        data = JSON.parse(text);
      } catch (_) {
        errorCode = "bad_output";
      }
    }
    await logUsage({ admin, task, model, pageId, status: errorCode ? "error" : "ok", errorCode, inputTokens: usage.promptTokenCount, outputTokens: usage.candidatesTokenCount, ms: Date.now() - started });
    if (errorCode) throw new AiError(errorCode, MESSAGES[errorCode], 502);
    return { data, cached: false, model, store: () => query("REPLACE INTO seo_ai_cache (cache_key, task, model, response, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?, ?)", [key, task, model, JSON.stringify(data), Date.now(), Date.now() + CACHE_TTL_MS]).catch(() => {}) };
  };

  const status = async () => {
    await ready;
    const { model, dailyLimit } = settings();
    const lastOk = (await query("SELECT createdAt FROM seo_ai_usage WHERE task = 'test' AND status = 'ok' ORDER BY id DESC LIMIT 1"))[0];
    const lastTest = (await query("SELECT status, error_code, createdAt FROM seo_ai_usage WHERE task = 'test' ORDER BY id DESC LIMIT 1"))[0];
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const today = (await query("SELECT status, COUNT(*) AS n, SUM(input_tokens) AS input_tokens, SUM(output_tokens) AS output_tokens FROM seo_ai_usage WHERE createdAt >= ? GROUP BY status", [since.getTime()])) || [];
    const by = Object.fromEntries(today.map((r) => [r.status, r]));
    return {
      provider: "gemini",
      configured: configured(),
      model,
      dailyLimit,
      lastSuccessfulTestAt: lastOk ? Number(lastOk.createdAt) : null,
      lastTest: lastTest ? { status: lastTest.status, error: lastTest.error_code ? MESSAGES[lastTest.error_code] || lastTest.error_code : null, errorCode: lastTest.error_code || null, at: Number(lastTest.createdAt) } : null,
      today: {
        requests: Number((by.ok && by.ok.n) || 0) + Number((by.error && by.error.n) || 0),
        cached: Number((by.cached && by.cached.n) || 0),
        errors: Number((by.error && by.error.n) || 0),
        inputTokens: Number((by.ok && by.ok.input_tokens) || 0),
        outputTokens: Number((by.ok && by.ok.output_tokens) || 0),
      },
    };
  };

  const testConnection = async (admin) => {
    const { Type } = clientFactory ? { Type: { OBJECT: "OBJECT", STRING: "STRING" } } : require("@google/genai");
    const result = await generateJson({
      task: "test",
      system: "You are a connectivity check. Reply exactly as instructed.",
      prompt: 'Return {"ok":"yes"}.',
      schema: { type: Type.OBJECT, properties: { ok: { type: Type.STRING } }, required: ["ok"] },
      cacheInput: { nonce: Date.now() },
      admin,
      force: true,
      temperature: 0,
      maxOutputTokens: 256,
    });
    return { ok: true, model: result.model };
  };

  return { configured, settings: () => ({ model: settings().model }), generateJson, status, testConnection, AiError, MESSAGES };
}

module.exports = { createAiProvider, normaliseModel, classify, AiError, configured };
