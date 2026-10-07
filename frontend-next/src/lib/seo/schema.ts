import type { Blog, CaseStudy, JsonLdGraph, JsonLdObject, JsonLdValue } from "@/types";
import { caseStudyDescription, caseStudyTitle, caseStudyUrl } from "@/lib/caseStudies";
import { DEFAULT_AUTHOR, SITE } from "@/lib/site";
import { blogUrl, stripHtml, toIso } from "@/lib/blog";
import { blogCanonical, blogDescription } from "@/lib/seo/metadata";

export const ORG_ID = `${SITE.url}/#organization`;
export const WEBSITE_ID = `${SITE.url}/#website`;

export function compact<T extends JsonLdValue | undefined>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => compact(v)).filter((v) => v !== undefined && v !== null) as T;
  }
  if (value && typeof value === "object") {
    const out: JsonLdObject = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === null || v === undefined) continue;
      if (Array.isArray(v) && v.length === 0) continue;
      if (typeof v === "string" && v.trim() === "") continue;
      out[k] = compact(v);
    }
    return out as T;
  }
  return value;
}

const slugify = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const organizationNode = (): JsonLdObject =>
  compact<JsonLdObject>({
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    alternateName: SITE.alternateName,
    url: `${SITE.url}/`,
    description: SITE.description,
    logo: { "@type": "ImageObject", "@id": `${SITE.url}/#logo`, url: SITE.logo, contentUrl: SITE.logo, caption: SITE.name },
    image: { "@id": `${SITE.url}/#logo` },
    email: SITE.contact.email,
    telephone: SITE.contact.telephone,
    address: { "@type": "PostalAddress", ...SITE.address },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: SITE.contact.telephone,
        email: SITE.contact.email,
        contactType: SITE.contact.contactType,
        areaServed: [...SITE.contact.areaServed],
        availableLanguage: [...SITE.contact.availableLanguage],
      },
    ],
    sameAs: [...SITE.sameAs],
  });

export const webSiteNode = (): JsonLdObject =>
  compact<JsonLdObject>({
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE.url}/`,
    name: SITE.name,
    alternateName: SITE.alternateName,
    description: SITE.description,
    publisher: { "@id": ORG_ID },
    inLanguage: SITE.language,
  });

const authorNode = (blog: Blog): JsonLdObject => {
  const name = (blog.author_name || "").trim() || DEFAULT_AUTHOR.name;
  return compact<JsonLdObject>({
    "@type": "Person",
    "@id": `${SITE.url}/#person-${slugify(name)}`,
    name,
    description: (blog.author_bio || "").trim() || DEFAULT_AUTHOR.bio,
    url: DEFAULT_AUTHOR.url,
    worksFor: { "@id": ORG_ID },
  });
};

const reviewerNode = (blog: Blog): JsonLdObject | null => {
  const name = (blog.reviewer_name || "").trim();
  if (!name) return null;
  return compact<JsonLdObject>({
    "@type": "Person",
    "@id": `${SITE.url}/#reviewer-${slugify(name)}`,
    name,
    jobTitle: (blog.reviewer_role || "").trim() || undefined,
    worksFor: { "@id": ORG_ID },
  });
};

export interface Crumb {
  name: string;
  item: string;
}

export const breadcrumbNode = (id: string, crumbs: Crumb[]): JsonLdObject => ({
  "@type": "BreadcrumbList",
  "@id": id,
  itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.item })),
});

export const blogCrumbs = (blog: Blog): Crumb[] => [
  { name: "Home", item: `${SITE.url}/` },
  { name: "Blog", item: `${SITE.url}/blogs` },
  { name: blog.meta_title || blog.title, item: blogCanonical(blog) },
];

const visibleFaqs = (blog: Blog) => blog.faq_schema.filter((f) => f.question && f.answer);

