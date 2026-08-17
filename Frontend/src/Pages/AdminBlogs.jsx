import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BlogEditor from "../components/BlogEditor";
import BASE_URL from "../Api";
import {
  Menu, X, LogOut, BookOpen, Edit2, Trash2, Plus,
  Search, Filter, CheckCircle, AlertCircle, Loader, ChevronRight,
  Calendar, Tag, Link2, Image, FileText, AlignLeft, ArrowLeft,
  MoreVertical, RefreshCw, Globe, EyeOff, Lock, Copy, Share2, LayoutGrid,
} from "lucide-react";

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast]);
  if (!toast) return null;
  const ok = toast.type === "success";
  return (
    <div
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-xl shadow-2xl border animate-slideUp max-w-[calc(100vw-2rem)]"
      style={{
        background: ok ? "#f0fdf4" : "#fff1f2",
        borderColor: ok ? "#86efac" : "#fca5a5",
        color: ok ? "#166534" : "#991b1b",
        minWidth: 240,
      }}
    >
      {ok
        ? <CheckCircle size={18} className="shrink-0" style={{ color: "#16a34a" }} />
        : <AlertCircle size={18} className="shrink-0" style={{ color: "#dc2626" }} />}
      <span className="font-semibold text-sm flex-1">{toast.msg}</span>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 transition shrink-0">
        <X size={15} />
      </button>
    </div>
  );
}

