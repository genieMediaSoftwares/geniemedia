import type { Metadata } from "next";

import ProductionHouse from "@/views/ProductionHouse";
import JsonLd from "@/components/seo/JsonLd";
import ServiceSeoSections from "@/components/seo/ServiceSeoSections";
import { getPublishedServiceSeo } from "@/lib/api/serviceSeo";
import RelatedCaseStudies from "@/components/caseStudy/RelatedCaseStudies";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { metaForRoute } from "@/lib/seo/routeMeta";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata("/production_house", await getPublishedServiceSeo("/production_house"));
}

export default async function ProductionHouseRoute() {
  const seo = await getPublishedServiceSeo("/production_house");
  return (
    <>
      <JsonLd data={metaForRoute("/production_house", seo).schema} />
      <ProductionHouse h1={seo?.preferredH1 || undefined} />
      {seo && <ServiceSeoSections sections={seo.sections} links={seo.internalLinks} />}
      <RelatedCaseStudies service="/production_house" />
    </>
  );
}
