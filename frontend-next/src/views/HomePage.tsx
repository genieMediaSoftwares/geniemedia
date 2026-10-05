"use client";

import { ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { ArrowRight, Sparkles, Layers, Mic, Globe } from "lucide-react";
import { WEBSITES_VIDEO_URL } from "@/config/media";

import AboutUs from "@/components/AboutSection";
import Contact from "@/components/contactSection";
import VideoTestimonials2 from "@/components/testimonials";
import TabbedServices from "@/components/AllServices";
import GenieImgAsset from "@/assets/genieHeroImg.webp";
import meerabasuAsset from "@/assets/meerabasuWebsite.webp";
import AvanttaGemsAsset from "@/assets/AvanttaGems.webp";
import KNSAsset from "@/assets/knsMetals.webp";
import laserFoldAsset from "@/assets/LaserFold.webp";
import WordpressAsset from "@/assets/wordpress.png";
import ShopifyAsset from "@/assets/shopify.webp";
import CodeAsset from "@/assets/code.png";
import NuconaerospaceAsset from "@/assets/nuconaerospace.webp";
import SynergeneAsset from "@/assets/synergeneapi.webp";
import type { PortfolioItem } from "@/types";
import { portfolioOrFallback, serviceForCategory } from "@/lib/portfolio";
import { useLatestProjects } from "@/lib/liveData";

const GenieImg = GenieImgAsset.src;
const meerabasu = meerabasuAsset.src;
const AvanttaGems = AvanttaGemsAsset.src;
const KNS = KNSAsset.src;
const laserFold = laserFoldAsset.src;
const Wordpress = WordpressAsset.src;
const Shopify = ShopifyAsset.src;
const Code = CodeAsset.src;
const Nuconaerospace = NuconaerospaceAsset.src;
const Synergene = SynergeneAsset.src;

// Offline safety net only — rendered if the projects API cannot be reached.
// The live portfolio comes from the database (fetched on the server, see src/lib/api/projects.ts).
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
    name: "Nucon Aerospace - by Snapbrio",
    image: Nuconaerospace,
    url: "https://www.nuconaerospace.com/",
  },
  {
    name: "Synergene - by Snapbrio",
    image: Synergene,
    url: "https://synergeneapi.com/",
  },
];

// The home page shows a preview of the portfolio — "View More Projects"
// links to /projects where the full list is rendered.
const HOME_PROJECTS_LIMIT = 6;

// Static presentation data — hoisted out of the component so the arrays are not
// re-allocated on every render.
//
// Every figure here must be checkable against the site itself: the four
// service pages, the studio's one-hour rate in components/StudioBooking.jsx,
// and the portfolio's clients in India, Australia and the US. Unverifiable
// performance claims (success rates, ROI averages) used to sit here.
const STATS = [
  { icon: Layers, value: "4", label: "Service Lines" },
  { icon: Mic, value: "₹1,500", label: "Podcast Studio / hour" },
  { icon: Globe, value: "3", label: "Countries Served" },
];


/* ── Tailwind class sets (formerly HomePage.css) ───────────────────────── */

// Gradient CTA: lifts and grows on hover while a soft circle expands inside.
// (Reproduces the original cascade of the old Header.css + HomePage.css rules.)
const HOME_BTN_PRIMARY =
  "relative overflow-hidden bg-[linear-gradient(135deg,#FF6B00,#FF8C3A)] transition-all duration-[400ms] ease-in-out hover:[transform:translateY(-4px)_scale(1.05)] hover:shadow-[0_15px_40px_rgba(255,107,0,0.5)] before:content-[''] before:absolute before:left-1/2 before:top-1/2 before:h-0 before:w-0 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-white/30 before:[transition:width_0.6s_ease,height_0.6s_ease] hover:before:left-full hover:before:h-[300px] hover:before:w-[300px]";

