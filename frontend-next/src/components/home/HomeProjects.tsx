"use client";

import type { PortfolioItem } from "@/types";
import { portfolioOrFallback } from "@/lib/portfolio";
import ProjectCard, { PROJECT_GRID } from "@/components/ProjectCard";
import { useLatestProjects } from "@/lib/liveData";

const HOME_PROJECTS_LIMIT = 6;

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
