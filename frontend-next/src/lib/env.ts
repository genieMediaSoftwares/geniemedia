const clean = (value: string | undefined): string => (value ?? "").trim();
const noTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

function required(name: string, value: string | undefined): string {
  const v = clean(value);
  if (!v) {
    throw new Error(`${name} is not set. Add it to the .env file.`);
  }
  return v;
}

export const API_BASE_URL = noTrailingSlash(required("NEXT_PUBLIC_API_BASE_URL", process.env.NEXT_PUBLIC_API_BASE_URL));

export const SITE_URL = noTrailingSlash(required("NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL));

export const CONTACT_FORM_URL = required("NEXT_PUBLIC_CONTACT_FORM_URL", process.env.NEXT_PUBLIC_CONTACT_FORM_URL);

export const SHARE_PREVIEW_URL = required("NEXT_PUBLIC_SHARE_PREVIEW_URL", process.env.NEXT_PUBLIC_SHARE_PREVIEW_URL);

export const GA4_ID = clean(process.env.NEXT_PUBLIC_GA4_ID);

export const GTM_ID = clean(process.env.NEXT_PUBLIC_GTM_ID);

export const GOOGLE_SITE_VERIFICATION = clean(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION);

export const API_INTERNAL_BASE_URL = noTrailingSlash(clean(process.env.API_INTERNAL_BASE_URL));
