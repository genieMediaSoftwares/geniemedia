import Script from "next/script";

import { GA4_ID, GTM_ID } from "@/lib/site";

/**
 * Google Tag Manager + Google Analytics 4, with the same deferred loading the
 * Vite build's index.html used.
 *
 * As of 2026-09-28 the published GTM container has no tags: page views are sent
 * by the separate GA4 snippet below, which is the site's only analytics. Keep
 * it unless a GA4 tag is added to the GTM container first, or page views stop
 * being recorded. Each script is included exactly once (in the root layout), so
 * nothing is double-counted.
 *
 * The dataLayer, the `gtm.js` start event and the queued gtag() config run
 * immediately; only the third-party downloads wait until the page has loaded,
 * settled for 1.5s and the main thread is idle, so they never compete with the
 * first render.
 *
 * Client-side navigations (router.push) are recorded by GA4 enhanced
 * measurement's "page changes based on browser history events", which is on
 * by default, so no manual page_view is sent — that would double-count.
 */
export default function Analytics() {
  return (
    <>
      <Script id="gtm-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
(function (w, d, id) {
  var loaded = false;
  function inject() {
    if (loaded) return;
    loaded = true;
    var s = d.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + id;
    d.head.appendChild(s);
  }
  function schedule() {
    setTimeout(function () {
      if ('requestIdleCallback' in w) w.requestIdleCallback(inject, { timeout: 2000 });
      else inject();
    }, 1500);
  }
  if (d.readyState === 'complete') schedule();
  else w.addEventListener('load', schedule, { once: true });
})(window, document, '${GTM_ID}');`}
      </Script>
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA4_ID}');
(function loadAnalytics() {
  var loaded = false;
  function inject() {
    if (loaded) return;
    loaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=${GA4_ID}';
    document.head.appendChild(s);
  }
  function schedule() {
    setTimeout(function () {
      if ('requestIdleCallback' in window) requestIdleCallback(inject, { timeout: 2000 });
      else inject();
    }, 1500);
  }
  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
})();`}
      </Script>
    </>
  );
}

/** The GTM <noscript> fallback, placed first in <body> as Google specifies. */
export function GtmNoScript() {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
