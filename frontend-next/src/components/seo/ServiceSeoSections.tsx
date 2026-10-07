import { ArrowUpRight } from "lucide-react";

import type { ServiceSeoLink, ServiceSeoSection } from "@/types";
import { paragraphs } from "@/lib/caseStudies";

export default function ServiceSeoSections({ sections, links }: { sections: ServiceSeoSection[]; links: ServiceSeoLink[] }) {
  if (!sections.length && !links.length) return null;

  return (
    <section className="bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {sections.map((s) => (
          <div key={s.heading}>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">{s.heading}</h2>
            <div className="space-y-4">
              {paragraphs(s.body).map((p, i) => (
                <p key={i} className="text-lg text-gray-600 leading-relaxed">{p}</p>
              ))}
            </div>
          </div>
        ))}

        {links.length > 0 && (
          <nav aria-label="Related pages">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">Related Pages</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="group flex items-center justify-between gap-3 bg-gray-50 hover:bg-gray-100 rounded-xl p-4 font-semibold text-gray-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500">
                    {l.label}
                    <ArrowUpRight className="w-5 h-5 text-orange-500 flex-shrink-0" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </section>
  );
}
