import { Sparkles, BookOpen } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { ArrowLeft, ArrowRight, Calendar, Clock, ExternalLink, HelpCircle, MapPin, Quote, Tag, User } from "lucide-react";

import BlogFallbackAsset from "@/assets/blog/blog-hero.webp";
import type { Blog } from "@/types";
import { blogPath, formatDate, toIso } from "@/lib/blog";
import { blogCanonical } from "@/lib/seo/metadata";
import { CopyLinkCta, FallbackImg, ShareButton } from "@/components/blog/BlogClientParts";
import { CONTENT_LINK } from "@/lib/linkStyles";

const FALLBACK = BlogFallbackAsset.src;

const PROSE = "text-[16px] leading-[1.8] text-slate-800 sm:text-[18px] sm:leading-[1.9] break-words [overflow-wrap:anywhere] [&_*]:box-border [&_pre]:overflow-x-auto [&_pre]:text-sm [&_table]:block [&_table]:overflow-x-auto [&_table]:max-w-full sm:[&_table]:table [&_p]:my-4 [&_p]:leading-[1.8] [&_p]:text-slate-700 [&_p]:text-[16px] sm:[&_p]:my-5 sm:[&_p]:text-[18px] sm:[&_p]:leading-[1.85] [&_h1]:text-2xl [&_h1]:sm:text-4xl [&_h1]:font-extrabold [&_h1]:text-slate-900 [&_h1]:tracking-tight [&_h1]:leading-tight [&_h1]:mt-10 [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:sm:text-3xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:tracking-tight [&_h2]:leading-snug [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-slate-100 [&_h3]:text-lg [&_h3]:sm:text-2xl [&_h3]:font-bold [&_h3]:text-slate-800 [&_h3]:leading-snug [&_h3]:mt-8 [&_h3]:mb-3 [&_h4]:text-lg [&_h4]:sm:text-xl [&_h4]:font-semibold [&_h4]:text-slate-800 [&_h4]:leading-snug [&_h4]:mt-6 [&_h4]:mb-2 [&_strong]:font-bold [&_strong]:text-slate-900 [&_b]:font-bold [&_b]:text-slate-900 [&_em]:italic [&_em]:text-slate-600 [&_i]:italic [&_i]:text-slate-600 [&_u]:underline [&_u]:underline-offset-[3px] [&_u]:decoration-slate-400 [&_s]:line-through [&_s]:text-slate-400 [&_del]:line-through [&_del]:text-slate-400 [&_strike]:line-through [&_strike]:text-slate-400 [&_mark]:bg-amber-100 [&_mark]:text-slate-900 [&_mark]:px-1 [&_mark]:rounded-sm [&_a]:text-inherit [&_a]:no-underline [&_a]:transition-opacity [&_a]:duration-200 [&_a:hover]:opacity-80 [&_a]:rounded-sm [&_a:focus-visible]:outline [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-current [&_blockquote]:my-8 [&_blockquote]:pl-5 [&_blockquote]:pr-4 [&_blockquote]:py-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[#6B4A2D] [&_blockquote]:bg-amber-50 [&_blockquote]:rounded-r-xl [&_blockquote]:text-slate-600 [&_blockquote]:italic [&_blockquote]:text-[17px] [&_blockquote]:leading-relaxed [&_blockquote_p]:my-0 [&_blockquote_p]:text-slate-600 [&_code]:font-mono [&_code]:text-[14px] [&_code]:text-[#6B4A2D] [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:border [&_code]:border-slate-200 [&_pre]:my-6 [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:rounded-xl [&_pre]:p-5 [&_pre]:overflow-x-auto [&_pre]:text-[13px] [&_pre]:sm:text-[14px] [&_pre]:leading-relaxed [&_pre]:font-mono [&_pre_code]:bg-transparent [&_pre_code]:border-none [&_pre_code]:text-slate-100 [&_pre_code]:p-0 [&_pre_code]:text-[13px] [&_pre_code]:sm:text-[14px] [&_ul]:my-5 [&_ul]:pl-6 [&_ul]:list-disc [&_ol]:my-5 [&_ol]:pl-6 [&_ol]:list-decimal [&_li]:my-2 [&_li]:leading-[1.75] [&_li]:text-slate-700 [&_li]:text-[17px] sm:[&_li]:text-[18px] [&_ul_li]:marker:text-[#6B4A2D] [&_ol_li]:marker:text-[#6B4A2D] [&_ol_li]:marker:font-bold [&_li_ul]:mt-2 [&_li_ul]:mb-1 [&_li_ol]:mt-2 [&_li_ol]:mb-1 [&_hr]:my-10 [&_hr]:border-0 [&_hr]:border-t-2 [&_hr]:border-slate-100 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:shadow-md [&_img]:my-6 [&_img]:block [&_img]:mx-auto [&_table]:w-full [&_table]:my-6 [&_table]:border-collapse [&_table]:text-sm [&_table]:sm:text-base [&_th]:bg-slate-50 [&_th]:font-bold [&_th]:text-slate-900 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:border [&_th]:border-slate-200 [&_td]:px-4 [&_td]:py-3 [&_td]:text-slate-700 [&_td]:border [&_td]:border-slate-200 [&_tr:nth-child(even)_td]:bg-slate-50";

