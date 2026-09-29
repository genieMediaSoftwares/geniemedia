import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { ROUTE_META, metaForRoute } from './src/seo/routeMeta.js'

/**
 * Every route in ROUTE_META gets a first HTML response carrying its own <head>,
 * not the home page's. Hostinger serves index.html for every SPA route, and its
 * canonical points at the home page; Google may keep that raw canonical rather
 * than the one React sets later. Each route is emitted as `<route>.html` and
 * .htaccess serves it for the clean URL; the route list there must match.
 *
 * Per-route options, where a route needs any:
 */
const ROUTE_HEAD_OPTIONS = {
  // The home page is index.html itself, rewritten in place. It is also the SPA
  // fallback, so every route not listed here starts from the home page's head
  // until React replaces it, exactly as before. For that reason it carries no
  // JSON-LD: routes without their own <SEO> never remove it, and they would be
  // left describing themselves as the home page.
  '/': { inlineSchema: false },
  // `lcpImage` is preloaded from the head. Without it the browser only finds
  // the hero image after the entry bundle and then the lazy route chunk have
  // both downloaded and run.
  '/digital_marketing': { lcpImage: 'src/assets/DigitalMarketting.jpg' },
  '/web_development': { lcpImage: 'src/assets/web_services_hero.JPG' },
  '/production_house': { lcpImage: 'src/assets/podcast/StudioNightView-min.JPG' },
  // A CSS background, so the preload scanner cannot see it without this.
  '/blogs': { lcpImage: 'src/assets/blog/blog-hero.webp' },
}

/**
 * The lazily imported component each route renders (see src/App.jsx). Its
 * chunk, the shared chunks it imports and its CSS are preloaded from that
 * route's HTML. Without this the browser only learns the page chunk exists
 * after the entry bundle has downloaded and run, a full extra round trip
 * before anything but the header can render; on a throttled mobile run that
 * was the largest part of LCP.
 *
 * index.html is also the fallback for routes not in ROUTE_META (blog posts,
 * admin), so those visits fetch the home chunk too. That costs a few KB there
 * and is worth it for the home page, the most visited entry point.
 */
const ROUTE_MODULES = {
  '/': 'src/Pages/HomePage.jsx',
  '/about': 'src/Pages/AboutPg.jsx',
  '/services': 'src/components/AllServices.jsx',
  '/digital_marketing': 'src/Pages/DigitalMarketting.jsx',
  '/web_development': 'src/Pages/Web-devPg.jsx',
  '/production_house': 'src/Pages/ProductionHouse.jsx',
  '/podcast_studio': 'src/Pages/PodcastStudio.jsx',
  '/projects': 'src/Pages/Projects.jsx',
  '/reviews': 'src/Pages/Reviews.jsx',
  '/contact': 'src/components/contactSection.jsx',
  '/blogs': 'src/Pages/Blogs.jsx',
}

const PRERENDERED_HEAD_ROUTES = Object.fromEntries(
  Object.keys(ROUTE_META).map((path) => [path, ROUTE_HEAD_OPTIONS[path] || {}])
)

const escapeAttr = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Rewrites the built index.html head for one route. The body, scripts,
 * analytics and every unmanaged tag are left exactly as built. The injected
 * tags carry `data-seo-ssr`, so src/components/SEO.jsx removes them once React
 * has declared its own copies, the same hand-off the index.html defaults use.
 */
