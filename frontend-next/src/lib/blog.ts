import { SITE_ORIGIN } from "@/lib/site";

/** "/blog/a/b/" -> "a/b". Permalinks are stored inconsistently in older rows. */
export const cleanSlug = (raw: string | null | undefined): string =>
  String(raw || "")
    .replace(/^\/+/, "")
    .replace(/^blog\//, "")
    .replace(/\/+$/, "");

export const blogPath = (permalink: string | null | undefined): string => `/blog/${cleanSlug(permalink)}`;

export const blogUrl = (permalink: string | null | undefined): string => `${SITE_ORIGIN}${blogPath(permalink)}`;

export const stripHtml = (html: string | null | undefined): string =>
  String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();

/** Epoch-ms, SQL DATETIME or ISO string -> ISO-8601, or null. */
export const toIso = (value: string | number | null | undefined): string | null => {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  const date = Number.isFinite(numeric) ? new Date(numeric) : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

/**
 * Same output as the Vite build's formatDate. The time zone is pinned so the
 * server-rendered HTML and the hydrated client agree on the calendar day.
 */
export const formatDate = (ts: number | null | undefined, month: "short" | "long" = "short"): string =>
  ts
    ? new Date(Number(ts)).toLocaleDateString("en-US", {
        year: "numeric",
        month,
        day: "numeric",
        timeZone: "Asia/Kolkata",
      })
    : "Just now";
