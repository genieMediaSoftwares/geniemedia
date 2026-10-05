import type { ReactNode } from "react";
import { ArrowRight, Bot, CodeXml, Smartphone } from "lucide-react";
import { siShopify, siWordpress, type SimpleIcon } from "simple-icons";

import { SECTION_CARD, SECTION_HEADING, SECTION_INTRO } from "@/components/PlatformsWeUse";

/**
 * "What We Build for Businesses": five product types in the same card style
 * as the "Platforms we use" sections, followed by the projects page's CTA.
 * Server component: plain HTML and inline SVG, no client JavaScript.
 *
 * A card links only where the site has a page for it. There is no mobile-app
 * or AI page yet, so those two cards are not links (no broken URLs).
 */

const BrandIcon = ({ icon, label }: { icon: SimpleIcon; label: string }) => (
  <svg role="img" viewBox="0 0 24 24" className="w-9 h-9 sm:w-10 sm:h-10" fill={`#${icon.hex}`} xmlns="http://www.w3.org/2000/svg">
    <title>{label}</title>
    <path d={icon.path} />
  </svg>
);

const LINE_ICON = "w-9 h-9 sm:w-10 sm:h-10 text-orange-500";

export const WHAT_WE_BUILD: Array<{ name: string; detail: string; icon: ReactNode; href?: string }> = [
  { name: "Web Development", detail: "Websites & Web Applications", icon: <CodeXml className={LINE_ICON} strokeWidth={1.75} aria-hidden="true" />, href: "/web_development" },
  { name: "Mobile Apps", detail: "Android & iOS Applications", icon: <Smartphone className={LINE_ICON} strokeWidth={1.75} aria-hidden="true" /> },
  { name: "AI Agents", detail: "AI Automation & Intelligent Solutions", icon: <Bot className={LINE_ICON} strokeWidth={1.75} aria-hidden="true" /> },
  { name: "WordPress", detail: "Business & CMS Websites", icon: <BrandIcon icon={siWordpress} label="WordPress logo" />, href: "/web_development" },
  { name: "Shopify", detail: "Ecommerce Websites & Stores", icon: <BrandIcon icon={siShopify} label="Shopify logo" />, href: "/web_development" },
];

const CARD_BODY = "h-full flex flex-col items-center justify-center gap-2 px-3 py-5 sm:py-6 text-center";

export default function WhatWeBuild() {
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className={SECTION_HEADING}>What We Build for Businesses</h2>
        <p className={SECTION_INTRO}>
          From websites and mobile apps to AI-powered solutions and ecommerce platforms, we build modern digital products that help businesses grow.
        </p>

        {/* 2 per row on phones (the fifth card spans the row), 3 on tablets, 5 on desktop. */}
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 auto-rows-fr gap-3 sm:gap-4">
          {WHAT_WE_BUILD.map((item) => {
            const body = (
              <>
                {item.icon}
                <span className="text-sm sm:text-base font-semibold text-gray-800 leading-tight">{item.name}</span>
                <span className="text-xs sm:text-sm text-gray-500 leading-snug">{item.detail}</span>
              </>
            );
            return (
              <li key={item.name} className={`${SECTION_CARD} last:col-span-2 sm:last:col-span-1`}>
                {item.href ? (
                  <a href={item.href} className={`${CARD_BODY} rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500`}>
                    {body}
                  </a>
                ) : (
                  <div className={CARD_BODY}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>

        <div className="max-w-4xl mx-auto text-center mt-12">
          <p className="text-xl md:text-2xl font-semibold text-gray-800 leading-relaxed mb-8">
            If you&apos;re looking for an agency that elevates your brand with creativity,
            strategy, and innovation, then you&apos;re ready for us.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-8 sm:py-4 rounded-full bg-orange-500 text-black text-sm sm:text-base font-semibold hover:bg-gray-900 hover:text-gray-100 active:scale-95 transition-all duration-300 shadow-lg w-full sm:w-auto"
          >
            Need help to upscale your brand
            <ArrowRight className="w-5 h-7" strokeWidth={2.5} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
