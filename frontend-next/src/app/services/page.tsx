import type { Metadata } from "next";

import TabbedServices from "@/components/AllServices";
import ServiceDirectory from "@/components/seo/ServiceDirectory";
import JsonLd from "@/components/seo/JsonLd";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { metaForRoute } from "@/lib/seo/routeMeta";

export const metadata: Metadata = buildRouteMetadata("/services");

export default function ServicesRoute() {
  return (
    <>
      <JsonLd data={metaForRoute("/services").schema} />
      <TabbedServices headingLevel="h1" />
      <ServiceDirectory />
    </>
  );
}
