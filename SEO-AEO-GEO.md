# SEO / AEO / GEO — how it works and how to verify it

This describes the search, answer-engine and generative-engine layer added to the
blog platform: what each piece does, how to deploy it, and how to prove it is
working. Written for whoever deploys and operates the site.

---

## The problem this solves

The public site is a React SPA. Before this work, every blog post returned the
same HTML to the first request: the home page's `<title>`, the home page's meta
description, and an empty `<div id="root">`. Everything specific to the post was
written by JavaScript after the bundle loaded.

Googlebot renders JavaScript and mostly coped. GPTBot, ClaudeBot, PerplexityBot,
CCBot and the social preview crawlers largely do not — they read the first
response and leave. To all of them, every post on the site was an untitled,
empty page.

That is now fixed at the source: the server builds the head and the article text
before the HTML is sent.

---

## What was built

### Database

Twenty columns were added to `blogs`. The migration runs automatically on server
boot and is idempotent, so a deploy needs no manual step.

| Group | Columns |
|---|---|
| SERP metadata | `meta_title`, `focus_keyword`, `secondary_keywords`, `canonical_url`, `robots_directive` |
| Structured data | `schema_type`, `faq_schema` |
| AEO | `direct_answer` |
| GEO | `key_facts`, `definitions` |
| Imagery | `og_image_url`, `alt_text` |
| E-E-A-T | `author_id`, `author_name`, `author_bio` |
| Derived | `reading_time_minutes`, `word_count`, `last_modified_at` |
| Link graph | `internal_links`, `slug_history` |

`metaDescription` already existed and is now hard-clamped to 160 characters
server-side. Two notes on deviations from the original spec:

- **`meta_description` was not added as a new column.** The table already has
  `metaDescription`. Adding a second one would have meant two fields holding the
  same thing with nothing deciding which wins.
- **`meta_title` falls back to `title`** when empty, rather than blocking a
  publish outright. A required field that duplicates a field two inches above it
  gets filled with a copy-paste, which teaches editors to ignore the checklist.

`JSON` columns land as `LONGTEXT` on this MariaDB host. That is MariaDB's normal
representation and the application reads and writes them as JSON either way.

### Server-rendered head — Part 4, Option A

`Backend/services/htmlInjector.js` reads the built `index.html`, strips the
template's hardcoded title/description/canonical/OG tags, and writes the post's
own in their place along with the full JSON-LD graph. React hydrates normally
afterwards; the `<body>` is untouched apart from a pre-rendered copy of the
article inside `#root`, which React discards on first render.

The pre-rendered body goes beyond the spec deliberately. Correct meta tags tell a
crawler what the page is about; they do not give it a sentence it can quote. The
headline, direct answer, body text, key facts and FAQ are all present as real
text in the first response.

### Structured data — Part 3

`Backend/services/structuredData.js` exports `generateStructuredData(blogPost)`,
which returns one `@graph` containing:

`Organization` + `ProfessionalService`, `WebSite`, `WebPage`, `BreadcrumbList`,
`Person`, `ImageObject`, `BlogPosting`/`Article`/`NewsArticle`/`HowTo`,
`FAQPage`, the direct-answer `Question`, `Claim` nodes per attributed fact, and
`DefinedTerm` nodes per definition.

It is one graph with stable `@id` values rather than several separate blocks, so
the publisher of the article, the breadcrumb's home entity and the site-wide
Organization all resolve to the same node instead of three look-alikes.

`Speakable` points at `.geo-direct-answer` and `.aeo-answer-text`. Those classes
are really rendered by `Blogdetail.jsx`. **If that markup is renamed, the schema
has to be renamed with it** or the page advertises a selector that does not
exist.

### Admin panel — Part 2

A collapsible **SEO / AEO / GEO** panel sits below the content editor, with a
live Google snippet preview, the focus-keyword checklist, the direct-answer
builder, an FAQ builder, key facts, definitions, heading-hierarchy validation,
required alt text, and the publish checklist.

The header badge shows either "Ready to publish" or the number of blocking items,
so the state is visible without opening the panel.

### Publish gate — Part 2.6

Enforced in `Backend/services/seoValidation.js`, not only in the browser. A
publish missing any of these returns **HTTP 422** with the full checklist:

- meta title present and ≤ 60 characters
- meta description present and ≤ 160 characters
- focus keyword set
- featured image uploaded
- alt text present
- direct answer written
- at least one internal link in the content
- 3+ FAQ pairs when the post exceeds 800 words

Drafts are never blocked. Amber items — answer length, heading hierarchy,
attributed facts, named author, 300-word minimum — are advice and do not stop a
publish.

### Images — Part 2.5

On upload, the featured image is checked for 16:9 and 1200px width, and a
1200×630 Open Graph variant is generated with `sharp` using an attention-based
crop, so social cards stop decapitating people. A failed variant never fails the
upload; the 16:9 original is a usable fallback.

### Site-wide files — Part 5

| URL | Source |
|---|---|
| `/sitemap.xml` | Generated index, `lastmod` from the newest publish |
| `/pages.xml` | Generated from the static route table |
| `/blogs.xml` | Generated from MySQL, with image sitemap entries |
| `/robots.txt` | Generated, AI crawlers allowed by name |
| `/llms.txt` | Generated, includes every published post |

All are cached for a few minutes and the cache is dropped on every create,
update and delete, so a publish is reflected immediately.

`robots.txt` names GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web,
anthropic-ai, PerplexityBot, Perplexity-User, Google-Extended, CCBot, Applebot,
Meta-ExternalAgent, Amazonbot, cohere-ai, YouBot and DuckAssistBot and allows
each explicitly. Only `/admin`, `/api/` and `/share/` are closed.

