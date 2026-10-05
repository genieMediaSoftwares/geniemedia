"use client";

import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Dm_servicesAsset from "@/assets/DM_services.jpg";
import WebDev_servicesAsset from "@/assets/WebDev_services.jpg";
import lampAsset from "@/assets/lamp.jpg";
import productionHouseAsset from "@/assets/Production_house.jpg";

const Dm_services = Dm_servicesAsset.src;
const WebDev_services = WebDev_servicesAsset.src;
const lamp = lampAsset.src;
const productionHouse = productionHouseAsset.src;
/**
 * @param {'h1'|'h2'} headingLevel  This component is both a standalone page
 *   (/services, where its title is the page's h1) and a section embedded in the
 *   home page (where the page already has an h1, so it must be an h2). The
 *   Tailwind classes carry the size, so the rendered design is identical either
 *   way — only the document outline changes.
 */
export default function TabbedServices({ headingLevel = 'h2' }) {
  const [activeTab, setActiveTab] = useState('dm');
  const Heading = headingLevel === 'h1' ? 'h1' : 'h2';

  // `href` is the service's own page. The tab heading links there, so the
  // arrow beside it leads somewhere, and the home and /services pages give
  // crawlers a real <a> to each service page.
  const tabs = [
    { id: 'dm', label: 'Digital Marketing', href: '/digital_marketing' },
    { id: 'webdev', label: 'Web Development', href: '/web_development' },
    { id: 'production', label: 'Production House', href: '/production_house' },
    { id: 'podcast', label: 'Podcast Studio Rentals', href: '/podcast_studio' },

  ];

  const tabContent = {
    'dm': {
      mainTitle: 'Digital Marketing Services',
      mainDescription: 'We plan digital marketing in Vizag around one goal: real business growth. First, we learn who your customers are. Then we bring together brand strategy, content, SEO, social media and paid ads. As a result, the right people find you, trust you and get in touch.',
      mainImage: Dm_services,
      mainImageWidth: 600,
      mainImageHeight: 700,
      services: [
        {
          title: 'Personal Branding',
          description: 'Build a personal brand that shows your strengths and values. We help you create an honest online presence, so people trust you and listen to you.'
        },
        {
          title: 'Creative Campaign Development',
          description: 'Turn ideas into campaigns people notice. Our team plans the message, designs the creatives and runs the campaign. Then we measure what it achieved.'
        },
        {
          title: 'Content Strategy & Blogs/Articles',
          description: 'Good content builds trust over time. So we plan blogs, articles and a content calendar around the questions your customers ask. In turn, your brand becomes easier to find.'
        },
        {
          title: 'Social Media Marketing',
          description: 'Grow your brand on social media. We plan your strategy, design posts and manage your pages. We also run campaigns that reach more of the right people.'
        },
        
        {
          title: 'Google and Facebook Ads',
          description: 'Get more from every rupee you spend on ads. We run Google and Facebook Ads for your ideal customers. After that, we track the results and keep improving them.'
        },
        {
          title: 'SEO (Search Engine Optimization)',
          description: 'Help more people find your website on Google with our SEO services in Visakhapatnam. We cover everything from on-page SEO to link building. As a result, you rank higher and attract the right visitors.'
        }
      ]
    },
    'webdev': {
      mainTitle: 'Web Design & Development',
      mainDescription: 'Transforming Ideas into Powerful Web Experiences. We build user-friendly and interactive websites using WordPress, Coding, and Shopify that match your brand’s style and goals.',
      mainImage: WebDev_services,
      mainImageWidth: 600,
      mainImageHeight: 700,
      services : [
               {
                 title: 'Website Design & Development',
                 description: 'Create visually appealing, user-friendly websites tailored to your brand. Our developers and designers work together to deliver responsive, high-performing websites that engage visitors.'
               },
               {
                 title: 'E-commerce Development',
                 description: 'Launch scalable and secure online stores with seamless shopping experiences. We specialize in platforms like Shopify, WooCommerce, and custom solutions to boost your online sales.'
               },
               {
                 title: 'Web Application Development',
                 description: 'Build robust, feature-rich web applications that streamline your business processes. From frontend to backend, we develop custom solutions to meet your unique requirements.'
               },
               {
                 title: 'Mobile-Responsive Websites',
                 description: 'Ensure your website looks perfect on all devices. Our team optimizes websites for mobile, tablet, and desktop, delivering fast, responsive experiences to increase user engagement.'
               },
               {
                 title: 'Website Maintenance & Support',
                 description: 'Keep your website secure, updated, and running smoothly. We offer ongoing maintenance, performance monitoring, bug fixes, and support to ensure uninterrupted functionality.'
               },
               {
                 title: 'SEO-Friendly Web Development',
                 description: 'Get websites built with SEO best practices in mind. From clean code to fast load speeds, we help your site rank higher in search results and attract organic traffic.'
               }
            ]

    },
    'production': {
      mainTitle: 'Production House',
      mainDescription: 'Transforming Concepts into Captivating Productions. We handle all kinds of shoots, events, corporate videos, model shoots, & product photography & make sure every moment is captured neatly & on time.',
      mainImage: lamp,
      mainImageWidth: 678,
      mainImageHeight: 800,
      
         services : [
                  {
                    title: 'Video Production',
                    description: 'Bring your ideas to life with high-quality video content. From concept to final edit, we create engaging videos for commercials, corporate use, social media, and more.'
                  },
                  {
                    title: 'Wedding & Events',
                    description: 'Capture life’s most special moments with professional wedding and event coverage. From candid emotions to grand celebrations, we ensure every detail is beautifully documented.'
                  },
                  {
                    title: 'Scriptwriting & Storyboarding',
                    description: 'Develop compelling narratives with professional scriptwriting and storyboarding. We help shape your ideas into stories that resonate and leave a lasting impact.'
                  },
                  {
                    title: 'Photography & Visual Content',
                    description: 'Capture striking visuals for marketing, events, and branding. Our photographers create high-quality images that communicate your brand’s essence effectively.'
                  },
                  {
                    title: 'Post-Production & Editing',
                    description: 'Polish your content with expert post-production services, including video editing, color grading, sound design, and visual effects for a professional finish.'
                  },
                  {
                    title: 'Live Streaming & Event Coverage',
                    description: 'Broadcast your events or shows seamlessly with live streaming solutions. We manage everything from setup to execution to ensure flawless coverage and audience engagement.'
                  }
                ]

    },
    'podcast': {
      mainTitle: 'Podcast Studio Rentals',
      mainDescription: 'Where Great Conversations Come to Life Record your podcast in our studio, which is ready for use. Everything you need is already set up, so you can walk in & start recording right away.',
      mainImage: productionHouse,
      mainImageWidth: 690,
      mainImageHeight: 800,
     services : [
                  {
                    title: 'High-Quality Cameras',
                    description: 'Record your podcast in stunning HD with our two professional-grade cameras, ensuring every frame looks crisp and visually engaging.'
                  },
                  {
                    title: 'Clear & Professional Microphones',
                    description: 'Capture crystal-clear audio with our two high-quality microphones, delivering studio-grade sound for your podcast recordings.'
                  },
                  {
                    title: 'Complete Podcast Setup',
                    description: 'Get everything you need for a seamless recording experience. Our fully equipped studio is ready for solo, duo, or group podcast sessions.'
                  },
                  {
                    title: 'Professional Production Team',
                    description: 'Work alongside our experienced production team to ensure your podcast runs smoothly, from setup to recording, providing guidance and technical support.'
                  },
                  {
                    title: 'Video & Photo Editing (Optional)',
                    description: 'Enhance your podcast with professional video and photo editing services available at an additional charge, perfect for marketing or social media content.'
                  }
                ]
    }
    // A fifth 'digital' entry used to live here. No tab in `tabs` has that id,
    // so it was unreachable, and its mainImage pointed at an unsplash.com URL —
    // a third-party origin referenced from a component on the home page.
  };

  const currentContent = tabContent[activeTab as keyof typeof tabContent];
  const currentHref = tabs.find((tab) => tab.id === activeTab)?.href;

  return (
    <div className="bg-gray-100 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 mt-14">
      <Heading className='text-4xl sm:text-6xl text-center text-orange-600 mb-10 font-bold'> Services We Offer</Heading>
      <div className="max-w-7xl mx-auto">
        
        {/* Tabs Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-12" role="tablist">
          {/* Each tab is a real link to its service page, so every service URL
              is in the HTML whichever tab is showing. A plain click switches
              the tab in place, as the buttons did; a modified click (new tab,
              new window) follows the link. */}
          {tabs.map((tab) => (
            <a
              key={tab.id}
              href={tab.href}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                setActiveTab(tab.id);
              }}
              className={`px-6 py-3 rounded-full font-semibold text-xs border-[1px] border-gray-800 sm:text-base transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-black shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </a>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="space-y-12">
          
          {/* Header Section */}
          <div className="text-center max-w-4xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 flex items-center justify-center gap-3">
              <a href={currentHref} className="flex items-center justify-center gap-3">
                {currentContent.mainTitle}
                <ArrowUpRight className="w-8 h-8 text-pink-600" />
              </a>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              {currentContent.mainDescription}
            </p>
          </div>

          {/* Services Grid with Center Image */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column - First 2 Services */}
            <div className="lg:col-span-4 space-y-10 ">
              {currentContent.services.slice(0, 3).map((service: { title: string; description: string }, index: number) => (
                <div key={index} className="space-y-3 group cursor-pointer ">
                  <h3 className="text-xl sm:text-3xl font-bold text-gray-900 flex items-start gap-2">
                    {service.title}
                    <ArrowUpRight className="w-5 h-5 text-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0 mt-1" />
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Center Column - Image */}
            <div className="lg:col-span-4 lg:sticky lg:top-28 flex justify-center">
              <div className="w-full max-w-sm">
                <div className="lg:sticky lg:top-24 relative">
                  
                  
                  {/* Main Image Container */}
                  <div className="relative p-6">
                    <img 
                      src={currentContent.mainImage}
                      alt={currentContent.mainTitle}
                      width={currentContent.mainImageWidth}
                      height={currentContent.mainImageHeight}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-auto rounded-2xl object-cover shadow-2xl"
                    />
                    
                 
                    <div className="absolute inset-0 pointer-events-none">
                     
                    
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Last 2 Services */}
            <div className="lg:col-span-4 space-y-10">
              {currentContent.services.slice(3, 6).map((service: { title: string; description: string }, index: number) => (
                <div key={index} className="space-y-3 group cursor-pointer">
                  <h3 className="text-xl sm:text-3xl font-bold text-gray-900 flex items-start gap-2">
                    {service.title}
                    <ArrowUpRight className="w-5 h-5 text-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0 mt-1" />
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}