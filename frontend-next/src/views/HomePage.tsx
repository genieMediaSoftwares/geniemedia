import { Fragment } from "react";
import { ArrowDown, ArrowRight, Sparkles, Layers, Mic, Globe, CheckCircle, TrendingUp, Code, Video } from "lucide-react";

import AboutUs from "@/components/AboutSection";
import DigitalMarketingOverview from "@/components/home/DigitalMarketingOverview";
import Contact from "@/components/contactSection";
import VideoTestimonials2 from "@/components/testimonials";
import ServiceFaq from "@/components/ServiceFaq";
import { HOME_FAQS } from "@/content/serviceFaqs";
import GenieImgAsset from "@/assets/genieHeroImg.webp";
import GenieImg640Asset from "@/assets/genieHeroImg-640.webp";
import meerabasuAsset from "@/assets/meerabasuWebsite.webp";
import AvanttaGemsAsset from "@/assets/AvanttaGems.webp";
import KNSAsset from "@/assets/knsMetals.webp";
import laserFoldAsset from "@/assets/LaserFold.webp";
import NuconaerospaceAsset from "@/assets/nuconaerospace.webp";
import SynergeneAsset from "@/assets/synergeneapi.webp";
import HomeProjects from "@/components/home/HomeProjects";
import { PROJECT_CONTAINER, PROJECT_HEADING, PROJECT_SECTION } from "@/components/ProjectCard";
import PlatformsWeUse from "@/components/PlatformsWeUse";
import WhatsAppContactLink from "@/components/home/WhatsAppContactLink";
import type { PortfolioItem } from "@/types";
import { CONTENT_LINK } from "@/lib/linkStyles";

const GenieImg = GenieImgAsset.src;
const GenieImg640 = GenieImg640Asset.src;
const meerabasu = meerabasuAsset.src;
const AvanttaGems = AvanttaGemsAsset.src;
const KNS = KNSAsset.src;
const laserFold = laserFoldAsset.src;
const Nuconaerospace = NuconaerospaceAsset.src;
const Synergene = SynergeneAsset.src;

const FALLBACK_PROJECTS: PortfolioItem[] = [
  {
    name: "Meera Basu",
    image: meerabasu,
    url: "https://meerabasu.co.in/",
  },
  {
    name: "Avantta Gems",
    image: AvanttaGems,
    url: "https://8z2bgt-68.myshopify.com/",
  },
  {
    name: "KNS Metal Solutions",
    image: KNS,
    url: "https://knsmetalsolutions.com.au/",
  },
  {
    name: "Laserfold",
    image: laserFold,
    url: "https://laserfold.com.au/",
  },
  {
    name: "Nucon Aerospace",
    image: Nuconaerospace,
    url: "https://www.nuconaerospace.com/",
  },
  {
    name: "Synergene",
    image: Synergene,
    url: "https://synergeneapi.com/",
  },
];

const STATS = [
  { icon: Layers, value: "4", label: "Service Lines" },
  { icon: Mic, value: "₹1,500", label: "Podcast Studio / hour" },
  { icon: Globe, value: "3", label: "Countries Served" },
];

const HOME_BTN_PRIMARY =
  "relative overflow-hidden bg-[linear-gradient(135deg,#FF6B00,#FF8C3A)] transition-all duration-[400ms] ease-in-out hover:[transform:translateY(-4px)_scale(1.05)] hover:shadow-[0_15px_40px_rgba(255,107,0,0.5)] before:content-[''] before:absolute before:left-1/2 before:top-1/2 before:h-0 before:w-0 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-white/30 before:[transition:width_0.6s_ease,height_0.6s_ease] hover:before:left-full hover:before:h-[300px] hover:before:w-[300px]";

const HOME_BTN_SECONDARY =
  "relative overflow-hidden !border-2 !border-solid !border-black !bg-white !text-black [transition-property:transform,box-shadow,color,background-color] duration-300 ease-in-out hover:!text-white hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,107,0,0.3)] before:content-[''] before:absolute before:left-1/2 before:top-0 before:z-[-1] before:h-0 before:w-0 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-[linear-gradient(135deg,#FF6B00,#FF8C3A)] before:[transition:width_0.7s_ease,height_0.8s_ease] hover:before:h-[300px] hover:before:w-[300px]";

const STAT_CARD =
  "transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(255,107,0,0.2)]";

