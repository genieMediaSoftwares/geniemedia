import Image from "next/image";
import { ArrowRight } from "lucide-react";

import type { CaseStudy } from "@/types";
import { caseStudyPath, categoryInfo } from "@/lib/caseStudies";

export default function CaseStudyCard({ cs, headingLevel = "h2" }: { cs: CaseStudy; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const href = caseStudyPath(cs.slug);
  return (
    <div className="group relative h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        {cs.cover && (
          <Image
            src={cs.cover.url}
            alt={cs.cover.alt}
            width={cs.cover.width ?? 1280}
            height={cs.cover.width && cs.cover.height ? Math.round((cs.cover.width * 10) / 16) : 800}
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-col flex-grow p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
          {categoryInfo(cs.category).label}
          {cs.industry && <span className="text-gray-500 normal-case tracking-normal font-medium"> · {cs.industry}</span>}
        </p>
        <Heading className="mt-2 text-xl font-bold text-gray-900 leading-snug">
          <a href={href} className="focus-visible:outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-orange-500">
            {cs.clientName}
          </a>
        </Heading>
        {cs.shortDescription && <p className="mt-3 text-gray-600 leading-relaxed line-clamp-3">{cs.shortDescription}</p>}
        <span className="mt-auto pt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors" aria-hidden="true">
          View Case Study <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  );
}
