"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Phone, Mail } from 'lucide-react';
import logoAsset from "@/assets/GenieMedia-Logo.png";
import { TrendingUp, Code, Video, Mic } from 'lucide-react';

const logo = logoAsset.src;

/* ── Tailwind class sets (formerly Header.css) ─────────────────────────── */

// Underline that grows from the centre on hover.
const NAV_LINK =
  "relative transition-all duration-300 ease-in-out hover:text-[#FF6B00] before:content-[''] before:absolute before:-bottom-1 before:left-1/2 before:h-[3px] before:w-0 before:-translate-x-1/2 before:rounded-[2px] before:bg-[linear-gradient(90deg,#FF6B00,#FF8C3A)] before:transition-all before:duration-300 before:ease-in-out hover:before:w-full";

const DROPDOWN_ITEM =
  "transition-all duration-200 ease-[ease] hover:bg-[linear-gradient(90deg,rgba(255,107,0,0.1),transparent)]";

// Orange gradient button with a light sweep on hover.
const BTN_PRIMARY =
  "relative overflow-hidden bg-[linear-gradient(135deg,#FF6B00,#FF8C3A)] transition-all duration-300 ease-in-out hover:shadow-[0_12px_35px_rgba(255,107,0,0.4)] before:content-[''] before:absolute before:top-0 before:-left-full before:h-full before:w-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] before:transition-[left] before:duration-500 before:ease-[ease] hover:before:left-full";

// White outlined button that fills orange from the centre on hover.
const BTN_SECONDARY =
  "relative overflow-hidden border-2 border-[#FF6B00] !bg-white !text-black transition-all duration-300 ease-in-out hover:!text-white hover:border-[#FF8C3A] hover:shadow-[0_8px_25px_rgba(255,107,0,0.3)] before:content-[''] before:absolute before:left-1/2 before:top-1/2 before:z-[-1] before:h-0 before:w-0 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-[linear-gradient(135deg,#FF6B00,#FF8C3A)] before:[transition:width_0.5s_ease,height_0.5s_ease] hover:before:h-[300px] hover:before:w-[300px]";

const HAMBURGER_LINE = "w-full h-0.5 bg-gray-400 rounded-full transition-all duration-300 ease-in-out";
const HAMBURGER_OPEN = [
  "[transform:rotate(45deg)_translate(7px,7px)]",
  "opacity-0 translate-x-5",
  "[transform:rotate(-45deg)_translate(7px,-7px)]",
];

// Mobile menu rows slide in one after another.
const MOBILE_ITEM = "opacity-0 animate-header-item";
const MOBILE_ITEM_DELAY = [
  "![animation-delay:50ms]",
  "![animation-delay:100ms]",
  "![animation-delay:150ms]",
  "![animation-delay:200ms]",
  "![animation-delay:250ms]",
  "![animation-delay:300ms]",
];


