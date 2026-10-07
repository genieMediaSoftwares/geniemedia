"use client";

import type { ReactNode } from "react";

export default function WhatsAppContactLink({ className, children }: { className: string; children: ReactNode }) {
  return (
    <a href="/contact" className={className} onClick={() => (window.location.href = "https://wa.me/919032845433")}>
      {children}
    </a>
  );
}
