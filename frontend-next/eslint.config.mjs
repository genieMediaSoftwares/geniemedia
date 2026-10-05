import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [".next/**", "dist/**", "out/**", "node_modules/**", "next-env.d.ts"],
  },
  {
    rules: {
      // The site keeps the Vite build's hand-tuned <img> markup (explicit
      // width/height, fetchPriority, <picture> art direction) so the design and
      // CLS behaviour are unchanged. next/image is used where it adds value.
      "@next/next/no-img-element": "off",
      // Internal navigation deliberately uses plain <a> (full document loads),
      // as the Vite site did: route CSS such as HomePage.css then never leaks
      // onto another page, so every page renders exactly as before.
      "@next/next/no-html-link-for-pages": "off",
      // Copy written with literal quotes/apostrophes renders identically; the
      // Vite project never enforced this rule.
      "react/no-unescaped-entities": "off",
    },
  },
];

export default config;
