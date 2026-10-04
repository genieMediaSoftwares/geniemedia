import type { Metadata } from "next";

import DigitalMarketting from "@/views/DigitalMarketting";
import JsonLd from "@/components/seo/JsonLd";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { metaForRoute } from "@/lib/seo/routeMeta";

export const metadata: Metadata = buildRouteMetadata("/digital_marketing");

export default function DigitalMarketingRoute() {
  return (
    <>
      <JsonLd data={metaForRoute("/digital_marketing").schema} />
      <DigitalMarketting />
    </>
  );
}
