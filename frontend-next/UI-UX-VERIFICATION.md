# Genie Media & Studio — implementation and verification

Completed locally on 14 October 2026. Production output is in `dist/`; no live deployment was performed.

## Problems addressed

The header became crowded at tablet widths; containers used inconsistent gutters; small-screen hero controls and project cards were cramped. About-page percentage widths, large offsets and invalid utilities caused unreliable alignment. Podcast equipment figures used overlapping margins. The testimonial carousel needed predictable centering. Booking controls lacked native keyboard behavior and labels, the calendar started in February 2026, and progression did not enforce required contact fields.

## Source files changed in the UI pass

| File | Change and purpose |
| --- | --- |
| `src/components/Header.tsx` | Consistent container and gutters, tablet/mobile navigation, touch targets, keyboard dropdown handling, mobile focus management and scroll locking. |
| `src/app/globals.css` | Visible keyboard focus, fixed-header scroll clearance, and reduced-motion support using existing colors. |
| `src/app/layout.tsx` | Skip link and focusable main content. |
| `src/views/HomePage.tsx` | Responsive hero typography, CTA grid and statistics spacing. |
| `src/components/ProjectCard.tsx` | Responsive card columns, equal-height layout and aligned CTAs. |
| `src/components/ServiceFaq.tsx` | Consistent responsive FAQ padding across service pages. |
| `src/components/Footer.tsx` | Aligned container and grid; legal links accessible on mobile. |
| `src/views/AboutPg.tsx` | Vision/Mission grids, valid image dimensions and responsive spacing; reduced-motion handling. |
| `src/components/testimonials.tsx` | Centered active card, responsive side cards and arrow placement. |
| `src/views/PodcastStudio.tsx` | Equipment grid without overlap and reduced-motion video autoplay behavior. |
| `src/components/StudioBooking.tsx` | Responsive sidebar, native keyboard controls, labels, current-month calendar, contact validation and booking-section navigation. |
| `src/components/AllServices.tsx` | Service-tab keyboard navigation and accessible tab/panel relationships. |

Verification utilities added: `scripts/ui-preservation.mjs`, `scripts/ui-preview-server.mjs`, `scripts/ui-responsive-audit.mjs`, `scripts/ui-layout-diagnostics.mjs`, and `scripts/ui-interaction-audit.mjs`. Evidence and screenshots are in `audits/ui-alignment/`.

## Tailwind and preservation

Reused Tailwind 3.4.18 with the existing Next.js App Router architecture. No new dependencies or framework migration. Responsive grid, flex, spacing, sizing and typography utilities implement the layout corrections. Necessary custom animations and effects remain.

The Tailwind configuration hash and original source color utilities were preserved. The exported baseline comparison checked 60 pages for text, headings, links, media attributes, form fields, metadata and structured data: **zero preservation differences**. Existing SEO asset hashes remained unchanged, including robots.txt, sitemap.xml, .htaccess and llms.txt. No original content or keyword was intentionally removed or replaced.

Existing imagery, responsive formats, dimensions, lazy loading and video-on-interaction behavior were retained. Dynamic backend content and authenticated administration were not covered by the static preservation comparison.

## SEO

The earlier SEO work in this task remains in place, including relevant service and local coverage. This UI pass preserves metadata, canonicals, URLs, structured data, sitemap and robots directives. Service SEO verification passes for 34 service pages and 228 FAQ answers. No repetitive keyword lists or hidden SEO text were added.

Google ranking, AEO/GEO visibility and indexing cannot be established by a local build. Search Console access was unavailable. The live website remains its previous deployment until the new output is uploaded. Production Apache redirects, PHP endpoints and Google indexing need checks after deployment.

## Verification results

| Check | Result |
| --- | --- |
| Production build | Passed; static `dist/` generated. |
| TypeScript | Passed. |
| Automated tests | 31 passed. |
| ESLint | Zero errors; eight existing warnings in AdminBlogs, AdminProjects and Blogs. |
| Service SEO | 34 pages and 228 FAQ answers passed. |
| Content/color/SEO preservation | 60 pages; zero differences. |
| Responsive sweep | 51 public routes × seven widths = 357 checks; zero measured layout findings. |
| Normal-motion sweep | 42 representative page/viewport checks; zero measured findings. |
| Interaction checks | 35 groups passed across all seven widths. |
| Local page/asset checks | Zero HTTP failures, browser page errors or missing local assets in the responsive sweep. |
| Git whitespace check | Passed. |

Widths tested: **320, 375, 425, 768, 1024, 1440 and 1920 px**. Checks covered document overflow, headings and controls outside the viewport, header overlap, and screenshots of representative pages. Interaction checks covered navigation, skip link, service tabs, FAQs, carousel, video activation, contact success/error behavior and the complete booking flow. Contact requests and WhatsApp opening were intercepted; no actual customer message was sent.

These checks do not establish live PHP delivery, backend availability, booking capacity, remote upload availability, analytics delivery or authenticated admin behavior. Screenshots taken while scrolling may capture lazy images or counters before they settle; original assets and content were preserved.

## Performance and accessibility limits

Local, unthrottled parallel browser measurements reported median DOMContentLoaded at 248 ms before and 326 ms after. Homepage test resource bytes changed from 702,379 to 704,239. Built CSS is 149,097 bytes raw and 24,432 bytes gzip. External API/analytics/media requests were blocked in these tests; these figures are not field Core Web Vitals and do not demonstrate a speed improvement.

Keyboard operation, labels, focus visibility and reduced motion improved. Existing white carousel icons on orange gradient backgrounds retain approximately 2.33–2.86:1 contrast. The strict color-preservation requirement prevented changing those colors. This remains below the [WCAG non-text contrast requirement](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) where that requirement applies; full accessibility compliance is not claimed.

## Next actions by impact

1. Upload the contents of `dist/` to the Hostinger site root, including `.htaccess` and `_next/`. Preserve the working production API/PHP configuration.
2. Verify real contact delivery, booking handoff, remote media, clean URLs and unknown-page responses on Hostinger.
3. Submit/check the sitemap and inspect key service URLs in Search Console; monitor actual impressions, clicks and indexed pages.
4. Run production PageSpeed Insights and use field Core Web Vitals to prioritize further performance work.
5. If brand-color changes become acceptable, address the existing carousel icon contrast; separately resolve the eight existing lint warnings.
