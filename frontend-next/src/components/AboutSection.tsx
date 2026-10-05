"use client";

import React, { useEffect, useRef, useState } from 'react';


/* ── Tailwind class sets (formerly this component's <style> block) ────── */

// Bars grow with a composited transform, so no layout runs during the reveal.
const BAR_V = "origin-bottom [transform:scaleY(0)] [transition:transform_1.2s_cubic-bezier(0.4,0,0.2,1),filter_0.3s_ease] will-change-transform motion-reduce:transition-none";
const BAR_V_REVEALED = "![transform:scaleY(1)] hover:![transform:scaleY(1)_scaleX(1.05)] hover:brightness-[1.15]";
const BAR_H = "origin-left [transform:scaleX(0)] [transition:transform_0.7s_cubic-bezier(0.4,0,0.2,1),filter_0.3s_ease] will-change-transform motion-reduce:transition-none";
const BAR_H_REVEALED = "![transform:scaleX(1)] hover:brightness-[1.15]";

const COUNTER = "inline-block transition-all duration-300 ease-[ease] group-hover/stat:scale-[1.15] group-hover/stat:text-[#FF6B00]";
const COUNTER_UPDATING = "scale-110 text-[#FF6B00]";
const STAT_LABEL = "transition-all duration-300 ease-[ease] group-hover/stat:-translate-y-[5px] group-hover/stat:text-[#FF6B00]";

