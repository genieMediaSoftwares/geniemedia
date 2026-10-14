"use client";

import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { CONSENT_KEY, OPEN_COOKIE_SETTINGS, openCookieSettings, readConsent, saveConsent } from "@/lib/consent";

type View = "hidden" | "banner" | "preferences";

const BUTTON = "inline-flex min-h-[48px] items-center justify-center rounded-xl px-5 text-base font-bold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900";
const PRIMARY = `${BUTTON} bg-gray-900 text-white hover:bg-orange-500 hover:text-black`;
const SECONDARY = `${BUTTON} bg-gray-100 text-gray-900 hover:bg-gray-200`;

export default function CookieConsent() {
  const pathname = usePathname();
  const titleId = useId();
  const [view, setView] = useState<View>("hidden");
  const [analytics, setAnalytics] = useState(false);

  // Shown shortly after load (never in the static HTML search engines read), so it doesn't compete
  // with the page's first paint.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!readConsent()) setView("banner");
    }, 800);
    const open = () => {
      setAnalytics(readConsent()?.analytics ?? false);
      setView("preferences");
    };
    // A choice made in another open tab hides the banner here too.
    const syncFromOtherTab = (e: StorageEvent) => {
      if (e.key === CONSENT_KEY && readConsent()) setView("hidden");
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS, open);
    window.addEventListener("storage", syncFromOtherTab);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(OPEN_COOKIE_SETTINGS, open);
      window.removeEventListener("storage", syncFromOtherTab);
    };
  }, []);

  if (view === "hidden" || pathname?.startsWith("/admin")) return null;

  const decide = (allowAnalytics: boolean) => {
    saveConsent(allowAnalytics);
    setView("hidden");
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className="fixed inset-x-3 bottom-3 z-[90] sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-full sm:max-w-md"
    >
      <div className="rounded-2xl bg-white p-6 text-gray-900 shadow-2xl ring-1 ring-black/10 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-2xl font-bold tracking-tight">Cookie Settings</h2>
          <button
            type="button"
            onClick={() => decide(false)}
            aria-label="Close and use essential cookies only"
            className="-mr-2 -mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-900 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {view === "banner" ? (
          <>
            <p className="mt-3 text-[15px] leading-relaxed text-gray-700">
              We use cookies to keep this website working and, with your permission, Google Analytics to understand which
              pages are useful so we can improve them. By clicking Accept, you agree to analytics cookies, as outlined in
              our{" "}
              <a href="/privacy-policy#cookies" className="font-semibold text-gray-900 underline underline-offset-2 hover:text-orange-600">
                Cookie Policy
              </a>
              .
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" className={PRIMARY} onClick={() => decide(true)}>Accept</button>
              <button type="button" className={SECONDARY} onClick={() => setView("preferences")}>Preferences</button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-3 text-[15px] leading-relaxed text-gray-700">
              Choose which cookies we can use. You can change this at any time from &ldquo;Cookie settings&rdquo; in the
              footer.
            </p>
            <ul className="mt-5 space-y-3">
              <li className="flex items-start justify-between gap-4 rounded-xl bg-gray-50 p-4">
                <div>
                  <p className="font-semibold">Essential</p>
                  <p className="mt-1 text-sm text-gray-600">Needed for the website and contact forms to work. Always on.</p>
                </div>
                <span className="shrink-0 rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">Always on</span>
              </li>
              <li className="flex items-start justify-between gap-4 rounded-xl bg-gray-50 p-4">
                <label htmlFor={`${titleId}-analytics`} className="cursor-pointer">
                  <span className="block font-semibold">Analytics</span>
                  <span className="mt-1 block text-sm text-gray-600">Google Analytics counts visits and page views so we can improve the site.</span>
                </label>
                <input
                  id={`${titleId}-analytics`}
                  type="checkbox"
                  role="switch"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  onClick={() => setAnalytics((v) => !v)}
                  className="relative mt-1 h-7 w-12 shrink-0 cursor-pointer rounded-full bg-gray-300 transition-colors after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-gray-900 peer-checked:after:translate-x-5 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gray-900"
                />
              </li>
            </ul>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" className={PRIMARY} onClick={() => decide(analytics)}>Save choices</button>
              <button type="button" className={SECONDARY} onClick={() => decide(true)}>Accept all</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function CookieSettingsLink({ className }: { className?: string }) {
  return (
    <button type="button" onClick={openCookieSettings} className={className}>
      Cookie Settings
    </button>
  );
}
