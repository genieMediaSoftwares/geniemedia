import {ChevronRight, ArrowUpRight, ChevronLeft, ChevronUp} from 'lucide-react';
import {React, useState} from 'react'
import DigitalMarketting1 from '../assets/DigitalMarketting.jpg'
import DigitalMarketing2 from '../assets/DigitalMarketing2.jpg'
import DM_services from '../assets/DM_services.jpg'


export default function DigitalMarketting() {

     const [isAnimating, setIsAnimating] = useState(false);
     const [openAccordion, setOpenAccordion] = useState(null);
     const [openFAQ, setOpenFAQ] = useState(null);
     const [currentIndex, setCurrentIndex] = useState(0);

    const services = [
      {
        title: 'SEO (Search Engine Optimization)',
        description: 'We improve your website\'s visibility on Google and other search engines. Our SEO work covers technical SEO, on-page optimization, local SEO for Vizag businesses, keyword research, and regular performance reporting through Google Search Console.',
        keywords: ['Technical SEO', 'On-page SEO', 'Local SEO', 'Keyword Research', 'Google Search Console'],
        link: '#seo'
      },
      {
        title: 'Google Ads & PPC',
        description: 'We run targeted paid search and display campaigns on Google. From search ads to remarketing, we set up conversion tracking, optimize landing pages, and monitor spend so every rupee works harder.',
        keywords: ['Search Campaigns', 'Display Ads', 'Remarketing', 'Conversion Tracking'],
        link: '#google-ads'
      },
      {
        title: 'Social Media Marketing',
        description: 'We manage your presence on Instagram, Facebook, and LinkedIn. Our team creates content calendars, designs creative posts, produces Reels, runs paid social campaigns, and reviews analytics to keep improving.',
        keywords: ['Instagram', 'Facebook', 'LinkedIn', 'Content Strategy', 'Reels', 'Paid Social'],
        link: '#social-media'
      },
      {
        title: 'Website Design & Development',
        description: 'We build business websites, landing pages, and e-commerce stores using WordPress, React, and custom code. Every site we deliver is mobile-friendly, fast, and built with SEO best practices from the start.',
        keywords: ['Business Websites', 'Landing Pages', 'WordPress', 'React', 'E-commerce'],
        link: '#web-development'
      },
      {
        title: 'Content Strategy & Branding',
        description: 'We write blog posts, plan content calendars, design logos, and create brand identity kits. Our content is written for your audience and optimized for search engines, so it works on both fronts.',
        keywords: ['Blogs & Articles', 'Content Calendars', 'Logo Design', 'Brand Identity'],
        link: '#branding'
      },
      {
        title: 'Email & Performance Marketing',
        description: 'We design and manage email campaigns that nurture leads and retain customers. Our approach ties email performance back to your broader marketing goals so every channel supports the next.',
        keywords: ['Email Campaigns', 'Lead Nurturing', 'Performance Tracking'],
        link: '#email-marketing'
      }
    ];

  const industries = [
    {
      icon: "🛒",
      title: "E-Commerce",
      description:
        "We build high-converting online stores and run marketing campaigns that drive traffic and sales. From product page optimization to checkout flows, we help e-commerce businesses grow their revenue."
    },
    {
      icon: "🏋️",
      title: "Fitness & Wellness",
      description:
        "From gym websites to fitness brand campaigns, we create digital experiences that motivate users, boost memberships, and strengthen engagement through clear messaging and targeted social media."
    },
    {
      icon: "🏭",
      title: "Industrial & Manufacturing",
      description:
        "We design websites and run lead-generation campaigns for industrial businesses in Vizag. Our work showcases capabilities clearly and connects you with the right B2B audience."
    },
    {
      icon: "🎓",
      title: "Education",
      description:
        "We create websites and digital marketing strategies for schools, coaching centers, and educational institutions that improve enrollment and make information easy for students and parents to find."
    },
    {
      icon: "🏠",
      title: "Real Estate",
      description:
        "We design property listing websites and run targeted ad campaigns for real estate businesses in Visakhapatnam, helping you attract qualified buyers and renters."
    },
    {
      icon: "🏥",
      title: "Healthcare",
      description:
        "We build patient-friendly websites and manage online presence for hospitals, clinics, and healthcare providers in Vizag, making it easier for patients to find and reach you."
    },
    {
      icon: "🍽️",
      title: "Hospitality & Restaurants",
      description:
        "From restaurant websites to social media campaigns, we help hospitality businesses in Vizag attract more customers with mouth-watering visuals, reservation systems, and targeted local ads."
    },
    {
      icon: "💼",
      title: "Professional Services",
      description:
        "We help consultants, lawyers, accountants, and other professionals in Visakhapatnam build authority online through content, SEO, and a polished digital presence."
    },
    {
      icon: "🚀",
      title: "Startups & Tech",
      description:
        "We partner with startups and tech companies in Vizag to establish their brand, drive user acquisition, and scale their online presence with lean, data-driven marketing strategies."
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

  const whyChooseUs = [
    {
      title: "Local Expertise, Global Standards",
      content: "We are based in Visakhapatnam and understand the Vizag market. Our team combines local market knowledge with industry-best practices to deliver digital marketing strategies that actually work for businesses in this region."
    },
    {
      title: "Full-Service Digital Marketing",
      content: "From SEO and Google Ads to social media, website development, and branding, we handle every part of your digital presence under one roof. You get a coordinated strategy, not disconnected tactics."
    },
    {
      title: "Transparent Reporting & Communication",
      content: "You will receive regular performance reports and direct access to your account manager. We explain what the numbers mean and what we plan to do next, so you always know where your investment is going."
    },
    {
      title: "Custom Strategies, Not Templates",
      content: "Every business is different. We research your market, competitors, and audience before building a plan tailored to your goals. No cookie-cutter packages, no one-size-fits-all solutions."
    },
    {
      title: "Results-Driven Approach",
      content: "We set clear KPIs at the start of every engagement and track them throughout. Our focus is on leads, conversions, and real business growth, not just vanity metrics like impressions and clicks."
    },
    {
      title: "Ongoing Optimization",
      content: (
        <>
          Digital marketing does not stand still. We continuously review campaign data, test new approaches, and refine your strategy. Read more about our thinking on{" "}
          <a href="/blogs" className="text-orange-700 underline underline-offset-2 hover:text-orange-900">our blog</a>, and see examples of our work in{" "}
          <a href="/projects" className="text-orange-700 underline underline-offset-2 hover:text-orange-900">our portfolio</a>.
        </>
      )
    }
  ];

  const processSteps = [
    { num: "01", title: "Understand Your Business", desc: "We learn about your goals, audience, and current digital presence." },
    { num: "02", title: "Research & Audit", desc: "We analyze your competitors, market, and existing online performance." },
    { num: "03", title: "Build the Strategy", desc: "We create a tailored plan covering the channels and tactics that fit your budget and timeline." },
    { num: "04", title: "Launch Campaigns", desc: "We implement SEO changes, ad campaigns, social content, and any website updates needed." },
    { num: "05", title: "Track Performance", desc: "We monitor key metrics daily and share weekly or monthly reports with you." },
    { num: "06", title: "Optimize Continuously", desc: "We refine campaigns based on real data to improve results over time." }
  ];

  const faqs = [
    {
      q: "What does a digital marketing agency in Vizag do?",
      a: "A digital marketing agency like Genie Media & Studio helps businesses in Vizag and Visakhapatnam grow their online presence. We handle SEO to improve Google rankings, run Google Ads and social media campaigns, build and optimize websites, create content, and develop brand identities. Our goal is to bring you more qualified leads and customers through digital channels."
    },
    {
      q: "How can digital marketing help my business in Visakhapatnam?",
      a: "Digital marketing puts your business in front of people actively searching for what you offer. For businesses in Visakhapatnam, local SEO helps you appear in 'near me' searches, Google Ads target people in Vizag looking for your services, and social media builds community around your brand. This leads to more foot traffic, phone calls, and online inquiries."
    },
    {
      q: "How long does SEO take to show results?",
      a: "SEO is a long-term strategy. Most businesses start seeing noticeable improvements in rankings and traffic within 3 to 6 months. The exact timeline depends on your industry, current website condition, and competition. We provide monthly reports so you can track progress from the first month."
    },
    {
      q: "Does Genie Media & Studio provide Google Ads management in Vizag?",
      a: "Yes, we manage Google Ads (PPC) campaigns for businesses in Vizag and across Visakhapatnam. We set up search campaigns, display campaigns, and remarketing, track conversions, and optimize your ad spend to maximize return on investment."
    },
    {
      q: "Do you build SEO-friendly websites in Vizag?",
      a: "Yes, every website we build follows SEO best practices from the start, including proper page structure, fast loading times, mobile responsiveness, and clean code. This gives your SEO efforts a solid foundation to build on."
    },
    {
      q: "How do I get started with Genie Media & Studio?",
      a: "Reach out through our contact page or call us at +91 90328 45433. We will schedule a free consultation to discuss your goals, review your current digital presence, and suggest a strategy that fits your needs and budget."
    }
  ];

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
   <>
      {/* Hero Section */}
      <div className="text-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 lg:px-16 pt-24 mt-12 sm:pt-24 pb-12 sm:pb-12 lg:pb-18">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6 text-left">
              <p className="text-sm font-semibold tracking-widest text-orange-400 uppercase">
                Digital Marketing Agency in Vizag
              </p>
              <h1 className="text-4xl sm:text-6xl lg:text-6xl font-bold tracking-tight leading-tight">
                Digital Marketing Services in Vizag for Growing Businesses
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-xl">
                Genie Media & Studio helps businesses in Visakhapatnam and across Andhra Pradesh grow online. We provide SEO, Google Ads, social media marketing, website development, and branding services tailored to local markets.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <a href="/contact" className="inline-block bg-orange-500 hover:bg-orange-600 text-black font-semibold px-8 py-3.5 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Get a Free Consultation
                </a>
                <a href="/services" className="inline-block border border-white/30 hover:border-white text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-300">
                  View All Services
                </a>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg lg:max-w-2xl">
                <div className="absolute inset-0 bg-cyan-400 opacity-20 blur-3xl rounded-full"></div>
                <img
                  src={DigitalMarketting1}
                  fetchPriority="high"
                  alt="Genie Media & Studio digital marketing services in Vizag covering SEO, social media, Google Ads, and branding"
                  className="relative rounded-2xl shadow-2xl w-full max-w-lg lg:max-w-2xl object-cover"
                  width="1000"
                  height="666"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Overview */}
      <section className="bg-white py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Digital Marketing Agency in Vizag
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Genie Media & Studio is a digital marketing company based in Visakhapatnam, Andhra Pradesh. We serve local businesses, startups, and established brands across Vizag and the surrounding region. Our team combines digital marketing expertise with knowledge of the local market to help you reach the right audience, generate quality leads, and grow your revenue.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Whether you need SEO to rank higher on Google, a social media strategy to engage your audience, a new website that converts visitors into customers, or a complete rebrand — we can help. Every strategy we build is custom, data-driven, and focused on measurable results.
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
              We offer a complete range of digital marketing services. Each one is delivered by our in-house team in Visakhapatnam, working from your brief to final reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{service.description}</p>
                <div className="flex flex-wrap gap-2">
                  {service.keywords.map((kw) => (
                    <span key={kw} className="text-xs font-medium bg-orange-50 text-orange-700 px-3 py-1 rounded-full">{kw}</span>
                  ))}
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
              Why Choose Genie Media & Studio?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We are a Visakhapatnam-based team that works closely with businesses in Vizag and across Andhra Pradesh. Here is what sets us apart.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {whyChooseUs.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-6 sm:p-8 hover:bg-gray-100 transition-colors duration-300"
              >
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

      {/* Section: Industries */}
      <section className="min-h-screen bg-gray-100 py-16 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-16">
            <div className="flex-1">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-orange-600 mb-6 leading-tight">
                Digital Marketing for Businesses in Vizag
              </h2>
              <p className="text-lg md:text-xl text-gray-800 leading-relaxed max-w-3xl">
                Every industry has different goals and customer expectations. As a digital marketing agency serving Visakhapatnam and Andhra Pradesh, we design strategies tailored to your sector. Here are some of the industries we work with.
              </p>
            </div>

            <div className="flex gap-3 self-start md:self-center lg:pt-10">
              <button
                onClick={prevSlide}
                disabled={isAnimating}
                className="bg-white hover:bg-gray-100 text-orange-500 p-4 rounded-full transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                aria-label="Previous industries"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
              <button
                onClick={nextSlide}
                disabled={isAnimating}
                className="bg-white hover:bg-gray-100 text-orange-500 p-4 rounded-full transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                aria-label="Next industries"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getVisibleCards().map((industry, idx) => (
                <div
                  key={`${industry.title}-${currentIndex}-${idx}`}
                  className="group bg-white rounded-3xl p-8 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-gray-100"
                  style={{
                    animation: `fadeIn 0.5s ease-out ${idx * 0.1}s both`
                  }}
                >
                  <div className="bg-orange-50 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                    <span className="text-3xl">{industry.icon}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {industry.title}
                    </h3>
                    <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {industry.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-12">
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
                  index === currentIndex
                    ? 'bg-orange-500 w-10 h-3'
                    : 'bg-gray-300 w-3 h-3 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </section>

      {/* Section: Our Process */}
      <section className="bg-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Digital Marketing Process
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Every project follows a clear, proven process. This keeps our work on track and ensures you see progress at every stage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {processSteps.map((step) => (
              <div key={step.num} className="relative">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-3xl font-bold text-orange-500">{step.num}</span>
                  <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed pl-16">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Why Choose Us Accordion */}
      <section className="bg-gray-50 py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              More Reasons to Work With Us
            </h2>
            <p className="text-lg text-gray-600">
              We believe in building long-term partnerships with the businesses we serve. Here is what you can expect when you work with Genie Media & Studio.
            </p>
          </div>

          <div className="space-y-4">
            {whyChooseUs.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full border-2 border-orange-500 flex items-center justify-center">
                        <span className="text-orange-500 text-xs font-bold">{String(index + 1).padStart(2, '0')}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {item.title}
                    </h3>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <ChevronUp
                      className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                        openAccordion === index ? 'transform rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openAccordion === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6 pt-2">
                    <p className="text-gray-600 leading-relaxed pl-12">
                      {item.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a href="/contact" className="inline-block bg-orange-500 hover:bg-orange-600 text-black font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
              Talk to Our Digital Marketing Team
            </a>
          </div>
        </div>
      </section>

      {/* Section: FAQ */}
      <section className="bg-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Answers to common questions about digital marketing services in Vizag.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.q}</h3>
                  <ChevronUp
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-300 ${
                      openFAQ === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFAQ === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: CTA */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Grow Your Business Online?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Book a free consultation with our digital marketing team in Visakhapatnam. We will review your current online presence and suggest a clear plan to help you reach more customers in Vizag and beyond.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/contact" className="inline-block bg-orange-500 hover:bg-orange-600 text-black font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
              Request a Free Consultation
            </a>
            <a href="tel:+919032845433" className="inline-block border border-white/30 hover:border-white text-white font-semibold px-8 py-4 rounded-full transition-all duration-300">
              Call +91 90328 45433
            </a>
          </div>
        </div>
      </section>
   </>
  )
}
