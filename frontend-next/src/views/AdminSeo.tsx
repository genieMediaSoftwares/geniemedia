"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle, AlertTriangle, ArrowDown, ArrowLeft, ArrowUp, BookOpen, CheckCircle, Download, Edit2, Eye, FileText, Gauge,
  Globe, History, KeyRound, LayoutGrid, Loader, LogOut, MapPin, Plus, Save, Search, Trash2, Upload, X,
} from "lucide-react";

import BASE_URL from "@/Api";
import { clearToken, getToken } from "@/lib/auth";
import { arr, isRecord, num, str, type RawRecord } from "@/lib/api/coerce";
import { analyzePageHealth, type HealthKeyword, type HealthPage, type HealthReport, type KeywordType, type SearchIntent } from "@/lib/seo/keywordHealth";
import { applyDraft, snapshotFromHtml } from "@/lib/seo/pageSnapshot";
import { SEO_TAXONOMY } from "@/content/seoTaxonomy";
import TagInput from "@/components/TagInput";

const BRAND = "#6B4A2D";
const KEYWORD_TYPES: KeywordType[] = ["PRIMARY", "SECONDARY", "RELATED", "LONG_TAIL", "LOCAL", "QUESTION", "SEMANTIC"];
const INTENTS: SearchIntent[] = ["INFORMATIONAL", "COMMERCIAL", "TRANSACTIONAL", "NAVIGATIONAL", "LOCAL"];
const PRIORITIES = ["HIGH", "MEDIUM", "LOW"] as const;
const inputCls =
  "w-full px-3.5 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-[#6B4A2D] focus:ring-4 focus:ring-[#6B4A2D]/10 outline-none transition";

interface SeoConfig {
  primaryTopic: string;
  secondaryTopics: string[];
  targetLocations: string[];
  seoTitle: string;
  metaDescription: string;
  preferredH1: string;
  sections: Array<{ heading: string; body: string }>;
  contentTopics: string[];
  faqTopics: string[];
  internalLinks: Array<{ label: string; href: string }>;
  imageAltSuggestions: Array<{ image: string; alt: string }>;
  canonicalUrl: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
}

interface PageRow {
  id: number;
  path: string;
  name: string;
  activeKeywords: number;
  archivedKeywords: number;
  hasDraft: boolean;
  published: SeoConfig | null;
  publishedAt: number | null;
  draftUpdatedAt: number | null;
  lastUpdated: number | null;
}

interface Keyword {
  id: number;
  page_id: number;
  keyword: string;
  keyword_type: KeywordType;
  search_intent: SearchIntent;
  location: string | null;
  priority: string;
  status: "ACTIVE" | "ARCHIVED";
  notes: string | null;
  warnings: string[];
}

interface LocationRow {
  id: number;
  name: string;
  aliases: string[];
  region: string | null;
  is_primary: number;
}

interface Clash {
  keyword: string;
  pages: string[];
  kind: string;
}

interface PageDetail {
  page: { id: number; path: string; name: string };
  draft: SeoConfig | null;
  published: SeoConfig | null;
  publishedAt: number | null;
  keywords: Keyword[];
  audit: RawRecord[];
  history: RawRecord[];
  locations: LocationRow[];
  warnings: Clash[];
}

const EMPTY: SeoConfig = {
  primaryTopic: "",
  secondaryTopics: [],
  targetLocations: [],
  seoTitle: "",
  metaDescription: "",
  preferredH1: "",
  sections: [],
  contentTopics: [],
  faqTopics: [],
  internalLinks: [],
  imageAltSuggestions: [],
  canonicalUrl: "",
  robotsIndex: true,
  robotsFollow: true,
};

const asConfig = (v: unknown): SeoConfig | null => (isRecord(v) ? { ...EMPTY, ...(v as Partial<SeoConfig>) } : null);
const when = (ts: number | null | undefined) =>
  ts ? new Date(Number(ts)).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }) : "—";

const TIER_MAP: Record<string, { type: KeywordType; intent: SearchIntent; priority: string }> = {
  primary: { type: "PRIMARY", intent: "COMMERCIAL", priority: "HIGH" },
  secondary: { type: "SECONDARY", intent: "COMMERCIAL", priority: "MEDIUM" },
  semantic: { type: "SEMANTIC", intent: "INFORMATIONAL", priority: "LOW" },
  local: { type: "LOCAL", intent: "LOCAL", priority: "HIGH" },
  supporting: { type: "RELATED", intent: "NAVIGATIONAL", priority: "LOW" },
};

const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

const toHealthKeywords = (ks: Keyword[]): HealthKeyword[] =>
  ks.map((k) => ({ keyword: k.keyword, type: k.keyword_type, intent: k.search_intent, active: k.status === "ACTIVE" }));

const scoreColor = (s: number) => (s >= 85 ? "text-green-700 bg-green-50" : s >= 70 ? "text-amber-700 bg-amber-50" : "text-red-700 bg-red-50");

function Counter({ value, min, max }: { value: string; min: number; max: number }) {
  const n = value.length;
  const tone = !n ? "text-gray-400" : n < min || n > max ? "text-red-600 font-bold" : "text-green-700";
  return <span className={`text-xs ${tone}`}>{n} characters (aim for {min}–{max})</span>;
}

function Card({ title, icon: Icon, children, action }: { title: string; icon?: React.ElementType; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} style={{ color: BRAND }} aria-hidden="true" />}
        <h3 className="text-base font-extrabold text-gray-900">{title}</h3>
        {action && <div className="ml-auto">{action}</div>}
      </div>
      {children}
    </section>
  );
}

function Label({ htmlFor, children, hint }: { htmlFor?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-gray-700">{children}</label>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function HealthBadge({ report }: { report: HealthReport | null | undefined }) {
  if (!report) return <span className="text-xs text-gray-400">—</span>;
  return <span className={`text-sm font-black px-2.5 py-1 rounded-lg ${scoreColor(report.score)}`}>{report.score}/100</span>;
}

function Snippet({ title, description, url }: { title: string; description: string; url: string }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-white">
      <p className="text-xs text-gray-600 truncate">{url}</p>
      <p className="text-lg text-[#1a0dab] leading-snug mt-1 line-clamp-2">{title || "(no title)"}</p>
      <p className="text-sm text-gray-600 mt-1 line-clamp-3">{description || "(no description)"}</p>
    </div>
  );
}

