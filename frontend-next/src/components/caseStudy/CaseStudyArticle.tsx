import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowUpRight, Calendar, CheckCircle, ChevronRight, ExternalLink, Phone, Quote } from "lucide-react";

import type { CaseStudy, CaseStudyImage } from "@/types";
import {
  SERVICE_PAGES,
  categoryInfo,
  formatProjectDate,
  paragraphs,
  servicesFor,
  videoEmbedUrl,
} from "@/lib/caseStudies";
import { CONTENT_LINK } from "@/lib/linkStyles";
import CaseStudyCard from "@/components/caseStudy/CaseStudyCard";

export interface RelatedArticle {
  title: string;
  href: string;
  category: string | null;
}

const SECTION = "py-12 sm:py-16 px-4 sm:px-6 lg:px-8";
const H2 = "text-2xl sm:text-3xl font-bold text-gray-900 mb-5";
const BODY = "text-lg text-gray-600 leading-relaxed";

function Section({ title, id, tone = "white", children }: { title: string; id: string; tone?: "white" | "gray"; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className={`${SECTION} ${tone === "gray" ? "bg-gray-50" : "bg-white"}`}>
      <div className="max-w-4xl mx-auto">
        <h2 id={id} className={H2}>{title}</h2>
        {children}
      </div>
    </section>
  );
}

function Prose({ text }: { text: string }) {
  return (
    <div className="space-y-4">
      {paragraphs(text).map((p, i) => (
        <p key={i} className={BODY}>{p}</p>
      ))}
    </div>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm">
          <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span className="text-gray-700 leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="text-sm font-medium bg-slate-100 text-slate-800 px-3.5 py-1.5 rounded-full">{item}</li>
      ))}
    </ul>
  );
}

function Picture({ image, sizes, priority = false, rounded = "rounded-2xl" }: { image: CaseStudyImage; sizes: string; priority?: boolean; rounded?: string }) {
  if (image.width && image.height) {
    return (
      <Image
        src={image.url}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes={sizes}
        priority={priority}
        fetchPriority={priority ? "high" : undefined}
        className={`w-full h-auto ${rounded} shadow-lg bg-gray-100`}
      />
    );
  }
  return (
    <div className={`relative w-full aspect-[16/10] overflow-hidden ${rounded} shadow-lg bg-gray-100`}>
      <Image src={image.url} alt={image.alt} width={1280} height={800} sizes={sizes} priority={priority} fetchPriority={priority ? "high" : undefined} className="absolute inset-0 w-full h-full object-cover object-top" />
    </div>
  );
}

