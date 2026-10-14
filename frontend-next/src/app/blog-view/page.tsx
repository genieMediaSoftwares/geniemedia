import type { Metadata } from "next";

import LiveBlogArticle from "@/components/blog/LiveBlogArticle";

export const metadata: Metadata = { title: { absolute: "Blog | Genie Media & Studio" }, description: null, robots: { index: false, follow: true } };

export default function BlogViewRoute() {
  return <LiveBlogArticle />;
}
