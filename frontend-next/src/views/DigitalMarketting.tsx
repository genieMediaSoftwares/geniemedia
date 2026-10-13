import type { ReactNode } from "react";
import {
  ShoppingCart, Factory, GraduationCap, House, Stethoscope, Rocket,
  ArrowUpRight, ChevronDown, CheckCircle, Phone, Calendar, MessageCircle,
} from "lucide-react";
import DigitalMarketting1Asset from "@/assets/DigitalMarketting.jpg";
import DigitalMarketing2Asset from "@/assets/DigitalMarketing2.jpg";
import DM_servicesAsset from "@/assets/DM_services.webp";
import { DIGITAL_MARKETING_FAQS } from "@/content/digitalMarketingFaqs";
import PlatformsWeUse from "@/components/PlatformsWeUse";
import { CONTENT_LINK } from "@/lib/linkStyles";
import { DM_SERVICE_PAGES, dmServicePath } from "@/content/dmServicePages";
import { CLIENTS } from "@/content/testimonials";

const DigitalMarketting1 = DigitalMarketting1Asset.src;
const DigitalMarketing2 = DigitalMarketing2Asset.src;
const DM_services = DM_servicesAsset.src;

const inlineLink = CONTENT_LINK;

const services = [
  {
    id: "seo",
    title: "SEO Services for Search Visibility",
    subtitle: "Search Engine Optimization & Organic Growth",
    description: "SEO helps people find you on Google without paying for each click. First, we run an SEO audit of your website. Next, we fix technical SEO issues, improve on-page SEO and research the keywords your customers type. We also handle internal links and structured data. Finally, we report on your rankings and organic traffic every month.",
    keywords: ["SEO Audit", "Technical SEO", "On-Page SEO", "Keyword Research"],
    link: "/digital_marketing/seo-services",
    linkLabel: "Explore SEO services"
  },
  {
    id: "local-seo",
    title: "Local SEO and Google Business Profile Optimisation",
    subtitle: "Google Maps & \"Near Me\" Visibility",
    description: "When someone nearby searches for what you offer, your Google Business Profile is often the first thing they see. So we set it up or clean it up, pick the right categories and keep your hours, photos and services up to date. We also fix your local listings and build location pages. As a result, more people in Vizag find you on Google Maps and in local search.",
    keywords: ["Google Business Profile", "Google Maps", "Local Listings", "Location Pages"],
    link: "/digital_marketing/local-seo",
    linkLabel: "Explore local SEO"
  },
  {
    id: "google-ads",
    title: "Google Ads Management for Qualified Enquiries",
    subtitle: "Paid Search & Performance Campaigns",
    description: "Google Ads and search engine marketing put you at the top of the page today, not in six months. We plan your PPC campaigns, write the ads and set up conversion tracking. We also run display ads and remarketing to bring back people who visited your site. After launch, we watch every search term and every rupee. As a result, your budget moves to the ads that bring calls and leads, and away from the ones that do not.",
    keywords: ["Google Search Ads", "PPC Management", "Display Ads", "Remarketing"],
    link: "/digital_marketing/google-ads",
    linkLabel: "Explore Google Ads management"
  },
  {
    id: "content-marketing",
    title: "Content Marketing for Trust and Growth",
    subtitle: "Content Strategy, Blogs & Brand Storytelling",
    description: "Good content answers the questions your customers already ask. So we plan topics around real searches. Then we write clear website copy, blog posts and social captions. Because we have our own studio, we can also shoot the photos and videos that bring your story to life.",
    keywords: ["Content Strategy", "Blog Content", "SEO Content", "Visual Storytelling"],
    link: "/digital_marketing/content-marketing",
    linkLabel: "Explore content marketing"
  },
  {
    id: "social-media",
    title: "Social Media Marketing and Creative Content",
    subtitle: "Social Strategy, Creatives & Advertising",
    description: "We plan your social media strategy around the people you want to reach. Then we design posts, edit Reels and short videos, and keep your pages active. We also run paid social ads on Instagram and Facebook through Meta Ads. The goal is simple: more brand awareness, stronger audience engagement and more enquiries, not just likes.",
    keywords: ["Social Media Management", "Instagram Marketing", "Facebook & Instagram Ads", "Reels"],
    link: "/digital_marketing/social-media-marketing",
    linkLabel: "Explore social media marketing"
  },
  {
    id: "lead-generation",
    title: "Lead Generation That Brings Qualified Enquiries",
    subtitle: "Campaigns That Bring In Qualified Enquiries",
    description: "Lead generation turns interest into real enquiries. We plan lead generation campaigns on Google and social media, build focused landing pages and keep forms short. Then we follow up leads by email. As a result, your team spends its time on qualified leads, not cold contacts.",
    keywords: ["Lead Generation Campaigns", "Landing Pages", "Qualified Leads", "Email Follow-Up"],
    link: "/digital_marketing/lead-generation",
    linkLabel: "Explore lead generation"
  },
  {
    id: "conversion-optimization",
    title: "Conversion Optimisation for More Enquiries",
    subtitle: "More Enquiries From the Same Traffic",
    description: "Conversion optimization helps you get more from the visitors you already have. We study how people use your pages. Then we improve headlines, forms, page speed and calls to action. Next, we test each change and keep what works. In short, conversion rate optimization (CRO) lowers your cost per lead.",
    keywords: ["CRO", "A/B Testing", "Page Speed", "Calls to Action"],
    link: "/digital_marketing/conversion-optimization",
    linkLabel: "Explore conversion optimization"
  }
];

