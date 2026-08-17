

import {ChevronRight, ArrowUpRight, ChevronLeft, ChevronUp} from 'lucide-react';
import {React, useState} from 'react'
import DigitalMarketting1 from '../assets/DigitalMarketting.jpg'
import DigitalMarketing2 from '../assets/DigitalMarketing2.jpg'
import DM_services from '../assets/DM_services.jpg'


export default function DigitalMarketting() {

     const [isAnimating, setIsAnimating] = useState(false);
   


    const services = [
  {
    title: 'Personal Branding',
    description: 'Build a strong personal brand that reflects your unique strengths and values. We help you craft an authentic online presence across platforms to enhance credibility and influence.',
    position: 'left'
  },
  {
    title: 'Creative Campaign Development',
    description: 'Transform ideas into impactful marketing campaigns. Our team develops innovative, visually appealing, and result-driven campaigns to captivate your target audience.',
    position: 'left'
  },
  {
    title: 'Content Strategy & Blogs/Articles',
    description: 'Drive engagement with well-researched content strategies. We create blogs, articles, and content calendars that resonate with your audience and strengthen your digital presence.',
    position: 'left'
  },
  {
    title: 'Social Media Marketing',
    description: 'Boost your brand visibility and engagement on social platforms. We craft tailored social media strategies, design attractive posts, and manage campaigns for maximum reach.',
    position: 'right'
  },
  {
    title: 'Google and Facebook Ads',
    description: 'Maximize ROI with targeted paid advertising campaigns. Our experts optimize Google and Facebook Ads to reach your ideal audience and generate measurable results.',
    position: 'right'
  },
  {
    title: 'SEO (Search Engine Optimization)',
    description: 'Improve your website’s visibility on search engines with our comprehensive SEO strategies. From on-page optimization to link building, we help you rank higher organically.',
    position: 'right'
  }
];

  const leftServices = services.filter(s => s.position === 'left');
  const rightServices = services.filter(s => s.position === 'right');

  const industries = [
  {
    icon: "🛒",
    title: "Ecommerce",
    description:
      "We build high-converting eCommerce websites with seamless user experiences, optimized product pages, and secure checkout flows that drive sales and customer retention."
  },
  {
    icon: "🏋️‍♂️",
    title: "Fitness",
    description:
      "From gym websites to fitness apps, we create digital platforms that motivate users, boost memberships, and strengthen engagement through compelling design and clear user journeys."
  },
  {
    icon: "🏭",
    title: "Industrial / Manufacturing",
    description:
      "We design modern, reliable websites for industrial and manufacturing companies, showcasing capabilities, improving lead generation, and building credibility with clear, technical messaging."
  },
  {
    icon: "🎓",
    title: "Education",
    description:
      "We create engaging, user-friendly websites for schools and educational institutions that enhance enrollment, improve learning accessibility, and deliver clear information to students and parents."
  },
  {
    icon: "🏠",
    title: "Real Estate",
    description:
      "We design visually compelling real estate websites that highlight property listings, attract qualified leads, and establish trust with intuitive browsing and optimized search experiences."
  }
];

  const [currentIndex, setCurrentIndex] = useState(0);


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

   const [openIndex, setOpenIndex] = useState(null);
  // accordion data
  const accordionData = [
    {
      title: "Expert Team of Designers & Developers",
      content: "Our projects are crafted by a talented team of UI/UX designers, front-end & back-end developers, and technical strategists. With years of hands-on experience across diverse industries, we ensure every website is built with precision, creativity, and the latest best practices. Our collaborative process guarantees high-quality results from concept to launch."},
    {
      title: "Strategy-First Approach",
      content: "We don't just execute tactics—we build comprehensive marketing strategies tailored to your business goals. Our data-driven approach ensures every campaign is backed by insights, market research, and measurable KPIs that drive real business growth."
    },
    {
      title: "Full-Service Expertise",
      content: "From brand development and content creation to digital advertising and social media management, we offer end-to-end marketing solutions. Our diverse team of specialists collaborates seamlessly to deliver integrated campaigns that resonate across all channels."
    },
    {
      title: "Proven Track Record",
      content: "We've helped businesses of all sizes—from startups to Fortune 500 companies—achieve remarkable results. Our portfolio includes successful product launches, brand repositioning, and campaigns that have generated millions in revenue for our clients."
    },
    {
      title: "Transparent Communication",
      content: "We believe in complete transparency with our clients. You'll receive regular progress updates, detailed analytics reports, and direct access to your dedicated account manager. We work in your timezone to ensure seamless collaboration and quick response times."
    },
    {
      title: "Custom-Built, Not Cookie-Cutter",
      content: "We never rely on generic templates. Every website we build is uniquely designed and custom-developed to match your brand identity, performance needs, and long-term goals—giving you a digital presence that truly stands out."
    }
  ];


   const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };


  return (
   <>

      <div className=" text-center bg-gradient-to-br 
        from-slate-900 via-slate-800 to-slate-900 
        px-4 sm:px-6 lg:px-16 pt-24 mt-12 sm:pt-24 pb-12 sm:pb-12 lg:pb-18">

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
            <div className="text-white space-y-6">
              <h1 className="text-4xl sm:text-6xl lg:text-6xl font-bold tracking-tight">
                Digital Marketing
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-xl">
                We specialize in delivering innovative digital marketing solutions, creating data-driven, results-oriented strategies that boost brand visibility, increase engagement, and drive measurable growth for startups and established companies alike.
              </p>
            </div>

            <div className="flex justify-center lg:justify-end">
              {/* The wrapper carries the max-width, not just the <img>. Without it
                  the wrapper had no resolvable width until the image had loaded,
                  so the width/height attributes could not reserve any height and
                  the hero collapsed-then-expanded — a ~0.35 layout shift. */}
              <div className="relative w-full max-w-lg lg:max-w-2xl">
                <div className="absolute inset-0 bg-cyan-400 opacity-20 blur-3xl rounded-full"></div>
                <img 
                  src= {DigitalMarketting1}
                  loading='lazy'
                  alt="Digital marketing services" 
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

      {/* section2 */}
      {/* video section */}
        <section className="relative bg-[#f9fafc] ">
           <div className="max-w-6xl mx-auto px-6 py-10 md:py-14 text-center">
      
             <p
               className="
                 text-lg tracking-widest text-orange-700 font-semibold mb-6
                 animate-fadeUp
               "
             >
              Innovative Digital Marketing Solutions
             </p>
      
           
             <h2
               className="
                 text-2xl md:text-5xl lg:text-5xl 
                 font-extrabold leading-tight text-gray-900
                 mb-8 animate-fadeUp animation-delay-200
               "
             >
           {/* Marketing That Connects, Engages & Converts */}
           Our Marketing Services
                 
             </h2>
      
           
             <p
               className="
                 max-w-5xl mx-auto text-lg sm:text-[22px] text-gray-600
                 leading-relaxed mb-12
                 animate-fadeUp animation-delay-400
               "
             >
             We craft digital marketing strategies that are data-driven, targeted, and designed for growth.
              From brand strategy to content, SEO, social media, and paid campaigns, we build powerful digital
           experiences that elevate your brand, attract the right audience, and turn prospects into loyal customers.
      
             </p>
      
            
             <div
               className="
                 flex flex-col sm:flex-row items-center justify-center gap-4
                 animate-fadeUp animation-delay-600
               "
             >
              
             </div>
             <img src={DigitalMarketing2} alt="Digital marketing campaign results" width="1400" height="788" loading='lazy' decoding="async" className='w-full h-auto rounded-xl'/>
      
           </div>
         </section>


        {/* section3 */}
<div className="bg-gray-50 py-8 sm:py-20 lg:py-14 px-4 sm:px-6 lg:px-8">
  <div className="max-w-7xl mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      
      {/* Left Services */}
      <div className="lg:col-span-4 space-y-12 sm:space-y-16">
        {leftServices.map((service, index) => (
          <div key={index} className="space-y-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {service.title}
            </h3>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              {service.description}
            </p>
          </div>
        ))}
      </div>

      {/* Center Column - Sticky Image */}
      <div className="lg:col-span-4 lg:sticky lg:top-28">
        <div className="relative w-full max-w-md mx-auto">
          
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-blue-400 opacity-20 blur-3xl rounded-3xl"></div>

          {/* Image Card */}
          <div className="relative bg-orange-400 rounded-3xl p-8 shadow-2xl">
            <img
              src={DM_services}
              alt="Digital Marketing Analytics"
              className="w-full h-auto rounded-2xl object-cover"
              loading='lazy'
                  width="600"
                  height="700"
                  decoding="async"
                />
          </div>
        </div>
      </div>

      {/* Right Services */}
      <div className="lg:col-span-4 space-y-12 sm:space-y-16">
        {rightServices.map((service, index) => (
          <div key={index} className="space-y-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {service.title}
            </h3>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              {service.description}
            </p>
          </div>
        ))}
      </div>

    </div>
  </div>
</div>

     <div className="min-h-screen bg-gray-20 text-black py-16 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-16">
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-orange-600 mb-6 leading-tight">
              Our Marketing Expertise Across Industries
            </h2>
            <p className="text-lg md:text-xl text-gray-800 leading-relaxed max-w-3xl">
              At Genie Media, we recognize that every industry has unique workflows and customer expectations. As a trusted marketing partner for global businesses, we deliver visually compelling, scalable, and results-driven marketing solutions tailored to each sector.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-3 self-start md:self-center lg:pt-40">
            <button
              onClick={prevSlide}
              disabled={isAnimating}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-orange-500 p-4 rounded-full transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous industries"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
            <button
              onClick={nextSlide}
              disabled={isAnimating}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-orange-500 p-4 rounded-full transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next industries"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          </div>
        </div>

        {/* Carousel Cards */}
        <div className="relative overflow-hidden lg:-mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getVisibleCards().map((industry, idx) => (
              <div
                key={`${industry.title}-${currentIndex}-${idx}`}
                className="group bg-gray-300 rounded-3xl p-8 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                style={{
                  animation: `fadeIn 0.5s ease-out ${idx * 0.1}s both`
                }}
              >
               
                <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-4xl">{industry.icon}</span>
                </div>

                {/* Title with Arrow */}
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-3xl font-bold text-gray-900">
                    {industry.title}
                  </h3>
                  <ArrowUpRight className="w-6 h-6 text-gray-900 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                </div>

                {/* Description */}
                <p className="text-gray-900 leading-relaxed">
                  {industry.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
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
                  ? 'bg-black w-12 h-3'
                  : 'bg-orange-600 w-3 h-3 hover:bg-black/50'
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
    </div>

    {/* /* why geniemedia */ }

      <div className="min-h-screen bg-gray-100 py-16 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left Column - Content */}
          <div className="lg:sticky lg:top-24">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Why Choose Genie Media as Your Marketing Agency?
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              With a proven track record of delivering high-impact marketing solutions for businesses from startups to established enterprises, we have earned a reputation as a trusted partner for all your marketing needs. Here are some reasons why our top clients have chosen us as their marketing agency:
            </p>
            <button className="bg-orange-500 hover:bg-black text-black hover:text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl" onClick={() => window.location.href="/contact"}>
              Let's Discuss Your Project
            </button>
          </div>

          {/* Right Column - Accordions */}
          <div className="space-y-4">
            {accordionData.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full border-2 border-gray-900 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-gray-900"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                      {item.title}
                    </h3>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <ChevronUp
                      className={`w-6 h-6 text-gray-900 transition-transform duration-300 ${
                        openIndex === index ? 'transform rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>
                
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
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
        </div>
      </div>
    </div>




   </>
  )
}