// Hoisted so the nav (and the JSX icon elements inside it) is built once rather
// than on every Header render.
const MENU_ITEMS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  {
    name: 'Services',
    href: '/services',
    dropdown: [
      { name: 'Digital Marketing', href: '/digital_marketing', icon: <TrendingUp /> },
      { name: 'Website Development', href: '/web_development', icon: <Code /> },
      { name: 'Production House', href: '/production_house', icon: <Video /> },
      { name: 'Podcast Studio Rentals', href: '/podcast_studio', icon: <Mic /> }
    ]
  },
  { name: 'Projects', href: '/projects' },
  { name: 'Blog', href: '/blogs' },
  { name: 'Reviews', href: '/reviews' },
];

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<string | null>(null);

  // A scroll listener used to live here setting an `isScrolled` flag, but the
  // header's background is a constant (`bg-black/95`) and the flag was never
  // read. It re-rendered the entire header on every scroll frame for nothing.

  const menuItems = MENU_ITEMS;

  // The header lives in the root layout and uses <Link>, so it stays mounted
  // (and still) across navigations. Close any open menu when the route changes.
  const pathname = usePathname();
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset UI on navigation
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    setActiveMobileDropdown(null);
  }, [pathname]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-black/95"
      >
        <div className="max-w-8xl mx-auto px-0 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 ">
            
            <Link href="/" className="flex items-center cursor-pointer" aria-label="Genie Media & Studio — home">
              <img
                src={logo}
                alt="Genie Media & Studio"
                width="283"
                height="420"
                className="max-h-[60px] w-36 sm:w-32 md:w-36 object-contain"
              />
            </Link>


            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-12">
              {menuItems.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.dropdown && setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={`${NAV_LINK} flex items-center gap-1 text-m font-semibold text-gray-100 py-1`}
                  >
                    {item.name}
                    {item.dropdown && (
                      <ChevronDown 
                        size={14} 
                        className={`transition-transform duration-300 ${
                          activeDropdown === item.name ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </Link>
                  
                                  {/* Dropdown Menu */}
                  {/* Always in the DOM, shown and hidden with CSS, so the
                      service links are crawlable without a hover. The slide-in
                      animation replays each time `hidden` is removed. */}
                  {item.dropdown && (
                    <div
                      className={`
                        animate-header-dropdown
                        absolute left-0 top-7
                        mt-2 w-64
                        bg-white rounded-2xl shadow-2xl
                        border border-gray-100
                        overflow-hidden z-50
                        ${activeDropdown === item.name ? '' : 'hidden'}
                      `}
                      onMouseEnter={() => setActiveDropdown(item.name)}     
                      onMouseLeave={() => setActiveDropdown(null)}          
                    >
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`
                            ${DROPDOWN_ITEM}
                            flex items-center gap-3 
                            px-5 py-3.5 
                            text-gray-700 
                            hover:text-orange-600 
                            border-b border-gray-50 
                            last:border-0
                          `}
                        >
                          <span className="text-2xl">{subItem.icon}</span>
                          <span className="text-sm font-medium">{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                </div>
              ))}
            </nav>

            {/* CTA Buttons - Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <a href='tel:+919032845433' className={`${BTN_SECONDARY} px-5 py-2.5 font-semibold rounded-full text-sm flex items-center gap-2 z-10`} onClick={() => window.location.href="https://wa.me/919032845433"}>
                <Phone size={16} />
                Book a Call
              </a>
              <Link href="/contact" className={`${BTN_PRIMARY} px-6 py-2.5 text-black font-semibold rounded-full text-sm flex items-center gap-2 shadow-lg z-10`}>
                <Mail size={16} />
                Contact Us
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden flex items-center justify-center min-w-[44px] min-h-[44px] p-2 mr-8 rounded-lg hover:bg-gray-100 transition-colors`}
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className={`${HAMBURGER_LINE} ${isMobileMenuOpen ? HAMBURGER_OPEN[0] : ""}`}></span>
                <span className={`${HAMBURGER_LINE} ${isMobileMenuOpen ? HAMBURGER_OPEN[1] : ""}`}></span>
                <span className={`${HAMBURGER_LINE} ${isMobileMenuOpen ? HAMBURGER_OPEN[2] : ""}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden animate-header-slide-in bg-white border-t border-gray-100 shadow-2xl max-h-[calc(100vh-80px)] overflow-y-auto">
            <nav className="px-4 py-6 flex flex-col gap-1">
              {menuItems.map((item, index) => (
                <div key={item.name} className={`${MOBILE_ITEM} ${MOBILE_ITEM_DELAY[index] ?? ""}`}>
                  {item.dropdown ? (
                    <div>
                      <button
                        onClick={() => setActiveMobileDropdown(
                          activeMobileDropdown === item.name ? null : item.name
                        )}
                        className="w-full flex items-center justify-between py-3 px-4 rounded-xl text-gray-700 font-semibold hover:bg-orange-50 hover:text-orange-600 transition-all"
                      >
                        {item.name}
                        <ChevronDown 
                          size={18} 
                          className={`transition-transform duration-300 ${
                            activeMobileDropdown === item.name ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {activeMobileDropdown === item.name && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.dropdown.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="flex items-center gap-3 py-2.5 px-4 rounded-lg text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <span className="text-xl">{subItem.icon}</span>
                              <span className="font-medium">{subItem.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-3 px-4 rounded-xl text-gray-700 font-semibold hover:bg-orange-50 hover:text-orange-600 transition-all"
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}

              {/* Mobile CTA Buttons */}
              {/* These were <button> elements with no handler — visible, but
                  inert. They now go to the same destinations as their desktop
                  counterparts above. */}
              <div className={`${MOBILE_ITEM} mt-4 space-y-3`}>
                <a
                  href="https://wa.me/919032845433"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-80% ${BTN_SECONDARY} px-5 py-3 font-semibold rounded-full flex items-center justify-center gap-2 z-10`}
                >
                  <Phone size={18} />
                  Book a Call
                </a>
                <Link
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-80% ${BTN_PRIMARY} px-6 py-3 text-black font-semibold rounded-full flex items-center justify-center gap-2 shadow-lg z-10`}
                >
                  <Mail size={18} />
                  Contact Us
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

    </>
  );
};

export default Header;