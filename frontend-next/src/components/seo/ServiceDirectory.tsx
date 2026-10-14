import { SERVICE_SECTIONS, subPagePath } from "@/content/serviceSubPages";
import { SERVICE_DIRECTORY_FAQS } from "@/content/serviceFaqs";
import ServiceFaq from "@/components/ServiceFaq";
import { CONTENT_LINK } from "@/lib/linkStyles";

export default function ServiceDirectory() {
  return (
    <>
      <section className="bg-gray-50 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5">Genie Media Digital Marketing, Websites and Podcasts</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-10 max-w-4xl">
            Genie Media &amp; Studio works from Yendada in Vizag, Andhra Pradesh. We help businesses in
            Rushikonda, MVP Colony and Madhurawada with digital marketing, website development and podcast content.
            Marketing, website work and podcast editing can be delivered remotely across India.
            Studio recording takes place at our Yendada location. Choose a service below to see its scope,
            process, pricing approach and answers to common questions.
          </p>
          <div className="space-y-12">
            {SERVICE_SECTIONS.map((section) => (
              <div key={section.path}>
                <h3 className="text-2xl font-bold mb-5"><a href={section.path} className={CONTENT_LINK}>{section.label} Services</a></h3>
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {section.pages.map((page) => (
                    <li key={page.slug} className="rounded-xl bg-white border border-gray-200 p-5">
                      <h4 className="text-lg font-semibold mb-3"><a href={subPagePath(section, page.slug)} className={CONTENT_LINK}>{page.name}</a></h4>
                      <p className="text-gray-600 leading-relaxed">{page.directorySummary || page.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-10 text-lg text-gray-700">Ready to plan your project? <a href="/contact" className={CONTENT_LINK}>Contact Genie Media &amp; Studio</a> for a scope and quote.</p>
        </div>
      </section>
      <ServiceFaq title="Choosing Services for Your Business" intro="Clear answers about location, remote work and search visibility." faqs={SERVICE_DIRECTORY_FAQS} />
    </>
  );
}
