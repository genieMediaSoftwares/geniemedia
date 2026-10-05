import { Quote, Star } from "lucide-react";

/**
 * "What our creators say" block, shared by /podcast_studio and /reviews.
 *
 * Cards and the CTA carry `data-reveal`; the page's IntersectionObserver adds
 * the `animate` class when they scroll into view, and the `[&.animate]:`
 * variants below play the reveal.
 */

const SECTION =
  "relative overflow-hidden bg-[#f8f4fcc5] px-10 py-[60px] max-[1024px]:px-[30px] max-[1024px]:py-[100px] max-[768px]:px-5 max-[768px]:py-20 max-[480px]:px-4 max-[480px]:py-[60px]";
const ORB = "pointer-events-none absolute z-0 rounded-full opacity-[0.08] blur-[100px]";

const CARD =
  "relative cursor-pointer rounded-[24px] border-2 border-[#f0f0f0] bg-white p-10 opacity-0 shadow-[0_4px_20px_rgba(0,0,0,0.04)] [transform:translateY(40px)_scale(0.95)] [&.animate]:opacity-100 [&.animate]:[transform:translateY(0)_scale(1)] hover:!border-[#e5e5e5] hover:!shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:![transform:translateY(-8px)_scale(1)] max-[768px]:px-6 max-[768px]:py-8 max-[480px]:px-5 max-[480px]:py-7";
// Staggered reveal, one step per card.
const CARD_TRANSITION = [
  "[transition:all_0.8s_cubic-bezier(0.16,1,0.3,1)_0.1s]",
  "[transition:all_0.8s_cubic-bezier(0.16,1,0.3,1)_0.2s]",
  "[transition:all_0.8s_cubic-bezier(0.16,1,0.3,1)_0.3s]",
];

/** Orange pill CTA (the merged result of the two old `.cta-button` rules). */
export const PODCAST_CTA_BUTTON =
  "inline-block cursor-pointer rounded-[50px] border-none !bg-[#f97316] px-12 py-[18px] text-[16px] font-bold text-[#0a0a0a] no-underline shadow-[0_10px_30px_rgba(106,0,255,0.3)] [transition:all_0.3s_cubic-bezier(0.34,1.56,0.64,1)] hover:[transform:translateY(-4px)_scale(1.05)] hover:shadow-[0_15px_40px_rgba(157,0,255,0.4)] active:[transform:translateY(-2px)_scale(1.02)] max-[768px]:w-full max-[768px]:max-w-[300px] max-[768px]:px-4 max-[768px]:py-[10px] max-[768px]:text-[12px] max-[480px]:!max-w-[55%]";

const REVIEWS = [
  {
    quote:
      "The studio quality is absolutely incredible. The acoustics are perfect, and the equipment is top-notch. Our podcast has never sounded better since we started recording here.",
    initials: "SP",
    name: "Sasidhar Pydiraju",
  },
  {
    quote:
      "Professional setup with amazing support staff. They helped us every step of the way, from setup to post-production. Highly recommend for serious podcasters!",
    initials: "AS",
    name: "Aruna Sai Kumar",
  },
  {
    quote:
      "As a beginner, I was nervous about recording my first podcast. The team made everything so easy and welcoming. The studio space is inspiring and the results are phenomenal!",
    initials: "S",
    name: "Shanmuk",
  },
];

export default function StudioReviews({
  heading,
  orbAnimation,
}: {
  heading: string;
  /** The background orbs' animation utility (differs between the two pages). */
  orbAnimation: string;
}) {
  return (
    <section className={SECTION} id="reviews">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle,#FF6B00_1px,transparent_1px)] [background-size:50px_50px] opacity-[0.02]" />
      <div className={`${ORB} ${orbAnimation} -right-[200px] -top-[200px] h-[500px] w-[500px] bg-[#FF6B00]`} />
      <div className={`${ORB} ${orbAnimation} ![animation-delay:-10s] -bottom-[150px] -left-[150px] h-[400px] w-[400px] bg-[#FF8C3A]`} />

      <div className="relative z-[1] mx-auto max-w-[1200px]">
        <div className="mb-10 translate-y-[30px] text-center [transition:all_1s_cubic-bezier(0.16,1,0.3,1)] max-[1024px]:mb-[60px]">
          <span className="mb-5 inline-block rounded-[25px] bg-gray-100 px-5 py-2 text-[13px] font-semibold uppercase tracking-[3px] !text-[#c2410c]">
            Testimonials
          </span>
          <h2 className="mb-5 text-[clamp(36px,5vw,56px)] font-extrabold leading-[1.2] tracking-[-0.02em] text-[#1a1a1a] max-[768px]:text-[32px] max-[480px]:text-[28px]">
            {heading}
          </h2>
          <p className="mx-auto text-[clamp(16px,1.8vw,20px)] leading-[1.6] text-[#403e3e]">
            Every voice, every emotion, every story, that’s the Genie Media &amp; Studio experience.
          </p>
        </div>

        <div className="mb-[60px] grid gap-[30px] [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))] max-[1024px]:gap-6 max-[768px]:grid-cols-1 max-[768px]:gap-5">
          {REVIEWS.map((review, i) => (
            <div key={review.name} data-reveal className={`${CARD} ${CARD_TRANSITION[i]}`}>
              <div className="relative mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#f97316] shadow-[0_4px_12px_rgba(255,107,0,0.2)] max-[480px]:h-10 max-[480px]:w-10">
                <Quote className="h-6 w-6 text-white max-[480px]:h-5 max-[480px]:w-5" fill="currentColor" aria-hidden="true" />
              </div>
              <div className="mb-5 flex gap-1.5" role="img" aria-label="Rated 5 out of 5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className="h-5 w-5 text-[#FF6B00] drop-shadow-[0_2px_4px_rgba(255,107,0,0.2)]"
                    fill="currentColor"
                    aria-hidden="true"
                  />
                ))}
              </div>

              <p className="mb-[30px] text-[16px] italic leading-[1.7] text-[#333333] max-[768px]:text-[15px]">
                &quot;{review.quote}&quot;
              </p>

              <div className="flex items-center gap-4 border-t-2 border-[#f5f5f5] pt-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f97316] text-[24px] font-bold text-[#0a0a0a] shadow-[0_4px_12px_rgba(255,107,0,0.2)] max-[480px]:h-12 max-[480px]:w-12">
                  {review.initials}
                </div>
                <div>
                  <h3 className="mb-1 text-[18px] font-bold text-[#1a1a1a] max-[480px]:text-[16px]">{review.name}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          data-reveal
          className="mt-[60px] translate-y-[30px] text-center opacity-0 [transition:all_1s_cubic-bezier(0.16,1,0.3,1)_0.4s] [&.animate]:translate-y-0 [&.animate]:opacity-100"
        >
          <a href="/contact" target="_blank" rel="noopener" className={PODCAST_CTA_BUTTON}>
            Book Your Session Today
          </a>
        </div>
      </div>
    </section>
  );
}
