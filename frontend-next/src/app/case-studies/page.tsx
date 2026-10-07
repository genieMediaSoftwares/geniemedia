import type { Metadata } from "next";
import { ArrowUpRight, Calendar } from "lucide-react";

import JsonLd from "@/components/seo/JsonLd";
import CaseStudyFilter from "@/components/caseStudy/CaseStudyFilter";
import { getPublishedCaseStudiesSafe } from "@/lib/api/caseStudies";
import { SERVICE_PAGES } from "@/lib/caseStudies";
import { CONTENT_LINK } from "@/lib/linkStyles";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { metaForRoute } from "@/lib/seo/routeMeta";
import { caseStudyListNode } from "@/lib/seo/schema";
import type { ServicePagePath } from "@/types";

export async function generateMetadata(): Promise<Metadata> {
  const base = buildRouteMetadata("/case-studies");
  const items = await getPublishedCaseStudiesSafe();
  return items.length ? base : { ...base, robots: { index: false, follow: true } };
}

export default async function CaseStudiesRoute() {
  const items = await getPublishedCaseStudiesSafe();
  const schema = metaForRoute("/case-studies").schema;
  const data = schema && items.length ? { ...schema, "@graph": [...schema["@graph"], caseStudyListNode(items)] } : schema;

  return (
    <>
      <JsonLd data={data} />

      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 lg:px-16 pt-24 mt-12 pb-14 sm:pb-16">
        <div className="max-w-4xl mx-auto text-center text-white space-y-6">
          <p className="text-sm font-semibold tracking-widest text-orange-400 uppercase">Our Work, in Detail</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">Case Studies &amp; Client Work</h1>
          <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
            Our case studies each follow one real project from start to finish: who the client is, what they needed, how our team in Visakhapatnam
            approached the work and what we delivered. They cover our{" "}
            <a href="/digital_marketing" className={CONTENT_LINK}>digital marketing</a>,{" "}
            <a href="/web_development" className={CONTENT_LINK}>website development</a>,{" "}
            <a href="/production_house" className={CONTENT_LINK}>video production</a> and{" "}
            <a href="/podcast_studio" className={CONTENT_LINK}>podcast production</a> work.
          </p>
        </div>
      </section>

      <section aria-label="Case studies" className="bg-gray-50 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {items.length > 0 ? (
            <CaseStudyFilter items={items} />
          ) : (
            <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl p-8 sm:p-10 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Detailed Case Studies Are on Their Way</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                We are writing up our recent projects with the real story behind each one. Until they are ready, you can see the websites and
                online stores we have built in our project portfolio.
              </p>
              <a href="/projects" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-full transition-colors">
                View Our Projects <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">How We Write Our Case Studies</h2>
          <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
            <p>
              Every case study is about a project our team actually delivered. We describe the client&apos;s situation, the work we did and
              the platforms we used. When we share a number, such as a traffic or lead figure, we also say where it was measured.
            </p>
            <p>
              If a result has not been measured yet, we describe what was delivered instead. Testimonials appear only when a client has given
              one in their own words. For a wider view of our work, browse the <a href="/projects" className={CONTENT_LINK}>project portfolio</a> or
              read <a href="/reviews" className={CONTENT_LINK}>client reviews</a>.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">Our Services</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(SERVICE_PAGES) as ServicePagePath[]).map((path) => (
              <li key={path}>
                <a href={path} className="group block h-full bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500">
                  <span className="flex items-center justify-between gap-3 text-lg font-bold text-gray-900">
                    {SERVICE_PAGES[path].name}
                    <ArrowUpRight className="w-5 h-5 text-orange-500" aria-hidden="true" />
                  </span>
                  <span className="mt-2 block text-gray-600">{SERVICE_PAGES[path].summary}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5">Start a Project With Us</h2>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            Planning a website, a campaign, a brand video or a podcast? Tell us about it and we will suggest clear next steps.
          </p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black font-semibold px-8 py-4 rounded-full transition-colors duration-300">
            <Calendar className="w-5 h-5" aria-hidden="true" /> Get a Consultation
          </a>
        </div>
      </section>
    </>
  );
}
