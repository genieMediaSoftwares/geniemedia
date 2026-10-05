# Genie Media & Studio — Next.js frontend

Next.js 16 (App Router) + TypeScript port of the React/Vite site in `../Frontend`.
The Express backend in `../Backend` is unchanged in role: it still owns MySQL, JWT
auth, blog/project CRUD, image processing and Hostinger uploads. This app only
renders pages.

```
Build time:  npm run build ──fetch blogs/projects──> Express API (Render) ──> MySQL
             └── writes static HTML to dist/ ──upload──> Hostinger (public_html)

Runtime:     Browser ──> Hostinger (static HTML, uploads/, upload.php, contact.php)
             admin panel (client) ──direct, JWT──> Express API (Render)
```

## Styling and icons

- **Tailwind CSS only.** There are no hand-written stylesheets or `<style>` blocks;
  `src/app/globals.css` just loads Tailwind. Custom keyframes and `animate-*`
  utilities live in `tailwind.config.ts`.
- Class strings are always written out in full (never assembled with `${...}`
  inside a class name), or Tailwind cannot see them when it scans the source.
- **Icons come from `lucide-react`.** Don't add emoji or hand-drawn `<svg>` icons.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on http://localhost:5173 |
| `npm run build` | Static export to `dist/` (upload to Hostinger) |
| `npm start` | Preview `dist/` on http://localhost:5173 (no `.htaccess` rules) |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run lint` | ESLint (eslint-config-next) |
| `npm test` | Unit tests for the SEO analyzer |
| `npm run test:routes -- <base-url>` | Crawlability/SEO checks against a running site (default `http://localhost:3000`; use `https://geniemedia.in` after deploy) |

## Configuration (.env)

All configuration lives in **one file, `frontend-next/.env`**. Nothing is
hard-coded: `src/lib/env.ts` reads every value, and `npm run build` stops with
a clear message if a required one is missing. Each variable is explained in a
comment inside `.env`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | yes | Express backend (blogs, projects, admin login) |
| `NEXT_PUBLIC_SITE_URL` | yes | Site address for canonicals, sitemap, JSON-LD and `.htaccess` redirects |
| `NEXT_PUBLIC_CONTACT_FORM_URL` | yes | Hostinger `contact.php` the contact form posts to |
| `NEXT_PUBLIC_SHARE_PREVIEW_URL` | yes | Hostinger `og.php` used by the admin share-link button |
| `NEXT_PUBLIC_GA4_ID` | no | Google Analytics 4 (empty = off) |
| `NEXT_PUBLIC_GTM_ID` | no | Google Tag Manager (empty = off) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | no | Search Console verification tag |
| `CONTACT_TO_EMAIL` | yes | Inbox that receives contact-form enquiries (written into `contact.php`) |
| `CONTACT_FROM_EMAIL` | yes | Sender address for those emails; must be a mailbox on your domain |
| `API_INTERNAL_BASE_URL` | no | Server-only backend address used while building |

Values are built into the pages, so **change `.env`, then run `npm run build`
and upload `dist/` again**. No secrets belong here: JWT secret, database and
Hostinger credentials stay in `Backend/.env`.

## Route map (old → new)

Every URL is unchanged. Redirects only catch variants.

| URL | Status |
| --- | --- |
| `/`, `/about`, `/services`, `/digital_marketing`, `/web_development`, `/production_house`, `/podcast_studio`, `/projects`, `/reviews`, `/blogs`, `/contact` | same URL, server-rendered |
| `/blog/<category>/<slug>` | same URL, SSG + ISR (60 s) + on-demand revalidation |
| `/admin`, `/admin/blogs`, `/admin/projects` | same URL, client-only, noindex |
| `/<route>.html`, `/index.html` | 308 → clean URL (as .htaccess did) |
| `/web-development`, `/digital-marketing`, `/production-house`, `/podcast-studio` | 308 → underscore URL |
| `/blog` | 308 → `/blogs` |
| `/admin/login` | 308 → `/admin` |
| `www.geniemedia.in/*` | 308 → `geniemedia.in/*` |
| retired blog slug (in `slug_history`) | 308 → current permalink |
| unknown URL / unknown or draft blog | **404** (noindex) |

## Deploying to Hostinger (static export)

`npm run build` writes a complete static site to **`dist/`**, the Next.js
equivalent of the Vite `dist/` folder. Every page is pre-rendered HTML, so
Google gets the full content without running JavaScript.

1. Check the values in `.env`.
2. Run `npm run build`. The build fetches blogs and projects from the backend,
   so the backend must be awake (Render's free tier can take a minute).
3. Upload the **contents** of `dist/` into `public_html`, including the hidden
   `.htaccess` file and the `_next/` folder. Overwrite existing files.
4. **Do not delete** server files that are not part of the build:
   `uploads/`, `upload.php`, `og.php`. (`contact.php` is part of the build: it lives in
   `public/contact.php` and gets its email settings from `.env`.) They hold the images and the
   contact form. Old Vite files such as `assets/`, `seo-proxy.php` and the
   old per-route `.html` heads can be removed once the new site works.
5. Verify: `npm run test:routes -- https://geniemedia.in`

`public/.htaccess` (copied into `dist/`) handles HTTPS, non-www, clean URLs
(`/about` serves `about.html`), the old redirects, admin noindex, caching, and
a real 404 page. `scripts/postbuild.mjs` adds the retired-blog-slug 301s from
the backend.

### Publishing new content

The site is static, so **a new or edited blog post or project appears on the
website after the next `npm run build` and upload**. The admin panel still
saves to the backend immediately; only the public pages wait for the rebuild.

### Local development

`npm run dev` runs on http://localhost:5173, an origin the deployed backend's
CORS already allows, so admin login works locally.
