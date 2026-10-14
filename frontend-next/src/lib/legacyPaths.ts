// The four service sections moved from underscore URLs (/digital_marketing) to hyphenated ones
// (/digital-marketing) on 2026-10-14. Old URLs 301 to the new ones (public/.htaccess), but the
// backend CMS (published SEO configs, case-study related services) still stores the old paths as
// its identifiers. Map CMS data to public paths when reading it, and back when sending it.
// Keep in sync with public/.htaccess, public/seo-sync.php, scripts/postbuild.mjs and
// Backend/services/seoLive.js.

export const LEGACY_SECTION_PATHS = {
  "/digital_marketing": "/digital-marketing",
  "/web_development": "/web-development",
  "/production_house": "/production-house",
  "/podcast_studio": "/podcast-studio",
} as const;

type LegacyPath = keyof typeof LEGACY_SECTION_PATHS;
type PublicPath = (typeof LEGACY_SECTION_PATHS)[LegacyPath];

const swapPrefix = (path: string, map: Record<string, string>): string => {
  for (const [from, to] of Object.entries(map)) {
    if (path === from) return to;
    if (path.startsWith(from) && /[/?#]/.test(path[from.length])) return to + path.slice(from.length);
  }
  return path;
};

const PUBLIC_TO_LEGACY = Object.fromEntries(
  Object.entries(LEGACY_SECTION_PATHS).map(([legacy, current]) => [current, legacy]),
) as Record<PublicPath, LegacyPath>;

/** "/digital_marketing/aeo?x=1" -> "/digital-marketing/aeo?x=1"; other paths are returned unchanged. */
export const toPublicPath = (path: string): string => swapPrefix(path, LEGACY_SECTION_PATHS);

/** Reverse of toPublicPath, for values the backend CMS validates against its stored paths. */
export const toCmsPath = (path: string): string => swapPrefix(path, PUBLIC_TO_LEGACY);

const LEGACY_HREF = /(href=["'](?:https?:\/\/(?:www\.)?geniemedia\.in)?)(\/(?:digital_marketing|web_development|production_house|podcast_studio)(?=[/"'?#]))/gi;

/** Points links in CMS-authored HTML (blog bodies) at the new URLs, so they don't go through a 301. */
export const rewriteLegacyHrefs = (html: string): string =>
  html.replace(LEGACY_HREF, (_, prefix: string, path: string) => prefix + toPublicPath(path.toLowerCase()));
