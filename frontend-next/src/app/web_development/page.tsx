import type { Metadata } from "next";

import WebDevPg from "@/views/WebDevPg";
import JsonLd from "@/components/seo/JsonLd";
import { getPublishedPortfolio } from "@/lib/api/projects";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { metaForRoute } from "@/lib/seo/routeMeta";

// Portfolio comes from the backend; refreshed in the background every minute
// and immediately when the admin saves a project (see /api/revalidate).
export const revalidate = 60;

export const metadata: Metadata = buildRouteMetadata("/web_development");

export default async function WebDevelopmentRoute() {
  const projects = await getPublishedPortfolio();
  return (
    <>
      <JsonLd data={metaForRoute("/web_development").schema} />
      <WebDevPg initialProjects={projects} />
    </>
  );
}
