import React from 'react';
import LogoAsset from "@/assets/GenieMedia-Logo.png";
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';

const Logo = LogoAsset.src;

export default function Footer() {
  const services = [
  { title: "Digital Marketing", link: "/digital_marketing" },
  { title: "Web Development", link: "/web_development" },
  { title: "Production", link: "/production_house" },
  { title: "Podcast Studio", link: "/podcast_studio" }
];

const company = [
  { title: "About Us", link: "/about" },
  { title: "Projects", link: "/projects" },
  { title: "Testimonials", link: "/reviews" },
  { title: "Contact", link: "/contact" }
];

 

  return (
    <footer className="bg-black text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-12 sm:py-16 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Company Info */}
          <div className="space-y-6">
            <div>
              <img
                src={Logo}
                alt="Genie Media & Studio"
                width="283"
                height="420"
                loading="lazy"
                decoding="async"
                className='h-32 w-auto mb-6 -mt-8'
              />
              <p className="text-gray-300 leading-relaxed">
               Digital marketing, websites, video production and a podcast studio in Visakhapatnam, helping businesses grow with strategy and innovation.
              </p>
            </div>
            
            {/* Social Media Icons.
                Icon-only links need an accessible name — without one they were
                announced as just "link" and failed the "Links do not have
                discernible names" audit. The <a> is also bumped from 40px to
                44px so it clears the minimum touch-target size on mobile. */}
            <div className="flex space-x-4">
              <a
                href="https://m.facebook.com/826093997257312/"
                aria-label="Genie Media on Facebook"
                rel="noopener noreferrer"
                target="_blank"
                className="w-11 h-11 rounded-full bg-slate-700 hover:bg-orange-500 flex items-center justify-center transition-colors duration-300"
              >
                <Facebook className="w-5 h-5" aria-hidden="true" />
              </a>

              <a
                href="https://www.instagram.com/itsgeniemedia_official/"
                aria-label="Genie Media on Instagram"
                rel="noopener noreferrer"
                target="_blank"
                className="w-11 h-11 rounded-full bg-slate-700 hover:bg-orange-500 flex items-center justify-center transition-colors duration-300"
              >
                <Instagram className="w-5 h-5" aria-hidden="true" />
              </a>
              <a
                href="https://www.youtube.com/@itsgeniemedia_official"
                aria-label="Genie Media on YouTube"
                rel="noopener noreferrer"
                target="_blank"
                className="w-11 h-11 rounded-full bg-slate-700 hover:bg-orange-500 flex items-center justify-center transition-colors duration-300"
              >
                <Youtube className="w-5 h-5" aria-hidden="true" />
              </a>
              <a
                href="https://www.linkedin.com/company/itsgeniemediaofficial"
                aria-label="Genie Media & Studio on LinkedIn"
                rel="noopener noreferrer"
                target="_blank"
                className="w-11 h-11 rounded-full bg-slate-700 hover:bg-orange-500 flex items-center justify-center transition-colors duration-300"
              >
                <Linkedin className="w-5 h-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h2 className="text-lg font-bold mb-6 text-orange-500">Services</h2>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <a href={service.link} className="text-gray-300 hover:text-orange-500 transition-colors duration-200 inline-flex items-center min-h-[44px] lg:min-h-0 py-1 lg:py-0">
                    {service.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h2 className="text-lg font-bold mb-6 text-orange-500">Company</h2>
            <ul className="space-y-3">
              {company.map((item, index) => (
                <li key={index}>
                  <a href={item.link} className="text-gray-300 hover:text-orange-500 transition-colors duration-200 inline-flex items-center min-h-[44px] lg:min-h-0 py-1 lg:py-0">
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-lg font-bold mb-6 text-orange-500">Contact Us</h2>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                <a
                  href="https://maps.google.com/?cid=6757437658106176471"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open our office address in Google Maps (opens in a new tab)"
                  className="text-gray-300 hover:text-orange-500 transition-colors duration-200"
                >
                  5A-2, 4th Floor, KP Icon, Yendada, Visakhapatnam, <br />
                  near MK Gold Coast, Endada, <br />
                  Andhra Pradesh 530045
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <a href="tel:+919032845433" className="text-gray-300 hover:text-orange-500 transition-colors duration-200 inline-flex items-center min-h-[44px] lg:min-h-0">
                  +91 9032845433
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=admin@geniemedia.in" className="text-gray-300 hover:text-orange-500 transition-colors duration-200 inline-flex items-center min-h-[44px] lg:min-h-0">
                 admin@geniemedia.in
                </a>
              </li>
            </ul>
          </div>
        </div>
                       
      
      </div>

      {/* Bottom Bar */}
      <div className="-mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm text-center md:text-left space-y-1">
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
            <nav aria-label="Legal" className="flex items-center gap-6 text-sm">
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