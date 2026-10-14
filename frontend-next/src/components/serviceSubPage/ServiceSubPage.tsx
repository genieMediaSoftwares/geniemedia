import { ArrowUpRight, Calendar, CheckCircle, ChevronRight, Clock, Mail, MapPin, MessageCircle, Phone, Quote, Star } from "lucide-react";

import DigitalMarketting1Asset from "@/assets/DigitalMarketting.jpg";
import DigitalMarketing2Asset from "@/assets/DigitalMarketing2.jpg";
import DM_servicesAsset from "@/assets/DM_services.webp";
import WebServicesHeroAsset from "@/assets/web_services_hero.jpg";
import WebDevServicesAsset from "@/assets/WebDev_services.jpg";
import AvanttaGemsAsset from "@/assets/AvanttaGems.webp";
import MeeraBasuAsset from "@/assets/meerabasuWebsite.webp";
import StudioSetAsset from "@/assets/podcast/studioSet-min.jpg";
import StudioSet2Asset from "@/assets/podcast/studio-set2-min.jpg";
import StudioCamerasAsset from "@/assets/podcast/podcast-cameras.jpg";
import StudioMicsAsset from "@/assets/podcast/podcast-mic.jpg";
import StudioRecorderAsset from "@/assets/podcast/podcast-output.jpg";
import PodcastStudioBooking from "@/components/StudioBooking";
import ClickTracker from "@/components/serviceSubPage/ClickTracker";
import { StudioEquipment, StudioInfo, StudioPackagesTable } from "@/components/serviceSubPage/StudioBlocks";
import { STUDIO } from "@/content/podcastStudio";
import ServiceFaq from "@/components/ServiceFaq";
import RelatedCaseStudies from "@/components/caseStudy/RelatedCaseStudies";
import type { ServiceSubPage as Page, SubPageCard, SubPageHeroImage } from "@/content/serviceSubPage";
import { type ServiceSection, findSubPage, findSubPageByPath, subPagePath } from "@/content/serviceSubPages";
import { CLIENTS, testimonialsByName } from "@/content/testimonials";
import { CONTENT_LINK } from "@/lib/linkStyles";

type StaticImage = { src: string; width: number; height: number };
const img = (a: StaticImage): StaticImage => ({ src: a.src, width: a.width, height: a.height });

const HERO_IMAGES: Record<SubPageHeroImage, StaticImage> = {
  dm1: img(DigitalMarketting1Asset),
  dm2: img(DigitalMarketing2Asset),
  dmServices: img(DM_servicesAsset),
  web1: img(WebServicesHeroAsset),
  web2: img(WebDevServicesAsset),
  avantta: img(AvanttaGemsAsset),
  meera: img(MeeraBasuAsset),
  studioSet: img(StudioSetAsset),
  studioSet2: img(StudioSet2Asset),
  studioCameras: img(StudioCamerasAsset),
  studioMics: img(StudioMicsAsset),
  studioRecorder: img(StudioRecorderAsset),
};

const MAIN_PAGES: Record<string, { label: string; body: string }> = {
  "/digital-marketing": { label: "Digital Marketing", body: "SEO, Google Ads, content and social media planned as one connected strategy." },
  "/web-development": { label: "Website Development", body: "Fast, SEO-friendly websites and online stores built by our in-house team." },
  "/production-house": { label: "Video Production", body: "Brand films, product videos, photography and short-form content from our production house." },
  "/podcast-studio": { label: "Podcast Studio in Vizag", body: "Record audio and video podcasts in our fully equipped studio." },
  "/case-studies": { label: "Case Studies", body: "How we have approached real client projects, step by step." },
  "/contact": { label: "Contact Our Team", body: "Talk to us about your goals, project and budget." },
  "/reviews": { label: "Client Reviews", body: "Video and written feedback from our clients and studio users." },
  "/projects": { label: "Our Projects", body: "Websites and campaigns we have delivered for clients." },
};

const relatedLink = (section: ServiceSection, ref: string) => {
  if (!ref.startsWith("/")) {
    const page = findSubPage(section, ref);
    return page ? { href: subPagePath(section, page.slug), label: page.name, body: page.description } : null;
  }
  const sub = findSubPageByPath(ref);
  if (sub) return { href: sub.path, label: sub.page.name, body: sub.page.description };
  const main = MAIN_PAGES[ref];
  return main ? { href: ref, label: main.label, body: main.body } : null;
};

const SECTION = "py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8";
const H2 = "text-3xl sm:text-4xl font-bold text-gray-900 mb-4";
const LEAD = "text-lg text-gray-600 leading-relaxed";

