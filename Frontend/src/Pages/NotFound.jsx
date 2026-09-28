import { useEffect } from 'react';

/**
 * Catch-all for URLs no route matches.
 *
 * Before this existed an unknown path rendered an empty <main> with a 200, the
 * home page's title and the home page's canonical — a "soft 404" that search
 * engines could index as a thin duplicate of the home page. .htaccess now
 * answers unknown paths with a real 404 status; this page is what that
 * response shows, and it marks itself noindex for any host that still serves
 * it as a 200.
 *
 * The robots tag and title are restored on unmount, because index.html's
 * robots tag is shared by every route and has no other owner in the client.
 */
export default function NotFound() {
  useEffect(() => {
    const robots = document.querySelector('meta[name="robots"]');
    const previousRobots = robots?.getAttribute('content');
    const previousTitle = document.title;

    robots?.setAttribute('content', 'noindex, follow');
    document.title = 'Page not found | Genie Media & Studio';

    return () => {
      if (robots && previousRobots) robots.setAttribute('content', previousRobots);
      document.title = previousTitle;
    };
  }, []);

  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 pt-32 pb-24 mt-12 text-center text-white">
      <div className="max-w-2xl mx-auto space-y-6">
        <p className="text-orange-400 font-semibold tracking-widest">404</p>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">Page not found</h1>
        <p className="text-lg text-gray-300">
          The page you were looking for doesn&apos;t exist or has moved.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <a href="/" className="bg-orange-500 hover:bg-orange-400 text-black font-semibold px-6 py-3 rounded-full">
            Go to the home page
          </a>
          <a href="/services" className="border border-white/40 hover:bg-white/10 font-semibold px-6 py-3 rounded-full">
            Our services
          </a>
          <a href="/contact" className="border border-white/40 hover:bg-white/10 font-semibold px-6 py-3 rounded-full">
            Contact us
          </a>
        </div>
      </div>
    </section>
  );
}
