import React, { useEffect, useRef, useState } from 'react';

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
      delay: 0
    },
    { 
      value: 3, 
      suffix: '+',
      label: 'Countries Served',
      color: 'bg-[#03C2C2]',
      maxHeight: 128, // h-32 in pixels
      height: 'h-32',
      mobileWidth: 62,
      delay: 80
    },
    { 
      value: 150, 
      suffix: '+',
      label: 'Growth Campaigns ',
      color: 'bg-[#CFAF03]',
      maxHeight: 192, // h-48 in pixels
      height: 'h-38',
      mobileWidth: 106,
      delay: 150
    },
    { 
      value: 400, 
      suffix: '+',
      label: 'Digital Transformations',
      color: 'bg-[#03C2C2]',
      maxHeight: 240, // h-60 in pixels
      height: 'h-60',
      mobileWidth: 180,
      delay: 250
    },
    { 
      value: 800, 
      suffix: '+',
      label: 'Projects Delivered',
      color: 'bg-[#CFAF03]',
      maxHeight: 256, // h-64 in pixels
      height: 'h-64',
      mobileWidth: 260,
      delay:350
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
    let frame;
    let startTime;

    const tick = (now) => {
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

  const MAX_MOBILE_VALUE = Math.max(...stats.map(s => s.value));


  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(255, 107, 0, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(255, 107, 0, 0.6);
          }
        }

        .animate-fadeInUp {
  animation: fadeInUp 0.4s ease forwards;
}

        .animate-slideInLeft {
          animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .animate-slideInRight {
          animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .animate-bounceIn {
          animation: bounceIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        /* The bars animate with transform, not width/height.
           Transform and opacity are the only two properties the browser can
           animate on the compositor without re-running layout; the previous
           per-pixel height/width animation forced a reflow on every frame and
           showed up in Lighthouse as "non-composited animation". The rendered
           result — a bar growing from its base to full size — is identical.
           An outer wrapper holds the final size so no space is reserved late
           and nothing shifts (CLS stays at zero). */
        .stat-bar {
          transform: scaleY(0);
          transform-origin: bottom;
          transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1),
                      filter 0.3s ease;
          will-change: transform;
        }

        .stat-bar.is-revealed {
          transform: scaleY(1);
        }

        .stat-bar.is-revealed:hover {
          transform: scaleY(1) scaleX(1.05);
          filter: brightness(1.15);
        }

        .stat-bar-horizontal {
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1),
                      filter 0.3s ease;
          will-change: transform;
        }

        .stat-bar-horizontal.is-revealed {
          transform: scaleX(1);
        }

        .stat-bar-horizontal.is-revealed:hover {
          filter: brightness(1.15);
        }

        @media (prefers-reduced-motion: reduce) {
          .stat-bar,
          .stat-bar-horizontal {
            transition: none;
          }
          .animate-fadeInUp,
          .animate-slideInLeft,
          .animate-slideInRight,
          .animate-bounceIn {
            animation: none !important;
          }
        }

        .counter-number {
          transition: all 0.3s ease;
          display: inline-block;
        }

        .counter-number.updating {
          transform: scale(1.1);
          color: #FF6B00;
        }

        .stat-label {
          transition: all 0.3s ease;
        }

        .stat-container:hover .stat-label {
          color: #FF6B00;
          transform: translateY(-5px);
        }

        .stat-container:hover .counter-number {
          color: #FF6B00;
          transform: scale(1.15);
        }
      `}</style>

      <section 
        ref={sectionRef}
        className="bg-gray-100 pt-10 px-6 lg:px-12"
        id='about'
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className={`mb-8 text-center ${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`}>
            <h2 className="text-4xl lg:text-6xl font-bold text-orange-600 mb-3">
              About Us
            </h2>
            <p className="text-lg lg:text-xl text-gray-800">
           Crafting powerful digital experiences with creative minds at top digital marketing companies in Vizag.
            </p>
          </div>

          {/* Who We Are & What Drives Us */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-16 mb-0">
            <div className={`${isVisible ? 'animate-slideInLeft' : 'opacity-0'}`}
                 style={{ animationDelay: '0.2s' }}>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                Who We Are
              </h3>
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                A dedicated team of digital creators helping brands grow with clarity, creativity, and purpose.
                At Genie Media & Studio, we blend strategy, design, content, and technology to create work that
                 speaks to people, stays with them, and supports lasting success.

              </p>
            </div>

            <div className={`${isVisible ? 'animate-slideInRight' : 'opacity-0'}`}
                 style={{ animationDelay: '0.3s' }}>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                What Drives Us?
              </h3>
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
               <b> Creativity fuels every move we make. </b>
                We think with intention, create with heart, and keep raising the bar day after day.
                Our mission is simple: help brands shape meaningful experiences that people remember, trust, and genuinely enjoy.

              </p>
            </div>
          </div>

          {/* Desktop: Vertical Bars */}
          <div className="hidden md:flex items-end justify-center gap-8 mt-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center stat-container"
              >
              
                <div className={`text-center mb-4 ${isVisible ? 'animate-bounceIn' : 'opacity-0'}`}
                     style={{ animationDelay: `${stat.delay}ms` }}>
                  <div className={`text-3xl lg:text-5xl font-extrabold text-gray-900 mb-2 counter-number ${counters[index] > 0 && counters[index] < stat.value ? 'updating' : ''}`}>
                    {counters[index]}{stat.suffix}
                  </div>
                  <div className="text-sm lg:text-base text-gray-600 font-medium px-2 stat-label">
                    {stat.label}
                  </div>
                </div>

                {/* The wrapper owns the final height so the layout is settled
                    from the first paint; only the inner bar is transformed. */}
                <div
                  className="w-full flex items-end"
                  style={{ height: `${stat.maxHeight}px` }}
                >
                  <div
                    className={`stat-bar w-full h-full ${stat.color} rounded-t-2xl ${isVisible ? 'is-revealed' : ''}`}
                    style={{ transitionDelay: `${stat.delay}ms` }}
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
                className={`stat-container ${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
                style={{ animationDelay: `${stat.delay}ms` }}
              >
               
                <div className="flex items-center gap-0 mt-5 mb-2">
                  <div className={`text-2xl font-bold text-gray-900 min-w-[80px] counter-number ${counters[index] > 0 && counters[index] < stat.value ? 'updating' : ''}`}>
                    {counters[index]}{stat.suffix}
                  </div>
                  <div className="text-sm text-gray-600 font-medium stat-label">
                    {stat.label}
                  </div>
                </div>

                {/* Same idea as the desktop bars: the final width is set once,
                    and the reveal is a composited scaleX. */}
                <div
                  className={`stat-bar-horizontal h-8 ${stat.color} rounded-r-2xl ${isVisible ? 'is-revealed' : ''}`}
                  style={{
                    width: `${(stat.value / MAX_MOBILE_VALUE) * 90}%`,
                    transitionDelay: `${stat.delay}ms`,
                  }}
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