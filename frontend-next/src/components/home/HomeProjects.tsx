"use client";

import type { PortfolioItem } from "@/types";
import { portfolioOrFallback, serviceForCategory } from "@/lib/portfolio";
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12">
      {projects.map((project, index) => {
        const service = serviceForCategory(project.category);
        return (
          <div key={project.id ?? index} className="text-center group">
            <div className="rounded-3xl p-0 md:p-0.5 mb-8 transition-transform duration-300 group-hover:scale-105">
              <div className="overflow-hidden rounded-2xl aspect-[11/5]">
                <img
                  src={project.image}
                  alt={`${project.name} website`}
                  width="1280"
                  height="582"
                  sizes="(min-width: 768px) 50vw, 100vw"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>

            <h3 className={`text-xl font-semibold ${service ? "mb-2" : "mb-6"}`}>{project.name}</h3>

            {/* The service behind the project, linked to its page. */}
            {service && (
              <a href={service.href} className="inline-block mb-5 text-sm font-medium text-orange-700 underline underline-offset-2 hover:text-orange-900">
                {service.label}
              </a>
            )}

            <div>
              {/* A real link so crawlers see which live sites the portfolio
                  points to; it opens in a new tab as the button used to. */}
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener"
                  className="inline-block px-8 py-3 rounded-full font-semibold border-2 border-orange-400 text-white bg-gray-900 hover:bg-orange-400 hover:text-black transition-all duration-300"
                >
                  VIEW PROJECT
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
