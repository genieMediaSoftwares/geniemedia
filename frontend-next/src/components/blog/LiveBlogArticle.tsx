"use client";

import { useEffect, useState } from "react";

import BASE_URL from "@/Api";
import type { Blog } from "@/types";
import BlogArticle from "@/components/blog/BlogArticle";
import { arr } from "@/lib/api/coerce";
import { normalizeBlog } from "@/lib/api/normalize";
import { cleanSlug } from "@/lib/blog";

type State = { kind: "loading" } | { kind: "missing" } | { kind: "found"; blog: Blog; related: Blog[] };

export default function LiveBlogArticle() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const slug = cleanSlug(decodeURIComponent(window.location.pathname));

    let cancelled = false;
    (async () => {
      if (!slug || slug === "blog-view") {
        setState({ kind: "missing" });
        return;
      }
      try {
        const res = await fetch(`${BASE_URL}/api/blog/${slug.split("/").map(encodeURIComponent).join("/")}`);
        const blog = res.ok ? normalizeBlog(await res.json()) : null;
        if (!blog || blog.status !== "published") {
          if (!cancelled) setState({ kind: "missing" });
          return;
        }
        let related: Blog[] = [];
        try {
          const all = await fetch(`${BASE_URL}/api/blogs`).then((r) => (r.ok ? r.json() : []));
          related = arr(all)
            .map((raw) => normalizeBlog(raw))
            .filter((b): b is Blog => b !== null && b.status === "published" && b.category === blog.category && b.permalink !== blog.permalink)
            .slice(0, 3);
        } catch {
        }
        if (!cancelled) {
          document.title = blog.meta_title || blog.title;
          setState({ kind: "found", blog, related });
        }
      } catch {
        if (!cancelled) setState({ kind: "missing" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.kind === "found") return <BlogArticle blog={state.blog} related={state.related} />;

  if (state.kind === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-orange-500 border-dashed rounded-full animate-spin" aria-label="Loading article" />
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 pt-32 pb-24 mt-12 text-center text-white">
      <div className="max-w-2xl mx-auto space-y-6">
        <p className="text-orange-400 font-semibold tracking-widest">404</p>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">Article not found</h1>
        <p className="text-lg text-gray-300">This article doesn&apos;t exist or is no longer published.</p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <a href="/blogs" className="bg-orange-500 hover:bg-orange-400 text-black font-semibold px-6 py-3 rounded-full">
            Read the blog
          </a>
          <a href="/" className="border border-white/40 hover:bg-white/10 font-semibold px-6 py-3 rounded-full">
            Go to the home page
          </a>
        </div>
      </div>
    </section>
  );
}
