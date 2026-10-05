import type { ReactNode } from "react";
import {
  ShoppingCart, Dumbbell, Factory, GraduationCap, House, Stethoscope, UtensilsCrossed, Briefcase, Rocket,
  ArrowUpRight, ChevronDown, CheckCircle, Phone, Calendar, Mail, MapPin,
} from "lucide-react";
import DigitalMarketting1Asset from "@/assets/DigitalMarketting.jpg";
import DigitalMarketing2Asset from "@/assets/DigitalMarketing2.jpg";
import DM_servicesAsset from "@/assets/DM_services.webp";
import { DIGITAL_MARKETING_FAQS } from "@/content/digitalMarketingFaqs";
import PlatformsWeUse from "@/components/PlatformsWeUse";
import { CONTENT_LINK } from "@/lib/linkStyles";

const DigitalMarketting1 = DigitalMarketting1Asset.src;
const DigitalMarketing2 = DigitalMarketing2Asset.src;
const DM_services = DM_servicesAsset.src;

const inlineLink = CONTENT_LINK;

const services = [
  {
    id: "seo",
    title: "SEO Services in Vizag",
    subtitle: "Search Engine Optimization & Organic Growth",
    description: "SEO helps people find you on Google without paying for each click. First, we run an SEO audit of your website. Next, we fix technical SEO issues, improve on-page SEO and research the keywords your customers type. We also handle local SEO, Google Business Profile optimization, internal links and structured data. Finally, we report on your rankings and organic traffic every month.",
    keywords: ["SEO Audit", "Technical SEO", "On-Page SEO", "Local SEO", "Keyword Research"],
    link: "/blogs",
    linkLabel: "Read our SEO guides"
  },
  {
    id: "google-ads",
    title: "Google Ads & PPC Management",
    subtitle: "Paid Search & Performance Campaigns",
    description: "Google Ads and search engine marketing put you at the top of the page today, not in six months. We plan your PPC campaigns, write the ads and set up conversion tracking. After launch, we watch every search term and every rupee. As a result, your budget moves to the ads that bring calls and leads, and away from the ones that do not.",
    keywords: ["Google Search Ads", "PPC Management", "Conversion Tracking", "Remarketing"],
    link: "/contact",
    linkLabel: "Plan a Google Ads campaign"
  },
  {
    id: "social-media",
    title: "Social Media Marketing",
    subtitle: "Social Strategy, Creatives & Advertising",
    description: "We plan your social media strategy around the people you want to reach. Then we design posts, edit Reels and short videos, and keep your pages active. We also run paid social ads on Instagram and Facebook. The goal is simple: more brand awareness, stronger audience engagement and more enquiries, not just likes.",
    keywords: ["Social Media Management", "Instagram Marketing", "Facebook Ads", "Reels"],
    link: "/contact",
    linkLabel: "Grow your social media"
  },
  {
    id: "content-marketing",
    title: "Content Marketing",
    subtitle: "Content Strategy, Blogs & Brand Storytelling",
    description: "Good content answers the questions your customers already ask. So we plan topics around real searches. Then we write clear website copy, blog posts and social captions. Because we have our own studio, we can also shoot the photos and videos that bring your story to life.",
    keywords: ["Content Strategy", "Blog Content", "SEO Content", "Visual Storytelling"],
    link: "/blogs",
    linkLabel: "Browse our blog"
  },
  {
    id: "lead-generation",
    title: "Lead Generation",
    subtitle: "Campaigns That Bring In Qualified Enquiries",
    description: "Lead generation turns interest into real enquiries. We plan lead generation campaigns on Google and social media, build focused landing pages and keep forms short. Then we follow up leads by email. As a result, your team spends its time on qualified leads, not cold contacts.",
    keywords: ["Lead Generation Campaigns", "Landing Pages", "Qualified Leads", "Email Follow-Up"],
    link: "/contact",
    linkLabel: "Talk about lead generation"
  },
  {
    id: "conversion-optimization",
    title: "Conversion Optimization",
    subtitle: "More Enquiries From the Same Traffic",
    description: "Conversion optimization helps you get more from the visitors you already have. We study how people use your pages. Then we improve headlines, forms, page speed and calls to action. Next, we test each change and keep what works. In short, conversion rate optimization (CRO) lowers your cost per lead.",
    keywords: ["CRO", "A/B Testing", "Page Speed", "Calls to Action"],
    link: "/web_development",
    linkLabel: "Improve your website"
  },
  {
    id: "web-development",
    title: "Website Design & Development",
    subtitle: "Responsive, Fast & SEO-Friendly Websites",
    description: "Most marketing ends on your website, so it has to work well. Our team builds fast, responsive websites, landing pages and online stores. Each site is mobile-friendly, easy to use and SEO-friendly from day one. We also check page speed and Core Web Vitals before launch.",
    keywords: ["Website Design", "Responsive Website", "Ecommerce Website", "UI/UX"],
    link: "/web_development",
    linkLabel: "Explore web development"
  },
  {
    id: "branding",
    title: "Branding & Creative Services",
    subtitle: "Brand Identity, Positioning & Creatives",
    description: "A clear brand makes every campaign work harder. We help you shape your brand strategy, logo, colours and tone of voice. Then we turn them into graphic design, ad creatives and website messaging. When you need video or photos, our production house creates them in-house.",
    keywords: ["Brand Strategy", "Brand Identity", "Graphic Design", "Ad Creatives"],
    link: "/production_house",
    linkLabel: "See our creative production"
  }
];