const DAY_MS = 24 * 60 * 60 * 1000;

export default function BlogArticle({ blog, related }: { blog: Blog; related: Blog[] }) {
  const canonical = blogCanonical(blog);
  const heroSrc = blog.image || FALLBACK;
  const updatedMs = blog.last_modified_at ? Date.parse(blog.last_modified_at) : blog.updatedAt;
  const showUpdated = Boolean(updatedMs && blog.createdAt && updatedMs - blog.createdAt > DAY_MS);
  const faqs = blog.faq_schema.filter((f) => f.question && f.answer);
  const sanitized = DOMPurify.sanitize(blog.description, { ADD_ATTR: ["target", "rel"] });
  const bodyHtml = sanitized.replace(/<(\/?)h1(\b[^>]*)>/gi, "<$1h2$2>");

  return (
    <div className="w-full overflow-x-hidden bg-white">
      <section className="w-full bg-stone-100 pt-20">
        <div className="relative mx-auto w-full max-w-[1200px] aspect-[16/9] bg-stone-100">
          <FallbackImg
            src={heroSrc}
            fallback={FALLBACK}
            alt={blog.alt_text || blog.title}
            priority
            width={1200}
            height={675}
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      </section>

      <article className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-4 text-xs sm:text-sm text-slate-500">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <a href="/" className="hover:text-[#6B4A2D] hover:underline">
                  Home
                </a>
              </li>
              <li aria-hidden="true" className="text-slate-300">
                /
              </li>
              <li>
                <a href="/blogs" className="hover:text-[#6B4A2D] hover:underline">
                  Blog
                </a>
              </li>
              <li aria-hidden="true" className="text-slate-300">
                /
              </li>
              <li aria-current="page" className="text-slate-600 line-clamp-1 max-w-full">
                {blog.meta_title || blog.title}
              </li>
            </ol>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-4 sm:pb-5 border-b-2 border-slate-100">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] sm:text-sm text-slate-500 font-medium">
              <Calendar className="w-4 h-4 text-[#6B4A2D] flex-shrink-0" strokeWidth={2} />
              <time dateTime={toIso(blog.createdAt) ?? undefined}>{formatDate(blog.createdAt, "long")}</time>

              {showUpdated && updatedMs && (
                <>
                  <span className="text-slate-300">/</span>
                  <span>
                    Updated <time dateTime={toIso(updatedMs) ?? undefined}>{formatDate(updatedMs, "long")}</time>
                  </span>
                </>
              )}

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
            <ShareButton url={canonical} title={blog.title} />
          </div>

          {blog.category && (
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#6B4A2D] text-white text-[11px] sm:text-xs font-semibold rounded-full shadow-sm max-w-full">
                <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" strokeWidth={2} />
                <span className="truncate">{blog.category}</span>
              </span>
            </div>
          )}

          <h1 className="text-[26px] leading-[1.2] sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 sm:mb-5 sm:leading-tight tracking-tight break-words">
            {blog.title}
          </h1>

          {blog.areas_covered.length > 0 && (
            <p className="flex items-start gap-2 text-sm text-slate-500 mb-4 sm:mb-5">
              <MapPin className="w-4 h-4 text-[#6B4A2D] flex-shrink-0 mt-0.5" strokeWidth={2} />
              <span className="break-words">
                <span className="font-semibold text-slate-600">Serving:</span> {blog.areas_covered.join(", ")}
              </span>
            </p>
          )}

          <div className={PROSE} dangerouslySetInnerHTML={{ __html: bodyHtml }} />

          {blog.key_facts.length > 0 && (
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
                      {item.source && /^https?:\/\//i.test(item.source) && (
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

          {faqs.length > 0 && (
            <section className="mt-10 sm:mt-12">
              <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-slate-900 mb-5 pb-2 border-b border-slate-100">
                <HelpCircle className="w-5 h-5 text-[#6B4A2D]" strokeWidth={2} />
                Frequently asked questions
              </h2>
              <div className="space-y-5">
                {faqs.map((faq, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 p-4 sm:p-5">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">{faq.question}</h3>
                    <p className="text-[15px] sm:text-base leading-relaxed text-slate-700">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {blog.author_bio && (
            <section className="mt-10 sm:mt-12 rounded-2xl bg-stone-50 border border-stone-200 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#6B4A2D] flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{blog.author_name || "Genie Media Editorial Team"}</p>
                  <p className="text-sm leading-relaxed text-slate-600 mt-1">{blog.author_bio}</p>
                </div>
              </div>
            </section>
          )}

          <section className="mt-10 sm:mt-12 rounded-2xl bg-stone-50 border border-stone-200 p-5 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">Work with Genie Media &amp; Studio</h2>
            <p className="text-sm sm:text-base leading-relaxed text-slate-600">
              Want help putting this into practice? Our team in Visakhapatnam offers{" "}
              <a href="/digital_marketing" className={CONTENT_LINK}>digital marketing and SEO services</a>,{" "}
              <a href="/web_development" className={CONTENT_LINK}>website design and development</a>,{" "}
              <a href="/production_house" className={CONTENT_LINK}>video production</a>{" "}
              and a{" "}
              <a href="/podcast_studio" className={CONTENT_LINK}>podcast studio</a>.{" "}
              <a href="/contact" className={CONTENT_LINK}>Contact us</a> to talk about your goals.
            </p>
          </section>

          <div className="my-10 sm:my-12 border-t-2 border-slate-100" />

          <div className="rounded-2xl p-6 sm:p-8 text-center mb-2 bg-stone-50 border border-stone-200">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2"><Sparkles className="inline-block w-5 h-5 text-[#6B4A2D] mr-1.5 -mt-1" strokeWidth={2} aria-hidden="true" />Found This Helpful?</h2>
            <p className="text-sm sm:text-base text-slate-500 mb-5 max-w-md mx-auto">
              Share this article with friends and colleagues who might find it useful.
            </p>
            <CopyLinkCta url={canonical} />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="py-10 sm:py-14 md:py-16 bg-stone-50 border-t border-stone-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2 tracking-tight"><BookOpen className="inline-block w-7 h-7 sm:w-8 sm:h-8 text-[#6B4A2D] mr-2 -mt-1" strokeWidth={2} aria-hidden="true" />Related Articles</h2>
              <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
                More from the <span className="font-bold text-[#6B4A2D]">{blog.category}</span> category
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {related.map((rb) => (
                <article
                  key={rb.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5 cursor-pointer border border-slate-100 hover:border-stone-200"
                >
                  <div className="relative w-full overflow-hidden aspect-[16/9] bg-[#f5f0eb]">
                    <FallbackImg
                      src={rb.image || FALLBACK}
                      fallback={FALLBACK}
                      alt={rb.alt_text || rb.title || "Related blog"}
                      width={800}
                      height={450}
                      className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
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
                        <time dateTime={toIso(rb.createdAt) ?? undefined}>{formatDate(rb.createdAt, "long")}</time>
                      </div>
                    )}
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#6B4A2D] mb-2 line-clamp-2 transition-colors duration-300 leading-snug">
                      <a href={blogPath(rb.permalink)} className="after:absolute after:inset-0 after:content-['']">
                        {rb.title}
                      </a>
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3 flex-1">
                      {rb.metaDescription || rb.description.replace(/<[^>]+>/g, "").substring(0, 100)}
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

      <section className="py-10 sm:py-14 md:py-16 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Ready to Create Amazing Visuals?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-500 mb-8 max-w-2xl mx-auto leading-relaxed">
            Let&apos;s bring your creative vision to life. Contact Genie Media &amp; Studio today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a
              href="/blogs"
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 sm:px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm sm:text-base rounded-lg transition-colors border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
              Back to Blogs
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 sm:px-8 py-3 bg-[#6B4A2D] hover:bg-[#5a3f25] text-white font-semibold text-sm sm:text-base rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 group"
            >
              Get in Touch
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
