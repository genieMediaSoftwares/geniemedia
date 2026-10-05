"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useEffect, useRef } from 'react';
import { Star, Quote } from 'lucide-react';

// Each testimonial is a YouTube video. Only the video ID is stored — the embed
// and thumbnail URLs are derived from it, so they can never end up malformed.
const testimonials = [
  {
    id: 1,
    name: "Dr.Sailaja",
    company: "Lawer",
    rating: 5,
    videoId: "gMpv78iIFz0",
    quote: "Wonderful design and implemenation of my website with thoroughly giving suggestions and clarifying doubts."
  },
  {
    id: 2,
    name: "Suraj",
    company: "Communication Coach",
    rating: 5,
    videoId: "4xgHJgz_8uY",
    quote: "Outstanding results! Excellent colors representation and Design i loved the website."
  },
  {
    id: 3,
    name: "Deepak kumar sharma",
    company: "Neutritionist",
    rating: 5,
    videoId: "mUpfyEFMpeY",
    quote: "The creativity and professionalism exceeded all our expectations!"
  },
  {
    id: 4,
    name: "Heena M shrivastava",
    company: "Book Author & Coach",
    rating: 5,
    videoId: "poK_yAMsmUQ",
    quote: "I'm  worried about my website design & getting no traffic Then karthik came and delivered such a beautiful website for me."
  },
  {
    id: 5,
    name: "kedhar panda",
    company: "Book Author & Coach",
    rating: 5,
    videoId: "oGxKBpu7x1I",
    quote: "They truly understood our brand and delivered beyond expectations!"
  }
];

/**
 * Click-to-play YouTube facade.
 *
 * Mounting five real <iframe> embeds shipped ~5 MB and several seconds of
 * third-party JavaScript on page load, even for the cards CSS was hiding —
 * `display: none` does not stop an iframe from loading. Instead we render the
 * video's own thumbnail plus a play button, and only swap in the real player
 * once the visitor actually asks for it. The player, its controls and
 * fullscreen all behave exactly as before from that point on.
 *
 * youtube-nocookie.com is used so no tracking cookie is set unless the visitor
 * chooses to play a video.
 */
const LiteYouTube = ({ videoId, title }: { videoId: string; title: string }) => {
  const [activated, setActivated] = useState(false);

  if (activated) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
        title={title}
        className="w-full h-full rounded-xl"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActivated(true)}
      aria-label={`Play video testimonial from ${title}`}
      className="group/yt w-full h-full rounded-xl overflow-hidden relative block bg-black border-0 p-0 cursor-pointer focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#ff6b00] focus-visible:outline-offset-2"
    >
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt={`Thumbnail of the video testimonial from ${title}`}
        width="480"
        height="360"
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
      />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 68 48" width="68" height="48" focusable="false">
          <path
            className="fill-[#212121] [fill-opacity:0.8] [transition:fill_0.2s_ease,fill-opacity_0.2s_ease] group-hover/yt:fill-[#f00] group-hover/yt:[fill-opacity:1] group-focus-visible/yt:fill-[#f00] group-focus-visible/yt:[fill-opacity:1]"
            d="M66.52 7.74a8 8 0 0 0-5.65-5.67C55.79 1 34 1 34 1S12.21 1 7.13 2.07a8 8 0 0 0-5.65 5.67A83.7 83.7 0 0 0 0 24a83.7 83.7 0 0 0 1.48 16.26 8 8 0 0 0 5.65 5.67C12.21 47 34 47 34 47s21.79 0 26.87-1.07a8 8 0 0 0 5.65-5.67A83.7 83.7 0 0 0 68 24a83.7 83.7 0 0 0-1.48-16.26z"
          />
          <path d="M45 24 27 14v20z" fill="#fff" />
        </svg>
      </span>
    </button>
  );
};


/* ── Tailwind class sets (formerly this component's <style> block) ────── */

const CAROUSEL_NAV =
  "z-20 flex h-[60px] w-[60px] cursor-pointer items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff6b00,#ff8c00)] shadow-[0_10px_30px_rgba(255,107,0,0.3)] transition-all duration-300 ease-[ease] hover:scale-110 hover:shadow-[0_15px_40px_rgba(255,107,0,0.5)] active:scale-95 max-[768px]:h-[50px] max-[768px]:w-[50px]";

const CAROUSEL_ITEM = "shrink-0 transition-all duration-[600ms] ease-in-out motion-reduce:transition-none";
const CAROUSEL_POSITION: Record<string, string> = {
  side: "w-[320px] [transform:scale(0.75)_translateZ(-100px)] opacity-50 blur-[0.5px] max-[768px]:hidden",
  center: "w-[430px] [transform:scale(1)_translateZ(0)] opacity-100 blur-0 z-10 max-[768px]:!w-full max-[768px]:max-w-[400px]",
  hidden: "hidden",
};
// Staggered reveal, one step per card.
const ITEM_DELAY = ["![animation-delay:0s]", "![animation-delay:0.1s]", "![animation-delay:0.2s]", "![animation-delay:0.3s]", "![animation-delay:0.4s]", "![animation-delay:0.5s]"];

