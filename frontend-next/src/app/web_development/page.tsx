import type { Metadata } from "next";

import WebDevPg from "@/views/WebDevPg";
import JsonLd from "@/components/seo/JsonLd";
import ServiceSeoSections from "@/components/seo/ServiceSeoSections";
import { getPublishedServiceSeo } from "@/lib/api/serviceSeo";
import RelatedCaseStudies from "@/components/caseStudy/RelatedCaseStudies";
import { getPublishedPortfolio } from "@/lib/api/projects";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { metaForRoute } from "@/lib/seo/routeMeta";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata("/web_development", await getPublishedServiceSeo("/web_development"));
}

export default async function WebDevelopmentRoute() {
  const seo = await getPublishedServiceSeo("/web_development");
  const projects = await getPublishedPortfolio();
  return (
    <>
      <JsonLd data={metaForRoute("/web_development", seo).schema} />
      <WebDevPg initialProjects={projects} h1={seo?.preferredH1 || undefined} />
      {seo && <ServiceSeoSections sections={seo.sections} links={seo.internalLinks} />}
      <RelatedCaseStudies service="/web_development" />
    </>
  );
}
