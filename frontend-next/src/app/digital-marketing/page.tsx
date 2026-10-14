import type { Metadata } from "next";

import DigitalMarketting from "@/views/DigitalMarketting";
import JsonLd from "@/components/seo/JsonLd";
import ServiceSeoSections from "@/components/seo/ServiceSeoSections";
import { getPublishedServiceSeo } from "@/lib/api/serviceSeo";
import RelatedCaseStudies from "@/components/caseStudy/RelatedCaseStudies";
import ClickTracker from "@/components/serviceSubPage/ClickTracker";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { metaForRoute } from "@/lib/seo/routeMeta";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata("/digital-marketing", await getPublishedServiceSeo("/digital-marketing"));
}

export default async function DigitalMarketingRoute() {
  const seo = await getPublishedServiceSeo("/digital-marketing");
  return (
    <>
      <JsonLd data={metaForRoute("/digital-marketing", seo).schema} />
      <DigitalMarketting h1={seo?.preferredH1 || undefined} />
      {seo && <ServiceSeoSections sections={seo.sections} links={seo.internalLinks} />}
      <RelatedCaseStudies service="/digital-marketing" />
      <ClickTracker page="/digital-marketing" />
    </>
  );
}
