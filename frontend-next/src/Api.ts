// Backend API base URL, read from NEXT_PUBLIC_API_BASE_URL (.env.local / Vercel
// project settings). Any trailing slash is stripped so callers can safely do
// `${BASE_URL}/api/...` without producing a double slash, which Express treats
// as a different path and answers with 404.
//
// NEXT_PUBLIC_* values are inlined at build time, so this module is safe to
// import from client components. It holds no secret.
const RAW_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!RAW_BASE_URL || !RAW_BASE_URL.trim()) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not set. Define it in .env.local or the Vercel project settings.");
}

const BASE_URL = RAW_BASE_URL.trim().replace(/\/+$/, "");
export default BASE_URL;