const heroLink = CONTENT_LINK;

const HOME_SERVICES = [
  {
    icon: TrendingUp,
    heading: "Digital Marketing for Clearer Online Growth",
    body: "Get found by the right people and turn visits into enquiries. We plan SEO, Google Ads, social media and content as one strategy, with monthly reporting.",
    points: ["SEO and local SEO in Visakhapatnam", "Google Ads and Meta Ads", "Content and social media marketing"],
    href: "/digital-marketing",
    cta: "Explore digital marketing services",
  },
  {
    icon: Code,
    heading: "Website Development That Supports Business Goals",
    body: "Your website should explain what you do and make it easy to contact you. We build fast, mobile-friendly and SEO-ready websites and online stores.",
    points: ["Business and e-commerce websites", "WordPress, Shopify, React and Next.js", "Redesign, maintenance and speed fixes"],
    href: "/web-development",
    cta: "See website development services",
  },
  {
    icon: Video,
    heading: "Video Production for Brands and Businesses",
    body: "Video helps people understand and trust your business faster. Our production house plans, shoots and edits videos with a clear business purpose.",
    points: ["Corporate and brand films", "Product and social media videos", "Editing and post-production"],
    href: "/production-house",
    cta: "View video production services",
  },
  {
    icon: Mic,
    heading: "Podcast Studio Rental and Podcast Production in Vizag",
    body: "Record audio and video podcasts at our studio in Yendada, Visakhapatnam. Hire the studio on your own from ₹1,500 an hour, or add our team and cameras.",
    points: ["Studio-only and team-supported recording", "Two- and three-camera video podcasts", "Editing and short-form clips"],
    href: "/podcast-studio",
    cta: "Book the podcast studio in Vizag",
  },
];

const AUDIENCES = [
  { title: "Startups", body: "A credible website and a clear plan to win early customers." },
  { title: "Local businesses", body: "Visibility in Vizag searches and on Google Maps." },
  { title: "Clinics and professional services", body: "Trust-building websites, content and local SEO." },
  { title: "E-commerce brands", body: "Online stores, ads and content that drive sales." },
  { title: "Real estate and construction", body: "Project websites, videos and lead campaigns." },
  { title: "Education and coaching", body: "Course pages, admissions campaigns and video." },
  { title: "Manufacturers and B2B", body: "Clear capability websites and enquiry generation." },
  { title: "Creators and personal brands", body: "Podcasts, video and a strong personal website." },
];

const WHATSAPP_URL = "https://wa.me/919032845433";

