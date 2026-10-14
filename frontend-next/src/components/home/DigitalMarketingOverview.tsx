import { CONTENT_LINK } from "@/lib/linkStyles";

const services = [
  { title: "SEO services in Vizag", href: "/digital_marketing/seo-services", body: "First, we check how people search for your business. Then we improve page titles, content and site structure. Our SEO services help search engines find and understand your pages." },
  { title: "Local SEO and Google Maps", href: "/digital_marketing/local-seo", body: "Local SEO helps nearby customers find you. We review your Google Business Profile, business details and local pages. As a result, your digital marketing plan connects search visits with calls, directions and enquiries." },
  { title: "Google Ads and PPC management", href: "/digital_marketing/google-ads", body: "For paid search, we choose keywords that match what you sell. Next, we create ads and track enquiries from each landing page. You can see where your budget goes and which searches bring leads." },
  { title: "Social media marketing", href: "/digital_marketing/social-media-marketing", body: "We plan posts, Reels and Meta Ads for Instagram and Facebook. Our social media management keeps your message clear. Meanwhile, our creative team makes content that supports your digital marketing goals." },
  { title: "Content marketing", href: "/digital_marketing/content-marketing", body: "Useful content answers customer questions before they call. We write website copy and blog posts, then create supporting photos and videos. Content marketing gives your digital marketing campaigns clear, helpful pages to share." },
  { title: "Lead generation and performance marketing", href: "/digital_marketing/lead-generation", body: "We build campaigns around a clear offer and a simple enquiry form. Then we track calls, form leads and WhatsApp clicks. This helps us improve your digital marketing based on real enquiries." },
];

export default function DigitalMarketingOverview() {
  return (
    <section aria-labelledby="home-digital-marketing" className="bg-white py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 id="home-digital-marketing" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5">Digital Marketing Services in Vizag</h2>
        <p className="text-lg text-gray-600 leading-relaxed mb-5">
          Genie Media &amp; Studio is a digital marketing agency in Vizag, also known as Visakhapatnam.
          We bring SEO, paid ads and creative content into one digital marketing plan. First, we learn
          what you sell and who you want to reach. Then we choose the work that fits your goals and budget.
        </p>
        <div className="grid gap-6 md:grid-cols-2 my-8">
          {services.map((service) => (
            <article key={service.href} className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="text-xl font-bold mb-3"><a href={service.href} className={CONTENT_LINK}>{service.title}</a></h3>
              <p className="text-gray-600 leading-relaxed">{service.body}</p>
            </article>
          ))}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Serving Rushikonda, MVP Colony and Andhra Pradesh</h3>
        <p className="text-lg text-gray-600 leading-relaxed mb-4">
          Our team works from KP Icon in Yendada, Visakhapatnam. We offer digital marketing services
          for businesses in Rushikonda, MVP Colony, Madhurawada and across Vizag. Local shops, clinics,
          restaurants, schools and property businesses can plan campaigns around the areas they serve.
          For example, local SEO can support nearby searches, while ads can reach a chosen service area.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed mb-5">
          We also provide digital marketing across Andhra Pradesh and India through remote meetings
          and shared reports. Whether you run a startup or an online store, you get a plan with a clear
          scope. Finally, we review traffic, enquiries and campaign costs so you can decide what to do next.
        </p>
        <a href="/digital_marketing" className={CONTENT_LINK}>Explore our digital marketing services</a>
        <span className="mx-3 text-gray-400" aria-hidden="true">·</span>
        <a href="/contact" className={CONTENT_LINK}>Discuss your business goals with Genie Media</a>
      </div>
    </section>
  );
}