const industries = [
  { icon: ShoppingCart, title: "E-Commerce & Retail", description: "We build online stores and run campaigns that bring in buyers, cut abandoned carts and grow sales." },
  { icon: Dumbbell, title: "Fitness & Wellness", description: "We help gyms and wellness brands win local members and build an active community online." },
  { icon: Factory, title: "Industrial & Manufacturing", description: "We build clear B2B websites and run lead generation campaigns for firms in Visakhapatnam." },
  { icon: GraduationCap, title: "Education & Coaching", description: "We help schools, colleges and coaching centres in Vizag reach more students and parents." },
  { icon: House, title: "Real Estate & Construction", description: "We build project websites and run local Google and Facebook ads for builders and property agents." },
  { icon: Stethoscope, title: "Healthcare & Clinics", description: "We help clinics, hospitals and labs in Vizag show up in local search and earn patient trust." },
  { icon: UtensilsCrossed, title: "Hospitality & Restaurants", description: "We help restaurants, hotels and travel brands attract locals and tourists with social media and local ads." },
  { icon: Briefcase, title: "Professional Services", description: "We help law firms, consultants and accountants build authority with content, SEO and a strong website." },
  { icon: Rocket, title: "Startups & Tech", description: "We help new ventures in Andhra Pradesh build a brand, win early users and grow online." }
];

const strategySteps = [
  { num: "01", title: "Research & Audience Analysis", desc: "First, we learn your goals, your customers and your rivals in Vizag. We also check how visible you are online today. This way, the plan starts from facts, not guesses." },
  { num: "02", title: "SEO & Organic Search", desc: "Next, we audit your website and research the keywords your buyers use. Then we fix the technical and on-page issues that hold back your rankings." },
  { num: "03", title: "Paid Advertising", desc: "Then we launch Google Ads and social ads as performance marketing campaigns, with clear goals and conversion tracking. After that, we move budget towards the ads that bring in leads." },
  { num: "04", title: "Content & Social Media", desc: "Meanwhile, we create content that answers your audience's questions. This includes blog posts, website copy, social posts and short videos." },
  { num: "05", title: "Conversion Optimization", desc: "We also improve landing pages, page speed, forms and calls to action. As a result, more visitors turn into enquiries, bookings and sales." },
  { num: "06", title: "Analytics & Reporting", desc: "Finally, we track rankings, traffic, leads and ROI. We share plain-language reports and keep improving the campaigns every month." }
];

const whyChooseUs: Array<{ title: string; content: ReactNode }> = [
  {
    title: "One Team for Everything",
    content: "Our team includes marketers, designers, developers, writers and video makers. So you do not need to manage five different agencies."
  },
  {
    title: "We Know the Local Market",
    content: "We are based in Visakhapatnam. We know how people in Vizag and across Andhra Pradesh search, compare and buy, and we plan around that."
  },
  {
    title: "Decisions Based on Data",
    content: "We use analytics, conversion tracking and campaign data to decide what to do next. In other words, we never guess with your budget."
  },
  {
    title: "Marketing, Web and Media Under One Roof",
    content: (
      <>
        Your SEO, ads, website and videos come from one place. Explore our{" "}
        <a href="/web_development" className={inlineLink}>website development services</a>, visit our{" "}
        <a href="/podcast_studio" className={inlineLink}>podcast studio</a>, or learn more{" "}
        <a href="/about" className={inlineLink}>about Genie Media & Studio</a>.
      </>
    )
  },
  {
    title: "Plans Built for Your Business",
    content: "No two businesses are the same. That is why we shape each plan around your goals, your industry and your budget."
  },
  {
    title: "Clear, Honest Reporting",
    content: (
      <>
        You get regular reports on rankings, traffic and leads, written in plain language. You can also look through{" "}
        <a href="/projects" className={inlineLink}>our projects portfolio</a> and read{" "}
        <a href="/reviews" className={inlineLink}>client reviews</a>.
      </>
    )
  }
];

