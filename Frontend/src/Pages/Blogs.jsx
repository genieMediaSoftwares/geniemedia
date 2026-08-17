import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Calendar, Tag } from "lucide-react";
import BASE_URL from "../Api";
// Self-hosted copies of the images this page used to pull from
// images.unsplash.com. Same pictures, but they no longer cost a public page an
// extra DNS lookup + TLS handshake to a third-party origin, and they inherit the
// long immutable cache header configured in .htaccess.
import BlogHero from "../assets/blog/blog-hero.webp";
import BlogFallback from "../assets/blog/blog-fallback.webp";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lightbox, setLightbox] = useState(null); // { src, alt }

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/blogs`);
        const data = await res.json();
        // Backend already filters published only, but guard anyway
        const formatted = Array.isArray(data)
          ? data
              .filter((b) => b.status === "published")
              .sort((a, b) => b.createdAt - a.createdAt)
          : [];
        setBlogs(formatted);
      } catch (err) {
        console.error("Fetch Error:", err);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    if (!blogs.length) return;
    const allKeywords = blogs.map((b) => b.keywords).filter(Boolean).join(", ");
    if (allKeywords) {
      document.head.querySelector('meta[name="keywords"]')?.remove();
      const m = document.createElement("meta");
      m.name = "keywords";
      m.content = allKeywords;
      document.head.appendChild(m);
    }
  }, [blogs]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const categories = ["All", ...new Set(blogs.map((b) => b.category).filter(Boolean))];

  const filteredBlogs =
    selectedCategory === "All"
      ? blogs
      : blogs.filter((b) => b.category === selectedCategory);

  const formatDate = (ts) =>
    ts
      ? new Date(Number(ts)).toLocaleDateString("en-US", {
          year: "numeric", month: "short", day: "numeric",
        })
      : "Just now";

  const handleReadMore = (blog) => {
    if (!blog.permalink) { console.error("Missing permalink", blog); return; }
    navigate(`/blog/${blog.permalink}`);
  };

  const openLightbox = (e, src, alt) => {
    e.stopPropagation();
    setLightbox({ src, alt });
  };

  const FALLBACK = BlogFallback;

  return (
    <div className="w-full overflow-x-hidden">

      <section className="relative min-h-[45vh] sm:min-h-[50vh] md:min-h-[60vh] lg:min-h-[55vh] flex items-center text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BlogHero})` }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 drop-shadow-lg">
            Our Blog
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-200 max-w-2xl sm:max-w-3xl mx-auto drop-shadow-md">
            Insights and creative stories from Genie Studio
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14 md:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {categories.length > 1 && (
            <div className="mb-10 sm:mb-12 md:mb-14 lg:mb-16">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm md:text-base transition-all duration-300 ${
                      selectedCategory === cat
                        ? "bg-[#6B4A2D] text-white shadow-lg scale-105"
                        : "bg-[#F7F6F3] text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 md:py-24">
              <div className="animate-spin">
                <svg className="w-12 h-12 sm:w-14 sm:h-14 text-[#6B4A2D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" fill="none" opacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" strokeWidth="2" />
                </svg>
              </div>
              <p className="mt-4 text-slate-600 font-medium text-sm sm:text-base">
                Loading amazing content…
              </p>
            </div>

          ) : filteredBlogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 md:py-24">
              <svg className="w-14 h-14 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-slate-600 font-medium text-sm sm:text-base md:text-lg">
                No blogs found in this category
              </p>
              <p className="text-slate-500 text-xs sm:text-sm mt-2">
                Check back soon for new content!
              </p>
            </div>

          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {filteredBlogs.map((blog, index) => {
                const imgSrc = blog.image || FALLBACK;

                return (
                  <article
                    key={blog.id}
                    data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
                    data-aos-delay={index * 100}
                    onClick={() => handleReadMore(blog)}
                    className="group relative flex flex-col overflow-hidden rounded-xl sm:rounded-2xl bg-white shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer"
                  >

                    <div
                      className="relative w-full overflow-hidden bg-[#f5f0eb]"
                      style={{ aspectRatio: "4/3" }}
                    >
                      <img
                        src={imgSrc}
                        alt={blog.title || "Blog cover"}
                        width="800"
                        height="600"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => { e.currentTarget.src = FALLBACK; }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <button
                        type="button"
                        aria-label="View full image"
                        onClick={(e) => openLightbox(e, imgSrc, blog.title)}
                        className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/90 backdrop-blur-sm text-[#6B4A2D] text-[11px] sm:text-xs font-semibold shadow-md opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 hover:bg-white"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                        </svg>
                        Full image
                      </button>

                      {blog.category && (
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#6B4A2D] text-white text-[10px] sm:text-xs font-semibold rounded-full shadow">
                            <Tag className="w-3 h-3" strokeWidth={2} />
                            {blog.category}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col flex-1 p-4 sm:p-5 lg:p-6">
                      {blog.createdAt && (
                        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 mb-2 sm:mb-3">
                          <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
                          <time>{formatDate(blog.createdAt)}</time>
                        </div>
                      )}

                      <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 group-hover:text-[#6B4A2D] mb-2 sm:mb-3 line-clamp-3 transition-colors duration-300 leading-snug">
                        {blog.title}
                      </h2>

                      <p className="text-[11px] sm:text-xs md:text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4 flex-1">
                        {blog.metaDescription || blog.description}
                      </p>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleReadMore(blog); }}
                        className="self-start flex items-center gap-1.5 text-[#6B4A2D] font-semibold text-xs sm:text-sm group-hover:gap-2.5 transition-all duration-300 hover:text-slate-900"
                      >
                        <span>Read More</span>
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
                      </button>
                    </div>

                    {/* Corner shimmer */}
                    <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-bl from-[#6B4A2D]/0 group-hover:from-[#6B4A2D]/8 to-transparent rounded-bl-full transition-all duration-500 pointer-events-none" />
                  </article>
                );
              })}
            </div>
          )}

          {!loading && filteredBlogs.length > 0 && (
            <div className="mt-10 sm:mt-12 text-center">
              <p className="text-slate-600 text-xs sm:text-sm md:text-base">
                Showing{" "}
                <span className="font-semibold text-slate-900">{filteredBlogs.length}</span>
                {" "}of{" "}
                <span className="font-semibold text-slate-900">{blogs.length}</span>{" "}
                articles
              </p>
            </div>
          )}
        </div>
      </section>

      {!loading && blogs.length > 0 && (
        <section className="py-10 sm:py-14 md:py-16 lg:py-20 bg-[#F7F6F3]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 sm:mb-5 md:mb-6 tracking-tight">
              Want to Share Your Story?
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              Get in touch with us to discuss your project, book a shoot, or collaborate with Genie Studio.
            </p>
            <button
              onClick={() => navigate("/contact")}
              className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-[#6B4A2D] text-white font-semibold text-sm sm:text-base rounded-lg hover:bg-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl group"
            >
              Get Started
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2} />
            </button>
          </div>
        </section>
      )}

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Full image preview"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-10"
          onClick={() => setLightbox(null)}
        >
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close image preview"
              onClick={() => setLightbox(null)}
              className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-20 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-slate-800 shadow-xl hover:bg-[#6B4A2D] hover:text-white transition-all duration-200"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <img
              src={lightbox.src}
              alt={lightbox.alt || "Full image"}
              width="1600"
              height="1200"
              decoding="async"
              className="w-full h-auto max-h-[80vh] sm:max-h-[85vh] object-contain rounded-xl sm:rounded-2xl shadow-2xl select-none"
              draggable={false}
            />
            {lightbox.alt && (
              <p className="mt-3 text-center text-white/80 text-xs sm:text-sm font-medium px-4 line-clamp-2">
                {lightbox.alt}
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}