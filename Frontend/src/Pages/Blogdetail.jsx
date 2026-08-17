import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Calendar, Tag, Share2, Copy, Check, ArrowRight, Hash, X,
} from "lucide-react";
import DOMPurify from "dompurify";
import BASE_URL from "../Api";
// Self-hosted rather than fetched from images.unsplash.com — see the note in Blogs.jsx.
import BlogFallback from "../assets/blog/blog-hero.webp";

const FALLBACK = BlogFallback;

const cleanSlug = (raw) =>
    raw ? raw.replace(/^\/+/, "").replace(/^blog\//, "") : raw;

export default function BlogDetail() {
    const params = useParams();
    const slug = params["*"];
    const navigate = useNavigate();

    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [relatedBlogs, setRelated] = useState([]);
    const [imgError, setImgError] = useState(false);
    const [activeKeyword, setActiveKeyword] = useState(null);
    const [kwLoading, setKwLoading] = useState(null);

    useEffect(() => {
        const fetchBlog = async () => {
            setLoading(true);
            setImgError(false);
            setBlog(null);
            setRelated([]);
            setActiveKeyword(null);

            const safeSlug = cleanSlug(slug);
            if (!safeSlug) { setLoading(false); return; }

            try {
                const res = await fetch(`${BASE_URL}/api/blog/${safeSlug}`);
                if (!res.ok) { setBlog(null); return; }

                const data = await res.json();
                if (!data || !data.title) { setBlog(null); return; }

                setBlog(data);

                try {
                    const allRes = await fetch(`${BASE_URL}/api/blogs`);
                    const allData = await allRes.json();
                    if (Array.isArray(allData)) {
                        const related = allData
                            .filter(
                                (b) =>
                                    b.category === data.category &&
                                    cleanSlug(b.permalink) !== safeSlug &&
                                    b.status === "published"
                            )
                            .slice(0, 3);
                        setRelated(related);
                    }
                } catch (_) { }
            } catch (err) {
                console.error("BlogDetail fetch error:", err);
                setBlog(null);
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [slug]);

    useEffect(() => {
        if (!blog?.keywords) return;
        const kw = blog.keywords.split(",").map((k) => k.trim()).filter(Boolean);
        document.head.querySelector('meta[name="keywords"]')?.remove();
        const m = document.createElement("meta");
        m.name = "keywords";
        m.content = kw.join(", ");
        document.head.appendChild(m);
        return () => m.remove();
    }, [blog]);

    const formatDate = (ts) =>
        ts
            ? new Date(Number(ts)).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })
            : "Just now";

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const goRelated = (b) => {
        navigate(`/blog/${cleanSlug(b.permalink)}`);
        window.scrollTo(0, 0);
    };

    /* ── Keyword click:
         1. Show keyword as active tag below the date row
         2. Navigate to matching blog by title/keywords      ── */
    const handleKeywordClick = async (keyword) => {
        // Set active tag immediately — stays visible on new page load
        setActiveKeyword(keyword);
        setKwLoading(keyword);

        try {
            const res = await fetch(`${BASE_URL}/api/blogs`);
            const allBlogs = await res.json();

            if (Array.isArray(allBlogs)) {
                const published = allBlogs.filter((b) => b.status === "published");

                // 1️⃣ Exact title match
                let matched = published.find(
                    (b) => b.title?.trim().toLowerCase() === keyword.toLowerCase()
                );

                // 2️⃣ Title contains keyword
                if (!matched) {
                    matched = published.find((b) =>
                        b.title?.toLowerCase().includes(keyword.toLowerCase())
                    );
                }

                // 3️⃣ Keyword present in that blog's keywords field
                if (!matched) {
                    matched = published.find(
                        (b) =>
                            b.keywords &&
                            b.keywords
                                .split(",")
                                .map((k) => k.trim().toLowerCase())
                                .includes(keyword.toLowerCase())
                    );
                }

                if (matched && cleanSlug(matched.permalink)) {
                    navigate(`/blog/${cleanSlug(matched.permalink)}`);
                    window.scrollTo(0, 0);
                }
                // If no match — tag still shows, user can dismiss with ×
            }
        } catch (err) {
            console.error("Keyword click error:", err);
        } finally {
            setKwLoading(null);
        }
    };

    /* ─────────────────────── Loading ─────────────────────── */
    if (loading) {
        return (
            <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-4">
                <div className="animate-spin">
                    <svg className="w-12 h-12 text-[#6B4A2D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" strokeWidth="2" opacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" strokeWidth="2" />
                    </svg>
                </div>
                <p className="text-slate-500 text-sm font-medium">Loading blog…</p>
            </div>
        );
    }

    /* ─────────────────────── Not Found ─────────────────────── */
    if (!blog) {
        return (
            <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-4">
                <svg className="w-14 h-14 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-slate-600 font-medium text-sm">Blog not found</p>
                <p className="text-slate-400 text-xs mt-1">
                    Slug: <code className="bg-slate-100 px-1 rounded">{slug || "undefined"}</code>
                </p>
                <button
                    onClick={() => navigate("/blogs")}
                    className="mt-3 px-6 py-2.5 bg-[#6B4A2D] hover:bg-[#5a3f25] text-white rounded-lg transition-colors text-sm font-semibold"
                >
                    Back to Blogs
                </button>
            </div>
        );
    }

    const heroSrc = !imgError && blog.image ? blog.image : FALLBACK;

    return (
        <div className="w-full overflow-x-hidden bg-white">

            {/* ══════════════════════════════════════════════
                HERO IMAGE
            ══════════════════════════════════════════════ */}
            <section className="w-full bg-stone-100 overflow-hidden">
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[2/1] lg:aspect-[21/9]">
                    <img
                        src={heroSrc}
                        alt={blog.title}
                        onError={() => setImgError(true)}
                        loading="eager"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-stone-900/30 to-transparent pointer-events-none" />

                    {/* Category badge overlaid bottom-left */}
                    {blog.category && (
                        <div className="absolute bottom-4 left-4 z-10">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#6B4A2D] text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm">
                                <Tag className="w-3.5 h-3.5" strokeWidth={2} />
                                {blog.category}
                            </span>
                        </div>
                    )}
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                ARTICLE BODY
            ══════════════════════════════════════════════ */}
            <article className="py-8 sm:py-12 md:py-16 bg-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* ── Date + Share row ── */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-5 border-b-2 border-slate-100">
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                            <Calendar className="w-4 h-4 text-[#6B4A2D] flex-shrink-0" strokeWidth={2} />
                            <time dateTime={String(blog.createdAt)}>
                                {formatDate(blog.createdAt)}
                            </time>
                        </div>
                        <button
                            onClick={copyLink}
                            title="Copy link"
                            className="flex items-center gap-2 px-4 py-2 bg-[#6B4A2D] hover:bg-[#5a3f25] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors w-fit"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 text-green-300" strokeWidth={2.5} />
                                    <span>Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" strokeWidth={2} />
                                    <span>Share</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* ── Active keyword tag — shown directly below date row ──
                         Appears when user clicks a keyword pill below              */}
                    {activeKeyword && (
                        <div className="flex items-center gap-2.5 mb-6">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest flex-shrink-0">
                                Keyword
                            </span>
                            <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 bg-[#6B4A2D] text-white text-xs font-bold rounded-full shadow-sm">
                                <Hash className="w-3 h-3 opacity-60 flex-shrink-0" strokeWidth={2.5} />
                                <span className="leading-none">{activeKeyword}</span>
                                <button
                                    onClick={() => setActiveKeyword(null)}
                                    className="ml-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 transition-colors flex-shrink-0"
                                    aria-label="Clear keyword"
                                >
                                    <X className="w-2.5 h-2.5" strokeWidth={3} />
                                </button>
                            </span>
                        </div>
                    )}

                    {/* ── Title ── */}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 sm:mb-5 leading-tight tracking-tight">
                        {blog.title}
                    </h1>

                    {/* ── Meta description ── */}
                    {blog.metaDescription && (
                        <p className="text-base sm:text-lg text-slate-600 leading-relaxed italic pl-4 sm:pl-5 py-3 sm:py-4 mb-8 sm:mb-10 bg-amber-50 border-l-4 border-[#6B4A2D] rounded-r-xl">
                            "{blog.metaDescription}"
                        </p>
                    )}

                    {/* ── Blog body ── */}
                    <div
                        className="
              text-[17px] leading-[1.85] text-slate-800
              sm:text-[18px] sm:leading-[1.9]
              break-words [&_*]:box-border
              [&_p]:my-5 [&_p]:leading-[1.85] [&_p]:text-slate-700 [&_p]:text-[17px]
              sm:[&_p]:text-[18px]
              [&_h1]:text-3xl [&_h1]:sm:text-4xl [&_h1]:font-extrabold [&_h1]:text-slate-900
              [&_h1]:tracking-tight [&_h1]:leading-tight [&_h1]:mt-10 [&_h1]:mb-4
              [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-bold [&_h2]:text-slate-900
              [&_h2]:tracking-tight [&_h2]:leading-snug [&_h2]:mt-10 [&_h2]:mb-4
              [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-slate-100
              [&_h3]:text-xl [&_h3]:sm:text-2xl [&_h3]:font-bold [&_h3]:text-slate-800
              [&_h3]:leading-snug [&_h3]:mt-8 [&_h3]:mb-3
              [&_h4]:text-lg [&_h4]:sm:text-xl [&_h4]:font-semibold [&_h4]:text-slate-800
              [&_h4]:leading-snug [&_h4]:mt-6 [&_h4]:mb-2
              [&_strong]:font-bold [&_strong]:text-slate-900
              [&_b]:font-bold [&_b]:text-slate-900
              [&_em]:italic [&_em]:text-slate-600
              [&_i]:italic [&_i]:text-slate-600
              [&_u]:underline [&_u]:underline-offset-[3px] [&_u]:decoration-slate-400
              [&_s]:line-through [&_s]:text-slate-400
              [&_del]:line-through [&_del]:text-slate-400
              [&_strike]:line-through [&_strike]:text-slate-400
              [&_mark]:bg-amber-100 [&_mark]:text-slate-900 [&_mark]:px-1 [&_mark]:rounded-sm
              [&_a]:text-[#6B4A2D] [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2
              [&_a]:decoration-[#6B4A2D]/40 [&_a]:transition-colors
              [&_a:hover]:text-[#9b6a3d] [&_a:hover]:decoration-[#9b6a3d]/60
              [&_blockquote]:my-8 [&_blockquote]:pl-5 [&_blockquote]:pr-4 [&_blockquote]:py-4
              [&_blockquote]:border-l-4 [&_blockquote]:border-[#6B4A2D]
              [&_blockquote]:bg-amber-50 [&_blockquote]:rounded-r-xl
              [&_blockquote]:text-slate-600 [&_blockquote]:italic [&_blockquote]:text-[17px]
              [&_blockquote]:leading-relaxed [&_blockquote_p]:my-0 [&_blockquote_p]:text-slate-600
              [&_code]:font-mono [&_code]:text-[14px] [&_code]:text-[#6B4A2D]
              [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5
              [&_code]:rounded [&_code]:border [&_code]:border-slate-200
              [&_pre]:my-6 [&_pre]:bg-slate-900 [&_pre]:text-slate-100
              [&_pre]:rounded-xl [&_pre]:p-5 [&_pre]:overflow-x-auto
              [&_pre]:text-[13px] [&_pre]:sm:text-[14px] [&_pre]:leading-relaxed [&_pre]:font-mono
              [&_pre_code]:bg-transparent [&_pre_code]:border-none [&_pre_code]:text-slate-100
              [&_pre_code]:p-0 [&_pre_code]:text-[13px] [&_pre_code]:sm:text-[14px]
              [&_ul]:my-5 [&_ul]:pl-6 [&_ul]:list-disc
              [&_ol]:my-5 [&_ol]:pl-6 [&_ol]:list-decimal
              [&_li]:my-2 [&_li]:leading-[1.75] [&_li]:text-slate-700 [&_li]:text-[17px]
              sm:[&_li]:text-[18px]
              [&_ul_li]:marker:text-[#6B4A2D]
              [&_ol_li]:marker:text-[#6B4A2D] [&_ol_li]:marker:font-bold
              [&_li_ul]:mt-2 [&_li_ul]:mb-1 [&_li_ol]:mt-2 [&_li_ol]:mb-1
              [&_hr]:my-10 [&_hr]:border-0 [&_hr]:border-t-2 [&_hr]:border-slate-100
              [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:shadow-md
              [&_img]:my-6 [&_img]:block [&_img]:mx-auto
              [&_table]:w-full [&_table]:my-6 [&_table]:border-collapse
              [&_table]:text-sm [&_table]:sm:text-base
              [&_th]:bg-slate-50 [&_th]:font-bold [&_th]:text-slate-900
              [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:border [&_th]:border-slate-200
              [&_td]:px-4 [&_td]:py-3 [&_td]:text-slate-700 [&_td]:border [&_td]:border-slate-200
              [&_tr:nth-child(even)_td]:bg-slate-50
            "
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(blog.description),
                        }}
                    />

                    {/* ══════════════════════════════════════════════
                        KEYWORDS SECTION
                        — always horizontal single-row scroll, no wrap
                    ══════════════════════════════════════════════ */}
                    {blog.keywords && (
                        <div className="mt-10 mb-8">
                            {/* Header */}
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#6B4A2D] flex-shrink-0">
                                    <Hash size={14} className="text-white" strokeWidth={2.5} />
                                </div>
                                <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">
                                    Keywords
                                </span>
                                <div className="flex-1 h-px bg-slate-100" />
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {blog.keywords
                                    .split(",")
                                    .map((kw) => kw.trim())
                                    .filter(Boolean)
                                    .map((kw, index) => {
                                        const isActive = activeKeyword === kw;
                                        const isLoading = kwLoading === kw;
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleKeywordClick(kw)}
                                                disabled={!!kwLoading}
                                                className={`
                                                    inline-flex items-center gap-1
                                                    px-2.5 py-1
                                                    text-[11px] font-medium rounded-md
                                                    border transition-all duration-200
                                                    active:scale-95 select-none cursor-pointer
                                                    ${isLoading
                                                        ? "bg-[#6B4A2D] text-white border-[#6B4A2D] cursor-wait opacity-80"
                                                        : isActive
                                                            ? "bg-[#6B4A2D] text-white border-[#6B4A2D]"
                                                            : "bg-slate-50 text-slate-500 border-slate-200 hover:border-[#6B4A2D] hover:text-[#6B4A2D] hover:bg-amber-50"
                                                    }
                                                `}
                                            >
                                                {isLoading ? (
                                                    <svg className="w-2.5 h-2.5 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <circle cx="12" cy="12" r="10" strokeWidth="2" opacity="0.25" />
                                                        <path d="M12 2a10 10 0 0 1 10 10" strokeWidth="2" />
                                                    </svg>
                                                ) : (
                                                    <span className={`leading-none ${isActive ? "text-white/50" : "text-slate-400"}`}>#</span>
                                                )}
                                                <span className="leading-none">{kw}</span>
                                            </button>
                                        );
                                    })}
                            </div>
                        </div>
                    )}

                    <div className="my-10 sm:my-12 border-t-2 border-slate-100" />

                    {/* ── CTA share card ── */}
                    <div className="rounded-2xl p-6 sm:p-8 text-center mb-2 bg-stone-50 border border-stone-200">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                            ✨ Found This Helpful?
                        </h3>
                        <p className="text-sm sm:text-base text-slate-500 mb-5 max-w-md mx-auto">
                            Share this article with friends and colleagues who might find it useful.
                        </p>
                        <button
                            onClick={copyLink}
                            className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[#6B4A2D] hover:bg-[#5a3f25] text-white font-semibold text-sm sm:text-base rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                            {copied ? "Copied to Clipboard!" : "Copy Article Link"}
                        </button>
                    </div>
                </div>
            </article>

            {/* ══════════════════════════════════════════════
                RELATED ARTICLES
            ══════════════════════════════════════════════ */}
            {relatedBlogs.length > 0 && (
                <section className="py-10 sm:py-14 md:py-16 bg-stone-50 border-t border-stone-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-10 sm:mb-12">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                                📚 Related Articles
                            </h2>
                            <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
                                More from the{" "}
                                <span className="font-bold text-[#6B4A2D]">{blog.category}</span>{" "}
                                category
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                            {relatedBlogs.map((rb) => (
                                <article
                                    key={rb.id}
                                    onClick={() => goRelated(rb)}
                                    className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5 cursor-pointer border border-slate-100 hover:border-stone-200"
                                >
                                    <div className="relative w-full overflow-hidden aspect-[4/3]">
                                        <img
                                            src={rb.image || FALLBACK}
                                            alt={rb.title || "Related blog"}
                                            loading="lazy"
                                            decoding="async"
                                            onError={(e) => { e.currentTarget.src = FALLBACK; }}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        {rb.category && (
                                            <div className="absolute top-3 left-3 z-10">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#6B4A2D] text-white text-[10px] sm:text-xs font-semibold rounded-full shadow">
                                                    <Tag className="w-3 h-3" strokeWidth={2} />
                                                    {rb.category}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-1 p-4 sm:p-5">
                                        {rb.createdAt && (
                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2">
                                                <Calendar className="w-3.5 h-3.5 text-[#6B4A2D]" strokeWidth={2} />
                                                <time>{formatDate(rb.createdAt)}</time>
                                            </div>
                                        )}
                                        <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#6B4A2D] mb-2 line-clamp-2 transition-colors duration-300 leading-snug">
                                            {rb.title}
                                        </h3>
                                        <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3 flex-1">
                                            {rb.metaDescription ||
                                                rb.description?.replace(/<[^>]+>/g, "").substring(0, 100)}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-[#6B4A2D] font-semibold text-xs sm:text-sm group-hover:gap-2.5 transition-all duration-300">
                                            <span>Read More</span>
                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ══════════════════════════════════════════════
                CTA FOOTER
            ══════════════════════════════════════════════ */}
            <section className="py-10 sm:py-14 md:py-16 bg-white border-t border-slate-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
                        Ready to Create Amazing Visuals?
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-slate-500 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Let's bring your creative vision to life. Contact Genie Studio today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        <button
                            onClick={() => navigate("/blogs")}
                            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm sm:text-base rounded-lg transition-colors border border-slate-200"
                        >
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                            Back to Blogs
                        </button>
                        <button
                            onClick={() => navigate("/contact")}
                            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[#6B4A2D] hover:bg-[#5a3f25] text-white font-semibold text-sm sm:text-base rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 group"
                        >
                            Get in Touch
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2} />
                        </button>
                    </div>
                </div>
            </section>

        </div>
    );
}