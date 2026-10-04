import type { Metadata } from "next";

import Reviews from "@/views/Reviews";
import JsonLd from "@/components/seo/JsonLd";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { metaForRoute } from "@/lib/seo/routeMeta";

export const metadata: Metadata = buildRouteMetadata("/reviews");

export default function ReviewsRoute() {
  return (
    <>
      <JsonLd data={metaForRoute("/reviews").schema} />
      <Reviews />
    </>
  );
}
