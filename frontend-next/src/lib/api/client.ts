import BASE_URL from "@/Api";
import { API_INTERNAL_BASE_URL } from "@/lib/env";

export const SERVER_API_BASE_URL = API_INTERNAL_BASE_URL || BASE_URL;

export const CONTENT_REVALIDATE_SECONDS = 60;

export const CACHE_TAGS = {
  blogs: "blogs",
  projects: "projects",
  caseStudies: "case-studies",
  serviceSeo: "service-seo",
} as const;

export class ApiUnavailableError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "ApiUnavailableError";
  }
}

const TIMEOUT_MS = 60_000;

interface FetchOptions {
  tags: string[];
  revalidate?: number;
}

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
