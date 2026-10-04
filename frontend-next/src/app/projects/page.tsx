import type { Metadata } from "next";

import Projects from "@/views/Projects";
import JsonLd from "@/components/seo/JsonLd";
import { getPublishedPortfolio } from "@/lib/api/projects";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { metaForRoute } from "@/lib/seo/routeMeta";

// Portfolio comes from the backend; refreshed in the background every minute
// and immediately when the admin saves a project (see /api/revalidate).
export const revalidate = 60;

export const metadata: Metadata = buildRouteMetadata("/projects");

export default async function ProjectsRoute() {
  const projects = await getPublishedPortfolio();
  return (
    <>
      <JsonLd data={metaForRoute("/projects").schema} />
      <Projects initialProjects={projects} />
    </>
  );
}
