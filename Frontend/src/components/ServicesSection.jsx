import React from 'react';
import { Palette, Code, ShoppingBag, Wrench, Smartphone, Globe } from 'lucide-react';

export default function ServicesSection() {
  const services = [
    {
      icon: <Palette className="w-8 h-8" />,
      title: "UI/UX Design",
      description: "Crafting intuitive and visually stunning interfaces that engage users and drive conversions.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Web Development",
      description: "Building robust, scalable websites with clean code and modern technologies.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: "Shopify Solutions",
      description: "Creating powerful e-commerce stores that maximize sales and customer experience.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "WordPress Development",
      description: "Designing and developing custom WordPress sites that are easy to manage and scale.",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Custom Coding",
      description: "Tailored solutions built from scratch to meet your unique business requirements.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      title: "Maintenance & Support",
      description: "Ongoing maintenance and support to keep your digital presence running smoothly.",
      color: "from-teal-500 to-green-500"
    }
  ];

  return (
    <section className="py-6 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gray-50" id='services'>
      <div className="max-w-7xl mx-auto">
      
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold text-orange-600 mb-4">
            Our Services
          </h2>
          <p className="text-gray-700 text-xl max-w-2xl mx-auto">
            Comprehensive digital solutions to elevate your brand and drive results
          </p>
        </div>

     
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative bg-gray-800 rounded-2xl p-8 hover:transform hover:scale-105 transition-all duration-300 cursor-pointer border border-gray-700 hover:border-gray-600"
            >
             
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
              
            
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${service.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {service.icon}
              </div>

        
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                {service.title}
              </h3>
              <p className="text-gray-200 leading-relaxed">
                {service.description}
              </p>

         
              <div className="mt-6 flex items-center text-gray-500 group-hover:text-white transition-colors duration-300">
                <span className="text-sm font-medium">Learn more</span>
                <svg 
                  className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        
        <div className="text-center mt-10">
          <button className="bg-orange-400 text-black px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-black-500/50 transform hover:scale-105 transition-all duration-300" onClick={() => window.location.href="https://wa.me/919032845433"}>
            Start Your Project
          </button>
        </div>
      </div>
    </section>
  );
}