"use client";

import React, { useEffect, type ReactNode } from "react";
import { Mic } from "lucide-react";
import PodcastStudioBooking from "@/components/StudioBooking";
import StudioReviews, { PODCAST_CTA_BUTTON } from "@/components/StudioReviews";
import { PODCAST_CLIP_URL } from "@/config/media";
import camerasAsset from "@/assets/podcast/podcast-cameras.jpg";
import chairsAsset from "@/assets/podcast/podcast-chair.jpg";
import micsAsset from "@/assets/podcast/podcast-mic.jpg";
import outputAsset from "@/assets/podcast/podcast-output.jpg";
import lightAsset from "@/assets/podcast/studio-light2-min.jpg";
import set2Asset from "@/assets/podcast/studio-set2-min.jpg";
import nytviewAsset from "@/assets/podcast/StudioNightView-min.jpg";
import setAsset from "@/assets/podcast/studioSet-min.jpg";
import { CONTENT_LINK } from "@/lib/linkStyles";

const cameras = camerasAsset.src;
const chairs = chairsAsset.src;
const mics = micsAsset.src;
const output = outputAsset.src;
const light = lightAsset.src;
const set2 = set2Asset.src;
const nytview = nytviewAsset.src;
const set = setAsset.src;
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

const inlineLink = CONTENT_LINK;

const PODCAST_SERVICES = [
  {
    title: "Studio-only hire",
    body: "Use the studio and its set on your own, from ₹1,500 for one hour.",
  },
  {
    title: "Video podcast with our team",
    body: "For video podcast production, our team handles the podcast filming with two cameras (from ₹3,999 an hour) or three cameras (from ₹5,000 an hour).",
  },
  {
    title: "Audio podcasts and interviews",
    body: "Two microphones on boom arms and a Zoom PodTrak P8 recorder, for solo shows and two-person conversations.",
  },
  {
    title: "Editing and post-production",
    body: (
      <>
        Podcast editing for audio and video, including short clips for Reels and
        Shorts, plus photo editing, is available at an additional charge. For shoots
        beyond the studio, see our{" "}
        <a href="/production_house" className={inlineLink}>video production services</a>.
      </>
    ),
  },
];

