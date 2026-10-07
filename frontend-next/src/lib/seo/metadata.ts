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

export function buildRouteMetadata(path: PublicRoute): Metadata {
  const meta = metaForRoute(path);
  const image = meta.image || SITE.defaultOgImage;
  return {
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

export function blogCanonical(blog: Blog): string {
  const self = blogUrl(blog.permalink);
  const custom = (blog.canonical_url || "").trim();
  if (!custom || !/^https?:\/\//i.test(custom)) return self;
  try {
    const url = new URL(custom);
    const isRoot = url.pathname === "/" || url.pathname === "";
    const isSameSite = url.origin === new URL(SITE_ORIGIN).origin;
    if (isRoot) return self;
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

export const NOINDEX_METADATA: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
