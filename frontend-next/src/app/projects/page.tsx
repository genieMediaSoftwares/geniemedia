import type { Metadata } from "next";

import Projects from "@/views/Projects";
import JsonLd from "@/components/seo/JsonLd";
import { getPublishedPortfolio } from "@/lib/api/projects";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { metaForRoute } from "@/lib/seo/routeMeta";

// Portfolio is fetched from the backend at build time (static export).
// Run `npm run build` and redeploy to publish project changes.

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
