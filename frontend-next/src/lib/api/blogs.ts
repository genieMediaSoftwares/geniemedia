import "server-only";

import type { Blog } from "@/types";
import { CACHE_TAGS, arr, serverGetJson } from "@/lib/api/client";
import { normalizeBlog, toBlogCard } from "@/lib/api/normalize";

import { cleanSlug } from "@/lib/blog";

export { normalizeBlog, toBlogCard };

/** Every published post, newest first. Throws if the backend is unreachable. */
export async function getPublishedBlogs(): Promise<Blog[]> {
  const data = await serverGetJson("/api/blogs", { tags: [CACHE_TAGS.blogs] });
  return arr(data)
    .map((raw) => normalizeBlog(raw))
    .filter((b): b is Blog => b !== null && b.status === "published")
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

/** Same as getPublishedBlogs, but an empty list instead of an error. */
export async function getPublishedBlogsSafe(): Promise<Blog[]> {
  try {
    return await getPublishedBlogs();
  } catch (err) {
    console.error("[blogs] list unavailable:", err instanceof Error ? err.message : err);
    return [];
  }
}

export type BlogLookup = { kind: "found"; blog: Blog } | { kind: "redirect"; to: string } | { kind: "missing" };

/**
 * Resolves a /blog/<slug> request.
 *
 *  - a published post        -> found
 *  - a retired slug          -> redirect (301 to the current permalink)
 *  - unknown slug or a draft -> missing (a real 404, never the home page)
 *
 * Network/5xx failures throw, so the route answers 5xx (or ISR keeps serving
 * the last good copy) instead of caching a false 404.
 */
export async function lookupBlog(rawSlug: string): Promise<BlogLookup> {
  const slug = cleanSlug(rawSlug);
  if (!slug) return { kind: "missing" };

  const data = await serverGetJson(`/api/blog/${slug.split("/").map(encodeURIComponent).join("/")}`, {
    tags: [CACHE_TAGS.blogs, `blog:${slug}`],
  });
  const blog = normalizeBlog(data);

  if (blog) {
    if (blog.status !== "published") return { kind: "missing" };
    return { kind: "found", blog };
  }

  // Not a live permalink: follow the slug history so renamed posts keep their
  // inbound links (the Express server did the same with a 301).
  const all = await getPublishedBlogs();
  const moved = all.find((b) => b.slug_history.some((h) => cleanSlug(h.slug) === slug));
  if (moved) return { kind: "redirect", to: `/blog/${moved.permalink}` };

  return { kind: "missing" };
}
