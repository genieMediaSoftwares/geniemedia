"use client";

import React, { useEffect } from 'react'
import VideoTestimonials from "@/components/testimonials"
import ContactSec from "@/components/contactSection";
import StudioReviews from "@/components/StudioReviews";
import { CONTENT_LINK } from "@/lib/linkStyles";

export default function Reviews() {
  useEffect( () =>{
    const options4 = { threshold: 0.2, rootMargin: "0px 0px -50px 0px" };
    const observer4 = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("animate");
      });
    }, options4);

    document.querySelectorAll("[data-reveal]").forEach((el) => observer4.observe(el));
    return () => observer4.disconnect();
  }, []);
  return (
   <>
    <div className="bg-gradient-to-br 
        from-slate-900 via-slate-800 to-slate-900 
        px-4 sm:px-6 lg:px-16 pt-24 mt-12 sm:pt-24 pb-12 sm:pb-12 lg:pb-18">

        <div className="max-w-4xl mx-auto">

            <div className="text-white space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-center">
                Reviews
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-4xl text-center">
               Clients love our seamless blend of creative{" "}
               <a href="/podcast_studio" className={CONTENT_LINK}>studio production</a>{" "}
               and powerful{" "}
               <a href="/digital_marketing" className={CONTENT_LINK}>digital marketing support</a>, helping them record, create, and grow their brand all in one place.
              </p>
            </div>

        </div>
      </div>

      <VideoTestimonials/>

      <StudioReviews heading="WHAT OUR CREATORS SAY ABOUT OUR STUDIO" orbAnimation="animate-float-sm-20" />
   
      <ContactSec/>

   </>
  )
}
