import React from 'react'
import ProductionHouseServices from '../components/ProductionServices'
import ContactSec from '../components/contactSection'
import ProdHouseCams from '../assets/Production-House-cams.jpg'
import StudioNightView from '../assets/podcast/StudioNightView-min.JPG'



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
                Production House
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-xl">
               We specialize in creating high-quality visual content, delivering professional video production, photography, and creative media solutions that bring stories to life and elevate brands across every platform.
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
                  src= {StudioNightView}
                  alt="Genie Studio at night" 
                  className="relative rounded-2xl shadow-2xl w-full max-w-lg lg:max-w-2xl object-cover"
                  loading='lazy'
                  width="1400"
                  height="933"
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
                    Creative Production Solutions
                   </p>
            
                 
                   <h2
                     className="
                       text-2xl md:text-5xl lg:text-5xl 
                       font-extrabold leading-tight text-gray-900
                       mb-8 animate-fadeUp animation-delay-200
                     "
                   >
                 {/* Marketing That Connects, Engages & Converts */}
                    Production Services
                       
                   </h2>
            
                 
                   <p
                     className="
                       max-w-5xl mx-auto text-lg sm:text-[22px] text-gray-600
                       leading-relaxed mb-12
                       animate-fadeUp animation-delay-400
                     "
                   >
                  We specialize in delivering high-quality production work that brings your ideas to life. 
                  From planning and scripting to filming, editing, and final execution, our team ensures every
                   project is crafted with precision, creativity, and industry-leading expertise. We create compelling 
                   visuals that captivate audiences and elevate your brand’s presence.
            
                   </p>
            
                  
                   <div
                     className="
                       flex flex-col sm:flex-row items-center justify-center gap-4
                       animate-fadeUp animation-delay-600
                     "
                   >
                    
                   </div>
                   <img src={ProdHouseCams} alt="Production house camera equipment" width="1358" height="503" loading='lazy' decoding="async" className='w-full h-auto rounded-xl'/>
            
                 </div>
               </section>

               <ProductionHouseServices/>
               <ContactSec/>

    </>
  )
}
