import type { Metadata } from "next";

import Projects from "@/views/Projects";
import JsonLd from "@/components/seo/JsonLd";
import { getPublishedPortfolio } from "@/lib/api/projects";
import { getPublishedCaseStudiesSafe } from "@/lib/api/caseStudies";
import { caseStudyPath } from "@/lib/caseStudies";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { metaForRoute } from "@/lib/seo/routeMeta";

export const metadata: Metadata = buildRouteMetadata("/projects");

export default async function ProjectsRoute() {
  const [projects, caseStudies] = await Promise.all([getPublishedPortfolio(), getPublishedCaseStudiesSafe()]);
  const caseStudyLinks: Record<number, string> = Object.fromEntries(
    caseStudies.filter((cs) => cs.projectId !== null).map((cs) => [cs.projectId as number, caseStudyPath(cs.slug)])
  );
  return (
    <>
      <JsonLd data={metaForRoute("/projects").schema} />
      <Projects initialProjects={projects} caseStudyLinks={caseStudyLinks} />
    </>
  );
}
