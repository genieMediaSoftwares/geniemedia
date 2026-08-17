// Backend API base URL.
// Override per environment with VITE_API_BASE_URL (e.g. http://localhost:5000
// in Frontend/.env.local). When the variable is not set, the deployed backend
// is used — exactly as before.
// Any trailing slash is stripped so callers can safely do `${BASE_URL}/api/...`
// without producing a double slash (`//api/...`), which Express treats as a
// different path and answers with 404.
const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://geniemedia.onrender.com"
).replace(/\/+$/, "");
// const BASE_URL = "http://localhost:5000";
export default BASE_URL;