### Slug changes

Editing a permalink appends the old slug to `slug_history`. The old URL then
answers **301** to the new one, so inbound links and accumulated ranking survive
the rename. Verified working end to end.

---

## Deploying

### Backend

Nothing special. The migration runs on boot.

```bash
cd Backend && npm install && npm start
```

Optional environment variables:

| Variable | Default | Purpose |
|---|---|---|
| `SITE_URL` | `https://geniemedia.in` | Canonical origin for every generated URL |
| `PUBLIC_API_URL` | `https://geniemedia.onrender.com` | Used for the preconnect hint |
| `FRONTEND_DIST` | auto-detected | Path to the Vite build, if not adjacent |

### Frontend

```bash
cd Frontend && npm install && npm run build
```

Upload the **entire contents of `dist/`** to `public_html/`, including the
dotfile `.htaccess` and `seo-proxy.php`. Many FTP clients hide dotfiles by
default — if `.htaccess` is missing, deep links 404 and none of the redirects or
cache headers apply.

### The split-deployment bridge

The site is static on Hostinger and the API is on a separate Node host. Crawlers
only ever visit `geniemedia.in`, so a sitemap generated on the API host would be
one nothing reads.

`seo-proxy.php` closes that gap. Apache routes the SEO paths to it, and it
fetches, caches and re-serves the generated output under the real domain. For
`/blog/*` it applies **only to bot user agents** — humans fall straight through
to the SPA and pay no proxy hop.

If the API is unreachable it serves a stale cache entry, then a static file,
rather than an error. A crawler that gets a 500 for `sitemap.xml` can back off
for days.

Two things to know:

- It needs `allow_url_fopen` or cURL, and a writable directory for `.seo-cache`.
- When the site and API eventually share an origin, delete the rewrite rules and
  the file becomes dead code. The Express routes already do all of this natively.

---

## Verifying

### 1. Schema validity

```bash
cd Backend
npm run seo:schema          # sample post
node scripts/validateStructuredData.js 9    # a real post by id
```

Checks every node against the properties Google actually requires per rich
result type, plus date formats, breadcrumb position sequence and dangling `@id`
references. Currently passes with no errors.

For the official check, paste a live URL into the
[Rich Results Test](https://search.google.com/test/rich-results). It also
verifies eligibility, which the offline script cannot.

### 2. Raw HTML as a bot — the one that matters

```bash
curl -A "GPTBot" https://geniemedia.in/blog/<slug> | head -60
```

Or the scripted version, which runs six different crawler agents and checks
every signal at once:

```bash
cd Backend
node scripts/verifySeoLive.js https://geniemedia.in/blog/<slug>
```

It reports, per agent: title, meta description, canonical, OG tags, robots
directive, JSON-LD parse result and node types, and — the decisive one —
how many characters of article text are present without JavaScript.

If that last number is near zero, the injection is not reaching the request and
nothing else on this page matters.

### 3. Search Console

Use **URL Inspection → Test Live URL → View Tested Page → HTML** on a published
post. The rendered HTML should show the post's own title and JSON-LD.

Then submit `https://geniemedia.in/sitemap.xml` under **Sitemaps**. It is a
sitemap index; `pages.xml`, `services.xml` and `blogs.xml` are discovered from
it.

### 4. Social previews

Paste a post URL into the
[Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) and
confirm the 1200×630 variant is used rather than a cropped 16:9 file.

---

## Known state

**The schema is live and complete; the content is not yet optimised.** The two
existing published posts predate these fields, so they have no direct answer, no
alt text and no focus keyword. They will render with correct meta tags, correct
JSON-LD and a sitemap entry, but they cannot benefit from the AEO and GEO work
until someone opens each one in the admin panel and fills the SEO block in.

Run `npm run seo:migrate` at any time to see how many published posts are still
missing those fields.

Editing and re-publishing an old post runs it through the publish gate, so the
gate is what will walk an editor through completing it.

---

## Where things live

```
Backend/
  config/site.js                   Brand, address, socials, crawler lists
  db/migrateBlogSeo.js             Idempotent schema migration
  routes/seoRoutes.js              Sitemaps, robots, analysis API, blog renderer
  services/
    structuredData.js              generateStructuredData(blogPost)
    htmlInjector.js                Part 4 Option A head injection
    seoValidation.js               Publish gate (authoritative)
    contentAnalysis.js             Word count, headings, links, keyword density
    blogSeoFields.js               Form to column mapping, slug history
    imageVariants.js               16:9 validation, 1.91:1 OG variant
    sitemapService.js              Sitemaps, robots.txt, llms.txt
  scripts/
    runSeoMigration.js             npm run seo:migrate
    validateStructuredData.js      npm run seo:schema
    verifySeoLive.js               npm run seo:verify

Frontend/
  src/components/SeoPanel.jsx      The SEO / AEO / GEO admin panel
  src/utils/seoAnalysis.js         Browser-side mirror of the server rules
  src/hooks/useBlogSeo.js          Head sync for client-side navigation
  public/.htaccess                 HTTPS, redirects, compression, caching
  public/robots.txt                Static fallback, AI crawlers allowed
  public/seo-proxy.php             Split-deployment bridge
```

`Frontend/src/utils/seoAnalysis.js` duplicates the server's rules on purpose, so
the editor gets feedback on every keystroke. The server is the authority and
recomputes everything before storing or publishing. **If you change a threshold,
change it in both** — `seoAnalysis.js` and `seoValidation.js` — or the panel will
tell an editor a post is ready while the server refuses it.
