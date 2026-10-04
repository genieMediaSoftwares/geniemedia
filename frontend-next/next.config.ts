import type { NextConfig } from "next";

/**
 * Public routes that existed on the Vite site. The .htaccess on Hostinger
 * served `<route>.html` for each of these and 301'd the `.html` form back to
 * the clean URL; the same redirects are kept so any link to the old form still
 * lands on a 200.
 */
const LEGACY_HTML_ROUTES = [
  "about",
  "services",
  "projects",
  "contact",
  "blogs",
  "reviews",
  "digital_marketing",
  "web_development",
  "production_house",
  "podcast_studio",
];

/**
 * Hyphenated aliases of the underscore routes. The live URLs keep their
 * underscores (that is what Google has indexed); these only catch typed or
 * mis-linked variants so they 301 to the real page instead of 404ing.
 */
const HYPHEN_ALIASES: Array<[string, string]> = [
  ["/digital-marketing", "/digital_marketing"],
  ["/web-development", "/web_development"],
  ["/production-house", "/production_house"],
  ["/podcast-studio", "/podcast_studio"],
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The root keeps its slash, nothing else gets one — matching the canonicals,
  // the sitemap and the previous .htaccess rules.
  trailingSlash: false,

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "geniemedia.in", pathname: "/uploads/**" },
      { protocol: "https", hostname: "www.geniemedia.in", pathname: "/uploads/**" },
      { protocol: "https", hostname: "geniemedia-81qf.onrender.com", pathname: "/uploads/**" },
    ],
  },

  async redirects() {
    return [
      // Canonical host is the bare domain (canonicals, sitemap, JSON-LD @ids).
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.geniemedia.in" }],
        destination: "https://geniemedia.in/:path*",
        permanent: true,
      },
      ...LEGACY_HTML_ROUTES.map((route) => ({
        source: `/${route}.html`,
        destination: `/${route}`,
        permanent: true,
      })),
      { source: "/index.html", destination: "/", permanent: true },
      ...HYPHEN_ALIASES.map(([source, destination]) => ({ source, destination, permanent: true })),
      // The backend's /share/ fallback sends visitors to "/blog"; the index
      // lives at /blogs.
      { source: "/blog", destination: "/blogs", permanent: true },
      // The admin login has always lived at /admin.
      { source: "/admin/login", destination: "/admin", permanent: true },
    ];
  },

  /**
   * Uploaded images are stored on Hostinger and referenced in the database as
   * https://geniemedia.in/uploads/... . Once geniemedia.in points at Vercel,
   * those files are no longer on this host, so /uploads/* is passed through to
   * wherever Hostinger is still reachable (UPLOADS_ORIGIN, e.g.
   * https://files.geniemedia.in). `fallback` means it only applies when no
   * Next.js route or public file matches.
   */
  async rewrites() {
    const origin = (process.env.UPLOADS_ORIGIN || "").trim().replace(/\/+$/, "");
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: origin ? [{ source: "/uploads/:path*", destination: `${origin}/uploads/:path*` }] : [],
    };
  },

  async headers() {
    return [
      {
        // Admin screens must never be indexed, even if a link to them leaks.
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/admin",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
