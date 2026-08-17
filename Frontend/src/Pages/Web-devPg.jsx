import { useState } from 'react'
import { ChevronUp } from 'lucide-react';

import ServicesSection2 from '../components/ServicesWebsites';
import ProjectsSection from '../components/ProjectsSection';
import VideoTestimonials from '../components/testimonials';
import web_services_hero from '../assets/web_services_hero.JPG'
import { WEBSITES_VIDEO_URL } from '../config/media';



export default function WebDevPg() {

   
  const [openIndex, setOpenIndex] = useState(null);
  

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

  // An "industries we serve" carousel (state, data and next/prev handlers) used
  // to be declared here but was never rendered — roughly 60 lines of unused
  // JavaScript shipped in this route chunk. Removed; nothing referenced it.

  return (
    <>
    <div className="bg-gradient-to-br 
        from-slate-900 via-slate-800 to-slate-900 
        px-4 sm:px-6 lg:px-16 pt-28 mt-12 sm:pt-24 pb-12 sm:pb-12 lg:pb-18 text-center">

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
            <div className="text-white space-y-6">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                Web  Development
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-xl">
                We specialize in delivering innovative web development services, crafting responsive, scalable, and user-friendly websites that drive business growth for startups and established companies alike.
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
                  src= {web_services_hero}
                  alt="Web development services" 
                  className="relative rounded-2xl shadow-2xl w-full max-w-lg lg:max-w-2xl object-cover"
                  loading='lazy'
                  width="848"
                  height="477"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* video section */}
            <section className="relative bg-[#f9fafc] overflow-hidden">
               <div className="max-w-6xl mx-auto px-6 py-10 md:py-14 text-center">
         
                 <p
                   className="
                     text-sm tracking-widest text-orange-700 font-semibold mb-6
                     animate-fadeUp
                   "
                 >
                   CREATIVE & STRATEGIC WEB DESIGN & DEVELOPMENT COMPANY
                 </p>
         
               
                 <h2
                   className="
                     text-2xl md:text-5xl lg:text-6xl 
                     font-extrabold leading-tight text-gray-900
                     mb-8 animate-fadeUp animation-delay-200
                   "
                 >
                We Build Websites That <br />
                 Connect, Engage & Convert
                     
                 </h2>
         
               
                 <p
                   className="
                     max-w-3xl mx-auto text-lg text-gray-600
                     leading-relaxed mb-12
                     animate-fadeUp animation-delay-400
                   "
                 >
                 We design and develop websites that are fast, modern, and built for growth. 
                 From UX strategy to development and optimization, we create digital experiences that 
                 reflect your brand, attract users, and turn visitors into customers.
         
                 </p>
         
                
                 <div
                   className="
                     flex flex-col sm:flex-row items-center justify-center gap-4
                     animate-fadeUp animation-delay-600
                   " 
                 >
                  
                 </div>
                 {WEBSITES_VIDEO_URL && (
                   <video
                     src={WEBSITES_VIDEO_URL}
                     muted
                     autoPlay
                     loop
                     playsInline
                     preload="none"
                     className='w-full h-auto rounded-xl'
                   />
                 )}
         
               </div>
             </section>

             <ServicesSection2/>


             {/* projcts */}
             <ProjectsSection/>
             



    {/* why geniemedia */}

      <div className="min-h-screen bg-gray-100 py-16 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left Column - Content */}
          <div className="lg:sticky lg:top-24">
            <h2 className="text-2xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Why Choose Genie Media as Your Marketing Agency?
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              With a proven track record of delivering high-impact marketing solutions for businesses from startups to established enterprises, we have earned a reputation as a trusted partner for all your marketing needs. Here are some reasons why our top clients have chosen us as their marketing agency:
            </p>
            <button className="bg-orange-500 hover:bg-black text-black hover:text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl" onClick={() => window.location.href="https://wa.me/919032845433"}>
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

     <VideoTestimonials/>
      
  

      </>
  )
}
