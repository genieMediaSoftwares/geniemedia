/**
 * Per-route title, description and canonical URL for the public pages.
 *
 * One table, so the six routes cannot drift apart and nobody has to go hunting
 * through six components to find out what Google is being told about a page.
 *
 * Keys are the exact route paths. Each app/<route>/page.tsx reads this through
 * buildRouteMetadata() (src/lib/seo/metadata.ts) at the route level rather than
 * inside the section components, and that is deliberate: `contactSection` and
 * `AllServices` are each rendered both as their own page AND as a section
 * inside other pages. Declaring the metadata where the route is declared keeps
 * them from retitling the pages that embed them.
 */

import type { JsonLdGraph, JsonLdObject, RouteMeta, RouteMetaEntry } from "@/types";
import { SITE_ORIGIN, canonicalFor } from "@/lib/site";
import { DIGITAL_MARKETING_FAQS } from "@/content/digitalMarketingFaqs";

export { SITE_ORIGIN, canonicalFor };

export type PublicRoute =
  | "/"
  | "/services"
  | "/about"
  | "/projects"
  | "/contact"
  | "/web_development"
  | "/production_house"
  | "/reviews"
  | "/blogs"
  | "/digital_marketing"
  | "/podcast_studio"
  | "/privacy-policy"
  | "/terms-and-conditions";

export const ROUTE_META: Record<PublicRoute, RouteMetaEntry> = {
  "/privacy-policy": {
    breadcrumb: "Privacy Policy",
    title: "Privacy Policy | Genie Media & Studio",
    description:
      "How Genie Media & Studio in Visakhapatnam collects, uses and protects personal information submitted through geniemedia.in, and the choices you have.",
    image: `${SITE_ORIGIN}/GenieMedia-Logo.png`,
  },
  "/terms-and-conditions": {
    breadcrumb: "Terms & Conditions",
    title: "Terms & Conditions | Genie Media & Studio",
    description:
      "The terms that apply to using geniemedia.in and requesting digital marketing, website, video production and podcast studio services from Genie Media & Studio.",
    image: `${SITE_ORIGIN}/GenieMedia-Logo.png`,
  },
  "/": {
    title: "Genie Media & Studio | Digital Marketing & Media in Vizag",
    description:
      "Genie Media & Studio is a digital marketing agency in Visakhapatnam offering SEO, social media marketing, website design, video production and a podcast studio.",
    image: `${SITE_ORIGIN}/GenieMedia-Logo.png`,
  },
  // Each page owns one search intent. The home page is the business itself,
  // each service page its service, and the rest (about, contact, projects,
  // reviews, blogs) support them without competing for the same terms.
  "/services": {
    breadcrumb: "Services",
    title: "Our Services in Vizag | Marketing, Web & Video | Genie Media",
    description:
      "Explore Genie Media & Studio's services in Visakhapatnam: digital marketing, website development, video production and podcast studio rental.",
    image: `${SITE_ORIGIN}/GenieMedia-Logo.png`,
  },
  "/about": {
    breadcrumb: "About",
    title: "About Genie Media & Studio | Visakhapatnam (Vizag)",
    description:
      "Meet Genie Media & Studio, a Visakhapatnam team for digital marketing, websites, video production and podcasting. Our story, vision, mission and approach.",
    image: `${SITE_ORIGIN}/GenieMedia-Logo.png`,
  },
  "/projects": {
    breadcrumb: "Projects",
    title: "Our Projects | Website Work by Genie Media, Vizag",
    description:
      "Website projects by Genie Media & Studio in Visakhapatnam: business sites and online stores built for clients in India, Australia and the US.",
    image: `${SITE_ORIGIN}/GenieMedia-Logo.png`,
  },
  "/contact": {
    breadcrumb: "Contact",
    title: "Contact Genie Media & Studio | Yendada, Visakhapatnam",
    description:
      "Contact Genie Media & Studio at KP Icon, Yendada, Visakhapatnam 530045. Call +91 90328 45433 or email admin@geniemedia.in to discuss your project.",
    image: `${SITE_ORIGIN}/GenieMedia-Logo.png`,
  },
  "/web_development": {
    breadcrumb: "Web Development",
    title: "Web Development Company in Vizag | Genie Media",
    description:
      "Genie Media & Studio offers web development in Visakhapatnam (Vizag): business websites, Shopify and WooCommerce stores, WordPress and custom web apps.",
    image: `${SITE_ORIGIN}/GenieMedia-Logo.png`,
  },
  "/production_house": {
    breadcrumb: "Production House",
    title: "Production House & Video Production in Vizag | Genie Media",
    description:
      "Genie Media & Studio is a production house in Visakhapatnam (Vizag) for corporate and brand videos, events, product shoots, editing and live streaming.",
    image: `${SITE_ORIGIN}/GenieMedia-Logo.png`,
  },
  "/reviews": {
    breadcrumb: "Reviews",
    title: "Client Reviews & Testimonials | Genie Media & Studio",
    description:
      "Video and written reviews from clients of Genie Media & Studio in Visakhapatnam, covering our podcast studio, production and digital marketing work.",
    image: `${SITE_ORIGIN}/GenieMedia-Logo.png`,
  },
  "/blogs": {
    breadcrumb: "Blogs",
    title: "Digital Marketing Blog | Genie Media, Vizag",
    description:
      "Digital marketing tips from Genie Media & Studio in Vizag: SEO, Google Ads, social media marketing, websites and online growth for local businesses.",
  },
  "/digital_marketing": {
    breadcrumb: "Digital Marketing",
    title: "Digital Marketing Agency in Vizag | Genie Media",
    description:
      "Genie Media & Studio offers digital marketing in Vizag: SEO, Google Ads, social media marketing, content, websites and branding for local businesses.",
    image: `${SITE_ORIGIN}/GenieMedia-Logo.png`,
  },
  "/podcast_studio": {
    breadcrumb: "Podcast Studio",
    title: "Podcast Studio in Visakhapatnam (Vizag) | Genie Media",
    description:
      "Book a podcast studio in Visakhapatnam (Vizag) from ₹1,500 an hour. Record audio or video podcasts with our team and up to three cameras. Editing available.",
    image: `${SITE_ORIGIN}/GenieMedia-Logo.png`,
  },
};

