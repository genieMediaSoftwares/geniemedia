"use client";

import { useEffect } from "react";

type Gtag = (command: "event", name: string, params: Record<string, string>) => void;

const send = (name: string, slug: string) => {
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag === "function") gtag("event", name, { case_study: slug });
};

export default function CaseStudyTracker({ slug }: { slug: string }) {
  useEffect(() => {
    send("case_study_view", slug);
    const onClick = (e: MouseEvent) => {
      const target = (e.target as Element | null)?.closest<HTMLElement>("[data-track]");
      const name = target?.dataset.track;
      if (name) send(name, slug);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [slug]);
  return null;
}
