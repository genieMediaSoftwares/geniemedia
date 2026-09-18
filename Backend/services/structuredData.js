/**
 * JSON-LD generation for every public surface.
 *
 * Everything is emitted as ONE `@graph` with stable `@id` values rather than a
 * pile of separate <script> blocks. That matters: when the Organization appears
 * as its own node with `@id` "<site>/#organization", the publisher of an article,
 * the breadcrumb's home entity and the site-wide Organization all resolve to the
 * same node instead of three look-alike copies. Entity consolidation is exactly
 * what the AI answer engines use to decide whether a site is a known publisher
 * or an anonymous page, so it is worth the extra structure.
 *
 * `generateStructuredData(blogPost)` returns a plain object. It never touches
 * the request or response, so the blog detail route, the share/OG route and any
 * future AMP or syndication route can all reuse it unchanged.
 */

const { SITE, DEFAULT_AUTHOR } = require("../config/site");
const { countWords, readingTime, stripHtml } = require("./contentAnalysis");

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

/**
 * Columns declared JSON come back as parsed objects on MySQL 5.7+, but as raw
 * strings when the migration fell back to LONGTEXT. Both shapes have to work.
 */
const parseJsonColumn = (value, fallback = null) => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object") return value;
  try {
    const parsed = JSON.parse(value);
    return parsed === null ? fallback : parsed;
  } catch (_) {
    return fallback;
  }
};

const asArray = (value) => {
  const parsed = parseJsonColumn(value, []);
  return Array.isArray(parsed) ? parsed : [];
};

/** Epoch-ms, SQL DATETIME or Date -> ISO-8601, which is what schema.org wants. */
const toIso = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString();
  const numeric = Number(value);
  const date = Number.isFinite(numeric) && String(value).trim() !== "" ? new Date(numeric) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const absoluteUrl = (value, fallback = null) => {
  if (!value) return fallback;
  const str = String(value).trim();
  if (!str) return fallback;
  if (/^https?:\/\//i.test(str)) return str;
  return `${SITE.url}/${str.replace(/^\/+/, "")}`;
};

const cleanSlug = (raw) =>
  String(raw || "")
    .replace(/^\/+/, "")
    .replace(/^blog\//, "")
    .replace(/\/+$/, "");

const blogUrl = (permalink) => `${SITE.url}/blog/${cleanSlug(permalink)}`;

/** Removes null/undefined/empty-array members so the output stays readable. */
const compact = (obj) => {
  if (Array.isArray(obj)) return obj.map(compact).filter((v) => v !== undefined && v !== null);
  if (obj && typeof obj === "object" && !(obj instanceof Date)) {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v === null || v === undefined) continue;
      if (Array.isArray(v) && v.length === 0) continue;
      if (typeof v === "string" && v.trim() === "") continue;
      out[k] = compact(v);
    }
    return out;
  }
  return obj;
};

// ---------------------------------------------------------------------------
// Site-wide entities
// ---------------------------------------------------------------------------

const ORG_ID = `${SITE.url}/#organization`;
const WEBSITE_ID = `${SITE.url}/#website`;

/**
 * The publisher entity. Typed as Organization; the local office address and
 * opening hours are included because they are true and because local-business
 * detail measurably improves entity confidence for a city-scoped agency.
 */
const organizationSchema = () =>
  compact({
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    alternateName: SITE.alternateName,
    url: `${SITE.url}/`,
    description: SITE.description,
    logo: {
      "@type": "ImageObject",
      "@id": `${SITE.url}/#logo`,
      url: SITE.logo,
      contentUrl: SITE.logo,
      caption: SITE.name,
    },
    image: { "@id": `${SITE.url}/#logo` },
    email: SITE.contact.email,
    telephone: SITE.contact.telephone,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.streetAddress,
      addressLocality: SITE.address.addressLocality,
      addressRegion: SITE.address.addressRegion,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.addressCountry,
    },
    geo: { "@type": "GeoCoordinates", latitude: SITE.geo.latitude, longitude: SITE.geo.longitude },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: SITE.contact.telephone,
        email: SITE.contact.email,
        contactType: SITE.contact.contactType,
        areaServed: SITE.contact.areaServed,
        availableLanguage: SITE.contact.availableLanguage,
      },
    ],
    openingHoursSpecification: SITE.openingHours.map((slot) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: slot.days,
      opens: slot.opens,
      closes: slot.closes,
    })),
    sameAs: SITE.sameAs,
  });

