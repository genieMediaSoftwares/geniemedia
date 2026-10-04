import BASE_URL from "@/Api";

/**
 * Base URL for server-side fetches. API_INTERNAL_BASE_URL (server-only, never
 * sent to the browser) lets the Next.js server reach the backend on a private
 * address; otherwise it uses the public one.
 */
export const SERVER_API_BASE_URL = (process.env.API_INTERNAL_BASE_URL || BASE_URL).trim().replace(/\/+$/, "");

/** Revalidation window for public content (seconds). */
export const CONTENT_REVALIDATE_SECONDS = 60;

export const CACHE_TAGS = {
  blogs: "blogs",
  projects: "projects",
} as const;

/** Thrown for anything other than a clean 404, so ISR keeps the last good page. */
export class ApiUnavailableError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "ApiUnavailableError";
  }
}

// Render's free tier can take a while to wake up; give it time rather than
// failing a render.
const TIMEOUT_MS = 60_000;

interface FetchOptions {
  tags: string[];
  revalidate?: number;
}

/**
 * GET JSON from the backend with ISR caching. Returns null on 404 and throws
 * ApiUnavailableError on network failures and other non-2xx statuses.
 */
export async function serverGetJson(path: string, { tags, revalidate = CONTENT_REVALIDATE_SECONDS }: FetchOptions): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(`${SERVER_API_BASE_URL}${path}`, {
      next: { revalidate, tags },
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    throw new ApiUnavailableError(`Backend unreachable for ${path}: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (res.status === 404) return null;
  if (!res.ok) throw new ApiUnavailableError(`Backend answered ${res.status} for ${path}`, res.status);

  try {
    return (await res.json()) as unknown;
  } catch {
    throw new ApiUnavailableError(`Backend returned invalid JSON for ${path}`);
  }
}

export { arr, isRecord, num, str, type RawRecord } from "@/lib/api/coerce";
