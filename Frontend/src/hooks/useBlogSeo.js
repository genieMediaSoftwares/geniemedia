import { useEffect } from "react";

/**
 * Head tags for a blog post that <SEO> does not already cover.
 *
 * WHO OWNS WHAT, because getting this wrong is how you end up with two
 * canonicals that disagree:
 *
 *   src/components/SEO.jsx   title, description, canonical, og:title,
 *   (react-helmet-async)     og:description, og:url, og:type, og:image,
 *                            og:site_name, og:locale, twitter:*
 *
 *   this hook                keywords, robots, author, the article:* timestamps
 *                            and section, and the JSON-LD graph
 *
 * They must not overlap. Helmet rewrites every tag marked `data-rh` on each
 * render, so anything this hook wrote into one of those tags would be wiped the
 * next time any route rendered — or worse, survive as a stale duplicate. The
 * split above keeps exactly one owner per tag.
 *
 * As before, this exists for client-side navigation. The server already injects
 * a complete head on the first request to /blog/<slug>; this covers the case
 * where React swaps the page without a new HTTP request and the head would
 * otherwise still describe wherever the visitor arrived from.
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
    // Remember what was there so it can be put back on unmount.
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

// Only the tags this hook owns. Nothing here overlaps with <SEO>.
const MANAGED = [
  ["name", "keywords"],
  ["name", "robots"],
  ["name", "author"],
  ["property", "article:published_time"],
  ["property", "article:modified_time"],
  ["property", "article:section"],
];

/**
 * Builds the same JSON-LD graph the server emits, minus the nodes that depend
 * on data the browser does not have. It is written under a marked <script> so
 * it replaces rather than duplicates the server's block for this page.
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
      abstract: blog.direct_answer || undefined,
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

  const areas = Array.isArray(blog.areas_covered) ? blog.areas_covered.filter(Boolean) : [];
  if (areas.length) {
    graph[0].areaServed = areas.map((name) => ({ "@type": "Place", name }));
  }

  if (String(blog.reviewer_name || "").trim()) {
    graph[0].reviewedBy = {
      "@type": "Person",
      name: blog.reviewer_name,
      jobTitle: blog.reviewer_role || undefined,
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

    const iso = (v) => {
      if (!v) return "";
      const d = new Date(Number(v) || v);
      return Number.isNaN(d.getTime()) ? "" : d.toISOString();
    };

    upsertMeta("name", "keywords", blog.keywords || "");
    upsertMeta("name", "robots", `${blog.robots_directive || "index,follow"}, max-image-preview:large`);
    upsertMeta("name", "author", blog.author_name || "Genie Media Editorial Team");
    upsertMeta("property", "article:published_time", iso(blog.createdAt));
    upsertMeta("property", "article:modified_time", iso(blog.last_modified_at || blog.updatedAt));
    upsertMeta("property", "article:section", blog.category || "");

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute(MARKER, "");
    script.textContent = JSON.stringify(buildJsonLd(blog));
    document.head.appendChild(script);

    return () => {
      MANAGED.forEach(([attr, key]) => restoreMeta(attr, key));
      script.remove();
    };
  }, [blog]);
}
