import React, { useEffect } from "react";
import './Podcast.css'
import PodcastStudioBooking from "../components/StudioBooking";
import { PODCAST_CLIP_URL } from "../config/media";
import cameras from '../assets/podcast/podcast-cameras.JPG';
import chairs from '../assets/podcast/podcast-chair.JPG';
import mics from '../assets/podcast/podcast-mic.JPG';
import output from '../assets/podcast/podcast-output.JPG';
import light from '../assets/podcast/studio-light2-min.JPG';
import set2 from '../assets/podcast/studio-set2-min.JPG';
import nytview from '../assets/podcast/StudioNightView-min.JPG';
import set from '../assets/podcast/studioSet-min.JPG';

// Intrinsic sizes of the optimised assets, so every <img> can declare
// width/height and reserve its space before the bytes arrive.
const LANDSCAPE = { width: 1400, height: 933 };
const PORTRAIT = { width: 933, height: 1400 };
const IMG_SIZE = {
  [cameras]: { width: 1400, height: 939 },
  [chairs]: { width: 1400, height: 938 },
  [mics]: LANDSCAPE,
  [output]: { width: 1400, height: 931 },
  [light]: PORTRAIT,
  [set2]: LANDSCAPE,
  [nytview]: LANDSCAPE,
  [set]: LANDSCAPE,
};

/** <img> with explicit dimensions, lazy loading and async decoding. */
const StudioImg = ({ src, alt, className }) => (
  <img
    src={src}
    alt={alt}
    width={IMG_SIZE[src].width}
    height={IMG_SIZE[src].height}
    loading="lazy"
    decoding="async"
    className={className}
  />
);



export default function PodcastStudio() {
  

  // `scrollToTop` and `openWhatsApp` helpers used to be declared here; neither
  // was ever wired to anything in the markup.


  
  useEffect(() => {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");
          obs.unobserve(entry.target); // 🔥 stop observing
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "100px 0px",
    }
  );

  document
    .querySelectorAll(
      ".content, .visual, .studio-header, .studio-image, .floating-actions, .sbf-card, .testimonial-card, .testimonial-cta, .sbf-section"
    )
    .forEach(el => observer.observe(el));

  return () => observer.disconnect();
}, []);

const videoRef = React.useRef(null);

