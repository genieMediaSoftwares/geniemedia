import React from 'react'
import type { PortfolioItem } from "@/types";


import ContactSec from "@/components/contactSection"
import ProjectsSection from "@/components/ProjectsSection"
import WhatWeBuild from "@/components/WhatWeBuild"
import { CONTENT_LINK } from "@/lib/linkStyles";

export default function Projects({ initialProjects }: { initialProjects: PortfolioItem[] | null }) {

   
  return (
   <>
       <div className="bg-gradient-to-br 
        from-slate-900 via-slate-800 to-slate-900 
        px-4 sm:px-6 lg:px-16 pt-24 mt-12 sm:pt-24 pb-12 sm:pb-12 lg:pb-18">

        <div className="max-w-4xl mx-auto">
         
          
            <div className="text-white space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-center">
                Our Work
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-4xl text-center">
               Business websites and online stores we have designed and built for clients in India, Australia and the US. See how we approach{" "}
               <a href="/web_development" className={CONTENT_LINK}>website development</a>{" "}
               and how we help those websites grow with{" "}
               <a href="/digital_marketing" className={CONTENT_LINK}>digital marketing and SEO</a>.
               Planning a new site?{" "}
               <a href="/contact" className={CONTENT_LINK}>Talk to our web team</a>.
              </p>
            </div>

        </div>
      </div>

      {/* Replaces the old three-image "Platforms we use" block; same position, above the projects. */}
      <WhatWeBuild />

          <ProjectsSection initialProjects={initialProjects} />

    <ContactSec/>
   
   </>
  )
}

