import ContactSec from "@/components/contactSection"
import ServiceFaq from "@/components/ServiceFaq"
import PlatformsWeUse from "@/components/PlatformsWeUse";
import { PRODUCTION_HOUSE_FAQS } from "@/content/serviceFaqs"
import ProdHouseCamsAsset from "@/assets/Production-House-cams.jpg";
import StudioNightViewAsset from "@/assets/podcast/StudioNightView-min.jpg";
import { CONTENT_LINK } from "@/lib/linkStyles";

const ProdHouseCams = ProdHouseCamsAsset.src;
const StudioNightView = StudioNightViewAsset.src;

const SERVICES = [
  {
    title: "Corporate Video Production",
    body: "Company profiles, training videos, internal updates and client presentations. We keep the message clear, professional and in line with your brand.",
  },
  {
    title: "Brand Films",
    body: "A short film that tells your story. We combine interviews, behind-the-scenes footage and cinematic shots to build trust in your brand.",
  },
  {
    title: "Product Video Production",
    body: "Show how your product looks, works and helps. These videos suit your website, online store, ads and sales presentations.",
  },
  {
    title: "Social Media Videos",
    body: "Reels and short vertical videos planned for Instagram and Facebook. We shoot with the edit and the platform in mind.",
  },
  {
    title: "Video Editing Services and Post-Production",
    body: "Editing, colour grading, graphics, subtitles and sound clean-up. We also cut long videos into short clips and vertical versions.",
  },
  {
    title: "Events, Live Streaming and Photography",
    body: "Coverage of launches, conferences, weddings and events, with live streaming when you need it. We also offer photography for marketing and branding.",
  },
];

const PROCESS = [
  {
    title: "Creative Planning",
    body: "First, we discuss your goal, your audience and where the video will be used. Then we agree the format, length and budget.",
  },
  {
    title: "Script and Storyboard",
    body: "Next, our writers prepare the script and a shot plan. As a result, every scene has a clear purpose before filming starts.",
  },
  {
    title: "Production",
    body: "We film at our studio in Yendada, Visakhapatnam, or at your location. Our crew handles cameras, lighting and audio.",
  },
  {
    title: "Editing and Finishing",
    body: "Finally, our editors refine the footage, add graphics and music, and deliver the files in the formats you need.",
  },
];

const WHY = [
  {
    title: "One team for every need",
    body: "The team that films your video can also build your website and run your digital marketing. So your branding stays consistent.",
  },
  {
    title: "Planned for where it will be used",
    body: "We plan length, format and style around the final use, whether that is a website, a social media clip or a presentation.",
  },
  {
    title: "Clear quotes and timelines",
    body: "You receive a clear quote and schedule before filming begins. We agree the number of revision rounds in advance.",
  },
  {
    title: "Studio and crew under one roof",
    body: "Our Visakhapatnam studio, cameras, lighting and editors are all in-house, which keeps projects simple to coordinate.",
  },
];

