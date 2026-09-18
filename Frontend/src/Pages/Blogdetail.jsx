import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Calendar, Tag, Share2, Copy, Check, ArrowRight,
    Clock, User, Quote, HelpCircle, ExternalLink, MapPin,
} from "lucide-react";
import DOMPurify from "dompurify";
import BASE_URL from "../Api";
import useBlogSeo from "../hooks/useBlogSeo";
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

    useEffect(() => {
        const fetchBlog = async () => {
            setLoading(true);
            setImgError(false);
            setBlog(null);
            setRelated([]);

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

    // Keeps <title>, the meta tags, the canonical link and the JSON-LD graph in
    // step with the post on screen. The server already injects all of this on the
    // first request; this covers client-side navigation, where no new request is
    // made and the head would otherwise still describe the previous page.
    useBlogSeo(blog);

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

    /* Keywords are not shown to readers.
       They are a search signal only: the admin enters them for Google and AI
       tools, and they are emitted in the page metadata by the server. The
       clickable keyword pills and their lookup that used to live here have been
       removed along with the visible section. */

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
                <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[2/1] lg:aspect-[21/9]">
                    <img
                        src={heroSrc}
                        /* The stored alt text describes the image; the title
                           describes the article. Falling back to the title is
                           better than an empty alt, but it is a fallback. */
                        alt={blog.alt_text || blog.title}
                        onError={() => setImgError(true)}
                        loading="eager"
                        /* This is the Largest Contentful Paint element on the
                           page, and the server also emits a preload hint for it. */
                        fetchpriority="high"
                        decoding="async"
                        width="1200"
                        height="675"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-stone-900/30 to-transparent pointer-events-none" />

                    {/* Category badge overlaid bottom-left */}
                    {blog.category && (
                        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 max-w-[calc(100%-1.5rem)]">
                            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#6B4A2D] text-white text-[11px] sm:text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm max-w-full">
                                <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" strokeWidth={2} />
                                <span className="truncate">{blog.category}</span>
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-4 sm:pb-5 border-b-2 border-slate-100">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] sm:text-sm text-slate-500 font-medium">
                            <Calendar className="w-4 h-4 text-[#6B4A2D] flex-shrink-0" strokeWidth={2} />
                            <time dateTime={String(blog.createdAt)}>
                                {formatDate(blog.createdAt)}
                            </time>

                            {/* Author and reading time sit next to the date as
                                visible experience signals. The same values go
                                into the Person schema and timeRequired. */}
                            {blog.author_name && (
                                <>
                                    <span className="text-slate-300">/</span>
                                    <span className="flex items-center gap-1.5">
                                        <User className="w-4 h-4 text-[#6B4A2D]" strokeWidth={2} />
                                        {blog.author_name}
                                    </span>
                                </>
                            )}

                            {blog.reading_time_minutes > 0 && (
                                <>
                                    <span className="text-slate-300">/</span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-[#6B4A2D]" strokeWidth={2} />
                                        {blog.reading_time_minutes} min read
                                    </span>
                                </>
                            )}
                        </div>
                        <button
                            onClick={copyLink}
                            title="Copy link"
                            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 bg-[#6B4A2D] hover:bg-[#5a3f25] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors w-fit"
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

                    {/* ── Title ── */}
                    <h1 className="text-[26px] leading-[1.2] sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 sm:mb-5 sm:leading-tight tracking-tight break-words">
                        {blog.title}
                    </h1>

                    {/* ── Areas this post covers ──
                         A plain, readable line for humans. The same list is sent
                         to search engines as the places this post serves, which
                         is what lets a "near me" search in one of them match. */}
                    {Array.isArray(blog.areas_covered) && blog.areas_covered.length > 0 && (
                        <p className="flex items-start gap-2 text-sm text-slate-500 mb-4 sm:mb-5">
                            <MapPin className="w-4 h-4 text-[#6B4A2D] flex-shrink-0 mt-0.5" strokeWidth={2} />
                            <span className="break-words">
                                <span className="font-semibold text-slate-600">Serving:</span>{" "}
                                {blog.areas_covered.join(", ")}
                            </span>
                        </p>
                    )}

                    {/* The short answer is deliberately NOT rendered here.
                        It is written in the admin panel purely as a summary for
                        Google and AI answer engines, and the server sends it in
                        the page metadata. Printing it on the page as well would
                        show the reader the same thing twice. */}

                    {/* ── Blog body ── */}
                    <div
                        className="
              text-[16px] leading-[1.8] text-slate-800
              sm:text-[18px] sm:leading-[1.9]
              break-words [overflow-wrap:anywhere] [&_*]:box-border
              [&_pre]:overflow-x-auto [&_pre]:text-sm
              [&_table]:block [&_table]:overflow-x-auto [&_table]:max-w-full
              sm:[&_table]:table
              [&_p]:my-4 [&_p]:leading-[1.8] [&_p]:text-slate-700 [&_p]:text-[16px]
              sm:[&_p]:my-5 sm:[&_p]:text-[18px] sm:[&_p]:leading-[1.85]
              [&_h1]:text-2xl [&_h1]:sm:text-4xl [&_h1]:font-extrabold [&_h1]:text-slate-900
              [&_h1]:tracking-tight [&_h1]:leading-tight [&_h1]:mt-10 [&_h1]:mb-4
              [&_h2]:text-xl [&_h2]:sm:text-3xl [&_h2]:font-bold [&_h2]:text-slate-900
              [&_h2]:tracking-tight [&_h2]:leading-snug [&_h2]:mt-10 [&_h2]:mb-4
              [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-slate-100
              [&_h3]:text-lg [&_h3]:sm:text-2xl [&_h3]:font-bold [&_h3]:text-slate-800
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

                    {/* KEY FACTS (GEO)

                        Attributed, extractable claims. A retrieval engine will
                        repeat a number it can attribute long before it repeats
                        the same number asserted mid-paragraph, so they are
                        pulled out of the prose and given their source. */}
                    {Array.isArray(blog.key_facts) && blog.key_facts.length > 0 && (
                        <section className="geo-key-facts mt-10 sm:mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
                            <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-slate-900 mb-4">
                                <Quote className="w-5 h-5 text-[#6B4A2D]" strokeWidth={2} />
                                Key facts
                            </h2>
                            <ul className="space-y-3">
                                {blog.key_facts.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2.5">
                                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#6B4A2D] shrink-0" />
                                        <p className="text-[15px] sm:text-base leading-relaxed text-slate-700">
                                            {item.fact}
                                            {item.source && (
                                                <a
                                                    href={item.source}
                                                    target="_blank"
                                                    rel="noopener noreferrer nofollow"
                                                    className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-[#6B4A2D] hover:underline"
                                                >
                                                    Source
                                                    <ExternalLink className="w-3 h-3" strokeWidth={2.5} />
                                                </a>
                                            )}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* FAQ (AEO)

                        Rendered as real text, not an accordion that hides its
                        answers behind JavaScript. The answer has to be present
                        in the HTML for it to be quotable. FAQPage JSON-LD is
                        emitted alongside from the same data. */}
                    {Array.isArray(blog.faq_schema) && blog.faq_schema.length > 0 && (
                        <section className="mt-10 sm:mt-12">
                            <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-slate-900 mb-5 pb-2 border-b border-slate-100">
                                <HelpCircle className="w-5 h-5 text-[#6B4A2D]" strokeWidth={2} />
                                Frequently asked questions
                            </h2>
                            <div className="space-y-5">
                                {blog.faq_schema
                                    .filter((f) => f && f.question && f.answer)
                                    .map((faq, i) => (
                                        <div key={i} className="rounded-xl border border-slate-200 p-4 sm:p-5">
                                            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                                                {faq.question}
                                            </h3>
                                            <p className="text-[15px] sm:text-base leading-relaxed text-slate-700">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        </section>
                    )}

                    {/* Author bio: an experience and expertise signal, and the
                        visible counterpart to the Person schema. */}
                    {blog.author_bio && (
                        <section className="mt-10 sm:mt-12 rounded-2xl bg-stone-50 border border-stone-200 p-5 sm:p-6">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#6B4A2D] flex items-center justify-center shrink-0">
                                    <User className="w-5 h-5 text-white" strokeWidth={2} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">
                                        {blog.author_name || "Genie Media Editorial Team"}
                                    </p>
                                    <p className="text-sm leading-relaxed text-slate-600 mt-1">
                                        {blog.author_bio}
                                    </p>
                                </div>
                            </div>
                        </section>
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
                            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 sm:px-8 py-3 bg-[#6B4A2D] hover:bg-[#5a3f25] text-white font-semibold text-sm sm:text-base rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
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
                            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 sm:px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm sm:text-base rounded-lg transition-colors border border-slate-200"
                        >
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                            Back to Blogs
                        </button>
                        <button
                            onClick={() => navigate("/contact")}
                            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 sm:px-8 py-3 bg-[#6B4A2D] hover:bg-[#5a3f25] text-white font-semibold text-sm sm:text-base rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 group"
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