const PODCAST_FAQS = [
  {
    q: "Where is the podcast studio?",
    a: "At Genie Media & Studio, 5A-2, 4th Floor, KP Icon, Yendada, Visakhapatnam, near MK Gold Coast, Endada, Andhra Pradesh 530045.",
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
        Yes. Businesses book it for interviews, branded podcasts and corporate
        podcasts, and our{" "}
        <a href="/digital_marketing" className={inlineLink}>social media marketing team</a>{" "}
        can help promote the episodes. You can also see{" "}
        <a href="/projects" className={inlineLink}>our client projects</a> or read{" "}
        <a href="/blogs" className={inlineLink}>content and marketing tips on our blog</a>.
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

const StudioImg = ({ src, alt, className = "" }: { src: string; alt: string; className?: string }) => (
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

const HERO =
  "relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-10 pb-[60px] pt-[120px] text-center text-white before:absolute before:inset-0 before:z-[-1] before:bg-black/80 before:content-[''] max-[768px]:px-5 max-[768px]:pb-10 max-[768px]:pt-[100px]";
const HERO_GLOW = "absolute z-0 h-[600px] w-[600px] rounded-full opacity-[0.15] blur-[120px] animate-podcast-drift-20";
const HERO_BUTTON =
  "relative cursor-pointer overflow-hidden rounded-[25px] border-none bg-[#F97316] px-10 py-4 text-[16px] font-semibold text-black no-underline transition-all duration-300 ease-[ease] before:absolute before:-left-full before:top-0 before:h-full before:w-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] before:transition-[left] before:duration-500 before:ease-[ease] before:content-[''] hover:-translate-y-0.5 hover:bg-[rgb(7,0,17)] hover:text-white hover:shadow-[0_12px_35px_rgba(255,107,0,0.4)] hover:before:left-full max-[768px]:w-[70%] max-[768px]:text-center max-[768px]:!text-[18px]";

const MARQUEE_IMG =
  "h-[320px] w-[320px] rounded-xl object-cover shadow-[0_4px_12px_rgba(0,0,0,0.1)] [transition:transform_0.3s_ease,box-shadow_0.3s_ease] hover:scale-105 hover:shadow-[0_6px_18px_rgba(0,0,0,0.2)] max-[768px]:h-[180px] max-[768px]:w-[180px]";

const STUDIO_IMAGE =
  `group/img relative overflow-hidden rounded-[24px] opacity-0 [transform:scale(0.85)_translateY(40px)] [&.animate]:opacity-100 [&.animate]:[transform:scale(1)_translateY(0)] after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.4)_100%)] after:opacity-0 after:[transition:opacity_0.4s_ease] after:content-[''] hover:after:opacity-100 max-[640px]:rounded-[18px]`;
const STUDIO_IMAGE_IMG =
  "block h-full w-full object-cover [transition:transform_0.7s_cubic-bezier(0.16,1,0.3,1)] group-hover/img:scale-[1.08]";
const STUDIO_LARGE = "h-[500px] max-[968px]:h-[450px] max-[640px]:h-[320px] max-[480px]:h-[280px]";
const STUDIO_SMALL = "h-[340px] max-[1200px]:h-[300px] max-[968px]:h-[280px] max-[640px]:h-[240px] max-[480px]:h-[220px]";
const STUDIO_COLUMN = "flex flex-col gap-[30px] max-[1200px]:gap-6 max-[968px]:gap-5 max-[640px]:gap-4";

const SECTION_TITLE =
  "mb-[60px] text-[2.5rem] font-extrabold uppercase leading-[1.4] tracking-[2px] max-[1024px]:text-[2rem] max-[768px]:text-[1.8rem]";

const FURNITURE_IMG =
  "w-[600px] max-w-full rounded-[25px] shadow-[0_8px_25px_rgba(0,0,0,0.15)] [transition:transform_0.5s_ease,box-shadow_0.5s_ease] group-hover/item:scale-105 group-hover/item:shadow-[0_12px_30px_rgba(0,0,0,0.25)] max-[1024px]:w-[450px] max-[768px]:w-[90%]";

const SBF_CARD = "group/card w-full translate-y-[30px] overflow-visible rounded-[18px] text-center opacity-100 [transition:transform_.7s_cubic-bezier(.2,.9,.2,1),opacity_.7s_ease]";
const SBF_IMG =
  "block h-auto w-full rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.12)] [transition:transform_.45s_ease,box-shadow_.45s_ease] group-hover/card:scale-[1.03] group-hover/card:shadow-[0_20px_40px_rgba(0,0,0,0.16)]";
const SBF_CAPTION = "mt-[18px] text-[1.25rem] font-bold italic text-[#111]";

const WAVE_BARS = [
  "h-[40px] ![animation-delay:0s]", "h-[60px] ![animation-delay:0.1s]", "h-[45px] ![animation-delay:0.2s]", "h-[80px] ![animation-delay:0.3s]",
  "h-[55px] ![animation-delay:0.4s]", "h-[70px] ![animation-delay:0.5s]", "h-[50px] ![animation-delay:0.6s]", "h-[65px] ![animation-delay:0.7s]",
  "h-[75px] ![animation-delay:0.8s]", "h-[48px] ![animation-delay:0.9s]", "h-[90px] ![animation-delay:1s]", "h-[60px] ![animation-delay:1.1s]",
  "h-[70px] ![animation-delay:1.2s]", "h-[55px] ![animation-delay:1.3s]", "h-[85px] ![animation-delay:1.4s]", "h-[45px] ![animation-delay:1.5s]",
  "h-[68px] ![animation-delay:1.6s]", "h-[72px] ![animation-delay:1.7s]", "h-[58px] ![animation-delay:1.8s]", "h-[65px] ![animation-delay:1.9s]",
];

export default function PodcastStudio({ platforms }: { platforms?: ReactNode }) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "100px 0px" },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!PODCAST_CLIP_URL) return;
    const t = setTimeout(() => {
      videoRef.current?.play?.().catch(() => {});
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div>
      <section className={HERO}>
        {PODCAST_CLIP_URL && (
          <video
            src={PODCAST_CLIP_URL}
            muted
            loop
            playsInline
            preload="none"
            className="absolute left-0 top-0 z-[-2] h-full w-full object-cover"
            ref={videoRef}
          />
        )}

        <div className={`${HERO_GLOW} -left-[200px] -top-[200px] bg-[#FF6B00]`}></div>
        <div className={`${HERO_GLOW} ![animation-delay:-10s] -bottom-[200px] -right-[200px] left-0 top-0 bg-[#6B4FFF]`}></div>

        <h1 className="mb-5 mt-10 text-center text-[clamp(38px,6vw,60px)] font-extrabold leading-[1.1] tracking-[-0.03em]">
          <span className="inline-block animate-podcast-hero-rise">PODCAST STUDIO</span>
          <br />
          <span className="inline-block animate-podcast-hero-rise ![animation-delay:0.08s]">IN</span>
          <span className="ml-[1.2rem] inline-block animate-podcast-hero-rise bg-[linear-gradient(135deg,#ffffff,#ffffff)] bg-clip-text [-webkit-text-fill-color:transparent]">
            VIZAG
          </span>
        </h1>

        <p className="mb-10 max-w-[700px] animate-podcast-desc text-center text-[clamp(16px,2vw,18px)] leading-[1.6] text-white">
          Book our podcast studio in Vizag (Visakhapatnam) to record audio and video podcasts with professional equipment and our production team. We support solo shows, two-person conversations and video podcasts with up to three cameras.
        </p>

        <div className="flex animate-podcast-cta items-center gap-5 max-[768px]:w-full max-[768px]:flex-col">
          <a href="https://wa.me/919032845433" className={HERO_BUTTON}>
            Book Studio
          </a>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[linear-gradient(90deg,#f2f2f5,#e8e8ec)] px-10 py-[60px] text-center text-[#222] max-[768px]:px-[10px] max-[768px]:py-10" id="network">
        <div>
          <p className="mb-[15px] text-[16px] uppercase tracking-[3px] text-[#f97316]">OUR SPACE</p>
          <h2 className="mb-[25px] text-[38px] font-extrabold leading-[1.3] max-[768px]:text-[24px]">
            Where voices grow louder, stories find rhythm, <br />
            and sound becomes legacy.
          </h2>
        </div>

        <div className="mt-[60px] overflow-hidden">
          <div className="flex w-max animate-podcast-marquee gap-[30px]">
            <StudioImg src={mics} alt="Podcast microphones" className={MARQUEE_IMG} />
            <StudioImg src={nytview} alt="Podcast set with a white panelled wall" className={MARQUEE_IMG} />
            <StudioImg src={set} alt="Two-seat podcast set with boom microphones" className={MARQUEE_IMG} />
            <StudioImg src={light} alt="Studio lighting" className={MARQUEE_IMG} />
            <StudioImg src={cameras} alt="Studio cameras" className={MARQUEE_IMG} />

            <StudioImg src={chairs} alt="Studio seating" className={MARQUEE_IMG} />
            <StudioImg src={mics} alt="" className={MARQUEE_IMG} />
            <StudioImg src={set2} alt="" className={MARQUEE_IMG} />
          </div>
        </div>
      </section>

      <section className="relative flex min-h-screen items-center overflow-hidden bg-[linear-gradient(135deg,#0a2e2a_0%,#1a1a1a_100%)] p-[60px] max-[768px]:p-5 max-[768px]:!pb-0 max-[480px]:px-5 max-[480px]:pt-[60px]">
        <div className="absolute -left-[100px] -top-[100px] h-[400px] w-[400px] animate-podcast-drift-15 rounded-full bg-[#FFD93D] opacity-[0.15] blur-[80px]"></div>
        <div className="absolute -bottom-[100px] right-[100px] h-[300px] w-[300px] animate-podcast-drift-15 rounded-full bg-[#6B4FFF] opacity-[0.15] blur-[80px] ![animation-delay:-7s]"></div>

        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-2 items-center gap-20 max-[1024px]:gap-[60px] max-[768px]:grid-cols-1 max-[768px]:gap-[30px]">
          <div data-reveal className="-translate-x-[100px] opacity-0 [transition:all_1s_cubic-bezier(0.16,1,0.3,1)] [&.animate]:translate-x-0 [&.animate]:opacity-100">
            <span className="mb-5 block text-[13px] font-semibold uppercase tracking-[3px] text-white/60">ADVERTISING</span>
            <h2 className="mb-[30px] text-[clamp(32px,5vw,56px)] font-extrabold leading-[1.2] tracking-[-0.02em] text-white max-[768px]:text-[36px] max-[480px]:text-[28px]">
              YOUR VOICE. OUR STUDIO. ONE VISION.
            </h2>
            <p className="mb-10 max-w-[580px] text-[clamp(16px,1.8vw,18px)] leading-[1.7] text-white/75">
              At Genie Media & Studio, your ideas become sound that connects. We provide
              high-quality acoustics, professional support, and more.
            </p>
            <a href="https://wa.me/919032845433" className={PODCAST_CTA_BUTTON}>
              Get Started
            </a>
          </div>

          <div data-reveal className="relative h-[500px] translate-x-[100px] opacity-0 [transition:all_1s_cubic-bezier(0.16,1,0.3,1)_0.2s] [&.animate]:translate-x-0 [&.animate]:opacity-100 max-[768px]:h-[400px]">
            <div className="relative flex h-full w-full items-center justify-center">
              <div className="absolute right-[100px] top-[50px] z-10 flex h-[180px] w-[180px] animate-podcast-drift-3 items-center justify-center rounded-full bg-[#8e43dd] shadow-[0_20px_60px_rgba(255,217,61,0.4)] max-[1024px]:right-[80px] max-[1024px]:h-[150px] max-[1024px]:w-[150px] max-[768px]:right-5 max-[768px]:top-5 max-[768px]:h-[120px] max-[768px]:w-[120px]">
                <Mic className="h-[64px] w-[64px] text-[#0a0a0a] max-[768px]:h-[48px] max-[768px]:w-[48px]" strokeWidth={2.5} aria-hidden="true" />
              </div>

              <div className="absolute left-1/2 top-1/2 flex h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1 rounded-[50px] border-2 border-white/10 bg-white/[0.03] p-10 max-[1024px]:h-[250px] max-[1024px]:w-[400px] max-[768px]:h-[200px] max-[768px]:w-full max-[768px]:max-w-[350px] max-[768px]:px-5 max-[768px]:py-[30px]">
                {WAVE_BARS.map((bar, i) => (
                  <div
                    key={i}
                    className={`w-[3px] animate-podcast-wave rounded-[2px] bg-[linear-gradient(to_top,rgba(255,217,61,0.3),rgba(255,217,61,0.8))] max-[768px]:w-[2px] ${bar}`}
                  ></div>
                ))}
              </div>

              <div className="absolute -bottom-[50px] -right-[50px] h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(255,217,61,0.1)_0%,transparent_70%)] opacity-50 max-[768px]:h-[200px] max-[768px]:w-[200px]"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-white px-[60px] py-20 max-[1200px]:px-10 max-[1200px]:py-[60px] max-[968px]:px-[30px] max-[968px]:py-[50px] max-[640px]:px-5 max-[640px]:py-10" id="our-studio">
        <div className="mx-auto grid max-w-[1600px] grid-cols-2 items-start gap-[30px] max-[1200px]:gap-6 max-[968px]:grid-cols-1 max-[968px]:gap-[30px] max-[640px]:gap-5">
          <div className={STUDIO_COLUMN}>
            <div data-reveal className="-translate-x-[80px] opacity-0 [transition:all_1.2s_cubic-bezier(0.16,1,0.3,1)] [&.animate]:translate-x-0 [&.animate]:opacity-100 max-[640px]:mb-[10px]">
              <h2 className="mb-4 text-[clamp(32px,4vw,56px)] font-black uppercase leading-[1.1] tracking-[-0.5px] text-black max-[968px]:text-[38px] max-[640px]:mb-3 max-[640px]:text-[28px] max-[480px]:text-[24px]">
                A SPACE DESIGNED FOR EVERY CREATOR
              </h2>
              <p className="max-w-[600px] text-[clamp(15px,1.5vw,18px)] font-normal leading-[1.6] text-[#333333] max-[968px]:text-[16px] max-[640px]:text-[14px] max-[640px]:leading-[1.5]">
                Whether you&apos;re a solo podcaster or an influencer, our podcast studio in Visakhapatnam adapts to you. First, choose a studio-only session. Next, add our team and cameras. Then record your show in comfort. Finally, walk away with a finished episode ready to publish.
              </p>
            </div>

            <div data-reveal className={`${STUDIO_IMAGE} ${STUDIO_LARGE} [transition:all_1s_cubic-bezier(0.16,1,0.3,1)_0.15s]`}>
              <StudioImg src={set2} alt="Blue podcast set with two armchairs, microphones and studio lights" className={STUDIO_IMAGE_IMG} />
            </div>
          </div>

          <div className={STUDIO_COLUMN}>
            <div data-reveal className={`${STUDIO_IMAGE} ${STUDIO_SMALL} [transition:all_1s_cubic-bezier(0.16,1,0.3,1)_0.3s]`}>
              <StudioImg src={nytview} alt="White podcast set with two boom microphones" className={STUDIO_IMAGE_IMG} />
            </div>

            <div data-reveal className={`${STUDIO_IMAGE} ${STUDIO_SMALL} [transition:all_1s_cubic-bezier(0.16,1,0.3,1)_0.45s]`}>
              <StudioImg src={light} alt="Studio lighting setup" className={STUDIO_IMAGE_IMG} />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white text-black px-5 py-16 sm:py-20" id="who-can-use">
        <div className="max-w-6xl mx-auto">
          <h2 className={`${SECTION_TITLE} text-center`}>Who can use our podcast studio?</h2>
          <p className="max-w-3xl mx-auto text-center text-lg text-gray-700 leading-relaxed -mt-8 mb-12">
            Our podcast studio in Visakhapatnam is built for creators, businesses, entrepreneurs and professionals who want high-quality recordings without the hassle of setting up their own space.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Content Creators",
                body: <>Record YouTube podcasts and interview episodes with professional cameras and audio. First, book your slot. Then walk in and start recording. Afterwards, share your episode with your audience.</>,
              },
              {
                title: "Businesses",
                body: <>Use the studio for brand podcasts and customer interview series. Our <a href="/digital_marketing" className={inlineLink}>social media marketing</a> team can also help promote each episode across your channels.</>,
              },
              {
                title: "Entrepreneurs & Professionals",
                body: <>Build thought leadership through podcasting. Because two microphones and a comfortable set are included, every conversation feels natural and professional.</>,
              },
              {
                title: "Interview Podcasts",
                body: <>This studio is perfect for two-person conversations. Boom microphones, acoustic treatment and a Zoom PodTrak P8 recorder keep both voices crystal clear. Then our <a href="/production_house" className={inlineLink}>video production team</a> can help with the final edit.</>,
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

      <section className="bg-[#f1f1f1] px-5 pb-20 pt-5 text-center text-black" id="equipment">
        <h2 className={SECTION_TITLE}>
          Equipped with all the <br /> furniture & props you need
        </h2>

        <div className="flex flex-wrap items-start justify-center gap-[60px] max-[768px]:flex-col max-[768px]:gap-10">
          <div className="group/item flex animate-podcast-item flex-col items-center">
            <StudioImg src={set2} alt="Complete podcast set with seating and microphones" className={FURNITURE_IMG} />
            <p className="mt-[15px] text-[1.5rem] font-bold italic text-black max-[768px]:text-[1.3rem]">1 x complete podcast setup</p>
          </div>

          <div className="group/item flex animate-podcast-item flex-col items-center">
            <StudioImg src={mics} alt="Two podcast microphones" className={FURNITURE_IMG} />
            <p className="mt-[15px] text-[1.5rem] font-bold italic text-black max-[768px]:text-[1.3rem]">2 x high-quality mic</p>
          </div>
        </div>
      </section>

      <section className="-mt-10 bg-[#f1f1f1] pb-[30px]">
        <div className="mx-auto grid max-w-[1360px] grid-cols-2 items-start justify-items-center gap-12 [grid-template-areas:'left_right'_'bottom_bottom'] [grid-template-rows:auto_auto] max-[900px]:gap-[30px] max-[700px]:grid-cols-1 max-[700px]:gap-7 max-[700px]:[grid-template-areas:'left'_'right'_'bottom']">
          <figure data-reveal className={`${SBF_CARD} mr-[140px] max-w-[440px] [grid-area:left] max-[900px]:max-w-[480px] max-[700px]:m-0 max-[700px]:max-w-[92%]`}>
            <StudioImg src={cameras} alt="Cameras for video podcast recording" className={SBF_IMG} />
            <figcaption className={SBF_CAPTION}>3 x high-quality camera</figcaption>
          </figure>

          <figure data-reveal className={`${SBF_CARD} ml-[140px] max-w-[440px] [grid-area:right] max-[900px]:max-w-[480px] max-[700px]:m-0 max-[700px]:max-w-[92%]`}>
            <StudioImg src={output} alt="Zoom PodTrak P8 podcast recorder" className={SBF_IMG} />
            <figcaption className={SBF_CAPTION}>4 x excellent output</figcaption>
          </figure>

          <figure data-reveal className={`${SBF_CARD} -mt-[90px] max-w-[420px] [grid-area:bottom] max-[900px]:max-w-[480px] max-[700px]:mt-0 max-[700px]:max-w-[92%]`}>
            <StudioImg src={nytview} alt="Premium studio set" className={SBF_IMG} />
            <figcaption className={SBF_CAPTION}>5 x premium look set</figcaption>
          </figure>
        </div>
      </section>

      <PodcastStudioBooking/>

      <section className="bg-[#f1f1f1] text-black px-5 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className={`${SECTION_TITLE} text-center`}>Podcast recording in Visakhapatnam</h2>
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

          <h2 className={`${SECTION_TITLE} text-center mt-20`}>How to book the studio</h2>
          <ol className="max-w-3xl mx-auto -mt-8 space-y-3 text-lg text-gray-700 list-decimal pl-6">
            <li>Choose a package above: studio only, or studio with our team and two or three cameras.</li>
            <li>Pick a date and an hourly slot between 10 am and 7 pm.</li>
            <li>Add your name, email, phone number and any notes.</li>
            <li>Send the booking to us on WhatsApp to confirm your slot.</li>
          </ol>

          <h2 className={`${SECTION_TITLE} text-center mt-20`}>Podcast studio FAQs</h2>
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

      {platforms}

      <StudioReviews heading="WHAT OUR CREATORS SAY" orbAnimation="animate-podcast-drift-20" />
    </div>
  );
}