const VIDEO_CARD = "cursor-pointer transition-all duration-[400ms] ease-in-out";
const VIDEO_CARD_SIDE = "shadow-lg hover:translate-y-0 hover:shadow-[0_25px_60px_rgba(0,0,0,0.2)]";
const VIDEO_CARD_CENTER = "shadow-[0_30px_80px_rgba(255,107,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_35px_90px_rgba(255,107,0,0.4)]";

const VideoTestimonials = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <>

      <section 
        ref={sectionRef}
        className="relative bg-gradient-to-br from-white via-orange-50 to-white py-14 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        {/* Background Decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-300 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="relative max-w-8xl mx-auto">
          {/* Section Header */}
          <div className={`text-center mb-8 ${isVisible ? 'animate-fade-in-up-slow motion-reduce:animate-none' : 'opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 border border-orange-200 rounded-full mb-4">
              <Star className="text-orange-500" size={16} fill="currentColor" />
              <span className="text-sm font-semibold text-orange-700">
                Video Testimonials
              </span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-extrabold text-gray-900 mb-4">
              Hear From Our <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Happy Clients</span>
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Real stories from real people who've experienced the transformation
            </p>
          </div>

          {/* Carousel */}
          <div className="relative">
            <div className="flex items-center justify-center gap-8 [perspective:1000px] min-h-[580px] max-[768px]:gap-4 max-[768px]:min-h-[500px]">
              {/* Previous Button */}
              <button
                onClick={prevSlide}
                className={CAROUSEL_NAV}
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={24} className="text-white" aria-hidden="true" />
              </button>

              {/* Carousel Items */}
              <div className="flex-1 flex items-center justify-center gap-8 overflow-hidden max-w-8xl">
                {testimonials.map((testimonial, index) => {
                  let position = 'hidden';
                  const prevIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
                  const nextIndex = (currentIndex + 1) % testimonials.length;
                  
                  if (index === currentIndex) position = 'center';
                  else if (index === prevIndex) position = 'side';
                  else if (index === nextIndex) position = 'side';
                  
                  return (
                    <div
                      key={testimonial.id}
                      className={`${CAROUSEL_ITEM} ${CAROUSEL_POSITION[position]} ${
                        isVisible ? `animate-scale-in motion-reduce:animate-none ${ITEM_DELAY[index] ?? ""}` : ''
                      }`}
                      onClick={() => position !== 'center' && goToSlide(index)}
                    >
                      <div className={`${VIDEO_CARD} ${position === 'center' ? VIDEO_CARD_CENTER : VIDEO_CARD_SIDE} bg-white rounded-2xl overflow-hidden`}>
                       
                        <div className="relative overflow-hidden rounded-2xl aspect-video bg-gray-900">
                          <LiteYouTube
                            videoId={testimonial.videoId}
                            title={testimonial.name}
                          />
                        </div>

                       
                        <div className="p-6">
                          
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                            <Quote className="text-white" size={24} />
                          </div>

                       
                          <div className="flex gap-1 mb-3">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star 
                                key={i} 
                                className="text-yellow-400" 
                                size={18} 
                                fill="currentColor"
                              />
                            ))}
                          </div>

                         
                          <p className="text-gray-700 text-sm mb-4 italic leading-relaxed">
                            "{testimonial.quote}"
                          </p>

                         
                          <div className="pt-2 border-t border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">
                              {testimonial.name}
                            </h3>
                            <p className="text-sm text-orange-700 font-semibold">
                              {testimonial.company}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

       
              <button
                onClick={nextSlide}
                className={CAROUSEL_NAV}
                aria-label="Next testimonial"
              >
                <ChevronRight size={24} className="text-white" aria-hidden="true" />
              </button>
            </div>

            {/* Carousel Indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToSlide(index)}
                  className="flex w-7 h-7 items-center justify-center bg-transparent border-0 p-0 cursor-pointer"
                  aria-label={`Go to testimonial ${index + 1}`}
                  aria-current={index === currentIndex}
                >
                  <span
                    className={
                      index === currentIndex
                        ? 'block rounded-full transition-all duration-300 ease-[ease] w-10 h-3 bg-gradient-to-r from-orange-500 to-orange-600'
                        : 'block rounded-full transition-all duration-300 ease-[ease] w-3 h-3 bg-gray-300 hover:bg-orange-300'
                    }
                  />
                </button>
              ))}
            </div>
          </div>

         
        
        </div>
      </section>
    </>
  );
};

export default VideoTestimonials;