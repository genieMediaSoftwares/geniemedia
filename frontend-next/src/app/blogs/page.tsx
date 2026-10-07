import type { Metadata } from "next";

import Blogs from "@/views/Blogs";
import JsonLd from "@/components/seo/JsonLd";
import { getPublishedBlogsSafe, toBlogCard } from "@/lib/api/blogs";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { metaForRoute } from "@/lib/seo/routeMeta";
import { blogListGraph } from "@/lib/seo/schema";

export const metadata: Metadata = buildRouteMetadata("/blogs");

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
