"use client";

import { useEffect, useState } from "react";

import BASE_URL from "@/Api";
import type { CaseStudy } from "@/types";
import { arr } from "@/lib/api/coerce";
import { normalizeBlog } from "@/lib/api/normalize";
import { blogPath, cleanSlug } from "@/lib/blog";
import { caseStudyTitle, normalizeCaseStudy, relatedCaseStudies } from "@/lib/caseStudies";
import CaseStudyArticle, { type RelatedArticle } from "@/components/caseStudy/CaseStudyArticle";
import CaseStudyTracker from "@/components/caseStudy/CaseStudyTracker";

type State =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "found"; cs: CaseStudy; related: CaseStudy[]; articles: RelatedArticle[] };

const getJson = (path: string): Promise<unknown> =>
  fetch(`${BASE_URL}${path}`, { headers: { Accept: "application/json" } }).then((r) => (r.ok ? r.json() : null));

export default function LiveCaseStudyArticle() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const match = window.location.pathname.match(/^\/case-studies\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/);
    let cancelled = false;
    const finish = (next: State) => {
      if (!cancelled) setState(next);
    };

    (async () => {
      if (!match) return finish({ kind: "missing" });
      try {
        const cs = normalizeCaseStudy(await getJson(`/api/case-studies/${match[1]}`));
        if (!cs || cs.status !== "published") return finish({ kind: "missing" });

        const [all, blogs] = await Promise.all([
          getJson("/api/case-studies").catch(() => []),
          cs.relatedBlogs.length ? getJson("/api/blogs").catch(() => []) : Promise.resolve([]),
        ]);
        const published = arr(all)
          .map((raw) => normalizeCaseStudy(raw))
          .filter((c): c is CaseStudy => c !== null && c.status === "published");
        const wanted = new Set(cs.relatedBlogs.map((s) => cleanSlug(s)));
        const articles = arr(blogs)
          .map((raw) => normalizeBlog(raw))
          .filter((b): b is NonNullable<typeof b> => b !== null && b.status === "published" && wanted.has(cleanSlug(b.permalink)) && !b.robots_directive.startsWith("noindex"))
          .map((b) => ({ title: b.title, href: blogPath(b.permalink), category: b.category }));

        document.title = caseStudyTitle(cs);
        finish({ kind: "found", cs, related: relatedCaseStudies(published, cs), articles });
      } catch {
        finish({ kind: "missing" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.kind === "found") {
    return (
      <>
        <CaseStudyTracker slug={state.cs.slug} />
        <CaseStudyArticle cs={state.cs} related={state.related} articles={state.articles} />
      </>
    );
  }

  if (state.kind === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-orange-500 border-dashed rounded-full animate-spin" aria-label="Loading case study" />
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 pt-32 pb-24 mt-12 text-center text-white">
      <div className="max-w-2xl mx-auto space-y-6">
        <p className="text-orange-400 font-semibold tracking-widest">404</p>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">Case study not found</h1>
        <p className="text-lg text-gray-300">This case study doesn&apos;t exist or is no longer published.</p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <a href="/case-studies" className="bg-orange-500 hover:bg-orange-400 text-black font-semibold px-6 py-3 rounded-full">
            See all case studies
          </a>
          <a href="/" className="border border-white/40 hover:bg-white/10 font-semibold px-6 py-3 rounded-full">
            Go to the home page
          </a>
        </div>
      </div>
    </section>
  );
}
