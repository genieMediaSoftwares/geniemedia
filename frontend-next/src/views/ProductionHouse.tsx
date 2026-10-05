"use client";

import React from 'react'
import ProductionHouseServices from "@/components/ProductionServices"
import ContactSec from "@/components/contactSection"
import ProdHouseCamsAsset from "@/assets/Production-House-cams.jpg";
import StudioNightViewAsset from "@/assets/podcast/StudioNightView-min.jpg";

const ProdHouseCams = ProdHouseCamsAsset.src;
const StudioNightView = StudioNightViewAsset.src;
export default function ProductionHouse() {
  return (
    <>
      <div className="text-center bg-gradient-to-br
        from-slate-900 via-slate-800 to-slate-900
        px-4 sm:px-6 lg:px-16 pt-28 mt-12 sm:pt-24 pb-12 sm:pb-12 lg:pb-18">

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            <div className="text-white space-y-6">
              <h1 className="text-4xl sm:text-6xl lg:text-6xl font-bold tracking-tight">
                Production House in Vizag
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-xl">
                Genie Media & Studio is a production house in Vizag that creates professional video content for businesses, brands and organisations. We handle everything from planning and filming to editing and final delivery, so you get polished visual stories that connect with your audience.
              </p>
              <p className="text-base text-gray-400 leading-relaxed">
                Our team works with you from concept to screen. First, we learn your goals and audience. Next, we plan the shoot, write the script and set up the studio or location. Then we film with professional cameras and lighting. Finally, we edit the footage, add graphics and deliver a final product ready for social media, TV, web or events.
              </p>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg lg:max-w-2xl">
                <div className="absolute inset-0 bg-cyan-400 opacity-20 blur-3xl rounded-full"></div>
                <img
                  src={StudioNightView}
                  alt="Genie Media studio set with armchairs, boom microphones and lighting"
                  className="relative rounded-2xl shadow-2xl w-full max-w-lg lg:max-w-2xl object-cover"
                  fetchPriority="high"
                  width="1400"
                  height="933"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What a production house does */}
      <section className="relative bg-[#f9fafc] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-10 md:py-14 text-center">

          <p
            className="
              text-sm tracking-widest text-orange-700 font-semibold mb-6

            "
          >
            CREATIVE PRODUCTION SOLUTIONS
          </p>

          <h2
            className="
              text-2xl md:text-5xl lg:text-5xl
              font-extrabold leading-tight text-gray-900
              mb-8
            "
          >
            Production House Services in Vizag

          </h2>

          <p
            className="
              max-w-5xl mx-auto text-lg sm:text-[22px] text-gray-600
              leading-relaxed mb-12

            "
          >
            Genie Media & Studio is a full-service production house in Visakhapatnam.
            We produce corporate videos, brand films, product shoots, event coverage
            and social media content for clients across India, Australia and the US.
            Our team combines creative direction with technical expertise to deliver
            content that looks professional and achieves your marketing goals.
          </p>

          <img src={ProdHouseCams} alt="Production house camera equipment" width="1358" height="503" loading='lazy' decoding="async" className='w-full h-auto rounded-xl'/>
        </div>
      </section>

      {/* How we work */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-5xl font-bold text-gray-900 mb-8 text-center">How Our Production House Works</h2>
          <p className="max-w-3xl mx-auto text-center text-lg text-gray-600 leading-relaxed mb-12">
            Every production project follows a clear process. First, we meet to discuss your story, goals and audience. Next, our team writes a script and creates a shot plan. Then we set up the studio or travel to your location with all the equipment. During the shoot, our director guides the session and our cameras capture every angle. After that, our editors refine the footage, add graphics and fine-tune the audio. Finally, we deliver the finished video in the formats you need.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Planning & Scriptwriting",
                body: "Before any camera rolls, we define your message, audience and goals. Our writers craft a script and storyboard that keeps your story focused and engaging. This planning step saves time and ensures every scene serves a purpose.",
              },
              {
                title: "Professional Filming",
                body: "We shoot with high-resolution cameras, professional lighting and quality audio equipment. Our team handles multi-camera setups, green screens and drone footage when needed. Because we manage the technical details, you can focus on delivering your message.",
              },
              {
                title: "Editing & Post-Production",
                body: "After the shoot, our editors trim, colour grade, add graphics and mix the audio. We refine the pacing, insert transitions and ensure the final cut matches your brand. For social media, we also create short clips and vertical versions.",
              },
              {
                title: "Corporate Video Production",
                body: "Businesses use video for training, internal communications, client presentations and brand storytelling. Our production house in Vizag creates corporate content that is clear, professional and aligned with your company values.",
              },
              {
                title: "Brand & Promotional Videos",
                body: "A brand video tells your story in a few powerful minutes. We combine interviews, product shots and cinematic footage to create promotional content that builds trust and drives action. These videos work across websites, social media and ad campaigns.",
              },
              {
                title: "Event Coverage & Live Streaming",
                body: "From product launches to conferences, we capture events as they happen and can stream them live to your audience. Our crew manages multiple cameras, audio mixing and real-time switching so your event reaches viewers wherever they are.",
              },
            ].map(({ title, body }) => (
              <div key={title} className="bg-gray-50 rounded-2xl p-6 shadow-sm text-left">
                <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a href="/contact" className="inline-block bg-orange-500 hover:bg-black text-black hover:text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Start Your Video Project
            </a>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-gray-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-5xl font-bold text-gray-900 mb-8 text-center">Why Choose Genie Media & Studio</h2>
          <p className="max-w-3xl mx-auto text-center text-lg text-gray-600 leading-relaxed mb-12">
            Our production house in Vizag brings together experienced filmmakers, editors and creative directors under one roof. We also run a <a href="/podcast_studio" className="text-orange-700 underline underline-offset-2 hover:text-orange-900">podcast studio in Vizag</a> for audio and video recording, and our <a href="/digital_marketing" className="text-orange-700 underline underline-offset-2 hover:text-orange-900">digital marketing team</a> can help promote your video content across social media and search engines. See our <a href="/projects" className="text-orange-700 underline underline-offset-2 hover:text-orange-900">web development projects</a> for examples of our client work, or <a href="/about" className="text-orange-700 underline underline-offset-2 hover:text-orange-900">learn more about our team</a>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "One team for every need",
                body: "The same team that films your video can also design your website and run your digital marketing campaigns. This means consistent branding and smoother communication across every part of your project.",
              },
              {
                title: "Local to Vizag, experienced globally",
                body: "Based in Visakhapatnam, we serve clients across India, Australia and the United States. Our local team is easy to meet in person, and our global experience means your content meets international standards.",
              },
              {
                title: "Transparent pricing and timelines",
                body: "We provide a clear quote before shooting begins, with no hidden costs. You receive the final deliverables on schedule, in the formats you requested. If changes are needed, we handle revisions promptly.",
              },
              {
                title: "Content that performs",
                body: "Every video we produce is designed with its final use in mind. Whether it is a YouTube ad, a social media clip or a corporate presentation, we optimise the length, format and style for maximum impact.",
              },
            ].map(({ title, body }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm text-left">
                <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProductionHouseServices/>
      <ContactSec/>

    </>
  )
}