function CardGrid({ items, section, cols = "lg:grid-cols-3" }: { items: SubPageCard[]; section: ServiceSection; cols?: string }) {
  return (
    <div className={`grid gap-6 sm:grid-cols-2 ${cols}`}>
      {items.map((item) => {
        const link = item.href ? relatedLink(section, item.href) : null;
        return (
          <div key={item.title} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-600 leading-relaxed">{item.body}</p>
            {item.bullets && (
              <ul className="mt-4 space-y-1.5 text-sm text-gray-700">
                {item.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
            {link && (
              <a href={link.href} className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-800">
                Explore {link.label} <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ServiceSubPage({ section, page }: { section: ServiceSection; page: Page }) {
  const hero = HERO_IMAGES[page.hero.image];
  const related = page.related.map((ref) => relatedLink(section, ref)).filter((r): r is NonNullable<typeof r> => Boolean(r));
  const extras = new Set(page.extras ?? []);
  const h = page.headings ?? {};
  const ctaHref = page.cta.href ?? "/contact";
  const whatsappHref = STUDIO.whatsappHref(`Hi Genie Media, I have a question about ${page.name.toLowerCase()}.`);
  const btnPrimary = "inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black font-semibold px-8 py-3.5 rounded-full transition-all duration-300 shadow-lg";
  const btnSecondary = "inline-flex items-center gap-2 border border-white/30 hover:border-white text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-300";

  return (
    <div>
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 lg:px-16 pt-24 mt-12 pb-12 lg:pb-16">
        <div className="max-w-6xl mx-auto">
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-gray-400">
            <ol className="flex flex-wrap items-center gap-1">
              <li><a href="/" className="hover:text-white">Home</a></li>
              <li aria-hidden="true"><ChevronRight className="w-4 h-4" /></li>
              <li><a href={section.path} className="hover:text-white">{section.label}</a></li>
              <li aria-hidden="true"><ChevronRight className="w-4 h-4" /></li>
              <li aria-current="page" className="text-gray-200">{page.short}</li>
            </ol>
          </nav>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <p className="text-sm font-semibold tracking-widest text-orange-400 uppercase">{page.eyebrow}</p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">{page.h1}</h1>
              {page.intro.map((p) => (
                <p key={p} className="text-lg text-gray-300 leading-relaxed">{p}</p>
              ))}
              <div className="flex flex-wrap gap-4 pt-2">
                <a href={ctaHref} data-track="primary_cta_click" className={btnPrimary}>
                  <Calendar className="w-5 h-5" aria-hidden="true" /> {page.cta.button}
                </a>
                {section.whatsapp ? (
                  <a href={whatsappHref} data-track="whatsapp_click" className={btnSecondary}>
                    <MessageCircle className="w-5 h-5" aria-hidden="true" /> {section.whatsapp}
                  </a>
                ) : (
                  <a href="tel:+919032845433" data-track="phone_click" className={btnSecondary}>
                    <Phone className="w-5 h-5" aria-hidden="true" /> Call +91 90328 45433
                  </a>
                )}
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <img
                src={hero.src}
                alt={page.hero.alt}
                width={hero.width}
                height={hero.height}
                fetchPriority="high"
                decoding="async"
                className="rounded-2xl shadow-2xl w-full max-w-lg object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {extras.has("booking") && (
        <div id="booking" className="scroll-mt-24">
          <PodcastStudioBooking />
        </div>
      )}

      <section className={`bg-white ${SECTION}`}>
        <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className={H2}>{page.whatIs.heading}</h2>
            {page.whatIs.paragraphs.map((p) => (
              <p key={p} className={`${LEAD} mb-4`}>{p}</p>
            ))}
          </div>
          <div>
            <h2 className={H2}>{page.whoNeeds.heading}</h2>
            <ul className="space-y-3">
              {page.whoNeeds.items.map((item) => (
                <li key={item} className="flex gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" aria-hidden="true" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {page.benefits && (
        <section className={`bg-gray-50 ${SECTION}`}>
          <div className="max-w-6xl mx-auto">
            <h2 className={`${H2} text-center`}>{h.benefits ?? `Benefits of ${page.short} for Your Business`}</h2>
            <p className={`${LEAD} text-center max-w-3xl mx-auto mb-10`}>
              {section.benefitsNote}
            </p>
            <CardGrid items={page.benefits} section={section} cols="lg:grid-cols-4" />
          </div>
        </section>
      )}

      <section className={`bg-white ${SECTION}`}>
        <div className="max-w-6xl mx-auto">
          <h2 className={`${H2} text-center`}>{page.included.heading}</h2>
          <p className={`${LEAD} text-center max-w-3xl mx-auto mb-10`}>{page.included.intro}</p>
          <CardGrid items={page.included.items} section={section} />
        </div>
      </section>

      {extras.has("packages") && <StudioPackagesTable />}
      {extras.has("equipment") && <StudioEquipment />}

      <section className={`bg-gray-50 ${SECTION}`}>
        <div className={`max-w-6xl mx-auto grid gap-12 ${page.timeline ? "lg:grid-cols-2" : ""}`}>
          <div>
            <h2 className={H2}>{h.deliverables ?? "Deliverables You Receive"}</h2>
            <ul className="space-y-3">
              {page.deliverables.map((d) => (
                <li key={d} className="flex gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" aria-hidden="true" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
          {page.timeline && <div>
            <h2 className={H2}>Typical {page.short} Timeline</h2>
            <ol className="space-y-4">
              {page.timeline.map((t) => (
                <li key={t.phase} className="flex gap-3">
                  <Clock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-gray-900">{t.phase}</p>
                    <p className="text-gray-600">{t.period}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-gray-500">
              These are typical ranges, not guarantees. Your written plan confirms the timeline for your scope.
            </p>
          </div>}
        </div>
      </section>

      <section className={`bg-white ${SECTION}`}>
        <div className="max-w-6xl mx-auto">
          <h2 className={`${H2} text-center mb-10`}>{h.process ?? `Our ${page.short} Process`}</h2>
          <ol className={`grid gap-6 sm:grid-cols-2 ${page.process.length === 5 ? "lg:grid-cols-5" : "lg:grid-cols-3"}`}>
            {page.process.map((step, i) => (
              <li key={step.title} className="rounded-2xl border border-gray-200 p-6">
                <span className="text-3xl font-bold text-orange-500">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.body}</p>
                {step.bullets && (
                  <ul className="mt-3 space-y-1 text-sm text-gray-700 list-disc pl-5">
                    {step.bullets.map((b) => <li key={b}>{b}</li>)}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {page.industries && (
        <section className={`bg-gray-50 ${SECTION}`}>
          <div className="max-w-6xl mx-auto">
            <h2 className={`${H2} text-center`}>{h.industries ?? "Industries We Serve"}</h2>
            <p className={`${LEAD} text-center max-w-3xl mx-auto mb-10`}>
              {section.industriesIntro ?? "We work with businesses across India, from our home market in Visakhapatnam and Andhra Pradesh to clients we support fully remotely."}
            </p>
            <CardGrid items={page.industries} section={section} cols={page.industries.length > 5 ? "lg:grid-cols-4" : "lg:grid-cols-5"} />
          </div>
        </section>
      )}

      {(page.measurement || page.mistakes) && (
        <section className={`bg-white ${SECTION}`}>
          <div className={`max-w-6xl mx-auto grid gap-12 ${page.measurement && page.mistakes ? "lg:grid-cols-2" : ""}`}>
            {page.measurement && (
              <div>
                <h2 className={H2}>{page.measurement.heading}</h2>
                <p className={`${LEAD} mb-6`}>{page.measurement.intro}</p>
                <ul className="space-y-3">
                  {page.measurement.items.map((m) => (
                    <li key={m} className="flex gap-3 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" aria-hidden="true" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {page.mistakes && (
              <div>
                <h2 className={H2}>{h.mistakes ?? `Common ${page.short} Mistakes to Avoid`}</h2>
                <div className="space-y-5">
                  {page.mistakes.map((m) => (
                    <div key={m.title}>
                      <h3 className="text-lg font-semibold text-gray-900">{m.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{m.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {page.sections?.map((sec, idx) => (
        <section key={sec.heading} className={`${idx % 2 ? "bg-white" : "bg-gray-50"} ${SECTION}`}>
          <div className={`${sec.items ? "max-w-6xl" : "max-w-4xl"} mx-auto`}>
            <h2 className={`${H2} text-center`}>{sec.heading}</h2>
            {sec.intro && <p className={`${LEAD} text-center max-w-3xl mx-auto mb-8`}>{sec.intro}</p>}
            {sec.paragraphs?.map((para) => (
              <p key={para} className={`${LEAD} mb-4`}>{para}</p>
            ))}
            {sec.bullets && (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {sec.bullets.map((b) => (
                  <li key={b} className="flex gap-3 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
            {sec.items && <div className="mt-8"><CardGrid items={sec.items} section={section} /></div>}
          </div>
        </section>
      ))}

      <RelatedCaseStudies service={section.path} />

      <section className={`bg-gray-50 ${SECTION}`}>
        <div className="max-w-6xl mx-auto">
          <h2 className={`${H2} text-center`}>Businesses We Have Worked With</h2>
          <p className={`${LEAD} text-center max-w-3xl mx-auto mb-8`}>
            From healthcare and education to hospitality and personal brands, here are some of the clients who have trusted Genie Media &amp; Studio.
          </p>
          <ul className="flex flex-wrap justify-center gap-3 mb-8">
            {CLIENTS.map((c) => (
              <li key={c.name} className="rounded-full border border-gray-200 bg-white px-5 py-2.5 font-semibold text-gray-900 shadow-sm">
                {c.url ? (
                  <a href={c.url} target="_blank" rel="noopener" className={CONTENT_LINK}>{c.name}</a>
                ) : (
                  c.name
                )}
              </li>
            ))}
          </ul>
          <p className="text-center text-gray-600">
            See more of our work in <a href="/projects" className={`${CONTENT_LINK} font-semibold text-gray-900`}>our projects portfolio</a>.
          </p>
        </div>
      </section>

      <section className={`bg-white ${SECTION}`}>
        <div className="max-w-6xl mx-auto">
          <h2 className={`${H2} text-center mb-10`}>What Our Clients Say</h2>
          <ul className="grid gap-6 md:grid-cols-3">
            {testimonialsByName(section.testimonialNames).map((t) => (
              <li key={t.name} className="flex flex-col rounded-2xl border border-gray-200 p-6 shadow-sm">
                <Quote className="w-6 h-6 text-orange-500 mb-3" aria-hidden="true" />
                <div className="flex gap-1 mb-3" role="img" aria-label="Rated 5 out of 5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="w-4 h-4 text-orange-500" fill="currentColor" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="flex-1 italic text-gray-700 leading-relaxed">&ldquo;{t.quote}&rdquo;</blockquote>
                <p className="mt-4 font-semibold text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-500">{t.role}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-center text-gray-600">
            Watch video testimonials and read more feedback on our <a href="/reviews" className={`${CONTENT_LINK} font-semibold text-gray-900`}>client reviews page</a>.
          </p>
        </div>
      </section>

      <section className={`bg-gray-50 ${SECTION}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={H2}>{h.pricing ?? `${page.short} Pricing`}</h2>
          <p className={`${LEAD} mb-4`}>{page.pricing}</p>
          <p className={LEAD}>
            {section.pricingNote ?? "After an initial consultation, we send a written scope and quote in Indian rupees, so you know exactly what is included before any work begins."}
          </p>
        </div>
      </section>

      {extras.has("studioInfo") && <StudioInfo />}

      <ServiceFaq
        title={h.faq ?? `${page.short} FAQs`}
        intro={`Answers to the questions businesses ask us most about ${page.short === page.name ? page.name.toLowerCase() : page.short}.`}
        faqs={page.faqs}
      />

      <section className={`bg-white ${SECTION}`}>
        <div className="max-w-6xl mx-auto">
          <h2 className={`${H2} text-center mb-10`}>Related Services</h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <li key={r.href}>
                <a href={r.href} className="group block h-full rounded-2xl border border-gray-200 p-6 transition-colors hover:border-orange-400">
                  <span className="flex items-center justify-between text-lg font-semibold text-gray-900">
                    {r.label} <ArrowUpRight className="w-5 h-5 text-orange-500 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                  <span className="mt-2 block text-gray-600 leading-relaxed">{r.body}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-center text-gray-600">
            See every service on our <a href={section.path} className={`${CONTENT_LINK} font-semibold text-gray-900`}>{section.hubLinkText}</a>.
          </p>
        </div>
      </section>

      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{page.cta.heading}</h2>
          <p className="text-lg text-gray-300 leading-relaxed mb-8">{page.cta.body}</p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <a href={ctaHref} data-track="primary_cta_click" className={btnPrimary}>
              <Calendar className="w-5 h-5" aria-hidden="true" /> {page.cta.button}
            </a>
            {section.whatsapp ? (
              <>
                <a href={whatsappHref} data-track="whatsapp_click" className={btnSecondary}>
                  <MessageCircle className="w-5 h-5" aria-hidden="true" /> {section.whatsapp}
                </a>
                <a href={STUDIO.phoneHref} data-track="phone_click" className={btnSecondary}>
                  <Phone className="w-5 h-5" aria-hidden="true" /> Call {STUDIO.phone}
                </a>
              </>
            ) : (
              <a href="mailto:admin@geniemedia.in" data-track="email_click" className={btnSecondary}>
                <Mail className="w-5 h-5" aria-hidden="true" /> admin@geniemedia.in
              </a>
            )}
          </div>
          <p className="inline-flex items-center gap-2 text-sm text-gray-400">
            <MapPin className="w-4 h-4" aria-hidden="true" /> {section.ctaLocation ?? "Based in Yendada, Visakhapatnam. Working with businesses across India."}
          </p>
        </div>
      </section>
      <ClickTracker page={subPagePath(section, page.slug)} />
    </div>
  );
}
