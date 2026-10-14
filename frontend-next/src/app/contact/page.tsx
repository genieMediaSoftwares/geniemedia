import type { Metadata } from "next";

import ContactSec from "@/components/contactSection";
import JsonLd from "@/components/seo/JsonLd";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { metaForRoute } from "@/lib/seo/routeMeta";
import { CONTENT_LINK } from "@/lib/linkStyles";

export const metadata: Metadata = buildRouteMetadata("/contact");

export default function ContactRoute() {
  return (
    <>
      <JsonLd data={metaForRoute("/contact").schema} />
      <ContactSec isPage />
      <section className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-5">Contact Us for Services in Vizag and Across India</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-5">
            Our team is based in Yendada, serving businesses in Rushikonda, MVP Colony, Madhurawada
            and across Visakhapatnam. We can work remotely on digital marketing, websites and podcast
            editing across Andhra Pradesh and India. Recording sessions take place at our Vizag studio.
            For a quote, share your website or social profiles, the work you need and your preferred timeline.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">Before you contact us, you can review the service scope and common questions on these pages. For studio work, tell us your preferred date and package so we can check availability.</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              ["Digital marketing services", "/digital_marketing"],
              ["Website development", "/web_development"],
              ["Podcast studio and editing", "/podcast_studio"],
              ["SEO services", "/digital_marketing/seo-services"],
              ["AEO services", "/digital_marketing/aeo"],
              ["GEO services", "/digital_marketing/geo"],
            ].map(([label, href]) => <li key={href}><a href={href} className={CONTENT_LINK}>{label}</a></li>)}
          </ul>
        </div>
      </section>
    </>
  );
}
