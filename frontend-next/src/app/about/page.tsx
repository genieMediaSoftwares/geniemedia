import type { Metadata } from "next";

import AboutPage from "@/views/AboutPg";
import JsonLd from "@/components/seo/JsonLd";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { metaForRoute } from "@/lib/seo/routeMeta";

export const metadata: Metadata = buildRouteMetadata("/about");

export default function AboutRoute() {
  return (
    <>
      <JsonLd data={metaForRoute("/about").schema} />
      <AboutPage />
    </>
  );
}