// White outlined CTA that fills orange from the top on hover.
const HOME_BTN_SECONDARY =
  "relative overflow-hidden !border-2 !border-solid !border-black !bg-white !text-black [transition-property:transform,box-shadow,color,background-color] duration-300 ease-in-out hover:!text-white hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,107,0,0.3)] before:content-[''] before:absolute before:left-1/2 before:top-0 before:z-[-1] before:h-0 before:w-0 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-[linear-gradient(135deg,#FF6B00,#FF8C3A)] before:[transition:width_0.7s_ease,height_0.8s_ease] hover:before:h-[300px] hover:before:w-[300px]";

const STAT_CARD =
  "transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(255,107,0,0.2)]";

const heroLink = "text-orange-700 underline decoration-orange-300 underline-offset-4 hover:text-orange-900";

const HomePage = ({ initialProjects }: { initialProjects: PortfolioItem[] | null }) => {
  const [videoError, setVideoError] = useState(false);
  const showVideo = Boolean(WEBSITES_VIDEO_URL) && !videoError;

  const stats = STATS;

  const steps = [
    {
      step: "Step 01",
      title: "Research & Planning",
      desc: "We analyze user needs, business goals, and industry benchmarks using advanced tools to build a clear, scalable websites .",
      active: false,
    },
    {
      step: "Step 02",
      title: "Design & Implementation",
      desc: "Our team designs and develops a high-performance website using smart strategiesand modern technologies.",
      active: true,
    },
    {
      step: "Step 03",
      title: "Results & Growth",
      desc: "We track performance, analyze real user data, and refine strategies to ensure continuous growth and long-term success.",
      active: false,
    },
  ];

  // Published projects come from the database — admins manage them in
  // Admin Panel → Projects. No code change is needed to add a new one.
  // Build-time list first, then the latest from the API (new projects show without a rebuild).
  const liveProjects = useLatestProjects(initialProjects);
  const allProjects = portfolioOrFallback(liveProjects, FALLBACK_PROJECTS);
  const projects = allProjects.slice(0, HOME_PROJECTS_LIMIT);

  return (
    <>
      <section
        className="relative min-h-screen bg-white-200 overflow-hidden pt-20 pb-16 px-4 sm:px-6 lg:px-8"
        id="home"
      >
        {/* Background Decorative Elements */}
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
            {/* Left Content */}
            <div className="animate-home-content motion-reduce:animate-none space-y-8 text-center lg:text-left mt-4">
              <div className="animate-home-badge motion-reduce:animate-none inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200 rounded-full mt-8">
                <Sparkles className="text-orange-500" size={16} />
                <span className="text-sm font-semibold text-orange-700 ">
                  Genie Media &amp; Studio · Visakhapatnam
                </span>
              </div>

              {/* The home page names the company, what it does and where. The
                  service pages each own their specific search terms, so this
                  deliberately does not target one service. */}
              <h1 className="animate-home-rise motion-reduce:animate-none text-4xl sm:text-5xl lg:text-6xl xl:text-5xl font-extrabold leading-normal ">
                Digital Marketing, Podcast Studio &amp; Video Production in Vizag
              </h1>
              <p className="animate-home-rise motion-reduce:animate-none text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Genie Media &amp; Studio is a digital marketing and media company
                in Visakhapatnam. We run{" "}
                <a href="/digital_marketing" className={heroLink}>SEO, social media and ad campaigns</a>,{" "}
                <a href="/web_development" className={heroLink}>build websites</a>,{" "}
                <a href="/production_house" className={heroLink}>shoot brand videos</a>{" "}
                and rent out our{" "}
                <a href="/podcast_studio" className={heroLink}>podcast studio</a>.
              </p>

              <div className="animate-home-buttons motion-reduce:animate-none flex flex-row sm:flex-row gap-4 w-80% justify-center lg:justify-start ">
                <a
                  href="/contact"
                  className={`w-42 sm:w-56 ${HOME_BTN_PRIMARY} group px-5 py-4 text-black font-bold rounded-full text-base shadow-xl flex items-center justify-center gap-2 z-10`}
                  onClick={() =>
                    (window.location.href = "https://wa.me/919032845433")
                  }
                >
                  Get Started
                  <ArrowRight
                    className="group-hover:translate-x-1 transition-transform"
                    size={20}
                  />
                </a>
                <a
                  href="/projects"
                  className={`w-42 sm:w-50 ${HOME_BTN_SECONDARY} px-6 py-4 font-bold rounded-full text-base flex items-center justify-center gap-2 z-10`}
                >
                  See Portfolio
                </a>
              </div>

              <div className="animate-home-stats motion-reduce:animate-none grid grid-cols-3 gap-4 pt-4">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className={`${STAT_CARD} bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-orange-100 shadow-lg`}
                  >
                    <stat.icon
                      className="text-orange-500 mb-2 mx-auto lg:mx-0"
                      size={24}
                    />
                    <div className="font-bold text-2xl text-gray-800">
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-home-image motion-reduce:animate-none relative">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full blur-3xl opacity-20 scale-110"></div>

                <div className="animate-home-float max-[768px]:animate-home-float-slow motion-reduce:animate-none">
                  {/* This is the Largest Contentful Paint element on desktop.
                      It must stay eager and high-priority: marking it lazy hid
                      it from the preload scanner and pushed LCP out by seconds.
                      It is `hidden` below lg, where a display:none <img> still
                      downloads. The <source> hands phones and tablets a 1px
                      inline placeholder instead, so the 42 KiB image is only
                      fetched on screens that show it — no bytes competing with
                      the mobile LCP (the headline). */}
                  <picture>
                    <source
                      media="(max-width: 1023.98px)"
                      srcSet="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                    />
                    <img
                      src={GenieImg}
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

        {/* Scroll Indicator */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 animate-bounce ">
          <div className="w-6 h-10 border-2 border-orange-400 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-orange-500 rounded-full animate-home-pulse motion-reduce:animate-none"></div>
          </div>
        </div>
      </section>

      <section className={`relative bg-[#f9fafc] overflow-hidden ${showVideo ? 'py-10 md:py-14' : 'py-8 md:py-10'}`}>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p
            className="
            text-sm tracking-widest text-orange-700 font-semibold mb-6
           
          "
          >
            CREATIVE & STRATEGIC DIGITAL MARKETING COMPANY
          </p>

          {/* h2, not h1 — the page already has its h1 in the hero above. The
              Tailwind classes keep the rendered size identical. */}
          <h2
            className="
            text-2xl md:text-5xl lg:text-5xl
            font-extrabold leading-tight text-gray-900
            mb-8
          "
          >
           We Build SERPs in Digital Marketing
            <br />
           That Connect & Grow Brands
          </h2>

          <p
            className={`
            max-w-3xl mx-auto text-lg text-gray-600
            leading-relaxed ${showVideo ? 'mb-12' : 'mb-0'}
           
          `}
          >
           We craft digital marketing journeys that feel natural, human, and memorable.
           From strategy to design and content, we help your brand rise above the noise, stay true to its voice,
           and build trust across every platform.
          </p>

          {showVideo && (
            <video
              src={WEBSITES_VIDEO_URL ?? undefined}
              muted
              autoPlay
              loop
              playsInline
              preload="none"
              onError={() => setVideoError(true)}
              className="w-full h-auto rounded-xl mt-8"
            ></video>
          )}
        </div>
      </section>

      <AboutUs />

      <section className="bg-white py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4 ">
            <span className="w-8 h-[1px] bg-[#F7F7F7]"></span>
            <p className="text-orange-600 text-center font-medium text-2xl sm:text-4xl uppercase tracking-wide">
              How It Works
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {steps.map((item, index) => (
              <div key={item.step} className="relative">
                {index !== 2 && (
                  <span className="hidden md:block absolute -right-7 top-1/2 -translate-y-1/2 text-5xl text-gray-700">
                    <ChevronRight className="w-12 h-12" aria-hidden="true" />
                  </span>
                )}

                {/* Card */}
                <div
                  className={`
                  h-full rounded-xl p-10 text-center transition-all duration-300
                  ${
                    item.active
                      ? "bg-orange-400 text-black scale-105"
                      : "bg-[#0B1220] text-white"
                  }
                `}
                >
                  <p
                    className={`text-lg font-medium mb-4 
                    ${item.active ? "text-black/70" : "text-orange-600"}`}
                  >
                    {item.step}
                  </p>

                  <h3 className="text-2xl font-bold mb-6">{item.title}</h3>

                  <div
                    className={`w-14 h-[1px] mx-auto mb-6 
                    ${item.active ? "bg-black/30" : "bg-gray-700"}`}
                  />

                  <p
                    className={`text-base leading-relaxed
                    ${item.active ? "text-black/100" : "text-gray-100"}`}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TabbedServices />

      <section className="bg-white py-8 md:py-12" id="projects">
        <div className="max-w-7xl mx-auto px-2">
          <h2 className="text-center text-4xl md:text-5xl font-bold text-gray-700 mb-10">
            Your Digital Presence, Perfected
          </h2>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12">
            {projects.map((project, index) => (
              <div key={project.id ?? index} className="text-center group">
                <div className="rounded-3xl p-0 md:p-0.5 mb-8 transition-transform duration-300 group-hover:scale-105">
                  <div className="overflow-hidden rounded-2xl aspect-[11/5]">
                    <img
                      src={project.image}
                      alt={`${project.name} website`}
                      width="1280"
                      height="582"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>

                {/* Title */}
                <h3 className={`text-xl font-semibold ${serviceForCategory(project.category) ? "mb-2" : "mb-6"}`}>{project.name}</h3>

                {/* The service behind the project, linked to its page. */}
                {serviceForCategory(project.category) && (
                  <a
                    href={serviceForCategory(project.category)?.href}
                    className="inline-block mb-5 text-sm font-medium text-orange-700 underline underline-offset-2 hover:text-orange-900"
                  >
                    {serviceForCategory(project.category)?.label}
                  </a>
                )}

                <div>
                {/* A real link so crawlers see which live sites the portfolio
                    points to; it opens in a new tab as the button used to. */}
                {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener"
                  className="
                inline-block
                px-8 py-3
                rounded-full
                font-semibold
                border-2 border-orange-400
                text-white
                bg-gray-900
                hover:bg-orange-400
                hover:text-black
                transition-all duration-300
              "
                >
                  VIEW PROJECT
                </a>
                )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-6">
            <a
              href="/projects"
              className="
    px-6 py-2 
    rounded-full 
    font-semibold 
    border-2 border-orange-400
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
        <h2 className="text-center text-4xl font-bold mb-16">
          Platforms we use
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-center gap-20 mb-12">
          <img
            src={Wordpress}
            alt="WordPress"
            width="225"
            height="225"
            className="w-28 md:w-32 hover:scale-110 transition-transform duration-300 -mb-8"
            loading="lazy"
            decoding="async"
          />
          <img
            src={Shopify}
            alt="Shopify"
            width="1302"
            height="1400"
            className="w-40 md:w-42 hover:scale-110 transition-transform duration-300 -mb-8"
            loading="lazy"
            decoding="async"
          />
          <img
            src={Code}
            alt="Custom code development"
            width="259"
            height="194"
            className="w-36 md:w-48 hover:scale-110 transition-transform duration-300"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="max-w-4xl mx-auto text-center px-4">
          <p className="text-xl md:text-2xl font-semibold text-gray-800 leading-relaxed mb-8">
          If you're looking for digital marketing agencies in Vizag that elevate your brand with creativity, strategy, and innovation, then you’re ready for us.

          </p>

          <button
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
            onClick={() =>
              (window.location.href = "https://wa.me/919032845433")
            }
          >
            Need help to upscale your brand
            <ArrowRight className="w-5 h-7" strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>

        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02),transparent_70%)]" />
      </section>

      <VideoTestimonials2 />
      <Contact />
    </>
  );
};

export default HomePage;
