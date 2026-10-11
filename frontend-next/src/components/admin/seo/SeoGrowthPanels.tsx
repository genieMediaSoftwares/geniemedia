"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle, BarChart3, CheckCircle, ExternalLink, FileSearch, Gauge, Lightbulb, Link2, Loader, MapPin, Plug, RefreshCw, Search,
  ShieldCheck, Trash2, TrendingUp, Upload, Download, Wrench,
} from "lucide-react";
import { arr, isRecord, num, str, type RawRecord } from "@/lib/api/coerce";
import { AiLinksAssist, AiPlannerAssist, AiProviderSettings, useAiStatus } from "@/components/admin/seo/SeoAiAssist";

const BRAND = "#6B4A2D";

type JsonFn = (path: string, method?: string, body?: unknown) => Promise<{ res: Response; data: RawRecord | null }>;
type Say = (msg: string, ok?: boolean) => void;
export type GrowthPage = { id: number; path: string; name: string };
type Common = { json: JsonFn; say: Say; pages: GrowthPage[]; onOpenPage: (id: number, tab?: "fix" | "config" | "keywords") => void };

export type GrowthSection = "gsc" | "opportunities" | "indexing" | "audit" | "performance" | "links" | "content" | "local" | "backlinks" | "integrations";

export const GROWTH_SECTIONS: { id: GrowthSection; label: string; icon: React.ElementType }[] = [
  { id: "gsc", label: "Search Console", icon: BarChart3 },
  { id: "opportunities", label: "Opportunities", icon: TrendingUp },
  { id: "indexing", label: "Indexing", icon: FileSearch },
  { id: "audit", label: "Technical Audit", icon: Wrench },
  { id: "performance", label: "Performance", icon: Gauge },
  { id: "links", label: "Internal Links", icon: Link2 },
  { id: "content", label: "Content Planner", icon: Lightbulb },
  { id: "local", label: "Local SEO & Trust", icon: MapPin },
  { id: "backlinks", label: "Backlinks", icon: ExternalLink },
  { id: "integrations", label: "Integrations", icon: Plug },
];

const fmtDate = (ms: unknown) => {
  const n = num(ms);
  return n ? new Date(n).toLocaleString() : "never";
};
const pct = (v: unknown) => `${((num(v) || 0) * 100).toFixed(1)}%`;
const pos = (v: unknown) => (num(v) === null ? "—" : (num(v) as number).toFixed(1));
const int = (v: unknown) => (num(v) || 0).toLocaleString();
const recs = (v: unknown) => arr(v).filter(isRecord);
const pathOf = (url: string) => {
  try {
    return new URL(url).pathname.replace(/\/+$/, "") || "/";
  } catch {
    return url;
  }
};

const btn = "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold border border-gray-200 bg-white hover:border-[#6B4A2D] hover:text-[#6B4A2D] disabled:opacity-50";
const primary = "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-[#6B4A2D] hover:bg-[#5a3d24] disabled:opacity-50";
const input = "w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6B4A2D]";
const sevTone: Record<string, string> = {
  critical: "bg-red-100 text-red-800",
  high: "bg-red-50 text-red-700",
  medium: "bg-amber-50 text-amber-800",
  low: "bg-gray-100 text-gray-700",
  info: "bg-blue-50 text-blue-700",
};

function Panel({ title, icon: Icon, action, children }: { title: string; icon?: React.ElementType; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {Icon && <Icon size={16} style={{ color: BRAND }} aria-hidden="true" />}
        <h3 className="text-base font-extrabold text-gray-900">{title}</h3>
        {action && <div className="ml-auto flex flex-wrap gap-2">{action}</div>}
      </div>
      {children}
    </section>
  );
}

function Note({ tone = "gray", children }: { tone?: "gray" | "amber" | "red" | "green"; children: React.ReactNode }) {
  const t = { gray: "bg-gray-50 border-gray-200 text-gray-700", amber: "bg-amber-50 border-amber-200 text-amber-900", red: "bg-red-50 border-red-200 text-red-900", green: "bg-green-50 border-green-200 text-green-900" }[tone];
  return <div className={`rounded-xl border px-4 py-3 text-sm ${t}`}>{children}</div>;
}

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <p className="text-xl font-black text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

function Evidence({ value }: { value: unknown }) {
  if (!isRecord(value) && !Array.isArray(value)) return null;
  const entries = isRecord(value) ? Object.entries(value).filter(([, v]) => v !== null && v !== undefined && v !== "") : [];
  if (!entries.length) return null;
  const show = (v: unknown): string => {
    if (Array.isArray(v)) return v.map((x) => (isRecord(x) ? Object.values(x).join(" · ") : String(x))).join("; ");
    if (isRecord(v)) return Object.entries(v).map(([k, x]) => `${k}: ${String(x)}`).join(", ");
    if (typeof v === "number" && v > 0 && v < 1 && !Number.isInteger(v)) return v.toFixed(3);
    return String(v);
  };
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-gray-600">
      {entries.map(([k, v]) => (
        <div key={k} className="flex gap-1 min-w-0"><dt className="font-semibold shrink-0">{k}:</dt><dd className="break-all">{show(v)}</dd></div>
      ))}
    </dl>
  );
}

function useLoad<T>(json: JsonFn, path: string | null, map: (d: RawRecord | null, res: Response) => T) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      const { res, data: d } = await json(path);
      if (res.status === 404) setError("This feature needs the updated backend. Deploy the Backend folder, then reload.");
      else if (!res.ok) setError((d && str(d.message)) || `Request failed (${res.status}).`);
      else setData(map(d, res));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  }, [json, path, map]);
  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);
  return { data, loading, error, reload: load };
}

const asRecord = (d: RawRecord | null) => d || {};
const asList = (d: unknown) => recs(d);

function Loading() {
  return <div className="flex justify-center py-8"><Loader size={24} className="animate-spin" style={{ color: BRAND }} /></div>;
}

// ---------------- Search Console ----------------

