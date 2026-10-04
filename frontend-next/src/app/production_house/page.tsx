import type { Metadata } from "next";

import ProductionHouse from "@/views/ProductionHouse";
import JsonLd from "@/components/seo/JsonLd";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { metaForRoute } from "@/lib/seo/routeMeta";

export const metadata: Metadata = buildRouteMetadata("/production_house");

export default function ProductionHouseRoute() {
  return (
    <>
      <JsonLd data={metaForRoute("/production_house").schema} />
      <ProductionHouse />
    </>
  );
}
