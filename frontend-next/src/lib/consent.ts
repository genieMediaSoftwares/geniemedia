// Cookie consent for Google Analytics (Consent Mode v2). Essential cookies are always on; analytics
// cookies are off until the visitor accepts. The inline default in components/Analytics.tsx reads the
// same storage key, so keep CONSENT_KEY in sync with it.

export const CONSENT_KEY = "gm_cookie_consent";
export const OPEN_COOKIE_SETTINGS = "gm:open-cookie-settings";

export interface ConsentChoice {
  analytics: boolean;
  savedAt: number;
}

type Gtag = (...args: unknown[]) => void;

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// The choice is kept in localStorage and in a first-party cookie, so it survives browsers or
// settings that block or wipe one of them.
function readCookie(): ConsentChoice | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CONSENT_KEY}=([01])`));
  return match ? { analytics: match[1] === "1", savedAt: 0 } : null;
}

export function readConsent(): ConsentChoice | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === "object" && typeof (parsed as ConsentChoice).analytics === "boolean") {
      return parsed as ConsentChoice;
    }
  } catch {
    // Storage blocked (private mode, disabled site data): fall back to the cookie.
  }
  return readCookie();
}

// Removes the Google Analytics cookies (_ga, _ga_<id>) for this site and its parent domain.
function clearAnalyticsCookies() {
  const host = window.location.hostname;
  const domains = ["", host, `.${host.replace(/^www\./, "")}`];
  for (const name of document.cookie.split(";").map((c) => c.split("=")[0].trim())) {
    if (!/^_ga(_|$)/.test(name)) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

export function saveConsent(analytics: boolean) {
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify({ analytics, savedAt: Date.now() } satisfies ConsentChoice));
  } catch {
    // The cookie below still keeps the choice.
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_KEY}=${analytics ? 1 : 0}; Max-Age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax${secure}`;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  gtag?.("consent", "update", { analytics_storage: analytics ? "granted" : "denied" });
  if (!analytics) clearAnalyticsCookies();
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS));
}
