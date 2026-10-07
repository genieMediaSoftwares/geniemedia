import { ArrowUpRight } from "lucide-react";

import type { ServicePagePath } from "@/types";
import CaseStudyCard from "@/components/caseStudy/CaseStudyCard";
import { getPublishedCaseStudiesSafe } from "@/lib/api/caseStudies";
import { SERVICE_PAGES, caseStudiesForService } from "@/lib/caseStudies";

export default async function RelatedCaseStudies({ service }: { service: ServicePagePath }) {
  const items = caseStudiesForService(await getPublishedCaseStudiesSafe(), service);
  if (!items.length) return null;
  const name = SERVICE_PAGES[service].name.toLowerCase();

  return (
    <section aria-labelledby="service-case-studies" className="bg-gray-50 py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 id="service-case-studies" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {SERVICE_PAGES[service].name} Case Studies
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            See how we have approached {name} projects for our clients, step by step.
          </p>
        </div>
        <ul className="grid gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((cs) => (
            <li key={cs.slug}>
              <CaseStudyCard cs={cs} headingLevel="h3" />
            </li>
          ))}
        </ul>
        <p className="mt-10 text-center">
          <a href="/case-studies" className="inline-flex items-center gap-2 font-semibold text-gray-900 hover:text-orange-600 transition-colors">
            View all case studies <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </p>
      </div>
    </section>
  );
}