const industries = [
  { icon: Rocket, title: "Startups and Small Businesses", description: "We help new and small businesses build a credible online presence, win early customers and grow on a sensible budget." },
  { icon: ShoppingCart, title: "E-commerce Brands", description: "We run SEO, Google Shopping, Meta Ads and content that bring buyers to your own store, not just marketplaces." },
  { icon: Stethoscope, title: "Clinics and Professional Services", description: "We help clinics, doctors, consultants and firms show up in local search and earn trust before the first call." },
  { icon: House, title: "Real Estate and Construction", description: "We build project pages and run location-targeted campaigns for builders, developers and contractors." },
  { icon: GraduationCap, title: "Education and Coaching", description: "We help schools, colleges and coaching centres reach students and parents during admission seasons." },
  { icon: Factory, title: "Manufacturers and B2B Companies", description: "We create clear capability pages and lead generation campaigns for buyers searching for suppliers." },
];

const strategySteps = [
  { num: "01", title: "Business and Audience Research", desc: "We review your business goals, target audience, existing website, competitors, current traffic and leads, and the market and area you serve." },
  { num: "02", title: "Search and Competitor Analysis", desc: "We study search intent, keyword opportunities, competitor pages, local visibility and content gaps." },
  { num: "03", title: "Strategy and Channel Planning", desc: "We decide how SEO, Google Ads, content and social media should work together for your goals and budget." },
  { num: "04", title: "Implementation", desc: "We improve your website, create content, set up campaigns and tracking, and update your Google Business Profile." },
  { num: "05", title: "Measurement and Reporting", desc: "We track organic clicks, impressions, rankings, leads, calls, WhatsApp clicks, form submissions and paid conversions." },
  { num: "06", title: "Continuous Improvement", desc: "SEO and paid campaigns need testing and iteration, so we keep improving what works and dropping what does not." },
];

