import type { PortfolioItem } from "@/types";
import { serviceForCategory } from "@/lib/portfolio";
import { CONTENT_LINK } from "@/lib/linkStyles";

/**
 * One portfolio project, shared by the home page ("Your Digital Presence,
 * Perfected") and /projects ("Our Portfolio").
 *
 * Phones: a compact two-per-row tile grid (like an Instagram profile).
 * md and up: unchanged — two large cards per row.
 */
export const PROJECT_GRID = "grid grid-cols-2 gap-x-3 gap-y-6 md:gap-12";

export default function ProjectCard({ project }: { project: PortfolioItem }) {
  const service = serviceForCategory(project.category);
  return (
    <div className="text-center group flex flex-col">
      <div className="rounded-xl md:rounded-3xl p-0 md:p-0.5 mb-2 md:mb-8 transition-transform duration-300 group-hover:scale-105">
        <div className="overflow-hidden rounded-xl md:rounded-2xl aspect-[4/3] md:aspect-[11/5]">
          <img
            src={project.image}
            alt={`${project.name} website`}
            width="1280"
            height="582"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      </div>

      <h3 className={`text-sm md:text-xl font-semibold leading-snug break-words ${service ? "mb-1 md:mb-2" : "mb-2 md:mb-6"}`}>
        {project.name}
      </h3>

      {/* The service behind the project: plain text that still links to its page. */}
      {service && (
        <a href={service.href} className={`inline-block mb-2 md:mb-5 text-xs md:text-sm ${CONTENT_LINK}`}>
          {service.label}
        </a>
      )}

      {/* A real link so crawlers see which live sites the portfolio points to;
          it opens in a new tab. mt-auto keeps the buttons in a row on phones. */}
      {project.url && (
        <div className="mt-auto md:mt-0">
          <a
            href={project.url}
            target="_blank"
            rel="noopener"
            className="inline-block px-4 py-2 text-xs md:px-8 md:py-3 md:text-base rounded-full font-semibold border-2 border-transparent text-white bg-gray-900 hover:bg-orange-400 hover:text-black transition-all duration-300"
          >
            VIEW PROJECT
          </a>
        </div>
      )}
    </div>
  );
}
