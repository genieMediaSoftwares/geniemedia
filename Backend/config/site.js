/**
 * Single source of truth for every brand / entity fact that ends up in
 * structured data, meta tags, sitemaps and robots.txt.
 *
 * Search engines and LLM answer engines both treat an organisation as an
 * *entity*: the same name, logo, address and social profiles have to be
 * repeated identically everywhere they appear, or the engine cannot confidently
 * merge them into one entity. So nothing here should be hardcoded a second time
 * anywhere else in the codebase — import from this file instead.
 *
 * Every value can be overridden per environment without a code change.
 */

const SITE_URL = (process.env.SITE_URL || "https://geniemedia.in").replace(/\/+$/, "");
const API_URL = (process.env.PUBLIC_API_URL || "https://geniemedia.onrender.com").replace(/\/+$/, "");

const SITE = {
  url: SITE_URL,
  apiUrl: API_URL,
  name: "Genie Media & Studio",
  legalName: "Genie Media & Studio",
  alternateName: "Genie Media",
  shortName: "GenieMedia",
  description:
    "Digital marketing agency and creative production studio in Visakhapatnam, India. SEO, Google and Facebook Ads, social media marketing, website and e-commerce development, video production and podcast studio rental.",
  logo: `${SITE_URL}/GenieMedia-Logo.png`,
  defaultOgImage: `${SITE_URL}/GenieMedia-Logo.png`,
  locale: "en_IN",
  language: "en",
  twitterHandle: "@itsgeniemedia",

  // Contact block — must match the NAP (name / address / phone) shown on the
  // contact page character for character, since that consistency is what local
  // SEO and entity resolution keys off.
  contact: {
    email: "admin@geniemedia.in",
    telephone: "+91-9032845433",
    contactType: "customer service",
    areaServed: ["IN", "AU", "US"],
    availableLanguage: ["en", "hi", "te"],
  },

  address: {
    streetAddress: "5A2, 4th Floor, KP Icon, KP Infra",
    addressLocality: "Yendada, Visakhapatnam",
    addressRegion: "Andhra Pradesh",
    postalCode: "530045",
    addressCountry: "IN",
  },

  geo: { latitude: 17.7594, longitude: 83.3411 },

  openingHours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "10:00", closes: "19:00" },
    { days: ["Saturday"], opens: "10:00", closes: "16:00" },
  ],

  // sameAs is the single strongest entity-disambiguation signal available in
  // schema.org — it is how an engine confirms this Organization is the same one
  // behind these profiles.
  sameAs: [
    "https://m.facebook.com/826093997257312/",
    "https://www.instagram.com/itsgeniemedia_official/",
    "https://www.youtube.com/@itsgeniemedia_official",
  ],
};

/** Fallback author used when a post has no author_id / author_bio of its own. */
const DEFAULT_AUTHOR = {
  name: "Genie Media Editorial Team",
  bio:
    "The Genie Media & Studio editorial team writes about digital marketing, SEO and web development, drawing on client campaigns delivered across India, Australia and the United States.",
  url: `${SITE.url}/about`,
  sameAs: SITE.sameAs,
  jobTitle: "Editorial Team",
};

/**
 * AI / LLM crawlers that must be explicitly welcomed.
 *
 * These are the user agents behind AI Overviews, ChatGPT search, Perplexity and
 * Claude citations. Blanket "block the scrapers" rules routinely catch them by
 * accident, which silently removes the site from every AI answer surface, so
 * they are named and allowed individually.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "CCBot",
  "Applebot",
  "Applebot-Extended",
  "Amazonbot",
  "Bytespider",
  "cohere-ai",
  "Meta-ExternalAgent",
  "DuckAssistBot",
  "YouBot",
];

/** Traditional search + social preview crawlers (used for bot detection). */
const SEARCH_CRAWLERS = [
  "Googlebot",
  "Bingbot",
  "Slurp",
  "DuckDuckBot",
  "Baiduspider",
  "YandexBot",
  "facebookexternalhit",
  "Facebot",
  "Twitterbot",
  "LinkedInBot",
  "WhatsApp",
  "TelegramBot",
  "Discordbot",
  "Slackbot",
  "redditbot",
  "Pinterest",
  "embedly",
];

const ALL_BOTS = [...AI_CRAWLERS, ...SEARCH_CRAWLERS];

// Bot names are plain [A-Za-z-] tokens, so they need no regex escaping.
const BOT_UA_REGEX = new RegExp('(' + ALL_BOTS.join('|') + ')', 'i');

const isBotRequest = (req) => BOT_UA_REGEX.test(String(req.headers["user-agent"] || ""));

module.exports = { SITE, DEFAULT_AUTHOR, AI_CRAWLERS, SEARCH_CRAWLERS, ALL_BOTS, BOT_UA_REGEX, isBotRequest };