export default function ProductionHouse({ h1 }: { h1?: string }) {
  return (
    <>
      <div className="text-center bg-gradient-to-br
        from-slate-900 via-slate-800 to-slate-900
        px-4 sm:px-6 lg:px-16 pt-28 mt-12 sm:pt-24 pb-12 sm:pb-12 lg:pb-18">

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            <div className="text-white space-y-6">
              <h1 className="text-4xl sm:text-6xl lg:text-6xl font-bold tracking-tight">
                {h1 || "Video Production House for Brands and Businesses"}
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-xl">
                Genie Media &amp; Studio is a video production house in Vizag. We create corporate videos, brand films, product videos and social media content for businesses and brands.
              </p>
              <p className="text-base text-gray-400 leading-relaxed">
                Our video production services cover planning, scripting, filming, editing and delivery. We agree the audience, shooting requirements and final formats before production starts.
              </p>
              <a href="/contact" className="inline-block bg-orange-500 hover:bg-orange-600 text-black font-semibold px-8 py-3.5 rounded-full transition-colors">
                Discuss Your Video Project
              </a>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg lg:max-w-2xl">
                <div className="absolute inset-0 bg-cyan-400 opacity-20 blur-3xl rounded-full"></div>
                <img
                  src={StudioNightView}
                  alt="Genie Media studio set with armchairs, boom microphones and lighting"
                  className="relative rounded-2xl shadow-2xl w-full max-w-lg lg:max-w-2xl object-cover"
                  fetchPriority="high"
                  width="1400"
                  height="933"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="relative bg-[#f9fafc] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-10 md:py-14 text-center">
          <p className="text-sm tracking-widest text-orange-700 font-semibold mb-6">
            CREATIVE PRODUCTION SOLUTIONS
          </p>
          <h2 className="text-2xl md:text-5xl lg:text-5xl font-extrabold leading-tight text-gray-900 mb-8">
            Video Content With a Clear Business Purpose
          </h2>
          <p className="max-w-4xl mx-auto text-lg sm:text-xl text-gray-600 leading-relaxed mb-4">
            Good video helps people understand your business quickly. It can explain a product, introduce your team or show your work.
          </p>
          <p className="max-w-4xl mx-auto text-lg sm:text-xl text-gray-600 leading-relaxed mb-12">
            That is why every project starts with a question: what should this video help you achieve? Then we plan the content, style and length around that goal.
          </p>
          <img src={ProdHouseCams} alt="Cameras and lighting equipment at the Genie Media production house" width="1358" height="503" loading="lazy" decoding="async" className="w-full h-auto rounded-xl" />
        </div>
      </section>

      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-5xl font-bold text-gray-900 mb-8 text-center">Our Video Production Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map(({ title, body }) => (
              <div key={title} className="bg-gray-50 rounded-2xl p-6 shadow-sm text-left">
                <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-5xl font-bold text-gray-900 mb-8 text-center">Our Production Process</h2>
          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS.map(({ title, body }, i) => (
              <li key={title} className="bg-white rounded-2xl p-6 shadow-sm text-left">
                <span className="text-3xl font-bold text-orange-500">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-xl font-bold mb-2 text-gray-900">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 text-center">
            <a href="/contact" className="inline-block bg-orange-500 hover:bg-black text-black hover:text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-lg">
              Start Your Video Project
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6">Video Content for Vizag, Visakhapatnam and India</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-4">
            Our studio and crew are based in Yendada, Visakhapatnam. Most shoots take place at our studio or at locations around Vizag.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            For shoots in other cities, please ask us about availability. Editing and post-production can be handled remotely for businesses across India.
          </p>
        </div>
      </section>

      <section className="bg-gray-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-5xl font-bold text-gray-900 mb-8 text-center">Why Choose Genie Media &amp; Studio?</h2>
          <p className="max-w-3xl mx-auto text-center text-lg text-gray-600 leading-relaxed mb-12">
            We also run a <a href="/podcast_studio" className={CONTENT_LINK}>podcast studio in Vizag</a> for audio and video recording. Our <a href="/digital_marketing" className={CONTENT_LINK}>digital marketing services</a> can promote your videos, and our <a href="/web_development" className={CONTENT_LINK}>website development team</a> can give them a home.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {WHY.map(({ title, body }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm text-left">
                <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6">Selected Production Work</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Watch our recent videos on the <a href="https://www.youtube.com/@itsgeniemedia_official" target="_blank" rel="noopener" className={CONTENT_LINK}>Genie Media YouTube channel</a>, read <a href="/reviews" className={CONTENT_LINK}>what our clients say</a>, or browse <a href="/projects" className={CONTENT_LINK}>our projects</a>. Ask us for examples close to your own project.
          </p>
        </div>
      </section>

      <PlatformsWeUse type="productionHouse" />
      <section className="bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">Plan Your Video Production Brief</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-5">
            For corporate video production, tell us who will watch the video and what they should understand or do next.
            For product video production, share the product, its key features and where the finished video will appear.
            Your brief helps us scope filming, editing, subtitles and the formats you need without guessing at a package.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            If you already have footage, ask about our video editing services. For an interview-led series, explore our{" "}
            <a href="/podcast_studio/video-podcast" className={CONTENT_LINK}>video podcast production options</a>.
            To use short edits in a campaign, see our{" "}
            <a href="/digital_marketing/social-media-marketing" className={CONTENT_LINK}>social media marketing services</a>.
          </p>
        </div>
      </section>
      <ServiceFaq
        title="Frequently Asked Questions"
        intro="Answers to common questions about our video production services."
        faqs={PRODUCTION_HOUSE_FAQS}
      />

      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Discuss Your Video Project</h2>
          <p className="text-lg text-gray-300 leading-relaxed mb-8">
            Tell us what the video should achieve and where it will be used. We will suggest a format, schedule and quote.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/contact" className="bg-orange-500 hover:bg-orange-600 text-black font-semibold px-8 py-3.5 rounded-full transition-colors">Request a Quote</a>
            <a href="https://wa.me/919032845433" data-track="whatsapp_click" className="border border-white/30 hover:border-white text-white font-semibold px-8 py-3.5 rounded-full transition-colors">Message on WhatsApp</a>
          </div>
        </div>
      </section>

      <ContactSec/>
    </>
  )
}
