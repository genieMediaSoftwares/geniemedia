# Digital marketing SEO update

Homepage title: **Digital Marketing in Vizag | Genie Media & Studio** (49 characters).

The homepage now leads with digital marketing and links to SEO, local SEO, Google Ads, social media marketing, content marketing and lead generation pages. Visible service-area content covers Visakhapatnam (Vizag), Rushikonda, MVP Colony, Yendada, Madhurawada, Andhra Pradesh and India. The business address remains the existing Yendada office; service areas do not imply additional offices.

The supplied keyword workbook was used as a topic reference. It lists keywords, clusters, priority and intent, but no search volume or competition measurements. Relevant service and location themes are used in readable content. Awkward duplicates, unsupported “best/top” claims and unrelated services were not published as a keyword list.

New FAQs address digital marketing services, nearby areas and pricing. Their structured data uses the same answers as the visible page. Organization structured data includes service areas. Business contact details use admin@geniemedia.in. The other agency's attribution was removed from fallback project labels; real client names and links remain.

## Verification

- `npm run build`: passed; 65 static pages generated before removal of the empty case-study placeholder.
- `npm run typecheck`: passed.
- `npm test`: all 31 existing tests passed.
- ESLint on changed TypeScript/TSX files: no errors. The existing internal navigation warning in Blogs.tsx remains.
- Built homepage: 100% in the repository audit, 1,713 words, 24 occurrences of “digital marketing”, 1.40% density, Flesch readability 59.8.
- Built digital marketing page: 100% in the repository audit, 2,498 words, 24 occurrences, 0.96% density, Flesch readability 62.2.
- `npm run seo:verify`: all 34 specialist pages passed. Checks cover unique titles (30–60 characters), descriptions (120–160), a single local H1, visible service areas, canonicals, indexability, sitemap entries, directory links, internal links and 228 visible FAQ answers matching structured data.

## Site-wide service coverage

The 13 digital marketing, 14 website development and 7 podcast specialist pages now have individual local titles, descriptions, headings and service-specific guidance. A services directory links to all 34 pages in server-rendered HTML. Website and podcast hubs include relevant local coverage and links to related services. About, Contact and Blog pages explain the business and connect visitors to the right services.

Service-area data is shared across organization and service structured data: Yendada, Rushikonda, MVP Colony, Madhurawada, Visakhapatnam/Vizag, Andhra Pradesh and India. Physical podcast services use local coverage; remote editing and production support include India. The footer now uses Genie Media branding and describes these service boundaries. The existing llms.txt lists the same facts; it is a convenience document, not a Google AI ranking requirement.

AEO and GEO pages use clear service descriptions and questions. Google states that its AI search features use existing SEO foundations and require no special AI markup: [Google AI features guidance](https://developers.google.com/search/docs/appearance/ai-features).

Latest local audit results:

| Page | Score |
| --- | --- |
| Homepage | 100% |
| Digital marketing | 100% |
| Services directory | 100% |
| Contact | 100% |
| Website development | 97% |
| Podcast studio | 97% |
| About | 97% |
| Blog index | 97% |
| AEO specialist | 97% |
| GEO specialist | 94% |

Some specialist pages retain readability or transition-word warnings. These are editorial heuristics, not Google ranking thresholds. The website hub's published admin description also lacks the exact phrase “website development”; the revised source fallback includes it. To apply that description to the hub, update the published SEO admin field to:

> Website development in Vizag and India from Genie Media. Responsive WordPress, Shopify and custom websites for businesses in Visakhapatnam, Andhra Pradesh.

Do not increase repetition just to satisfy a density target. [Google's spam policies](https://developers.google.com/search/docs/essentials/spam-policies#keyword-stuffing) identify unnatural keyword repetition and blocks of location names as keyword stuffing.

These scores apply to the repository's audit, not Google's rankings or the external tool in the supplied screenshots. No keyword density guarantees a position in Google.

The build script now uses `next build --webpack` because Turbopack's CSS worker failed in this environment. The deployment command remains `npm run build`.

## Upload to Hostinger

1. From `frontend-next`, run `npm run build` for subsequent changes.
2. Upload the **contents** of `dist` into Hostinger's `public_html`, including `.htaccess`, `_next`, PHP files and `seo-live`. Preserve existing uploaded media and hosting-specific files as described in README.md.
3. Clear any Hostinger/CDN cache. Check the homepage, `/digital_marketing`, service links and contact form.
4. Submit `https://geniemedia.in/sitemap.xml` in Google Search Console and request indexing for the homepage and digital marketing page.
5. Re-run the external audit against the deployed site. Track organic enquiries and location-based searches in Search Console over time.

Published settings from the SEO admin take precedence on service pages. The current published digital marketing title is “Digital Marketing Agency in Vizag | Genie Media & Studio” (56 characters), which already meets the requested range. Update published admin settings if you want the shorter fallback title or revised fallback description to appear there. Portfolio cards also remove the old agency attribution from backend-fed display labels and alt text. Portfolio and blog records should still be reviewed in the admin when edited.

Google's guidance recommends useful content and warns against excessive keyword repetition: [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).