function SearchConsolePanel({ json, say }: Common) {
  const status = useLoad(json, "/api/admin/seo/gsc/status", asRecord);
  const [filters, setFilters] = useState({ days: "28", country: "", device: "", query: "", page: "" });
  const [applied, setApplied] = useState(filters);
  const perfPath = useMemo(() => {
    const q = new URLSearchParams(Object.entries(applied).filter(([, v]) => v));
    return `/api/admin/seo/gsc/performance?${q}`;
  }, [applied]);
  const connected = Boolean(status.data && status.data.connected);
  const perf = useLoad(json, connected ? perfPath : null, asRecord);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const g = q.get("gsc");
    if (!g) return;
    say(g === "connected" ? "Search Console connected." : `Search Console: ${q.get("detail") || g}`, g === "connected");
    q.delete("gsc");
    q.delete("detail");
    window.history.replaceState(null, "", `${window.location.pathname}${q.toString() ? `?${q}` : ""}`);
  }, [say]);

  const connect = async () => {
    setBusy("connect");
    const { res, data } = await json("/api/admin/seo/gsc/connect", "POST", {});
    setBusy("");
    if (res.ok && data && str(data.url)) window.location.href = String(data.url);
    else say((data && str(data.message)) || "Could not start the Google sign-in.", false);
  };
  const sync = async () => {
    setBusy("sync");
    const { res, data } = await json("/api/admin/seo/gsc/sync", "POST", { days: 90 });
    setBusy("");
    say(res.ok ? `Synced ${int(data && data.rows)} rows from Search Console.` : (data && str(data.message)) || "Sync failed.", res.ok);
    await status.reload();
    await perf.reload();
  };
  const disconnect = async () => {
    if (!window.confirm("Disconnect Search Console? The stored token is revoked and deleted. Synced data stays.")) return;
    setBusy("disconnect");
    const { res, data } = await json("/api/admin/seo/gsc/disconnect", "POST", {});
    setBusy("");
    say(res.ok ? "Disconnected." : (data && str(data.message)) || "Could not disconnect.", res.ok);
    await status.reload();
  };

  const s = status.data;
  return (
    <div className="space-y-6">
      <Panel
        title="Google Search Console"
        icon={BarChart3}
        action={
          s && s.configured ? (
            connected ? (
              <>
                <button type="button" className={primary} disabled={!!busy} onClick={sync}>{busy === "sync" ? <Loader size={14} className="animate-spin" /> : <RefreshCw size={14} />} Sync now</button>
                <button type="button" className={btn} disabled={!!busy} onClick={disconnect}>Disconnect</button>
              </>
            ) : (
              <button type="button" className={primary} disabled={!!busy} onClick={connect}>Connect Google Search Console</button>
            )
          ) : null
        }
      >
        {status.loading && !s ? <Loading /> : status.error ? <Note tone="red">{status.error}</Note> : s && (
          <>
            {!s.configured && (
              <Note tone="amber">
                Search Console is not configured on the server. Set <code>GSC_CLIENT_ID</code>, <code>GSC_CLIENT_SECRET</code>, <code>GSC_REDIRECT_URI</code> and <code>GSC_TOKEN_KEY</code> in the backend environment. No data is shown until a real connection exists.
              </Note>
            )}
            {s.configured && !connected && <Note>Not connected. Connecting opens Google&apos;s sign-in; the app asks only for read-only access to Search Console.</Note>}
            {connected && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Stat label="Property" value={<span className="text-sm break-all">{str(s.property) || "—"}</span>} sub={`Connected by ${str(s.connectedBy) || "—"}`} />
                <Stat label="Last sync" value={<span className="text-sm">{fmtDate(s.lastSyncAt)}</span>} sub={s.lastSyncRows ? `${int(s.lastSyncRows)} rows` : undefined} />
                <Stat label="Stored rows" value={int(s.rows)} sub={s.firstDate ? `${str(s.firstDate)} → ${str(s.lastDate)}` : "No data yet — run a sync"} />
                <Stat label="Data" value={<span className="text-sm">Final data only</span>} sub="Google reports with a 2–3 day delay" />
              </div>
            )}
            {s.lastError ? <Note tone="red">Last error: {String(s.lastError)}</Note> : null}
          </>
        )}
      </Panel>

      {connected && (
        <Panel title="Search performance" icon={TrendingUp}>
          <form
            className="grid grid-cols-2 md:grid-cols-6 gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setApplied(filters);
            }}
          >
            <select aria-label="Period" className={input} value={filters.days} onChange={(e) => setFilters({ ...filters, days: e.target.value })}>
              {[["7", "Last 7 days"], ["28", "Last 28 days"], ["90", "Last 3 months"], ["180", "Last 6 months"], ["480", "Last 16 months"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select aria-label="Country" className={input} value={filters.country} onChange={(e) => setFilters({ ...filters, country: e.target.value })}>
              <option value="">All countries</option>
              <option value="ind">India</option>
              <option value="usa">United States</option>
              <option value="are">UAE</option>
              <option value="gbr">United Kingdom</option>
            </select>
            <select aria-label="Device" className={input} value={filters.device} onChange={(e) => setFilters({ ...filters, device: e.target.value })}>
              <option value="">All devices</option>
              <option value="MOBILE">Mobile</option>
              <option value="DESKTOP">Desktop</option>
              <option value="TABLET">Tablet</option>
            </select>
            <input aria-label="Query contains" placeholder="Query contains…" className={input} value={filters.query} onChange={(e) => setFilters({ ...filters, query: e.target.value })} />
            <input aria-label="Page contains" placeholder="Page contains…" className={input} value={filters.page} onChange={(e) => setFilters({ ...filters, page: e.target.value })} />
            <button type="submit" className={primary}><Search size={14} /> Apply</button>
          </form>
          {perf.loading && !perf.data ? <Loading /> : perf.error ? <Note tone="red">{perf.error}</Note> : perf.data && isRecord(perf.data.totals) && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Stat label="Clicks" value={int(perf.data.totals.clicks)} />
                <Stat label="Impressions" value={int(perf.data.totals.impressions)} />
                <Stat label="Average CTR" value={pct(perf.data.totals.ctr)} />
                <Stat label="Average position" value={pos(perf.data.totals.position)} />
              </div>
              <Trend series={recs(perf.data.series)} />
              <div className="grid lg:grid-cols-2 gap-4">
                <MetricTable title="Top queries" rows={recs(perf.data.topQueries)} keyName="query" />
                <MetricTable title="Top pages" rows={recs(perf.data.topPages)} keyName="page" />
              </div>
            </>
          )}
        </Panel>
      )}
    </div>
  );
}

function Trend({ series }: { series: RawRecord[] }) {
  if (series.length < 2) return null;
  const max = Math.max(1, ...series.map((r) => num(r.clicks) || 0));
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-1">Daily clicks</p>
      <div className="flex items-end gap-px h-24 border-b border-gray-200" role="img" aria-label="Daily clicks chart">
        {series.map((r) => (
          <div key={String(r.date)} title={`${String(r.date).slice(0, 10)}: ${int(r.clicks)} clicks, ${int(r.impressions)} impressions`} className="flex-1 bg-[#6B4A2D]/70 min-w-[2px]" style={{ height: `${Math.max(2, ((num(r.clicks) || 0) / max) * 100)}%` }} />
        ))}
      </div>
    </div>
  );
}

