// Real client feedback shown on /reviews, the home page and the service pages.
// Only add quotes the client actually gave and approved; never write or edit testimonials.

export interface VideoTestimonial {
  id: number;
  name: string;
  company: string;
  rating: number;
  videoId: string;
  quote: string;
}

export const VIDEO_TESTIMONIALS: VideoTestimonial[] = [
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
    name: "Deepak Kumar Sharma",
    company: "Nutritionist",
    rating: 5,
    videoId: "mUpfyEFMpeY",
    quote: "The creativity and professionalism exceeded all our expectations!"
  },
  {
    id: 4,
    name: "Heena M Shrivastava",
    company: "Book Author & Coach",
    rating: 5,
    videoId: "poK_yAMsmUQ",
    quote: "I'm  worried about my website design & getting no traffic Then karthik came and delivered such a beautiful website for me."
  },
  {
    id: 5,
    name: "Kedhar Panda",
    company: "Book Author & Coach",
    rating: 5,
    videoId: "oGxKBpu7x1I",
    quote: "They truly understood our brand and delivered beyond expectations!"
  }
];

export const STUDIO_REVIEWS = [
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

// Clients the owner confirmed on 2026-10-12. Add a url only for a live site we built.
export const CLIENTS: Array<{ name: string; url?: string }> = [
  { name: "Naren Ultrasound" },
  { name: "Alliance College" },
  { name: "SVN Bay Parck" },
  { name: "Meera Basu", url: "https://meerabasu.co.in/" },
];

// Looks up quotes by client name for the service sub-pages (order follows `names`).
export function testimonialsByName(names: string[]): Array<{ name: string; role: string; quote: string }> {
  const all = [
    ...VIDEO_TESTIMONIALS.map((t) => ({ name: t.name, role: t.company, quote: t.quote })),
    ...STUDIO_REVIEWS.map((r) => ({ name: r.name, role: "Podcast studio client", quote: r.quote })),
  ];
  return names
    .map((n) => all.find((t) => t.name === n))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .map((t) => ({ ...t, quote: t.quote.replace(/\s+/g, " ").trim() }));
}
