# Genie Media & Studio — Next.js frontend

Next.js 16 (App Router) + TypeScript port of the React/Vite site in `../Frontend`.
The Express backend in `../Backend` is unchanged in role: it still owns MySQL, JWT
auth, blog/project CRUD, image processing and Hostinger uploads. This app only
renders pages.

```
Browser ──> Next.js (Vercel) ──server-side fetch / ISR──> Express API (Render) ──> MySQL / Hostinger uploads
   └── admin panel (client) ──────── direct, JWT ─────────┘
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
| `npm run dev` | Dev server on http://localhost:3000 |
| `npm run build` / `npm start` | Production build / server |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run lint` | ESLint (eslint-config-next) |
| `npm test` | Unit tests for the SEO analyzer |
| `npm run test:routes -- <base-url>` | Crawlability/SEO checks against a running site (default `http://localhost:3000`; use `https://geniemedia.in` after deploy) |

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | required | Express API base, e.g. `https://geniemedia-81qf.onrender.com` |
| `NEXT_PUBLIC_SITE_URL` | optional | Canonical origin (default `https://geniemedia.in`) |
| `API_INTERNAL_BASE_URL` | optional, server-only | Faster/private API address for server fetches |
| `UPLOADS_ORIGIN` | needed once the domain moves to Vercel | Host that still serves Hostinger's `/uploads/` (see below) |

No secrets live in this app. JWT secret, DB and Hostinger credentials stay in `Backend/.env`.

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

## Blog publishing flow

1. Admin saves in `/admin/blogs` → backend stores the post.
2. The admin panel calls `POST /api/revalidate` with the admin's JWT; the route
   checks the token against the backend and refreshes the post, `/blogs`,
   `sitemap.xml` and `llms.txt` immediately.
3. A brand-new slug renders on its first request anyway (`dynamicParams`), and
   everything also refreshes every 60 s as a fallback.

## Deploying to Vercel

1. Import the repo in Vercel, set **Root Directory** to `GenieMediaStudios/frontend-next`.
2. Add the environment variables above.
3. **Before pointing `geniemedia.in` at Vercel**, keep Hostinger reachable on a
   subdomain (e.g. `files.geniemedia.in` → Hostinger), then:
   - set `UPLOADS_ORIGIN=https://files.geniemedia.in` on Vercel, so the image URLs
     already stored in the database (`https://geniemedia.in/uploads/...`) keep working;
   - set `UPLOAD_ENDPOINT=https://files.geniemedia.in/upload.php` on the backend (Render),
     so new uploads still reach Hostinger.
4. Backend CORS: `localhost:3000` is allowed; add any preview URL with
   `CORS_EXTRA_ORIGINS=https://<project>.vercel.app` on Render.
5. Add `geniemedia.in` and `www.geniemedia.in` as Vercel domains and update DNS.
6. Run `npm run test:routes -- https://geniemedia.in`, then in Search Console:
   URL Inspection → *Test live URL* for `/digital_marketing` and the blog post,
   and resubmit `https://geniemedia.in/sitemap.xml`.

The old `Frontend/` (Vite) project is untouched and remains the rollback.
