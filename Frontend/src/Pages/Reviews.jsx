import React, { useEffect } from 'react'
import VideoTestimonials from '../components/testimonials'
import ContactSec from '../components/contactSection';
import './Podcast.css'

export default function Reviews() {
  useEffect( () =>{
    // Testimonials animation
    const options4 = { threshold: 0.2, rootMargin: "0px 0px -50px 0px" };
    const observer4 = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("animate");
      });
    }, options4);

   
    const tCards = document.querySelectorAll(".testimonial-card");
    const tCta = document.querySelector(".testimonial-cta");

   
    tCards.forEach((c) => observer4.observe(c));
    if (tCta) observer4.observe(tCta);
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
               Clients love our seamless blend of creative studio production and powerful digital marketing support-helping them record, create, and grow their brand all in one place.
              </p>
            </div>

        </div>
      </div>

      <VideoTestimonials/>

      {/* TESTIMONIAL SECTION */}
      <section className="testimonial-section" id="reviews">
        <div className="bg-pattern"></div>
        <div className="decor-orb decor-orb-1"></div>
        <div className="decor-orb decor-orb-2"></div>

        <div className="testimonial-container">
          <div className="testimonial-header">
            <span className="testimonial-label">Testimonials</span>
            <h2>WHAT OUR CREATORS SAY ABOUT OUR STUDIO</h2>
            <p>
             Every voice, every emotion, every story, that’s the Genie Studio experience.
            </p>
          </div>

          <div className="testimonials-grid">
            {/* Testimonial 1 */}
            <div className="testimonial-card">
              <div className="quote-icon"></div>
              <div className="rating">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i key={i} className="fas fa-star"></i>
                ))}
              </div>

              <p className="testimonial-text">
                "The studio quality is absolutely incredible. The acoustics are perfect, and the equipment is top-notch. Our podcast has never sounded better since we started recording here."
              </p>

              <div className="author-info">
                <div className="author-avatar">SP</div>
                <div className="author-details">
                  <h3>Sasidhar Pydiraju</h3>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="testimonial-card">
              <div className="quote-icon"></div>
              <div className="rating">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i key={i} className="fas fa-star"></i>
                ))}
              </div>

              <p className="testimonial-text">
                "Professional setup with amazing support staff. They helped us every step of the way, from setup to post-production. Highly recommend for serious podcasters!"
              </p>

              <div className="author-info">
                <div className="author-avatar">AS</div>
                <div className="author-details">
                  <h3>Aruna Sai Kumar</h3>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="testimonial-card">
              <div className="quote-icon"></div>
              <div className="rating">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i key={i} className="fas fa-star"></i>
                ))}
              </div>

              <p className="testimonial-text">
                "As a beginner, I was nervous about recording my first podcast. The team made everything so easy and welcoming. The studio space is inspiring and the results are phenomenal!"
              </p>

              <div className="author-info">
                <div className="author-avatar">S</div>
                <div className="author-details">
                  <h3>Shanmuk</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="testimonial-cta">
            <button
              className="cta-button"
              onClick={() =>
                window.open("/contact", "_blank")
              }
            >
              Book Your Session Today
              
            </button>
          </div>
        </div>
      </section>
   
      <ContactSec/>
   
   
   
   
   
   </>
  )
}
