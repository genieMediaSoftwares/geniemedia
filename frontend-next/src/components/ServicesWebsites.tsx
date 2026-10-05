"use client";

import React, { useState } from 'react';
import { Palette, Code, ShoppingBag, Wrench, Smartphone, Globe, ArrowRight } from 'lucide-react';

export default function ServicesSection2() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const services = [
    {
      icon: <Palette className="w-8 h-8" />,
      title: "UI/UX Design",
      description: "UI/UX web design that gives visitors a clear, attractive user experience and guides them to get in touch.",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Web Development",
      description: "Custom web development with modern technologies such as React, Next.js and Node.js, from business websites to web applications.",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500"
    },
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: "Shopify Solutions",
      description: "Ecommerce website development on Shopify, with online stores built to sell and easy for customers to use.",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "WordPress Development",
      description: "WordPress website development: custom sites you can update yourself, built to grow with your business.",
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-indigo-500"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Custom Coding",
      description: "Tailored solutions built from scratch to meet your unique business requirements.",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500"
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      title: "Maintenance & Support",
      description: "Website maintenance, redesigns and speed optimization to keep your site fast, secure and up to date.",
      color: "from-teal-500 to-green-500",
      bgColor: "bg-teal-500"
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      title: "Hosting & Deployment Solutions",
      description: "Secure, reliable hosting and deployment services for smooth website performance and uptime.",
      color: "from-pink-500 to-purple-500",
      bgColor: "bg-teal-500"
    }
  ];

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-100 overflow-hidden" id='services'>
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200 rounded-full filter blur-3xl opacity-20 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full filter blur-3xl opacity-20 -z-10"></div>
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 relative">
          <div className="inline-block">
            <span className="text-orange-700 font-semibold text-sm uppercase tracking-wider mb-2 block">What We Offer</span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 relative">
              Our Web Development Services
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"></div>
            </h2>
          </div>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto mt-8">
            Comprehensive digital solutions to elevate your brand and drive results through innovative design and cutting-edge technology
          </p>
        </div>

        {/* Services Grid - Bento Box Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {services.map((service, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`group relative bg-white rounded-3xl p-8 transition-all duration-500 cursor-pointer border-2 border-gray-100 hover:border-transparent overflow-hidden
                ${index === 0 ? 'md:col-span-2 lg:col-span-1' : ''}
                ${index === 3 ? 'lg:col-span-2' : ''}
                ${index === 6 ? 'lg:col-span-2' : ''}
                ${hoveredIndex === index ? 'shadow-2xl scale-105 -translate-y-2' : 'shadow-lg hover:shadow-xl'}
              `}
            >
              {/* Animated Background Gradient */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}
              ></div>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-100 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
              
              {/* Icon Container */}
              <div className="relative mb-6">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${service.color} text-white transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                  {service.icon}
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-white mb-4 transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-gray-600 group-hover:text-white/90 leading-relaxed mb-6 transition-colors duration-300">
                  {service.description}
                </p>

                {/* Learn More Link */}
                <div className="flex items-center gap-2 text-orange-700 group-hover:text-white font-semibold transition-colors duration-300">
                 {/* Seven identical "Learn more" links failed Lighthouse's
                     link-text audit; the screen-reader text gives each its
                     full name without changing what is shown. */}
                 <a href="/projects"> <span>Learn more</span><span className="sr-only"> about our {service.title} work</span></a>
                  <ArrowRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>

              {/* Number Badge */}
              <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-gray-100 group-hover:bg-white/20 flex items-center justify-center font-bold text-gray-600 group-hover:text-white text-lg transition-all duration-300">
                {String(index + 1).padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="relative bg-gradient-to-r from-orange-500 to-pink-500 rounded-3xl p-12 md:p-16 text-center overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-32 translate-y-32"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Digital Presence?
            </h3>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Let's collaborate to create something extraordinary that drives real results for your business
            </p>
            <a
              className="bg-white text-orange-700 px-10 py-5 rounded-full font-bold text-lg hover:bg-gray-100 transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-white/50 inline-flex items-center gap-3 group"
              href="/contact"
            >
              <span>Start Your Project</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </div>
        </div>

        {/* Stats Section
            Only figures a visitor can check on this site: the live portfolio
            (/projects), its clients' countries, the platforms above and the
            services on this page. "800+ projects", "98% satisfaction", "50+
            clients" and "24/7 support" used to sit here with nothing behind
            them. */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {[
            { number: "10+", label: "Websites Launched" },
            { number: "3", label: "Countries Served" },
            { number: "3", label: "Platforms: WordPress, Shopify, Custom" },
            { number: "7", label: "Web Services" }
          ].map((stat, index) => (
            <div 
              key={index}
              className="text-center p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}