"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle, ArrowDown, ArrowLeft, ArrowUp, BookOpen, CheckCircle, ChevronRight, Edit2, ExternalLink, Eye, EyeOff,
  FileText, Globe, Image as ImageIcon, LayoutGrid, Loader, Lock, LogOut, Plus, Search, Trash2, Upload, X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import BASE_URL from "@/Api";
import { clearToken, getToken } from "@/lib/auth";
import { arr, isRecord, num, str, type RawRecord } from "@/lib/api/coerce";
import {
  CASE_STUDY_CATEGORIES,
  SERVICE_PAGES,
  caseStudyPath,
  categoryInfo,
  normalizeCaseStudy,
  publishReadiness,
} from "@/lib/caseStudies";
import type { CaseStudy, CaseStudyCategory, ServicePagePath } from "@/types";
import TagInput from "@/components/TagInput";
import CaseStudyArticle from "@/components/caseStudy/CaseStudyArticle";

interface ToastState {
  msg: string;
  type: "success" | "error";
}

interface StepForm {
  title: string;
  description: string;
}

interface MetricForm {
  label: string;
  value: string;
  source: string;
}

interface GalleryForm {
  url: string;
  alt: string;
  caption: string;
  width: number | null;
  height: number | null;
}

interface FormState {
  project_id: string;
  slug: string;
  title: string;
  client_name: string;
  client_logo: string;
  short_description: string;
  category: CaseStudyCategory | "";
  industry: string;
  location: string;
  project_date: string;
  project_type: string;
  overview: string;
  challenge: string;
  goals: string;
  approach: StepForm[];
  services: string[];
  technologies: string[];
  deliverables: string;
  features: string;
  outcomes: string;
  metrics: MetricForm[];
  cover_image: string;
  cover_alt: string;
  cover_width: number | null;
  cover_height: number | null;
  gallery: GalleryForm[];
  video_url: string;
  testimonial: string;
  testimonial_author: string;
  testimonial_role: string;
  testimonial_confirmed: boolean;
  website_url: string;
  related_services: ServicePagePath[];
  related_blogs: string[];
  seo_title: string;
  seo_description: string;
  og_image: string;
  display_order: string;
}

interface ProjectOption {
  id: number;
  title: string;
  category: string;
  image: string;
  projectUrl: string;
}

interface BlogOption {
  permalink: string;
  title: string;
  category: string;
}

const EMPTY: FormState = {
  project_id: "",
  slug: "",
  title: "",
  client_name: "",
  client_logo: "",
  short_description: "",
  category: "",
  industry: "",
  location: "",
  project_date: "",
  project_type: "",
  overview: "",
  challenge: "",
  goals: "",
  approach: [],
  services: [],
  technologies: [],
  deliverables: "",
  features: "",
  outcomes: "",
  metrics: [],
  cover_image: "",
  cover_alt: "",
  cover_width: null,
  cover_height: null,
  gallery: [],
  video_url: "",
  testimonial: "",
  testimonial_author: "",
  testimonial_role: "",
  testimonial_confirmed: false,
  website_url: "",
  related_services: [],
  related_blogs: [],
  seo_title: "",
  seo_description: "",
  og_image: "",
  display_order: "",
};

const BRAND = "#6B4A2D";

class BackendOutdatedError extends Error {
  constructor() {
    super("Case studies API not found on the backend");
    this.name = "BackendOutdatedError";
  }
}
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const inputCls =
  "w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-[#6B4A2D] focus:ring-4 focus:ring-[#6B4A2D]/10 outline-none transition font-medium";