const HomePage = ({ initialProjects }: { initialProjects: PortfolioItem[] | null }) => {
  const stats = STATS;

  const steps = [
    {
      step: "Step 01",
      title: "Research & Planning",
      desc: "First, we learn your goals, your customers and your market. Then we plan the right mix of marketing, website and content work.",
      active: false,
    },
    {
      step: "Step 02",
      title: "Create & Launch",
      desc: "Next, our team builds the website, campaigns, videos or content in the plan, with tracking set up from day one.",
      active: true,
    },
    {
      step: "Step 03",
      title: "Measure & Improve",
      desc: "Finally, we track enquiries, traffic and engagement. Then we keep improving what works and report clearly.",
      active: false,
    },
  ];

  return (
    <>
      <section
        className="relative min-h-screen bg-white-200 overflow-hidden pt-20 pb-16 px-4 sm:px-6 lg:px-8"
        id="home"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="animate-home-glow motion-reduce:animate-none absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-orange-200 to-orange-100 rounded-full blur-3xl opacity-40"></div>
          <div
            className="animate-home-glow motion-reduce:animate-none ![animation-delay:-10s] absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-orange-300 to-orange-200 rounded-full blur-3xl opacity-30"
          ></div>

          <Sparkles
            className="animate-home-sparkle motion-reduce:animate-none ![animation-delay:2s] absolute top-32 left-1/4 text-orange-400 opacity-60"
            size={24}
          />
          <Sparkles
            className="animate-home-sparkle motion-reduce:animate-none hidden absolute  top-1/3 right-1/4 text-orange-500 opacity-50"
            size={20}
          />
          <Sparkles
            className="animate-home-sparkle motion-reduce:animate-none absolute bottom-1/3 left-1/3 text-orange-400 opacity-70"
            size={28}
          />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-home-content motion-reduce:animate-none space-y-8 text-center lg:text-left mt-4">
              <div className="animate-home-badge motion-reduce:animate-none inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-50 rounded-full mt-8">
                <Sparkles className="text-orange-500" size={16} />
                <span className="text-sm font-semibold text-orange-700 ">
                  Genie Media &amp; Studio · Visakhapatnam
                </span>
              </div>

              <h1 className="animate-home-rise motion-reduce:animate-none text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold leading-tight text-balance">
                Marketing, Websites & Media Production in Vizag
              </h1>
              <p className="animate-home-rise motion-reduce:animate-none text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Genie Media &amp; Studio provides digital marketing services in Visakhapatnam.
                We help startups, local businesses and growing brands get found online and win more enquiries.
                From our office in Yendada, we offer{" "}
                <a href="/digital-marketing" className={heroLink}>digital marketing</a>,{" "}
                <a href="/web-development" className={heroLink}>website development</a>,{" "}
                <a href="/production-house" className={heroLink}>video production</a> and a{" "}
                <a href="/podcast-studio" className={heroLink}>podcast studio</a>. We work with clients in Vizag,
                across Andhra Pradesh and throughout India.
              </p>

              <div className="animate-home-buttons motion-reduce:animate-none grid grid-cols-1 min-[375px]:grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4 w-full max-w-md mx-auto lg:mx-0 justify-center lg:justify-start">
                <WhatsAppContactLink
                  className={`w-full sm:w-56 ${HOME_BTN_PRIMARY} group min-h-12 whitespace-nowrap px-5 py-4 text-black font-bold rounded-full text-base shadow-xl flex items-center justify-center gap-2 z-10`}
                >
                  Get Started
                  <ArrowRight
                    className="group-hover:translate-x-1 transition-transform"
                    size={20}
                  />
                </WhatsAppContactLink>
                <a
                  href="/projects"
                  className={`w-full sm:w-auto ${HOME_BTN_SECONDARY} min-h-12 whitespace-nowrap px-6 py-4 font-bold rounded-full text-base flex items-center justify-center gap-2 z-10`}
                >
                  See Portfolio
                </a>
              </div>

              <div className="animate-home-stats motion-reduce:animate-none grid grid-cols-3 gap-3 sm:gap-4 pt-4">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className={`${STAT_CARD} min-w-0 bg-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-lg`}
                  >
                    <stat.icon
                      className="text-orange-500 mb-2 mx-auto lg:mx-0"
                      size={24}
                    />
                    <div className="font-bold text-xl sm:text-2xl text-gray-800">
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block animate-home-image motion-reduce:animate-none relative min-w-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full blur-3xl opacity-20 scale-110"></div>

                <div className="animate-home-float max-[768px]:animate-home-float-slow motion-reduce:animate-none">
                  <picture>
                    <source
                      media="(max-width: 1023.98px)"
                      srcSet="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                    />
                    <img
                      src={GenieImg}
                      srcSet={`${GenieImg640} 640w, ${GenieImg} 1000w`}
                      sizes="(min-width: 1280px) 600px, 50vw"
                      alt="Genie Media's genie mascot rising from a lamp"
                      className="hidden lg:block w-full h-[600px] object-cover rounded-3xl mt-8"
                      width="1000"
                      height="1000"
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                    />
                  </picture>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 animate-bounce ">
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-orange-500 rounded-full animate-home-pulse motion-reduce:animate-none"></div>
          </div>
        </div>
      </section>

      <section aria-label="Our services" className="bg-[#f9fafc] py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6 grid gap-8 md:grid-cols-2">
          {HOME_SERVICES.map(({ icon: Icon, heading, body, points, href, cta }) => (
            <div key={href} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 sm:p-8 flex flex-col">
              <Icon className="w-8 h-8 text-orange-500 mb-4" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{heading}</h2>
              <p className="text-gray-600 leading-relaxed mb-4">{body}</p>
              <ul className="space-y-2 mb-6">
                {points.map((pt) => (
                  <li key={pt} className="flex gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" aria-hidden="true" /> {pt}
                  </li>
                ))}
              </ul>
              <a href={href} className="mt-auto inline-flex items-center gap-2 font-semibold text-orange-600 hover:text-orange-800">
                {cta} <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          ))}
        </div>
      </section>

      <DigitalMarketingOverview />
      <AboutUs />

      <section className="bg-white py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-orange-600 text-center font-medium text-2xl sm:text-4xl uppercase tracking-wide mb-8 md:mb-10">
            How Genie Media Helps Businesses Grow
          </h2>

          <ol className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch max-w-xl lg:max-w-none mx-auto">
            {steps.map((item, index) => (
              <Fragment key={item.step}>
                <li
                  className={`flex flex-col items-center justify-center text-center rounded-xl px-6 py-8 sm:px-8 lg:px-8 lg:py-10 min-h-[18.5rem] sm:min-h-[15rem] transition-shadow duration-300 hover:shadow-xl ${
                    item.active ? "bg-orange-400 text-black" : "bg-[#0B1220] text-white"
                  }`}
                >
                  <p className={`text-lg font-semibold mb-3 ${item.active ? "text-black/70" : "text-orange-500"}`}>
                    {item.step}
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold leading-snug mb-4">{item.title}</h3>
                  <div className={`w-14 h-px mb-4 ${item.active ? "bg-black/30" : "bg-gray-600"}`} />
                  <p className={`max-w-xs text-base leading-relaxed ${item.active ? "text-black" : "text-gray-100"}`}>
                    {item.desc}
                  </p>
                </li>

                {index < steps.length - 1 && (
                  <li aria-hidden="true" className="flex items-center justify-center py-3 lg:py-0 lg:px-5 text-[#0B1220]">
                    <ArrowDown className="w-8 h-8 lg:hidden" strokeWidth={2.25} />
                    <ArrowRight className="hidden lg:block w-9 h-9" strokeWidth={2.25} />
                  </li>
                )}
              </Fragment>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#f9fafc] py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Who We Work With</h2>
          <p className="max-w-3xl mx-auto text-center text-lg text-gray-600 leading-relaxed mb-10">
            We work with businesses that want clear, measurable growth online, from new startups to established local firms.
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCES.map((a) => (
              <li key={a.title} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-1">{a.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{a.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={PROJECT_SECTION} id="projects">
        <div className={PROJECT_CONTAINER}>
          <h2 className={PROJECT_HEADING}>
            Selected Projects
          </h2>

          <HomeProjects initialProjects={initialProjects} fallback={FALLBACK_PROJECTS} />
          <div className="flex justify-center mt-10">
            <a
              href="/projects"
              className="
    px-6 py-2 
    rounded-full 
    font-semibold 
    border-2 border-transparent
    hover:text-white 
    hover:bg-gray-900
    bg-orange-400
    text-black
    transition-all duration-300
  "
            >
              View More Projects
            </a>
          </div>
        </div>
      </section>

      <section className="relative py-10 bg-white overflow-hidden border-y-2">
        <div className="mb-12">
          <PlatformsWeUse
            type="webDevelopment"
            section={false}
            title="Platforms we use"
            headingClassName="text-center text-4xl font-bold mb-4"
            intro={
              <>
                The technologies and platforms behind our{" "}
                <a href="/web-development" className={heroLink}>web development services</a>.
              </>
            }
          />
        </div>

        <div className="max-w-4xl mx-auto text-center px-4">
          <p className="text-xl md:text-2xl font-semibold text-gray-800 leading-relaxed mb-8">
          Need a website, a campaign or content that works together? Talk to our team in Visakhapatnam.

          </p>

          <a
            href={WHATSAPP_URL}
            className="
             inline-flex items-center justify-center gap-2
              px-5 py-3                
              sm:px-8 sm:py-4          
              
              rounded-full
              bg-orange-500
              text-black
              text-sm sm:text-base    
              font-semibold
              hover:bg-gray-900
              hover:text-gray-100
              active:scale-95
              
              transition-all duration-300
              shadow-lg
              w-full sm:w-auto  
          "
          >
            Talk to us on WhatsApp
            <ArrowRight className="w-5 h-7" strokeWidth={2.5} aria-hidden="true" />
          </a>
        </div>

        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02),transparent_70%)]" />
      </section>

      <VideoTestimonials2 />
      <ServiceFaq
        title="Frequently Asked Questions"
        intro="Quick answers about our services, location and how to get started."
        faqs={HOME_FAQS}
      />
      <Contact />
    </>
  );
};

export default HomePage;
