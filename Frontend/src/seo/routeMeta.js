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
    title: "Genie Media, Vizag | Digital Marketing, Podcast & Video Production",
    description:
      "Genie Media & Studio in Visakhapatnam offers digital marketing, SEO, websites, video production and a podcast studio for hire. Book a call or a studio slot.",
    image: "https://geniemedia.in/GenieMedia-Logo.png",
  },
  // Each page owns one search intent. The home page is the business itself,
  // each service page its service, and the rest (about, contact, projects,
  // reviews, blogs) support them without competing for the same terms.
  "/services": {
    title: "Services | Marketing, Websites, Video & Podcast Studio | Genie Media",
    description:
      "Explore Genie Media & Studio's services in Visakhapatnam: digital marketing, website development, video production and podcast studio rental.",
    image: "https://geniemedia.in/GenieMedia-Logo.png",
  },
  "/about": {
    title: "About Genie Media & Studio | Digital & Media Company in Visakhapatnam",
    description:
      "Meet Genie Media & Studio, a Visakhapatnam team for digital marketing, websites, video production and podcasting. Our story, vision, mission and approach.",
    image: "https://geniemedia.in/GenieMedia-Logo.png",
  },
  "/projects": {
    title: "Our Work | Website & E-commerce Projects | Genie Media",
    description:
      "Websites and online stores built by Genie Media & Studio for businesses in India, Australia and the US, on WordPress, Shopify and custom code.",
    image: "https://geniemedia.in/GenieMedia-Logo.png",
  },
  "/contact": {
    title: "Contact Genie Media & Studio | Yendada, Visakhapatnam",
    description:
      "Visit or call Genie Media & Studio at KP Icon, Yendada, Visakhapatnam 530045. Phone +91 90328 45433 or email admin@geniemedia.in about your project.",
    image: "https://geniemedia.in/GenieMedia-Logo.png",
  },
  "/web_development": {
    title: "Website Development Company in Visakhapatnam (Vizag) | Genie Media",
    description:
      "Genie Media & Studio designs and builds websites in Visakhapatnam (Vizag): business sites, Shopify and WooCommerce stores, WordPress and custom web apps.",
    image: "https://geniemedia.in/GenieMedia-Logo.png",
  },
  "/production_house": {
    title: "Production House & Video Production in Vizag | Genie Media",
    description:
      "Video production in Visakhapatnam (Vizag) by Genie Media & Studio: corporate and brand videos, events, product and model shoots, editing and live streaming.",
    image: "https://geniemedia.in/GenieMedia-Logo.png",
  },
  "/reviews": {
    title: "Client Reviews & Testimonials | Genie Media & Studio",
    description:
      "Video and written reviews from clients of Genie Media & Studio in Visakhapatnam, covering our podcast studio, production and digital marketing work.",
    image: "https://geniemedia.in/GenieMedia-Logo.png",
  },
  "/blogs": {
    title: "Digital Marketing Blog | SEO, Marketing & Business Growth | Genie Media",
    description:
      "Read Genie Media's digital marketing blog for SEO, Google Ads, social media marketing, website growth and online business strategies.",
  },
  "/digital_marketing": {
    title: "Digital Marketing Services in Vizag | Genie Media",
    description:
      "Genie Media & Studio provides digital marketing, SEO, Google Ads, social media, web development and branding services for businesses in Vizag.",
    image: "https://geniemedia.in/GenieMedia-Logo.png",
  },
  "/podcast_studio": {
    title: "Podcast Studio in Visakhapatnam (Vizag) | Genie Media",
    description:
      "Book a podcast studio in Visakhapatnam (Vizag) from ₹1,500 an hour. Record audio or video podcasts with our team and up to three cameras. Editing available.",
    image: "https://geniemedia.in/GenieMedia-Logo.png",
  },
};

/**
 * Podcast studio packages as the booking widget (src/components/StudioBooking.jsx)
 * prices them. Only the one-hour rate of each is listed here; if the widget's
 * prices change, change these with them.
 */
const PODCAST_PACKAGES = [
  { name: "Podcast studio only", price: "1500" },
  { name: "Podcast studio with team and 2 cameras", price: "3999" },
  { name: "Podcast studio with team and 3 cameras", price: "5000" },
];

/**
 * Business facts for structured data. Every value here is shown to visitors in
 * the footer and on the contact page, and matches Backend/config/site.js, so
 * the entity a crawler reads from JSON-LD is the one a visitor reads on screen.
 */
