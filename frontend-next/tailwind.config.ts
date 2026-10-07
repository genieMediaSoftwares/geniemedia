import type { Config } from "tailwindcss";

const EASE_OUT_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "slide-in-right-sm": {
          from: { transform: "translateX(30px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "dropdown-slide": {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },

        "slide-from-left": { from: { transform: "translateX(-60px)" }, to: { transform: "translateX(0)" } },
        "fade-in-right-lg": {
          from: { opacity: "0", transform: "translateX(60px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in-up-lg": {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up-20": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "rise-in": { from: { transform: "translateY(24px)" }, to: { transform: "translateY(0)" } },
        "slide-in-left-md": {
          from: { opacity: "0", transform: "translateX(-50px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right-md": {
          from: { opacity: "0", transform: "translateX(50px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "bounce-in": {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)" },
        },
        "scale-in": { from: { opacity: "0", transform: "scale(0.9)" }, to: { opacity: "1", transform: "scale(1)" } },
        "success-pop": {
          "0%": { opacity: "0", transform: "scale(0.85) translateY(10px)" },
          "60%": { transform: "scale(1.03) translateY(-2px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "slide-up-30": {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },

        "admin-slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "admin-scale-in": { from: { opacity: "0", transform: "scale(.92)" }, to: { opacity: "1", transform: "scale(1)" } },
        "admin-fade-in": {
          from: { opacity: "0", transform: "translateY(-6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },

        "float-sm": { "0%, 100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-10px)" } },
        sparkle: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.2)" },
        },
        "home-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.05)", opacity: "0.8" },
        },
        "podcast-drift": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(50px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-50px, 50px) scale(0.9)" },
        },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        wave: { "0%, 100%": { transform: "scaleY(1)" }, "50%": { transform: "scaleY(1.5)" } },
      },
      animation: {
        "header-dropdown": `dropdown-slide 0.3s ${EASE_OUT_EXPO}`,
        "header-slide-in": `slide-in-right-sm 0.3s ${EASE_OUT_EXPO}`,
        "header-item": `slide-in-right-sm 0.4s ${EASE_OUT_EXPO} forwards`,

        "home-content": `slide-from-left 0.5s ${EASE_OUT_EXPO} both`,
        "home-image": `fade-in-right-lg 0.6s ${EASE_OUT_EXPO} 0.1s both`,
        "home-badge": `fade-in-up-lg 0.5s ${EASE_OUT_EXPO} 0.05s both`,
        "home-rise": `rise-in 0.5s ${EASE_OUT_EXPO} both`,
        "home-buttons": `fade-in-up-lg 0.5s ${EASE_OUT_EXPO} 0.15s both`,
        "home-stats": `fade-in-up-lg 0.5s ${EASE_OUT_EXPO} 0.2s both`,
        "home-float": "float-sm 6s ease-in-out infinite",
        "home-float-slow": "float-sm 8s ease-in-out infinite",
        "home-sparkle": "sparkle 3s ease-in-out infinite",
        "home-glow": "spin 20s linear infinite",
        "home-pulse": "home-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",

        rise: `rise-in 0.5s ${EASE_OUT_EXPO} both`,
        "fade-in-up-slow": `fade-in-up-lg 0.8s ${EASE_OUT_EXPO} both`,
        "slide-in-left": `slide-in-left-md 0.8s ${EASE_OUT_EXPO} both`,
        "slide-in-right": `slide-in-right-md 0.8s ${EASE_OUT_EXPO} both`,
        "carousel-from-right": `slide-in-right-md 0.45s ${EASE_OUT_EXPO} both`,
        "carousel-from-left": `slide-in-left-md 0.45s ${EASE_OUT_EXPO} both`,
        "bounce-in": `bounce-in 0.6s ${EASE_OUT_EXPO} both`,
        "scale-in": `scale-in 0.6s ${EASE_OUT_EXPO} both`,
        "success-pop": "success-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "float-sm": "float-sm 3s ease-in-out infinite",
        "float-sm-20": "float-sm 20s ease-in-out infinite",

        "booking-slide-up": "slide-up-30 0.5s ease-out both",
        "booking-fade-in": "fade-in 0.6s ease-out",

        "admin-slide-up": "admin-slide-up .35s ease forwards",
        "admin-scale-in": "admin-scale-in .25s ease forwards",
        "admin-fade-in": "admin-fade-in .2s ease forwards",

        "podcast-hero-rise": "rise-in 0.6s ease both",
        "podcast-desc": "fade-up-20 0.6s ease 0.15s both",
        "podcast-cta": "fade-up-20 0.6s ease 0.25s both",
        "podcast-item": "fade-up-20 1s ease both",
        "podcast-marquee": "marquee 25s linear infinite",
        "podcast-wave": "wave 1.5s ease-in-out infinite",
        "podcast-drift-20": "podcast-drift 20s ease-in-out infinite",
        "podcast-drift-15": "podcast-drift 15s ease-in-out infinite",
        "podcast-drift-3": "podcast-drift 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
