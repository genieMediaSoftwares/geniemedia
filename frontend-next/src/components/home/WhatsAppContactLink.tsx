"use client";

import type { ReactNode } from "react";

/**
 * A link to /contact (what crawlers and new-tab clicks follow) that opens the
 * WhatsApp chat on a normal click, as the home page's "Get Started" button has
 * always done. Kept as its own tiny client island so the rest of the home page
 * stays server-rendered.
 */
export default function WhatsAppContactLink({ className, children }: { className: string; children: ReactNode }) {
  return (
    <a href="/contact" className={className} onClick={() => (window.location.href = "https://wa.me/919032845433")}>
      {children}
    </a>
  );
}
