import type { Metadata } from "next";

import { NOINDEX_METADATA } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: { absolute: "Page not found | Genie Media & Studio" },
  ...NOINDEX_METADATA,
};

export default function NotFound() {
  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 pt-32 pb-24 mt-12 text-center text-white">
      <div className="max-w-2xl mx-auto space-y-6">
        <p className="text-orange-400 font-semibold tracking-widest">404</p>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">Page not found</h1>
        <p className="text-lg text-gray-300">The page you were looking for doesn&apos;t exist or has moved.</p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <a href="/" className="bg-orange-500 hover:bg-orange-400 text-black font-semibold px-6 py-3 rounded-full">
            Go to the home page
          </a>
          <a href="/services" className="border border-white/40 hover:bg-white/10 font-semibold px-6 py-3 rounded-full">
            Our services
          </a>
          <a href="/blogs" className="border border-white/40 hover:bg-white/10 font-semibold px-6 py-3 rounded-full">
            Read the blog
          </a>
          <a href="/contact" className="border border-white/40 hover:bg-white/10 font-semibold px-6 py-3 rounded-full">
            Contact us
          </a>
        </div>
      </div>
    </section>
  );
}
