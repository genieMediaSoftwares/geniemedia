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

Twenty-four columns were added to `blogs`. The migration runs automatically on server
boot and is idempotent, so a deploy needs no manual step.

| Group | Columns |
|---|---|
| SERP metadata | `meta_title`, `focus_keyword`, `secondary_keywords`, `canonical_url`, `robots_directive` |
| Structured data | `schema_type`, `faq_schema` |
| AEO | `direct_answer` |
| GEO | `key_facts`, `definitions` |
| Imagery | `og_image_url`, `alt_text` |
| E-E-A-T | `author_id`, `author_name`, `author_bio`, `reviewer_name`, `reviewer_role`, `reviewed_at` |
| Local relevance | `areas_covered` |
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
headline, body text, key facts and FAQ are all present as real text in the first
response.

### Structured data — Part 3

`Backend/services/structuredData.js` exports `generateStructuredData(blogPost)`,
which returns one `@graph` containing:

`Organization` + `ProfessionalService`, `WebSite`, `WebPage`, `BreadcrumbList`,
`Person`, `ImageObject`, `BlogPosting`/`Article`/`NewsArticle`/`HowTo`,
`FAQPage`, `Claim` nodes per attributed fact, and `DefinedTerm` nodes per
definition.

It is one graph with stable `@id` values rather than several separate blocks, so
the publisher of the article, the breadcrumb's home entity and the site-wide
Organization all resolve to the same node instead of three look-alikes.

A named reviewer adds a second `Person` node, referenced from the article as
both `editor` and `reviewedBy`, with `dateReviewed`. Listed areas become
`areaServed` and `spatialCoverage` `Place` nodes.

### Admin panel — Part 2

A collapsible **Help People Find This Post** panel sits below the content
editor, written for a non-technical admin. Eleven numbered sections, each
separately collapsible, in walkthrough order:

1. Get Found on Google (SEO)
2. Answer Questions Directly (AEO)
3. Help AI Tools Understand This Post
4. Tell People Which Areas This Covers
5. Who Wrote & Checked This
6. Describe Your Photo
7. Link to Other Pages
8. Extra Info for Google (Automatic)
9. How It Looks When Shared
10. Preview Before You Publish
11. Your Score & Tips

A 0-100 score sits pinned in the corner while the editor scrolls, colour-banded
red under 40, amber to 74, green at 75 and above, with the count of must-fix and
nice-to-have items. Clicking it jumps to the section that needs attention. It
stays hidden until there is a title or some content, because showing a hard zero
to someone who has typed nothing is discouraging and says nothing useful.

The score is a weighting of checks that already existed, not a second opinion:
60% for the six publish-blockers, 25% for keyword placement, 15% for the
optional extras. The must-fix count comes from the real publish gate, so it can
never promise a publish the server would refuse.

**Copy rule.** The words "meta", "schema", "canonical", "structured data",
"permalink" and the rest appear only in code and comments, never on screen. An
editor who has to look a word up before filling in a field will skip the field.
`scripts/` has no automated guard for this, so check new copy by hand.

### What readers see, and what only engines see

Two fields are deliberately invisible on the published page.

**The short answer** (`direct_answer`) is written in the admin panel purely as a
summary for Google and AI answer engines. It reaches them as the page
description, the Open Graph description and the article `abstract` — all three
are metadata, which by definition describes a page without appearing on it.

This had a consequence worth knowing about. `Speakable` markup and a
`Question`/`Answer` node were both being emitted from that same field, and both
were removed. Neither is valid unless the text it points at is visible: Speakable
names a CSS selector that has to exist, and a question-and-answer pair shown only
to crawlers is cloaking, which risks a manual penalty instead of earning a
citation. The pre-rendered crawler payload no longer contains it either, for the
same reason.

**Keywords** (`focus_keyword`, `secondary_keywords`, the legacy `keywords`
column) are search signals only. They go into the `keywords` meta tag and the
article's `keywords` property. The clickable keyword pills that used to sit at
the bottom of each post have been removed.

What readers *do* see from the panel: the FAQ, the key facts with their sources,
the author and bio, and the "Serving: …" line when areas are listed.

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

### 4. Responsive layout and image cropping

```bash
cd Frontend
node scripts/audit-responsive.mjs http://localhost:5000 /blogs /blog/<slug>
```

Loads each page at 1920, 1600, 1440, 1366, 1280, 1024, 768, 480, 375 and 320
pixels wide and reports four things:

- horizontal overflow, which makes the whole page scroll sideways
- **how much of each image is actually being shown**, by comparing the rendered
  box against the file's natural dimensions
- content hidden behind the fixed navbar
- tap targets under 44x44

Both blog pages currently pass at every width with the whole of every cover
image visible.

That second check exists because of a real bug. The article hero widened to 2:1
and then 21:9 on large screens while the covers are 16:9, so `object-cover`
scaled each image up and sliced the top and bottom off — about a quarter of the
picture at 1920, including the caption row these covers carry along the bottom.
The container is now 16:9 at every width, capped at the 1200px the upload
pipeline produces, with `object-contain` so an off-ratio cover letterboxes
against the stone background rather than losing an edge.

Elements inside a deliberately scrollable strip are ignored — the category filter
on `/blogs` is a swipeable row on phones by design, and the page itself does not
move.

### 5. Social previews

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
  src/components/SeoPanel.jsx      The plain-language admin panel
  src/components/TagInput.jsx      Shared chip input (keywords + areas)
  src/utils/seoAnalysis.js         Browser-side mirror of the server rules
  src/hooks/useBlogSeo.js          Head sync for client-side navigation
  public/.htaccess                 HTTPS, redirects, compression, caching
  public/robots.txt                Static fallback, AI crawlers allowed
  public/seo-proxy.php             Split-deployment bridge
  scripts/audit-responsive.mjs     Layout + image-cropping audit, 320-1920px
```

`Frontend/src/utils/seoAnalysis.js` duplicates the server's rules on purpose, so
the editor gets feedback on every keystroke. The server is the authority and
recomputes everything before storing or publishing. **If you change a threshold,
change it in both** — `seoAnalysis.js` and `seoValidation.js` — or the panel will
tell an editor a post is ready while the server refuses it.