const ORGANIZATION = {
  "@type": ["Organization", "ProfessionalService"],
  "@id": `${SITE_ORIGIN}/#organization`,
  name: "Genie Media & Studio",
  alternateName: "Genie Media",
  url: `${SITE_ORIGIN}/`,
  logo: `${SITE_ORIGIN}/GenieMedia-Logo.png`,
  image: `${SITE_ORIGIN}/GenieMedia-Logo.png`,
  email: "admin@geniemedia.in",
  telephone: "+91-9032845433",
  address: {
    "@type": "PostalAddress",
    streetAddress: "5A2, 4th Floor, KP Icon, KP Infra",
    addressLocality: "Yendada, Visakhapatnam",
    addressRegion: "Andhra Pradesh",
    postalCode: "530045",
    addressCountry: "IN",
  },
  sameAs: [
    "https://m.facebook.com/826093997257312/",
    "https://www.instagram.com/itsgeniemedia_official/",
    "https://www.youtube.com/@itsgeniemedia_official",
    "https://www.linkedin.com/company/itsgeniemediaofficial",
  ],
};

/**
 * One page's graph: the page itself, optionally the Service it describes, and
 * the business behind both. `type` is the schema.org page type (AboutPage,
 * ContactPage, CollectionPage...). `service` is merged into a Service node
 * whose provider is the business.
 */
const pageGraph = (meta, { type = "WebPage", service, extraNodes = [] } = {}) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": type,
      "@id": `${meta.canonical}#webpage`,
      url: meta.canonical,
      name: meta.title,
      description: meta.description,
      inLanguage: "en",
      ...(service ? { about: { "@id": `${meta.canonical}#service` } } : {}),
      publisher: { "@id": ORGANIZATION["@id"] },
    },
    ...(service
      ? [
          {
            "@type": "Service",
            "@id": `${meta.canonical}#service`,
            url: meta.canonical,
            description: meta.description,
            provider: { "@id": ORGANIZATION["@id"] },
            ...service,
          },
        ]
      : []),
    ...extraNodes,
    ORGANIZATION,
  ],
});

/** An OfferCatalog of named sub-services, exactly as a page lists them. */
const catalog = (name, items) => ({
  "@type": "OfferCatalog",
  name,
  itemListElement: items.map((item) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: item } })),
});

const DIGITAL_MARKETING_FAQS = [
  {
    q: "What does a digital marketing agency in Vizag do?",
    a: "A digital marketing agency like Genie Media & Studio helps businesses in Vizag and Visakhapatnam grow their online presence. We handle SEO to improve Google rankings, run Google Ads and social media campaigns, build and optimize websites, create content, and develop brand identities."
  },
  {
    q: "How can digital marketing help my business in Visakhapatnam?",
    a: "Digital marketing puts your business in front of people actively searching for what you offer. For businesses in Visakhapatnam, local SEO helps you appear in 'near me' searches, Google Ads target local customers, and social media builds brand community."
  },
  {
    q: "How long does SEO take to show results?",
    a: "SEO is a long-term strategy. Most businesses start seeing noticeable improvements in rankings and traffic within 3 to 6 months. We provide monthly reports so you can track progress."
  },
  {
    q: "Does Genie Media & Studio provide Google Ads management in Vizag?",
    a: "Yes, we manage Google Ads (PPC) campaigns for businesses in Vizag and across Visakhapatnam. We set up search campaigns, display campaigns, and remarketing, track conversions, and optimize ad spend."
  },
  {
    q: "Do you build SEO-friendly websites in Vizag?",
    a: "Yes, every website we build follows SEO best practices from the start, including proper page structure, fast loading times, mobile responsiveness, and clean code."
  },
  {
    q: "How do I get started with Genie Media & Studio?",
    a: "Reach out through our contact page or call us at +91 90328 45433. We will schedule a free consultation to discuss your goals and suggest a strategy that fits your needs."
  }
];

/**
 * JSON-LD per route, for routes that describe something more specific than the
 * site as a whole. Kept out of ROUTE_META so that table stays the flat
 * title/description list Backend/scripts/checkRouteMeta.js compares.
 *
 * Every sub-service list is exactly the service headings rendered on that page
 * (or its tab in components/AllServices.jsx). /reviews carries no Review markup:
 * Google does not show review stars for a business's reviews of itself.
 */