/**
 * Podcast studio packages as the booking widget (src/components/StudioBooking.tsx)
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
const ORGANIZATION: JsonLdObject & { "@id": string } = {
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
    streetAddress: "5A-2, 4th Floor, KP Icon, near MK Gold Coast",
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
interface PageGraphOptions {
  type?: string;
  service?: JsonLdObject;
  extraNodes?: JsonLdObject[];
}

const pageGraph = (meta: RouteMeta, { type = "WebPage", service, extraNodes = [] }: PageGraphOptions = {}): JsonLdGraph => ({
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
    ...(meta.canonical !== canonicalFor("/")
      ? [
          {
            "@type": "BreadcrumbList",
            "@id": `${meta.canonical}#breadcrumb`,
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: canonicalFor("/") },
              { "@type": "ListItem", position: 2, name: meta.breadcrumb ?? meta.title.split(" | ")[0], item: meta.canonical },
            ],
          },
        ]
      : []),
    ...extraNodes,
    ORGANIZATION,
  ],
});

/** An OfferCatalog of named sub-services, exactly as a page lists them. */
const catalog = (name: string, items: string[]): JsonLdObject => ({
  "@type": "OfferCatalog",
  name,
  itemListElement: items.map((item) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: item } })),
});

/**
 * JSON-LD per route, for routes that describe something more specific than the
 * site as a whole. Kept out of ROUTE_META so that table stays the flat
 * title/description list Backend/scripts/checkRouteMeta.js compares.
 *
 * Every sub-service list is exactly the service headings rendered on that page
 * (or its tab in components/AllServices.tsx). /reviews carries no Review markup:
 * Google does not show review stars for a business's reviews of itself.
 */
const ROUTE_SCHEMA: Partial<Record<PublicRoute, (meta: RouteMeta) => JsonLdGraph>> = {
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
        description: "SEO, Google Ads and PPC, social media marketing, content marketing, lead generation, website design and branding for businesses in Visakhapatnam (Vizag).",
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
          "SEO Services",
          "Google Ads & PPC Management",
          "Social Media Marketing",
          "Content Marketing",
          "Lead Generation & Conversion Optimization",
          "Website Design & Development",
          "Branding & Creative Services",
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
  "/privacy-policy": (meta) => pageGraph(meta),
  "/terms-and-conditions": (meta) => pageGraph(meta),
};

/** Route metadata with its canonical and JSON-LD graph filled in. */
export const metaForRoute = (path: PublicRoute): RouteMeta => {
  const entry = ROUTE_META[path];
  const meta: RouteMeta = { ...entry, canonical: canonicalFor(path) };
  const schema = ROUTE_SCHEMA[path];
  return schema ? { ...meta, schema: schema(meta) } : meta;
};

export default ROUTE_META;