function DeleteModal({ blog, onConfirm, onCancel, loading }) {
  if (!blog) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-red-100 animate-scaleIn">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={22} className="text-red-600" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center mb-2">Delete Blog?</h3>
        <p className="text-sm text-gray-500 text-center mb-1">Permanently deleting:</p>
        <p className="text-sm font-semibold text-gray-800 text-center mb-6 line-clamp-2 px-2">"{blog.title}"</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition">Keep It</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 sm:py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader size={15} className="animate-spin" /> : <Trash2 size={15} />}
            {loading ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PublishModal({ blog, onConfirm, onCancel, loading }) {
  if (!blog) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-green-100 animate-scaleIn">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe size={22} className="text-green-600" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center mb-2">Publish to Public?</h3>
        <p className="text-sm text-gray-500 text-center mb-1">This will make the blog live for all users:</p>
        <p className="text-sm font-semibold text-gray-800 text-center mb-6 line-clamp-2 px-2">"{blog.title}"</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition">Not Yet</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 sm:py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader size={15} className="animate-spin" /> : <Globe size={15} />}
            {loading ? "Publishing…" : "Yes, Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

const FALLBACK = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80";

function BlogCard({ blog, onEdit, onDelete, onPublish, onUnpublish, formatDate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);   // ✅ NEW: tracks copy-link feedback state
  const menuRef = useRef();
  const isDraft = blog.status === "draft";

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ✅ NEW: Copies the OG-preview share URL to clipboard.
  //         Format: <BASE_URL>/share/<permalink>
  //         When shared on WhatsApp / Twitter / Telegram etc., the platform's
  //         crawler fetches this URL, reads the OG meta tags, and shows the
  //         blog title + featured image in the link preview card.
  //         Real human visitors who click the link get instantly JS-redirected
  //         to the actual geniestudio.in/blog/<permalink> page.
  const handleCopyShareLink = () => {
    if (!blog.permalink) return;
    // const shareUrl = `${BASE_URL}/share/${blog.permalink}`;
const shareUrl = `https://geniemedia.in/og.php?slug=${blog.permalink}`;


    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {
        // Fallback for browsers that block clipboard API
        const ta = document.createElement("textarea");
        ta.value = shareUrl;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300 flex flex-col group">
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <img
          src={blog.image || FALLBACK}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK; }}
        />
        <span
          className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full shadow flex items-center gap-1"
          style={{ background: isDraft ? "#92400e" : "#6B4A2D", color: "#fff" }}
        >
          {isDraft ? <Lock size={10} /> : <Globe size={10} />}
          {isDraft ? "Admin Only" : blog.category}
        </span>

        <div ref={menuRef} className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3">
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="w-7 h-7 sm:w-8 sm:h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition"
          >
            <MoreVertical size={14} className="text-gray-700" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 sm:top-9 bg-white rounded-xl shadow-xl border border-gray-100 py-1 w-44 z-10 animate-fadeIn">
              <button onClick={() => { onEdit(blog); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition">
                <Edit2 size={13} /> Edit Blog
              </button>
              {isDraft ? (
                <button onClick={() => { onPublish(blog); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-green-600 hover:bg-green-50 transition">
                  <Globe size={13} /> Publish Now
                </button>
              ) : (
                <button onClick={() => { onUnpublish(blog); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-amber-600 hover:bg-amber-50 transition">
                  <EyeOff size={13} /> Move to Draft
                </button>
              )}
              {/* ✅ NEW: Copy share link option in dropdown menu */}
              {!isDraft && (
                <button
                  onClick={() => { handleCopyShareLink(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-purple-600 hover:bg-purple-50 transition"
                >
                  <Share2 size={13} /> Copy Share Link
                </button>
              )}
              <button onClick={() => { onDelete(blog); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition">
                <Trash2 size={13} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        {isDraft && (
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 mb-3">
            <Lock size={11} className="text-amber-600 shrink-0" />
            <p className="text-[10px] sm:text-xs text-amber-700 font-semibold">Hidden from public · Admin view only</p>
          </div>
        )}
        <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug mb-2 line-clamp-2">{blog.title}</h3>
        {blog.metaDescription && (
          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-3 sm:mb-4 flex-grow">{blog.metaDescription}</p>
        )}

        {blog.permalink && (
          <p className="text-[10px] text-gray-400 font-mono mb-2 truncate">/blog/{blog.permalink}</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <span className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400">
            <Calendar size={11} />{formatDate(blog.createdAt)}
          </span>
          {blog.updatedAt !== blog.createdAt && (
            <span className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400">
              <RefreshCw size={10} /> Updated
            </span>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          <button onClick={() => onEdit(blog)} className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg font-semibold text-xs transition">
            <Edit2 size={12} /> Edit
          </button>
          {isDraft ? (
            <button onClick={() => onPublish(blog)} className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 py-2 rounded-lg font-semibold text-xs transition">
              <Globe size={12} /> Publish
            </button>
          ) : (
            <button onClick={() => onUnpublish(blog)} className="flex-1 flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 py-2 rounded-lg font-semibold text-xs transition">
              <EyeOff size={12} /> Draft
            </button>
          )}

          {/* ✅ NEW: Copy Share Link button — visible on published blogs only.
                      Copies BASE_URL/share/<permalink> which serves OG meta tags
                      so WhatsApp / Twitter / LinkedIn show title + image preview. */}
          {!isDraft && (
            <button
              onClick={handleCopyShareLink}
              title={copied ? "Link copied!" : "Copy share link (shows preview on WhatsApp, Twitter etc.)"}
              className={`flex items-center justify-center px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                copied
                  ? "bg-green-100 text-green-700 scale-95"
                  : "bg-purple-50 hover:bg-purple-100 text-purple-700"
              }`}
            >
              {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
            </button>
          )}

          <button onClick={() => onDelete(blog)} className="flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-xs transition">
            <Trash2 size={12} />
          </button>
        </div>

        {/* ✅ NEW: Inline copied confirmation banner — appears briefly after copy */}
        {copied && (
          <div className="mt-2 flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 animate-fadeIn">
            <CheckCircle size={11} className="text-green-600 shrink-0" />
            <p className="text-[10px] text-green-700 font-semibold">
              Share link copied! Paste on WhatsApp, Twitter, etc. to show image + title preview.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, required, hint, icon: IconComp, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
        {IconComp && <IconComp size={14} className="text-[#6B4A2D]" />}
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 pl-1">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-[#6B4A2D] focus:ring-4 focus:ring-[#6B4A2D]/10 outline-none transition font-medium";

function KeywordsInput({ value, onChange }) {
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef();
  const tags = value ? value.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const addTag = (raw) => {
    const newTags = raw.split(",").map((t) => t.trim()).filter(Boolean);
    onChange([...new Set([...tags, ...newTags])].join(", "));
  };
  const removeTag = (idx) => onChange(tags.filter((_, i) => i !== idx).join(", "));
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputVal.trim()) { addTag(inputVal); setInputVal(""); }
    } else if (e.key === "Backspace" && !inputVal && tags.length) {
      removeTag(tags.length - 1);
    }
  };
  return (
    <div
      className="flex flex-wrap gap-2 items-center px-3 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus-within:border-[#6B4A2D] focus-within:ring-4 focus-within:ring-[#6B4A2D]/10 transition cursor-text min-h-[48px]"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, idx) => (
        <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "#F3EBE3", color: "#6B4A2D", border: "1px solid #D4B49A" }}>
          {tag}
          <button type="button" onClick={(e) => { e.stopPropagation(); removeTag(idx); }} className="ml-0.5 rounded-full hover:bg-[#6B4A2D]/20 p-0.5 transition flex items-center justify-center" style={{ color: "#6B4A2D" }}>
            <X size={10} strokeWidth={2.5} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (inputVal.trim()) { addTag(inputVal); setInputVal(""); } }}
        placeholder={tags.length === 0 ? "Type a keyword and press Enter or comma…" : "Add more…"}
        className="flex-1 min-w-[120px] text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent font-medium py-0.5"
      />
    </div>
  );
}

const CATEGORIES = [
  "Social Media Marketing",
  "Search Engine Optimization (SEO)",
  "Search Engine Marketing (SEM)",
  "Content Marketing",
  "Email Marketing",
  "Affiliate Marketing",
  "Analytics and Data",
  "Web Development",
  "Mobile App Development",
  "Desktop App Development",
  "Game Development",
  "Data Sceince (AI & ML)",
  "Devops and Cloud Computing"
];

const emptyForm = {
  title: "",
  permalink: "",
  metaDescription: "",
  description: "",
  category: "",
  keywords: "",
  image: null,          // new File object (only when user picks a new file)
  imagePreview: "",     // blob URL or existing hosted URL — drives the preview
  existingImageUrl: "", // ✅ FIX: stores the current saved URL when editing
};

const toSlug = (str) =>
  str.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim().replace(/\s+/g, "-");

const buildPermalink = (title, category) => {
  const titleSlug = toSlug(title);
  const categorySlug = toSlug(category);
  if (categorySlug && titleSlug) return `${categorySlug}/${titleSlug}`;
  if (titleSlug) return titleSlug;
  return "";
};

export default function AdminBlogs() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const formTopRef = useRef();

  const [form, setForm] = useState(emptyForm);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("published");
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [publishTarget, setPublishTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saveAsDraft, setSaveAsDraft] = useState(false);
  const [permalinkManual, setPermalinkManual] = useState(false);

  const fetchBlogs = async () => {
    setDbLoading(true);
    try {
      const allRes = await fetch(`${BASE_URL}/api/admin/blogs`, {
        headers: { Authorization: token },
      });

      if (allRes.ok) {
        const allData = await allRes.json();
        setBlogs(Array.isArray(allData) ? allData.sort((a, b) => b.createdAt - a.createdAt) : []);
      } else {
        const pubRes = await fetch(`${BASE_URL}/api/blogs`);
        const pubData = await pubRes.json();
        setBlogs(Array.isArray(pubData) ? pubData.sort((a, b) => b.createdAt - a.createdAt) : []);
      }
    } catch (err) {
      showToast("Error loading blogs.", "error");
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const publishedBlogs = blogs.filter((b) => b.status === "published");
  const draftBlogs = blogs.filter((b) => b.status === "draft");

  const filteredBlogs = (() => {
    let list = activeTab === "drafts" ? draftBlogs : publishedBlogs;
    if (searchTerm)
      list = list.filter(
        (b) =>
          b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.metaDescription?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    if (filterCategory) list = list.filter((b) => b.category === filterCategory);
    return list;
  })();

  const showToast = (msg, type = "success") => setToast({ msg, type });
  const dismissToast = () => setToast(null);
  const formatDate = (ts) =>
    new Date(Number(ts)).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "permalink") {
      setPermalinkManual(true);
      setForm((prev) => ({ ...prev, permalink: value }));
      return;
    }

    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      if ((name === "title" || name === "category") && !permalinkManual) {
        const newTitle = name === "title" ? value : prev.title;
        const newCategory = name === "category" ? value : prev.category;
        updated.permalink = buildPermalink(newTitle, newCategory);
      }

      return updated;
    });
  };

  const handleCategorySelect = (cat) => {
    setForm((prev) => ({
      ...prev,
      category: cat,
      permalink: permalinkManual ? prev.permalink : buildPermalink(prev.title, cat),
    }));
  };

  // ✅ FIX: When a new image file is selected, store it in form.image
  //         AND keep existingImageUrl intact so the backend knows what was there before
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Revoke previous blob URL to avoid memory leaks
    if (form.imagePreview && form.imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(form.imagePreview);
    }
    setForm((prev) => ({
      ...prev,
      image: file,
      imagePreview: URL.createObjectURL(file),
      // existingImageUrl stays — backend will ignore it when a new file is sent
    }));
  };

  // ✅ FIX: Remove image — clears both new file AND existing URL
  const handleRemoveImage = () => {
    if (form.imagePreview && form.imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(form.imagePreview);
    }
    setForm((prev) => ({
      ...prev,
      image: null,
      imagePreview: "",
      existingImageUrl: "", // explicitly tell backend to clear the image
    }));
  };

  const handleSubmit = async (e, asDraft = false) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.category) {
      showToast("Please fill Title, Category, and Content.", "error");
      return;
    }

    setSaveAsDraft(asDraft);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title",           form.title);
      formData.append("permalink",       form.permalink);
      formData.append("metaDescription", form.metaDescription);
      formData.append("description",     form.description);
      formData.append("category",        form.category);
      formData.append("keywords",        form.keywords);
      formData.append("status",          asDraft ? "draft" : "published");

      if (form.image) {
        // ✅ User picked a brand-new image file — upload it
        formData.append("image", form.image);
      } else if (form.existingImageUrl) {
        // ✅ FIX: No new file chosen — tell the backend to keep the existing image
        //         The backend should read this field and skip overwriting the image column
        formData.append("existingImage", form.existingImageUrl);
      }
      // If both are empty, no image field is sent → backend sets image to null/empty

      let res;
      if (editingId) {
        res = await fetch(`${BASE_URL}/api/blogs/${editingId}`, {
          method:  "PUT",
          headers: { Authorization: token },
          body:    formData,
        });
      } else {
        res = await fetch(`${BASE_URL}/api/blogs`, {
          method:  "POST",
          headers: { Authorization: token },
          body:    formData,
        });
      }

      const data = await res.json();

      if (data.success) {
        if (asDraft) {
          showToast(editingId ? "✏️ Changes saved as draft!" : "📝 Blog saved as draft — hidden from users!");
        } else {
          showToast(editingId ? "✅ Blog updated & published!" : "🎉 Blog published successfully!");
        }
        resetForm();
        setSaveAsDraft(false);
        setActiveTab(asDraft ? "drafts" : "published");
        fetchBlogs();
      } else {
        showToast(data.message || "Something went wrong. Please try again.", "error");
      }
    } catch (err) {
      showToast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishDraft = async () => {
    if (!publishTarget) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title",           publishTarget.title);
      formData.append("permalink",       publishTarget.permalink);
      formData.append("metaDescription", publishTarget.metaDescription || "");
      formData.append("description",     publishTarget.description || "");
      formData.append("category",        publishTarget.category || "");
      formData.append("keywords",        publishTarget.keywords || "");
      formData.append("status",          "published");
      // ✅ FIX: preserve the existing image when publishing a draft
      if (publishTarget.image) {
        formData.append("existingImage", publishTarget.image);
      }

      const res = await fetch(`${BASE_URL}/api/blogs/${publishTarget.id}`, {
        method: "PUT",
        headers: { Authorization: token },
        body: formData,
      });
      const data = await res.json();
      if (data.message) {
        showToast("Blog is now LIVE — users can see it! 🎉");
        setPublishTarget(null);
        setActiveTab("published");
        fetchBlogs();
      } else {
        showToast("Error publishing blog.", "error");
      }
    } catch (err) {
      showToast("Error publishing blog.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async (blog) => {
    try {
      const formData = new FormData();
      formData.append("title",           blog.title);
      formData.append("permalink",       blog.permalink);
      formData.append("metaDescription", blog.metaDescription || "");
      formData.append("description",     blog.description || "");
      formData.append("category",        blog.category || "");
      formData.append("keywords",        blog.keywords || "");
      formData.append("status",          "draft");
      // ✅ FIX: preserve the existing image when moving to draft
      if (blog.image) {
        formData.append("existingImage", blog.image);
      }

      await fetch(`${BASE_URL}/api/blogs/${blog.id}`, {
        method: "PUT",
        headers: { Authorization: token },
        body: formData,
      });
      showToast("Blog moved to drafts — hidden from users.");
      fetchBlogs();
    } catch (err) {
      showToast("Error updating blog.", "error");
    }
  };

  const handleEdit = (blog) => {
    setPermalinkManual(true);
    setForm({
      title:            blog.title || "",
      permalink:        blog.permalink || "",
      metaDescription:  blog.metaDescription || "",
      description:      blog.description || "",
      category:         blog.category || "",
      keywords:         blog.keywords || "",
      image:            null,            // no new file yet
      imagePreview:     blog.image || "", // ✅ show existing image in preview
      existingImageUrl: blog.image || "", // ✅ FIX: remember the current image URL
    });
    setEditingId(blog.id);
    setActiveTab("create");
    setTimeout(() => formTopRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      await fetch(`${BASE_URL}/api/blogs/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      showToast("Blog deleted.");
      setDeleteTarget(null);
      fetchBlogs();
    } catch (err) {
      showToast("Error deleting blog.", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    // Revoke any pending blob URL
    if (form.imagePreview && form.imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(form.imagePreview);
    }
    setForm(emptyForm);
    setEditingId(null);
    setPermalinkManual(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin");
  };

  return (
    <div className="w-full min-h-screen bg-[#F7F6F3] overflow-x-hidden font-sans">
      <style>{`
        @keyframes slideUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn  { from { opacity:0; transform:scale(.92); }       to { opacity:1; transform:scale(1); } }
        @keyframes fadeIn   { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        .animate-slideUp { animation: slideUp  .35s ease forwards; }
        .animate-scaleIn { animation: scaleIn  .25s ease forwards; }
        .animate-fadeIn  { animation: fadeIn   .2s  ease forwards; }
        .admin-nav {
          position: sticky; top: 0; z-index: 30;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 2px 16px rgba(0,0,0,0.07);
        }
        .no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
        .no-scrollbar::-webkit-scrollbar { display:none; }
        .blog-content-wrapper {
          border: 2px solid #e5e7eb; border-radius: 0.75rem;
          overflow: hidden; transition: border-color 0.2s;
        }
        .blog-content-wrapper:focus-within {
          border-color: #6B4A2D;
          box-shadow: 0 0 0 4px rgba(107,74,45,0.08);
        }
      `}</style>

      <Toast toast={toast} onClose={dismissToast} />
      <DeleteModal blog={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={loading} />
      <PublishModal blog={publishTarget} onConfirm={handlePublishDraft} onCancel={() => setPublishTarget(null)} loading={loading} />

      <header className="relative min-h-[40vh] sm:min-h-[55vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1400&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-2 sm:mb-3">Blog Management</h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto">Create, edit, and manage all your blog content in one place</p>
          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 sm:mt-5">
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-black text-white">{publishedBlogs.length}</p>
              <p className="text-[10px] sm:text-xs text-gray-400">Published</p>
            </div>
            <div className="w-px h-7 sm:h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-black text-amber-400">{draftBlogs.length}</p>
              <p className="text-[10px] sm:text-xs text-gray-400">Drafts</p>
            </div>
            <div className="w-px h-7 sm:h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-black text-white">{CATEGORIES.length}</p>
              <p className="text-[10px] sm:text-xs text-gray-400">Categories</p>
            </div>
          </div>
        </div>
      </header>

      <nav className="admin-nav">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab("published")}
                className={`flex items-center gap-1.5 px-3 sm:px-5 py-3.5 sm:py-4 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === "published" ? "border-[#6B4A2D] text-[#6B4A2D]" : "border-transparent text-gray-500 hover:text-gray-800"}`}
              >
                <Globe size={14} /><span>Published</span>
                <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full" style={{ background: "#6B4A2D", color: "#fff" }}>{publishedBlogs.length}</span>
              </button>

              <button
                onClick={() => setActiveTab("drafts")}
                className={`flex items-center gap-1.5 px-3 sm:px-5 py-3.5 sm:py-4 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === "drafts" ? "border-amber-500 text-amber-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}
              >
                <Lock size={13} /><span>Drafts</span>
                {draftBlogs.length > 0 && (
                  <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{draftBlogs.length}</span>
                )}
              </button>

              <button
                onClick={() => { resetForm(); setActiveTab("create"); }}
                className={`flex items-center gap-1.5 px-3 sm:px-5 py-3.5 sm:py-4 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === "create" ? "border-[#6B4A2D] text-[#6B4A2D]" : "border-transparent text-gray-500 hover:text-gray-800"}`}
              >
                <Plus size={14} /><span>{editingId ? "Edit Blog" : "New Blog"}</span>
                {editingId && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">Editing</span>}
              </button>

              {/* Navigation only — opens the separate Project Management module.
                  Does not change any blog behaviour. */}
              <button
                onClick={() => navigate("/admin/projects")}
                className="flex items-center gap-1.5 px-3 sm:px-5 py-3.5 sm:py-4 text-xs sm:text-sm font-bold border-b-2 border-transparent text-gray-400 hover:text-gray-800 transition-all whitespace-nowrap"
              >
                <LayoutGrid size={14} /><span>Projects</span>
              </button>
            </div>

            <button onClick={handleLogout} className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-all shrink-0">
              <LogOut size={15} /> Logout
            </button>
            <button onClick={() => setMobileMenuOpen((p) => !p)} className="sm:hidden p-2 hover:bg-gray-100 rounded-lg shrink-0">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="sm:hidden pb-3 pt-1">
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition">
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {(activeTab === "published" || activeTab === "drafts") && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10">

          {activeTab === "drafts" && (
            <div className="mb-5 sm:mb-6 bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 sm:px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Lock size={18} className="text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-800">🔒 Drafts are ADMIN-ONLY — completely hidden from all users</p>
                <p className="text-xs text-amber-600 mt-1 leading-relaxed">
                  Users <strong>cannot see drafts</strong> at all. Only when you click <strong>"Publish"</strong> does a blog become visible to the public.
                </p>
              </div>
              {draftBlogs.length > 0 && (
                <span className="shrink-0 text-xs font-bold px-3 py-1.5 bg-amber-200 text-amber-900 rounded-full">{draftBlogs.length} pending</span>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div className="flex-1">
              <label className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Search Blogs</label>
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search by title or description…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#6B4A2D] focus:ring-4 focus:ring-[#6B4A2D]/10 outline-none transition" />
              </div>
            </div>
            <div className="w-full sm:w-52">
              <label className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Category</label>
              <div className="relative">
                <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#6B4A2D] outline-none transition appearance-none bg-white cursor-pointer">
                  <option value="">All Categories</option>
                  {CATEGORIES.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              {(searchTerm || filterCategory) && (
                <button onClick={() => { setSearchTerm(""); setFilterCategory(""); }}
                  className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 py-2.5 px-3 border-2 border-gray-200 rounded-xl transition whitespace-nowrap">
                  <X size={12} /> Clear
                </button>
              )}
              <button onClick={() => { resetForm(); setActiveTab("create"); }}
                className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-sm text-white transition shadow-md hover:shadow-lg whitespace-nowrap"
                style={{ background: "#6B4A2D" }}>
                <Plus size={15} /> New Blog
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-500 mb-4 font-medium">
            Showing <strong className="text-gray-800">{filteredBlogs.length}</strong> of{" "}
            <strong className="text-gray-800">{activeTab === "drafts" ? draftBlogs.length : publishedBlogs.length}</strong>{" "}
            {activeTab === "drafts" ? "admin-only drafts" : "published blogs"}
          </p>

          {dbLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <Loader size={32} className="animate-spin" style={{ color: "#6B4A2D" }} />
              <p className="text-sm font-medium">Loading blogs…</p>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 sm:py-20 text-center px-4">
              {activeTab === "drafts" ? <Lock size={44} className="mx-auto text-gray-300 mb-4" /> : <BookOpen size={44} className="mx-auto text-gray-300 mb-4" />}
              <h3 className="text-base sm:text-lg font-bold text-gray-600 mb-2">
                {activeTab === "drafts" ? "No drafts saved" : "No published blogs"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 mb-6">
                {activeTab === "drafts" ? "Save a blog as draft — it stays hidden from users until you publish." : blogs.length === 0 ? "You haven't created any blogs yet." : "Try a different search or filter."}
              </p>
              <button onClick={() => { resetForm(); setActiveTab("create"); }}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-white font-bold text-sm transition"
                style={{ background: "#6B4A2D" }}>
                <Plus size={15} /> Create New Blog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} onEdit={handleEdit}
                  onDelete={(b) => setDeleteTarget(b)} onPublish={(b) => setPublishTarget(b)}
                  onUnpublish={handleUnpublish} formatDate={formatDate} />
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "create" && (
        <section className="max-w-3xl mx-auto px-3 sm:px-6 py-6 sm:py-10" ref={formTopRef}>
          <div className="flex items-center gap-2 mb-5 sm:mb-6 flex-wrap">
            <button onClick={() => { resetForm(); setActiveTab("published"); }}
              className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 hover:text-[#6B4A2D] font-semibold transition">
              <ArrowLeft size={14} /> Back
            </button>
            <ChevronRight size={13} className="text-gray-300" />
            <span className="text-xs sm:text-sm font-bold text-gray-700">{editingId ? "Edit Blog" : "New Blog"}</span>
            {editingId && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Editing mode</span>}
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-gray-100 flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#6B4A2D" }}>
                {editingId ? <Edit2 size={18} color="#fff" /> : <FileText size={18} color="#fff" />}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">{editingId ? "Update Blog Post" : "Create New Blog Post"}</h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{editingId ? "Modify the details and save changes" : "Fill in the details below"}</p>
              </div>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="px-4 sm:px-8 py-6 sm:py-8 space-y-5 sm:space-y-6">

              <Field label="Blog Title" required icon={FileText}>
                <input type="text" name="title" placeholder="Enter an engaging blog title…"
                  value={form.title} onChange={handleChange} required className={inputCls} />
              </Field>

              <Field label="Category" required icon={Tag}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button key={cat} type="button" onClick={() => handleCategorySelect(cat)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border-2 transition-all text-left ${form.category === cat ? "border-[#6B4A2D] bg-[#6B4A2D] text-white shadow-md" : "border-gray-200 text-gray-600 hover:border-[#6B4A2D] hover:text-[#6B4A2D]"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Permalink" icon={Link2}
                hint={permalinkManual ? "Manually edited — auto-generate disabled" : "Auto-generated from category + title · click to edit manually"}>
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-[#6B4A2D] transition">
                  <span className="px-3 py-3 bg-gray-50 text-gray-400 text-xs sm:text-sm border-r-2 border-gray-200 font-mono whitespace-nowrap shrink-0">/blog/</span>
                  <input type="text" name="permalink" value={form.permalink} onChange={handleChange}
                    placeholder="category/blog-title"
                    className="flex-1 px-3 py-3 text-xs sm:text-sm text-gray-700 font-mono outline-none bg-white min-w-0" />
                  {permalinkManual && !editingId && (
                    <button type="button"
                      onClick={() => { setPermalinkManual(false); setForm((p) => ({ ...p, permalink: buildPermalink(p.title, p.category) })); }}
                      className="px-3 py-3 text-xs text-amber-600 hover:text-amber-800 font-semibold whitespace-nowrap border-l-2 border-gray-200 bg-amber-50 hover:bg-amber-100 transition">
                      Reset
                    </button>
                  )}
                </div>
                {form.permalink && (
                  <p className="text-[11px] text-gray-400 font-mono mt-1.5 pl-1">
                    Preview: <span className="text-[#6B4A2D]">yourdomain.com/blog/{form.permalink}</span>
                  </p>
                )}
              </Field>

              <Field label="Meta Description" icon={AlignLeft}
                hint={`${form.metaDescription.length}/160 characters — shown in Google search results`}>
                <textarea name="metaDescription" placeholder="Brief summary for SEO…"
                  value={form.metaDescription} onChange={handleChange} rows={3} maxLength={160}
                  className={inputCls + " resize-none"} />
              </Field>

              <Field label="Keywords (SEO)" icon={Tag} hint="Press Enter or comma to add · click × to remove">
                <KeywordsInput value={form.keywords} onChange={(val) => setForm((p) => ({ ...p, keywords: val }))} />
              </Field>

              <Field label="Featured Image" icon={Image}>
                <label htmlFor="blog-image-upload"
                  className="flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-xl py-6 px-4 cursor-pointer hover:border-[#6B4A2D] hover:bg-[#6B4A2D]/5 transition group">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-[#6B4A2D]/10 flex items-center justify-center transition">
                    <Image size={18} className="text-gray-400 group-hover:text-[#6B4A2D] transition" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-600 group-hover:text-[#6B4A2D] transition">
                      {form.image
                        ? form.image.name
                        : editingId && form.existingImageUrl
                          ? "✅ Image saved — click to replace with a new one"
                          : "Click to upload image"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP · max 5MB · recommended 1200×675px</p>
                  </div>
                  <input id="blog-image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>

                <div className="mt-2.5 bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-2 bg-blue-100 border-b border-blue-200">
                    <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5"><Image size={12} /> 📐 Required Image Specifications</p>
                  </div>
                  <div className="px-4 py-3 grid grid-cols-3 gap-3 text-xs">
                    {[["Dimensions", "1200 × 675", "pixels"], ["Ratio", "16 : 9", "landscape"], ["Format", "JPG / WebP", "max 500 KB"]].map(([label, val, sub]) => (
                      <div key={label} className="bg-white rounded-lg p-2.5 border border-blue-100 text-center">
                        <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wide mb-1">{label}</p>
                        <p className="font-bold text-blue-900 text-sm">{val}</p>
                        <p className="text-[10px] text-blue-600">{sub}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {form.imagePreview && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
                      {form.image
                        ? <><CheckCircle size={11} className="text-green-500" /> New image selected — 16:9 preview</>
                        : <><CheckCircle size={11} className="text-blue-500" /> Current saved image — click upload area above to replace</>
                      }
                    </p>
                    <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100 w-full" style={{ aspectRatio: "16/9" }}>
                      <img src={form.imagePreview} alt="Preview" className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = "none"; }} />
                      <button type="button" onClick={handleRemoveImage}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition"
                        title="Remove image">
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </Field>

              <Field label="Blog Content" required icon={FileText}>
                <div className="blog-content-wrapper">
                  <BlogEditor value={form.description} onChange={(val) => setForm((p) => ({ ...p, description: val }))} />
                </div>
              </Field>

              <div className="rounded-xl border-2 border-dashed border-gray-200 p-4 bg-gray-50 space-y-3">
                <p className="text-xs sm:text-sm font-bold text-gray-700">What happens when I click…</p>
                <div className="flex items-start gap-2.5">
                  <div className="shrink-0 w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center mt-0.5"><Lock size={13} className="text-amber-700" /></div>
                  <div>
                    <p className="text-xs font-bold text-amber-800">Save as Draft (Admin Only)</p>
                    <p className="text-[11px] text-amber-700 leading-relaxed mt-0.5">Blog is saved <strong>only for you</strong>. Users <strong>cannot see it</strong> until you explicitly click Publish.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="shrink-0 w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center mt-0.5"><Globe size={13} className="text-green-700" /></div>
                  <div>
                    <p className="text-xs font-bold text-green-800">Publish Now to Users</p>
                    <p className="text-[11px] text-green-700 leading-relaxed mt-0.5">Blog goes <strong>live immediately</strong>. All visitors can find and read it right away.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
                {editingId && (
                  <button type="button" onClick={() => { resetForm(); setActiveTab("published"); }}
                    className="sm:w-32 py-3 sm:py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2">
                    <X size={14} /> Cancel
                  </button>
                )}

                <button
                  type="button"
                  disabled={loading}
                  onClick={(e) => handleSubmit(e, true)}
                  className="flex-1 py-3 sm:py-3.5 rounded-xl font-extrabold text-sm transition-all shadow border-2 border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && saveAsDraft
                    ? <><Loader size={15} className="animate-spin" /> Saving…</>
                    : <><Lock size={14} /> Save as Draft (Admin Only)</>}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={(e) => handleSubmit(e, false)}
                  className="flex-1 py-3 sm:py-3.5 rounded-xl font-extrabold text-sm text-white transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  style={{ background: loading ? "#9d7a5f" : "#6B4A2D" }}
                >
                  {loading && !saveAsDraft
                    ? <><Loader size={15} className="animate-spin" /> {editingId ? "Saving…" : "Publishing…"}</>
                    : editingId
                      ? <><Globe size={14} /> Update & Publish to Users</>
                      : <><Globe size={14} /> Publish Now to Users</>}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-5 sm:mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5">
            <h4 className="text-xs sm:text-sm font-bold text-amber-800 mb-3">💡 Quick Tips</h4>
            <ul className="text-[11px] sm:text-xs text-amber-700 space-y-1.5">
              <li className="flex items-start gap-2"><span>→</span> Permalink auto-generates as <strong>category/blog-title</strong> — select category first for best results</li>
              <li className="flex items-start gap-2"><span>→</span> You can manually edit the permalink — click Reset to regenerate</li>
              <li className="flex items-start gap-2"><span>→</span> Keep meta description under 160 chars for best SEO</li>
              <li className="flex items-start gap-2"><span>→</span> Press <kbd className="bg-amber-100 px-1 rounded font-mono">Enter</kbd> or <kbd className="bg-amber-100 px-1 rounded font-mono">,</kbd> to add keyword tags</li>
              <li className="flex items-start gap-2"><span>→</span> Best image: <strong>1200×675px · JPG/WebP · 16:9 · max 500KB</strong></li>
              <li className="flex items-start gap-2"><span>→</span> When editing, existing image is <strong>preserved automatically</strong> — upload a new file only if you want to change it</li>
              <li className="flex items-start gap-2"><span>→</span> Drafts are 100% hidden — users only see blogs you explicitly Publish</li>
              <li className="flex items-start gap-2"><span>→</span> Use the <strong>purple Copy button</strong> on any published blog card to get a share link — when pasted on WhatsApp / Twitter / LinkedIn, it shows the blog image + title as a preview card</li>
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}