const PROJECT_CATEGORY_MAP: Record<string, CaseStudyCategory> = {
  "web development": "web-development",
  "e-commerce": "web-development",
  "mobile app development": "web-development",
  "digital marketing": "digital-marketing",
  seo: "digital-marketing",
  "branding & design": "digital-marketing",
  "production house": "production",
  "podcast studio": "podcast",
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

const lines = (value: string): string[] =>
  value
    .split("\n")
    .map((l) => l.replace(/^\s*[-*•]\s*/, "").trim())
    .filter(Boolean);

const toPayload = (f: FormState, status: "published" | "draft"): RawRecord => ({
  project_id: f.project_id ? Number(f.project_id) : null,
  slug: f.slug.trim(),
  title: f.title.trim(),
  client_name: f.client_name.trim(),
  client_logo: f.client_logo || null,
  short_description: f.short_description.trim(),
  category: f.category,
  industry: f.industry.trim(),
  location: f.location.trim(),
  project_date: f.project_date,
  project_type: f.project_type.trim(),
  overview: f.overview.trim(),
  challenge: f.challenge.trim(),
  goals: f.goals.trim(),
  approach: f.approach.filter((s) => s.title.trim() || s.description.trim()),
  services: f.services,
  technologies: f.technologies,
  deliverables: lines(f.deliverables),
  features: lines(f.features),
  outcomes: lines(f.outcomes),
  metrics: f.metrics.filter((m) => m.label.trim() || m.value.trim() || m.source.trim()),
  cover_image: f.cover_image || null,
  cover_alt: f.cover_alt.trim(),
  cover_width: f.cover_width,
  cover_height: f.cover_height,
  gallery: f.gallery,
  video_url: f.video_url.trim(),
  testimonial: f.testimonial.trim(),
  testimonial_author: f.testimonial_author.trim(),
  testimonial_role: f.testimonial_role.trim(),
  website_url: f.website_url.trim(),
  related_services: f.related_services,
  related_blogs: f.related_blogs,
  seo_title: f.seo_title.trim(),
  seo_description: f.seo_description.trim(),
  og_image: f.og_image || null,
  display_order: f.display_order === "" ? 0 : Number(f.display_order),
  status,
});

const fromRow = (raw: RawRecord): FormState => {
  const cs = normalizeCaseStudy(raw, { lenient: true });
  if (!cs) return EMPTY;
  return {
    project_id: cs.projectId !== null ? String(cs.projectId) : "",
    slug: cs.slug,
    title: cs.title,
    client_name: cs.clientName,
    client_logo: cs.clientLogo ?? "",
    short_description: cs.shortDescription,
    category: str(raw.category) ? cs.category : "",
    industry: cs.industry ?? "",
    location: cs.location ?? "",
    project_date: cs.projectDate ?? "",
    project_type: cs.projectType ?? "",
    overview: cs.overview,
    challenge: cs.challenge,
    goals: cs.goals,
    approach: cs.approach,
    services: cs.services,
    technologies: cs.technologies,
    deliverables: cs.deliverables.join("\n"),
    features: cs.features.join("\n"),
    outcomes: cs.outcomes.join("\n"),
    metrics: cs.metrics,
    cover_image: cs.cover?.url ?? "",
    cover_alt: cs.cover?.alt ?? "",
    cover_width: cs.cover?.width ?? null,
    cover_height: cs.cover?.height ?? null,
    gallery: cs.gallery,
    video_url: cs.videoUrl ?? "",
    testimonial: cs.testimonial ?? "",
    testimonial_author: cs.testimonialAuthor ?? "",
    testimonial_role: cs.testimonialRole ?? "",
    testimonial_confirmed: Boolean(cs.testimonial),
    website_url: cs.websiteUrl ?? "",
    related_services: cs.relatedServices,
    related_blogs: cs.relatedBlogs,
    seo_title: cs.seoTitle ?? "",
    seo_description: cs.seoDescription ?? "",
    og_image: cs.ogImage ?? "",
    display_order: String(cs.displayOrder ?? ""),
  };
};

function Toast({ toast, onClose }: { toast: ToastState | null; onClose: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  const ok = toast.type === "success";
  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-xl shadow-2xl border max-w-[calc(100vw-2rem)]"
      style={{ background: ok ? "#f0fdf4" : "#fff1f2", borderColor: ok ? "#86efac" : "#fca5a5", color: ok ? "#166534" : "#991b1b", minWidth: 240 }}
    >
      {ok ? <CheckCircle size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
      <span className="font-semibold text-sm flex-1">{toast.msg}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss" className="opacity-50 hover:opacity-100 transition shrink-0">
        <X size={15} />
      </button>
    </div>
  );
}

function Confirm({
  open, title, body, confirmLabel, tone, loading, onConfirm, onCancel,
}: {
  open: boolean; title: string; body: string; confirmLabel: string; tone: "red" | "green"; loading: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center mb-2">{title}</h3>
        <p className="text-sm text-gray-500 text-center mb-6">{body}</p>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition">Cancel</button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3 text-white rounded-xl font-bold text-sm transition disabled:opacity-60 flex items-center justify-center gap-2 ${tone === "red" ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"}`}
          >
            {loading && <Loader size={15} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, hint, icon: Icon, htmlFor, children }: { label: string; required?: boolean; hint?: string; icon?: LucideIcon; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
        {Icon && <Icon size={14} style={{ color: BRAND }} aria-hidden="true" />}
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500 pl-1">{hint}</p>}
    </div>
  );
}

function Panel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <fieldset className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-7 space-y-5">
      <legend className="sr-only">{title}</legend>
      <div>
        <h3 className="text-base sm:text-lg font-extrabold text-gray-900">{title}</h3>
        {description && <p className="text-xs sm:text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      {children}
    </fieldset>
  );
}

function Counter({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return <span className={`text-xs ${over ? "text-red-600 font-bold" : "text-gray-400"}`}>{value.length}/{max}</span>;
}

export default function AdminCaseStudies() {
  const router = useRouter();
  const token = getToken();
  const formTopRef = useRef<HTMLDivElement>(null);

  const [rows, setRows] = useState<RawRecord[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [blogs, setBlogs] = useState<BlogOption[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [saving, setSaving] = useState<"" | "draft" | "published">("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState("");
  const [tab, setTab] = useState<"published" | "drafts" | "edit">("published");
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [preview, setPreview] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [blockers, setBlockers] = useState<string[]>([]);
  const [backendMissing, setBackendMissing] = useState(false);
  const [confirm, setConfirm] = useState<{ kind: "delete" | "publish"; row: RawRecord } | null>(null);

  const showToast = useCallback((msg: string, type: ToastState["type"] = "success") => setToast({ msg, type }), []);
  const closeToast = useCallback(() => setToast(null), []);

  const authed = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const res = await fetch(`${BASE_URL}${path}`, { ...init, headers: { ...(init.headers || {}), Authorization: token ?? "" } });
      if (res.status === 401 || res.status === 403) {
        clearToken();
        router.push("/admin");
        throw new Error("Session expired");
      }
      return res;
    },
    [token, router]
  );

  const fetchRows = useCallback(async (): Promise<RawRecord[]> => {
    const res = await authed("/api/admin/case-studies");
    if (res.status === 404) throw new BackendOutdatedError();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return arr(await res.json()).filter(isRecord);
  }, [authed]);

  const reportLoadError = useCallback(
    (err: unknown) => {
      if (err instanceof BackendOutdatedError) {
        setBackendMissing(true);
        return;
      }
      if (err instanceof Error && err.message === "Session expired") return;
      console.warn("Case studies could not be loaded:", err instanceof Error ? err.message : err);
      showToast("Could not load case studies. Check your connection and try again.", "error");
    },
    [showToast]
  );

  const load = useCallback(async () => {
    try {
      const next = await fetchRows();
      setBackendMissing(false);
      setRows(next);
    } catch (err) {
      reportLoadError(err);
    }
  }, [fetchRows, reportLoadError]);

  useEffect(() => {
    fetchRows()
      .then((next) => {
        setBackendMissing(false);
        setRows(next);
      })
      .catch(reportLoadError)
      .finally(() => setListLoading(false));
    authed("/api/admin/projects")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: unknown) =>
        setProjects(
          arr(data)
            .filter(isRecord)
            .map((p) => ({ id: num(p.id) ?? 0, title: str(p.title) ?? "", category: str(p.category) ?? "", image: str(p.image) ?? "", projectUrl: str(p.projectUrl) ?? "" }))
            .filter((p) => p.id && p.title)
        )
      )
      .catch(() => {});
    fetch(`${BASE_URL}/api/blogs`, { headers: { Accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: unknown) =>
        setBlogs(
          arr(data)
            .filter(isRecord)
            .map((b) => ({ permalink: (str(b.permalink) ?? "").replace(/^\/+|\/+$/g, "").replace(/^blog\//, ""), title: str(b.title) ?? "", category: str(b.category) ?? "" }))
            .filter((b) => b.permalink && b.title)
        )
      )
      .catch(() => {});
  }, [fetchRows, reportLoadError, authed]);

  const items = useMemo(
    () => rows.map((r) => ({ raw: r, cs: normalizeCaseStudy(r, { lenient: true }) })).filter((x): x is { raw: RawRecord; cs: CaseStudy } => x.cs !== null),
    [rows]
  );
  const published = items.filter((x) => x.cs.status === "published");
  const drafts = items.filter((x) => x.cs.status === "draft");
  const visible = (tab === "drafts" ? drafts : published).filter((x) =>
    !search || `${x.cs.title} ${x.cs.clientName}`.toLowerCase().includes(search.toLowerCase())
  );

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const draftCs = useMemo(() => normalizeCaseStudy({ id: editingId ?? 0, ...toPayload(form, "draft") }, { lenient: true }), [form, editingId]);
  const readiness = draftCs ? publishReadiness(draftCs) : [];
  const ready = readiness.every((r) => r.done);

  const startNew = () => {
    setForm(EMPTY);
    setEditingId(null);
    setSlugTouched(false);
    setBlockers([]);
    setPreview(false);
    setTab("edit");
  };

  const startEdit = (raw: RawRecord) => {
    setForm(fromRow(raw));
    setEditingId(num(raw.id));
    setSlugTouched(true);
    setBlockers([]);
    setPreview(false);
    setTab("edit");
    setTimeout(() => formTopRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const fillFromProject = (id: string) => {
    const p = projects.find((x) => String(x.id) === id);
    if (!p) {
      set("project_id", "");
      return;
    }
    const name = p.title.replace(/\s+-\s+by\s+.+$/i, "").trim();
    setForm((f) => ({
      ...f,
      project_id: id,
      client_name: f.client_name || name,
      title: f.title || name,
      slug: slugTouched ? f.slug : slugify(name),
      website_url: f.website_url || p.projectUrl,
      cover_image: f.cover_image || p.image,
      cover_alt: f.cover_alt || (p.image ? `Screenshot of the ${name} website` : ""),
      category: f.category || PROJECT_CATEGORY_MAP[p.category.toLowerCase()] || "",
    }));
  };

  const upload = async (file: File, label: string): Promise<{ url: string; width: number | null; height: number | null } | null> => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showToast("Unsupported file type. Please choose a JPG, PNG or WebP image.", "error");
      return null;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      showToast(`Image is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 5MB.`, "error");
      return null;
    }
    setUploading(label);
    try {
      const body = new FormData();
      body.append("image", file);
      const res = await authed("/api/admin/case-studies/upload", { method: "POST", body });
      const data = (await res.json().catch(() => null)) as RawRecord | null;
      const url = data ? str(data.url) : null;
      if (!res.ok || !url) {
        showToast((data && str(data.message)) || "Image upload failed.", "error");
        return null;
      }
      return { url, width: num(data?.width), height: num(data?.height) };
    } catch (err) {
      console.error("Upload failed:", err);
      showToast("Image upload failed. Please try again.", "error");
      return null;
    } finally {
      setUploading("");
    }
  };

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>): File | null => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    return file;
  };

  const validateLocally = (status: "published" | "draft"): string | null => {
    if (!form.client_name.trim()) return "Enter the client name.";
    if (!form.title.trim()) return "Enter a title.";
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) return "The slug can only use lowercase letters, numbers and single hyphens.";
    if (!form.category) return "Choose a category.";
    if (form.metrics.some((m) => (m.label || m.value || m.source) && !(m.label && m.value && m.source)))
      return "Every result needs a label, a value and where it was measured.";
    if (form.testimonial.trim() && (!form.testimonial_author.trim() || !form.testimonial_confirmed))
      return "A testimonial needs the person's name and your confirmation that the client gave it.";
    if (form.gallery.some((g) => !g.alt.trim())) return "Describe every gallery image (alt text).";
    if (status === "published" && !ready) return "Complete the publishing checklist first.";
    return null;
  };

  const save = async (status: "published" | "draft") => {
    const problem = validateLocally(status);
    if (problem) {
      showToast(problem, "error");
      return;
    }
    setSaving(status);
    setBlockers([]);
    try {
      const res = await authed(editingId ? `/api/case-studies/${editingId}` : "/api/case-studies", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(form, status)),
      });
      const data = (await res.json().catch(() => null)) as RawRecord | null;
      if (res.ok && data?.success) {
        showToast(status === "published" ? "Case study published. It is live on the website and in the sitemap." : "Draft saved.");
        const id = num(data.id);
        if (!editingId && id) setEditingId(id);
        await load();
        setTab(status === "published" ? "published" : "drafts");
        return;
      }
      if (res.status === 404) {
        setBackendMissing(true);
        showToast("The backend does not have the case studies API yet. Deploy the updated backend first.", "error");
        return;
      }
      const list = data ? arr(data.blockers).map((b) => String(b)) : [];
      setBlockers(list);
      showToast((data && str(data.message)) || "Could not save the case study.", "error");
    } catch (err) {
      console.error("Error saving case study:", err);
      showToast("Network error. Please try again.", "error");
    } finally {
      setSaving("");
    }
  };

  const changeStatus = async (raw: RawRecord, status: "published" | "draft") => {
    setBusy(true);
    try {
      const res = await authed(`/api/case-studies/${num(raw.id)}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await res.json().catch(() => null)) as RawRecord | null;
      if (res.ok && data?.success) {
        showToast(status === "published" ? "Published. It is live on the website and in the sitemap." : "Moved to drafts. It is out of the sitemap; rebuild and upload to remove its pre-built page.");
        await load();
      } else {
        const list = data ? arr(data.blockers).map((b) => String(b)) : [];
        showToast(list.length ? `Not ready: ${list[0]}` : (data && str(data.message)) || "Could not change the status.", "error");
      }
    } catch (err) {
      console.error("Error changing status:", err);
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  const remove = async (raw: RawRecord) => {
    setBusy(true);
    try {
      const res = await authed(`/api/case-studies/${num(raw.id)}`, { method: "DELETE" });
      const data = (await res.json().catch(() => null)) as RawRecord | null;
      if (res.ok && data?.success) {
        showToast("Case study deleted.");
        if (editingId === num(raw.id)) startNew();
        await load();
      } else {
        showToast((data && str(data.message)) || "Could not delete the case study.", "error");
      }
    } catch (err) {
      console.error("Error deleting case study:", err);
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  const logout = () => {
    clearToken();
    router.push("/admin");
  };

  const tabCls = (active: boolean) =>
    `flex items-center gap-1.5 px-3 sm:px-5 py-3.5 sm:py-4 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${active ? "border-[#6B4A2D] text-[#6B4A2D]" : "border-transparent text-gray-500 hover:text-gray-800"}`;

  return (
    <div className="w-full min-h-screen bg-[#F7F6F3] overflow-x-hidden font-sans pt-20">
      <Toast toast={toast} onClose={closeToast} />
      <Confirm
        open={confirm?.kind === "delete"}
        title="Delete this case study?"
        body={`"${confirm ? str(confirm.row.title) : ""}" will be removed permanently, together with images that nothing else uses.`}
        confirmLabel="Yes, delete"
        tone="red"
        loading={busy}
        onConfirm={() => confirm && remove(confirm.row)}
        onCancel={() => setConfirm(null)}
      />
      <Confirm
        open={confirm?.kind === "publish"}
        title="Publish this case study?"
        body="It goes live on the website and in the sitemap straight away. The next build and upload also adds it to the related service pages."
        confirmLabel="Yes, publish"
        tone="green"
        loading={busy}
        onConfirm={() => confirm && changeStatus(confirm.row, "published")}
        onCancel={() => setConfirm(null)}
      />

      <header className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-center px-4 py-10 sm:py-14">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-2">Case Studies</h1>
        <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
          Write up real client projects. Only facts you can stand behind: no invented numbers, quotes or clients.
        </p>
        <div className="flex items-center justify-center gap-6 mt-5">
          <div><p className="text-2xl font-black text-white">{published.length}</p><p className="text-xs text-gray-400">Published</p></div>
          <div className="w-px h-8 bg-white/20" />
          <div><p className="text-2xl font-black text-amber-400">{drafts.length}</p><p className="text-xs text-gray-400">Drafts</p></div>
        </div>
      </header>

      <nav className="sticky top-0 z-30 bg-white/[0.97] backdrop-blur-md border-b border-black/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.07)]" aria-label="Admin sections">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between">
          <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button type="button" onClick={() => setTab("published")} className={tabCls(tab === "published")}>
              <Globe size={14} /> Published <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: BRAND }}>{published.length}</span>
            </button>
            <button type="button" onClick={() => setTab("drafts")} className={tabCls(tab === "drafts")}>
              <Lock size={13} /> Drafts {drafts.length > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">{drafts.length}</span>}
            </button>
            <button type="button" onClick={startNew} className={tabCls(tab === "edit")}>
              <Plus size={14} /> {editingId ? "Edit Case Study" : "New Case Study"}
            </button>
            <button type="button" onClick={() => router.push("/admin/projects")} className={tabCls(false)}>
              <LayoutGrid size={14} /> Projects
            </button>
            <button type="button" onClick={() => router.push("/admin/blogs")} className={tabCls(false)}>
              <BookOpen size={14} /> Blogs
            </button>
            <button type="button" onClick={() => router.push("/admin/seo")} className={tabCls(false)}>
              <Search size={14} /> SEO
            </button>
          </div>
          <button type="button" onClick={logout} className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-gray-900 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-all shrink-0">
            <LogOut size={15} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      {tab !== "edit" && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
          {backendMissing && (
            <div role="alert" className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl px-4 sm:px-5 py-4 text-sm text-red-900 space-y-1">
              <p className="font-bold flex items-center gap-2"><AlertCircle size={16} aria-hidden="true" /> The backend has not been updated yet</p>
              <p>
                <code className="break-all">{BASE_URL}/api/admin/case-studies</code> returned 404, so this server is still running the old code.
                Deploy the updated <strong>Backend</strong> (routes/caseStudies.js and server.js), then reload this page. The case_studies table is created automatically on start-up.
              </p>
            </div>
          )}

          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl px-4 sm:px-5 py-4 text-sm text-blue-900">
            Publishing puts a case study live on geniemedia.in straight away: it gets its own page, appears on the case studies page and is added to the sitemap.
            The next <strong>npm run build</strong> and upload turns it into a fully pre-built page and adds it to the service pages. Drafts never appear on the website.
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 mb-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <label htmlFor="cs-search" className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Search</label>
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input id="cs-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Client or title…" className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#6B4A2D] outline-none transition" />
              </div>
            </div>
            <button type="button" onClick={startNew} className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-md" style={{ background: BRAND }}>
              <Plus size={15} /> New Case Study
            </button>
          </div>

          {listLoading ? (
            <div className="flex flex-col items-center py-20 gap-3 text-gray-400"><Loader size={32} className="animate-spin" style={{ color: BRAND }} /><p className="text-sm">Loading case studies…</p></div>
          ) : visible.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center px-4">
              <FileText size={44} className="mx-auto text-gray-300 mb-4" aria-hidden="true" />
              <h2 className="text-lg font-bold text-gray-600 mb-2">{tab === "drafts" ? "No drafts" : "No published case studies yet"}</h2>
              <p className="text-sm text-gray-500 mb-6">Start from one of your existing projects and add the real story behind it.</p>
              <button type="button" onClick={startNew} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm" style={{ background: BRAND }}>
                <Plus size={15} /> Create a Case Study
              </button>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visible.map(({ raw, cs }) => {
                const checklist = publishReadiness(cs);
                const done = checklist.filter((c) => c.done).length;
                return (
                  <li key={cs.id} className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col">
                    <div className="relative aspect-video bg-gray-100">
                      {cs.cover && (
                        <img src={cs.cover.url} alt="" className="w-full h-full object-cover object-top" />
                      )}
                      <span className="absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full text-white flex items-center gap-1" style={{ background: cs.status === "draft" ? "#92400e" : BRAND }}>
                        {cs.status === "draft" ? <Lock size={10} /> : <Globe size={10} />} {cs.status === "draft" ? "Draft" : categoryInfo(cs.category).label}
                      </span>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <h2 className="font-bold text-gray-900 leading-snug">{cs.title || "(untitled)"}</h2>
                      <p className="text-xs text-gray-500 mt-1">{cs.clientName} · /case-studies/{cs.slug}</p>
                      <p className={`text-xs font-semibold mt-3 ${done === checklist.length ? "text-green-700" : "text-amber-700"}`}>
                        Publishing checklist: {done}/{checklist.length}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-auto pt-4">
                        <button type="button" onClick={() => startEdit(raw)} className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg font-semibold text-xs">
                          <Edit2 size={12} /> Edit
                        </button>
                        {cs.status === "draft" ? (
                          <button type="button" onClick={() => setConfirm({ kind: "publish", row: raw })} className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 py-2 rounded-lg font-semibold text-xs">
                            <Globe size={12} /> Publish
                          </button>
                        ) : (
                          <button type="button" onClick={() => changeStatus(raw, "draft")} className="flex-1 flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 py-2 rounded-lg font-semibold text-xs">
                            <EyeOff size={12} /> Draft
                          </button>
                        )}
                        {cs.status === "published" && (
                          <a href={caseStudyPath(cs.slug)} target="_blank" rel="noreferrer" aria-label={`View ${cs.title} on the website`} className="flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-xs">
                            <ExternalLink size={12} />
                          </a>
                        )}
                        <button type="button" onClick={() => setConfirm({ kind: "delete", row: raw })} aria-label={`Delete ${cs.title}`} className="flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-xs">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {tab === "edit" && (
        <section className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10" ref={formTopRef}>
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <button type="button" onClick={() => setTab("published")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#6B4A2D] font-semibold">
              <ArrowLeft size={14} /> Back
            </button>
            <ChevronRight size={13} className="text-gray-300" aria-hidden="true" />
            <span className="text-sm font-bold text-gray-700">{editingId ? "Edit Case Study" : "New Case Study"}</span>
            <button type="button" onClick={() => setPreview((p) => !p)} className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border-2 border-gray-200 bg-white hover:border-[#6B4A2D]">
              {preview ? <EyeOff size={14} /> : <Eye size={14} />} {preview ? "Back to the form" : "Preview"}
            </button>
          </div>

          {preview && draftCs ? (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <p className="bg-amber-50 text-amber-800 text-xs font-semibold px-4 py-2">Preview only. This is how the page will look; it is not public.</p>
              <div className="-mt-12">
                <CaseStudyArticle cs={draftCs} preview />
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <Panel title="1. The project" description="Start from an existing portfolio project to reuse its real name, screenshot and website.">
                <Field label="Start from a portfolio project" htmlFor="cs-project" hint="Optional. Links the portfolio card to this case study.">
                  <select id="cs-project" value={form.project_id} onChange={(e) => fillFromProject(e.target.value)} className={inputCls}>
                    <option value="">— Not linked to a project —</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}{p.category ? ` (${p.category})` : ""}</option>
                    ))}
                  </select>
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Client name" required htmlFor="cs-client">
                    <input id="cs-client" className={inputCls} value={form.client_name} placeholder="e.g. KNS Metal Solutions"
                      onChange={(e) => {
                        const v = e.target.value;
                        setForm((f) => ({ ...f, client_name: v, slug: slugTouched ? f.slug : slugify(v) }));
                      }} />
                  </Field>
                  <Field label="Slug (URL)" required htmlFor="cs-slug" hint={`geniemedia.in/case-studies/${form.slug || "…"}`}>
                    <input id="cs-slug" className={inputCls} value={form.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} />
                  </Field>
                </div>
                <Field label="Page title (H1)" required htmlFor="cs-title" hint="Describe the project, e.g. “Business website for an Australian metal fabricator”.">
                  <input id="cs-title" className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} />
                </Field>
                <Field label="Category" required>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Category">
                    {CASE_STUDY_CATEGORIES.map((c) => (
                      <button key={c.id} type="button" role="radio" aria-checked={form.category === c.id} onClick={() => set("category", c.id)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold border-2 transition text-left ${form.category === c.id ? "border-[#6B4A2D] bg-[#6B4A2D] text-white" : "border-gray-200 text-gray-600 hover:border-[#6B4A2D]"}`}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Industry" htmlFor="cs-industry"><input id="cs-industry" className={inputCls} value={form.industry} placeholder="e.g. Jewellery retail" onChange={(e) => set("industry", e.target.value)} /></Field>
                  <Field label="Client location" htmlFor="cs-location" hint="Only the client's real location, e.g. Visakhapatnam or Perth, Australia.">
                    <input id="cs-location" className={inputCls} value={form.location} onChange={(e) => set("location", e.target.value)} />
                  </Field>
                  <Field label="Project completed" htmlFor="cs-date"><input id="cs-date" type="month" className={inputCls} value={form.project_date} onChange={(e) => set("project_date", e.target.value)} /></Field>
                  <Field label="Project type" htmlFor="cs-type"><input id="cs-type" className={inputCls} value={form.project_type} placeholder="e.g. Shopify store build" onChange={(e) => set("project_type", e.target.value)} /></Field>
                  <Field label="Project website" htmlFor="cs-url"><input id="cs-url" type="url" className={inputCls} value={form.website_url} placeholder="https://" onChange={(e) => set("website_url", e.target.value)} /></Field>
                  <Field label="Display order" htmlFor="cs-order" hint="Lower numbers are listed first."><input id="cs-order" type="number" min={0} className={inputCls} value={form.display_order} onChange={(e) => set("display_order", e.target.value)} /></Field>
                </div>
              </Panel>

              <Panel title="2. The story" description="Who the client is, what they needed and how we did it. Leave a blank line between paragraphs.">
                <Field label="Short description" required htmlFor="cs-short" hint="One or two sentences for the card, the page intro and Google’s snippet. 120–160 characters works best.">
                  <textarea id="cs-short" rows={3} className={`${inputCls} resize-y`} value={form.short_description} onChange={(e) => set("short_description", e.target.value)} />
                  <Counter value={form.short_description} max={300} />
                </Field>
                <Field label="Project overview" required htmlFor="cs-overview" hint="Who the client is, what the project was and what we delivered.">
                  <textarea id="cs-overview" rows={6} className={`${inputCls} resize-y`} value={form.overview} onChange={(e) => set("overview", e.target.value)} />
                </Field>
                <Field label="The challenge" htmlFor="cs-challenge" hint="The client's real business problem before the project.">
                  <textarea id="cs-challenge" rows={5} className={`${inputCls} resize-y`} value={form.challenge} onChange={(e) => set("challenge", e.target.value)} />
                </Field>
                <Field label="Project goals" htmlFor="cs-goals">
                  <textarea id="cs-goals" rows={4} className={`${inputCls} resize-y`} value={form.goals} onChange={(e) => set("goals", e.target.value)} />
                </Field>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Our approach <span className="text-red-500">*</span> <span className="font-normal text-gray-500">(only the steps actually performed)</span></p>
                  {form.approach.map((step, i) => (
                    <div key={i} className="rounded-xl border-2 border-gray-100 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">Step {i + 1}</span>
                        <div className="ml-auto flex gap-1">
                          <button type="button" aria-label="Move step up" disabled={i === 0} onClick={() => set("approach", form.approach.map((s, j) => (j === i - 1 ? form.approach[i] : j === i ? form.approach[i - 1] : s)))} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ArrowUp size={14} /></button>
                          <button type="button" aria-label="Move step down" disabled={i === form.approach.length - 1} onClick={() => set("approach", form.approach.map((s, j) => (j === i + 1 ? form.approach[i] : j === i ? form.approach[i + 1] : s)))} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ArrowDown size={14} /></button>
                          <button type="button" aria-label="Remove step" onClick={() => set("approach", form.approach.filter((_, j) => j !== i))} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <input aria-label={`Step ${i + 1} title`} className={inputCls} value={step.title} placeholder="e.g. Research & planning" onChange={(e) => set("approach", form.approach.map((s, j) => (j === i ? { ...s, title: e.target.value } : s)))} />
                      <textarea aria-label={`Step ${i + 1} description`} rows={3} className={`${inputCls} resize-y`} value={step.description} placeholder="What we did in this step" onChange={(e) => set("approach", form.approach.map((s, j) => (j === i ? { ...s, description: e.target.value } : s)))} />
                    </div>
                  ))}
                  <button type="button" onClick={() => set("approach", [...form.approach, { title: "", description: "" }])} className="flex items-center gap-1.5 text-sm font-bold" style={{ color: BRAND }}>
                    <Plus size={14} /> Add a step
                  </button>
                </div>
              </Panel>

              <Panel title="3. What we delivered" description="Only what was actually delivered and actually used.">
                <Field label="Services delivered" hint="Press Enter after each, e.g. Shopify development, SEO setup.">
                  <TagInput tags={form.services} onChange={(t) => set("services", t)} />
                </Field>
                <Field label="Technologies & platforms" hint="e.g. Shopify, WordPress, Next.js, Google Ads.">
                  <TagInput tags={form.technologies} onChange={(t) => set("technologies", t)} />
                </Field>
                <Field label="Deliverables" required htmlFor="cs-deliverables" hint="One per line.">
                  <textarea id="cs-deliverables" rows={5} className={`${inputCls} resize-y`} value={form.deliverables} onChange={(e) => set("deliverables", e.target.value)} />
                </Field>
                <Field label="Features delivered" htmlFor="cs-features" hint="Optional. One per line.">
                  <textarea id="cs-features" rows={4} className={`${inputCls} resize-y`} value={form.features} onChange={(e) => set("features", e.target.value)} />
                </Field>
              </Panel>

              <Panel title="4. Results" description="Measured results need their source. Without measured data, describe the outcomes instead — never estimate.">
                <div className="space-y-3">
                  {form.metrics.map((m, i) => (
                    <div key={i} className="grid gap-2 sm:grid-cols-[1fr_8rem_1.4fr_auto] items-start">
                      <input aria-label="Result label" className={inputCls} value={m.label} placeholder="e.g. Organic sessions" onChange={(e) => set("metrics", form.metrics.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                      <input aria-label="Result value" className={inputCls} value={m.value} placeholder="e.g. +48%" onChange={(e) => set("metrics", form.metrics.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
                      <input aria-label="Where it was measured" className={inputCls} value={m.source} placeholder="e.g. Google Analytics, Jan–Jun 2025 vs 2024" onChange={(e) => set("metrics", form.metrics.map((x, j) => (j === i ? { ...x, source: e.target.value } : x)))} />
                      <button type="button" aria-label="Remove result" onClick={() => set("metrics", form.metrics.filter((_, j) => j !== i))} className="p-3 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => set("metrics", [...form.metrics, { label: "", value: "", source: "" }])} className="flex items-center gap-1.5 text-sm font-bold" style={{ color: BRAND }}>
                    <Plus size={14} /> Add a measured result
                  </button>
                </div>
                <Field label="Project outcomes" htmlFor="cs-outcomes" hint="One per line. Concrete improvements, e.g. “Product catalogue moved to Shopify with 120 products”.">
                  <textarea id="cs-outcomes" rows={4} className={`${inputCls} resize-y`} value={form.outcomes} onChange={(e) => set("outcomes", e.target.value)} />
                </Field>
              </Panel>

              <Panel title="5. Images & video" description="Real screenshots, creatives or photos from the project. Describe each image for people who cannot see it.">
                <Field label="Cover image" required>
                  {form.cover_image ? (
                    <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100">
                      <img src={form.cover_image} alt="" className="w-full max-h-72 object-cover object-top" />
                      <button type="button" aria-label="Remove cover image" onClick={() => setForm((f) => ({ ...f, cover_image: "", cover_width: null, cover_height: null }))} className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center"><X size={14} /></button>
                    </div>
                  ) : null}
                  <label className="mt-2 flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-xl py-4 cursor-pointer hover:border-[#6B4A2D] text-sm font-semibold text-gray-600">
                    {uploading === "cover" ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />} {form.cover_image ? "Replace cover image" : "Upload cover image"}
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={async (e) => {
                      const file = pickFile(e);
                      const up = file && (await upload(file, "cover"));
                      if (up) setForm((f) => ({ ...f, cover_image: up.url, cover_width: up.width, cover_height: up.height }));
                    }} />
                  </label>
                </Field>
                <Field label="Cover image description (alt text)" required htmlFor="cs-cover-alt" hint="Describe what the image shows, e.g. “Home page of the Avantta Gems online store”. Not a keyword list.">
                  <input id="cs-cover-alt" className={inputCls} value={form.cover_alt} maxLength={250} onChange={(e) => set("cover_alt", e.target.value)} />
                </Field>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Gallery <span className="font-normal text-gray-500">(screens, creatives, before/after — caption them “Before” / “After” where useful)</span></p>
                  {form.gallery.map((g, i) => (
                    <div key={g.url} className="grid gap-3 sm:grid-cols-[8rem_1fr_auto] items-start rounded-xl border-2 border-gray-100 p-3">
                      <img src={g.url} alt="" className="w-full sm:w-32 aspect-video object-cover rounded-lg bg-gray-100" />
                      <div className="space-y-2">
                        <input aria-label="Image description (alt text)" className={inputCls} value={g.alt} placeholder="Image description (required)" onChange={(e) => set("gallery", form.gallery.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))} />
                        <input aria-label="Caption" className={inputCls} value={g.caption} placeholder="Caption (optional)" onChange={(e) => set("gallery", form.gallery.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))} />
                      </div>
                      <button type="button" aria-label="Remove image" onClick={() => set("gallery", form.gallery.filter((_, j) => j !== i))} className="p-2 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-xl py-4 cursor-pointer hover:border-[#6B4A2D] text-sm font-semibold text-gray-600">
                    {uploading === "gallery" ? <Loader size={16} className="animate-spin" /> : <ImageIcon size={16} />} Add a gallery image
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={async (e) => {
                      const file = pickFile(e);
                      const up = file && (await upload(file, "gallery"));
                      if (up) setForm((f) => ({ ...f, gallery: [...f.gallery, { url: up.url, alt: "", caption: "", width: up.width, height: up.height }] }));
                    }} />
                  </label>
                </div>

                <Field label="Project video" htmlFor="cs-video" hint="Optional. A YouTube or Vimeo link to real project footage. It loads only when scrolled to.">
                  <input id="cs-video" type="url" className={inputCls} value={form.video_url} placeholder="https://www.youtube.com/watch?v=…" onChange={(e) => set("video_url", e.target.value)} />
                </Field>
                <Field label="Client logo" hint="Optional.">
                  <div className="flex items-center gap-3">
                    {form.client_logo && (
                      <img src={form.client_logo} alt="" className="h-12 w-auto rounded bg-gray-50" />
                    )}
                    <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#6B4A2D] text-sm font-semibold text-gray-600">
                      {uploading === "logo" ? <Loader size={14} className="animate-spin" /> : <Upload size={14} />} {form.client_logo ? "Replace" : "Upload logo"}
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={async (e) => {
                        const file = pickFile(e);
                        const up = file && (await upload(file, "logo"));
                        if (up) set("client_logo", up.url);
                      }} />
                    </label>
                    {form.client_logo && <button type="button" onClick={() => set("client_logo", "")} className="text-xs text-red-600 font-semibold">Remove</button>}
                  </div>
                </Field>
              </Panel>

              <Panel title="6. Client testimonial" description="Only a quote the client actually gave you, in their own words. Leave empty otherwise.">
                <Field label="Quote" htmlFor="cs-quote">
                  <textarea id="cs-quote" rows={4} className={`${inputCls} resize-y`} value={form.testimonial} onChange={(e) => set("testimonial", e.target.value)} />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Name" htmlFor="cs-quote-name"><input id="cs-quote-name" className={inputCls} value={form.testimonial_author} onChange={(e) => set("testimonial_author", e.target.value)} /></Field>
                  <Field label="Role / company" htmlFor="cs-quote-role"><input id="cs-quote-role" className={inputCls} value={form.testimonial_role} onChange={(e) => set("testimonial_role", e.target.value)} /></Field>
                </div>
                {form.testimonial.trim() && (
                  <label className="flex items-start gap-2 text-sm text-gray-700">
                    <input type="checkbox" className="mt-1" checked={form.testimonial_confirmed} onChange={(e) => set("testimonial_confirmed", e.target.checked)} />
                    The client gave this testimonial and agreed to it being published.
                  </label>
                )}
              </Panel>

              <Panel title="7. Related content" description="Link only what is genuinely related.">
                <Field label="Related services" hint="Defaults to the category's service page when none are ticked.">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(Object.keys(SERVICE_PAGES) as ServicePagePath[]).map((path) => (
                      <label key={path} className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={form.related_services.includes(path)} onChange={(e) => set("related_services", e.target.checked ? [...form.related_services, path] : form.related_services.filter((p) => p !== path))} />
                        {SERVICE_PAGES[path].name}
                      </label>
                    ))}
                  </div>
                </Field>
                <Field label="Related blog articles" hint={blogs.length ? "Pick up to 6." : "No published articles found."}>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {blogs.map((b) => (
                      <label key={b.permalink} className="flex items-start gap-2 text-sm text-gray-700">
                        <input type="checkbox" className="mt-1" checked={form.related_blogs.includes(b.permalink)} disabled={!form.related_blogs.includes(b.permalink) && form.related_blogs.length >= 6}
                          onChange={(e) => set("related_blogs", e.target.checked ? [...form.related_blogs, b.permalink] : form.related_blogs.filter((p) => p !== b.permalink))} />
                        <span>{b.title}{b.category && <span className="text-gray-400"> · {b.category}</span>}</span>
                      </label>
                    ))}
                  </div>
                </Field>
              </Panel>

              <Panel title="8. Search & sharing" description="Optional. Leave empty to use “[Client] [Service] Case Study | Genie Media & Studio” and the short description.">
                <Field label="SEO title" htmlFor="cs-seo-title">
                  <input id="cs-seo-title" className={inputCls} maxLength={70} value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} />
                  <Counter value={form.seo_title} max={60} />
                </Field>
                <Field label="Meta description" htmlFor="cs-seo-desc">
                  <textarea id="cs-seo-desc" rows={3} maxLength={170} className={`${inputCls} resize-y`} value={form.seo_description} onChange={(e) => set("seo_description", e.target.value)} />
                  <Counter value={form.seo_description} max={160} />
                </Field>
                <Field label="Social share image" hint="Optional. 1200×630 works best. Defaults to the cover image.">
                  <div className="flex items-center gap-3">
                    {form.og_image && (
                      <img src={form.og_image} alt="" className="h-14 w-auto rounded bg-gray-50" />
                    )}
                    <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#6B4A2D] text-sm font-semibold text-gray-600">
                      {uploading === "og" ? <Loader size={14} className="animate-spin" /> : <Upload size={14} />} {form.og_image ? "Replace" : "Upload"}
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={async (e) => {
                        const file = pickFile(e);
                        const up = file && (await upload(file, "og"));
                        if (up) set("og_image", up.url);
                      }} />
                    </label>
                    {form.og_image && <button type="button" onClick={() => set("og_image", "")} className="text-xs text-red-600 font-semibold">Remove</button>}
                  </div>
                </Field>
              </Panel>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-7 space-y-4">
                <h3 className="text-base font-extrabold text-gray-900">Publishing checklist</h3>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {readiness.map((r) => (
                    <li key={r.label} className={`flex items-center gap-2 text-sm ${r.done ? "text-green-700" : "text-gray-500"}`}>
                      {r.done ? <CheckCircle size={15} /> : <AlertCircle size={15} />} {r.label}
                    </li>
                  ))}
                </ul>
                {blockers.length > 0 && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                    <p className="font-bold mb-1">The server needs these before publishing:</p>
                    <ul className="list-disc pl-5 space-y-0.5">{blockers.map((b) => <li key={b}>{b}</li>)}</ul>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button type="button" disabled={Boolean(saving)} onClick={() => save("draft")} className="flex-1 py-3.5 rounded-xl font-extrabold text-sm border-2 border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-800 disabled:opacity-60 flex items-center justify-center gap-2">
                    {saving === "draft" ? <Loader size={15} className="animate-spin" /> : <Lock size={14} />} Save as Draft
                  </button>
                  <button type="button" disabled={Boolean(saving) || !ready} onClick={() => save("published")} className="flex-1 py-3.5 rounded-xl font-extrabold text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" style={{ background: BRAND }}>
                    {saving === "published" ? <Loader size={15} className="animate-spin" /> : <Globe size={14} />} {editingId ? "Save & Publish" : "Publish"}
                  </button>
                </div>
                {!ready && <p className="text-xs text-gray-500">Publishing unlocks when every checklist item is done. You can save a draft at any time.</p>}
              </div>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
