import React from 'react'


import ContactSec from '../components/contactSection'
import ProjectsSection from '../components/ProjectsSection'
import Wordpress from '../assets/wordpress.png'
import Shopify from '../assets/shopify.webp'
import Code from '../assets/code.png'

export default function Projects() {

   
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
               From impactful digital campaigns to high-quality studio productions, our projects reflect creativity, precision, and results that help brands grow.
              </p>
            </div>

        </div>
      </div>

      <section className="relative py-10 bg-white overflow-hidden border-y-2">
            
            <h2 className="text-center text-4xl font-bold mb-16">
              Platforms we use for Web Development
            </h2>
      
           
            <div className="flex flex-col md:flex-row items-center justify-center gap-20 mb-12">
              <img
                src={Wordpress}
                alt="WordPress"
                className="w-28 md:w-32 hover:scale-110 transition-transform duration-300 -mb-8"
                loading='lazy'
                  width="225"
                  height="225"
                  decoding="async"
                />
              <img
                src={Shopify}
                alt="Shopify"
                className="w-36 md:w-42 hover:scale-110 transition-transform duration-300 -mb-8"
                loading='lazy'
                  width="1302"
                  height="1400"
                  decoding="async"
                />
              <img
                src={Code}
                alt="Custom code development"
                className="w-36 md:w-48 hover:scale-110 transition-transform duration-300"
                loading='lazy'
                  width="259"
                  height="194"
                  decoding="async"
                />
            </div>
      
            
            <div className="max-w-4xl mx-auto text-center px-4">
              <p className="text-xl md:text-2xl font-semibold text-gray-800 leading-relaxed mb-8">
                If you're looking for an agency that elevates your brand with creativity,
                strategy, and innovation, then you’re ready for us.
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
                onClick={() => window.location.href="https://wa.me/919032845433"}
              >
                Need help to upscale your brand
                <span className="text-xl font-bold">→</span>
              </button>
            </div>
      
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02),transparent_70%)]" />
          </section>

          <ProjectsSection/>

    <ContactSec/>
   
   </>
  )
}

