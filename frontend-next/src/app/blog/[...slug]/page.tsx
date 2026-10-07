import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";

import BlogArticle from "@/components/blog/BlogArticle";
import JsonLd from "@/components/seo/JsonLd";
import { getPublishedBlogsSafe, lookupBlog } from "@/lib/api/blogs";
import { buildBlogMetadata, NOINDEX_METADATA } from "@/lib/seo/metadata";
import { blogPostingGraph } from "@/lib/seo/schema";

export const dynamicParams = false;

type Params = { slug: string[] };

const slugFrom = (params: Params): string => params.slug.map((s) => decodeURIComponent(s)).join("/");

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
