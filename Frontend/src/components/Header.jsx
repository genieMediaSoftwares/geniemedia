import React, { useState } from 'react';
import { ChevronDown, Phone, Mail } from 'lucide-react';
import "./Header.css"
import logo from "../assets/GenieMedia-Logo.png"
import { TrendingUp, Code, Video, Mic } from 'lucide-react';

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
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);

  // A scroll listener used to live here setting an `isScrolled` flag, but the
  // header's background is a constant (`bg-black/95`) and the flag was never
  // read. It re-rendered the entire header on every scroll frame for nothing.

  const menuItems = MENU_ITEMS;

  return (
    <>
      <header
        className="header-container fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-black/95"
      >
        <div className="max-w-8xl mx-auto px-0 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 ">
            
            <a href="/" className="logo-container flex items-center cursor-pointer" aria-label="Genie Media & Studio — home">
              <img
                src={logo}
                alt="Genie Media & Studio"
                width="283"
                height="420"
                className="logo-img w-36 sm:w-32 md:w-36 object-contain logo-icon"
              />
            </a>


            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-12 nav-menu">
              {menuItems.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.dropdown && setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <a
                    href={item.href}
                    className="nav-link flex items-center gap-1 text-m font-semibold text-gray-100 hover:text-orange-600 py-1"
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
                  </a>
                  
                                  {/* Dropdown Menu */}
                  {item.dropdown && activeDropdown === item.name && (
                    <div
                      className="
                        dropdown-menu 
                        absolute left-0 top-7 
                        mt-2 w-64 
                        bg-white rounded-2xl shadow-2xl 
                        border border-gray-100 
                        overflow-hidden z-50
                      "
                      onMouseEnter={() => setActiveDropdown(item.name)}     
                      onMouseLeave={() => setActiveDropdown(null)}          
                    >
                      {item.dropdown.map((subItem) => (
                        <a
                          key={subItem.name}
                          href={subItem.href}
                          className="
                            dropdown-item 
                            flex items-center gap-3 
                            px-5 py-3.5 
                            text-gray-700 
                            hover:text-orange-600 
                            border-b border-gray-50 
                            last:border-0
                          "
                        >
                          <span className="text-2xl">{subItem.icon}</span>
                          <span className="text-sm font-medium">{subItem.name}</span>
                        </a>
                      ))}
                    </div>
                  )}

                </div>
              ))}
            </nav>

            {/* CTA Buttons - Desktop */}
            <div className="hidden lg:flex items-center gap-3 cta-buttons">
              <a href='tel:+919032845433' className="btn-secondary relative px-5 py-2.5 text-orange-700 font-semibold rounded-full text-sm flex items-center gap-2 z-10" onClick={() => window.location.href="https://wa.me/919032845433"}>
                <Phone size={16} />
                Book a Call
              </a>
              <a href="/contact">
              <button className="btn-primary px-6 py-2.5 text-black font-semibold rounded-full text-sm flex items-center gap-2 shadow-lg relative z-10" >
                <Mail size={16} />
                Contact Us
              </button>  </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 mr-8 rounded-lg   hover:bg-gray-100 transition-colors ${
                isMobileMenuOpen ? 'hamburger-open' : ''
              }`}
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className="hamburger-line w-full h-0.5 bg-gray-400 rounded-full"></span>
                <span className="hamburger-line w-full h-0.5 bg-gray-400 rounded-full"></span>
                <span className="hamburger-line w-full h-0.5 bg-gray-400 rounded-full"></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mobile-menu bg-white border-t border-gray-100 shadow-2xl max-h-[calc(100vh-80px)] overflow-y-auto">
            <nav className="px-4 py-6 flex flex-col gap-1">
              {menuItems.map((item) => (
                <div key={item.name} className="mobile-menu-item">
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
                            <a
                              key={subItem.name}
                              href={subItem.href}
                              className="flex items-center gap-3 py-2.5 px-4 rounded-lg text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <span className="text-xl">{subItem.icon}</span>
                              <span className="font-medium">{subItem.name}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <a
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-3 px-4 rounded-xl text-gray-700 font-semibold hover:bg-orange-50 hover:text-orange-600 transition-all"
                    >
                      {item.name}
                    </a>
                  )}
                </div>
              ))}

              {/* Mobile CTA Buttons */}
              {/* These were <button> elements with no handler — visible, but
                  inert. They now go to the same destinations as their desktop
                  counterparts above. */}
              <div className="mobile-menu-item mt-4 space-y-3">
                <a
                  href="https://wa.me/919032845433"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-80% btn-secondary relative px-5 py-3 text-orange-600 font-semibold rounded-full flex items-center justify-center gap-2 z-10"
                >
                  <Phone size={18} />
                  Book a Call
                </a>
                <a
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-80% btn-primary px-6 py-3 text-black font-semibold rounded-full flex items-center justify-center gap-2 shadow-lg relative z-10"
                >
                  <Mail size={18} />
                  Contact Us
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>

    </>
  );
};

export default Header;