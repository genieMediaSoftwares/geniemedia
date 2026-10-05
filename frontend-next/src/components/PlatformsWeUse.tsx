import type { ReactNode } from "react";
import {
  siApplepodcasts, siCloudflare, siDavinciresolve, siExpress, siFacebook, siFirebase, siGoogleads,
  siGoogleanalytics, siGooglesearchconsole, siGoogletagmanager, siHubspot, siInstagram, siJavascript,
  siMailchimp, siMeta, siMongodb, siNextdotjs, siNodedotjs, siReact, siRender, siSemrush, siShopify,
  siSpotify, siTailwindcss, siTypescript, siVercel, siVimeo, siWordpress, siYoutube,
  type SimpleIcon,
} from "simple-icons";

import adobeAfterEffects from "@/assets/platforms/adobe-after-effects.webp";
import adobeAudition from "@/assets/platforms/adobe-audition.webp";
import adobeLightroom from "@/assets/platforms/adobe-lightroom.webp";
import adobePhotoshop from "@/assets/platforms/adobe-photoshop.webp";
import adobePremierePro from "@/assets/platforms/adobe-premiere-pro.webp";
import ahrefs from "@/assets/platforms/ahrefs.webp";
import canva from "@/assets/platforms/canva.webp";
import capcut from "@/assets/platforms/capcut.webp";
import googleBusinessProfile from "@/assets/platforms/google-business-profile.webp";
import linkedin from "@/assets/platforms/linkedin.webp";
import riverside from "@/assets/platforms/riverside.webp";
import streamyard from "@/assets/platforms/streamyard.webp";

/**
 * The platforms and tools behind each service, in one place. Add or remove a
 * platform here and every page showing that list updates.
 *
 * Logos come from two sources:
 * - `icon`: an official brand mark from the simple-icons package, drawn as
 *   inline SVG on the server (no request, no client JavaScript).
 * - `image`: a 72px WebP in src/assets/platforms/ for brands that are not in
 *   simple-icons (Adobe apps, LinkedIn, Canva, CapCut and others), taken from
 *   each brand's own icon or its Wikimedia Commons logo.
 * React Native uses the React logo, as React Native's own branding does.
 */
type Logo =
  | { icon: SimpleIcon; color?: string }
  | { image: { src: string } };

interface Platform {
  name: string;
  alt: string;
  logo: Logo;
}

const si = (icon: SimpleIcon, color?: string): Logo => ({ icon, color });
const img = (image: { src: string }): Logo => ({ image });

// Shared entries (same logo and description wherever they appear).
const YOUTUBE: Platform = { name: "YouTube", alt: "YouTube platform", logo: si(siYoutube) };
const INSTAGRAM: Platform = { name: "Instagram", alt: "Instagram platform", logo: si(siInstagram) };
const FACEBOOK: Platform = { name: "Facebook", alt: "Facebook platform", logo: si(siFacebook) };
const LINKEDIN: Platform = { name: "LinkedIn", alt: "LinkedIn platform", logo: img(linkedin) };
const CANVA: Platform = { name: "Canva", alt: "Canva design platform", logo: img(canva) };
const WORDPRESS: Platform = { name: "WordPress", alt: "WordPress platform", logo: si(siWordpress) };
const SHOPIFY: Platform = { name: "Shopify", alt: "Shopify platform", logo: si(siShopify) };
const PREMIERE: Platform = { name: "Adobe Premiere Pro", alt: "Adobe Premiere Pro", logo: img(adobePremierePro) };
const DAVINCI: Platform = { name: "DaVinci Resolve", alt: "DaVinci Resolve", logo: si(siDavinciresolve) };

