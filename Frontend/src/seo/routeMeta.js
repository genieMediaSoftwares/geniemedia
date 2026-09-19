/**
 * Per-route title, description and canonical URL for the public pages.
 *
 * One table, so the six routes cannot drift apart and nobody has to go hunting
 * through six components to find out what Google is being told about a page.
 *
 * Keys are the exact router paths. `Frontend/src/App.jsx` reads this at the
 * route level rather than inside the page components, and that is deliberate:
 * `contactSection` and `AllServices` are each rendered both as their own page
 * AND as a section inside other pages. A <SEO> tag placed inside them would
 * quietly retitle the home page as "Contact Genie Media" the moment someone
 * scrolled past the contact block. Declaring the metadata where the route is
 * declared makes that impossible.
 */

export const SITE_ORIGIN = "https://geniemedia.in";

/**
 * Builds the canonical URL for a path.
 *
 * The root keeps its trailing slash and nothing else gets one, which is what
 * the sitemap, the .htaccess redirects and the backend all already assume. A
 * canonical that disagrees with those by a single slash points at a URL that
 * 301s, and search engines treat that as a conflicting signal.
 */
export const canonicalFor = (path) => {
  const clean = String(path || "/").split("?")[0].split("#")[0];
  if (clean === "/" || clean === "") return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}/${clean.replace(/^\/+/, "").replace(/\/+$/, "")}`;
};

export const ROUTE_META = {
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

/** Route metadata with its canonical filled in, or null for an unlisted path. */
export const metaForRoute = (path) => {
  const entry = ROUTE_META[path];
  if (!entry) return null;
  return { ...entry, canonical: canonicalFor(path) };
};

export default ROUTE_META;
