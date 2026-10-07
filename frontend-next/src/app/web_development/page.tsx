import type { Metadata } from "next";

import WebDevPg from "@/views/WebDevPg";
import JsonLd from "@/components/seo/JsonLd";
import RelatedCaseStudies from "@/components/caseStudy/RelatedCaseStudies";
import { getPublishedPortfolio } from "@/lib/api/projects";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { metaForRoute } from "@/lib/seo/routeMeta";

export const metadata: Metadata = buildRouteMetadata("/web_development");

export default async function WebDevelopmentRoute() {
  const projects = await getPublishedPortfolio();
  return (
    <>
      <JsonLd data={metaForRoute("/web_development").schema} />
      <WebDevPg initialProjects={projects} />
      <RelatedCaseStudies service="/web_development" />
    </>
  );
}
