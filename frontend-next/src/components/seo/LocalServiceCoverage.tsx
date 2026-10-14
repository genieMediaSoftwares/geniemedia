import { CONTENT_LINK } from "@/lib/linkStyles";

export default function LocalServiceCoverage({ service }: { service: "web" | "podcast" }) {
  const web = service === "web";
  const title = web ? "Website Development in Yendada, Rushikonda and MVP Colony" : "Podcast Recording in Yendada, Visakhapatnam";
  const links = web ? [
    ["SEO-friendly website development", "/web-development/seo-friendly-websites"],
    ["WordPress website development", "/web-development/wordpress"],
    ["Shopify and online store development", "/web-development/shopify"],
    ["SEO and digital marketing", "/digital-marketing/seo-services"],
    ["Answer engine optimization (AEO)", "/digital-marketing/aeo"],
    ["Generative engine optimization (GEO)", "/digital-marketing/geo"],
  ] : [
    ["Podcast studio rental in Vizag", "/podcast-studio/rental"],
    ["Video podcast recording", "/podcast-studio/video-podcast"],
    ["Podcast production services", "/podcast-studio/production"],
    ["Remote podcast editing", "/podcast-studio/editing"],
    ["Podcast Reels and Shorts", "/podcast-studio/content-repurposing"],
    ["Content marketing for your episodes", "/digital-marketing/content-marketing"],
  ];
  return (
    <section aria-label={title} className="bg-gray-50 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5">{title}</h2>
        <p className="text-lg text-gray-600 leading-relaxed mb-5">
          {web
            ? "Genie Media & Studio builds websites from Yendada, Visakhapatnam (Vizag). We provide website design and development for businesses in Rushikonda, MVP Colony and Madhurawada, and work remotely across Andhra Pradesh and India. First, we plan your pages and content. Then we build a mobile-friendly site that helps visitors understand your offer and get in touch."
            : "The Genie Media podcast studio is at KP Icon in Yendada, Visakhapatnam (Vizag), Andhra Pradesh. Creators and businesses from Rushikonda, MVP Colony and Madhurawada can book audio or video podcast sessions here. Recording takes place at the studio. Podcast editing, production support and content repurposing are also available remotely for clients across India."}
        </p>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{web ? "Connect Your Website With SEO and Clear Answers" : "Turn Your Podcast Into Content People Can Find"}</h3>
        <p className="text-gray-600 leading-relaxed mb-6">
          {web
            ? "Search-friendly websites need clear service pages, useful answers and accurate business details. We can combine website development with SEO, AEO and GEO content work. The scope can include question-led pages, internal links and structured data that matches what visitors read."
            : "After recording, you can use edited episodes, captions, show notes and short clips to support your content marketing. Useful episode descriptions help people decide what to watch. Our podcast and digital marketing teams can plan the recording and promotion scope together."}
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {links.map(([label, href]) => <li key={href}><a href={href} className={CONTENT_LINK}>{label}</a></li>)}
        </ul>
        <p className="mt-7 text-gray-700"><a href="/contact" className={CONTENT_LINK}>Contact Genie Media &amp; Studio</a> to discuss your project and service area.</p>
      </div>
    </section>
  );
}
