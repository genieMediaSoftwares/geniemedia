// Backend API base URL (NEXT_PUBLIC_API_BASE_URL in .env), without a trailing
// slash so callers can safely do `${BASE_URL}/api/...`. Validated in
// src/lib/env.ts, which stops the build if it is missing.
import { API_BASE_URL } from "@/lib/env";

const BASE_URL = API_BASE_URL;
export default BASE_URL;
