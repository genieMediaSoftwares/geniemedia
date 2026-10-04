import type { ReactNode } from "react";

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

/**
 * Shared layout for the privacy policy and terms pages: the site's dark hero,
 * a linked table of contents, then the sections. Fully server-rendered.
 */
export default function LegalPage({
  title,
  intro,
  updated,
  updatedIso,
  sections,
}: {
  title: string;
  intro: ReactNode;
  updated: string;
  updatedIso: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 lg:px-16 pt-28 mt-8 sm:pt-24 pb-12">
        <div className="max-w-4xl mx-auto text-center text-white space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-gray-300">
            Last updated: <time dateTime={updatedIso}>{updated}</time>
          </p>
        </div>
      </div>

      <section className="bg-white px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-base sm:text-lg leading-relaxed text-gray-700 mb-10">{intro}</div>

          <nav aria-label="On this page" className="mb-12 rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">On this page</h2>
            <ol className="list-decimal pl-5 space-y-1.5 text-gray-700">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="hover:text-orange-700 hover:underline underline-offset-2">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="space-y-10">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-28">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  {i + 1}. {s.title}
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_a]:text-orange-700 [&_a]:underline [&_a]:underline-offset-2 [&_strong]:text-gray-900">
                  {s.body}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/** The business contact block both documents end with. */
export function LegalContact() {
  return (
    <address className="not-italic rounded-xl border border-gray-200 p-4 sm:p-5 bg-gray-50">
      <strong>Genie Media &amp; Studio</strong>
      <br />
      5A2, 4th Floor, KP Icon, KP Infra, Yendada, Visakhapatnam, Andhra Pradesh 530045, India
      <br />
      Email: <a href="mailto:admin@geniemedia.in">admin@geniemedia.in</a>
      <br />
      Phone: <a href="tel:+919032845433">+91 90328 45433</a>
    </address>
  );
}