function MetricTable({ title, rows, keyName }: { title: string; rows: RawRecord[]; keyName: string }) {
  return (
    <div className="overflow-x-auto">
      <p className="text-sm font-bold text-gray-800 mb-2">{title}</p>
      <table className="w-full text-xs">
        <thead><tr className="text-left text-gray-500"><th className="py-1 pr-2">{keyName === "query" ? "Query" : "Page"}</th><th className="py-1 px-1 text-right">Clicks</th><th className="py-1 px-1 text-right">Impr.</th><th className="py-1 px-1 text-right">CTR</th><th className="py-1 pl-1 text-right">Pos.</th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={5} className="py-3 text-gray-400">No data for these filters.</td></tr>}
          {rows.map((r) => (
            <tr key={String(r[keyName])} className="border-t border-gray-100">
              <td className="py-1 pr-2 break-all">{keyName === "page" ? pathOf(String(r.page)) : String(r.query)}</td>
              <td className="py-1 px-1 text-right">{int(r.clicks)}</td>
              <td className="py-1 px-1 text-right">{int(r.impressions)}</td>
              <td className="py-1 px-1 text-right">{pct(r.ctr)}</td>
              <td className="py-1 pl-1 text-right">{pos(r.position)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------- Opportunities ----------------

const OPP_LABEL: Record<string, string> = {
  low_ctr: "Low CTR",
  striking_distance: "Striking distance",
  rising: "Rising",
  unmapped: "Not in plan",
  commercial: "Commercial",
  question: "Question",
  declining_page: "Declining page",
  cannibalization: "Competing pages",
};

function OpportunitiesPanel({ json, say, pages, onOpenPage }: Common) {
  const [country, setCountry] = useState("ind");
  const [days, setDays] = useState("28");
  const [type, setType] = useState("");
  const opp = useLoad(json, `/api/admin/seo/gsc/opportunities?country=${country}&days=${days}`, asRecord);
  const items = recs(opp.data && opp.data.items).filter((i) => !type || i.type === type);
  const pageFor = (url: unknown) => pages.find((p) => p.path === pathOf(String(url || "")));
  const saveIdea = async (i: RawRecord) => {
    const { res } = await json("/api/admin/seo/content/ideas", "POST", {
      title: String(i.query || i.title),
      kind: i.type === "question" ? "faq" : i.type === "commercial" ? "service_page" : "blog",
      target_page: str(i.page) || "",
      evidence: [i.evidence],
      rationale: String(i.action || ""),
      source: "gsc",
    });
    say(res.ok ? "Saved to the content planner." : "Could not save the idea.", res.ok);
  };
  return (
    <Panel
      title="Search opportunities"
      icon={TrendingUp}
      action={
        <>
          <select aria-label="Country" className={input} value={country} onChange={(e) => setCountry(e.target.value)}><option value="ind">India</option><option value="">All countries</option></select>
          <select aria-label="Period" className={input} value={days} onChange={(e) => setDays(e.target.value)}><option value="28">28 days</option><option value="90">90 days</option></select>
          <select aria-label="Type" className={input} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All types</option>
            {Object.entries(OPP_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </>
      }
    >
      <p className="text-sm text-gray-600">Every suggestion comes from your own Search Console data and shows the numbers it is based on. Nothing here predicts rankings.</p>
      {opp.loading && !opp.data ? <Loading /> : opp.error ? <Note tone="red">{opp.error}</Note> : opp.data && !opp.data.connected ? (
        <Note tone="amber">Connect Search Console and run a sync to see opportunities.</Note>
      ) : (
        <>
          {opp.data && str(opp.data.volumeProvider) === "none" && <Note>Search volume: <strong>Unavailable</strong> — no keyword data provider is configured. Volumes are never estimated.</Note>}
          {items.length === 0 && <Note>No opportunities match. That is normal for a new property or a short period.</Note>}
          <ul className="space-y-3">
            {items.map((i, n) => {
              const page = pageFor(i.page);
              return (
                <li key={`${String(i.type)}-${String(i.query)}-${String(i.page)}-${n}`} className="rounded-xl border border-gray-100 p-4 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sevTone[String(i.priority) === "high" ? "high" : String(i.priority) === "medium" ? "medium" : "low"]}`}>{String(i.priority)}</span>
                    <span className="text-xs font-bold text-gray-500">{OPP_LABEL[String(i.type)] || String(i.type)}</span>
                    <span className="font-bold text-gray-900">{String(i.title)}</span>
                  </div>
                  {i.query ? <p className="text-sm">Query: <strong>{String(i.query)}</strong></p> : null}
                  {i.page ? <p className="text-sm break-all">Page: <code>{pathOf(String(i.page))}</code></p> : null}
                  <p className="text-sm text-gray-700">{String(i.action)}</p>
                  <Evidence value={i.evidence} />
                  <div className="flex flex-wrap gap-2 pt-1">
                    {page && <button type="button" className={btn} onClick={() => onOpenPage(page.id, i.type === "unmapped" ? "keywords" : "config")}>Open {page.name}</button>}
                    {["question", "unmapped", "commercial", "rising"].includes(String(i.type)) && <button type="button" className={btn} onClick={() => saveIdea(i)}><Lightbulb size={14} /> Save as content idea</button>}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Panel>
  );
}

// ---------------- Indexing ----------------

function IndexingPanel({ json, say, pages }: Common) {
  const siteBase = "https://geniemedia.in";
  const [url, setUrl] = useState(`${siteBase}/`);
  const [result, setResult] = useState<RawRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const sitemaps = useLoad(json, "/api/admin/seo/gsc/sitemaps", asRecord);
  const history = useLoad(json, "/api/admin/seo/gsc/inspections", asList);
  const inspect = async (force = false) => {
    setBusy(true);
    const { res, data } = await json("/api/admin/seo/gsc/inspect", "POST", { url, force });
    setBusy(false);
    if (!res.ok) return say((data && str(data.message)) || "Inspection failed.", false);
    setResult(data);
    await history.reload();
  };
  const r = result && isRecord(result.result) ? result.result : null;
  const idx = r && isRecord(r.indexStatusResult) ? r.indexStatusResult : null;
  const mobile = r && isRecord(r.mobileUsabilityResult) ? r.mobileUsabilityResult : null;
  const rich = r && isRecord(r.richResultsResult) ? r.richResultsResult : null;
  return (
    <div className="space-y-6">
      <Panel title="URL Inspection" icon={FileSearch}>
        <p className="text-sm text-gray-600">Shows how Google sees a page right now. Requesting indexing is done in Search Console itself; this tool links you there.</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input aria-label="URL to inspect" className={input} value={url} onChange={(e) => setUrl(e.target.value)} list="seo-index-pages" />
          <datalist id="seo-index-pages">{pages.map((p) => <option key={p.id} value={`${siteBase}${p.path === "/" ? "/" : p.path}`} />)}</datalist>
          <button type="button" className={primary} disabled={busy} onClick={() => inspect(false)}>{busy ? <Loader size={14} className="animate-spin" /> : <Search size={14} />} Inspect</button>
        </div>
        {result && (
          <div className="space-y-3">
            {result.cached ? <p className="text-xs text-gray-500">Cached result from {fmtDate(result.inspectedAt)} · <button type="button" className="underline" onClick={() => inspect(true)}>Inspect again</button></p> : null}
            {idx && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {[
                  ["Verdict", idx.verdict], ["Coverage", idx.coverageState], ["Indexing allowed", idx.indexingState], ["Page fetch", idx.pageFetchState],
                  ["robots.txt", idx.robotsTxtState], ["Last crawl", idx.lastCrawlTime], ["Google-selected canonical", idx.googleCanonical], ["Your canonical", idx.userCanonical],
                  ["Crawled as", idx.crawledAs], ["In sitemaps", arr(idx.sitemap).join(", ")],
                ].map(([k, v]) => <div key={String(k)} className="rounded-lg bg-gray-50 px-3 py-2"><span className="text-xs font-semibold text-gray-500 block">{String(k)}</span><span className="break-all">{v ? String(v) : "—"}</span></div>)}
              </div>
            )}
            {mobile && <p className="text-sm">Mobile usability: <strong>{String(mobile.verdict || "—")}</strong></p>}
            {rich && <p className="text-sm">Rich results: <strong>{String(rich.verdict || "—")}</strong> {recs(rich.detectedItems).map((d) => String(d.richResultType)).join(", ")}</p>}
            {str(result.requestIndexingUrl) && <a className={btn} href={String(result.requestIndexingUrl)} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> Open in Search Console to request indexing</a>}
          </div>
        )}
      </Panel>

      <Panel title="Sitemaps in Search Console" icon={FileSearch}>
        {sitemaps.loading && !sitemaps.data ? <Loading /> : sitemaps.error ? <Note tone="red">{sitemaps.error}</Note> : sitemaps.data && !sitemaps.data.connected ? <Note tone="amber">Connect Search Console to see sitemap status.</Note> : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-left text-gray-500"><th className="py-1">Sitemap</th><th>Last read</th><th>Submitted</th><th>Errors</th><th>Warnings</th></tr></thead>
              <tbody>
                {recs(sitemaps.data && sitemaps.data.sitemaps).map((m) => (
                  <tr key={String(m.path)} className="border-t border-gray-100">
                    <td className="py-1 break-all">{String(m.path)}</td>
                    <td>{str(m.lastDownloaded) || "—"}</td>
                    <td>{str(m.lastSubmitted) || "—"}</td>
                    <td>{String(m.errors ?? 0)}</td>
                    <td>{String(m.warnings ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recs(sitemaps.data && sitemaps.data.sitemaps).length === 0 && <p className="text-sm text-gray-500 py-2">No sitemaps submitted. Submit https://geniemedia.in/sitemap.xml in Search Console.</p>}
          </div>
        )}
      </Panel>

      {(history.data || []).length > 0 && (
        <Panel title="Recent inspections">
          <ul className="text-sm divide-y divide-gray-100">
            {(history.data || []).slice(0, 30).map((h) => (
              <li key={String(h.id)} className="py-1.5 flex flex-wrap gap-2"><code className="break-all">{pathOf(String(h.url))}</code><span className="font-semibold">{String(h.verdict || "—")}</span><span className="text-gray-500">{String(h.coverage || "")}</span><span className="ml-auto text-xs text-gray-400">{fmtDate(h.inspectedAt)}</span></li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}

// ---------------- Technical audit ----------------

function AuditPanel({ json, say, onOpenPage }: Common) {
  const latest = useLoad(json, "/api/admin/seo/audit/latest", asRecord);
  const [sev, setSev] = useState("");
  const [cat, setCat] = useState("");
  const running = latest.data && isRecord(latest.data.running);
  const { reload } = latest;
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => void reload(), 5000);
    return () => clearInterval(t);
  }, [running, reload]);
  const run = async () => {
    const { res, data } = await json("/api/admin/seo/audit/run", "POST", {});
    say(res.ok ? "Audit started. It usually takes one to three minutes." : (data && str(data.message)) || "Could not start the audit.", res.ok);
    await reload();
  };
  const issues = recs(latest.data && latest.data.issues);
  const cats = [...new Set(issues.map((i) => String(i.category)))].sort();
  const shown = issues.filter((i) => (!sev || i.severity === sev) && (!cat || i.category === cat));
  const summary = latest.data && isRecord(latest.data.run) && isRecord(latest.data.run.summary) ? latest.data.run.summary : null;
  const bySev = summary && isRecord(summary.bySeverity) ? summary.bySeverity : {};
  return (
    <Panel
      title="Technical SEO audit"
      icon={Wrench}
      action={<button type="button" className={primary} disabled={Boolean(running)} onClick={run}>{running ? <Loader size={14} className="animate-spin" /> : <RefreshCw size={14} />} {running ? "Audit running…" : "Run audit now"}</button>}
    >
      <p className="text-sm text-gray-600">Crawls the live website the way a search engine does: status codes, redirects, titles, descriptions, canonicals, headings, images, structured data, links and contact details. It also runs automatically once a day while the backend is awake.</p>
      {latest.loading && !latest.data ? <Loading /> : latest.error ? <Note tone="red">{latest.error}</Note> : !latest.data || !latest.data.run ? (
        <Note>No audit has finished yet. Run one now.</Note>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <Stat label="Finished" value={<span className="text-sm">{fmtDate(isRecord(latest.data.run) ? latest.data.run.finishedAt : null)}</span>} />
            <Stat label="Pages crawled" value={int(summary && summary.pages)} sub={`${int(summary && summary.sitemapUrls)} in sitemap`} />
            <Stat label="Critical / high" value={`${int(bySev.critical)} / ${int(bySev.high)}`} />
            <Stat label="Medium" value={int(bySev.medium)} />
            <Stat label="Low" value={int(bySev.low)} />
          </div>
          <div className="flex flex-wrap gap-2">
            <select aria-label="Severity" className={`${input} sm:w-44`} value={sev} onChange={(e) => setSev(e.target.value)}>
              <option value="">All severities</option>
              {["critical", "high", "medium", "low", "info"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select aria-label="Category" className={`${input} sm:w-44`} value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">All categories</option>
              {cats.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="text-sm text-gray-500 self-center">{shown.length} issue{shown.length === 1 ? "" : "s"}</span>
          </div>
          <ul className="space-y-3">
            {shown.slice(0, 300).map((i) => {
              const target = isRecord(i.target) ? i.target : null;
              const pageId = target ? num(target.pageId) : null;
              return (
                <li key={String(i.id)} className="rounded-xl border border-gray-100 p-4 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sevTone[String(i.severity)] || sevTone.low}`}>{String(i.severity)}</span>
                    <code className="text-xs text-gray-500">{String(i.code)}</code>
                    <span className="text-xs text-gray-400">{String(i.category)}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{String(i.message)}</p>
                  <a className="text-xs break-all text-[#6B4A2D] underline" href={String(i.url)} target="_blank" rel="noopener noreferrer">{String(i.url)}</a>
                  <Evidence value={i.evidence} />
                  {str(i.why) && <p className="text-xs text-gray-600"><strong>Why it matters:</strong> {String(i.why)}</p>}
                  {str(i.fix) && <p className="text-xs text-gray-600"><strong>How to fix:</strong> {String(i.fix)}</p>}
                  {i.auto_fix === "draft" && pageId ? (
                    <button type="button" className={btn} onClick={() => onOpenPage(pageId, "config")}><Wrench size={14} /> Fix in the page editor</button>
                  ) : (
                    <p className="text-xs text-gray-400">Fix manually{target && str(target.field) ? ` (${String(target.field)})` : ""}.</p>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Panel>
  );
}

// ---------------- Performance ----------------

const ms = (v: unknown) => (num(v) === null ? "—" : `${((num(v) as number) / 1000).toFixed(2)} s`);

function PerformancePanel({ json, say, pages }: Common) {
  const siteBase = "https://geniemedia.in";
  const [url, setUrl] = useState(`${siteBase}/`);
  const [strategy, setStrategy] = useState("mobile");
  const [busy, setBusy] = useState(false);
  const runs = useLoad(json, "/api/admin/seo/performance", asList);
  const run = async () => {
    setBusy(true);
    const { res, data } = await json("/api/admin/seo/performance/run", "POST", { url, strategy });
    setBusy(false);
    say(res.ok ? `Performance score ${String(data && data.score)}.` : (data && str(data.message)) || "PageSpeed test failed.", res.ok);
    await runs.reload();
  };
  const list = (runs.data || []).filter((r) => !r.error);
  const latest = list[0];
  const field = latest && isRecord(latest.field) ? latest.field : null;
  const fieldUrl = field && isRecord(field.url) ? field.url : null;
  const fieldOrigin = field && isRecord(field.origin) ? field.origin : null;
  const fieldShow = fieldUrl || fieldOrigin;
  const lab = latest && isRecord(latest.lab) ? latest.lab : null;
  const opp = latest && isRecord(latest.opportunities) ? latest.opportunities : null;
  const metric = (m: unknown, fmt: (v: unknown) => string) => (isRecord(m) ? `${fmt(m.p75)} (${String(m.category || "—")})` : "No data");
  return (
    <Panel title="PageSpeed & Core Web Vitals" icon={Gauge}>
      <p className="text-sm text-gray-600">Uses Google PageSpeed Insights. Field data is what real Chrome users experienced over 28 days; lab data is a single simulated load. They often differ.</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input aria-label="URL to test" className={input} value={url} onChange={(e) => setUrl(e.target.value)} list="seo-psi-pages" />
        <datalist id="seo-psi-pages">{pages.map((p) => <option key={p.id} value={`${siteBase}${p.path === "/" ? "/" : p.path}`} />)}</datalist>
        <select aria-label="Device" className={`${input} sm:w-36`} value={strategy} onChange={(e) => setStrategy(e.target.value)}><option value="mobile">Mobile</option><option value="desktop">Desktop</option></select>
        <button type="button" className={primary} disabled={busy} onClick={run}>{busy ? <Loader size={14} className="animate-spin" /> : <Gauge size={14} />} {busy ? "Testing (up to 1 min)…" : "Run test"}</button>
      </div>
      {runs.error && <Note tone="red">{runs.error}</Note>}
      {latest && (
        <div className="space-y-3">
          <p className="text-sm">Latest: <code className="break-all">{pathOf(String(latest.url))}</code> · {String(latest.strategy)} · {fmtDate(latest.fetchedAt)}</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="Lab performance score" value={latest.score === null ? "—" : `${String(latest.score)}/100`} />
            <Stat label="LCP (lab)" value={ms(lab && lab.lcpMs)} />
            <Stat label="TBT (lab)" value={lab && num(lab.tbtMs) !== null ? `${Math.round(num(lab.tbtMs) as number)} ms` : "—"} sub="Lab proxy for INP" />
            <Stat label="CLS (lab)" value={lab && num(lab.cls) !== null ? (num(lab.cls) as number).toFixed(3) : "—"} />
          </div>
          <div className="rounded-xl border border-gray-100 p-4 text-sm space-y-1">
            <p className="font-bold">Field data (real users){fieldUrl ? " — this URL" : fieldOrigin ? " — whole site (not enough data for this URL)" : ""}</p>
            {fieldShow ? (
              <>
                <p>LCP: {metric(fieldShow.lcp, ms)}</p>
                <p>INP: {metric(fieldShow.inp, (v) => `${String(v)} ms`)}</p>
                <p>CLS: {metric(fieldShow.cls, (v) => (num(v) || 0).toFixed(2))}</p>
              </>
            ) : <p className="text-gray-500">Chrome UX Report has no field data for this site yet. Low-traffic sites often have none.</p>}
          </div>
          {opp && recs(opp.items).length > 0 && (
            <div>
              <p className="text-sm font-bold mb-1">Biggest savings (lab estimate)</p>
              <ul className="text-sm list-disc pl-5">{recs(opp.items).map((o) => <li key={String(o.id)}>{String(o.title)} — about {ms(o.savingsMs)}</li>)}</ul>
            </div>
          )}
          {opp && recs(opp.thirdParty).length > 0 && (
            <div>
              <p className="text-sm font-bold mb-1">Third-party code</p>
              <ul className="text-sm list-disc pl-5">{recs(opp.thirdParty).map((t) => <li key={String(t.entity)}>{String(t.entity)} — {int(t.kb)} KB, blocks {int(t.blockingMs)} ms</li>)}</ul>
            </div>
          )}
        </div>
      )}
      {list.length > 1 && (
        <div className="overflow-x-auto">
          <p className="text-sm font-bold mb-1">History</p>
          <table className="w-full text-xs">
            <thead><tr className="text-left text-gray-500"><th className="py-1">When</th><th>Page</th><th>Device</th><th>Score</th><th>LCP</th><th>CLS</th></tr></thead>
            <tbody>
              {list.slice(0, 30).map((r) => (
                <tr key={String(r.id)} className="border-t border-gray-100">
                  <td className="py-1">{fmtDate(r.fetchedAt)}</td>
                  <td className="break-all">{pathOf(String(r.url))}</td>
                  <td>{String(r.strategy)}</td>
                  <td>{r.score === null ? "—" : String(r.score)}</td>
                  <td>{ms(isRecord(r.lab) ? r.lab.lcpMs : null)}</td>
                  <td>{isRecord(r.lab) && num(r.lab.cls) !== null ? (num(r.lab.cls) as number).toFixed(3) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

// ---------------- Internal links ----------------

function LinksPanel({ json, say, pages, onOpenPage }: Common) {
  const rec = useLoad(json, "/api/admin/seo/links/recommendations", asRecord);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [anchors, setAnchors] = useState<Record<string, string>>({});
  const apply = async (i: RawRecord, key: string) => {
    const applyInfo = isRecord(i.apply) ? i.apply : {};
    const { res, data } = await json("/api/admin/seo/links/apply", "POST", { pageId: applyInfo.pageId, target: i.target, anchor: anchors[key] ?? i.anchor });
    say((data && str(data.message)) || (res.ok ? "Added to draft." : "Could not add the link."), res.ok);
    if (res.ok) setDone(new Set(done).add(key));
  };
  const items = recs(rec.data && rec.data.items);
  return (
    <Panel title="Internal link suggestions" icon={Link2} action={<button type="button" className={btn} onClick={() => rec.reload()}><RefreshCw size={14} /> Refresh</button>}>
      <p className="text-sm text-gray-600">Based on the latest technical audit. Only published, working pages are suggested. Adding a link puts it in the page&apos;s draft “Related links” — nothing changes on the website until you publish (and related links need a site rebuild to appear).</p>
      <AiLinksAssist json={json} say={say} pages={pages} />
      {rec.loading && !rec.data ? <Loading /> : rec.error ? <Note tone="red">{rec.error}</Note> : rec.data && !rec.data.auditAvailable ? (
        <Note tone="amber">Run a technical audit first — suggestions use its link map.</Note>
      ) : items.length === 0 ? <Note tone="green">No missing links found.</Note> : (
        <ul className="space-y-3">
          {items.map((i) => {
            const key = `${String(i.source)}>${String(i.target)}`;
            const applyInfo = isRecord(i.apply) ? i.apply : {};
            const pageId = num(applyInfo.pageId);
            return (
              <li key={key} className="rounded-xl border border-gray-100 p-4 space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sevTone[String(i.priority)] || sevTone.low}`}>{String(i.priority)}</span>
                  <code className="break-all">{pathOf(String(i.source))}</code> → <code className="break-all">{pathOf(String(i.target))}</code>
                </div>
                <p className="text-sm text-gray-700">{String(i.reason)}</p>
                <label className="block text-xs font-semibold text-gray-600">Link text
                  <input className={`${input} mt-1`} value={anchors[key] ?? String(i.anchor || "")} onChange={(e) => setAnchors({ ...anchors, [key]: e.target.value })} />
                </label>
                {str(i.anchorNote) && <p className="text-xs text-amber-700">{String(i.anchorNote)}</p>}
                <div className="flex flex-wrap gap-2">
                  {pageId ? (
                    done.has(key) ? <span className="text-sm text-green-700 font-semibold flex items-center gap-1"><CheckCircle size={14} /> Added to draft</span> : (
                      <>
                        <button type="button" className={primary} onClick={() => apply(i, key)}>Add to draft</button>
                        <button type="button" className={btn} onClick={() => onOpenPage(pageId, "config")}>Open page</button>
                      </>
                    )
                  ) : <p className="text-xs text-gray-500">{String(applyInfo.where || "Add this link manually.")}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

// ---------------- Content planner ----------------

const IDEA_STATUS = ["idea", "approved", "in_progress", "published", "dismissed"];

function ContentPanel({ json, say, pages }: Common) {
  const sug = useLoad(json, "/api/admin/seo/content/suggestions", asRecord);
  const ideas = useLoad(json, "/api/admin/seo/content/ideas", asList);
  const [draft, setDraft] = useState({ title: "", kind: "blog", target_page: "", rationale: "" });
  const save = async (body: RawRecord) => {
    const { res, data } = await json("/api/admin/seo/content/ideas", "POST", body);
    say(res.ok ? "Saved to the plan." : (data && str(data.message)) || "Could not save.", res.ok);
    if (res.ok) await ideas.reload();
    return res.ok;
  };
  const setStatus = async (id: unknown, status: string) => {
    const { res } = await json(`/api/admin/seo/content/ideas/${String(id)}`, "PUT", { status });
    if (!res.ok) say("Could not update.", false);
    await ideas.reload();
  };
  const remove = async (id: unknown) => {
    if (!window.confirm("Delete this idea?")) return;
    await json(`/api/admin/seo/content/ideas/${String(id)}`, "DELETE");
    await ideas.reload();
  };
  return (
    <div className="space-y-6">
      <Panel title="Content plan" icon={Lightbulb}>
        <form
          className="grid grid-cols-1 md:grid-cols-5 gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await save({ ...draft, source: "admin" })) setDraft({ title: "", kind: "blog", target_page: "", rationale: "" });
          }}
        >
          <input aria-label="Idea title" required placeholder="Idea title" className={`${input} md:col-span-2`} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <select aria-label="Kind" className={input} value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value })}>
            {["blog", "service_page", "faq", "case_study", "refresh", "other"].map((k) => <option key={k} value={k}>{k.replace("_", " ")}</option>)}
          </select>
          <input aria-label="Notes" placeholder="Why / notes" className={input} value={draft.rationale} onChange={(e) => setDraft({ ...draft, rationale: e.target.value })} />
          <button type="submit" className={primary}>Add idea</button>
        </form>
        {ideas.error && <Note tone="red">{ideas.error}</Note>}
        <ul className="divide-y divide-gray-100">
          {(ideas.data || []).map((i) => (
            <li key={String(i.id)} className="py-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-gray-900">{String(i.title)}</span>
              <span className="text-xs text-gray-500">{String(i.kind).replace("_", " ")} · {String(i.source)}</span>
              {str(i.rationale) && <span className="text-xs text-gray-500 w-full">{String(i.rationale)}</span>}
              <select aria-label="Status" className={`${input} w-36 ml-auto`} value={String(i.status)} onChange={(e) => setStatus(i.id, e.target.value)}>
                {IDEA_STATUS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
              <button type="button" aria-label="Delete idea" className="text-gray-400 hover:text-red-600" onClick={() => remove(i.id)}><Trash2 size={15} /></button>
            </li>
          ))}
          {ideas.data && ideas.data.length === 0 && <li className="py-2 text-sm text-gray-500">No ideas saved yet.</li>}
        </ul>
      </Panel>

      <Panel title="Suggestions" icon={TrendingUp} action={<button type="button" className={btn} onClick={() => sug.reload()}><RefreshCw size={14} /> Refresh</button>}>
        <p className="text-sm text-gray-600">Rule-based suggestions from Search Console queries, your blog, your projects and case studies. Each shows what it is based on.</p>
        {sug.data && sug.data.aiAvailable === false && <Note>AI drafting: <strong>Unavailable</strong> — no AI provider is configured. Suggestions are rule-based; write the content yourself from real knowledge.</Note>}
        {sug.data && sug.data.aiAvailable === true && <AiPlannerAssist json={json} say={say} pages={pages} onSaved={ideas.reload} />}
        {sug.loading && !sug.data ? <Loading /> : sug.error ? <Note tone="red">{sug.error}</Note> : (
          <ul className="space-y-3">
            {recs(sug.data && sug.data.suggestions).map((s, n) => (
              <li key={`${String(s.title)}-${n}`} className="rounded-xl border border-gray-100 p-4 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sevTone[String(s.priority)] || sevTone.low}`}>{String(s.priority)}</span>
                  <span className="text-xs font-bold text-gray-500">{String(s.kind).replace("_", " ")}</span>
                  <span className="font-bold text-gray-900">{String(s.title)}</span>
                </div>
                <p className="text-sm text-gray-700">{String(s.rationale)}</p>
                {arr(s.outline).length > 0 && <ul className="text-xs text-gray-600 list-disc pl-5">{arr(s.outline).map((o) => <li key={String(o)}>{String(o)}</li>)}</ul>}
                {recs(s.evidence).map((e, k) => <Evidence key={k} value={e} />)}
                <button type="button" className={btn} onClick={() => save(s)}><Lightbulb size={14} /> Save to plan</button>
              </li>
            ))}
            {sug.data && recs(sug.data.suggestions).length === 0 && <li className="text-sm text-gray-500">No suggestions right now.</li>}
          </ul>
        )}
      </Panel>
    </div>
  );
}

// ---------------- Local SEO & trust ----------------

const LOCAL_ITEMS: [string, string, string][] = [
  ["local.gbp_verified", "Google Business Profile is claimed and verified", "Manage it at business.google.com. Only the business owner can verify it."],
  ["local.gbp_category", "Primary and secondary categories match the services you actually offer", ""],
  ["local.gbp_details", "Hours, phone, website and service area are filled in and current", ""],
  ["local.gbp_photos", "Real photos of the studio, team and work are uploaded", "Use your own photos only."],
  ["local.nap_consistent", "Name, address and phone are identical on the website, Google profile and directories", ""],
  ["local.citations", "Listed in relevant directories (e.g. Justdial, Sulekha, IndiaMART, industry associations)", "Record each listing in Backlinks with relationship “directory”."],
  ["local.reviews_process", "There is a process to ask real clients for reviews after a project", "Never buy, incentivise or write reviews."],
  ["local.reviews_replies", "Every Google review gets a reply", ""],
  ["local.map", "Contact page shows a map and directions", ""],
];
const TRUST_ITEMS: [string, string, string][] = [
  ["trust.team", "About page names real people with their roles and experience", ""],
  ["trust.work_photos", "Portfolio uses your own project photos and videos", ""],
  ["trust.client_permission", "Client names and logos are shown only with permission", ""],
  ["trust.testimonials_real", "Every testimonial is from a real client and can be verified", ""],
  ["trust.case_study_numbers", "Case-study results are verified and dated; no estimates presented as results", ""],
  ["trust.author_bylines", "Blog posts show a real author and date", ""],
  ["trust.contact", "Phone, email and address are easy to find on every page", ""],
  ["trust.policies", "Privacy policy and terms are current", ""],
];

function LocalTrustPanel({ json, say }: Common) {
  const signals = useLoad(json, "/api/admin/seo/local/signals", asRecord);
  const checklist = useLoad(json, "/api/admin/seo/checklist", asList);
  const byKey = useMemo(() => Object.fromEntries((checklist.data || []).map((c) => [String(c.item_key), c])), [checklist.data]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const update = async (key: string, status: string) => {
    const { res } = await json(`/api/admin/seo/checklist/${key}`, "PUT", { status, note: notes[key] ?? str(byKey[key] && byKey[key].note) ?? "" });
    if (!res.ok) say("Could not save.", false);
    await checklist.reload();
  };
  const list = (title: string, items: [string, string, string][]) => (
    <Panel title={title} icon={title.startsWith("Local") ? MapPin : ShieldCheck}>
      <ul className="divide-y divide-gray-100">
        {items.map(([key, label, hint]) => {
          const row = byKey[key];
          const status = row ? String(row.status) : "todo";
          return (
            <li key={key} className="py-3 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-sm font-semibold ${status === "done" ? "text-green-800" : "text-gray-900"}`}>{status === "done" ? "✓ " : ""}{label}</span>
                <select aria-label={`Status for ${label}`} className={`${input} w-32 ml-auto`} value={status} onChange={(e) => update(key, e.target.value)}>
                  <option value="todo">To do</option>
                  <option value="done">Done</option>
                  <option value="na">Not applicable</option>
                </select>
              </div>
              {hint && <p className="text-xs text-gray-500">{hint}</p>}
              <input aria-label={`Note for ${label}`} placeholder="Note (optional) — saved when you change the status" className={`${input} text-xs`} value={notes[key] ?? String((row && row.note) || "")} onChange={(e) => setNotes({ ...notes, [key]: e.target.value })} />
              {row && <p className="text-[11px] text-gray-400">Updated {fmtDate(row.updatedAt)} by {String(row.admin || "—")}</p>}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
  const sig = signals.data;
  const biz = sig && isRecord(sig.business) ? sig.business : null;
  return (
    <div className="space-y-6">
      <Panel title="Signals checked automatically" icon={CheckCircle} action={<button type="button" className={btn} onClick={() => signals.reload()}><RefreshCw size={14} /> Refresh</button>}>
        {signals.loading && !sig ? <Loading /> : signals.error ? <Note tone="red">{signals.error}</Note> : sig && (
          <>
            {biz && <p className="text-sm text-gray-600">Business details used for checks: <strong>{String(biz.name)}</strong> · {String(biz.telephone)} · {String(biz.email)}</p>}
            {!sig.auditRun && <Note tone="amber">Some checks need a technical audit. Run one from the Technical Audit tab.</Note>}
            <ul className="divide-y divide-gray-100">
              {recs(sig.signals).map((s) => (
                <li key={String(s.key)} className="py-2 flex flex-wrap items-center gap-2 text-sm">
                  {s.ok === true ? <CheckCircle size={16} className="text-green-600" /> : s.ok === false ? <AlertCircle size={16} className="text-red-600" /> : <span className="text-gray-400 w-4 text-center">?</span>}
                  <span className="font-semibold">{String(s.label)}</span>
                  {str(s.evidence) && <span className="text-xs text-gray-500">{String(s.evidence)}</span>}
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>
      {checklist.error && <Note tone="red">{checklist.error}</Note>}
      {list("Local SEO checklist", LOCAL_ITEMS)}
      {list("Experience & trust checklist", TRUST_ITEMS)}
    </div>
  );
}

// ---------------- Backlinks ----------------

const OUTREACH = ["none", "planned", "contacted", "replied", "agreed", "declined"];
const LINK_TONE: Record<string, string> = { found: "text-green-700", found_nofollow: "text-amber-700", missing: "text-red-700", unverified: "text-gray-500" };

function BacklinksPanel({ json, say }: Common) {
  const list = useLoad(json, "/api/admin/seo/backlinks", asList);
  const blank = { source_url: "", target_url: "https://geniemedia.in/", relationship: "", contact: "", outreach: "none", follow_up: "", notes: "" };
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState<string>("");
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { res, data } = await json("/api/admin/seo/backlinks", "POST", form);
    say(res.ok ? "Backlink saved. Use Verify to check it is really there." : (data && str(data.message)) || "Could not save.", res.ok);
    if (res.ok) {
      setForm(blank);
      await list.reload();
    }
  };
  const verify = async (id: unknown) => {
    setBusy(String(id));
    const { data } = await json(`/api/admin/seo/backlinks/${String(id)}/verify`, "POST", {});
    setBusy("");
    say(`Result: ${String((data && data.link_status) || "error")}`, Boolean(data && String(data.link_status).startsWith("found")));
    await list.reload();
  };
  const setOutreach = async (row: RawRecord, outreach: string) => {
    await json(`/api/admin/seo/backlinks/${String(row.id)}`, "PUT", { ...row, outreach, follow_up: str(row.follow_up) ? String(row.follow_up).slice(0, 10) : "" });
    await list.reload();
  };
  const remove = async (id: unknown) => {
    if (!window.confirm("Delete this backlink record?")) return;
    await json(`/api/admin/seo/backlinks/${String(id)}`, "DELETE");
    await list.reload();
  };
  return (
    <Panel title="Backlink tracker" icon={ExternalLink}>
      <p className="text-sm text-gray-600">Record links you earn or are working on (partners, directories, press, clients). “Verify” fetches the page and checks the link is really there. Only pursue genuine links — no paid link schemes.</p>
      <form onSubmit={add} className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input aria-label="Linking page URL" required placeholder="Linking page URL (https://…)" className={input} value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} />
        <input aria-label="Your page it links to" placeholder="Your page it links to" className={input} value={form.target_url} onChange={(e) => setForm({ ...form, target_url: e.target.value })} />
        <input aria-label="Relationship" placeholder="Relationship (partner, directory, press…)" className={input} value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} />
        <input aria-label="Contact" placeholder="Contact person / email" className={input} value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
        <select aria-label="Outreach status" className={input} value={form.outreach} onChange={(e) => setForm({ ...form, outreach: e.target.value })}>{OUTREACH.map((o) => <option key={o} value={o}>{o}</option>)}</select>
        <input aria-label="Follow-up date" type="date" className={input} value={form.follow_up} onChange={(e) => setForm({ ...form, follow_up: e.target.value })} />
        <input aria-label="Notes" placeholder="Notes" className={`${input} md:col-span-2`} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button type="submit" className={primary}>Add backlink</button>
      </form>
      {list.loading && !list.data ? <Loading /> : list.error ? <Note tone="red">{list.error}</Note> : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-left text-gray-500"><th className="py-1">Domain / page</th><th>Links to</th><th>Relationship</th><th>Outreach</th><th>Link status</th><th>Checked</th><th /></tr></thead>
            <tbody>
              {(list.data || []).map((b) => (
                <tr key={String(b.id)} className="border-t border-gray-100 align-top">
                  <td className="py-1.5 pr-2"><strong>{String(b.domain)}</strong><br /><a className="break-all underline text-gray-500" href={String(b.source_url)} target="_blank" rel="noopener noreferrer nofollow">{String(b.source_url)}</a></td>
                  <td className="break-all pr-2">{pathOf(String(b.target_url))}</td>
                  <td className="pr-2">{String(b.relationship || "—")}</td>
                  <td className="pr-2"><select aria-label="Outreach" className="border border-gray-200 rounded-lg px-1 py-0.5" value={String(b.outreach)} onChange={(e) => setOutreach(b, e.target.value)}>{OUTREACH.map((o) => <option key={o} value={o}>{o}</option>)}</select>{str(b.follow_up) && <div className="text-gray-400">follow up {String(b.follow_up).slice(0, 10)}</div>}</td>
                  <td className={`pr-2 font-bold ${LINK_TONE[String(b.link_status)] || "text-red-700"}`}>{String(b.link_status).replace("_", " ")}{str(b.rel) ? ` (${String(b.rel)})` : ""}</td>
                  <td className="pr-2">{b.last_verified ? fmtDate(b.last_verified) : "never"}</td>
                  <td className="whitespace-nowrap">
                    <button type="button" className="underline mr-2" disabled={busy === String(b.id)} onClick={() => verify(b.id)}>{busy === String(b.id) ? "Checking…" : "Verify"}</button>
                    <button type="button" aria-label="Delete backlink" className="text-gray-400 hover:text-red-600" onClick={() => remove(b.id)}><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
              {list.data && list.data.length === 0 && <tr><td colSpan={7} className="py-3 text-gray-500">No backlinks recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

// ---------------- Integrations ----------------

function IntegrationsPanel({ json, say, liveConfigured }: Common & { liveConfigured: boolean | null }) {
  const gsc = useLoad(json, "/api/admin/seo/gsc/status", asRecord);
  const { status: aiStatus } = useAiStatus(json);
  const [importing, setImporting] = useState(false);
  const exportConfigs = async () => {
    const { res, data } = await json("/api/admin/seo/configs/export");
    if (!res.ok || !data) return say("Export failed.", false);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `seo-configs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importConfigs = async (file: File) => {
    setImporting(true);
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const pagesIn = isRecord(parsed) ? arr(parsed.pages) : [];
      if (!pagesIn.length) return say("The file has no pages.", false);
      if (!window.confirm(`Import ${pagesIn.length} page configuration(s) as drafts? Nothing is published; empty values never overwrite existing ones.`)) return;
      const { res, data } = await json("/api/admin/seo/configs/import", "POST", { pages: pagesIn });
      const results = recs(data && data.results);
      say(res.ok ? `Imported ${results.filter((r) => r.status === "draft saved").length} draft(s); ${results.filter((r) => r.status === "skipped").length} skipped.` : (data && str(data.message)) || "Import failed.", res.ok);
    } catch {
      say("That file is not valid JSON.", false);
    } finally {
      setImporting(false);
    }
  };
  const g = gsc.data;
  const rows: [string, React.ReactNode, string][] = [
    ["Live publishing", liveConfigured === null ? "Unknown" : liveConfigured ? "Configured" : "Not configured", "SEO_SYNC_URL and SEO_SYNC_SECRET on the backend; the same SEO_SYNC_SECRET in frontend-next/.env before building."],
    ["Google Search Console", g ? (g.connected ? `Connected — ${String(g.property || "")}` : g.configured ? "Configured, not connected" : "Not configured") : "…", "GSC_CLIENT_ID, GSC_CLIENT_SECRET, GSC_REDIRECT_URI, GSC_TOKEN_KEY (and optional GSC_ADMIN_RETURN_URL, GSC_PROPERTY)."],
    ["PageSpeed Insights", "Available", "Works without a key at low volume; set PSI_API_KEY for reliable quota."],
    ["Keyword volume data", g && str(g.keywordDataProvider) && g.keywordDataProvider !== "none" ? String(g.keywordDataProvider) : "Unavailable", "No provider is configured. Volumes are shown as unavailable, never estimated."],
    ["AI suggestions (Gemini)", aiStatus ? (aiStatus.configured ? `Configured — ${aiStatus.model}` : "Unavailable") : "…", "GEMINI_API_KEY and GEMINI_MODEL on the backend. Suggestions are drafts that need admin approval."],
  ];
  return (
    <div className="space-y-6">
      <Panel title="Integrations" icon={Plug}>
        <p className="text-sm text-gray-600">Credentials live only in the backend environment. They are never sent to the browser or included in the website.</p>
        <ul className="divide-y divide-gray-100">
          {rows.map(([name, state, hint]) => (
            <li key={name} className="py-2.5">
              <div className="flex flex-wrap gap-2 text-sm"><span className="font-bold">{name}</span><span className="ml-auto font-semibold text-gray-700">{state}</span></div>
              <p className="text-xs text-gray-500">{hint}</p>
            </li>
          ))}
        </ul>
      </Panel>
      <AiProviderSettings json={json} say={say} />
      <Panel title="Export & import page configurations" icon={Download}>
        <p className="text-sm text-gray-600">Download every page&apos;s draft and published SEO settings as JSON, or import a file as drafts for review.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btn} onClick={exportConfigs}><Download size={14} /> Export JSON</button>
          <label className={`${btn} cursor-pointer`}>
            {importing ? <Loader size={14} className="animate-spin" /> : <Upload size={14} />} Import JSON
            <input type="file" accept="application/json,.json" className="sr-only" onChange={(e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; if (f) void importConfigs(f); }} />
          </label>
        </div>
      </Panel>
    </div>
  );
}

export function SeoGrowthArea(props: Common & { section: GrowthSection; onSection: (s: GrowthSection) => void; liveConfigured: boolean | null }) {
  const { section, onSection } = props;
  return (
    <div className="space-y-6">
      <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin]" role="tablist" aria-label="SEO tools">
        {GROWTH_SECTIONS.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" role="tab" aria-selected={section === id} onClick={() => onSection(id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap border ${section === id ? "bg-[#6B4A2D] text-white border-[#6B4A2D]" : "bg-white text-gray-600 border-gray-200 hover:border-[#6B4A2D]"}`}>
            <Icon size={14} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>
      {section === "gsc" && <SearchConsolePanel {...props} />}
      {section === "opportunities" && <OpportunitiesPanel {...props} />}
      {section === "indexing" && <IndexingPanel {...props} />}
      {section === "audit" && <AuditPanel {...props} />}
      {section === "performance" && <PerformancePanel {...props} />}
      {section === "links" && <LinksPanel {...props} />}
      {section === "content" && <ContentPanel {...props} />}
      {section === "local" && <LocalTrustPanel {...props} />}
      {section === "backlinks" && <BacklinksPanel {...props} />}
      {section === "integrations" && <IntegrationsPanel {...props} />}
    </div>
  );
}
