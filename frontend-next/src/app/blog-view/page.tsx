import type { Metadata } from "next";

import LiveBlogArticle from "@/components/blog/LiveBlogArticle";
import { NOINDEX_METADATA } from "@/lib/seo/metadata";

export const metadata: Metadata = { title: { absolute: "Blog | Genie Media & Studio" }, ...NOINDEX_METADATA };

export default function BlogViewRoute() {
  return <LiveBlogArticle />;
}