const webSiteSchema = () =>
  compact({
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE.url}/`,
    name: SITE.name,
    description: SITE.description,
    publisher: { "@id": ORG_ID },
    inLanguage: SITE.language,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE.url}/blogs?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  });

/**
 * Site-wide graph for the base HTML of every non-article page.
 */
const generateSiteSchema = () => ({
  "@context": "https://schema.org",
  "@graph": [organizationSchema(), webSiteSchema()],
});

// ---------------------------------------------------------------------------
// Per-post entities
// ---------------------------------------------------------------------------

/**
 * The reviewer, when one is named.
 *
 * schema.org models this as `editor` on the Article, which is a distinct claim
 * from `author`: someone other than the writer checked the work. For advice
 * content that is the more meaningful of the two, so it is emitted as its own
 * Person node rather than being folded into the author.
 */
const reviewerSchema = (blog) => {
  const name = String(blog.reviewer_name || "").trim();
  if (!name) return null;

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const role = String(blog.reviewer_role || "").trim();

  return compact({
    "@type": "Person",
    "@id": `${SITE.url}/#reviewer-${slug}`,
    name,
    jobTitle: role || undefined,
    worksFor: { "@id": ORG_ID },
  });
};

const authorSchema = (blog) => {
  const name = (blog.author_name || "").trim() || DEFAULT_AUTHOR.name;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return compact({
    "@type": "Person",
    "@id": `${SITE.url}/#person-${slug}`,
    name,
    description: (blog.author_bio || "").trim() || DEFAULT_AUTHOR.bio,
    url: DEFAULT_AUTHOR.url,
    jobTitle: DEFAULT_AUTHOR.jobTitle,
    worksFor: { "@id": ORG_ID },
    sameAs: DEFAULT_AUTHOR.sameAs,
  });
};

/**
 * Home > Blog > Category > Post.
 *
 * Breadcrumbs are what replace the raw URL in a Google result, and they give an
 * answer engine the post's place in the site's topic tree for free.
 */
