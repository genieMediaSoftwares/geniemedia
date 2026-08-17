import React, { useState } from 'react';
import { Video, Wand2, FileText, Camera, Film, Radio, ChevronRight } from 'lucide-react';


export default function ProductionHouseServices() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const services = [
    {
      icon: Video,
      title: 'Video Production',
      description: 'Bring your ideas to life with high-quality video content. From concept to final edit, we create engaging videos for commercials, corporate use, social media, and more.',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-500'
    },
    {
      icon: Wand2,
      title: 'Wedding & Events',
      description: 'Capture life’s most special moments with professional wedding and event coverage. From candid emotions to grand celebrations, we ensure every detail is beautifully documented.',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-500'
    },
    
    {
      icon: FileText,
      title: 'Scriptwriting & Storyboarding',
      description: 'Develop compelling narratives with professional scriptwriting and storyboarding. We help shape your ideas into stories that resonate and leave a lasting impact.',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500'
    },
    {
      icon: Camera,
      title: 'Photography & Visual Content',
      description: 'Capture striking visuals for marketing, events, and branding. Our photographers create high-quality images that communicate your brand\'s essence effectively.',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-500'
    },
    {
      icon: Film,
      title: 'Post-Production & Editing',
      description: 'Polish your content with expert post-production services, including video editing, color grading, sound design, and visual effects for a professional finish.',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      icon: Radio,
      title: 'Live Streaming & Event Coverage',
      description: 'Broadcast your events or shows seamlessly with live streaming solutions. We manage everything from setup to execution to ensure flawless coverage and audience engagement.',
      color: 'from-red-500 to-rose-500',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-500'
    }
  ];

  return (
    <div className="relative bg-gray-200 py-16 sm:py-20 lg:py-18 px-4 sm:px-6 lg:px-8 overflow-hidden">
      
     

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16 sm:mb-20 space-y-6">
          <div className="inline-block">
            <span className="px-4 py-2 bg-orange-500 bg-opacity-50 text-black rounded-full text-sm font-semibold border border-orange-500 border-opacity-30">
              Our Expert-led Services
            </span>
          </div>
          <h2 className="text-2xl sm:text-5xl lg:text-6xl font-bold text-black leading-tight max-w-4xl mx-auto">
            Transforming Concepts into{' '}
            <span className="bg-orange-500 bg-clip-text text-transparent">
              Captivating Productions
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
            We handle all kinds of shoots, events, corporate videos, model shoots, & product photography & make sure every moment is captured neatly & on time.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative"
              >
                {/* Card */}
                <div className={`relative h-full bg-white rounded-2xl p-6 sm:p-8 transition-all duration-500 transform ${
                  hoveredIndex === index 
                    ? 'scale-105 shadow-2xl shadow-orange-500/20' 
                    : 'scale-100 shadow-lg hover:shadow-xl'
                }`}>
                  
                  {/* Gradient Border Effect */}
                  
                  
                  {/* Icon Container */}
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${service.bgColor} flex items-center justify-center mb-6 transition-transform duration-500 ${
                    hoveredIndex === index ? 'rotate-12 scale-110' : 'rotate-0 scale-100'
                  }`}>
                    <Icon className={`w-8 h-8 sm:w-10 sm:h-10 ${service.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-pink-500 group-hover:bg-clip-text transition-all duration-300">
                      {service.title}
                    </h3>
                    <p className="text-base text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                 
                  {/* Number Badge */}
                  <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-pink-500 group-hover:text-white transition-all duration-300">
                    {index + 1}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <button className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-full shadow-lg hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105" onClick={() => window.location.href="https://wa.me/919032845433"}>
            <span className="flex items-center gap-2">
              Get Started Today
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}