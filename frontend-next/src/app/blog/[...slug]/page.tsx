import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";

import BlogArticle from "@/components/blog/BlogArticle";
import JsonLd from "@/components/seo/JsonLd";
import { getPublishedBlogsSafe, lookupBlog } from "@/lib/api/blogs";
import { buildBlogMetadata, NOINDEX_METADATA } from "@/lib/seo/metadata";
import { blogPostingGraph } from "@/lib/seo/schema";

/**
 * /blog/<permalink> — permalinks contain slashes ("category/post"), hence the
 * catch-all segment. Every published post is pre-rendered to static HTML at
 * build time (static export for Hostinger). After publishing a new post, run
 * `npm run build` and upload `dist/` again so it gets its page.
 *
 * Outcomes:
 *   published post   -> static page with its own canonical, metadata and JSON-LD
 *   retired slug     -> redirect to the current permalink
 *   unknown or draft -> no file is generated, so Apache answers a real 404
 */
// Only posts known at build time exist; anything else is a 404.
export const dynamicParams = false;

type Params = { slug: string[] };

const slugFrom = (params: Params): string => params.slug.map((s) => decodeURIComponent(s)).join("/");

// One backend round trip per request, shared by generateMetadata and the page.
const resolve = cache((slug: string) => lookupBlog(slug));

export async function generateStaticParams(): Promise<Params[]> {
  const blogs = await getPublishedBlogsSafe();
  return blogs.map((b) => ({ slug: b.permalink.split("/") }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const result = await resolve(slugFrom(await params));
  if (result.kind !== "found") return { title: { absolute: "Page not found | Genie Media & Studio" }, ...NOINDEX_METADATA };
  return buildBlogMetadata(result.blog);
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const result = await resolve(slugFrom(await params));

  if (result.kind === "redirect") permanentRedirect(result.to);
  if (result.kind === "missing") notFound();

  const { blog } = result;
  const all = await getPublishedBlogsSafe();
  const related = all.filter((b) => b.category === blog.category && b.permalink !== blog.permalink).slice(0, 3);

  return (
    <>
      <JsonLd data={blogPostingGraph(blog)} />
      <BlogArticle blog={blog} related={related} />
    </>
  );
}
