import { authHeaders } from "@/lib/auth";

/**
 * Asks the Next.js server to refresh its cached copies after an admin save,
 * so the public pages, the sitemap and llms.txt update immediately. Fire and
 * forget: the save already succeeded on the backend, and the 60-second ISR
 * window is the fallback if this request fails.
 */
export function requestRevalidate(token: string | null, type: "blogs" | "projects", permalinks: Array<string | null | undefined> = []): void {
  if (!token) return;
  void fetch("/api/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ type, permalinks: permalinks.filter(Boolean) }),
  }).catch(() => {
    /* ISR picks the change up within a minute regardless */
  });
}
