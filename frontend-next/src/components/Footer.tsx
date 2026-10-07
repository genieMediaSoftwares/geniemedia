import React from 'react';
import LogoAsset from "@/assets/GenieMedia-Logo.png";
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';
import { getPublishedCaseStudiesSafe } from "@/lib/api/caseStudies";

const Logo = LogoAsset.src;

const FOOTER_LINK =
  "text-sm sm:text-base text-gray-300 hover:text-orange-500 transition-colors duration-200 inline-flex items-center min-h-[36px] sm:min-h-[44px] lg:min-h-0 sm:py-1 lg:py-0";
const FOOTER_HEADING = "text-base sm:text-lg font-bold mb-1 sm:mb-6 text-orange-500";
const FOOTER_LIST = "sm:space-y-3";
const SOCIAL_LINK =
  "w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-700 hover:bg-orange-500 flex items-center justify-center transition-colors duration-300";

export default async function Footer() {
  const hasCaseStudies = (await getPublishedCaseStudiesSafe()).length > 0;
  const services = [
  { title: "Digital Marketing", link: "/digital_marketing" },
  { title: "Web Development", link: "/web_development" },
  { title: "Production House", link: "/production_house" },
  { title: "Podcast Studio", link: "/podcast_studio" }
];

const company = [
  { title: "About Us", link: "/about" },
  { title: "Projects", link: "/projects" },
  ...(hasCaseStudies ? [{ title: "Case Studies", link: "/case-studies" }] : []),
  { title: "Testimonials", link: "/reviews" },
  { title: "Contact", link: "/contact" }
];

const resources = [
  { title: "Blogs", link: "/blogs" },
  { title: "Privacy Policy", link: "/privacy-policy" },
  { title: "Terms & Conditions", link: "/terms-and-conditions" }
];

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-8 sm:py-16 lg:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6 sm:gap-8 lg:gap-12">

          <div className="col-span-2 sm:col-span-1 space-y-4 sm:space-y-6">
            <div className="flex items-center gap-4 sm:block">
              <img
                src={Logo}
                alt="Genie Media & Studio"
                width="283"
                height="420"
                loading="lazy"
                decoding="async"
                className='h-16 sm:h-32 w-auto shrink-0 sm:mb-6 sm:-mt-8'
              />
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
               Digital marketing, websites, video production and a podcast studio in Visakhapatnam, helping businesses grow with strategy and innovation.
              </p>
            </div>

            <div className="flex gap-3 sm:gap-4">
              <a
                href="https://m.facebook.com/826093997257312/"
                aria-label="Genie Media on Facebook"
                rel="noopener noreferrer"
                target="_blank"
                className={SOCIAL_LINK}
              >
                <Facebook className="w-5 h-5" aria-hidden="true" />
              </a>

              <a
                href="https://www.instagram.com/itsgeniemedia_official/"
                aria-label="Genie Media on Instagram"
                rel="noopener noreferrer"
                target="_blank"
                className={SOCIAL_LINK}
              >
                <Instagram className="w-5 h-5" aria-hidden="true" />
              </a>
              <a
                href="https://www.youtube.com/@itsgeniemedia_official"
                aria-label="Genie Media on YouTube"
                rel="noopener noreferrer"
                target="_blank"
                className={SOCIAL_LINK}
              >
                <Youtube className="w-5 h-5" aria-hidden="true" />
              </a>
              <a
                href="https://www.linkedin.com/company/itsgeniemediaofficial"
                aria-label="Genie Media & Studio on LinkedIn"
                rel="noopener noreferrer"
                target="_blank"
                className={SOCIAL_LINK}
              >
                <Linkedin className="w-5 h-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="min-w-0">
            <h2 className={FOOTER_HEADING}>Services</h2>
            <ul className={FOOTER_LIST}>
              {services.map((service, index) => (
                <li key={index}>
                  <a href={service.link} className={FOOTER_LINK}>
                    {service.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <h2 className={FOOTER_HEADING}>Company</h2>
            <ul className={FOOTER_LIST}>
              {company.map((item, index) => (
                <li key={index}>
                  <a href={item.link} className={FOOTER_LINK}>
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0 sm:hidden">
            <h2 className={FOOTER_HEADING}>Resources</h2>
            <ul>
              {resources.map((item) => (
                <li key={item.link}>
                  <a href={item.link} className={FOOTER_LINK}>
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <h2 className={FOOTER_HEADING}>Contact Us</h2>
            <ul className="space-y-1 sm:space-y-4 text-[13px] sm:text-base">
              <li className="flex items-start gap-2 sm:gap-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0 mt-1" />
                <a
                  href="https://maps.google.com/?cid=6757437658106176471"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open our office address in Google Maps (opens in a new tab)"
                  className="min-w-0 break-words text-gray-300 hover:text-orange-500 transition-colors duration-200 py-1 sm:py-0"
                >
                  5A-2, 4th Floor, KP Icon, Yendada, Visakhapatnam, <br />
                  near MK Gold Coast, Endada, <br />
                  Andhra Pradesh 530045
                </a>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                <a href="tel:+919032845433" className="min-w-0 text-gray-300 hover:text-orange-500 transition-colors duration-200 inline-flex items-center min-h-[36px] sm:min-h-[44px] lg:min-h-0">
                  +91 9032845433
                </a>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=admin@geniemedia.in" className="min-w-0 break-words text-gray-300 hover:text-orange-500 transition-colors duration-200 inline-flex items-center min-h-[36px] sm:min-h-[44px] lg:min-h-0">
                 <span>admin@<wbr />geniemedia.in</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 sm:border-0 sm:-mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-xs sm:text-sm text-center md:text-left space-y-1">
              <p>© 2025 Genie Media & Studio. All rights reserved.</p>
              <p>
                Powered by{" "}
                <a
                  href="https://www.kkdigitalgrowth.com/"
                  target="_blank"
                  rel="noopener"
                  className="text-gray-300 hover:text-orange-500 transition-colors duration-200"
                >
                  KKDigitalGrowth
                </a>
              </p>
            </div>
            <nav aria-label="Legal" className="hidden sm:flex items-center gap-6 text-sm">
              <a href="/privacy-policy" className="text-gray-400 hover:text-orange-500 transition-colors duration-200 inline-flex items-center min-h-[44px] md:min-h-0">
                Privacy Policy
              </a>
              <a href="/terms-and-conditions" className="text-gray-400 hover:text-orange-500 transition-colors duration-200 inline-flex items-center min-h-[44px] md:min-h-0">
                Terms &amp; Conditions
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
