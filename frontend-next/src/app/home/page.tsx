import type { Metadata } from "next";

import HomeRoute from "@/app/page";
import { buildRouteMetadata } from "@/lib/seo/metadata";

// /home shows the homepage (locally and for old links) but must never be indexed as a duplicate:
// on the live site public/.htaccess 301s /home to / before this page is served, it is not in the
// sitemap, its canonical is "/", and as a last guard it is noindex (links are still followed).
export const metadata: Metadata = {
  ...buildRouteMetadata("/"),
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

export default HomeRoute;