/**
 * /digital_marketing. A server component: every word, including the FAQ
 * answers and all nine industries, is in the HTML Google receives. The FAQ
 * uses native <details> so it needs no JavaScript to open.
 */
export default function DigitalMarketting() {
  return (
    <div>
      {/* Hero Section */}
      <section className="text-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 lg:px-16 pt-24 mt-12 sm:pt-24 pb-12 sm:pb-12 lg:pb-18">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6 text-left">
              <p className="text-sm font-semibold tracking-widest text-orange-400 uppercase">
                Digital Marketing Agency in Vizag
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Digital Marketing Services in Vizag
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-xl">
                Genie Media & Studio offers digital marketing services that help businesses in Vizag get found, get chosen and grow. We plan SEO, Google Ads, social media, content, websites and branding as one clear plan. As a result, every part of your budget has a job to do.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <a href="/contact" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black font-semibold px-8 py-3.5 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <Calendar className="w-5 h-5" /> Request a Consultation
                </a>
                <a href="tel:+919032845433" className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-300">
                  <Phone className="w-5 h-5" /> Call +91 90328 45433
                </a>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg lg:max-w-2xl">
                <div className="absolute inset-0 bg-cyan-400 opacity-20 blur-3xl rounded-full"></div>
                <img
                  src={DigitalMarketting1}
                  fetchPriority="high"
                  alt="Genie Media & Studio team planning a digital marketing campaign in Visakhapatnam"
                  className="relative rounded-2xl shadow-2xl w-full max-w-lg lg:max-w-2xl object-cover"
                  width={1000}
                  height={666}
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Overview */}
      <section className="bg-white py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Digital Marketing Agency in Vizag
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Genie Media & Studio is a digital marketing agency in Visakhapatnam, Andhra Pradesh. Our team works from KP Icon in Yendada. We help local shops, clinics, schools, startups and growing brands reach more of the right people online.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Most businesses do not need more noise. Instead, they need a plan that brings in real enquiries. So we start with your goals, your customers and your budget. Then we pick the channels that will drive real business growth for you.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              For some brands, that means SEO and better Google rankings. For others, it means Google Ads, social media marketing or a faster website. In most cases, it is a mix. Either way, you get one team, one plan and one clear report.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Want to know us first? Read more <a href="/about" className={inlineLink}>about Genie Media & Studio</a>, look through <a href="/projects" className={inlineLink}>our portfolio of work</a>, or browse our <a href="/blogs" className={inlineLink}>digital marketing insights</a>.
            </p>
          </div>
        </div>
      </section>

      {/* Section: Services Overview */}
      <section className="bg-gray-50 py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Digital Marketing Services
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Each service works on its own. However, they work best together, because search, ads, content and your website all feed each other.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-orange-600 mb-1">{service.subtitle}</p>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{service.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {service.keywords.map((kw) => (
                      <span key={kw} className="text-xs font-medium bg-orange-50 text-orange-700 px-3 py-1 rounded-full">{kw}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <a href={service.link} className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-800 group">
                    {service.linkLabel} <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PlatformsWeUse type="digitalMarketing" />

      {/* Section: Digital Marketing for Businesses in Vizag */}
      <section className="bg-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Digital Marketing for Businesses in Vizag & Visakhapatnam
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                Vizag is growing fast. New shops, clinics, startups and firms open every month, and most of their customers search online first. Therefore, a local business needs to show up where those searches happen.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                We help you do exactly that. For example, we tune your Google Business Profile so you appear on Google Maps. We also aim ads at the areas you serve, and we build pages that speak to local buyers. As a result, nearby customers find you at the moment they need you.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700"><strong>Local visibility:</strong> Show up in &quot;near me&quot; searches across Vizag, Yendada, Dwaraka Nagar and MVP Colony.</p>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700"><strong>Audience targeting:</strong> Reach the right buyers across Visakhapatnam and Andhra Pradesh.</p>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700"><strong>Measurable growth:</strong> Track calls, form leads, store visits and ROI.</p>
                </li>
              </ul>
            </div>
            <div className="flex justify-center">
              <img
                src={DigitalMarketing2}
                alt="Digital marketing team at Genie Media & Studio reviewing campaign results"
                className="rounded-2xl shadow-xl w-full max-w-lg object-cover"
                width={800}
                height={533}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section: Our Process / Strategy */}
      <section className="bg-gray-50 py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Digital Marketing Strategy
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Every campaign follows the same six steps. That way, you always know what we are doing, why we are doing it and what it is achieving.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategySteps.map((step) => (
              <div key={step.num} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
                <span className="text-2xl font-bold text-orange-500 flex-shrink-0 w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                  {step.num}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Why Choose Us */}
      <section className="bg-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Genie Media & Studio
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We mix creative work, web skills and data. Here is what that means for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {whyChooseUs.map((item, index) => (
              <div key={item.title} className="bg-gray-50 rounded-2xl p-6 sm:p-8 hover:bg-gray-100 transition-colors duration-300">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Industries We Serve */}
      <section className="bg-slate-900 py-16 px-6 md:px-12 lg:px-20 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-orange-400 mb-4 leading-tight">
              Industries We Serve
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed max-w-3xl">
              Every industry has its own buyers and its own way of buying. So we shape each digital marketing campaign to fit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry) => (
              <div key={industry.title} className="bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-slate-500 transition-all duration-300">
                <div className="bg-slate-700/50 rounded-full w-14 h-14 flex items-center justify-center mb-6 text-2xl">
                  <industry.icon className="w-7 h-7 text-orange-400" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{industry.title}</h3>
                <p className="text-gray-300 leading-relaxed">{industry.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Portfolio */}
      <section className="bg-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Work & Portfolio
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              See websites, branding and digital campaigns that Genie Media & Studio has built for clients in India, Australia and other markets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Work Judged on Real Results</h3>
              <p className="text-gray-600 leading-relaxed">
                From website redesigns to lead generation and paid search campaigns, we judge our work on one thing. Does it help the business grow? That is why every project starts with a clear goal.
              </p>
              <div className="pt-2">
                <a href="/projects" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-full transition-all">
                  View Our Projects <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
            <div>
              <img
                src={DM_services}
                alt="Overview of the digital marketing services offered by Genie Media & Studio"
                className="rounded-2xl shadow-lg w-full object-cover"
                width={800}
                height={533}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section: Digital Marketing Services Near Me */}
      <section className="bg-gray-50 py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Digital Marketing Services Near Me
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Searching for a digital marketing agency near me or SEO services near me in Visakhapatnam? Genie Media & Studio is close by and easy to meet. Our office is at KP Icon in Yendada.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            We work with businesses across Vizag, including Madhurawada, Dwaraka Nagar, MVP Colony and Gajuwaka. Whether you need a website, Google Ads or social media marketing in Vizag, we are happy to talk it through.
          </p>
          <div className="inline-flex flex-wrap justify-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <MapPin className="w-5 h-5 text-orange-500" /> KP Icon, Yendada, Visakhapatnam 530045
            </div>
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <Phone className="w-5 h-5 text-orange-500" /> +91 90328 45433
            </div>
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <Mail className="w-5 h-5 text-orange-500" /> admin@geniemedia.in
            </div>
          </div>
        </div>
      </section>

      {/* Section: Media & Video Production Capabilities */}
      <section className="bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-8 sm:p-12 text-black shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-3xl font-bold">In-House Video Production & Podcast Studio in Vizag</h2>
              <p className="text-lg opacity-90 leading-relaxed">
                Beyond digital marketing, we run our own <a href="/podcast_studio" className={CONTENT_LINK}>podcast studio in Visakhapatnam</a> with multi-camera setups and pro audio. We also have a <a href="/production_house" className={CONTENT_LINK}>video production house</a> for brand videos, ad shoots and live streams. So your content can be planned, shot and promoted by one team.
              </p>
            </div>
            <div className="flex justify-start lg:justify-end">
              <a href="/podcast_studio" className="bg-black hover:bg-slate-900 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300">
                Book a Studio Slot
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section: FAQ */}
      <section className="bg-gray-50 py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Clear answers to common questions about digital marketing services in Vizag.
            </p>
          </div>

          <div className="space-y-4">
            {DIGITAL_MARKETING_FAQS.map((faq) => (
              <details key={faq.q} className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <summary className="w-full flex items-center justify-between p-6 text-left cursor-pointer list-none [&::-webkit-details-marker]:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-inset">
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.q}</h3>
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-300 group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Get Started (CTA) */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Get Started with Genie Media & Studio
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Ready to grow your online visibility and win more leads? Book a meeting or call our team in Visakhapatnam. We will look at where you are today and suggest clear next steps.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/contact" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
              <Calendar className="w-5 h-5" /> Book a Meeting
            </a>
            <a href="tel:+919032845433" className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white font-semibold px-8 py-4 rounded-full transition-all duration-300">
              <Phone className="w-5 h-5" /> Call +91 90328 45433
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
