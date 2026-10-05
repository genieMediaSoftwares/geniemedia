import type { Metadata } from "next";

import LiveBlogArticle from "@/components/blog/LiveBlogArticle";
import { NOINDEX_METADATA } from "@/lib/seo/metadata";

// Fallback for posts published after the last build (served by .htaccess at
// the post's own /blog/... URL). Not indexed: the next `npm run build`
// gives the post a proper pre-rendered page.
export const metadata: Metadata = { title: { absolute: "Blog | Genie Media & Studio" }, ...NOINDEX_METADATA };

export default function BlogViewRoute() {
  return <LiveBlogArticle />;
}
