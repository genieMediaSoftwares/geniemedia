import React from 'react';
import Logo from '../assets/GenieMedia-Logo.png'
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';

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
               Providing cutting-edge digital transformation solutions through a trusted top digital marketing companies in Vizag, helping businesses grow with strategy and innovation.
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
            </div>
          </div>

          {/* Services */}
          <div>
            <h2 className="text-lg font-bold mb-6 text-orange-500">Services</h2>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <a href={service.link} className="text-gray-300 hover:text-orange-500 transition-colors duration-200 inline-block">
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
                  <a href={item.link} className="text-gray-300 hover:text-orange-500 transition-colors duration-200 inline-block">
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
                <span className="text-gray-300">
                  5A2 4th Floor KP Icon KP Infra <br />
                  Yendada, Vishakhapatnam - 530045
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <a href="tel:+91 9032845433" className="text-gray-300 hover:text-orange-500 transition-colors duration-200">
                  +91 9032845433
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=admin@geniemedia.in" className="text-gray-300 hover:text-orange-500 transition-colors duration-200">
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
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2025 Genie Media & Studio. All rights reserved.
            </p>
           
          </div>
        </div>
      </div>
    </footer>
  );
}