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

const inlineLink = "text-orange-700 underline underline-offset-2 hover:text-orange-900";

const PODCAST_SERVICES = [
  {
    title: "Studio-only hire",
    body: "Use the studio and its set on your own, from ₹1,500 for one hour.",
  },
  {
    title: "Video podcast with our team",
    body: "Our production team runs the session with two cameras (from ₹3,999 an hour) or three cameras (from ₹5,000 an hour).",
  },
  {
    title: "Audio podcasts and interviews",
    body: "Two microphones on boom arms and a Zoom PodTrak P8 recorder, for solo shows and two-person conversations.",
  },
  {
    title: "Editing and post-production",
    body: (
      <>
        Video and photo editing is available at an additional charge. For shoots
        beyond the studio, see our{" "}
        <a href="/production_house" className={inlineLink}>video production services</a>.
      </>
    ),
  },
];

const PODCAST_FAQS = [
  {
    q: "Where is the podcast studio?",
    a: "At Genie Media & Studio, 5A2, 4th Floor, KP Icon, KP Infra, Yendada, Visakhapatnam 530045.",
  },
  {
    q: "How much does it cost to record a podcast?",
    a: "Studio-only hire starts at ₹1,500 an hour. With our team, sessions start at ₹3,999 an hour with two cameras or ₹5,000 with three. Two- and three-hour rates are listed in the packages above.",
  },
  {
    q: "Can I record a video podcast?",
    a: "Yes. The team packages include two or three cameras, operated by our production team.",
  },
  {
    q: "I have never recorded a podcast. Can I still book?",
    a: "Yes. With a team package, our crew handles the setup and supports you through the recording.",
  },
  {
    q: "Do you edit the podcast?",
    a: "Video and photo editing is available for an additional charge. Mention it when you book.",
  },
  {
    q: "Can businesses use the studio?",
    a: (
      <>
        Yes. Businesses book it for interviews and brand podcasts, and our{" "}
        <a href="/digital_marketing" className={inlineLink}>social media marketing team</a>{" "}
        can help promote the episodes.
      </>
    ),
  },
  {
    q: "How do I book?",
    a: (
      <>
        Use the booking form above, message us on WhatsApp at{" "}
        <a href="https://wa.me/919032845433" className={inlineLink}>+91 90328 45433</a>, or{" "}
        <a href="/contact" className={inlineLink}>contact our studio</a>.
      </>
    ),
  },
];

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
          <span>YOUR PODCAST STUDIO</span>
          <br />
          <span>IN</span>
          <span className="highlight">VISAKHAPATNAM</span>
        </h1>

        <p className="hero-description1">
          Bring your voice to life at Genie Studio. Record audio and video
          podcasts with our production team and up to three cameras.
        </p>

        <div className="hero-cta">
          <a href="https://wa.me/919032845433" className="btn btn-primary">
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
            <StudioImg src={mics} alt="Podcast microphones" />
            <StudioImg src={nytview} alt="Podcast set with a white panelled wall" />
            <StudioImg src={set} alt="Two-seat podcast set with boom microphones" />
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
              href="https://wa.me/919032845433"
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
              <StudioImg src={set2} alt="Blue podcast set with two armchairs, microphones and studio lights" />
            </div>
          </div>

          <div className="right-column">
            <div className="studio-image small">
              <StudioImg src={nytview} alt="White podcast set with two boom microphones" />
            </div>

            <div className="studio-image small">
              <StudioImg src={light} alt="Studio lighting setup" />
            </div>
          </div>
        </div>

      </section>

      {/* WHO CAN USE THE STUDIO */}
      <section className="bg-white text-black px-5 py-16 sm:py-20" id="who-can-use">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title text-center">Who can use our podcast studio?</h2>
          <p className="max-w-3xl mx-auto text-center text-lg text-gray-700 leading-relaxed -mt-8 mb-12">
            Our podcast studio in Visakhapatnam is built for creators, businesses, entrepreneurs and professionals who want high-quality recordings without the hassle of setting up their own space.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Content Creators",
                body: "Record YouTube podcasts, interview episodes and series episodes with professional cameras and audio. Walk in and start recording.",
              },
              {
                title: "Businesses",
                body: "Use the studio for brand podcasts, internal communications and customer-facing interview series. Our production team handles the setup.",
              },
              {
                title: "Entrepreneurs & Professionals",
                body: "Build thought leadership and personal branding through podcasting. Two microphones and a comfortable set make every conversation feel natural.",
              },
              {
                title: "Interview Podcasts",
                body: "Perfect for two-person conversations. Boom microphones, acoustic treatment and a Zoom PodTrak P8 recorder keep both voices crystal clear.",
              },
            ].map(({ title, body }) => (
              <div key={title} className="bg-gray-50 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-gray-700 leading-relaxed">{body}</p>
              </div>
            ))}
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
            <StudioImg src={set2} alt="Complete podcast set with seating and microphones" />
            <p className="item-text">1 x complete podcast setup</p>
          </div>

          <div className="furniture-item">
            <StudioImg src={mics} alt="Two podcast microphones" />
            <p className="item-text">2 x high-quality mic</p>
          </div>
        </div>
      </section>

      {/* Grid section */}
      <section className="sbf-section">
        <div className="sbf-grid">
          <figure className="sbf-card sbf-left">
            <StudioImg src={cameras} alt="Cameras for video podcast recording" />
            <figcaption>3 x high-quality camera</figcaption>
          </figure>

          <figure className="sbf-card sbf-right">
            <StudioImg src={output} alt="Zoom PodTrak P8 podcast recorder" />
            <figcaption>4 x excellent output</figcaption>
          </figure>

          <figure className="sbf-card sbf-bottom">
            <StudioImg src={nytview} alt="Premium studio set" />
            <figcaption>5 x premium look set</figcaption>
          </figure>
        </div>
      </section>

      <PodcastStudioBooking/>

      {/* SERVICES, BOOKING AND FAQ
          Every fact here comes from the booking widget above (packages, prices,
          hourly slots, WhatsApp confirmation), the podcast tab of
          components/AllServices.jsx (editing at extra charge, team support) or
          the address in the footer. Keep them in step. */}
      <section className="bg-[#f1f1f1] text-black px-5 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title text-center">Podcast recording in Visakhapatnam</h2>
          <p className="max-w-3xl mx-auto text-center text-lg text-gray-700 leading-relaxed -mt-8 mb-12">
            Book the studio on your own, or with our production team running two or
            three cameras. It suits video podcasts, interviews and YouTube shows for
            creators, businesses and professionals.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            {PODCAST_SERVICES.map(({ title, body }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-gray-700 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          <h2 className="section-title text-center mt-20">How to book the studio</h2>
          <ol className="max-w-3xl mx-auto -mt-8 space-y-3 text-lg text-gray-700 list-decimal pl-6">
            <li>Choose a package above: studio only, or studio with our team and two or three cameras.</li>
            <li>Pick a date and an hourly slot between 10 am and 7 pm.</li>
            <li>Add your name, email, phone number and any notes.</li>
            <li>Send the booking to us on WhatsApp to confirm your slot.</li>
          </ol>

          <h2 className="section-title text-center mt-20">Podcast studio FAQs</h2>
          <div className="max-w-3xl mx-auto -mt-8 space-y-8">
            {PODCAST_FAQS.map(({ q, a }) => (
              <div key={q}>
                <h3 className="text-xl font-bold mb-2">{q}</h3>
                <p className="text-gray-700 text-lg leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
            <a href="/contact" target="_blank" rel="noopener" className="cta-button">
              Book Your Session Today
            </a>
          </div>
        </div>
      </section>

      
    </div>
  );
}
