"use client";

import { ShoppingCart, Dumbbell, Factory, GraduationCap, House, Stethoscope, UtensilsCrossed, Briefcase, Rocket } from "lucide-react";
import React, { useState } from 'react';
import { ChevronRight, ArrowUpRight, ChevronLeft, ChevronUp, CheckCircle, Phone, Calendar, Mail, MapPin } from 'lucide-react';
import DigitalMarketting1Asset from "@/assets/DigitalMarketting.jpg";
import DigitalMarketing2Asset from "@/assets/DigitalMarketing2.jpg";
import DM_servicesAsset from "@/assets/DM_services.jpg";

const DigitalMarketting1 = DigitalMarketting1Asset.src;
const DigitalMarketing2 = DigitalMarketing2Asset.src;
const DM_services = DM_servicesAsset.src;
export default function DigitalMarketting() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const services = [
    {
      id: "seo",
      title: "SEO Services in Vizag",
      subtitle: "Search Engine Optimization & Organic Growth",
      description: "Our search engine optimization (SEO) services help your business achieve higher visibility on Google search engine results pages (SERP). We execute comprehensive SEO strategies tailored for local businesses in Visakhapatnam and regional brands, covering technical SEO, on-page SEO, local SEO for Vizag, keyword research, content optimization, and performance tracking via Google Search Console.",
      keywords: ["SEO Services in Vizag", "Search Engine Optimization", "Organic Traffic", "Local SEO", "Technical SEO", "SEO Company in Vizag"],
      link: "/blogs"
    },
    {
      id: "google-ads",
      title: "Google Ads & PPC Management",
      subtitle: "Paid Search & High-Conversion Campaigns",
      description: "As a data-driven digital marketing company, we design and manage conversion-focused Google Ads and pay-per-click (PPC) campaigns. From paid search advertising to display ads and remarketing, our digital marketing specialists set up conversion tracking, craft compelling ad copy, optimize landing pages, and continuously refine spend to deliver strong return on investment (ROI).",
      keywords: ["Google Ads Management", "PPC Management", "Paid Search", "Paid Media", "Conversion Rate", "ROI-Driven Ads"],
      link: "/contact"
    },
    {
      id: "social-media",
      title: "Social Media Marketing",
      subtitle: "Brand Storytelling & Community Engagement",
      description: "We build and execute engaging social media marketing campaigns across Instagram, Facebook, and LinkedIn. Our creative team develops structured content calendars, designs high-impact imagery, produces short-form video Reels, and manages paid social advertising to amplify your brand story, engage your target audience, and turn followers into loyal customers.",
      keywords: ["Social Media Marketing in Vizag", "Instagram Ads", "Facebook Campaigns", "LinkedIn Marketing", "Brand Engagement"],
      link: "/contact"
    },
    {
      id: "web-development",
      title: "Website Design & Development",
      subtitle: "Responsive, Fast & SEO-Friendly Web Applications",
      description: "A high-performing website is the foundation of digital marketing. As a leading web design agency in Visakhapatnam, our website designers and developers build custom business websites, landing pages, and e-commerce stores. Every site features responsive web design, rapid load speeds, intuitive user experience (UX), and SEO best practices built in from day one.",
      keywords: ["Website Design in Vizag", "Web Design Agency", "Responsive Web Design", "Website Developer", "E-Commerce Stores"],
      link: "/web_development"
    },
    {
      id: "branding",
      title: "Branding & Creative Services",
      subtitle: "Brand Identity, Positioning & Visual Communication",
      description: "We help companies establish a distinct visual identity and market positioning. Our branding specialists craft brand identity kits, design custom logos, establish brand guidelines, write persuasive website messaging, and create creative visual communication assets that distinguish your business from competitors.",
      keywords: ["Branding Strategy", "Brand Identity", "Logo Design", "Creative Messaging", "Visual Communication"],
      link: "/contact"
    },
    {
      id: "performance-marketing",
      title: "Email & Performance Marketing",
      subtitle: "Lead Nurturing & Revenue Optimization",
      description: "We create automated email marketing workflows and performance marketing campaigns that nurture prospective leads into repeat customers. Our approach integrates email outreach, audience segmentation, conversion optimization, and analytics to ensure every channel works seamlessly toward your business growth targets.",
      keywords: ["Email Marketing", "Lead Nurturing", "Performance Tracking", "Customer Retention", "Analytics"],
      link: "/contact"
    }
  ];

  const industries = [
    {
      icon: ShoppingCart,
      title: "E-Commerce & Retail",
      description: "We build high-converting online stores and run multi-channel digital marketing campaigns that drive qualified product traffic, decrease abandoned carts, and boost revenue."
    },
    {
      icon: Dumbbell,
      title: "Fitness & Wellness",
      description: "From gym websites to wellness brand campaigns, we craft engaging digital strategies that drive local memberships, build active communities, and elevate your fitness brand."
    },
    {
      icon: Factory,
      title: "Industrial & Manufacturing",
      description: "We design polished B2B websites and execute lead-generation campaigns for industrial and manufacturing enterprises in Visakhapatnam, connecting you with commercial partners."
    },
    {
      icon: GraduationCap,
      title: "Education & Coaching",
      description: "We build user-friendly websites and run targeted ad campaigns for schools, colleges, and coaching institutes in Vizag to boost prospective student enrollments."
    },
    {
      icon: House,
      title: "Real Estate & Construction",
      description: "We design property showcase websites and run targeted local Google Ads and Facebook campaign ads for real estate developers and property agencies in Visakhapatnam."
    },
    {
      icon: Stethoscope,
      title: "Healthcare & Clinics",
      description: "We build patient-centric websites and manage local search visibility for hospitals, specialized clinics, and diagnostic centers across Vizag to connect with local patients."
    },
    {
      icon: UtensilsCrossed,
      title: "Hospitality & Restaurants",
      description: "From restaurant websites to social media video showcases, we help hospitality businesses in Vizag attract food enthusiasts and tourists with targeted local advertising."
    },
    {
      icon: Briefcase,
      title: "Professional Services",
      description: "We assist legal firms, financial consultants, corporate advisors, and accounting firms in Visakhapatnam in building authority through strategic content, SEO, and web design."
    },
    {
      icon: Rocket,
      title: "Startups & Tech",
      description: "We partner with technology startups and emerging ventures in Andhra Pradesh to establish their brand identity, acquire early users, and scale their online presence."
    }
  ];

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % industries.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + industries.length) % industries.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const getVisibleCards = () => {
    const cards = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % industries.length;
      cards.push(industries[index]);
    }
    return cards;
  };

  const strategySteps = [
    { num: "01", title: "Business & Audience Research", desc: "We analyze your business goals, target audience demographics, competitive landscape in Vizag, and current online visibility." },
    { num: "02", title: "SEO & Search Analysis", desc: "Our team performs technical site audits, competitor keyword analysis, and local search intent mapping for Visakhapatnam." },
    { num: "03", title: "Strategy Development", desc: "We craft a multi-channel digital marketing plan covering organic search, paid advertising, content planning, and social media." },
    { num: "04", title: "Content Planning & Messaging", desc: "We develop engaging brand messaging, visual assets, blog content plans, and ad copy tailored for your audience." },
    { num: "05", title: "Campaign Implementation", desc: "Our specialists set up search ads, paid social campaigns, tracking scripts, and technical website optimizations." },
    { num: "06", title: "Website Optimization", desc: "We optimize landing page UX, page speed, mobile responsiveness, and call-to-action pathways for maximum conversion." },
    { num: "07", title: "Paid Media Execution", desc: "We launch targeted Google Ads, PPC, display, and social media campaigns with precise geographic and interest targeting." },
    { num: "08", title: "Social Media Engagement", desc: "We publish creative posts, Reels, and community messaging on Instagram, Facebook, and LinkedIn." },
    { num: "09", title: "Performance Measurement", desc: "We monitor daily campaign data, conversion metrics, organic rankings, and traffic quality through analytics tools." },
    { num: "10", title: "Continuous Optimization", desc: "We refine targeting, ad spend, keyword optimization, and landing pages to ensure sustainable business growth and high ROI." }
  ];

  const whyChooseUs = [
    {
      title: "Experienced Team of Specialists",
      content: "Our team consists of experienced website designers, developers, digital marketing specialists, and strategists. We bring specialized discipline and technical expertise to every campaign."
    },
    {
      title: "Deep Local Market Understanding",
      content: "Based in Visakhapatnam, we understand the local business environment in Vizag, buyer behaviors across Andhra Pradesh, and effective regional market positioning."
    },
    {
      title: "Data-Driven Approach for Maximum ROI",
      content: "We make decisions based on analytics, traffic data, conversion tracking, and campaign insights rather than guesswork. Every strategy is engineered for measurable business growth."
    },
    {
      title: "Integrated Full-Service Capabilities",
      content: (
        <>
          From search engine optimization and Google Ads to web design and media production, we manage all digital touchpoints under one roof. Explore our{" "}
          <a href="/web_development" className="text-orange-600 font-medium underline hover:text-orange-800">website development services</a>, visit our{" "}
          <a href="/podcast_studio" className="text-orange-600 font-medium underline hover:text-orange-800">podcast studio</a>, or learn more{" "}
          <a href="/about" className="text-orange-600 font-medium underline hover:text-orange-800">about Genie Media & Studio</a>.
        </>
      )
    },
    {
      title: "Customized Strategies, Never Cookie-Cutter Templates",
      content: "We tailor our digital marketing and web design strategies to your unique business model, industry challenges, and budget requirements for maximum impact."
    },
    {
      title: "Transparent Reporting & Proven Results",
      content: (
        <>
          We share detailed performance reports clearly outlining your keyword rankings, traffic growth, and conversion metrics. See examples in{" "}
          <a href="/projects" className="text-orange-600 font-medium underline hover:text-orange-800">our projects portfolio</a> and read{" "}
          <a href="/reviews" className="text-orange-600 font-medium underline hover:text-orange-800">client reviews and testimonials</a>.
        </>
      )
    }
  ];

  const faqs = [
    {
      q: "What does a digital marketing agency in Vizag do?",
      a: "A digital marketing agency like Genie Media & Studio helps businesses in Vizag and Visakhapatnam grow their online presence. We handle search engine optimization (SEO) to improve Google rankings, manage Google Ads and PPC campaigns, build websites, run social media marketing, create content, and develop brand identities."
    },
    {
      q: "What digital marketing services does Genie Media & Studio provide?",
      a: "We provide comprehensive digital marketing services in Visakhapatnam, including Search Engine Optimization (SEO), Google Ads & PPC management, social media marketing on Instagram, Facebook, and LinkedIn, website design & development, branding strategy, and performance email marketing."
    },
    {
      q: "Do you provide SEO services in Vizag?",
      a: "Yes, we offer specialized SEO services in Vizag. Our work includes technical SEO audits, on-page optimization, local SEO for Visakhapatnam businesses, keyword research, quality backlinking, and continuous tracking through Google Search Console."
    },
    {
      q: "Do you manage Google Ads and PPC campaigns?",
      a: "Yes, as a performance-driven digital marketing company in Vizag, we set up, manage, and optimize Google Ads and pay-per-click (PPC) search and display campaigns to drive qualified traffic and maximize conversion ROI."
    },
    {
      q: "Do you provide social media marketing?",
      a: "Yes, we deliver full social media marketing services. We plan content strategy, design creative graphics, edit video Reels, run paid social ad campaigns on Instagram, Facebook, and LinkedIn, and engage your target audience."
    },
    {
      q: "Do you build websites?",
      a: "Yes, our team of website designers and developers builds fast, responsive websites, landing pages, and e-commerce platforms using WordPress, React, and custom code with built-in SEO standards."
    },
    {
      q: "Do you provide local SEO for Visakhapatnam businesses?",
      a: "Yes, we specialize in local SEO for Visakhapatnam businesses. We optimize your Google Business Profile, local citations, and geo-targeted keywords so nearby customers in Vizag, Yendada, MVP Colony, Gajuwaka, and Madhurawada find you easily."
    },
    {
      q: "How does digital marketing help businesses grow?",
      a: "Digital marketing puts your business directly in front of potential customers actively searching for your services online. It increases brand awareness, drives organic and paid web traffic, generates qualified inquiries, and delivers measurable ROI."
    },
    {
      q: "How can I contact Genie Media & Studio?",
      a: "You can contact Genie Media & Studio by filling out our online form, booking a meeting, emailing admin@geniemedia.in, or calling us directly at +91 90328 45433 to discuss your digital marketing project."
    }
  ];

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <main data-seo-content="true">
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
                Genie Media & Studio provides comprehensive digital marketing services for businesses in Vizag, Visakhapatnam, and across Andhra Pradesh. We combine strategic search engine optimization (SEO), targeted Google Ads, engaging social media marketing, web design, and brand strategy to drive measurable business growth.
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
                  alt="Genie Media & Studio digital marketing team working on a campaign strategy in Visakhapatnam"
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
              Genie Media & Studio is a trusted digital marketing company based in Visakhapatnam, Andhra Pradesh. We partner with local businesses, regional companies, and national brands seeking to elevate their online presence to new heights. Our experienced team of digital marketing specialists, web designers, developers, and content strategists delivers customized, data-driven solutions built around your specific commercial goals.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Whether your goal is to rank higher on Google SERP through targeted SEO services in Vizag, generate instant qualified leads with Google Ads and PPC management, cultivate a loyal social media audience, or build a fast responsive website — we provide the full spectrum of online marketing discipline.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Learn more <a href="/about" className="text-orange-600 font-medium underline hover:text-orange-800">about Genie Media & Studio</a>, explore <a href="/projects" className="text-orange-600 font-medium underline hover:text-orange-800">our portfolio of work</a>, or read our latest <a href="/blogs" className="text-orange-600 font-medium underline hover:text-orange-800">digital marketing insights</a>.
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
              We offer a complete suite of specialized digital marketing services tailored for local, regional, and national growth.
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
                    Learn More <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Digital Marketing for Businesses in Vizag */}
      <section className="bg-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Digital Marketing for Businesses in Vizag & Visakhapatnam
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                Visakhapatnam is rapidly emerging as a dynamic hub for commercial enterprises, industrial growth, technology startups, and professional service providers. To compete effectively, local businesses in Vizag require a strategic online marketing approach that connects with regional search intent and targeted demographic behavior.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                At Genie Media & Studio, we specialize in helping local companies build strong online visibility. From local search optimization and Google Maps positioning to targeted social media campaigns, we help you capture nearby customers when they are actively seeking your products or services.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700"><strong>Local Visibility:</strong> Dominating 'near me' search queries across Vizag, Yendada, Dwaraka Nagar, and MVP Colony.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700"><strong>Audience Targeting:</strong> Connecting with consumer and B2B buyers across Visakhapatnam and Andhra Pradesh.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700"><strong>Measurable Growth:</strong> Delivering trackable inquiry volume, foot traffic, and digital ROI.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src={DigitalMarketing2}
                alt="Genie Media & Studio digital marketing agency team managing campaigns in Visakhapatnam"
                className="rounded-2xl shadow-xl w-full max-w-lg object-cover"
                width={800}
                height={533}
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
              Our structured 10-step digital marketing process ensures disciplined strategy execution, continuous optimization, and measurable ROI.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
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
              Why Businesses Choose Genie Media & Studio
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We combine creative storytelling, technical web development expertise, and rigorous data analysis to help your business thrive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 sm:p-8 hover:bg-gray-100 transition-colors duration-300">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    <div className="text-gray-600 leading-relaxed">{item.content}</div>
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
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-12">
            <div className="flex-1">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-orange-400 mb-4 leading-tight">
                Industries We Serve
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed max-w-3xl">
                As a versatile digital marketing agency in Visakhapatnam, we tailor marketing strategies to the unique audience expectations of diverse sectors.
              </p>
            </div>

            <div className="flex gap-3 self-start md:self-center">
              <button
                onClick={prevSlide}
                disabled={isAnimating}
                className="bg-slate-800 hover:bg-slate-700 text-orange-400 p-3.5 rounded-full transition-all duration-300 disabled:opacity-50"
                aria-label="Previous industries"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={nextSlide}
                disabled={isAnimating}
                className="bg-slate-800 hover:bg-slate-700 text-orange-400 p-3.5 rounded-full transition-all duration-300 disabled:opacity-50"
                aria-label="Next industries"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getVisibleCards().map((industry, idx) => (
              <div key={`${industry.title}-${currentIndex}-${idx}`} className="bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-orange-500 transition-all duration-300">
                <div className="bg-slate-700/50 rounded-full w-14 h-14 flex items-center justify-center mb-6 text-2xl">
                  <industry.icon className="w-7 h-7 text-orange-400" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{industry.title}</h3>
                <p className="text-gray-300 leading-relaxed">{industry.description}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {industries.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isAnimating) {
                    setIsAnimating(true);
                    setCurrentIndex(index);
                    setTimeout(() => setIsAnimating(false), 500);
                  }
                }}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex ? 'bg-orange-500 w-8 h-2.5' : 'bg-slate-700 w-2.5 h-2.5 hover:bg-slate-600'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section: Portfolio & Case Studies */}
      <section className="bg-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Work & Portfolio
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore custom websites, branding projects, and digital campaigns built by Genie Media & Studio for clients in India, Australia, and global markets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Delivering Real Results for Growth Brands</h3>
              <p className="text-gray-600 leading-relaxed">
                From technical website redesigns to lead generation and paid search campaigns, our work focuses on clear business outcomes, brand positioning, and digital performance.
              </p>
              <div className="pt-2">
                <a href="/projects" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-full transition-all">
                  View Complete Portfolio <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
            <div>
              <img
                src={DM_services}
                alt="Genie Media & Studio digital marketing services overview showcase image"
                className="rounded-2xl shadow-lg w-full object-cover"
                width={800}
                height={533}
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
            If you are searching for a digital marketing agency near me or an SEO company near me in Visakhapatnam, Genie Media & Studio offers accessible local consultation. Located at KP Icon in Yendada, Visakhapatnam, we work closely with nearby businesses across Vizag, Madhurawada, Dwaraka Nagar, MVP Colony, Gajuwaka, and surrounding Andhra Pradesh regions.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            Whether you need a web design company near me, website developer near me, or a dedicated team for Google Ads management and social media marketing in Vizag, our team is ready to discuss your goals.
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
                Beyond traditional digital marketing, Genie Media operates a professional <a href="/podcast_studio" className="font-bold underline hover:opacity-100">podcast studio in Visakhapatnam</a> equipped with multi-camera setups, high-grade audio mics, and a complete <a href="/production_house" className="font-bold underline hover:opacity-100">video production house</a> for corporate videos, commercial shoots, and live streaming.
              </p>
            </div>
            <div className="flex justify-start lg:justify-end">
              <a href="/podcast_studio" className="bg-black hover:bg-slate-900 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300">
                Book Studio Slot
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
              Clear answers to common questions regarding digital marketing services in Vizag and Visakhapatnam.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.q}</h3>
                  <ChevronUp className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-300 ${openFAQ === index ? 'transform rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFAQ === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Get Started (CTA) */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Get Started with Digital Marketing in Vizag
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Ready to grow your online visibility, capture qualified leads, and elevate your brand? Book a meeting or call our digital marketing team in Visakhapatnam to request a consultation.
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
    </main>
  );
}
