// Backend API base URL, read only from VITE_API_BASE_URL (Frontend/.env).
// There is deliberately no fallback: vite.config.js refuses to start or build
// without it, and this throws if it is somehow still missing at runtime.
// Any trailing slash is stripped so callers can safely do `${BASE_URL}/api/...`
// without producing a double slash (`//api/...`), which Express treats as a
// different path and answers with 404.
const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!RAW_BASE_URL || !RAW_BASE_URL.trim()) {
  throw new Error("VITE_API_BASE_URL is not set. Define it in Frontend/.env.");
}

const BASE_URL = RAW_BASE_URL.trim().replace(/\/+$/, "");
export default BASE_URL;
