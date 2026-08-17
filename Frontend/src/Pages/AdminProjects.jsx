import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../Api";
import {
  Menu, X, LogOut, Edit2, Trash2, Plus,
  Search, Filter, CheckCircle, AlertCircle, Loader, ChevronRight,
  Calendar, Tag, Image, FileText, AlignLeft, ArrowLeft,
  MoreVertical, RefreshCw, Globe, EyeOff, Lock, Link2,
  LayoutGrid, ExternalLink, ArrowUpDown, BookOpen,
} from "lucide-react";

/* ─────────────────────────── Shared UI bits ─────────────────────────── */

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

function DeleteModal({ project, onConfirm, onCancel, loading }) {
  if (!project) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-red-100 animate-scaleIn">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={22} className="text-red-600" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center mb-2">
          Are you sure you want to delete this project?
        </h3>
        <p className="text-sm text-gray-500 text-center mb-1">This cannot be undone. Permanently deleting:</p>
        <p className="text-sm font-semibold text-gray-800 text-center mb-6 line-clamp-2 px-2">"{project.title}"</p>
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

function PublishModal({ project, onConfirm, onCancel, loading }) {
  if (!project) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-green-100 animate-scaleIn">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe size={22} className="text-green-600" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center mb-2">Publish to Portfolio?</h3>
        <p className="text-sm text-gray-500 text-center mb-1">This will show the project on the public website:</p>
        <p className="text-sm font-semibold text-gray-800 text-center mb-6 line-clamp-2 px-2">"{project.title}"</p>
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

const FALLBACK =
  "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80";

function ProjectCard({ project, onEdit, onDelete, onPublish, onUnpublish, formatDate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const isDraft = project.status === "draft";

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300 flex flex-col group">
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <img
          src={project.image || FALLBACK}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK; }}
        />
        <span
          className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full shadow flex items-center gap-1"
          style={{ background: isDraft ? "#92400e" : "#6B4A2D", color: "#fff" }}
        >
          {isDraft ? <Lock size={10} /> : <Globe size={10} />}
          {isDraft ? "Admin Only" : project.category || "Project"}
        </span>

        <span className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 text-[10px] font-bold px-2 py-1 rounded-full bg-black/60 text-white flex items-center gap-1">
          <ArrowUpDown size={10} /> Order {project.displayOrder ?? 0}
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
              <button onClick={() => { onEdit(project); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition">
                <Edit2 size={13} /> Edit Project
              </button>
              {project.projectUrl && (
                <button onClick={() => { window.open(project.projectUrl, "_blank"); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                  <ExternalLink size={13} /> View Live Site
                </button>
              )}
              {isDraft ? (
                <button onClick={() => { onPublish(project); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-green-600 hover:bg-green-50 transition">
                  <Globe size={13} /> Publish Now
                </button>
              ) : (
                <button onClick={() => { onUnpublish(project); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-amber-600 hover:bg-amber-50 transition">
                  <EyeOff size={13} /> Move to Draft
                </button>
              )}
              <button onClick={() => { onDelete(project); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition">
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
            <p className="text-[10px] sm:text-xs text-amber-700 font-semibold">Hidden from the website · Admin view only</p>
          </div>
        )}
        <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug mb-2 line-clamp-2">{project.title}</h3>
        {project.description && (
          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-3 sm:mb-4 flex-grow">{project.description}</p>
        )}

        {project.projectUrl && (
          <a
            href={project.projectUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] text-gray-400 hover:text-[#6B4A2D] font-mono mb-2 truncate flex items-center gap-1 transition"
          >
            <Link2 size={10} className="shrink-0" /> {project.projectUrl}
          </a>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <span className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400">
            <Calendar size={11} />{formatDate(project.createdAt)}
          </span>
          {project.updatedAt !== project.createdAt && (
            <span className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400">
              <RefreshCw size={10} /> Updated
            </span>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          <button onClick={() => onEdit(project)} className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg font-semibold text-xs transition">
            <Edit2 size={12} /> Edit
          </button>
          {isDraft ? (
            <button onClick={() => onPublish(project)} className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 py-2 rounded-lg font-semibold text-xs transition">
              <Globe size={12} /> Publish
            </button>
          ) : (
            <button onClick={() => onUnpublish(project)} className="flex-1 flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 py-2 rounded-lg font-semibold text-xs transition">
              <EyeOff size={12} /> Draft
            </button>
          )}
          <button onClick={() => onDelete(project)} className="flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-xs transition">
            <Trash2 size={12} />
          </button>
        </div>
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

/* ─────────────────────────── Config ─────────────────────────── */

const CATEGORIES = [
  "Web Development",
  "E-Commerce",
  "Digital Marketing",
  "Branding & Design",
  "Production House",
  "Podcast Studio",
  "Mobile App Development",
  "SEO",
];

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // must stay in sync with multer's limit

const emptyForm = {
  title: "",
  description: "",
  category: "",
  projectUrl: "",
  displayOrder: "",
  image: null,          // new File object (only when the admin picks a new file)
  imagePreview: "",     // blob URL or the currently saved hosted URL
  existingImageUrl: "", // the saved URL, so editing without re-uploading keeps it
};

/* ─────────────────────────── Page ─────────────────────────── */

export default function AdminProjects() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const formTopRef = useRef();

  const [form, setForm] = useState(emptyForm);
  const [projects, setProjects] = useState([]);
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

  const showToast = (msg, type = "success") => setToast({ msg, type });
  const dismissToast = () => setToast(null);
  const formatDate = (ts) =>
    ts
      ? new Date(Number(ts)).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      : "—";

  /* ── Data ── */

  const fetchProjects = async () => {
    setDbLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/projects`, {
        headers: { Authorization: token },
      });

      if (res.status === 401 || res.status === 403) {
        showToast("Your session expired. Please log in again.", "error");
        setProjects([]);
        return;
      }

      if (!res.ok) throw new Error("Request failed");

      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading projects:", err);
      showToast("Could not load projects. Please check your connection and try again.", "error");
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const publishedProjects = projects.filter((p) => p.status === "published");
  const draftProjects = projects.filter((p) => p.status === "draft");

  const filteredProjects = (() => {
    let list = activeTab === "drafts" ? draftProjects : publishedProjects;
    if (searchTerm)
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    if (filterCategory) list = list.filter((p) => p.category === filterCategory);
    return list;
  })();

  /* ── Form handlers ── */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (cat) => {
    setForm((prev) => ({ ...prev, category: prev.category === cat ? "" : cat }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    // Allow re-picking the same file after a rejection
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showToast("Unsupported file type. Please choose a JPG, PNG or WebP image.", "error");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      showToast(
        `Image is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum allowed size is 5MB.`,
        "error"
      );
      return;
    }

    if (form.imagePreview && form.imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(form.imagePreview);
    }

    setForm((prev) => ({
      ...prev,
      image: file,
      imagePreview: URL.createObjectURL(file),
      // existingImageUrl stays — the backend ignores it when a new file is sent
    }));
  };

  const handleRemoveImage = () => {
    if (form.imagePreview && form.imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(form.imagePreview);
    }
    setForm((prev) => ({ ...prev, image: null, imagePreview: "", existingImageUrl: "" }));
  };

  const resetForm = () => {
    if (form.imagePreview && form.imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(form.imagePreview);
    }
    setForm(emptyForm);
    setEditingId(null);
  };

  const validateForm = () => {
    if (!form.title.trim()) return "Please enter a project title.";
    if (!form.image && !form.existingImageUrl) return "Please upload a project image.";
    if (form.projectUrl.trim() && !/^https?:\/\/\S+$/i.test(form.projectUrl.trim()))
      return "Project URL must start with http:// or https://";
    if (form.displayOrder !== "" && (isNaN(Number(form.displayOrder)) || Number(form.displayOrder) < 0))
      return "Display order must be a number of 0 or higher.";
    return null;
  };

  const handleSubmit = async (asDraft = false) => {
    const validationError = validateForm();
    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    setSaveAsDraft(asDraft);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title",        form.title.trim());
      formData.append("description",  form.description.trim());
      formData.append("category",     form.category);
      formData.append("projectUrl",   form.projectUrl.trim());
      formData.append("displayOrder", form.displayOrder === "" ? "0" : String(form.displayOrder));
      formData.append("status",       asDraft ? "draft" : "published");

      if (form.image) {
        // A brand-new file was picked — upload it
        formData.append("image", form.image);
      } else if (form.existingImageUrl) {
        // No new file — tell the backend to keep the saved image untouched
        formData.append("existingImage", form.existingImageUrl);
      }

      const res = await fetch(
        editingId ? `${BASE_URL}/api/projects/${editingId}` : `${BASE_URL}/api/projects`,
        {
          method: editingId ? "PUT" : "POST",
          headers: { Authorization: token },
          body: formData,
        }
      );

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        if (asDraft) {
          showToast(editingId ? "✏️ Changes saved as draft!" : "📝 Project saved as draft — hidden from the website!");
        } else {
          showToast(editingId ? "✅ Project updated & published!" : "🎉 Project published to the portfolio!");
        }
        resetForm();
        setSaveAsDraft(false);
        setActiveTab(asDraft ? "drafts" : "published");
        fetchProjects();
      } else {
        showToast(data?.message || "Something went wrong. Please try again.", "error");
      }
    } catch (err) {
      console.error("Error saving project:", err);
      showToast("Network error. Please check your connection and try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Status-only change — the stored image and all other fields stay exactly as they are.
  const changeStatus = async (project, status) => {
    try {
      const res = await fetch(`${BASE_URL}/api/projects/${project.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        showToast(
          status === "published"
            ? "Project is now LIVE on the website! 🎉"
            : "Project moved to drafts — hidden from the website."
        );
        return true;
      }
      showToast(data?.message || "Could not update the project status.", "error");
      return false;
    } catch (err) {
      console.error("Error updating status:", err);
      showToast("Network error. Please try again.", "error");
      return false;
    }
  };

  const handlePublishDraft = async () => {
    if (!publishTarget) return;
    setLoading(true);
    const ok = await changeStatus(publishTarget, "published");
    setLoading(false);
    if (ok) {
      setPublishTarget(null);
      setActiveTab("published");
      fetchProjects();
    }
  };

  const handleUnpublish = async (project) => {
    const ok = await changeStatus(project, "draft");
    if (ok) fetchProjects();
  };

  const handleEdit = (project) => {
    setForm({
      title:            project.title || "",
      description:      project.description || "",
      category:         project.category || "",
      projectUrl:       project.projectUrl || "",
      displayOrder:     project.displayOrder ?? "",
      image:            null,                   // no new file yet
      imagePreview:     project.image || "",    // show the saved image
      existingImageUrl: project.image || "",    // remember it so it is preserved
    });
    setEditingId(project.id);
    setActiveTab("create");
    setTimeout(() => formTopRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/projects/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        showToast("Project deleted.");
        setDeleteTarget(null);
        fetchProjects();
      } else {
        showToast(data?.message || "Could not delete the project. Please try again.", "error");
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      showToast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin");
  };

  /* ── Render ── */

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
      `}</style>

      <Toast toast={toast} onClose={dismissToast} />
      <DeleteModal project={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={loading} />
      <PublishModal project={publishTarget} onConfirm={handlePublishDraft} onCancel={() => setPublishTarget(null)} loading={loading} />

      <header className="relative min-h-[40vh] sm:min-h-[55vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1400&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-2 sm:mb-3">Project Management</h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto">Add, edit and order the projects shown in "Our Portfolio"</p>
          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 sm:mt-5">
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-black text-white">{publishedProjects.length}</p>
              <p className="text-[10px] sm:text-xs text-gray-400">Published</p>
            </div>
            <div className="w-px h-7 sm:h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-black text-amber-400">{draftProjects.length}</p>
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
                <Globe size={14} /><span>Projects</span>
                <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full" style={{ background: "#6B4A2D", color: "#fff" }}>{publishedProjects.length}</span>
              </button>

              <button
                onClick={() => setActiveTab("drafts")}
                className={`flex items-center gap-1.5 px-3 sm:px-5 py-3.5 sm:py-4 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === "drafts" ? "border-amber-500 text-amber-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}
              >
                <Lock size={13} /><span>Drafts</span>
                {draftProjects.length > 0 && (
                  <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{draftProjects.length}</span>
                )}
              </button>

              <button
                onClick={() => { resetForm(); setActiveTab("create"); }}
                className={`flex items-center gap-1.5 px-3 sm:px-5 py-3.5 sm:py-4 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === "create" ? "border-[#6B4A2D] text-[#6B4A2D]" : "border-transparent text-gray-500 hover:text-gray-800"}`}
              >
                <Plus size={14} /><span>{editingId ? "Edit Project" : "New Project"}</span>
                {editingId && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">Editing</span>}
              </button>

              <button
                onClick={() => navigate("/admin/blogs")}
                className="flex items-center gap-1.5 px-3 sm:px-5 py-3.5 sm:py-4 text-xs sm:text-sm font-bold border-b-2 border-transparent text-gray-400 hover:text-gray-800 transition-all whitespace-nowrap"
              >
                <BookOpen size={14} /><span>Blogs</span>
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
                <p className="text-sm font-bold text-amber-800">🔒 Drafts are ADMIN-ONLY — completely hidden from the website</p>
                <p className="text-xs text-amber-600 mt-1 leading-relaxed">
                  Visitors <strong>cannot see drafts</strong> in Our Portfolio. Only when you click <strong>"Publish"</strong> does a project appear publicly.
                </p>
              </div>
              {draftProjects.length > 0 && (
                <span className="shrink-0 text-xs font-bold px-3 py-1.5 bg-amber-200 text-amber-900 rounded-full">{draftProjects.length} pending</span>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div className="flex-1">
              <label className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Search Projects</label>
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
                <Plus size={15} /> New Project
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-500 mb-4 font-medium">
            Showing <strong className="text-gray-800">{filteredProjects.length}</strong> of{" "}
            <strong className="text-gray-800">{activeTab === "drafts" ? draftProjects.length : publishedProjects.length}</strong>{" "}
            {activeTab === "drafts" ? "admin-only drafts" : "published projects"}
          </p>

          {dbLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <Loader size={32} className="animate-spin" style={{ color: "#6B4A2D" }} />
              <p className="text-sm font-medium">Loading projects…</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 sm:py-20 text-center px-4">
              {activeTab === "drafts" ? <Lock size={44} className="mx-auto text-gray-300 mb-4" /> : <LayoutGrid size={44} className="mx-auto text-gray-300 mb-4" />}
              <h3 className="text-base sm:text-lg font-bold text-gray-600 mb-2">
                {activeTab === "drafts" ? "No drafts saved" : "No published projects"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 mb-6">
                {activeTab === "drafts"
                  ? "Save a project as draft — it stays hidden from the website until you publish."
                  : projects.length === 0
                    ? "You haven't added any projects yet."
                    : "Try a different search or filter."}
              </p>
              <button onClick={() => { resetForm(); setActiveTab("create"); }}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-white font-bold text-sm transition"
                style={{ background: "#6B4A2D" }}>
                <Plus size={15} /> Create New Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} onEdit={handleEdit}
                  onDelete={(p) => setDeleteTarget(p)} onPublish={(p) => setPublishTarget(p)}
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
            <span className="text-xs sm:text-sm font-bold text-gray-700">{editingId ? "Edit Project" : "New Project"}</span>
            {editingId && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Editing mode</span>}
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-gray-100 flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#6B4A2D" }}>
                {editingId ? <Edit2 size={18} color="#fff" /> : <FileText size={18} color="#fff" />}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">{editingId ? "Update Project" : "Create New Project"}</h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{editingId ? "Modify the details and save changes" : "Fill in the details below"}</p>
              </div>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="px-4 sm:px-8 py-6 sm:py-8 space-y-5 sm:space-y-6">

              <Field label="Project Title" required icon={FileText}>
                <input type="text" name="title" placeholder="e.g. Meera Basu"
                  value={form.title} onChange={handleChange} required className={inputCls} />
              </Field>

              <Field label="Category" icon={Tag} hint="Click a category to select · click again to clear">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button key={cat} type="button" onClick={() => handleCategorySelect(cat)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border-2 transition-all text-left ${form.category === cat ? "border-[#6B4A2D] bg-[#6B4A2D] text-white shadow-md" : "border-gray-200 text-gray-600 hover:border-[#6B4A2D] hover:text-[#6B4A2D]"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Project Description" icon={AlignLeft}
                hint="Shown in the admin list — a short summary of the work delivered">
                <textarea name="description" placeholder="Brief description of this project…"
                  value={form.description} onChange={handleChange} rows={4}
                  className={inputCls + " resize-none"} />
              </Field>

              <Field label="Project URL" icon={Link2} hint="Optional — where the VIEW PROJECT button sends visitors">
                <input type="url" name="projectUrl" placeholder="https://example.com"
                  value={form.projectUrl} onChange={handleChange} className={inputCls} />
              </Field>

              <Field label="Display Order" icon={ArrowUpDown}
                hint="Optional — lower numbers appear first in Our Portfolio (leave empty for 0)">
                <input type="number" name="displayOrder" min="0" placeholder="0"
                  value={form.displayOrder} onChange={handleChange} className={inputCls} />
              </Field>

              <Field label="Project Image" required icon={Image}>
                <label htmlFor="project-image-upload"
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
                          : "Click to upload the project screenshot"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP · max 5MB · recommended 1200×675px</p>
                  </div>
                  <input id="project-image-upload" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
                </label>

                <div className="mt-2.5 bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-2 bg-blue-100 border-b border-blue-200">
                    <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5"><Image size={12} /> 📐 Recommended Image Specifications</p>
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
                        : <><CheckCircle size={11} className="text-blue-500" /> Current saved image — click the upload area above to replace</>
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

              <div className="rounded-xl border-2 border-dashed border-gray-200 p-4 bg-gray-50 space-y-3">
                <p className="text-xs sm:text-sm font-bold text-gray-700">What happens when I click…</p>
                <div className="flex items-start gap-2.5">
                  <div className="shrink-0 w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center mt-0.5"><Lock size={13} className="text-amber-700" /></div>
                  <div>
                    <p className="text-xs font-bold text-amber-800">Save as Draft (Admin Only)</p>
                    <p className="text-[11px] text-amber-700 leading-relaxed mt-0.5">Project is saved <strong>only for you</strong>. It does <strong>not appear</strong> in Our Portfolio until you click Publish.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="shrink-0 w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center mt-0.5"><Globe size={13} className="text-green-700" /></div>
                  <div>
                    <p className="text-xs font-bold text-green-800">Publish Now to the Website</p>
                    <p className="text-[11px] text-green-700 leading-relaxed mt-0.5">Project appears in <strong>Our Portfolio immediately</strong> — on the home page and the Projects page.</p>
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
                  onClick={() => handleSubmit(true)}
                  className="flex-1 py-3 sm:py-3.5 rounded-xl font-extrabold text-sm transition-all shadow border-2 border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && saveAsDraft
                    ? <><Loader size={15} className="animate-spin" /> Saving…</>
                    : <><Lock size={14} /> Save as Draft (Admin Only)</>}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSubmit(false)}
                  className="flex-1 py-3 sm:py-3.5 rounded-xl font-extrabold text-sm text-white transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  style={{ background: loading ? "#9d7a5f" : "#6B4A2D" }}
                >
                  {loading && !saveAsDraft
                    ? <><Loader size={15} className="animate-spin" /> {editingId ? "Saving…" : "Publishing…"}</>
                    : editingId
                      ? <><Globe size={14} /> Update & Publish to Website</>
                      : <><Globe size={14} /> Publish Now to Website</>}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-5 sm:mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5">
            <h4 className="text-xs sm:text-sm font-bold text-amber-800 mb-3">💡 Quick Tips</h4>
            <ul className="text-[11px] sm:text-xs text-amber-700 space-y-1.5">
              <li className="flex items-start gap-2"><span>→</span> The <strong>title</strong> and <strong>image</strong> are what visitors see on the portfolio card</li>
              <li className="flex items-start gap-2"><span>→</span> <strong>Project URL</strong> is optional — without it the VIEW PROJECT button does nothing</li>
              <li className="flex items-start gap-2"><span>→</span> <strong>Display order</strong> controls position — 1 shows before 2, and the home page shows the first 6</li>
              <li className="flex items-start gap-2"><span>→</span> Best image: <strong>1200×675px · JPG/WebP · 16:9 · max 500KB</strong></li>
              <li className="flex items-start gap-2"><span>→</span> When editing, the existing image is <strong>preserved automatically</strong> — upload a new file only to change it</li>
              <li className="flex items-start gap-2"><span>→</span> Drafts are 100% hidden — the website only shows projects you explicitly Publish</li>
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
