import React, { useState } from "react";
import { ArrowRight, Sparkles, TrendingUp, Users, Award } from "lucide-react";
import "./HomePage.css";
import { WEBSITES_VIDEO_URL } from "../config/media";

import AboutUs from "../components/AboutSection";
import Contact from "../components/contactSection";
import VideoTestimonials2 from "../components/testimonials";
import TabbedServices from "../components/AllServices";
import GenieImg from "../assets/genieHeroImg.webp";

import meerabasu from "../assets/meerabasuWebsite.webp";
import AvanttaGems from "../assets/AvanttaGems.webp";
import KNS from "../assets/knsMetals.webp";
import laserFold from "../assets/LaserFold.webp";
import Wordpress from "../assets/wordpress.png";
import Shopify from "../assets/shopify.webp";
import Code from "../assets/code.png";
import Nuconaerospace from '../assets/nuconaerospace.webp'
import Synergene from '../assets/synergeneapi.webp'
import usePublishedProjects from "../hooks/usePublishedProjects";

// Offline safety net only — rendered if the projects API cannot be reached.
// The live portfolio comes from the database (see usePublishedProjects).
const FALLBACK_PROJECTS = [
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
const STATS = [
  { icon: Users, value: "150+", label: "Growth Campaigns" },
  { icon: Award, value: "98%", label: "Success Rate" },
  { icon: TrendingUp, value: "250%", label: "ROI Average" },
];

const HomePage = () => {
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
  const { projects: allProjects } = usePublishedProjects(FALLBACK_PROJECTS);
  const projects = allProjects.slice(0, HOME_PROJECTS_LIMIT);

  return (
    <>
      <section
        className="relative min-h-screen bg-white-200 overflow-hidden pt-20 pb-16 px-4 sm:px-6 lg:px-8"
        id="home"
      >
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="rotating-glow absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-orange-200 to-orange-100 rounded-full blur-3xl opacity-40"></div>
          <div
            className="rotating-glow absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-orange-300 to-orange-200 rounded-full blur-3xl opacity-30"
            style={{ animationDelay: "-10s" }}
          ></div>

          <Sparkles
            className="floating-sparkle absolute top-32 left-1/4 text-orange-400 opacity-60"
            size={24}
          />
          <Sparkles
            className="floating-sparkle hidden absolute  top-1/3 right-1/4 text-orange-500 opacity-50"
            size={20}
          />
          <Sparkles
            className="floating-sparkle absolute bottom-1/3 left-1/3 text-orange-400 opacity-70"
            size={28}
          />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="hero-content space-y-8 text-center lg:text-left mt-4">
              <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200 rounded-full mt-8">
                <Sparkles className="text-orange-500" size={16} />
                <span className="text-sm font-semibold text-orange-700 ">
                  Digital Marketing Agency in Vizag
                </span>
              </div>

              <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl xl:text-5xl font-extrabold leading-normal ">
                {/* Transform your digital presence with excellence */}
               Boost your growth with{" "} SEO services in Vizag
                {/* <span className="gradient-text">SEO services in Vizag</span>  */}
               

              </h1>
              <p className="hero-description text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                At Genie Media & Studio, we bring brands to life by combining
                thoughtful strategy with authentic, engaging storytelling. Each
                project seamlessly blends creativity, technology, and purposeful
                content-shaping digital experiences that stay clear, consistent,
                and aligned with the Digital marketing future, leaving a
                lasting impact.
              </p>

              <div className="hero-buttons flex flex-row sm:flex-row gap-4 w-80% justify-center lg:justify-start ">
                <a
                  href="/contact"
                  className="w-42 sm:w-56 btn-primary group relative px-5 py-4 text-black font-bold rounded-full text-base shadow-xl flex items-center justify-center gap-2 z-10"
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
                <button
                  className="w-42 sm:w-50 btn-secondary relative px-6 py-4 text-orange-700 font-bold rounded-full text-base flex items-center justify-center gap-2 z-10"
                  onClick={() => (window.location.href = "/projects")}
                >
                  See Portfolio
                </button>
              </div>

              <div className="hero-stats grid grid-cols-3 gap-4 pt-4">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="stat-card bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-orange-100 shadow-lg hover:shadow-2xl"
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

            <div className="hero-image relative">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full blur-3xl opacity-20 scale-110"></div>

                <div className="genie-image ">
                  {/* This is the Largest Contentful Paint element on desktop.
                      It must stay eager and high-priority: marking it lazy hid
                      it from the preload scanner and pushed LCP out by seconds.
                      It is `hidden` below lg, so a <link rel=preload> is
                      deliberately NOT used — that would download it on mobile
                      where it is never shown. */}
                  <img
                    src={GenieImg}
                    alt="Digital Marketing Genie"
                    className="hidden lg:block w-full h-[600px] rounded-3xl mt-8"
                    width="1000"
                    height="1000"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 animate-bounce ">
          <div className="w-6 h-10 border-2 border-orange-400 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      <section className={`relative bg-[#f9fafc] overflow-hidden ${showVideo ? 'py-10 md:py-14' : 'py-8 md:py-10'}`}>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p
            className="
            text-sm tracking-widest text-orange-700 font-semibold mb-6
            animate-fadeUp
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
            mb-8 animate-fadeUp animation-delay-200
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
            animate-fadeUp animation-delay-400
          `}
          >
           We craft best digital marketing near me journeys that feel natural, human, and memorable.
           From strategy to design and content, we help your brand rise above the noise, stay true to its voice,
           and build trust across every platform.
          </p>

          {showVideo && (
            <video
              src={WEBSITES_VIDEO_URL}
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
                    ›
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
                <div className="bg-orange-400   rounded-3xl p-0 md:p-0.5  mb-8 transition-transform duration-300 group-hover:scale-105">
                  <div className="overflow-hidden rounded-2xl aspect-[11/5]">
                    <img
                      src={project.image}
                      alt={`${project.name} website`}
                      width="1280"
                      height="582"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 boder-2 border-orange-500"
                    />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold mb-6">{project.name}</h3>

                <button
                  className="
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
                  onClick={() => project.url && window.open(project.url, "_blank")}
                >
                  VIEW PROJECT
                </button>
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
            <span className="text-xl font-bold">→</span>
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