export default function AdminSeo() {
  const router = useRouter();
  const token = getToken();

  const [pages, setPages] = useState<PageRow[]>([]);
  const [clashes, setClashes] = useState<Clash[]>([]);
  const [allKeywords, setAllKeywords] = useState<Keyword[]>([]);
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [snapshots, setSnapshots] = useState<Record<string, HealthPage | null>>({});
  const [buildInfo, setBuildInfo] = useState<{ builtAt: number; serviceSeo: Record<string, number | null> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendMissing, setBackendMissing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const [selected, setSelected] = useState<number | null>(null);
  const [detail, setDetail] = useState<PageDetail | null>(null);
  const [tab, setTab] = useState<"config" | "keywords" | "preview" | "history">("config");
  const [form, setForm] = useState<SeoConfig>(EMPTY);
  const [problems, setProblems] = useState<string[]>([]);
  const [busy, setBusy] = useState("");

  const say = useCallback((msg: string, ok = true) => setToast({ msg, ok }), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const api = useCallback(
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

  const json = useCallback(
    async (path: string, method = "GET", body?: unknown) => {
      const res = await api(path, body === undefined ? { method } : { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = (await res.json().catch(() => null)) as RawRecord | null;
      return { res, data };
    },
    [api]
  );

  const fetchOverview = useCallback(async () => {
    const [ov, kw, loc] = await Promise.all([json("/api/admin/seo/overview"), json("/api/admin/seo/keywords"), json("/api/admin/seo/locations")]);
    if (ov.res.status === 404) throw new Error("backend-missing");
    if (!ov.res.ok || !ov.data) throw new Error(`HTTP ${ov.res.status}`);
    return {
      pages: arr(ov.data.pages).filter(isRecord).map((p) => ({ ...(p as unknown as PageRow), published: asConfig(p.published) })),
      clashes: arr(ov.data.warnings).filter(isRecord) as unknown as Clash[],
      keywords: (Array.isArray(kw.data) ? kw.data : []) as Keyword[],
      locations: (Array.isArray(loc.data) ? loc.data : []) as LocationRow[],
    };
  }, [json]);

  const applyOverview = useCallback((o: Awaited<ReturnType<typeof fetchOverview>>) => {
    setBackendMissing(false);
    setPages(o.pages);
    setClashes(o.clashes);
    setAllKeywords(o.keywords);
    setLocations(o.locations);
  }, []);

  const loadSnapshots = useCallback(async (paths: string[]) => {
    const entries = await Promise.all(
      paths.map(async (p) => {
        try {
          const res = await fetch(p, { headers: { Accept: "text/html" }, cache: "no-store" });
          return [p, res.ok ? snapshotFromHtml(await res.text()) : null] as const;
        } catch {
          return [p, null] as const;
        }
      })
    );
    setSnapshots((s) => ({ ...s, ...Object.fromEntries(entries) }));
  }, []);

  const refresh = useCallback(async () => {
    try {
      applyOverview(await fetchOverview());
    } catch (err) {
      if (err instanceof Error && err.message === "backend-missing") setBackendMissing(true);
    }
  }, [fetchOverview, applyOverview]);

  useEffect(() => {
    fetchOverview()
      .then((o) => {
        applyOverview(o);
        return loadSnapshots(o.pages.map((p) => p.path));
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.message === "backend-missing") setBackendMissing(true);
        else if (!(err instanceof Error && err.message === "Session expired")) say("Could not load the SEO manager. Check your connection.", false);
      })
      .finally(() => setLoading(false));
    fetch("/build-info.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: unknown) => {
        if (isRecord(d) && num(d.builtAt)) setBuildInfo({ builtAt: num(d.builtAt) as number, serviceSeo: (isRecord(d.serviceSeo) ? d.serviceSeo : {}) as Record<string, number | null> });
      })
      .catch(() => {});
  }, [fetchOverview, applyOverview, loadSnapshots, say]);

  const locationList = useMemo(() => locations.map((l) => ({ name: l.name, aliases: l.aliases || [] })), [locations]);

  const healthFor = useCallback(
    (p: PageRow): HealthReport | null => {
      const snap = snapshots[p.path];
      if (!snap) return null;
      const cfg = p.published ?? EMPTY;
      const own = allKeywords.filter((k) => k.page_id === p.id);
      return analyzePageHealth(snap, cfg, toHealthKeywords(own), locationList, {
        cannibalized: clashes.filter((c) => c.pages.includes(p.name)).map((c) => c.keyword),
      });
    },
    [snapshots, allKeywords, locationList, clashes]
  );

  const siteStatus = (p: PageRow): { label: string; tone: string } => {
    if (!p.published) return { label: "Using built-in settings", tone: "bg-gray-100 text-gray-700" };
    const built = buildInfo?.serviceSeo?.[p.path];
    if (buildInfo && built && p.publishedAt && built >= p.publishedAt) return { label: "Live on the website", tone: "bg-green-100 text-green-800" };
    return { label: "Published — goes live after the next build & upload", tone: "bg-amber-100 text-amber-800" };
  };

  const openPage = async (id: number) => {
    setSelected(id);
    setBusy("page");
    try {
      const { res, data } = await json(`/api/admin/seo/pages/${id}`);
      if (!res.ok || !data) throw new Error(`HTTP ${res.status}`);
      const d: PageDetail = {
        page: data.page as PageDetail["page"],
        draft: asConfig(data.draft),
        published: asConfig(data.published),
        publishedAt: num(data.publishedAt),
        keywords: arr(data.keywords) as Keyword[],
        audit: arr(data.audit).filter(isRecord),
        history: arr(data.history).filter(isRecord),
        locations: arr(data.locations) as LocationRow[],
        warnings: arr(data.warnings) as Clash[],
      };
      setDetail(d);
      setForm(d.draft ?? d.published ?? EMPTY);
      setProblems([]);
      if (snapshots[d.page.path] === undefined) loadSnapshots([d.page.path]);
    } catch {
      say("Could not load this page's SEO settings.", false);
    } finally {
      setBusy("");
    }
  };

  const reloadDetail = async () => {
    if (selected) await openPage(selected);
    await refresh();
  };

  const set = <K extends keyof SeoConfig>(k: K, v: SeoConfig[K]) => setForm((f) => ({ ...f, [k]: v }));

  const fillFromLivePage = () => {
    if (!detail) return;
    const snap = snapshots[detail.page.path];
    if (!snap) return say("The live page could not be read yet.", false);
    setForm((f) => ({
      ...f,
      seoTitle: f.seoTitle || snap.title,
      metaDescription: f.metaDescription || snap.description,
      preferredH1: f.preferredH1 || snap.h1s[0] || "",
      primaryTopic: f.primaryTopic || detail.keywords.find((k) => k.keyword_type === "PRIMARY" && k.status === "ACTIVE")?.keyword || "",
      secondaryTopics: f.secondaryTopics.length ? f.secondaryTopics : detail.keywords.filter((k) => k.keyword_type === "SECONDARY" && k.status === "ACTIVE").map((k) => k.keyword).slice(0, 10),
    }));
    say("Filled empty fields from the live page. Review them before saving.");
  };

  const saveDraft = async () => {
    if (!detail) return;
    setBusy("draft");
    try {
      const { res, data } = await json(`/api/admin/seo/pages/${detail.page.id}/draft`, "PUT", form);
      if (!res.ok) return say((data && str(data.message)) || "Could not save the draft.", false);
      setProblems(arr(data?.problems).map(String));
      say("Draft saved. It does not change the website until you publish.");
      await reloadDetail();
    } finally {
      setBusy("");
    }
  };

  const publish = async () => {
    if (!detail) return;
    setBusy("publish");
    try {
      const saved = await json(`/api/admin/seo/pages/${detail.page.id}/draft`, "PUT", form);
      if (!saved.res.ok) return say("Could not save the draft before publishing.", false);
      const { res, data } = await json(`/api/admin/seo/pages/${detail.page.id}/publish`, "POST", {});
      if (!res.ok) {
        setProblems(arr(data?.problems).map(String));
        return say((data && str(data.message)) || "Could not publish.", false);
      }
      setProblems([]);
      say("Published. It reaches the website with the next build & upload.");
      await reloadDetail();
    } finally {
      setBusy("");
    }
  };

  const unpublish = async () => {
    if (!detail || !window.confirm("Unpublish this configuration? The page falls back to the previous published version or its built-in settings.")) return;
    setBusy("unpublish");
    try {
      const { res, data } = await json(`/api/admin/seo/pages/${detail.page.id}/unpublish`, "POST", {});
      say((data && str(data.message)) || (res.ok ? "Unpublished." : "Could not unpublish."), res.ok);
      await reloadDetail();
    } finally {
      setBusy("");
    }
  };

  const logout = () => {
    clearToken();
    router.push("/admin");
  };

  const tabBtn = (active: boolean) =>
    `flex items-center gap-1.5 px-3 sm:px-5 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${active ? "border-[#6B4A2D] text-[#6B4A2D]" : "border-transparent text-gray-500 hover:text-gray-800"}`;

  const publishedCount = pages.filter((p) => p.published).length;
  const activeCount = allKeywords.filter((k) => k.status === "ACTIVE").length;
  const lastUpdated = Math.max(0, ...pages.map((p) => p.lastUpdated || 0));
  const reports = Object.fromEntries(pages.map((p) => [p.id, healthFor(p)]));
  const dashboardWarnings = [
    ...clashes.map((c) => `Keyword overlap: “${c.keyword}” is a ${c.kind} on ${c.pages.join(" and ")}.`),
    ...pages.flatMap((p) => (reports[p.id]?.warnings || []).slice(0, 3).map((w) => `${p.name}: ${w}`)),
  ];

  return (
    <div className="w-full min-h-screen bg-[#F7F6F3] overflow-x-hidden font-sans pt-20">
      {toast && (
        <div role="status" className={`fixed bottom-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border max-w-[calc(100vw-2rem)] ${toast.ok ? "bg-green-50 border-green-300 text-green-800" : "bg-red-50 border-red-300 text-red-800"}`}>
          {toast.ok ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="font-semibold text-sm">{toast.msg}</span>
          <button type="button" aria-label="Dismiss" onClick={() => setToast(null)}><X size={15} /></button>
        </div>
      )}

      <header className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-center px-4 py-10">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-2">SEO Keyword Manager</h1>
        <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto">
          Plan keywords and approve page metadata, headings and sections. Keywords guide the content you write; they are never inserted into the website automatically.
        </p>
      </header>

      <nav className="sticky top-0 z-30 bg-white/[0.97] backdrop-blur-md border-b border-black/[0.07]" aria-label="Admin sections">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between">
          <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button type="button" onClick={() => { setSelected(null); setDetail(null); }} className={tabBtn(selected === null)}><Gauge size={14} /> SEO Overview</button>
            <button type="button" onClick={() => router.push("/admin/blogs")} className={tabBtn(false)}><BookOpen size={14} /> Blogs</button>
            <button type="button" onClick={() => router.push("/admin/projects")} className={tabBtn(false)}><LayoutGrid size={14} /> Projects</button>
            <button type="button" onClick={() => router.push("/admin/case-studies")} className={tabBtn(false)}><FileText size={14} /> Case Studies</button>
          </div>
          <button type="button" onClick={logout} className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-gray-900 hover:bg-red-600 text-white rounded-xl font-semibold text-sm shrink-0">
            <LogOut size={15} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6">
        {backendMissing && (
          <div role="alert" className="bg-red-50 border-2 border-red-200 rounded-2xl px-5 py-4 text-sm text-red-900">
            <p className="font-bold flex items-center gap-2"><AlertCircle size={16} aria-hidden="true" /> The backend has not been updated yet</p>
            <p className="mt-1"><code className="break-all">{BASE_URL}/api/admin/seo/overview</code> returned 404. Deploy the updated Backend (routes/seoManager.js and server.js), then reload. The tables are created automatically.</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3 text-gray-400"><Loader size={32} className="animate-spin" style={{ color: BRAND }} /><p className="text-sm">Loading…</p></div>
        ) : selected === null ? (
          <Dashboard
            pages={pages}
            reports={reports}
            stats={{ publishedCount, activeCount, lastUpdated, primaryTopics: pages.filter((p) => p.published?.primaryTopic).length }}
            warnings={dashboardWarnings}
            buildInfo={buildInfo}
            siteStatus={siteStatus}
            onOpen={openPage}
            json={json}
            onChanged={refresh}
            locations={locations}
            say={say}
          />
        ) : !detail ? (
          <div className="flex justify-center py-20"><Loader size={28} className="animate-spin" style={{ color: BRAND }} /></div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => { setSelected(null); setDetail(null); }} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#6B4A2D] font-semibold"><ArrowLeft size={14} /> All pages</button>
              <h2 className="text-xl font-extrabold text-gray-900">{detail.page.name}</h2>
              <code className="text-xs text-gray-500">{detail.page.path}</code>
              {(() => {
                const row = pages.find((p) => p.id === detail.page.id);
                const s = row ? siteStatus(row) : null;
                return s ? <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.tone}`}>{s.label}</span> : null;
              })()}
            </div>

            {detail.warnings.length > 0 && (
              <div role="alert" className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-900 space-y-1">
                {detail.warnings.map((w) => (
                  <p key={w.keyword + w.kind} className="flex items-start gap-2"><AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden="true" /> WARNING: “{w.keyword}” is already assigned as a {w.kind} to {w.pages.filter((n) => n !== detail.page.name).join(", ")}. Competing pages can split rankings.</p>
                ))}
              </div>
            )}

            <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
              {([["config", "Configuration", Edit2], ["keywords", `Keywords (${detail.keywords.length})`, KeyRound], ["preview", "Preview & Health", Eye], ["history", "History", History]] as const).map(([id, label, Icon]) => (
                <button key={id} type="button" onClick={() => setTab(id)} className={tabBtn(tab === id)}><Icon size={14} /> {label}</button>
              ))}
            </div>

            {tab === "config" && (
              <ConfigEditor
                form={form}
                set={set}
                locations={detail.locations}
                problems={problems}
                busy={busy}
                hasPublished={Boolean(detail.published)}
                onFillFromLive={fillFromLivePage}
                onSave={saveDraft}
                onPublish={publish}
                onUnpublish={unpublish}
              />
            )}
            {tab === "keywords" && <KeywordManager detail={detail} json={json} api={api} onChanged={reloadDetail} say={say} />}
            {tab === "preview" && (
              <PreviewPanel detail={detail} form={form} snapshot={snapshots[detail.page.path] ?? null} locations={locationList} />
            )}
            {tab === "history" && <HistoryPanel detail={detail} />}
          </>
        )}
      </main>
    </div>
  );
}

type JsonFn = (path: string, method?: string, body?: unknown) => Promise<{ res: Response; data: RawRecord | null }>;

function Dashboard({
  pages, reports, stats, warnings, buildInfo, siteStatus, onOpen, json, onChanged, locations, say,
}: {
  pages: PageRow[];
  reports: Record<number, HealthReport | null>;
  stats: { publishedCount: number; activeCount: number; lastUpdated: number; primaryTopics: number };
  warnings: string[];
  buildInfo: { builtAt: number } | null;
  siteStatus: (p: PageRow) => { label: string; tone: string };
  onOpen: (id: number) => void;
  json: JsonFn;
  onChanged: () => Promise<void>;
  locations: LocationRow[];
  say: (m: string, ok?: boolean) => void;
}) {
  const [newPath, setNewPath] = useState("");
  const [newName, setNewName] = useState("");
  const [loc, setLoc] = useState({ name: "", aliases: "", region: "" });

  const addPage = async () => {
    const { res, data } = await json("/api/admin/seo/pages", "POST", { path: newPath.trim(), name: newName.trim() });
    say((data && str(data.message)) || (res.ok ? "Page added." : "Could not add the page."), res.ok);
    if (res.ok) {
      setNewPath("");
      setNewName("");
      await onChanged();
    }
  };

  const addLocation = async () => {
    const { res, data } = await json("/api/admin/seo/locations", "POST", { name: loc.name, aliases: loc.aliases.split(",").map((a) => a.trim()).filter(Boolean), region: loc.region });
    say((data && str(data.message)) || (res.ok ? "Location added." : "Could not add the location."), res.ok);
    if (res.ok) {
      setLoc({ name: "", aliases: "", region: "" });
      await onChanged();
    }
  };

  const removeLocation = async (l: LocationRow) => {
    if (!window.confirm(`Delete the location “${l.name}”?`)) return;
    const { res, data } = await json(`/api/admin/seo/locations/${l.id}`, "DELETE");
    say((data && str(data.message)) || (res.ok ? "Location deleted." : "Could not delete."), res.ok);
    if (res.ok) await onChanged();
  };

  const stat = (label: string, value: React.ReactNode) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stat("Pages", pages.length)}
        {stat("Published configs", stats.publishedCount)}
        {stat("Primary topics", stats.primaryTopics)}
        {stat("Active keywords", stats.activeCount)}
        {stat("Warnings", warnings.length)}
        {stat("Last SEO update", <span className="text-sm">{when(stats.lastUpdated || null)}</span>)}
      </div>

      <Card title="Service SEO health" icon={Gauge}>
        <p className="text-xs text-gray-500">
          Scored from the live page against its keywords and published configuration: topic and semantic coverage, intent, title, H1, H2s, internal links, local relevance, completeness and metadata. Keyword count is not a target.
        </p>
        <ul className="divide-y divide-gray-100">
          {pages.map((p) => {
            const s = siteStatus(p);
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.path} · {p.activeKeywords} active keywords{p.hasDraft ? " · draft saved" : ""}</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.tone}`}>{s.label}</span>
                <HealthBadge report={reports[p.id]} />
                <button type="button" onClick={() => onOpen(p.id)} className="px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ background: BRAND }}>Manage</button>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-gray-500">
          Last website build: {buildInfo ? when(buildInfo.builtAt) : "unknown (open this page on geniemedia.in to see it)"} · Sitemap: generated live by sitemap.php · Index status: not available (no Search Console connection). Changing keywords never re-submits URLs to Google.
        </p>
      </Card>

      <Card title="Warnings" icon={AlertTriangle}>
        {warnings.length ? (
          <ul className="space-y-1.5 text-sm text-gray-700">{warnings.map((w) => <li key={w} className="flex gap-2"><AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" aria-hidden="true" />{w}</li>)}</ul>
        ) : (
          <p className="text-sm text-green-700">No warnings.</p>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Add a page" icon={Plus}>
          <p className="text-xs text-gray-500">For a future service page such as /google_ads. The page itself still has to be built; this only registers it for SEO planning and metadata.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input aria-label="Page path" className={inputCls} placeholder="/google_ads" value={newPath} onChange={(e) => setNewPath(e.target.value)} />
            <input aria-label="Page name" className={inputCls} placeholder="Google Ads" value={newName} onChange={(e) => setNewName(e.target.value)} />
          </div>
          <button type="button" onClick={addPage} className="px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ background: BRAND }}>Add page</button>
        </Card>

        <Card title="Locations" icon={MapPin}>
          <ul className="space-y-2 text-sm">
            {locations.map((l) => (
              <li key={l.id} className="flex items-center gap-2">
                <span className="font-semibold">{l.name}</span>
                {l.aliases?.length > 0 && <span className="text-gray-500">aka {l.aliases.join(", ")}</span>}
                {l.region && <span className="text-gray-400">· {l.region}</span>}
                {l.is_primary ? <span className="text-xs font-bold text-green-700">primary</span> : (
                  <button type="button" aria-label={`Delete ${l.name}`} onClick={() => removeLocation(l)} className="ml-auto text-red-600"><Trash2 size={14} /></button>
                )}
              </li>
            ))}
          </ul>
          <div className="grid gap-2 sm:grid-cols-3">
            <input aria-label="Location name" className={inputCls} placeholder="Name" value={loc.name} onChange={(e) => setLoc({ ...loc, name: e.target.value })} />
            <input aria-label="Aliases" className={inputCls} placeholder="Aliases, comma separated" value={loc.aliases} onChange={(e) => setLoc({ ...loc, aliases: e.target.value })} />
            <input aria-label="Region" className={inputCls} placeholder="Region" value={loc.region} onChange={(e) => setLoc({ ...loc, region: e.target.value })} />
          </div>
          <button type="button" onClick={addLocation} className="px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ background: BRAND }}>Add location</button>
          <p className="text-xs text-gray-500">Locations are used only to check local relevance and repetition. No pages are generated per location.</p>
        </Card>
      </div>
    </div>
  );
}

function ConfigEditor({
  form, set, locations, problems, busy, hasPublished, onFillFromLive, onSave, onPublish, onUnpublish,
}: {
  form: SeoConfig;
  set: <K extends keyof SeoConfig>(k: K, v: SeoConfig[K]) => void;
  locations: LocationRow[];
  problems: string[];
  busy: string;
  hasPublished: boolean;
  onFillFromLive: () => void;
  onSave: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
}) {
  const move = <T,>(items: T[], i: number, d: number): T[] => {
    const j = i + d;
    if (j < 0 || j >= items.length) return items;
    const copy = [...items];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    return copy;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onFillFromLive} className="px-4 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm font-bold hover:border-[#6B4A2D]">Fill empty fields from the live page</button>
      </div>

      <Card title="Topic & location">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="seo-primary" hint="The one main topic of this page.">Primary topic</Label>
            <input id="seo-primary" className={inputCls} value={form.primaryTopic} onChange={(e) => set("primaryTopic", e.target.value)} placeholder="digital marketing" />
          </div>
          <div className="space-y-1.5">
            <Label hint="Used to check local relevance, never repeated automatically.">Target locations</Label>
            <div className="flex flex-wrap gap-3">
              {locations.map((l) => (
                <label key={l.id} className="flex items-center gap-1.5 text-sm">
                  <input type="checkbox" checked={form.targetLocations.includes(l.name)} onChange={(e) => set("targetLocations", e.target.checked ? [...form.targetLocations, l.name] : form.targetLocations.filter((x) => x !== l.name))} />
                  {l.name}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label hint="Supporting topics the page should cover. Used for H2 coverage and suggestions.">Secondary topics</Label>
          <TagInput tags={form.secondaryTopics} onChange={(t) => set("secondaryTopics", t)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label hint="Topics the page should genuinely cover (coverage check only).">Content topics</Label>
            <TagInput tags={form.contentTopics} onChange={(t) => set("contentTopics", t)} />
          </div>
          <div className="space-y-1.5">
            <Label hint="Questions customers ask. Suggestions only; FAQs on the page stay as written.">FAQ topics</Label>
            <TagInput tags={form.faqTopics} onChange={(t) => set("faqTopics", t)} />
          </div>
        </div>
      </Card>

      <Card title="Metadata & H1">
        <div className="space-y-1.5">
          <Label htmlFor="seo-title" hint="Natural phrase people would click. Location at most once.">SEO title</Label>
          <input id="seo-title" className={inputCls} value={form.seoTitle} maxLength={80} onChange={(e) => set("seoTitle", e.target.value)} />
          <Counter value={form.seoTitle} min={30} max={60} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="seo-desc">Meta description</Label>
          <textarea id="seo-desc" rows={3} className={`${inputCls} resize-y`} value={form.metaDescription} maxLength={200} onChange={(e) => set("metaDescription", e.target.value)} />
          <Counter value={form.metaDescription} min={120} max={160} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="seo-h1" hint="Replaces the visible H1 at the top of the page. Leave empty to keep the current H1.">H1 heading</Label>
          <input id="seo-h1" className={inputCls} value={form.preferredH1} maxLength={120} onChange={(e) => set("preferredH1", e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3 items-end">
          <div className="space-y-1.5 sm:col-span-1">
            <Label htmlFor="seo-canonical" hint="Leave empty for the page's own URL.">Canonical URL</Label>
            <input id="seo-canonical" className={inputCls} value={form.canonicalUrl} onChange={(e) => set("canonicalUrl", e.target.value)} placeholder="https://geniemedia.in/…" />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.robotsIndex} onChange={(e) => set("robotsIndex", e.target.checked)} /> Allow indexing</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.robotsFollow} onChange={(e) => set("robotsFollow", e.target.checked)} /> Allow following links</label>
        </div>
        {!form.robotsIndex && <p className="text-xs font-bold text-red-700">Indexing is off: publishing this removes the page from Google.</p>}
      </Card>

      <Card title="Page sections (visible H2s)" action={<button type="button" onClick={() => set("sections", [...form.sections, { heading: "", body: "" }])} className="flex items-center gap-1 text-sm font-bold" style={{ color: BRAND }}><Plus size={14} /> Add section</button>}>
        <p className="text-xs text-gray-500">Each section appears on the page as a real heading with your text, below the existing content. Write it for customers; leave a blank line between paragraphs.</p>
        {form.sections.map((s, i) => (
          <div key={i} className="rounded-xl border-2 border-gray-100 p-3 space-y-2">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-gray-400">Section {i + 1}</span>
              <div className="ml-auto flex gap-1">
                <button type="button" aria-label="Move up" onClick={() => set("sections", move(form.sections, i, -1))} className="p-1.5 rounded hover:bg-gray-100"><ArrowUp size={14} /></button>
                <button type="button" aria-label="Move down" onClick={() => set("sections", move(form.sections, i, 1))} className="p-1.5 rounded hover:bg-gray-100"><ArrowDown size={14} /></button>
                <button type="button" aria-label="Remove section" onClick={() => set("sections", form.sections.filter((_, j) => j !== i))} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
            <input aria-label={`Section ${i + 1} heading`} className={inputCls} value={s.heading} placeholder="Heading (H2)" onChange={(e) => set("sections", form.sections.map((x, j) => (j === i ? { ...x, heading: e.target.value } : x)))} />
            <textarea aria-label={`Section ${i + 1} text`} rows={4} className={`${inputCls} resize-y`} value={s.body} placeholder="Section text" onChange={(e) => set("sections", form.sections.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)))} />
          </div>
        ))}
      </Card>

      <Card title="Internal links" action={<button type="button" onClick={() => set("internalLinks", [...form.internalLinks, { label: "", href: "" }])} className="flex items-center gap-1 text-sm font-bold" style={{ color: BRAND }}><Plus size={14} /> Add link</button>}>
        <p className="text-xs text-gray-500">Shown as “Related Pages” on the page. Only paths on this site (e.g. /case-studies, /blog/…, /contact). Keep it to a few genuinely related pages.</p>
        {form.internalLinks.map((l, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input aria-label="Link text" className={inputCls} value={l.label} placeholder="Link text" onChange={(e) => set("internalLinks", form.internalLinks.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
            <input aria-label="Link path" className={inputCls} value={l.href} placeholder="/case-studies" onChange={(e) => set("internalLinks", form.internalLinks.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)))} />
            <button type="button" aria-label="Remove link" onClick={() => set("internalLinks", form.internalLinks.filter((_, j) => j !== i))} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
          </div>
        ))}
      </Card>

      <Card title="Image alt text notes" action={<button type="button" onClick={() => set("imageAltSuggestions", [...form.imageAltSuggestions, { image: "", alt: "" }])} className="flex items-center gap-1 text-sm font-bold" style={{ color: BRAND }}><Plus size={14} /> Add note</button>}>
        <p className="text-xs text-gray-500">Reference notes for the developer or editor. Describe what each image shows, e.g. “Genie Media team reviewing a campaign report”, never a keyword list.</p>
        {form.imageAltSuggestions.map((a, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
            <input aria-label="Image" className={inputCls} value={a.image} placeholder="Which image" onChange={(e) => set("imageAltSuggestions", form.imageAltSuggestions.map((x, j) => (j === i ? { ...x, image: e.target.value } : x)))} />
            <input aria-label="Alt text" className={inputCls} value={a.alt} placeholder="Description" onChange={(e) => set("imageAltSuggestions", form.imageAltSuggestions.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))} />
            <button type="button" aria-label="Remove note" onClick={() => set("imageAltSuggestions", form.imageAltSuggestions.filter((_, j) => j !== i))} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
          </div>
        ))}
      </Card>

      {problems.length > 0 && (
        <div role="alert" className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          <p className="font-bold mb-1">Fix these before publishing:</p>
          <ul className="list-disc pl-5 space-y-0.5">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" disabled={Boolean(busy)} onClick={onSave} className="flex-1 py-3 rounded-xl font-extrabold text-sm border-2 border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-800 disabled:opacity-60 flex items-center justify-center gap-2">
          {busy === "draft" ? <Loader size={15} className="animate-spin" /> : <Save size={14} />} Save Draft
        </button>
        <button type="button" disabled={Boolean(busy)} onClick={onPublish} className="flex-1 py-3 rounded-xl font-extrabold text-sm text-white disabled:opacity-60 flex items-center justify-center gap-2" style={{ background: BRAND }}>
          {busy === "publish" ? <Loader size={15} className="animate-spin" /> : <Globe size={14} />} Publish
        </button>
        {hasPublished && (
          <button type="button" disabled={Boolean(busy)} onClick={onUnpublish} className="sm:w-40 py-3 rounded-xl font-bold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-60">Unpublish</button>
        )}
      </div>
      <p className="text-xs text-gray-500">Drafts never affect the website. A published configuration reaches geniemedia.in with the next build & upload; until then the page keeps its current content.</p>
    </div>
  );
}

function KeywordManager({ detail, json, api, onChanged, say }: { detail: PageDetail; json: JsonFn; api: (p: string, i?: RequestInit) => Promise<Response>; onChanged: () => Promise<void>; say: (m: string, ok?: boolean) => void }) {
  const blank = { keyword: "", keywordType: "SECONDARY", searchIntent: "COMMERCIAL", location: "", priority: "MEDIUM", status: "ACTIVE", notes: "" };
  const [draft, setDraft] = useState(blank);
  const [editing, setEditing] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [fType, setFType] = useState("");
  const [fStatus, setFStatus] = useState("ACTIVE");
  const [sort, setSort] = useState<{ key: keyof Keyword; dir: 1 | -1 }>({ key: "keyword", dir: 1 });
  const [importPreview, setImportPreview] = useState<{ csv: string; accepted: RawRecord[]; rejected: RawRecord[] } | null>(null);

  const rows = detail.keywords
    .filter((k) => (!q || k.keyword.toLowerCase().includes(q.toLowerCase())) && (!fType || k.keyword_type === fType) && (!fStatus || k.status === fStatus))
    .sort((a, b) => String(a[sort.key] ?? "").localeCompare(String(b[sort.key] ?? "")) * sort.dir);

  const save = async () => {
    const body = { ...draft, pageId: detail.page.id };
    const { res, data } = editing ? await json(`/api/admin/seo/keywords/${editing}`, "PUT", body) : await json("/api/admin/seo/keywords", "POST", body);
    if (!res.ok) return say((data && str(data.message)) || "Could not save the keyword.", false);
    const warnings = arr(data?.warnings).map(String);
    say(warnings.length ? `Saved. Note: ${warnings.join(" ")}` : "Keyword saved.");
    setDraft(blank);
    setEditing(null);
    await onChanged();
  };

  const edit = (k: Keyword) => {
    setEditing(k.id);
    setDraft({ keyword: k.keyword, keywordType: k.keyword_type, searchIntent: k.search_intent, location: k.location || "", priority: k.priority, status: k.status, notes: k.notes || "" });
  };

  const toggleArchive = async (k: Keyword) => {
    const { res } = await json(`/api/admin/seo/keywords/${k.id}`, "PUT", { keyword: k.keyword, keywordType: k.keyword_type, searchIntent: k.search_intent, location: k.location, priority: k.priority, notes: k.notes, status: k.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE" });
    if (res.ok) await onChanged();
  };

  const changePriority = async (k: Keyword, priority: string) => {
    const { res } = await json(`/api/admin/seo/keywords/${k.id}`, "PUT", { keyword: k.keyword, keywordType: k.keyword_type, searchIntent: k.search_intent, location: k.location, notes: k.notes, status: k.status, priority });
    if (res.ok) await onChanged();
  };

  const remove = async (k: Keyword) => {
    if (!window.confirm(`Delete “${k.keyword}”?`)) return;
    const { res } = await json(`/api/admin/seo/keywords/${k.id}`, "DELETE");
    if (res.ok) await onChanged();
  };

  const previewImport = async (csv: string) => {
    const { res, data } = await json("/api/admin/seo/keywords/import", "POST", { pageId: detail.page.id, csv, dryRun: true });
    if (!res.ok) return say((data && str(data.message)) || "Could not read the CSV.", false);
    setImportPreview({ csv, accepted: arr(data?.accepted).filter(isRecord), rejected: arr(data?.rejected).filter(isRecord) });
  };

  const confirmImport = async () => {
    if (!importPreview) return;
    const { res, data } = await json("/api/admin/seo/keywords/import", "POST", { pageId: detail.page.id, csv: importPreview.csv });
    say(res.ok ? `${num(data?.imported) ?? 0} keywords imported.` : (data && str(data.message)) || "Import failed.", res.ok);
    setImportPreview(null);
    await onChanged();
  };

  const siteKeywordsCsv = () => {
    const topic = SEO_TAXONOMY.find((t) => t.path === detail.page.path);
    if (!topic) return null;
    const lines = ["keyword,keywordType,searchIntent,location,priority,notes"];
    for (const [tier, terms] of Object.entries(topic.terms)) {
      const m = TIER_MAP[tier];
      for (const term of terms) lines.push([term, m.type, m.intent, "", m.priority, "From the site keyword list"].map(csvCell).join(","));
    }
    return lines.join("\n");
  };

  const exportCsv = async () => {
    const res = await api(`/api/admin/seo/keywords/export?page=${detail.page.id}`);
    if (!res.ok) return say("Export failed.", false);
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement("a");
    a.href = url;
    a.download = `seo-keywords${detail.page.path.replace(/\//g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const header = (key: keyof Keyword, label: string) => (
    <th scope="col" className="text-left px-3 py-2">
      <button type="button" onClick={() => setSort((s) => ({ key, dir: s.key === key ? ((s.dir * -1) as 1 | -1) : 1 }))} className="font-bold text-gray-700 hover:text-[#6B4A2D]">
        {label}{sort.key === key ? (sort.dir === 1 ? " ↑" : " ↓") : ""}
      </button>
    </th>
  );

  return (
    <div className="space-y-5">
      <Card title={editing ? "Edit keyword" : "Add keyword"} icon={KeyRound}>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <input aria-label="Keyword" className={`${inputCls} lg:col-span-2`} value={draft.keyword} placeholder="digital marketing agency in Vizag" onChange={(e) => setDraft({ ...draft, keyword: e.target.value })} />
          <select aria-label="Keyword type" className={inputCls} value={draft.keywordType} onChange={(e) => setDraft({ ...draft, keywordType: e.target.value })}>{KEYWORD_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          <select aria-label="Search intent" className={inputCls} value={draft.searchIntent} onChange={(e) => setDraft({ ...draft, searchIntent: e.target.value })}>{INTENTS.map((t) => <option key={t}>{t}</option>)}</select>
          <select aria-label="Location" className={inputCls} value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })}>
            <option value="">No location</option>
            {detail.locations.map((l) => <option key={l.id}>{l.name}</option>)}
          </select>
          <select aria-label="Priority" className={inputCls} value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })}>{PRIORITIES.map((t) => <option key={t}>{t}</option>)}</select>
          <input aria-label="Notes" className={`${inputCls} lg:col-span-2`} value={draft.notes} placeholder="Notes (optional)" onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={save} className="px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ background: BRAND }}>{editing ? "Save changes" : "Add keyword"}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setDraft(blank); }} className="px-4 py-2 rounded-xl bg-gray-100 text-sm font-bold">Cancel</button>}
        </div>
      </Card>

      <Card title="Import & export" icon={Upload}>
        <p className="text-xs text-gray-500">CSV columns: keyword, keywordType, searchIntent, location, priority, notes. You will see a preview first; duplicates and invalid rows are listed and skipped. Imported keywords only guide planning — nothing is added to the page.</p>
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-gray-300 text-sm font-semibold cursor-pointer hover:border-[#6B4A2D]">
            <Upload size={14} /> Choose CSV
            <input type="file" accept=".csv,text/csv" className="sr-only" onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) await previewImport(await f.text()); }} />
          </label>
          {siteKeywordsCsv() && (
            <button type="button" onClick={() => { const csv = siteKeywordsCsv(); if (csv) previewImport(csv); }} className="px-4 py-2 rounded-xl border-2 border-gray-200 text-sm font-semibold hover:border-[#6B4A2D]">Import the site&apos;s existing keyword list</button>
          )}
          <button type="button" onClick={exportCsv} className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 text-sm font-semibold hover:border-[#6B4A2D]"><Download size={14} /> Export CSV</button>
        </div>
        {importPreview && (
          <div className="rounded-xl border-2 border-gray-100 p-4 space-y-3 text-sm">
            <p><strong>{importPreview.accepted.length}</strong> keywords ready to import · <strong>{importPreview.rejected.length}</strong> skipped</p>
            {importPreview.rejected.length > 0 && (
              <ul className="max-h-40 overflow-y-auto text-xs text-red-700 space-y-0.5">{importPreview.rejected.map((r, i) => <li key={i}>Line {String(r.line)}: “{String(r.keyword)}” — {String(r.reason)}</li>)}</ul>
            )}
            {importPreview.accepted.some((a) => arr(a.warnings).length) && (
              <ul className="max-h-40 overflow-y-auto text-xs text-amber-700 space-y-0.5">{importPreview.accepted.filter((a) => arr(a.warnings).length).map((a, i) => <li key={i}>“{String(a.keyword)}”: {arr(a.warnings).join(" ")}</li>)}</ul>
            )}
            <div className="flex gap-2">
              <button type="button" disabled={!importPreview.accepted.length} onClick={confirmImport} className="px-4 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-50" style={{ background: BRAND }}>Import {importPreview.accepted.length}</button>
              <button type="button" onClick={() => setImportPreview(null)} className="px-4 py-2 rounded-xl bg-gray-100 text-sm font-bold">Cancel</button>
            </div>
          </div>
        )}
      </Card>

      <Card title="Keywords" icon={Search}>
        <div className="grid gap-2 sm:grid-cols-3">
          <input aria-label="Search keywords" type="search" className={inputCls} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select aria-label="Filter by type" className={inputCls} value={fType} onChange={(e) => setFType(e.target.value)}><option value="">All types</option>{KEYWORD_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          <select aria-label="Filter by status" className={inputCls} value={fStatus} onChange={(e) => setFStatus(e.target.value)}><option value="">All statuses</option><option>ACTIVE</option><option>ARCHIVED</option></select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{header("keyword", "Keyword")}{header("keyword_type", "Type")}{header("search_intent", "Intent")}{header("priority", "Priority")}{header("location", "Location")}<th scope="col" className="px-3 py-2 text-left">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((k) => (
                <tr key={k.id} className={k.status === "ARCHIVED" ? "opacity-60" : ""}>
                  <td className="px-3 py-2">
                    <span className="font-medium text-gray-900">{k.keyword}</span>
                    {k.warnings?.map((w) => <span key={w} className="block text-xs text-amber-700">{w}</span>)}
                    {k.notes && <span className="block text-xs text-gray-500">{k.notes}</span>}
                  </td>
                  <td className="px-3 py-2 text-xs">{k.keyword_type}</td>
                  <td className="px-3 py-2 text-xs">{k.search_intent}</td>
                  <td className="px-3 py-2">
                    <select aria-label={`Priority of ${k.keyword}`} value={k.priority} onChange={(e) => changePriority(k, e.target.value)} className="text-xs border rounded-lg px-1.5 py-1">{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select>
                  </td>
                  <td className="px-3 py-2 text-xs">{k.location || "—"}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <button type="button" aria-label={`Edit ${k.keyword}`} onClick={() => edit(k)} className="p-1.5 rounded hover:bg-blue-50 text-blue-700"><Edit2 size={14} /></button>
                    <button type="button" onClick={() => toggleArchive(k)} className="px-2 py-1 rounded text-xs font-semibold hover:bg-gray-100">{k.status === "ACTIVE" ? "Archive" : "Restore"}</button>
                    <button type="button" aria-label={`Delete ${k.keyword}`} onClick={() => remove(k)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <p className="text-sm text-gray-500 py-6 text-center">No keywords match.</p>}
        </div>
      </Card>
    </div>
  );
}

function PreviewPanel({ detail, form, snapshot, locations }: { detail: PageDetail; form: SeoConfig; snapshot: HealthPage | null; locations: Array<{ name: string; aliases: string[] }> }) {
  if (!snapshot) return <p className="text-sm text-gray-500">Reading the live page… If this stays empty, open the admin on geniemedia.in so the page can be read.</p>;
  const keywords = toHealthKeywords(detail.keywords);
  const cannibalized = detail.warnings.map((w) => w.keyword);
  const current = analyzePageHealth(snapshot, detail.published ?? form, keywords, locations, { cannibalized });
  const draftPage = applyDraft(snapshot, form, detail.published);
  const draft = analyzePageHealth(draftPage, form, keywords, locations, { cannibalized });
  const url = `geniemedia.in${detail.page.path}`;

  const column = (label: string, page: HealthPage, report: HealthReport) => (
    <div className="space-y-4 min-w-0">
      <div className="flex items-center gap-2"><h4 className="font-extrabold text-gray-900">{label}</h4><HealthBadge report={report} /></div>
      <Snippet title={page.title} description={page.description} url={url} />
      <div className="text-sm space-y-1">
        <p><span className="font-semibold">H1:</span> {page.h1s.join(" / ") || "—"}</p>
        <p className="font-semibold">H2s:</p>
        <ul className="list-disc pl-5 text-gray-700 max-h-48 overflow-y-auto">{page.h2s.map((h, i) => <li key={i}>{h}</li>)}</ul>
      </div>
      <ul className="grid grid-cols-2 gap-1 text-xs">
        {report.categories.map((c) => <li key={c.id} className="flex justify-between bg-gray-50 rounded px-2 py-1"><span>{c.label}</span><span className="font-bold">{c.score}/{c.max}</span></li>)}
      </ul>
      <p className="text-xs text-gray-500">{report.wordCount} words · location mentioned {report.locationMentions}×</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <Card title="Current version vs draft" icon={Eye}>
        <div className="grid gap-6 lg:grid-cols-2">
          {column(detail.published ? "Current (published)" : "Current (live page)", snapshot, current)}
          {column("Draft", draftPage, draft)}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Warnings" icon={AlertTriangle}>
          {draft.warnings.length ? <ul className="space-y-1.5 text-sm">{draft.warnings.map((w) => <li key={w} className="flex gap-2"><AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" aria-hidden="true" />{w}</li>)}</ul> : <p className="text-sm text-green-700">No warnings.</p>}
        </Card>
        <Card title="Suggestions" icon={CheckCircle}>
          <p className="text-xs text-gray-500">Ideas for you to write; nothing here is published automatically.</p>
          {draft.suggestions.length ? <ul className="space-y-1.5 text-sm list-disc pl-5">{draft.suggestions.map((s) => <li key={s}>{s}</li>)}</ul> : <p className="text-sm text-green-700">No suggestions.</p>}
        </Card>
      </div>

      <Card title="Keyword coverage (draft)" icon={KeyRound}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50"><tr>{["Keyword / topic", "Type", "Covered", "Title", "H1", "H2", "Uses", ""].map((h) => <th key={h} scope="col" className="text-left px-2 py-1.5">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {draft.coverage.map((c) => (
                <tr key={c.type + c.keyword}>
                  <td className="px-2 py-1.5 font-medium">{c.keyword}</td>
                  <td className="px-2 py-1.5">{c.type}</td>
                  {[c.found, c.inTitle, c.inH1, c.inH2].map((v, i) => <td key={i} className="px-2 py-1.5">{v ? "✓" : "·"}</td>)}
                  <td className="px-2 py-1.5">{c.count}</td>
                  <td className="px-2 py-1.5 text-amber-700">{c.repetitive ? "Potentially repetitive — review content" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function HistoryPanel({ detail }: { detail: PageDetail }) {
  const short = (v: unknown) => {
    const s = String(v ?? "");
    return s.length > 160 ? `${s.slice(0, 160)}…` : s;
  };
  return (
    <div className="space-y-5">
      <Card title="Versions" icon={History}>
        <ul className="text-sm divide-y divide-gray-100">
          {detail.history.map((h) => (
            <li key={String(h.id)} className="py-2 flex flex-wrap gap-3">
              <span className="font-bold uppercase text-xs">{String(h.status)}</span>
              <span className="text-gray-600">{when(num(h.publishedAt) ?? num(h.createdAt))}</span>
              <span className="text-gray-500">{String(h.created_by ?? "")}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Audit log" icon={History}>
        <ul className="text-sm divide-y divide-gray-100">
          {detail.audit.map((a) => (
            <li key={String(a.id)} className="py-2 space-y-0.5">
              <p><span className="font-semibold">{String(a.admin ?? "")}</span> · {String(a.action)}{a.field ? ` · ${String(a.field)}` : ""} · <span className="text-gray-500">{when(num(a.createdAt))}</span></p>
              {Boolean(a.old_value || a.new_value) && (
                <p className="text-xs text-gray-600 break-words">from <code>{short(a.old_value) || "—"}</code> to <code>{short(a.new_value) || "—"}</code></p>
              )}
            </li>
          ))}
          {!detail.audit.length && <li className="py-2 text-gray-500">No changes recorded yet.</li>}
        </ul>
      </Card>
    </div>
  );
}