const breadcrumbSchema = (blog) => {
  const url = blogUrl(blog.permalink);
  const items = [
    { name: "Home", item: `${SITE.url}/` },
    { name: "Blog", item: `${SITE.url}/blogs` },
  ];

  if (blog.category) {
    // No per-category archive route exists yet, so the category points at the
    // blog index. Listing it keeps the trail truthful about the hierarchy
    // without inventing a URL that would 404 for a crawler that follows it.
    items.push({ name: blog.category, item: `${SITE.url}/blogs` });
  }

  items.push({ name: blog.meta_title || blog.title, item: url });

  return {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: items.map((entry, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
};

/**
 * FAQPage built from the `faq_schema` column.
 *
 * Only Q/A pairs where both halves are present are emitted — a half-filled pair
 * is an invalid-structured-data warning in Search Console, which is worse than
 * having no FAQ block at all.
 */
const faqSchema = (blog) => {
  const pairs = asArray(blog.faq_schema)
    .map((item) => ({
      question: String(item.question || "").trim(),
      answer: String(item.answer || "").trim(),
    }))
    .filter((item) => item.question && item.answer);

  if (!pairs.length) return null;

  const url = blogUrl(blog.permalink);
  return {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    mainEntity: pairs.map((pair, i) => ({
      "@type": "Question",
      "@id": `${url}#faq-${i + 1}`,
      name: pair.question,
      acceptedAnswer: { "@type": "Answer", text: pair.answer },
    })),
  };
};

/**
 * Speakable and the standalone Question node used to be emitted here, built
 * from `direct_answer`.
 *
 * They were removed when the short answer stopped being rendered on the page.
 * Both of those markup types are only valid when the text they point at is
 * visible to a reader: Speakable names a CSS selector that has to exist, and a
 * Question/Answer pair shown only to crawlers is cloaking, which risks a manual
 * penalty rather than earning a citation.
 *
 * `direct_answer` still reaches search and AI engines — as the page
 * description, the Open Graph description and the article `abstract`. All three
 * are metadata by definition, so none of them require on-page text.
 */

/**
 * Attributed facts become `Claim` nodes with a citation back to the source.
 *
 * Retrieval-augmented engines strongly prefer a fact they can attribute over the
 * same fact buried in a paragraph, because an attributed fact is safe to repeat
 * and a narrative assertion is not.
 */
const claimsSchema = (blog) => {
  const facts = asArray(blog.key_facts)
    .map((f) => ({ fact: String(f.fact || "").trim(), source: String(f.source || f.source_url || "").trim() }))
    .filter((f) => f.fact);

  if (!facts.length) return [];

  const url = blogUrl(blog.permalink);
  return facts.map((f, i) =>
    compact({
      "@type": "Claim",
      "@id": `${url}#fact-${i + 1}`,
      text: f.fact,
      appearance: { "@id": `${url}#article` },
      citation: f.source || null,
    })
  );
};

/**
 * `DefinedTerm` nodes for the terms the post introduces.
 *
 * A single-sentence definition near first use is the unit an LLM lifts verbatim
 * as ground truth, so stating them in markup as well removes the guesswork.
 */
const definedTermsSchema = (blog) => {
  const terms = asArray(blog.definitions)
    .map((d) => ({ term: String(d.term || "").trim(), definition: String(d.definition || "").trim() }))
    .filter((d) => d.term && d.definition);

  if (!terms.length) return [];

  const url = blogUrl(blog.permalink);
  return terms.map((t, i) => ({
    "@type": "DefinedTerm",
    "@id": `${url}#term-${i + 1}`,
    name: t.term,
    description: t.definition,
    inDefinedTermSet: { "@type": "DefinedTermSet", "@id": `${SITE.url}/#glossary`, name: `${SITE.name} glossary` },
  }));
};

const imageSchema = (blog) => {
  const primary = absoluteUrl(blog.image, SITE.defaultOgImage);
  const og = absoluteUrl(blog.og_image_url, null);
  const url = blogUrl(blog.permalink);

  const images = [
    compact({
      "@type": "ImageObject",
      "@id": `${url}#primaryimage`,
      url: primary,
      contentUrl: primary,
      width: 1200,
      height: 675,
      caption: blog.alt_text || blog.title,
    }),
  ];

  if (og && og !== primary) {
    images.push(
      compact({
        "@type": "ImageObject",
        "@id": `${url}#ogimage`,
        url: og,
        contentUrl: og,
        width: 1200,
        height: 630,
        caption: blog.alt_text || blog.title,
      })
    );
  }

  return images;
};

const ARTICLE_TYPES = ["Article", "BlogPosting", "FAQPage", "HowTo", "NewsArticle"];

/**
 * The main article node.
 *
 * `schema_type` is editor-chosen, but FAQPage is handled as its own node in the
 * graph rather than as the article's type, so selecting it here falls back to
 * BlogPosting for the article itself. Two nodes is the correct modelling and it
 * is what the Rich Results Test expects.
 */
const articleSchema = (blog) => {
  const url = blogUrl(blog.permalink);
  const requested = ARTICLE_TYPES.includes(blog.schema_type) ? blog.schema_type : "BlogPosting";
  const type = requested === "FAQPage" ? "BlogPosting" : requested;

  const published = toIso(blog.createdAt);
  const modified = toIso(blog.last_modified_at) || toIso(blog.updatedAt) || published;

  const description =
    String(blog.direct_answer || "").trim() ||
    String(blog.metaDescription || "").trim() ||
    stripHtml(blog.description).slice(0, 200);

  const keywords = [
    String(blog.focus_keyword || "").trim(),
    ...asArray(blog.secondary_keywords).map((k) => String(k).trim()),
    ...String(blog.keywords || "")
      .split(",")
      .map((k) => k.trim()),
  ].filter(Boolean);

  const words = Number(blog.word_count) || countWords(blog.description);
  const reviewer = reviewerSchema(blog);
  const areas = asArray(blog.areas_covered).map((a) => String(a).trim()).filter(Boolean);

  return compact({
    "@type": type,
    "@id": `${url}#article`,
    isPartOf: { "@id": `${url}#webpage` },
    mainEntityOfPage: { "@id": `${url}#webpage` },
    headline: String(blog.meta_title || blog.title || "").slice(0, 110),
    name: blog.title,
    description,
    // `abstract` is schema.org's own term for a summary of the work. It is the
    // correct home for a short answer that is deliberately not printed on the
    // page, and engines read it when deciding how to describe the article.
    abstract: String(blog.direct_answer || "").trim() || undefined,
    articleSection: blog.category || undefined,
    articleBody: stripHtml(blog.description).slice(0, 5000) || undefined,
    image: imageSchema(blog).map((img) => ({ "@id": img["@id"] })),
    datePublished: published,
    dateModified: modified,
    author: { "@id": authorSchema(blog)["@id"] },
    // `editor` carries the "someone else checked this" claim; `reviewedBy` is
    // the property Google's own E-E-A-T documentation names. Both point at the
    // same Person node, so this is one entity described twice, not two people.
    editor: reviewer ? { "@id": reviewer["@id"] } : undefined,
    reviewedBy: reviewer ? { "@id": reviewer["@id"] } : undefined,
    // The date the post was last checked is a different fact from the date it
    // was last edited, and readers of advice content care about the former.
    dateReviewed: toIso(blog.reviewed_at) || undefined,
    // Places this post is written for. On a BlogPosting this is what lets a
    // "near me" search in one of those towns match the article.
    areaServed: areas.length
      ? areas.map((area) => ({ "@type": "Place", name: area }))
      : undefined,
    spatialCoverage: areas.length
      ? areas.map((area) => ({ "@type": "Place", name: area }))
      : undefined,
    publisher: { "@id": ORG_ID },
    keywords: [...new Set(keywords)].join(", ") || undefined,
    wordCount: words || undefined,
    timeRequired: `PT${Number(blog.reading_time_minutes) || readingTime(blog.description)}M`,
    inLanguage: SITE.language,
    url,
    isAccessibleForFree: true,
    // Declaring the whole article free and unfenced is what lets an answer
    // engine quote from it rather than treat it as gated content.
    license: `${SITE.url}/`,
  });
};

const webPageSchema = (blog) => {
  const url = blogUrl(blog.permalink);
  const answer = String(blog.direct_answer || "").trim();

  return compact({
    "@type": "WebPage",
    // `description` falls back to the short answer, which is metadata and so is
    // allowed to describe the page without appearing on it.
    "@id": `${url}#webpage`,
    url,
    name: blog.meta_title || blog.title,
    description: String(blog.metaDescription || "").trim() || answer,
    isPartOf: { "@id": WEBSITE_ID },
    primaryImageOfPage: { "@id": `${url}#primaryimage` },
    datePublished: toIso(blog.createdAt),
    dateModified: toIso(blog.last_modified_at) || toIso(blog.updatedAt),
    breadcrumb: { "@id": `${url}#breadcrumb` },
    inLanguage: SITE.language,
    potentialAction: [{ "@type": "ReadAction", target: [url] }],
  });
};

/**
 * The single entry point. Give it a row from `blogs`, get back the complete
 * JSON-LD graph for that post's page.
 */
const generateStructuredData = (blogPost) => {
  if (!blogPost || !blogPost.permalink) return null;

  const graph = [
    organizationSchema(),
    webSiteSchema(),
    webPageSchema(blogPost),
    breadcrumbSchema(blogPost),
    authorSchema(blogPost),
    ...imageSchema(blogPost),
    articleSchema(blogPost),
  ];

  // Must be in the graph as a real node, not only referenced by @id from the
  // article, or the reference dangles and the reviewer resolves to nothing.
  const reviewer = reviewerSchema(blogPost);
  if (reviewer) graph.push(reviewer);

  const faq = faqSchema(blogPost);
  if (faq) graph.push(faq);

  graph.push(...claimsSchema(blogPost));
  graph.push(...definedTermsSchema(blogPost));

  return { "@context": "https://schema.org", "@graph": graph };
};

/** Collection page schema for /blogs. */
const generateBlogListSchema = (posts = []) => ({
  "@context": "https://schema.org",
  "@graph": [
    organizationSchema(),
    webSiteSchema(),
    compact({
      "@type": "CollectionPage",
      "@id": `${SITE.url}/blogs#webpage`,
      url: `${SITE.url}/blogs`,
      name: `Blog — ${SITE.name}`,
      description:
        "Articles on digital marketing, SEO, paid advertising and web development from the Genie Media & Studio team.",
      isPartOf: { "@id": WEBSITE_ID },
      inLanguage: SITE.language,
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
  ],
});

module.exports = {
  generateStructuredData,
  reviewerSchema,
  generateSiteSchema,
  generateBlogListSchema,
  organizationSchema,
  breadcrumbSchema,
  faqSchema,
  parseJsonColumn,
  asArray,
  toIso,
  absoluteUrl,
  cleanSlug,
  blogUrl,
  compact,
  ORG_ID,
  WEBSITE_ID,
};