export default function CaseStudyArticle({
  cs,
  related = [],
  articles = [],
  preview = false,
}: {
  cs: CaseStudy;
  related?: CaseStudy[];
  articles?: RelatedArticle[];
  preview?: boolean;
}) {
  const category = categoryInfo(cs.category);
  const date = formatProjectDate(cs.projectDate);
  const services = servicesFor(cs);
  const video = videoEmbedUrl(cs.videoUrl);
  const hasResults = cs.metrics.length > 0;
  const websiteHost = cs.websiteUrl ? cs.websiteUrl.replace(/^https?:\/\//i, "").replace(/\/+$/, "") : null;

  const facts: Array<[string, ReactNode]> = [
    ["Client", cs.clientName],
    ...(cs.industry ? ([["Industry", cs.industry]] as Array<[string, ReactNode]>) : []),
    ...(cs.location ? ([["Location", cs.location]] as Array<[string, ReactNode]>) : []),
    ...(cs.projectType ? ([["Project type", cs.projectType]] as Array<[string, ReactNode]>) : []),
    ...(date ? ([["Completed", date]] as Array<[string, ReactNode]>) : []),
  ];

  return (
    <article data-case-study={preview ? undefined : cs.slug}>
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 lg:px-16 pt-24 mt-12 pb-12 sm:pb-16 text-white">
        <div className="max-w-6xl mx-auto">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-gray-400">
              <li><a href="/" className="hover:text-white focus-visible:text-white underline-offset-4 hover:underline">Home</a></li>
              <li aria-hidden="true"><ChevronRight className="w-4 h-4" /></li>
              <li><a href="/case-studies" className="hover:text-white focus-visible:text-white underline-offset-4 hover:underline">Case Studies</a></li>
              <li aria-hidden="true"><ChevronRight className="w-4 h-4" /></li>
              <li aria-current="page" className="text-gray-200 min-w-0 break-words">{cs.clientName}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="space-y-6 min-w-0">
              <p className="text-sm font-semibold tracking-widest text-orange-400 uppercase">{category.label} Case Study</p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight break-words">{cs.title}</h1>
              {cs.shortDescription && <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">{cs.shortDescription}</p>}

              {cs.services.length > 0 && (
                <ul aria-label="Services delivered" className="flex flex-wrap gap-2">
                  {cs.services.map((s) => (
                    <li key={s} className="text-sm bg-white/10 text-gray-100 px-3 py-1 rounded-full">{s}</li>
                  ))}
                </ul>
              )}

              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  href="/contact"
                  data-track="case_study_contact_click"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black font-semibold px-7 py-3.5 rounded-full transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <Calendar className="w-5 h-5" aria-hidden="true" /> Discuss Your Project
                </a>
                {cs.websiteUrl && (
                  <a
                    href={cs.websiteUrl}
                    target="_blank"
                    rel="noopener"
                    data-track="case_study_external_project_click"
                    className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white font-semibold px-7 py-3.5 rounded-full transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Visit the Website <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                )}
              </div>
            </div>

            {cs.cover && (
              <div className="min-w-0">
                <Picture image={cs.cover} sizes="(min-width: 1024px) 560px, 100vw" priority />
              </div>
            )}
          </div>
        </div>
      </section>

      <section aria-label="Project facts" className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8">
        <dl className="max-w-6xl mx-auto grid grid-cols-2 gap-x-6 gap-y-5 py-8 md:flex md:flex-wrap md:gap-x-12">
          {facts.map(([term, value]) => (
            <div key={term} className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">{term}</dt>
              <dd className="mt-1 text-gray-900 font-medium break-words">{value}</dd>
            </div>
          ))}
          <div className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">Service</dt>
            <dd className="mt-1 font-medium">
              <a href={category.service} className={CONTENT_LINK}>{category.label}</a>
            </dd>
          </div>
        </dl>
      </section>

      {cs.overview && (
        <Section title="Project Overview" id="overview">
          <Prose text={cs.overview} />
        </Section>
      )}

      {cs.challenge && (
        <Section title="The Challenge" id="challenge" tone="gray">
          <Prose text={cs.challenge} />
        </Section>
      )}

      {cs.goals && (
        <Section title="Project Goals" id="goals" tone={cs.challenge ? "white" : "gray"}>
          <Prose text={cs.goals} />
        </Section>
      )}

      {cs.approach.length > 0 && (
        <Section title="Our Approach" id="approach" tone="gray">
          <ol className="space-y-4">
            {cs.approach.map((step, i) => (
              <li key={`${step.title}-${i}`} className="flex items-start gap-4 bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
                <span className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-50 text-orange-600 font-bold flex items-center justify-center" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  {step.title && <h3 className="text-lg font-bold text-gray-900 mb-1">{step.title}</h3>}
                  {step.description && <p className="text-gray-600 leading-relaxed">{step.description}</p>}
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {(cs.services.length > 0 || cs.technologies.length > 0) && (
        <section aria-label="Services and technologies" className={`${SECTION} bg-white`}>
          <div className="max-w-4xl mx-auto grid gap-10 md:grid-cols-2">
            {cs.services.length > 0 && (
              <div>
                <h2 className={H2}>Services Delivered</h2>
                <Chips items={cs.services} />
              </div>
            )}
            {cs.technologies.length > 0 && (
              <div>
                <h2 className={H2}>Technologies &amp; Platforms</h2>
                <Chips items={cs.technologies} />
              </div>
            )}
          </div>
        </section>
      )}

      {cs.deliverables.length > 0 && (
        <Section title="What We Delivered" id="deliverables" tone="gray">
          <Checklist items={cs.deliverables} />
        </Section>
      )}

      {cs.features.length > 0 && (
        <Section title="Features Delivered" id="features" tone={cs.deliverables.length ? "white" : "gray"}>
          <Checklist items={cs.features} />
        </Section>
      )}

      {(cs.gallery.length > 0 || video) && (
        <Section title="Project Gallery" id="gallery">
          {cs.gallery.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2">
              {cs.gallery.map((g) => (
                <figure key={g.url} className="min-w-0">
                  <Picture image={g} sizes="(min-width: 768px) 440px, 100vw" rounded="rounded-xl" />
                  {g.caption && <figcaption className="mt-2 text-sm text-gray-500">{g.caption}</figcaption>}
                </figure>
              ))}
            </div>
          )}
          {video && (
            <div className={`${cs.gallery.length ? "mt-8" : ""} relative w-full aspect-video overflow-hidden rounded-2xl shadow-lg bg-black`}>
              <iframe
                src={video}
                title={`${cs.clientName} project video`}
                loading="lazy"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          )}
        </Section>
      )}

      {(hasResults || cs.outcomes.length > 0) && (
        <Section title={hasResults ? "Results" : "Project Outcomes"} id="outcomes" tone="gray">
          {hasResults && (
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {cs.metrics.map((m) => (
                <div key={m.label} className="bg-white rounded-2xl p-6 shadow-sm">
                  <dt className="text-sm font-semibold text-gray-600">{m.label}</dt>
                  <dd className="mt-2 text-3xl font-bold text-gray-900">{m.value}</dd>
                  <dd className="mt-2 text-xs text-gray-500">Source: {m.source}</dd>
                </div>
              ))}
            </dl>
          )}
          {cs.outcomes.length > 0 && <Checklist items={cs.outcomes} />}
        </Section>
      )}

      {cs.testimonial && cs.testimonialAuthor && (
        <section aria-label="Client testimonial" className={`${SECTION} bg-white`}>
          <figure className="max-w-3xl mx-auto text-center">
            <Quote className="w-10 h-10 text-orange-500 mx-auto mb-6" aria-hidden="true" />
            <blockquote className="text-xl sm:text-2xl text-gray-800 leading-relaxed font-medium">
              <p>&ldquo;{cs.testimonial}&rdquo;</p>
            </blockquote>
            <figcaption className="mt-6 text-gray-600">
              <span className="font-semibold text-gray-900">{cs.testimonialAuthor}</span>
              {cs.testimonialRole && <span>, {cs.testimonialRole}</span>}
            </figcaption>
          </figure>
        </section>
      )}

      {cs.websiteUrl && websiteHost && (
        <Section title="See the Live Project" id="website" tone="gray">
          <p className={BODY}>
            The finished work for {cs.clientName} is live at{" "}
            <a href={cs.websiteUrl} target="_blank" rel="noopener" data-track="case_study_external_project_click" className={CONTENT_LINK}>
              {websiteHost}
            </a>
            .
          </p>
        </Section>
      )}

      <Section title="Related Services" id="related-services">
        <ul className="grid gap-4 sm:grid-cols-2">
          {services.map((path) => (
            <li key={path}>
              <a href={path} className="group block h-full bg-gray-50 hover:bg-gray-100 rounded-2xl p-6 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500">
                <span className="flex items-center justify-between gap-3 text-lg font-bold text-gray-900">
                  {SERVICE_PAGES[path].name}
                  <ArrowUpRight className="w-5 h-5 text-orange-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </span>
                <span className="mt-2 block text-gray-600">{SERVICE_PAGES[path].summary}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-gray-600">
          You can also browse <a href="/projects" className={CONTENT_LINK}>our full project portfolio</a>.
        </p>
      </Section>

      {related.length > 0 && (
        <section aria-labelledby="related-case-studies" className={`${SECTION} bg-gray-50`}>
          <div className="max-w-6xl mx-auto">
            <h2 id="related-case-studies" className={H2}>Related Case Studies</h2>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug}><CaseStudyCard cs={r} headingLevel="h3" /></li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <Section title="Related Articles" id="related-articles">
          <ul className="space-y-3">
            {articles.map((a) => (
              <li key={a.href}>
                <a href={a.href} className="group flex items-start justify-between gap-4 bg-gray-50 hover:bg-gray-100 rounded-xl p-5 transition-colors">
                  <span className="min-w-0">
                    {a.category && <span className="block text-xs font-semibold uppercase tracking-wider text-orange-600 mb-1">{a.category}</span>}
                    <span className="font-semibold text-gray-900">{a.title}</span>
                  </span>
                  <ArrowUpRight className="w-5 h-5 text-orange-500 flex-shrink-0" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5">Have a Similar Project?</h2>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            Tell us what you are planning. Our team in Visakhapatnam will look at your goals and suggest clear next steps.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/contact"
              data-track="case_study_contact_click"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black font-semibold px-8 py-4 rounded-full transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Calendar className="w-5 h-5" aria-hidden="true" /> Talk to Genie Media &amp; Studio
            </a>
            <a
              href="tel:+919032845433"
              data-track="case_study_contact_click"
              className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white font-semibold px-8 py-4 rounded-full transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Phone className="w-5 h-5" aria-hidden="true" /> Call +91 90328 45433
            </a>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            Or <a href="/case-studies" className="underline underline-offset-4 hover:text-white">browse more case studies</a>.
          </p>
        </div>
      </section>
    </article>
  );
}
