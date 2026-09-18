import { useEffect } from "react";

/**
 * Keeps the document head in sync with the post being displayed.
 *
 * The server already injects a complete head for the first request to
 * /blog/<slug> (Backend/services/htmlInjector.js), which is what crawlers and
 * AI bots read. This hook covers the case that injection cannot: a client-side
 * navigation, where React swaps the page without a new HTTP request and the head
 * would otherwise still describe whatever page the visitor arrived on.
 *
 * That matters for anyone who hits "share" after browsing, for the tab title,
 * and for the in-page JSON-LD staying truthful about what is on screen.
 *
 * Everything written here is tagged with data-blog-seo so it can be removed
 * cleanly on unmount, without disturbing the server-injected tags of the
 * original page load.
 */

const SITE_URL = "https://geniemedia.in";
const MARKER = "data-blog-seo";

const cleanSlug = (raw) =>
  String(raw || "").replace(/^\/+/, "").replace(/^blog\//, "").replace(/\/+$/, "");

const stripHtml = (html) =>
  String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const upsertMeta = (attr, key, content) => {
  if (!content) return null;
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector(selector);

  if (el) {
    // Remember what the server put there so it can be restored on unmount.
    if (!el.hasAttribute(MARKER) && !el.hasAttribute("data-blog-seo-prev")) {
      el.setAttribute("data-blog-seo-prev", el.getAttribute("content") || "");
    }
    el.setAttribute("content", content);
    return el;
  }

  el = document.createElement("meta");
  el.setAttribute(attr, key);
  el.setAttribute("content", content);
  el.setAttribute(MARKER, "");
  document.head.appendChild(el);
  return el;
};

const restoreMeta = (attr, key) => {
  const el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) return;
  if (el.hasAttribute(MARKER)) {
    el.remove();
  } else if (el.hasAttribute("data-blog-seo-prev")) {
    el.setAttribute("content", el.getAttribute("data-blog-seo-prev"));
    el.removeAttribute("data-blog-seo-prev");
  }
};

const MANAGED = [
  ["name", "description"],
  ["name", "keywords"],
  ["name", "robots"],
  ["name", "author"],
  ["property", "og:type"],
  ["property", "og:title"],
  ["property", "og:description"],
  ["property", "og:image"],
  ["property", "og:url"],
  ["property", "article:published_time"],
  ["property", "article:modified_time"],
  ["property", "article:section"],
  ["name", "twitter:card"],
  ["name", "twitter:title"],
  ["name", "twitter:description"],
  ["name", "twitter:image"],
];

/**
 * Builds the same JSON-LD graph the server emits, minus the nodes that depend on
 * data the browser does not have. It is written under a marked <script> so it
 * replaces rather than duplicates the server's block for this page.
 */
const buildJsonLd = (blog) => {
  const url = `${SITE_URL}/blog/${cleanSlug(blog.permalink)}`;
  const iso = (v) => {
    if (!v) return undefined;
    const d = new Date(Number(v) || v);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  };

  const graph = [
    {
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      headline: (blog.meta_title || blog.title || "").slice(0, 110),
      description:
        blog.direct_answer || blog.metaDescription || stripHtml(blog.description).slice(0, 200),
      image: blog.image ? [blog.image] : undefined,
      datePublished: iso(blog.createdAt),
      dateModified: iso(blog.last_modified_at || blog.updatedAt || blog.createdAt),
      articleSection: blog.category || undefined,
      inLanguage: "en",
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: {
        "@type": "Person",
        name: blog.author_name || "Genie Media Editorial Team",
        description: blog.author_bio || undefined,
      },
      publisher: {
        "@type": "Organization",
        name: "Genie Media & Studio",
        logo: { "@type": "ImageObject", url: `${SITE_URL}/GenieMedia-Logo.png` },
      },
      wordCount: blog.word_count || undefined,
      timeRequired: blog.reading_time_minutes ? `PT${blog.reading_time_minutes}M` : undefined,
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blogs` },
        ...(blog.category
          ? [{ "@type": "ListItem", position: 3, name: blog.category, item: `${SITE_URL}/blogs` }]
          : []),
        {
          "@type": "ListItem",
          position: blog.category ? 4 : 3,
          name: blog.meta_title || blog.title,
          item: url,
        },
      ],
    },
  ];

  if (blog.direct_answer) {
    graph[0].speakable = {
      "@type": "SpeakableSpecification",
      cssSelector: [".geo-direct-answer", ".aeo-answer-text", "h1"],
    };
  }

  const faqs = (Array.isArray(blog.faq_schema) ? blog.faq_schema : []).filter(
    (f) => f && f.question && f.answer
  );

  if (faqs.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
};

export default function useBlogSeo(blog) {
  useEffect(() => {
    if (!blog || !blog.title) return undefined;

    const url = `${SITE_URL}/blog/${cleanSlug(blog.permalink)}`;
    const title = blog.meta_title || blog.title;
    const description =
      blog.metaDescription || blog.direct_answer || stripHtml(blog.description).slice(0, 160);

    const previousTitle = document.title;
    document.title = title;

    upsertMeta("name", "description", description);
    upsertMeta("name", "keywords", blog.keywords || "");
    upsertMeta("name", "robots", `${blog.robots_directive || "index,follow"}, max-image-preview:large`);
    upsertMeta("name", "author", blog.author_name || "Genie Media Editorial Team");

    upsertMeta("property", "og:type", "article");
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:image", blog.og_image_url || blog.image || "");
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "article:section", blog.category || "");

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", blog.og_image_url || blog.image || "");

    // Canonical
    let canonical = document.head.querySelector('link[rel="canonical"]');
    const previousCanonical = canonical ? canonical.getAttribute("href") : null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      canonical.setAttribute(MARKER, "");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", blog.canonical_url || url);

    // JSON-LD
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute(MARKER, "");
    script.textContent = JSON.stringify(buildJsonLd(blog));
    document.head.appendChild(script);

    return () => {
      document.title = previousTitle;
      MANAGED.forEach(([attr, key]) => restoreMeta(attr, key));
      script.remove();
      if (canonical.hasAttribute(MARKER)) canonical.remove();
      else if (previousCanonical) canonical.setAttribute("href", previousCanonical);
    };
  }, [blog]);
}
