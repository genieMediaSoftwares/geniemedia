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
const LiteYouTube = ({ videoId, title }) => {
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
      className="lite-yt group/yt w-full h-full rounded-xl overflow-hidden relative block"
    >
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        width="480"
        height="360"
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
      />
      <span className="lite-yt-play" aria-hidden="true">
        <svg viewBox="0 0 68 48" width="68" height="48" focusable="false">
          <path
            className="lite-yt-play-bg"
            d="M66.52 7.74a8 8 0 0 0-5.65-5.67C55.79 1 34 1 34 1S12.21 1 7.13 2.07a8 8 0 0 0-5.65 5.67A83.7 83.7 0 0 0 0 24a83.7 83.7 0 0 0 1.48 16.26 8 8 0 0 0 5.65 5.67C12.21 47 34 47 34 47s21.79 0 26.87-1.07a8 8 0 0 0 5.65-5.67A83.7 83.7 0 0 0 68 24a83.7 83.7 0 0 0-1.48-16.26z"
          />
          <path d="M45 24 27 14v20z" fill="#fff" />
        </svg>
      </span>
    </button>
  );
};

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

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .animate-scaleIn {
          animation: scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .carousel-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          perspective: 1000px;
          min-height: 580px;
        }

        .carousel-item {
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
        }

        .carousel-item.side {
          transform: scale(0.75) translateZ(-100px);
          opacity: 0.5;
          filter: blur(0.5px);
        }

        .carousel-item.center {
          transform: scale(1) translateZ(0);
          opacity: 1;
          filter: blur(0);
          z-index: 10;
        }

        .carousel-item.hidden {
          display: none;
        }

        .video-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .video-card:hover {
          transform: translateY(0px);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
        }

        .carousel-item.center .video-card {
          box-shadow: 0 30px 80px rgba(255, 107, 0, 0.3);
        }

        .carousel-item.center .video-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 35px 90px rgba(255, 107, 0, 0.4);
        }

        .carousel-nav {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff6b00, #ff8c00);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(255, 107, 0, 0.3);
          z-index: 20;
        }

        .carousel-nav:hover {
          transform: scale(1.1);
          box-shadow: 0 15px 40px rgba(255, 107, 0, 0.5);
        }

        .carousel-nav:active {
          transform: scale(0.95);
        }

        .video-container {
          position: relative;
          overflow: hidden;
          border-radius: 1rem;
        }

        .video-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .video-card:hover .video-overlay {
          opacity: 1;
        }

        .video-controls {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1rem;
          display: flex;
          gap: 0.5rem;
          align-items: center;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.3s ease;
        }

        .video-card:hover .video-controls {
          opacity: 1;
          transform: translateY(0);
        }

        .play-button {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          background: rgba(255, 107, 0, 0.95);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(255, 107, 0, 0.4);
        }

        .play-button:hover {
          transform: translate(-50%, -50%) scale(1.1);
          background: rgba(255, 107, 0, 1);
          box-shadow: 0 15px 40px rgba(255, 107, 0, 0.6);
        }

        .control-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .control-btn:hover {
          background: rgba(255, 107, 0, 0.9);
          color: white;
          transform: scale(1.1);
        }

        .quote-icon {
          animation: float 3s ease-in-out infinite;
        }

        video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Click-to-play YouTube facade — mirrors the player's own poster frame */
        .lite-yt {
          background: #000;
          border: 0;
          padding: 0;
          cursor: pointer;
        }

        .lite-yt-play {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .lite-yt-play-bg {
          fill: #212121;
          fill-opacity: 0.8;
          transition: fill 0.2s ease, fill-opacity 0.2s ease;
        }

        .lite-yt:hover .lite-yt-play-bg,
        .lite-yt:focus-visible .lite-yt-play-bg {
          fill: #f00;
          fill-opacity: 1;
        }

        .lite-yt:focus-visible {
          outline: 3px solid #ff6b00;
          outline-offset: 2px;
        }

        /* Keeps the visible dot small while giving it a 24px+ tap target */
        .carousel-dot {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: none;
          border: 0;
          padding: 0;
          cursor: pointer;
        }

        .carousel-dot > span {
          display: block;
          border-radius: 9999px;
          transition: all 0.3s ease;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fadeInUp,
          .animate-scaleIn,
          .quote-icon {
            animation: none !important;
          }
          .carousel-item {
            transition: none;
          }
        }

        @media (max-width: 768px) {
          .carousel-container {
            gap: 1rem;
            min-height: 500px;
          }

          .carousel-item.side {
            display: none;
          }

          .carousel-item.center {
            width: 100% !important;
            max-width: 400px;
          }

          .carousel-nav {
            width: 50px;
            height: 50px;
          }
        }
      `}</style>

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
          <div className={`text-center mb-8 ${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`}>
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
            <div className="carousel-container">
              {/* Previous Button */}
              <button
                onClick={prevSlide}
                className="carousel-nav"
                aria-label="Previous testimonial"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
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
                      className={`carousel-item ${position} ${
                        isVisible ? 'animate-scaleIn' : 'opacity-0'
                      }`}
                      style={{ 
                        width: position === 'center' ? '430px' : '320px',
                        animationDelay: `${index * 0.1}s` 
                      }}
                      onClick={() => position !== 'center' && goToSlide(index)}
                    >
                      <div className="video-card bg-white rounded-2xl overflow-hidden shadow-lg">
                       
                        <div className="video-container aspect-video bg-gray-900 relative">
                          <LiteYouTube
                            videoId={testimonial.videoId}
                            title={testimonial.name}
                          />
                        </div>

                       
                        <div className="p-6">
                          
                          <div className="quote-icon1 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
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
                className="carousel-nav"
                aria-label="Next testimonial"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            {/* Carousel Indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToSlide(index)}
                  className="carousel-dot"
                  aria-label={`Go to testimonial ${index + 1}`}
                  aria-current={index === currentIndex}
                >
                  <span
                    className={
                      index === currentIndex
                        ? 'w-10 h-3 bg-gradient-to-r from-orange-500 to-orange-600'
                        : 'w-3 h-3 bg-gray-300 hover:bg-orange-300'
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