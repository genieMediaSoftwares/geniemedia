"use client";

import { useState, useSyncExternalStore } from "react";

import type { CaseStudy, CaseStudyCategory } from "@/types";
import { CASE_STUDY_CATEGORIES } from "@/lib/caseStudies";
import CaseStudyCard from "@/components/caseStudy/CaseStudyCard";

type Filter = "all" | CaseStudyCategory;

const subscribe = (onChange: () => void) => {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
};

const readFilter = (search: string, available: CaseStudyCategory[]): Filter => {
  const value = new URLSearchParams(search).get("category");
  return value && (available as string[]).includes(value) ? (value as CaseStudyCategory) : "all";
};

export default function CaseStudyFilter({ items }: { items: CaseStudy[] }) {
  const available = CASE_STUDY_CATEGORIES.filter((c) => items.some((cs) => cs.category === c.id));
  const search = useSyncExternalStore(subscribe, () => window.location.search, () => "");
  const [chosen, setChosen] = useState<Filter | null>(null);
  const filter = chosen ?? readFilter(search, available.map((c) => c.id));

  const choose = (next: Filter) => {
    setChosen(next);
    try {
      const url = new URL(window.location.href);
      if (next === "all") url.searchParams.delete("category");
      else url.searchParams.set("category", next);
      window.history.replaceState(null, "", url.toString());
    } catch {
    }
  };

  const shown = filter === "all" ? items : items.filter((cs) => cs.category === filter);
  const options: Array<{ id: Filter; label: string; count: number }> = [
    { id: "all", label: "All", count: items.length },
    ...available.map((c) => ({ id: c.id as Filter, label: c.label, count: items.filter((cs) => cs.category === c.id).length })),
  ];

  return (
    <>
      {available.length > 1 && (
        <div role="group" aria-label="Filter case studies by service" className="flex flex-wrap justify-center gap-2 mb-10">
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              aria-pressed={filter === o.id}
              onClick={() => choose(o.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
                filter === o.id ? "bg-slate-900 text-white" : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
              }`}
            >
              {o.label} <span className={filter === o.id ? "text-gray-300" : "text-gray-400"}>({o.count})</span>
            </button>
          ))}
        </div>
      )}
      <p className="sr-only" aria-live="polite">{`Showing ${shown.length} case ${shown.length === 1 ? "study" : "studies"}`}</p>
      <ul className="grid gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((cs) => (
          <li key={cs.slug}>
            <CaseStudyCard cs={cs} />
          </li>
        ))}
      </ul>
    </>
  );
}
