"use client";

import type { PortfolioItem } from "@/types";
import { portfolioOrFallback } from "@/lib/portfolio";
import ProjectCard, { PROJECT_GRID } from "@/components/ProjectCard";
import { useLatestProjects } from "@/lib/liveData";

// The home page shows a preview of the portfolio — "View More Projects"
// links to /projects where the full list is rendered.
const HOME_PROJECTS_LIMIT = 6;

/**
 * The home page's project grid. The only client island in the projects
 * section: it shows the build-time list at once, then swaps in the latest
 * published projects from the API so new ones appear without a rebuild.
 */
export default function HomeProjects({ initialProjects, fallback }: { initialProjects: PortfolioItem[] | null; fallback: PortfolioItem[] }) {
  const liveProjects = useLatestProjects(initialProjects);
  const projects = portfolioOrFallback(liveProjects, fallback).slice(0, HOME_PROJECTS_LIMIT);

  return (
    <div className={PROJECT_GRID}>
      {projects.map((project, index) => (
        <ProjectCard key={project.id ?? index} project={project} />
      ))}
    </div>
  );
}
