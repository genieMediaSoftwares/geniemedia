"use client";

import { useEffect } from "react";

type Gtag = (command: "event", name: string, params: Record<string, string>) => void;

// Sends a GA4 event for clicks on elements with data-track="event_name" (calls, WhatsApp,
// CTAs), tagged with the page path. Same pattern as CaseStudyTracker.
export default function ClickTracker({ page }: { page: string }) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const name = (e.target as Element | null)?.closest<HTMLElement>("[data-track]")?.dataset.track;
      const gtag = (window as unknown as { gtag?: Gtag }).gtag;
      if (name && typeof gtag === "function") gtag("event", name, { page_path: page });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [page]);
  return null;
}
