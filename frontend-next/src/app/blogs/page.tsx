import type { Metadata } from "next";

import Blogs from "@/views/Blogs";
import JsonLd from "@/components/seo/JsonLd";
import { getPublishedBlogsSafe, toBlogCard } from "@/lib/api/blogs";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { metaForRoute } from "@/lib/seo/routeMeta";
import { blogListGraph } from "@/lib/seo/schema";

// Posts are fetched at build time; rebuild and redeploy after publishing.

// No meta keywords: search engines ignore the tag, and merging every post's
// keywords into one list produced exactly the keyword dump the site avoids.
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
