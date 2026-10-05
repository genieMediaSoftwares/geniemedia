import type { Metadata } from "next";

import Blogs from "@/views/Blogs";
import JsonLd from "@/components/seo/JsonLd";
import { getPublishedBlogsSafe, toBlogCard } from "@/lib/api/blogs";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { metaForRoute } from "@/lib/seo/routeMeta";
import { blogListGraph } from "@/lib/seo/schema";

// Posts are fetched at build time; rebuild and redeploy after publishing.

export async function generateMetadata(): Promise<Metadata> {
  const base = buildRouteMetadata("/blogs");
  const blogs = await getPublishedBlogsSafe();
  const keywords = [...new Set(blogs.flatMap((b) => String(b.keywords || "").split(",").map((k) => k.trim())).filter(Boolean))];
  return keywords.length ? { ...base, keywords } : base;
}

export default async function BlogsRoute() {
  const blogs = await getPublishedBlogsSafe();
  const meta = metaForRoute("/blogs");
  return (
    <>
      <JsonLd data={blogListGraph(blogs, meta)} />
      <Blogs blogs={blogs.map(toBlogCard)} />
    </>
  );
}
