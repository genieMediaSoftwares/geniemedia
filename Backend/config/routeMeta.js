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
    title: "Genie Media & Studio | Digital Marketing, Web & Media in Vizag",
    description:
      "Genie Media & Studio helps businesses in Vizag and across India with digital marketing, websites, video production and podcast services.",
  },
  "/services": {
    title: "Genie Media Services | Marketing, Web, Video & Podcast",
    description:
      "Genie Media services in Vizag: digital marketing, SEO, website development, video production and podcast studio hire for Visakhapatnam and clients across India.",
  },
  "/about": {
    title: "About Genie Media & Studio | Visakhapatnam (Vizag)",
    description:
      "Meet Genie Media & Studio, a Visakhapatnam team for digital marketing, websites, video production and podcasting. Our story, vision, mission and approach.",
  },
  "/projects": {
    title: "Our Projects | Website Work by Genie Media, Vizag",
    description:
      "Website projects by Genie Media & Studio in Visakhapatnam: business sites and online stores built for clients in India, Australia and the US.",
  },
  "/contact": {
    title: "Contact Genie Media & Studio | Yendada, Visakhapatnam",
    description:
      "Contact Genie Media & Studio at KP Icon, Yendada, Visakhapatnam 530045. Call +91 90328 45433 or email admin@geniemedia.in to discuss your project.",
  },
  "/web_development": {
    title: "Website Development Company in Vizag & India | Genie Media",
    description:
      "Build a fast, responsive and SEO-friendly website with Genie Media's WordPress, Shopify, React and Next.js development services in Vizag.",
  },
  "/production_house": {
    title: "Video Production House in Vizag & India | Genie Media",
    description:
      "Create corporate videos, brand films, product videos and social media content with Genie Media's production house in Vizag.",
  },
  "/reviews": {
    title: "Client Reviews & Testimonials | Genie Media & Studio",
    description:
      "Video and written reviews from clients of Genie Media & Studio in Visakhapatnam, covering our podcast studio, production and digital marketing work.",
  },
  "/blogs": {
    title: "Digital Marketing Blogs | Genie Media, Vizag",
    description:
      "Digital marketing tips from Genie Media & Studio in Vizag: SEO, Google Ads, social media marketing, websites and online growth for local businesses.",
  },
  "/case-studies": {
    title: "Case Studies & Client Work | Genie Media & Studio",
    description:
      "Case studies of real projects by Genie Media & Studio in Visakhapatnam: what each client needed, how we approached the work and what we delivered.",
  },
  "/digital_marketing": {
    title: "Digital Marketing Agency in Vizag | SEO, Ads & Content",
    description:
      "Grow your business with SEO, Google Ads, local SEO, content marketing and social media services from Genie Media in Vizag and across India.",
  },
  "/podcast_studio": {
    title: "Podcast Studio Rental in Vizag | Genie Media & Studio",
    description:
      "Book a professional podcast studio in Vizag for audio and video recording, production, editing and content repurposing.",
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
