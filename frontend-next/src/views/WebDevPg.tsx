import { Check } from "lucide-react";
import { ChevronDown } from 'lucide-react';
import type { PortfolioItem } from "@/types";

import ServicesSection2 from "@/components/ServicesWebsites";
import PlatformsWeUse from "@/components/PlatformsWeUse";
import ProjectsSection from "@/components/ProjectsSection";
import VideoTestimonials from "@/components/testimonials";
import ServiceFaq from "@/components/ServiceFaq";
import { WEB_DEVELOPMENT_FAQS } from "@/content/serviceFaqs";
import web_services_heroAsset from "@/assets/web_services_hero.jpg";
import { WEBSITES_VIDEO_URL } from "@/config/media";
import { CONTENT_LINK } from "@/lib/linkStyles";

const web_services_hero = web_services_heroAsset.src;

const inlineLink = CONTENT_LINK;

export default function WebDevPg({ initialProjects, h1 }: { initialProjects: PortfolioItem[] | null; h1?: string }) {

  const accordionData = [
    {
      title: "Expert Team of Designers & Developers",
      content: <>Our team includes UI/UX designers, front-end and back-end developers, and technical strategists. Because every industry is different, we bring years of hands-on experience to each project. As a result, every website we build meets the latest standards and your specific goals.</>
    },
    {
      title: "Planning Before Code",
      content: "Every build starts with your goals and audience. First, we map the pages and features. Then we choose the right platform, whether that is WordPress, Shopify or custom code. Only after this planning do we begin the design work."
    },
    {
      title: "Websites, Marketing and Media Under One Roof",
      content: (
        <>
          The team that builds your website can also run its{" "}
          <a href="/digital_marketing" className={inlineLink}>digital marketing: SEO, social media and ads</a>{" "}
          and shoot its{" "}
          <a href="/production_house" className={inlineLink}>photos and videos</a>. For practical
          tips, read <a href="/blogs" className={inlineLink}>our website and SEO guides</a>.
          In addition, this means consistent branding and faster turnarounds across every channel.
        </>
      )
    },
    {
      title: "Work You Can Check",
      content: (
        <>
          We have built business websites and online stores for clients in India,
          Australia and the US. Every one is listed in{" "}
          <a href="/projects" className={inlineLink}>our website projects portfolio</a>{" "}
          with a link to the live site. Therefore, you can see the quality of our work before you start your own project.
        </>
      )
    },
    {
      title: "Transparent Communication",
      content: "We share regular progress updates with every client. You also get detailed reports on how the site performs. Because we value transparency, your account manager is always available to answer questions."
    },
    {
      title: "Custom-Built, Not Cookie-Cutter",
      content: "We never use generic templates. Instead, every website is uniquely designed to match your brand. Furthermore, our custom approach means your site stands out from competitors and grows with your business."
    }
  ];

  return (
    <>
    <div className="bg-gradient-to-br 
        from-slate-900 via-slate-800 to-slate-900 
        px-4 sm:px-6 lg:px-16 pt-28 mt-12 sm:pt-24 pb-12 sm:pb-12 lg:pb-18 text-center">

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
            <div className="text-white space-y-6">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                {h1 || "Web Development Company in Vizag"}
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-xl">
                Genie Media & Studio provides professional web development services in Vizag for businesses that need fast, responsive, and SEO-friendly websites. We build business websites, landing pages and ecommerce stores that load fast, are easy to use and help startups and established companies grow.
              </p>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg lg:max-w-2xl">
                <div className="absolute inset-0 bg-cyan-400 opacity-20 blur-3xl rounded-full"></div>
                <img 
                  src= {web_services_hero}
                  alt="Web development concept with icons for code, devices and global websites"
                  className="relative rounded-2xl shadow-2xl w-full max-w-lg lg:max-w-2xl object-cover"
                  fetchPriority="high"
                  width="848"
                  height="477"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

            <section className="relative bg-[#f9fafc] overflow-hidden">
               <div className="max-w-6xl mx-auto px-6 py-10 md:py-14 text-center">
         
                 <p
                   className="
                     text-sm tracking-widest text-orange-700 font-semibold mb-6
                    
                   "
                 >
                   CREATIVE & STRATEGIC WEB DESIGN & DEVELOPMENT COMPANY
                 </p>

                 <h2
                   className="
                     text-2xl md:text-5xl lg:text-6xl 
                     font-extrabold leading-tight text-gray-900
                     mb-8
                   "
                 >
                Web Development Services That <br />
                 Connect, Engage & Convert
                     
                 </h2>

                 <p
                   className="
                     max-w-3xl mx-auto text-lg text-gray-600
                     leading-relaxed mb-12
                    
                   "
                 >
                 We design and develop websites that are fast, modern, and built for growth. 
                 From UX strategy to development and optimization, we create digital experiences that 
                 reflect your brand, attract users, and turn visitors into customers.
         
                 </p>

                 <div
                   className="
                     flex flex-col sm:flex-row items-center justify-center gap-4
                    
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

             <PlatformsWeUse
               type="webDevelopment"
               intro={
                 <>
                   We use modern web technologies and cloud platforms to build fast, scalable,
                   responsive and reliable websites and web applications for businesses, from
                   full-stack custom builds to ecommerce stores and cloud deployment. See them at
                   work in{" "}
                   <a href="/projects" className={inlineLink}>our web development projects</a>.
                 </>
               }
             />

             <ProjectsSection initialProjects={initialProjects} />

      <div className="min-h-screen bg-gray-100 py-16 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div className="lg:sticky lg:top-24">
            <h2 className="text-2xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Why Choose Genie Media for Your Website?
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              From our office in Visakhapatnam we design, build and support websites for startups and established businesses. First, we learn your goals. Next, we plan the site. Then we build and test it. Finally, we hand over a fast, modern website that your customers can trust.
            </p>
            <a href="https://wa.me/919032845433" className="inline-block bg-orange-500 hover:bg-black text-black hover:text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Let's Discuss Your Project
            </a>
          </div>

          <div className="space-y-4">
            {accordionData.map((item) => (
              <details
                key={item.title}
                className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <summary className="w-full flex items-center justify-between p-6 text-left cursor-pointer list-none [&::-webkit-details-marker]:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-inset">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full border-2 border-gray-900 flex items-center justify-center">
                        <Check className="w-5 h-5 text-gray-900" strokeWidth={2} aria-hidden="true" />
                      </div>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                      {item.title}
                    </h3>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <ChevronDown className="w-6 h-6 text-gray-900 transition-transform duration-300 group-open:rotate-180" aria-hidden="true" />
                  </div>
                </summary>
                <div className="px-6 pb-6 pt-2">
                  <p className="text-gray-600 leading-relaxed pl-12">
                    {item.content}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>

      <section className="bg-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Website Development for Businesses in Vizag
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              Your website is often the first place a customer meets your business. So it has to load fast, look right on a phone and make the next step obvious. Genie Media &amp; Studio offers website development and website design for startups, shops, clinics, schools, manufacturers and service firms across Visakhapatnam.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              We build business websites, landing pages and ecommerce stores, with a clear user experience and SEO built in. Once the site is live, our{" "}
              <a href="/digital_marketing" className={inlineLink}>digital marketing team in Vizag</a>{" "}
              can bring in visitors through SEO, Google Ads and social media. You can also browse{" "}
              <a href="/projects" className={inlineLink}>websites we have built for clients</a>. Need video for your new site? Record it in our{" "}
              <a href="/podcast_studio" className={inlineLink}>podcast studio in Vizag</a>.
            </p>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">How a Website Project Works</h2>
            <ol className="space-y-4">
              <li className="bg-gray-50 rounded-xl p-5"><p className="text-gray-700"><strong>1. Discovery:</strong> First, we learn your goals, your customers and the pages you need.</p></li>
              <li className="bg-gray-50 rounded-xl p-5"><p className="text-gray-700"><strong>2. Design:</strong> Next, we design the layout and user experience, and you review it before we build.</p></li>
              <li className="bg-gray-50 rounded-xl p-5"><p className="text-gray-700"><strong>3. Development:</strong> Then we build the site on WordPress, Shopify or custom code, and test it on phones and desktops.</p></li>
              <li className="bg-gray-50 rounded-xl p-5"><p className="text-gray-700"><strong>4. Launch and support:</strong> Finally, we handle hosting and launch, and we stay on hand for maintenance and updates.</p></li>
            </ol>
          </div>
        </div>
      </section>

      <ServiceFaq
        title="Web Development FAQs"
        intro="Answers to common questions about website development in Vizag."
        faqs={WEB_DEVELOPMENT_FAQS}
      />

     <VideoTestimonials/>

      </>
  )
}
