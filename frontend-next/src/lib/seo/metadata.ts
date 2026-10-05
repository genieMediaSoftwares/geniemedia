import type { Metadata } from "next";

import type { Blog } from "@/types";
import { SITE, SITE_ORIGIN } from "@/lib/site";
import { blogUrl, stripHtml, toIso } from "@/lib/blog";
import { metaForRoute, type PublicRoute } from "@/lib/seo/routeMeta";

const INDEX_ROBOTS: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true, "max-image-preview": "large" },
};

/** Metadata for one of the fixed public routes, from the ROUTE_META table. */
export function buildRouteMetadata(path: PublicRoute): Metadata {
  const meta = metaForRoute(path);
  const image = meta.image || SITE.defaultOgImage;
  return {
    // `absolute` keeps the hand-written titles exactly as they were; the
    // layout's title template is only for pages that do not set one.
    title: { absolute: meta.title },
    description: meta.description,
    alternates: { canonical: meta.canonical },
    robots: INDEX_ROBOTS,
    openGraph: {
      type: "website",
      url: meta.canonical,
      title: meta.title,
      description: meta.description,
      siteName: SITE.name,
      locale: SITE.locale,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [image],
    },
  };
}

/**
 * The canonical for a post. Always the post's own URL: an editor-supplied
 * canonical_url is honoured only when it points at a *different article*,
 * never at the site root — a post canonicalised to the home page is exactly
 * the soft-404 Search Console reported.
 */
export function blogCanonical(blog: Blog): string {
  const self = blogUrl(blog.permalink);
  const custom = (blog.canonical_url || "").trim();
  if (!custom || !/^https?:\/\//i.test(custom)) return self;
  try {
    const url = new URL(custom);
    const isRoot = url.pathname === "/" || url.pathname === "";
    const isSameSite = url.origin === new URL(SITE_ORIGIN).origin;
    if (isRoot) return self;
    // Only same-site article URLs are accepted; anything else is most likely a
    // paste error and would hand this post's ranking to another site.
    if (isSameSite && url.pathname.startsWith("/blog/")) return custom.replace(/\/+$/, "");
    return self;
  } catch {
    return self;
  }
}

export function blogDescription(blog: Blog): string {
  return (
    blog.metaDescription ||
    blog.direct_answer ||
    stripHtml(blog.description).slice(0, 160)
  );
}

/** Metadata for /blog/<permalink>, built from the post itself. */
export function buildBlogMetadata(blog: Blog): Metadata {
  const title = blog.meta_title || blog.title;
  const description = blogDescription(blog);
  const canonical = blogCanonical(blog);
  const image = blog.og_image_url || blog.image || SITE.defaultOgImage;
  const noindex = blog.robots_directive.startsWith("noindex");
  const nofollow = blog.robots_directive.endsWith("nofollow");
  const published = toIso(blog.createdAt) || undefined;
  const modified = toIso(blog.last_modified_at) || toIso(blog.updatedAt) || published;

  return {
    title: { absolute: title },
    description,
    authors: [{ name: blog.author_name || "Genie Media Editorial Team" }],
    alternates: { canonical },
    robots: noindex
      ? { index: false, follow: !nofollow }
      : { index: true, follow: !nofollow, googleBot: { index: true, follow: !nofollow, "max-image-preview": "large" } },
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description,
      siteName: SITE.name,
      locale: SITE.locale,
      images: [{ url: image, width: blog.og_image_url ? 1200 : undefined, height: blog.og_image_url ? 630 : undefined, alt: blog.alt_text || blog.title }],
      publishedTime: published,
      modifiedTime: modified,
      section: blog.category || undefined,
      authors: [blog.author_name || "Genie Media Editorial Team"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

/** For pages that must never be indexed (admin, 404). */
export const NOINDEX_METADATA: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