export function blogPostingGraph(blog: Blog): JsonLdGraph {
  const url = blogCanonical(blog);
  const selfUrl = blogUrl(blog.permalink);
  const type = blog.schema_type === "FAQPage" || blog.schema_type === "HowTo" ? "BlogPosting" : blog.schema_type;
  const published = toIso(blog.createdAt);
  const modified = toIso(blog.last_modified_at) || toIso(blog.updatedAt) || published;
  const primaryImage = blog.image || SITE.defaultOgImage;
  const author = authorNode(blog);
  const reviewer = reviewerNode(blog);
  const areas = blog.areas_covered.filter(Boolean);
  const keywords = [
    blog.focus_keyword || "",
    ...blog.secondary_keywords,
    ...String(blog.keywords || "").split(","),
  ]
    .map((k) => k.trim())
    .filter(Boolean);

  const images: JsonLdObject[] = [
    compact<JsonLdObject>({
      "@type": "ImageObject",
      "@id": `${selfUrl}#primaryimage`,
      url: primaryImage,
      contentUrl: primaryImage,
      caption: blog.alt_text || blog.title,
    }),
  ];
  if (blog.og_image_url && blog.og_image_url !== primaryImage) {
    images.push(
      compact<JsonLdObject>({
        "@type": "ImageObject",
        "@id": `${selfUrl}#ogimage`,
        url: blog.og_image_url,
        contentUrl: blog.og_image_url,
        width: 1200,
        height: 630,
        caption: blog.alt_text || blog.title,
      }),
    );
  }

  const graph: JsonLdObject[] = [
    organizationNode(),
    webSiteNode(),
    compact<JsonLdObject>({
      "@type": "WebPage",
      "@id": `${selfUrl}#webpage`,
      url,
      name: blog.meta_title || blog.title,
      description: blogDescription(blog),
      isPartOf: { "@id": WEBSITE_ID },
      primaryImageOfPage: { "@id": `${selfUrl}#primaryimage` },
      datePublished: published,
      dateModified: modified,
      breadcrumb: { "@id": `${selfUrl}#breadcrumb` },
      inLanguage: SITE.language,
    }),
    breadcrumbNode(`${selfUrl}#breadcrumb`, blogCrumbs(blog)),
    author,
    ...images,
    compact<JsonLdObject>({
      "@type": type,
      "@id": `${selfUrl}#article`,
      isPartOf: { "@id": `${selfUrl}#webpage` },
      mainEntityOfPage: { "@id": `${selfUrl}#webpage` },
      headline: (blog.meta_title || blog.title).slice(0, 110),
      name: blog.title,
      description: blogDescription(blog),
      abstract: blog.direct_answer || undefined,
      articleSection: blog.category || undefined,
      image: images.map((img) => ({ "@id": String(img["@id"]) })),
      datePublished: published,
      dateModified: modified,
      author: { "@id": String(author["@id"]) },
      editor: reviewer ? { "@id": String(reviewer["@id"]) } : undefined,
      reviewedBy: reviewer ? { "@id": String(reviewer["@id"]) } : undefined,
      dateReviewed: toIso(blog.reviewed_at) || undefined,
      spatialCoverage: areas.length ? areas.map((name) => ({ "@type": "Place", name })) : undefined,
      publisher: { "@id": ORG_ID },
      keywords: keywords.length ? [...new Set(keywords)].join(", ") : undefined,
      wordCount: blog.word_count || stripHtml(blog.description).split(" ").filter(Boolean).length || undefined,
      timeRequired: blog.reading_time_minutes ? `PT${blog.reading_time_minutes}M` : undefined,
      inLanguage: SITE.language,
      url,
      isAccessibleForFree: true,
    }),
  ];

  if (reviewer) graph.push(reviewer);

  const faqs = visibleFaqs(blog);
  if (faqs.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${selfUrl}#faq`,
      mainEntity: faqs.map((f, i) => ({
        "@type": "Question",
        "@id": `${selfUrl}#faq-${i + 1}`,
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export function blogListGraph(posts: Blog[], meta: { canonical: string; title: string; description: string }): JsonLdGraph {
  return {
    "@context": "https://schema.org",
    "@graph": [
      compact<JsonLdObject>({
        "@type": "CollectionPage",
        "@id": `${meta.canonical}#webpage`,
        url: meta.canonical,
        name: meta.title,
        description: meta.description,
        isPartOf: { "@id": WEBSITE_ID },
        publisher: { "@id": ORG_ID },
        inLanguage: SITE.language,
        breadcrumb: { "@id": `${meta.canonical}#breadcrumb` },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: posts.slice(0, 50).map((post, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: blogUrl(post.permalink),
            name: post.meta_title || post.title,
          })),
        },
      }),
      breadcrumbNode(`${meta.canonical}#breadcrumb`, [
        { name: "Home", item: `${SITE.url}/` },
        { name: "Blog", item: meta.canonical },
      ]),
      webSiteNode(),
      organizationNode(),
    ],
  };
}

export const serializeJsonLd = (data: JsonLdGraph | JsonLdObject): string =>
  JSON.stringify(data).replace(/</g, "\\u003c");

export function caseStudyGraph(cs: CaseStudy): JsonLdGraph {
  const url = caseStudyUrl(cs.slug);
  const image = cs.cover
    ? compact<JsonLdObject>({
        "@type": "ImageObject",
        "@id": `${url}#primaryimage`,
        url: cs.cover.url,
        contentUrl: cs.cover.url,
        width: cs.cover.width ?? undefined,
        height: cs.cover.height ?? undefined,
        caption: cs.cover.alt,
      })
    : undefined;
  const published = toIso(cs.publishedAt) || toIso(cs.createdAt);
  return {
    "@context": "https://schema.org",
    "@graph": [
      compact<JsonLdObject>({
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: caseStudyTitle(cs),
        description: caseStudyDescription(cs),
        inLanguage: SITE.language,
        isPartOf: { "@id": WEBSITE_ID },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        primaryImageOfPage: image ? { "@id": `${url}#primaryimage` } : undefined,
        about: { "@id": `${url}#work` },
        publisher: { "@id": ORG_ID },
        datePublished: published ?? undefined,
        dateModified: toIso(cs.updatedAt) || published || undefined,
      }),
      compact<JsonLdObject>({
        "@type": "CreativeWork",
        "@id": `${url}#work`,
        name: cs.title,
        description: cs.shortDescription,
        image: image ? { "@id": `${url}#primaryimage` } : undefined,
        creator: { "@id": ORG_ID },
        dateCreated: cs.projectDate ?? undefined,
        mainEntityOfPage: { "@id": `${url}#webpage` },
      }),
      ...(image ? [image] : []),
      breadcrumbNode(`${url}#breadcrumb`, [
        { name: "Home", item: `${SITE.url}/` },
        { name: "Case Studies", item: `${SITE.url}/case-studies` },
        { name: cs.clientName, item: url },
      ]),
      webSiteNode(),
      organizationNode(),
    ],
  };
}

export function caseStudyListNode(items: CaseStudy[]): JsonLdObject {
  return {
    "@type": "ItemList",
    "@id": `${SITE.url}/case-studies#itemlist`,
    itemListElement: items.map((cs, i) => ({ "@type": "ListItem", position: i + 1, url: caseStudyUrl(cs.slug), name: cs.title })),
  };
}
