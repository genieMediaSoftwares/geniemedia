import Script from "next/script";

import { GA4_ID, GTM_ID } from "@/lib/site";
import { CONSENT_KEY } from "@/lib/consent";

export default function Analytics() {
  return (
    <>
      {/* Consent Mode v2 default: analytics cookies stay off until the visitor accepts in CookieConsent.
          Rendered first so it runs before GTM and GA4. No ads are run, so ad storage is always denied. */}
      {(GTM_ID || GA4_ID) && (
      <Script id="consent-default" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
window.gtag = gtag;
var analyticsGranted = false;
try { analyticsGranted = JSON.parse(localStorage.getItem('${CONSENT_KEY}') || 'null').analytics === true; } catch (e) {}
if (!analyticsGranted && /(?:^|;\\s*)${CONSENT_KEY}=1/.test(document.cookie)) analyticsGranted = true;
gtag('consent', 'default', {
  analytics_storage: analyticsGranted ? 'granted' : 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted'
});`}
      </Script>
      )}
      {GTM_ID && (
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
      )}
      {GA4_ID && (
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
      )}
    </>
  );
}

export function GtmNoScript() {
  if (!GTM_ID) return null;
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
