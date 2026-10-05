/**
 * On a server deployment this asked Next.js to refresh its cached pages after
 * an admin save. The site is now a static export on Hostinger, where pages
 * only change when the site is rebuilt, so this is intentionally a no-op.
 * Publish changes with `npm run build` and upload `dist/` again.
 */
export function requestRevalidate(_token: string | null, _type: "blogs" | "projects", _permalinks: Array<string | null | undefined> = []): void {
  void _token;
  void _type;
  void _permalinks;
}
