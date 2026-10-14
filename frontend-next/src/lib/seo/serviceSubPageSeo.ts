import type { Metadata } from "next";

import type { JsonLdGraph } from "@/types";
import type { ServiceSubPage } from "@/content/serviceSubPage";
import { type ServiceSection, subPagePath } from "@/content/serviceSubPages";
import { SITE, canonicalFor } from "@/lib/site";
import { breadcrumbNode, organizationNode, ORG_ID } from "@/lib/seo/schema";
import { STUDIO, STUDIO_PACKAGES } from "@/content/podcastStudio";
import { INDIA_SERVICE_AREAS, LOCAL_SERVICE_AREAS } from "@/content/serviceAreas";

export function buildSubPageMetadata(section: ServiceSection, page: ServiceSubPage): Metadata {
  const canonical = canonicalFor(subPagePath(section, page.slug));
  const image = SITE.defaultOgImage;
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
    openGraph: {
      type: "website",
      url: canonical,
      title: page.title,
      description: page.description,
      siteName: SITE.name,
      locale: SITE.locale,
      images: [{ url: image }],
    },
    twitter: { card: "summary_large_image", title: page.title, description: page.description, images: [image] },
  };
}

const STUDIO_ID = `${SITE.url}/podcast-studio#studio`;

// The physical podcast studio, used on pages about recording at the Visakhapatnam studio.
const studioNode = () => ({
  "@type": "LocalBusiness",
  "@id": STUDIO_ID,
  name: "Genie Media & Studio Podcast Studio",
  url: canonicalFor("/podcast-studio"),
  image: SITE.logo,
  telephone: SITE.contact.telephone,
  email: STUDIO.email,
  address: { "@type": "PostalAddress", ...SITE.address },
  areaServed: LOCAL_SERVICE_AREAS,
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "10:00",
      closes: "19:00",
    },
  ],
  parentOrganization: { "@id": ORG_ID },
});

const packageOffers = () =>
  STUDIO_PACKAGES.flatMap((pkg) =>
    pkg.rates.map((price, i) => ({
      "@type": "Offer",
      name: `${pkg.name}, ${i + 1} hour${i ? "s" : ""}`,
      price: String(price),
      priceCurrency: "INR",
    })),
  );

export function subPageGraph(section: ServiceSection, page: ServiceSubPage): JsonLdGraph {
  const url = canonicalFor(subPagePath(section, page.slug));
  const atStudio = page.plan.schema.includes("LocalBusiness");
  const showsPrices = page.extras?.includes("packages") ?? false;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        inLanguage: SITE.language,
        about: { "@id": `${url}#service` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        publisher: { "@id": ORG_ID },
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: page.name,
        serviceType: page.plan.primaryKeyword,
        url,
        description: page.description,
        provider: { "@id": atStudio ? STUDIO_ID : ORG_ID },
        areaServed: atStudio ? LOCAL_SERVICE_AREAS : INDIA_SERVICE_AREAS,
        ...(showsPrices ? { offers: packageOffers() } : {}),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: page.included.heading,
          itemListElement: page.included.items.map((item) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: item.title, description: item.body },
          })),
        },
      },
      breadcrumbNode(`${url}#breadcrumb`, [
        { name: "Home", item: canonicalFor("/") },
        { name: section.label, item: canonicalFor(section.path) },
        { name: page.name, item: url },
      ]),
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: page.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      ...(atStudio ? [studioNode()] : []),
      organizationNode(),
    ],
  };
}
