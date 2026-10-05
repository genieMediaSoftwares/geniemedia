/**
 * Every configurable value in the app comes from the .env file, through this
 * module only. There are no hard-coded fallbacks: a missing required value
 * stops the build with a clear message instead of silently using a default.
 *
 * Next.js inlines NEXT_PUBLIC_* values at build time, but only when they are
 * written as literal `process.env.NAME` expressions, which is why each one is
 * spelled out below rather than looked up dynamically.
 *
 * See the comments in .env for what each variable does.
 */

const clean = (value: string | undefined): string => (value ?? "").trim();
const noTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

function required(name: string, value: string | undefined): string {
  const v = clean(value);
  if (!v) {
    throw new Error(`${name} is not set. Add it to the .env file.`);
  }
  return v;
}

/** Express backend base URL (blogs, projects, admin login). */
export const API_BASE_URL = noTrailingSlash(required("NEXT_PUBLIC_API_BASE_URL", process.env.NEXT_PUBLIC_API_BASE_URL));

/** Public origin of this website; canonicals, sitemap and JSON-LD are built from it. */
export const SITE_URL = noTrailingSlash(required("NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL));

/** Hostinger PHP endpoint the contact form posts to. */
export const CONTACT_FORM_URL = required("NEXT_PUBLIC_CONTACT_FORM_URL", process.env.NEXT_PUBLIC_CONTACT_FORM_URL);

/** Hostinger PHP endpoint that serves social share previews for blog posts. */
export const SHARE_PREVIEW_URL = required("NEXT_PUBLIC_SHARE_PREVIEW_URL", process.env.NEXT_PUBLIC_SHARE_PREVIEW_URL);

/** Google Analytics 4 measurement ID. Optional: analytics is skipped when empty. */
export const GA4_ID = clean(process.env.NEXT_PUBLIC_GA4_ID);

/** Google Tag Manager container ID. Optional: GTM is skipped when empty. */
export const GTM_ID = clean(process.env.NEXT_PUBLIC_GTM_ID);

/** Google Search Console verification token. Optional. */
export const GOOGLE_SITE_VERIFICATION = clean(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION);

/** Server-only: faster/private backend address for build-time fetches. Optional. */
export const API_INTERNAL_BASE_URL = noTrailingSlash(clean(process.env.API_INTERNAL_BASE_URL));