const AboutSection1 = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState([0, 0, 0, 0, 0]);

  const stats = [
    { 
      value: 7, 
      suffix: '+',
      label: 'Years of Expertise',
      color: 'bg-[#CFAF03]',
      maxHeight: 112, // h-28 in pixels
      height: 'h-28',
      mobileWidth: 48,
      delay: 0,
      // Static Tailwind classes for this stat (bar height, mobile bar width, stagger).
      barHeightClass: 'h-[112px]',
      mobileWidthClass: 'w-[0.7875%]',
      delayClass: '![animation-delay:0ms] ![transition-delay:0ms]'
    },
    { 
      value: 3, 
      suffix: '+',
      label: 'Countries Served',
      color: 'bg-[#03C2C2]',
      maxHeight: 128, // h-32 in pixels
      height: 'h-32',
      mobileWidth: 62,
      delay: 80,
      // Static Tailwind classes for this stat (bar height, mobile bar width, stagger).
      barHeightClass: 'h-[128px]',
      mobileWidthClass: 'w-[0.3375%]',
      delayClass: '![animation-delay:80ms] ![transition-delay:80ms]'
    },
    { 
      value: 150, 
      suffix: '+',
      label: 'Growth Campaigns ',
      color: 'bg-[#CFAF03]',
      maxHeight: 192, // h-48 in pixels
      height: 'h-38',
      mobileWidth: 106,
      delay: 150,
      // Static Tailwind classes for this stat (bar height, mobile bar width, stagger).
      barHeightClass: 'h-[192px]',
      mobileWidthClass: 'w-[16.875%]',
      delayClass: '![animation-delay:150ms] ![transition-delay:150ms]'
    },
    { 
      value: 400, 
      suffix: '+',
      label: 'Digital Transformations',
      color: 'bg-[#03C2C2]',
      maxHeight: 240, // h-60 in pixels
      height: 'h-60',
      mobileWidth: 180,
      delay: 250,
      // Static Tailwind classes for this stat (bar height, mobile bar width, stagger).
      barHeightClass: 'h-[240px]',
      mobileWidthClass: 'w-[45%]',
      delayClass: '![animation-delay:250ms] ![transition-delay:250ms]'
    },
    { 
      value: 800, 
      suffix: '+',
      label: 'Projects Delivered',
      color: 'bg-[#CFAF03]',
      maxHeight: 256, // h-64 in pixels
      height: 'h-64',
      mobileWidth: 260,
      delay:350,
      // Static Tailwind classes for this stat (bar height, mobile bar width, stagger).
      barHeightClass: 'h-[256px]',
      mobileWidthClass: 'w-[90%]',
      delayClass: '![animation-delay:350ms] ![transition-delay:350ms]'
    }
  ];

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect(); // one-shot — the reveal never replays
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /**
   * Counter roll-up.
   *
   * This used to start ten concurrent setIntervals (one counter + one bar per
   * stat) firing every 25 ms, each committing its own setState — roughly 800
   * React renders in two seconds. Combined with the bars animating `height` in
   * pixels, it forced a full layout on every tick and was the single largest
   * source of long main-thread tasks on the page.
   *
   * Now: one requestAnimationFrame loop drives all five counters with a single
   * state commit per frame, and it naturally pauses when the tab is hidden.
   * The bars are handled entirely by CSS (see the `transform: scaleY` note in
   * the markup below), so no JavaScript touches layout at all.
   */
  useEffect(() => {
    if (!isVisible) return;

    const DURATION = 2000;
    const START_DELAY = 300;
    const targets = stats.map((s) => s.value);
    let frame: number | undefined;
    let startTime: number | undefined;

    const tick = (now: number) => {
      if (startTime === undefined) startTime = now;
      const elapsed = now - startTime;
      // easeOutQuad — matches the "fast then settle" feel of the old version
      const t = Math.min(elapsed / DURATION, 1);
      const eased = 1 - (1 - t) * (1 - t);

      setCounters(targets.map((target) => Math.round(target * eased)));

      if (t < 1) frame = requestAnimationFrame(tick);
    };

    const timeout = setTimeout(() => {
      frame = requestAnimationFrame(tick);
    }, START_DELAY);

    return () => {
      clearTimeout(timeout);
      if (frame) cancelAnimationFrame(frame);
    };
    // `stats` is a module-invariant literal; only the reveal flag matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);



  return (
    <>

      <section 
        ref={sectionRef}
        className="bg-gray-100 pt-10 px-6 lg:px-12"
        id='about'
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className={`mb-8 text-center ${isVisible ? 'animate-fade-in-up-slow motion-reduce:animate-none' : 'opacity-0'}`}>
            <h2 className="text-4xl lg:text-6xl font-bold text-orange-600 mb-3">
              About Us
            </h2>
            <p className="text-lg lg:text-xl text-gray-800">
           Crafting powerful digital experiences from our office in Visakhapatnam.
            </p>
          </div>

          {/* Who We Are & What Drives Us */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-16 mb-0">
            <div className={`${isVisible ? 'animate-slide-in-left motion-reduce:animate-none ![animation-delay:0.2s]' : 'opacity-0'}`}>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                Who We Are
              </h3>
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                We are a team of digital creators who help brands grow with clear, creative work.
                At Genie Media & Studio, we mix strategy, design, content and technology. As a result,
                our work speaks to people, stays with them and keeps paying off.

              </p>
            </div>

            <div className={`${isVisible ? 'animate-slide-in-right motion-reduce:animate-none ![animation-delay:0.3s]' : 'opacity-0'}`}>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                What Drives Us?
              </h3>
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
               <b> Creativity fuels every move we make. </b>
                We think before we create, and we put real care into every piece of work.
                Our mission is simple: help brands create experiences that people remember, trust and enjoy.

              </p>
            </div>
          </div>

          {/* Desktop: Vertical Bars */}
          <div className="hidden md:flex items-end justify-center gap-8 mt-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group/stat flex-1 flex flex-col items-center"
              >
              
                <div className={`text-center mb-4 ${isVisible ? `animate-bounce-in motion-reduce:animate-none ${stat.delayClass}` : 'opacity-0'}`}>
                  <div className={`text-3xl lg:text-5xl font-extrabold text-gray-900 mb-2 ${COUNTER} ${counters[index] > 0 && counters[index] < stat.value ? COUNTER_UPDATING : ''}`}>
                    {counters[index]}{stat.suffix}
                  </div>
                  <div className={`text-sm lg:text-base text-gray-600 font-medium px-2 ${STAT_LABEL}`}>
                    {stat.label}
                  </div>
                </div>

                {/* The wrapper owns the final height so the layout is settled
                    from the first paint; only the inner bar is transformed. */}
                <div
                  className={`w-full flex items-end ${stat.barHeightClass}`}
                >
                  <div
                    className={`${BAR_V} w-full h-full ${stat.color} rounded-t-2xl ${stat.delayClass} ${isVisible ? BAR_V_REVEALED : ''}`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: Horizontal Bars */}
          <div className="md:hidden space-y-6 pb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`group/stat ${isVisible ? `animate-fade-in-up-slow motion-reduce:animate-none ${stat.delayClass}` : 'opacity-0'}`}
              >
               
                <div className="flex items-center gap-0 mt-5 mb-2">
                  <div className={`text-2xl font-bold text-gray-900 min-w-[80px] ${COUNTER} ${counters[index] > 0 && counters[index] < stat.value ? COUNTER_UPDATING : ''}`}>
                    {counters[index]}{stat.suffix}
                  </div>
                  <div className={`text-sm text-gray-600 font-medium ${STAT_LABEL}`}>
                    {stat.label}
                  </div>
                </div>

                {/* Same idea as the desktop bars: the final width is set once,
                    and the reveal is a composited scaleX. */}
                <div
                  className={`${BAR_H} h-8 ${stat.color} rounded-r-2xl ${stat.mobileWidthClass} ${stat.delayClass} ${isVisible ? BAR_H_REVEALED : ''}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutSection1;