/**
 * Per-route title, description and canonical for the public pages.
 *
 * This mirrors `Frontend/src/seo/routeMeta.js`. The duplication is deliberate
 * and unavoidable: one file is an ES module bundled into the browser, the other
 * is CommonJS running in Node, and there is no shared build step between them.
 *
 * Both copies have to reach a crawler saying the same thing. If they disagree,
 * a search engine that renders JavaScript sees one title and one that does not
 * sees another — which is the definition of a mismatched signal. **Edit them
 * together.** `npm run seo:routes` compares the two and fails if they drift.
 *
 * Why the server needs this at all: the SPA fallback used to answer every
 * non-blog route with the same generic site title and a canonical pointing at
 * whatever URL was requested. GPTBot, ClaudeBot, PerplexityBot and CCBot read
 * that first response and never run the React that would have corrected it, so
 * to them /about and /services were the same untitled page.
 */

const { SITE } = require("./site");

/** The root keeps its trailing slash; nothing else gets one. */
const canonicalFor = (path) => {
  const clean = String(path || "/").split("?")[0].split("#")[0];
  if (clean === "/" || clean === "") return `${SITE.url}/`;
  return `${SITE.url}/${clean.replace(/^\/+/, "").replace(/\/+$/, "")}`;
};

const ROUTE_META = {
  "/": {
    title: "Genie Media | Digital Marketing Agency in Visakhapatnam",
    description:
      "Genie Media is a digital marketing agency in Visakhapatnam offering SEO, Google Ads, social media marketing, website development and online growth services.",
  },
  "/services": {
    title: "Digital Marketing Services in Visakhapatnam | Genie Media",
    description:
      "Digital marketing, SEO, social media and Google Ads services in Visakhapatnam from Genie Media.",
  },
  "/about": {
    title: "About Genie Media | Digital Marketing Agency in Visakhapatnam",
    description:
      "Learn about Genie Media, a digital marketing agency in Visakhapatnam helping businesses grow through SEO, social media, Google Ads and digital solutions.",
  },
  "/projects": {
    title: "Our Projects | Digital Marketing & Web Projects | Genie Media",
    description:
      "Explore digital marketing, website development, branding and online growth projects delivered by Genie Media for businesses.",
  },
  "/contact": {
    title: "Contact Genie Media | Digital Marketing Agency in Visakhapatnam",
    description:
      "Contact Genie Media in Visakhapatnam for digital marketing, SEO, Google Ads, social media marketing and website development services.",
  },
  "/blogs": {
    title: "Digital Marketing Blog | SEO, Marketing & Business Growth | Genie Media",
    description:
      "Read Genie Media's digital marketing blog for SEO, Google Ads, social media marketing, website growth and online business strategies.",
  },
};

/**
 * Metadata for a request path.
 *
 * A trailing slash is tolerated because Apache redirects those but a direct hit
 * on the Node server does not. An unlisted path returns the site defaults with
 * a canonical for that exact URL, which is still better than the home page's
 * canonical appearing on every route.
 */
const metaForRoute = (path) => {
  const raw = String(path || "/").split("?")[0];
  const normalised = raw !== "/" ? raw.replace(/\/+$/, "") : "/";
  const entry = ROUTE_META[normalised];

  if (entry) return { ...entry, canonical: canonicalFor(normalised) };

  return {
    title: SITE.name,
    description: SITE.description,
    canonical: canonicalFor(normalised),
  };
};

module.exports = { ROUTE_META, metaForRoute, canonicalFor };