const headForRoute = (html, path, { lcpImageUrl, inlineSchema = true, preloads = [] } = {}) => {
  const meta = metaForRoute(path)
  const tag = (attr, key, value) =>
    value ? `    <meta data-seo-ssr="1" ${attr}="${key}" content="${escapeAttr(value)}" />` : null
  const tags = [
    `    <link data-seo-ssr="1" rel="canonical" href="${escapeAttr(meta.canonical)}" />`,
    tag('name', 'description', meta.description),
    tag('property', 'og:title', meta.title),
    tag('property', 'og:description', meta.description),
    tag('property', 'og:url', meta.canonical),
    tag('property', 'og:type', 'website'),
    tag('property', 'og:site_name', 'Genie Media & Studio'),
    tag('property', 'og:locale', 'en_IN'),
    tag('property', 'og:image', meta.image),
    tag('name', 'twitter:card', 'summary_large_image'),
    tag('name', 'twitter:title', meta.title),
    tag('name', 'twitter:description', meta.description),
    tag('name', 'twitter:image', meta.image),
    meta.schema && inlineSchema
      ? `    <script data-seo-ssr="1" type="application/ld+json">${JSON.stringify(meta.schema).replace(/</g, '\\u003c')}</script>`
      : null,
    lcpImageUrl ? `    <link rel="preload" as="image" href="${escapeAttr(lcpImageUrl)}" fetchpriority="high" />` : null,
    ...preloads,
  ].filter(Boolean)

  return html
    .replace(/<script[^>]*data-seo-ssr[^>]*>[\s\S]*?<\/script>\s*/gi, '')
    .replace(/<meta[^>]*data-seo-ssr[^>]*>\s*/gi, '')
    .replace(/<link[^>]*data-seo-ssr[^>]*>\s*/gi, '')
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeAttr(meta.title)}</title>\n${tags.join('\n')}`)
    .replace(/(<meta\s+name="title"\s+content=")[^"]*(")/i, `$1${escapeAttr(meta.title)}$2`)
}

const prerenderRouteHeads = () => ({
  name: 'prerender-route-heads',
  apply: 'build',
  enforce: 'post',
  generateBundle(_, bundle) {
    const index = bundle['index.html']
    if (!index) return
    // Hashed output name of a source asset, e.g. /assets/DigitalMarketting-C4H1wl2W.jpg
    const assetUrl = (source) => {
      const file = Object.values(bundle).find(
        (f) => f.type === 'asset' && (f.originalFileNames || []).some((n) => n.replace(/\\/g, '/').endsWith(source))
      )
      return file ? `/${file.fileName}` : null
    }
    // <link> tags for a route's lazy chunk, the chunks it statically imports
    // and their CSS. Chunks the entry already pulls in (and that index.html
    // already modulepreloads) are skipped.
    const chunks = Object.values(bundle).filter((f) => f.type === 'chunk')
    const entry = chunks.find((c) => c.isEntry)
    const alreadyLoaded = new Set([entry?.fileName, ...(entry?.imports || [])])
    const routePreloads = (source) => {
      const root = chunks.find((c) => (c.facadeModuleId || '').replace(/\\/g, '/').endsWith(source))
      if (!root) return []
      const js = new Set()
      const css = new Set()
      const visit = (fileName) => {
        if (js.has(fileName) || alreadyLoaded.has(fileName)) return
        const chunk = bundle[fileName]
        if (!chunk || chunk.type !== 'chunk') return
        js.add(fileName)
        chunk.viteMetadata?.importedCss?.forEach((f) => css.add(f))
        chunk.imports.forEach(visit)
      }
      visit(root.fileName)
      return [
        ...[...css].map((f) => `    <link rel="preload" as="style" crossorigin href="/${f}" />`),
        ...[...js].map((f) => `    <link rel="modulepreload" crossorigin href="/${f}" />`),
      ]
    }

    // Every route starts from the untouched template, including the home page,
    // which is written back into index.html last.
    const template = String(index.source)
    for (const [path, { lcpImage, inlineSchema }] of Object.entries(PRERENDERED_HEAD_ROUTES)) {
      const preloads = ROUTE_MODULES[path] ? routePreloads(ROUTE_MODULES[path]) : []
      if (path === '/') {
        index.source = headForRoute(template, path, { inlineSchema, preloads })
        continue
      }
      this.emitFile({
        type: 'asset',
        fileName: `${path.replace(/^\/+/, '')}.html`,
        source: headForRoute(template, path, { lcpImageUrl: lcpImage && assetUrl(lcpImage), inlineSchema, preloads }),
      })
    }
  },
})

export default defineConfig(({ mode }) => {
  // The backend URL comes only from the environment. Fail here, at dev-server
  // start or build time, rather than shipping a bundle that cannot reach the API.
  const { VITE_API_BASE_URL } = loadEnv(mode, process.cwd(), 'VITE_')
  if (!VITE_API_BASE_URL || !VITE_API_BASE_URL.trim()) {
    throw new Error('VITE_API_BASE_URL is not set. Define it in Frontend/.env (or .env.' + mode + ').')
  }

  return {
  plugins: [react(), prerenderRouteHeads()],
  base: '/',
  build: {
    // Source maps for the first-party bundles. There are no secrets in the
    // frontend — the only environment value it reads is the public API base URL
    // — and having real maps makes production errors debuggable instead of
    // being minified noise.
    sourcemap: true,
    // Inline anything under 4 kB as a data URI rather than spending a round
    // trip on it. Above that the browser cache is worth more than the request.
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // Split the long-lived vendor code out of the app bundle so a content
        // change to the site does not invalidate React in everyone's cache.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
            return 'react-vendor';
          }
          if (id.includes('react-router')) return 'router';
          // TipTap/ProseMirror is deliberately NOT given a manual chunk. It is
          // only reachable through the lazily-imported admin editor, so Rollup
          // already emits it as an async chunk. Naming it manually promoted it
          // to a static import of the entry, which put a <link rel=modulepreload>
          // for 372 kB of editor code in the <head> of every public page.
        },
      },
    },
  },
  }
})
