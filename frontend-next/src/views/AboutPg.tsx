"use client";

import React from 'react';
import { Check } from 'lucide-react';

import { useEffect, useRef, useState } from "react";

import AboutSection1 from "@/components/AboutSection";
import VideoTestimonials from "@/components/testimonials";
import AboutHeroAsset from "@/assets/about_hero.jpg";
import OurMissionAsset from "@/assets/ourMission.jpg";
import OurVissionAsset from "@/assets/our-vision2.jpg";
import { CONTENT_LINK } from "@/lib/linkStyles";

const AboutHero = AboutHeroAsset.src;
const OurMission = OurMissionAsset.src;
const OurVission = OurVissionAsset.src;
export default function AboutPage() {
  const benefits = [
    'SEO and local search',
    'Google Ads and social media marketing',
    'Website design and development',
    'Podcast recording and editing',
    'Clear content and customer answers',
    'Campaign tracking and reporting'
  ];

  const values = [
    {
      letter: 'G',
      title: 'Growth-Driven',
      description: 'Every action we take is aligned with scaling your success.'
    },
    {
      letter: 'E',
      title: 'Excellence First',
      description: 'We don\'t settle for good - we deliver exceptional.'
    },
    {
      letter: 'N',
      title: 'Next-Gen Thinking',
      description: 'Modern solutions built for tomorrow\'s digital world.'
    },
    {
      letter: 'I',
      title: 'Integrity Always',
      description: 'Transparent, ethical, and client-first in every decision.'
    },
    {
      letter: 'E',
      title: 'Exceptional Execution',
      description: 'Ideas realized with impact, accuracy, and speed.'
    }
  ];

  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
    <div className="relative">
    
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 lg:px-16 pt-28 mt-8 sm:pt-24 pb-20 sm:pb-32 lg:pb-36">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
            <div className="text-center text-white space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                About Genie Media in Vizag
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-xl">
                Genie Media &amp; Studio is based in Yendada, Visakhapatnam (Vizag). We help local businesses and startups with{" "}
                <a href="/digital-marketing" className={CONTENT_LINK}>digital marketing</a>,{" "}
                <a href="/web-development" className={CONTENT_LINK}>website development</a>, a{" "}
                <a href="/production-house" className={CONTENT_LINK}>production house</a> and a{" "}
                <a href="/podcast-studio" className={CONTENT_LINK}>podcast studio</a>.{" "}
                We serve Rushikonda, MVP Colony, Madhurawada and wider Andhra Pradesh. Marketing, website work and podcast editing are also available remotely across India. First, tell us what you need. Then we can plan the work together. <a href="/contact" className={CONTENT_LINK}>Get in touch</a> to start a project.
              </p>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg lg:max-w-2xl">
                <div className="absolute inset-0 bg-cyan-400 opacity-20 blur-3xl rounded-full"></div>
                <img 
                  src={AboutHero}
                  alt="The Genie Media team at work" 
                  className="relative rounded-2xl shadow-2xl w-full max-w-lg lg:max-w-2xl object-cover"
                  loading='lazy'
                  width="520"
                  height="433"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
      <div className="px-4 mt-6 sm:px-6 lg:px-16 pb-16 bg-gray-50 sm:-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 lg:p-16  sm: lg: relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
             
              <div className="lg:col-span-5">
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                  How Genie Media Helps Businesses
                </h2>
              </div>

              <div className="lg:col-span-7">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                  {benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 mt-px flex items-center justify-center">
                          <Check className="w-3 h-3 text-orange-600" strokeWidth={3} />
                        </div>
                      </div>
                      <span className="text-lg sm:text-xl text-gray-600 hover:text-orange-600  leading-relaxed">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    <section
      ref={sectionRef}
      className="w-full bg-gray-200 px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
     
      <div
        className={`w-full min-w-0 transition-all duration-[1000ms] ease-out
        `}
      >
        <img
          src={OurVission}
          alt="Our vision"
          className="w-full h-auto rounded-2xl"
          loading='lazy'
                  width="556"
                  height="360"
                  decoding="async"
                />
      </div>

      <div
        className={`text-center md:text-left w-full min-w-0 transition-all duration-[800ms] delay-100 ease-out
       `}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-orange-700 mb-6">
        Our Vision
        </h2>

        <p className="text-gray-700 text-lg leading-relaxed mb-6">
         At Genie Media, we empower brands to grow in the digital-first world through strategy, creativity, and performance-driven marketing.
We blend design, storytelling, and technology to build meaningful brand experiences that attract, and convert audiences across all channels.

        </p>

        <p className="text-gray-700 text-lg leading-relaxed">
         Our vision is to become a trusted growth partner for businesses by delivering impactful <a href="/digital-marketing" className={CONTENT_LINK}>digital marketing solutions</a>{" "} that drive measurable results. 
          
        </p>
      </div>
      </div>
    </section>

   <section
      ref={sectionRef}
      className="w-full bg-gray-50 px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
     
      <div
        className={`w-full min-w-0 md:order-2 transition-all duration-[1000ms] ease-out motion-reduce:translate-x-0 motion-reduce:opacity-100
        ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"}`}
      >
        <img
          src={OurMission}
          alt="Our mission"
          className="w-full h-auto rounded-2xl"
          loading='lazy'
                  width="905"
                  height="615"
                  decoding="async"
                />
      </div>

      <div
        className={`text-center md:text-left w-full min-w-0 transition-all duration-[800ms] delay-100 ease-out motion-reduce:translate-x-0 motion-reduce:opacity-100
        ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-3"}`}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-orange-700 mb-6">
          Our Mission
        </h2>

        <p className="text-gray-700 text-lg leading-relaxed mb-6">
          Our mission is to help businesses stand out, scale faster, and succeed online.
We combine creative thinking, data-driven insights, and cutting-edge marketing tools to craft tailored solutions that maximize visibility, engagement, and ROI.
        </p>

        <p className="text-gray-700 text-lg leading-relaxed">
          Through  <span className={CONTENT_LINK}>innovation</span>,{" "}
         <span className={CONTENT_LINK}>collaboration</span>,{" "} and
         <span className={CONTENT_LINK}>continuous optimization</span>{" "}we turn ideas into powerful digital experiences that fuel long-term growth.
        </p>
      </div>
      </div>
    </section>

    <AboutSection1/>

    <div className="relative bg-gray-200 px-4 sm:px-6 lg:px-16 py-16 sm:py-20 lg:py-14 overflow-hidden">

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="text-black space-y-8 sm:mt-40">
            <div className="space-y-6">
              <h2 className=" text-4xl sm:text-5xl lg:text-6xl font-bold">
                Core Values
              </h2>
              <p className=" text-lg sm:text-xl leading-relaxed opacity-95">
                Our core values drive us to build user-focused software through collaboration, transparency, empathy, and technical excellence.
              </p>
            </div>

            <div className="mt-12 lg:mt-20">
              <h3 className=" text-orange-700 text-6xl t sm:text-7xl lg:text-8xl  font-bold tracking-widest">
                GENIE
              </h3>
            </div>

          </div>

          <div className="space-y-0 relative">
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-black opacity-20 hidden sm:block"></div>

            {values.map((value, index) => (
              <div 
                key={index} 
                className="relative flex items-center gap-4 sm:gap-8 pb-8 last:pb-0"
              >
                <div className="flex-shrink-0 relative z-10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 aspect-square rounded-full bg-orange-400 flex items-center justify-center shadow-lg">
                    <span className="text-2xl sm:text-3xl font-bold text-black">
                      {value.letter}
                    </span>
                  </div>
                </div>

                <div className="flex-1 rounded-lg bg-white p-6 space-y-2">
                  <h4 className="text-xl sm:text-2xl font-bold text-black">
                    {value.title}
                  </h4>
                  <p className="text-base sm:text-lg text-black opacity-90 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    <VideoTestimonials/>
      </>
  );
}