const whyChooseUs: Array<{ title: string; content: ReactNode }> = [
  {
    title: "One Team for Everything",
    content: "Our team includes marketers, designers, developers, writers and video makers. So you do not need to manage five different agencies."
  },
  {
    title: "Local Understanding With India-Wide Capability",
    content: "We are based in Visakhapatnam and know how people in Vizag and Andhra Pradesh search, compare and buy. We also run campaigns for businesses in other parts of India remotely."
  },
  {
    title: "Creative Work Supported by Measurement",
    content: "Strategy, content, design and performance tracking work together. We use analytics and conversion data to decide what to create and where to spend next."
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

const choosingTips: Array<{ title: string; content: ReactNode }> = [
  {
    title: "What will you do in the first three months?",
    content: "A clear plan names the channels, the tasks and the results to watch. Vague answers usually mean vague work."
  },
  {
    title: "How will you measure success?",
    content: "Look for an agency that tracks calls, form leads and sales, not just likes, clicks and impressions."
  },
  {
    title: "Can I see real work?",
    content: (
      <>
        Ask for live websites and campaigns. You can browse <a href="/projects" className={inlineLink}>our projects</a> and read <a href="/reviews" className={inlineLink}>what clients say</a>.
      </>
    )
  },
  {
    title: "Who owns the accounts?",
    content: "Agree before you start on who owns your website, ad accounts, Google Business Profile and analytics data."
  },
  {
    title: "Can we meet in person?",
    content: (
      <>
        A local team understands your market and is easy to reach. Our office is at KP Icon in Yendada, close to Rushikonda and Madhurawada, so you can <a href="/contact" className={inlineLink}>book a meeting</a> and talk to us face to face.
      </>
    )
  }
];

export default function DigitalMarketting({ h1 }: { h1?: string }) {
  return (
    <div>
      <section className="text-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 lg:px-16 pt-24 mt-12 sm:pt-24 pb-12 sm:pb-12 lg:pb-18">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6 text-left">
              <p className="text-sm font-semibold tracking-widest text-orange-400 uppercase">
                Digital Marketing Agency in Vizag · Serving India
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                {h1 || "Digital Marketing Agency for Growing Businesses in Vizag and India"}
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-xl">
                Genie Media & Studio helps startups, local businesses, e-commerce brands and growing companies improve their online visibility, attract relevant audiences and generate more enquiries. Based in Visakhapatnam, we provide SEO, Google Ads, social media, content marketing and lead generation for businesses in Vizag, Andhra Pradesh and across India, with campaign performance measured every month.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <a href="/contact" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black font-semibold px-8 py-3.5 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <Calendar className="w-5 h-5" /> Request a Consultation
                </a>
                <a href="https://wa.me/919032845433?text=Hi%20Genie%20Media%2C%20I%27d%20like%20to%20discuss%20digital%20marketing." data-track="whatsapp_click" className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-300">
                  <MessageCircle className="w-5 h-5" /> Start on WhatsApp
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

      <section className="bg-white py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Digital Marketing Services Built Around Your Business Goals
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
            <ul className="grid sm:grid-cols-2 gap-3 text-left mb-8">
              {["More local enquiries", "Better Google visibility", "E-commerce sales", "Brand awareness", "Lead generation", "A stronger content presence", "Better paid campaign performance"].map((goal) => (
                <li key={goal} className="flex items-start gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" aria-hidden="true" /> {goal}
                </li>
              ))}
            </ul>
            <p className="text-lg text-gray-600 leading-relaxed">
              Want to know us first? Read more <a href="/about" className={inlineLink}>about Genie Media & Studio</a>, look through <a href="/projects" className={inlineLink}>our portfolio of work</a>, or browse our <a href="/blogs" className={inlineLink}>digital marketing insights</a>.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-lg text-gray-600 max-w-3xl mx-auto text-center mb-12">
            Each service works on its own. However, they work best together, because search, ads, content and your website all feed each other.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-orange-600 mb-1">{service.subtitle}</p>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h2>
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

      <section aria-labelledby="dm-specialist-services" className="bg-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 id="dm-specialist-services" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Explore Our Specialist Digital Marketing Services
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Each page explains what the service is, who it suits, what is included and how we measure it, for businesses in Vizag and across India.
            </p>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {DM_SERVICE_PAGES.map((p) => (
              <li key={p.slug}>
                <a href={dmServicePath(p.slug)} className="group flex h-full items-center justify-between gap-2 rounded-xl border border-gray-200 px-5 py-4 font-semibold text-gray-900 transition-colors hover:border-orange-400">
                  {p.name} <ArrowUpRight className="w-4 h-4 flex-shrink-0 text-orange-500" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <PlatformsWeUse type="digitalMarketing" />

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
                  <p className="text-gray-700"><strong>Local visibility:</strong> Show up in &quot;near me&quot; searches across Visakhapatnam, including the neighbourhoods your customers live in.</p>
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

      <section className="bg-gray-50 py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Digital Marketing Process
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Every engagement follows the same six steps, so you always know what we are doing, why, and what it is achieving.
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

      <section className="bg-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Genie Media &amp; Studio?
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

      <section className="bg-slate-900 py-16 px-6 md:px-12 lg:px-20 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-orange-400 mb-4 leading-tight">
              Who We Help
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed max-w-3xl">
              We offer digital marketing for small businesses, startups, clinics, restaurants, hotels, builders, schools and online stores. Every industry has its own buyers and its own way of buying. So we shape each campaign to fit.
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

      <section className="bg-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Projects and Proof
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              See websites, branding and digital campaigns that Genie Media & Studio has built for clients in India, Australia and other markets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Clients We Have Worked With</h3>
              <ul className="flex flex-wrap gap-2">
                {CLIENTS.map((c) => (
                  <li key={c.name} className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900">{c.name}</li>
                ))}
              </ul>
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

      <section className="bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-8 sm:p-12 text-black shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-3xl font-bold">Website, Video and Podcast Support Under One Team</h2>
              <p className="text-lg opacity-90 leading-relaxed">
                Most marketing ends on your website, so our <a href="/web_development" className={CONTENT_LINK}>website development services</a> keep it fast, mobile-friendly and SEO-ready. We also help shape your brand identity, colours and ad creatives.
              </p>
              <p className="text-lg opacity-90 leading-relaxed">
                For video, our <a href="/production_house" className={CONTENT_LINK}>video production services</a> cover brand films, ad shoots and Reels. Our <a href="/podcast_studio" className={CONTENT_LINK}>podcast studio rental in Vizag</a> adds audio and video podcasts. So your content can be planned, shot and promoted by one team.
              </p>
            </div>
            <div className="flex justify-start lg:justify-end">
              <a href="/podcast_studio" className="bg-black hover:bg-slate-900 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300">
                Visit the Podcast Studio
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 text-center">
            How to Choose a Digital Marketing Company in Vizag
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-8 text-center">
            There are many digital marketing agencies in Visakhapatnam. Instead of picking the one with the biggest promises, ask these questions first. A good partner will answer them clearly.
          </p>
          <ul className="space-y-4">
            {choosingTips.map((tip) => (
              <li key={tip.title} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" aria-hidden="true" />
                <p className="text-gray-700 leading-relaxed"><strong>{tip.title}</strong> {tip.content}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

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

      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Start Your Digital Marketing Conversation
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Ready to grow your online visibility and win more leads? Book a meeting or call our team in Visakhapatnam. We will look at where you are today and suggest clear next steps.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/contact" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
              <Calendar className="w-5 h-5" /> Request a Consultation
            </a>
            <a href="https://wa.me/919032845433?text=Hi%20Genie%20Media%2C%20I%27d%20like%20to%20discuss%20digital%20marketing." data-track="whatsapp_click" className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white font-semibold px-8 py-4 rounded-full transition-all duration-300">
              <MessageCircle className="w-5 h-5" /> Start a Project on WhatsApp
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