useEffect(() => {
  if (!PODCAST_CLIP_URL) return;

  const t = setTimeout(() => {
    // play() returns a promise that rejects if autoplay is blocked or the
    // source failed to load. Unhandled, that surfaced as a console error.
    videoRef.current?.play?.().catch(() => {});
  }, 1200); // play AFTER page settles

  return () => clearTimeout(t);
}, []);



  return (
    <div>
      {/* HERO SECTION */}
      <section className="hero">
       {PODCAST_CLIP_URL && (
         <video
           src={PODCAST_CLIP_URL}
           muted
           loop
           playsInline
           preload="none"
           className="hero-bg-video"
           ref={videoRef}
         />
       )}

        <div className="bg-gradient bg-gradient-1"></div>
        <div className="bg-gradient bg-gradient-2"></div>

        <h1 className="hero-title1">
          <span>YOUR PODCAST BEGINS HERE</span>
          <br />
          <span>IN</span>
          <span className="highlight">VISAKHAPATNAM</span>
        </h1>

        <p className="hero-description1">
          Bring your voice to life at Genie Studio, the city’s most trusted
          podcast recording and content creation space.
        </p>

        <div className="hero-cta">
          <a href="https://wa.me/+919032845433" className="btn btn-primary">
            Book Studio
          </a>
        </div>
      </section>

      {/* NETWORK SECTION */}
      <section className="network-section" id="network">
        <div className="network-content">
          <p className="network-subtitle">OUR SPACE</p>
          <h2 className="network-title">
            Where voices grow louder, stories find rhythm, <br />
            and sound becomes legacy.
          </h2>
        </div>

        <div className="marquee-container">
          <div className="marquee-track">
            <StudioImg src={mics} alt="Studio microphones" />
            <StudioImg src={nytview} alt="The studio at night" />
            <StudioImg src={set} alt="Podcast set" />
            <StudioImg src={light} alt="Studio lighting" />
            <StudioImg src={cameras} alt="Studio cameras" />

            {/* The strip repeats itself to loop seamlessly; the duplicates are
                decorative, so they carry an empty alt. */}
            <StudioImg src={chairs} alt="Studio seating" />
            <StudioImg src={mics} alt="" />
            <StudioImg src={set2} alt="" />
          </div>
        </div>
      </section>

      {/* ADVERTISING SECTION */}
      <section className="advertising-section">
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>

        <div className="container">
          <div className="content">
            <span className="content-label">ADVERTISING</span>
            <h2>YOUR VOICE. OUR STUDIO. ONE VISION.</h2>
            <p>
              At Genie Studio, your ideas become sound that connects. We provide
              high-quality acoustics, professional support, and more.
            </p>
            <a
              href="https://wa.me/+919032845433"
              className="cta-button"
            >
              Get Started
            </a>
          </div>

          <div className="visual">
            <div className="phone-mockup">
              <div className="mic-circle">
                <div className="mic-icon">
                  <div className="mic-stand"></div>
                  <div className="mic-base"></div>
                </div>
              </div>

              <div className="sound-wave">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="wave-bar"></div>
                ))}
              </div>

              <div className="hand-visual"></div>
            </div>
          </div>
        </div>
      </section>

      {/* STUDIO SECTION */}
      <section className="studio-section" id="our-studio">
        <div className="studio-container">
          <div className="left-column">
            <div className="studio-header">
              <h2>A SPACE DESIGNED FOR EVERY CREATOR</h2>
              <p>
                Whether you're a solo podcaster or influencer, Genie Studio
                adapts to you.
              </p>
            </div>

            <div className="studio-image large">
              <StudioImg src={set2} alt="Red studio setup" />
            </div>
          </div>

          <div className="right-column">
            <div className="studio-image small">
              <StudioImg src={nytview} alt="Studio setup at night" />
            </div>

            <div className="studio-image small">
              <StudioImg src={light} alt="Studio lighting setup" />
            </div>
          </div>
        </div>

      </section>

      {/* EQUIPMENT SECTION */}
      <section className="furniture-section" id="equipment">
        <h2 className="section-title">
          Equipped with all the <br /> furniture & props you need
        </h2>

        <div className="furniture-container">
          <div className="furniture-item">
            <StudioImg src={set2} alt="Complete podcast setup" />
            <p className="item-text">1 x complete podcast setup</p>
          </div>

          <div className="furniture-item">
            <StudioImg src={mics} alt="High-quality microphones" />
            <p className="item-text">2 x high-quality mic</p>
          </div>
        </div>
      </section>

      {/* Grid section */}
      <section className="sbf-section">
        <div className="sbf-grid">
          <figure className="sbf-card sbf-left">
            <StudioImg src={cameras} alt="High-quality cameras" />
            <figcaption>3 x high-quality camera</figcaption>
          </figure>

          <figure className="sbf-card sbf-right">
            <StudioImg src={output} alt="Recording output" />
            <figcaption>4 x excellent output</figcaption>
          </figure>

          <figure className="sbf-card sbf-bottom">
            <StudioImg src={nytview} alt="Premium studio set" />
            <figcaption>5 x premium look set</figcaption>
          </figure>
        </div>
      </section>

      <PodcastStudioBooking/>

      {/* TESTIMONIAL SECTION */}
      <section className="testimonial-section" id="reviews">
        <div className="bg-pattern"></div>
        <div className="decor-orb decor-orb-1"></div>
        <div className="decor-orb decor-orb-2"></div>

        <div className="testimonial-container">
          <div className="testimonial-header">
            <span className="testimonial-label">Testimonials</span>
            <h2>WHAT OUR CREATORS SAY</h2>
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

      
    </div>
  );
}