const ROUTE_SCHEMA = {
  // The home page describes the business and points at each service page;
  // the detailed Service entities live on those pages.
  "/": (meta) => ({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_ORIGIN}/#website`,
        url: meta.canonical,
        name: "Genie Media & Studio",
        alternateName: "Genie Media",
        publisher: { "@id": ORGANIZATION["@id"] },
        inLanguage: "en",
      },
      {
        "@type": "WebPage",
        "@id": `${meta.canonical}#webpage`,
        url: meta.canonical,
        name: meta.title,
        description: meta.description,
        inLanguage: "en",
        isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
        about: { "@id": ORGANIZATION["@id"] },
      },
      {
        ...ORGANIZATION,
        description: meta.description,
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Services",
          itemListElement: [
            ["Digital Marketing", "/digital_marketing"],
            ["Website Development", "/web_development"],
            ["Video Production", "/production_house"],
            ["Podcast Studio Rental", "/podcast_studio"],
          ].map(([name, path]) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name, url: canonicalFor(path) },
          })),
        },
      },
    ],
  }),
  "/digital_marketing": (meta) =>
    pageGraph(meta, {
      service: {
        name: "Digital Marketing Services",
        serviceType: "Digital marketing",
        description: "SEO, Google Ads, social media marketing, website development, content strategy, branding and email marketing for businesses in Visakhapatnam (Vizag).",
        areaServed: [
          {
            "@type": "City",
            name: "Visakhapatnam",
            alternateName: "Vizag",
            containedInPlace: {
              "@type": "State",
              name: "Andhra Pradesh",
              containedInPlace: {
                "@type": "Country",
                name: "India"
              }
            }
          }
        ],
        hasOfferCatalog: catalog("Digital marketing services", [
          "SEO (Search Engine Optimization)",
          "Google Ads & PPC",
          "Social Media Marketing",
          "Website Design & Development",
          "Content Strategy & Branding",
          "Email & Performance Marketing",
        ]),
      },
      extraNodes: [
        {
          "@type": "FAQPage",
          "@id": `${meta.canonical}#faq`,
          mainEntity: DIGITAL_MARKETING_FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.a,
            },
          })),
        },
      ],
    }),
  "/podcast_studio": (meta) =>
    pageGraph(meta, {
      service: {
        name: "Podcast Studio Rental",
        serviceType: "Podcast recording studio",
        offers: PODCAST_PACKAGES.map(({ name, price }) => ({
          "@type": "Offer",
          name,
          price,
          priceCurrency: "INR",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price,
            priceCurrency: "INR",
            unitCode: "HUR",
            referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "HUR" },
          },
        })),
      },
    }),
  "/web_development": (meta) =>
    pageGraph(meta, {
      service: {
        name: "Website Development",
        serviceType: "Website design and development",
        hasOfferCatalog: catalog("Website development services", [
          "UI/UX Design",
          "Web Development",
          "Shopify Solutions",
          "WordPress Development",
          "Custom Coding",
          "Maintenance & Support",
          "Hosting & Deployment Solutions",
        ]),
      },
    }),
  "/production_house": (meta) =>
    pageGraph(meta, {
      service: {
        name: "Video Production",
        serviceType: "Video production",
        hasOfferCatalog: catalog("Production services", [
          "Video Production",
          "Wedding & Events",
          "Scriptwriting & Storyboarding",
          "Photography & Visual Content",
          "Post-Production & Editing",
          "Live Streaming & Event Coverage",
        ]),
      },
    }),
  "/about": (meta) => pageGraph(meta, { type: "AboutPage" }),
  "/contact": (meta) => pageGraph(meta, { type: "ContactPage" }),
  "/projects": (meta) => pageGraph(meta, { type: "CollectionPage" }),
  "/services": (meta) => pageGraph(meta, { type: "CollectionPage" }),
  "/blogs": (meta) => pageGraph(meta, { type: "CollectionPage" }),
  "/reviews": (meta) => pageGraph(meta),
};

/** Route metadata with its canonical filled in, or null for an unlisted path. */
export const metaForRoute = (path) => {
  const entry = ROUTE_META[path];
  if (!entry) return null;
  const meta = { ...entry, canonical: canonicalFor(path) };
  const schema = ROUTE_SCHEMA[path];
  return schema ? { ...meta, schema: schema(meta) } : meta;
};

export default ROUTE_META;
