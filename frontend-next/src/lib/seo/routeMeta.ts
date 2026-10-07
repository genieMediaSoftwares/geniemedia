import type { JsonLdGraph, JsonLdObject, RouteMeta, RouteMetaEntry } from "@/types";
import { SITE_ORIGIN, canonicalFor } from "@/lib/site";
import { DIGITAL_MARKETING_FAQS } from "@/content/digitalMarketingFaqs";
import { PRODUCTION_HOUSE_FAQS, WEB_DEVELOPMENT_FAQS } from "@/content/serviceFaqs";

export { SITE_ORIGIN, canonicalFor };

export type PublicRoute =
  | "/"
  | "/services"
  | "/about"
  | "/projects"
  | "/case-studies"
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
  "/case-studies": {
    breadcrumb: "Case Studies",
    title: "Case Studies & Client Work | Genie Media & Studio",
    description:
      "Case studies of real projects by Genie Media & Studio in Visakhapatnam: what each client needed, how we approached the work and what we delivered.",
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
      "Custom web development in Vizag by Genie Media & Studio: business and ecommerce websites on WordPress, Shopify or React and Next.js, plus UI/UX and upkeep.",
    image: `${SITE_ORIGIN}/GenieMedia-Logo.png`,
  },
  "/production_house": {
    breadcrumb: "Production House",
    title: "Production House & Video Production in Vizag | Genie Media",
    description:
      "Genie Media & Studio is a production house in Vizag for corporate, commercial and product videos, brand films, events, editing, photography and live streaming.",
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
    title: "Digital Marketing Agency in Vizag | Genie Media & Studio",
    description:
      "Digital marketing company in Visakhapatnam (Vizag): SEO, local SEO, Google Ads, social media, Meta Ads, content and lead generation for local businesses.",
    image: `${SITE_ORIGIN}/GenieMedia-Logo.png`,
  },
  "/podcast_studio": {
    breadcrumb: "Podcast Studio",
    title: "Podcast Studio in Vizag | Genie Media & Studio",
    description:
      "Book a podcast studio in Vizag from ₹1,500 an hour. Podcast recording, video podcast filming with up to three cameras, and podcast editing by our team.",
    image: `${SITE_ORIGIN}/GenieMedia-Logo.png`,
  },
};

const PODCAST_PACKAGES = [
  { name: "Podcast studio only", price: "1500" },
  { name: "Podcast studio with team and 2 cameras", price: "3999" },
  { name: "Podcast studio with team and 3 cameras", price: "5000" },
];

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

const VIZAG_AREA: JsonLdObject = {
  "@type": "City",
  name: "Visakhapatnam",
  alternateName: "Vizag",
  containedInPlace: { "@type": "State", name: "Andhra Pradesh", containedInPlace: { "@type": "Country", name: "India" } },
};

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
            areaServed: VIZAG_AREA,
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

const faqPage = (meta: RouteMeta, faqs: Array<{ q: string; a: string }>): JsonLdObject => ({
  "@type": "FAQPage",
  "@id": `${meta.canonical}#faq`,
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

const catalog = (name: string, items: string[]): JsonLdObject => ({
  "@type": "OfferCatalog",
  name,
  itemListElement: items.map((item) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: item } })),
});

const ROUTE_SCHEMA: Partial<Record<PublicRoute, (meta: RouteMeta) => JsonLdGraph>> = {
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
        description: "SEO, local SEO and Google Business Profile, Google Ads and PPC, social media marketing and Meta Ads, content marketing, lead generation, website design and branding for businesses in Visakhapatnam (Vizag) and Andhra Pradesh.",
        areaServed: [VIZAG_AREA, { "@type": "State", name: "Andhra Pradesh", containedInPlace: { "@type": "Country", name: "India" } }],
        hasOfferCatalog: catalog("Digital marketing services", [
          "SEO Services",
          "Local SEO & Google Business Profile",
          "Google Ads & PPC Management",
          "Social Media Marketing & Meta Ads",
          "Content Marketing",
          "Lead Generation",
          "Conversion Optimization",
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
        hasOfferCatalog: catalog("Podcast studio services", [
          "Studio-only hire",
          "Video podcast with our team",
          "Audio podcasts and interviews",
          "Editing and post-production",
        ]),
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
      extraNodes: [faqPage(meta, WEB_DEVELOPMENT_FAQS)],
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
      extraNodes: [faqPage(meta, PRODUCTION_HOUSE_FAQS)],
    }),
  "/about": (meta) => pageGraph(meta, { type: "AboutPage" }),
  "/contact": (meta) => pageGraph(meta, { type: "ContactPage" }),
  "/projects": (meta) => pageGraph(meta, { type: "CollectionPage" }),
  "/case-studies": (meta) => pageGraph(meta, { type: "CollectionPage" }),
  "/services": (meta) => pageGraph(meta, { type: "CollectionPage" }),
  "/blogs": (meta) => pageGraph(meta, { type: "CollectionPage" }),
  "/reviews": (meta) => pageGraph(meta),
  "/privacy-policy": (meta) => pageGraph(meta),
  "/terms-and-conditions": (meta) => pageGraph(meta),
};

export const metaForRoute = (path: PublicRoute): RouteMeta => {
  const entry = ROUTE_META[path];
  const meta: RouteMeta = { ...entry, canonical: canonicalFor(path) };
  const schema = ROUTE_SCHEMA[path];
  return schema ? { ...meta, schema: schema(meta) } : meta;
};

export default ROUTE_META;