export const PLATFORMS = {
  webDevelopment: [
    { name: "React", alt: "React development technology", logo: si(siReact) },
    { name: "React Native", alt: "React Native development technology", logo: si(siReact) },
    { name: "Node.js", alt: "Node.js development technology", logo: si(siNodedotjs) },
    { name: "Express.js", alt: "Express.js development technology", logo: si(siExpress) },
    { name: "MongoDB", alt: "MongoDB database technology", logo: si(siMongodb) },
    { name: "Next.js", alt: "Next.js development technology", logo: si(siNextdotjs) },
    { name: "TypeScript", alt: "TypeScript development technology", logo: si(siTypescript) },
    { name: "JavaScript", alt: "JavaScript development technology", logo: si(siJavascript) },
    { name: "Tailwind CSS", alt: "Tailwind CSS technology", logo: si(siTailwindcss) },
    WORDPRESS,
    SHOPIFY,
    { name: "Cloudflare", alt: "Cloudflare platform", logo: si(siCloudflare) },
    { name: "Firebase", alt: "Firebase platform", logo: si(siFirebase) },
    { name: "Vercel", alt: "Vercel platform", logo: si(siVercel) },
    { name: "Render", alt: "Render cloud platform", logo: si(siRender) },
  ],
  digitalMarketing: [
    { name: "Google Ads", alt: "Google Ads platform", logo: si(siGoogleads) },
    { name: "Google Analytics", alt: "Google Analytics platform", logo: si(siGoogleanalytics) },
    { name: "Google Search Console", alt: "Google Search Console", logo: si(siGooglesearchconsole) },
    { name: "Google Business Profile", alt: "Google Business Profile", logo: img(googleBusinessProfile) },
    { name: "Meta Ads", alt: "Meta Ads platform", logo: si(siMeta) },
    FACEBOOK,
    INSTAGRAM,
    YOUTUBE,
    LINKEDIN,
    WORDPRESS,
    SHOPIFY,
    { name: "Google Tag Manager", alt: "Google Tag Manager", logo: si(siGoogletagmanager) },
    { name: "Semrush", alt: "Semrush SEO platform", logo: si(siSemrush) },
    { name: "Ahrefs", alt: "Ahrefs SEO platform", logo: img(ahrefs) },
    CANVA,
    // Mailchimp's brand yellow is invisible on white; its dark brand colour is used instead.
    { name: "Mailchimp", alt: "Mailchimp email platform", logo: si(siMailchimp, "#241C15") },
    { name: "HubSpot", alt: "HubSpot platform", logo: si(siHubspot) },
  ],
  productionHouse: [
    PREMIERE,
    { name: "Adobe After Effects", alt: "Adobe After Effects", logo: img(adobeAfterEffects) },
    { name: "Adobe Photoshop", alt: "Adobe Photoshop", logo: img(adobePhotoshop) },
    { name: "Adobe Lightroom", alt: "Adobe Lightroom", logo: img(adobeLightroom) },
    DAVINCI,
    { name: "CapCut", alt: "CapCut video editor", logo: img(capcut) },
    CANVA,
    YOUTUBE,
    INSTAGRAM,
    FACEBOOK,
    { name: "Vimeo", alt: "Vimeo video platform", logo: si(siVimeo) },
  ],
  podcastStudio: [
    YOUTUBE,
    { name: "Spotify", alt: "Spotify podcast platform", logo: si(siSpotify) },
    { name: "Apple Podcasts", alt: "Apple Podcasts platform", logo: si(siApplepodcasts) },
    INSTAGRAM,
    FACEBOOK,
    LINKEDIN,
    { name: "Adobe Audition", alt: "Adobe Audition", logo: img(adobeAudition) },
    PREMIERE,
    DAVINCI,
    CANVA,
    { name: "Riverside", alt: "Riverside podcast recording platform", logo: img(riverside) },
    { name: "StreamYard", alt: "StreamYard streaming platform", logo: img(streamyard) },
  ],
} satisfies Record<string, Platform[]>;

export type PlatformsType = keyof typeof PLATFORMS;

/** Default heading and description per list (a page can override either). */
const COPY: Record<PlatformsType, { title: string; intro: ReactNode }> = {
  webDevelopment: {
    title: "Technologies We Use for Web Development",
    intro: "We use modern web technologies and cloud platforms to build fast, scalable, responsive and reliable websites and web applications for businesses.",
  },
  digitalMarketing: { title: "Platforms we use", intro: "The platforms and tools behind our digital marketing services." },
  productionHouse: { title: "Platforms we use", intro: "The creative tools and platforms behind our video production services." },
  podcastStudio: { title: "Platforms we use", intro: "The tools and platforms behind our podcast recording and production services." },
};

const LOGO_SIZE = "w-8 h-8 sm:w-9 sm:h-9";

/** Shared look of the logo/feature sections (also used by WhatWeBuild). */
export const SECTION_HEADING = "text-center text-3xl sm:text-4xl font-bold mb-4";
export const SECTION_INTRO = "max-w-3xl mx-auto text-center text-base sm:text-lg text-gray-600 leading-relaxed mb-8 sm:mb-10";
export const SECTION_CARD =
  "rounded-xl bg-white border border-gray-100 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md";

function PlatformLogo({ platform }: { platform: Platform }) {
  const { logo, alt } = platform;
  if ("icon" in logo) {
    return (
      <svg role="img" viewBox="0 0 24 24" className={LOGO_SIZE} fill={logo.color ?? `#${logo.icon.hex}`} xmlns="http://www.w3.org/2000/svg">
        <title>{alt}</title>
        <path d={logo.icon.path} />
      </svg>
    );
  }
  return <img src={logo.image.src} alt={alt} width={36} height={36} loading="lazy" decoding="async" className={`${LOGO_SIZE} object-contain`} />;
}

/**
 * "Platforms we use": heading, description and logo grid. Server component.
 * 3 per row on phones, 4–5 on tablets, 8 on desktop.
 *
 * By default it renders its own <section> (the design used on the service
 * pages); pass `section={false}` to place it inside an existing section, as
 * the home page does.
 */
export default function PlatformsWeUse({
  type,
  title,
  intro,
  headingClassName = SECTION_HEADING,
  section = true,
}: {
  type: PlatformsType;
  title?: string;
  intro?: ReactNode;
  headingClassName?: string;
  section?: boolean;
}) {
  const copy = COPY[type];
  const description = intro ?? copy.intro;
  const content = (
    <div className="max-w-6xl mx-auto px-4">
      <h2 className={headingClassName}>{title ?? copy.title}</h2>
      {description && <p className={SECTION_INTRO}>{description}</p>}
      <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-3 sm:gap-4">
        {PLATFORMS[type].map((platform) => (
          <li
            key={platform.name}
            className={`flex flex-col items-center justify-center gap-2 px-2 py-3 sm:py-4 ${SECTION_CARD}`}
          >
            <PlatformLogo platform={platform} />
            <span className="text-xs sm:text-sm font-medium text-gray-700 text-center leading-tight">{platform.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
  return section ? <section className="bg-[#f9fafc] py-12 sm:py-16">{content}</section> : content;
}
