import type { NextConfig } from "next";

/**
 * Static export for Hostinger (Apache shared hosting).
 *
 * `npm run build` writes a complete static site to `dist/` — the Next.js
 * equivalent of the Vite `dist/` folder. Upload the CONTENTS of `dist/` to
 * public_html. Every page is pre-rendered HTML (server-rendered at build time),
 * so crawlers get full content without running JavaScript.
 *
 * Redirects, security headers, clean URLs and the real 404 status that a
 * Next.js server would handle are done by `public/.htaccess` instead, which is
 * copied into `dist/` on every build.
 */
const nextConfig: NextConfig = {
  output: "export",
  // Write the static site to dist/ (same folder name as the Vite build).
  distDir: "dist",
  reactStrictMode: true,
  poweredByHeader: false,
  // `/about` is emitted as `about.html`; .htaccess serves it at `/about`. The
  // root keeps its slash and nothing else gets one, matching the canonicals.
  trailingSlash: false,
  images: {
    // There is no image optimisation server on static hosting.
    unoptimized: true,
  },
};

export default nextConfig;
