import type { PortfolioItem } from "@/types";
import { serviceForCategory } from "@/lib/portfolio";
import { CONTENT_LINK } from "@/lib/linkStyles";

// Shared layout for every portfolio grid (home, /projects, /web-development) so they stay identical.
export const PROJECT_SECTION = "bg-white py-12 md:py-16";
export const PROJECT_CONTAINER = "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8";
export const PROJECT_HEADING = "text-center text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-8 md:mb-10";
export const PROJECT_GRID = "grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8 lg:gap-y-12";

export default function ProjectCard({ project, caseStudyHref }: { project: PortfolioItem; caseStudyHref?: string }) {
  const service = serviceForCategory(project.category);
  const displayName = project.name.replace(/\s*[-–—|]?\s*by\s+Snapbrio\b/gi, "").trim();
  return (
    <article className="group flex h-full min-w-0 flex-col text-center">
      <div className="aspect-video overflow-hidden rounded-lg sm:rounded-xl bg-gray-100 shadow-sm ring-1 ring-gray-200">
        <img
          src={project.image}
          alt={`${displayName} website`}
          width="1280"
          height="720"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col items-center gap-1 sm:gap-1.5 pt-3 sm:pt-4 text-gray-600">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold leading-snug text-gray-900 break-words">
          {displayName}
        </h3>

        {service && (
          <a href={service.href} className={`text-xs sm:text-sm ${CONTENT_LINK}`}>
            {service.label}
          </a>
        )}

        {caseStudyHref && (
          <a href={caseStudyHref} className={`text-xs sm:text-sm font-semibold ${CONTENT_LINK}`}>
            Read the case study<span className="sr-only"> for {displayName}</span>
          </a>
        )}

        {project.url && (
          <div className="mt-auto pt-2 sm:pt-3">
            <a
              href={project.url}
              target="_blank"
              rel="noopener"
              className="inline-block rounded-full border-2 border-transparent bg-gray-900 px-4 py-1.5 text-xs sm:px-5 sm:py-2 sm:text-sm font-semibold tracking-wide text-white transition-colors duration-300 hover:bg-orange-400 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              VIEW PROJECT
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
