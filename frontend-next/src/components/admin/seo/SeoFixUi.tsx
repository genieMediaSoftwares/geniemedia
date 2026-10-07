"use client";

import React, { useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle, ChevronDown, Eye, EyeOff, RefreshCw, ShieldCheck, Wand2, Wrench, X } from "lucide-react";

import type { CategoryId, HealthCategory, HealthReport, SeoIssue, Suggestion } from "@/lib/seo/keywordHealth";

const BRAND = "#6B4A2D";

export const SEVERITY_ORDER: SeoIssue["severity"][] = ["critical", "high", "medium", "low", "info"];

const SEVERITY_STYLE: Record<SeoIssue["severity"], { label: string; cls: string }> = {
  critical: { label: "Critical", cls: "bg-red-600 text-white" },
  high: { label: "High", cls: "bg-orange-500 text-white" },
  medium: { label: "Medium", cls: "bg-amber-200 text-amber-900" },
  low: { label: "Low", cls: "bg-sky-100 text-sky-800" },
  info: { label: "Info", cls: "bg-gray-100 text-gray-700" },
};

const MODE_LABEL: Record<SeoIssue["mode"], string> = {
  SAFE_AUTO_FIX: "Safe fix",
  REVIEW_REQUIRED: "Review before applying",
  MANUAL_ONLY: "Manual edit",
};

export function SeverityBadge({ severity }: { severity: SeoIssue["severity"] }) {
  const s = SEVERITY_STYLE[severity];
  return <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>;
}

export function WordDiff({ before, after }: { before: string; after: string }) {
  const a = before.split(/(\s+)/);
  const b = after.split(/(\s+)/);
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const removed: React.ReactNode[] = [];
  const added: React.ReactNode[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      removed.push(a[i]);
      added.push(b[j]);
      i++;
      j++;
    } else if (j < b.length && (i >= a.length || dp[i][j + 1] >= dp[i + 1][j])) {
      added.push(/\S/.test(b[j]) ? <ins key={`a${j}`} className="bg-green-100 text-green-900 no-underline rounded px-0.5">{b[j]}</ins> : b[j]);
      j++;
    } else {
      removed.push(/\S/.test(a[i]) ? <del key={`r${i}`} className="bg-red-100 text-red-800 rounded px-0.5">{a[i]}</del> : a[i]);
      i++;
    }
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2 text-sm">
      <div className="rounded-lg border border-gray-200 p-3 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Before</p>
        <p className="break-words">{before ? removed : <span className="text-gray-400">(empty)</span>}</p>
      </div>
      <div className="rounded-lg border border-green-200 bg-green-50/40 p-3 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">After</p>
        <p className="break-words">{after ? added : <span className="text-gray-400">(empty)</span>}</p>
      </div>
    </div>
  );
}

const suggestionAfter = (s: Suggestion): string => {
  if (s.kind === "set-field") return typeof s.value === "boolean" ? (s.value ? "Allowed" : "Blocked") : String(s.value);
  if (s.kind === "add-link") return `${s.link.label} → ${s.link.href}`;
  return `H2: ${s.section.heading}`;
};

function HighlightTerms({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  const re = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return (
    <>
      {text.split(re).map((part, i) => (i % 2 ? <mark key={i} className="bg-amber-200 rounded px-0.5">{part}</mark> : <React.Fragment key={i}>{part}</React.Fragment>))}
    </>
  );
}

export function SeoFixPanel({
  issue,
  resolved,
  currentValue,
  sourceFile,
  onApply,
  onEdit,
  onClose,
}: {
  issue: SeoIssue;
  resolved: boolean;
  currentValue?: string;
  sourceFile?: string;
  onApply: (s: Suggestion) => void;
  onEdit: () => void;
  onClose: () => void;
}) {
  const [preview, setPreview] = useState<number | null>(issue.suggestions.length === 1 ? 0 : null);
  const before = currentValue ?? issue.currentValue ?? "";
  return (
    <section aria-label={`Fixing: ${issue.title}`} className="bg-white rounded-2xl border-2 shadow-lg p-5 sm:p-6 space-y-4" style={{ borderColor: BRAND }}>
      <div className="flex flex-wrap items-start gap-2">
        <button type="button" onClick={onClose} className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-[#6B4A2D]">
          <ArrowLeft size={14} aria-hidden="true" /> Back to issues
        </button>
        <span className="ml-auto flex items-center gap-2">
          <SeverityBadge severity={issue.severity} />
          <span className="text-[11px] font-semibold text-gray-500">{MODE_LABEL[issue.mode]}</span>
        </span>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Fixing</p>
        <h3 className="text-lg font-extrabold text-gray-900">{issue.title}</h3>
        {resolved && (
          <p role="status" className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-green-700 bg-green-50 rounded-lg px-3 py-1.5">
            <CheckCircle size={15} aria-hidden="true" /> Resolved in the draft — save and publish to make it live.
          </p>
        )}
      </div>
      <dl className="grid gap-3 sm:grid-cols-2 text-sm">
        <div className="sm:col-span-2"><dt className="font-semibold text-gray-700">Why it matters</dt><dd className="text-gray-600">{issue.why}</dd></div>
        {before && <div className="min-w-0"><dt className="font-semibold text-gray-700">Current</dt><dd className="text-gray-600 break-words">{before}</dd></div>}
        {issue.expectedValue && <div className="min-w-0"><dt className="font-semibold text-gray-700">Expected</dt><dd className="text-gray-600 break-words">{issue.expectedValue}</dd></div>}
        <div className="sm:col-span-2"><dt className="font-semibold text-gray-700">Recommended</dt><dd className="text-gray-600">{issue.recommendation}</dd></div>
      </dl>
      {issue.detail && issue.detail.length > 0 && (
        <ul className="text-sm text-gray-700 list-disc pl-5 space-y-0.5">{issue.detail.map((d) => <li key={d}>{d}</li>)}</ul>
      )}

      {issue.occurrences && issue.occurrences.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Where it appears ({issue.occurrences.length} paragraphs, most mentions first)</p>
          <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {issue.occurrences.slice(0, 15).map((o, i) => (
              <li key={i} className="rounded-lg bg-gray-50 p-3 text-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">{o.section} · {o.count} mention{o.count > 1 ? "s" : ""}</p>
                <p className="text-gray-700"><HighlightTerms text={o.text} terms={o.terms} /></p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {issue.id === "MISSING_CASE_STUDY_LINK" && issue.suggestions.length === 0 && (
        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
          No published case study exists for this service yet, so there is nothing real to link to.{" "}
          <a href="/admin/case-studies" className="font-bold text-[#6B4A2D] underline underline-offset-2">Create a case study</a>, publish it, then come back to add the link.
        </p>
      )}

      {issue.mode === "MANUAL_ONLY" && (issue.target === "content" || issue.target === "keywords") && (
        <p className="text-xs text-gray-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
          {issue.target === "content"
            ? <>This text is part of the page code{sourceFile ? <> (mainly <code className="break-all">{sourceFile}</code>)</> : null}, not an admin field. Edit it there, or add an approved section in the Configuration tab. Nothing is changed automatically.</>
            : <>Open the Keywords tab to change the keyword type or archive it.</>}
        </p>
      )}

      {issue.suggestions.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            Suggestions <span className="text-[10px] font-black uppercase tracking-wider bg-gray-900 text-white rounded px-1.5 py-0.5">Rule-based suggestion</span>
          </p>
          <ul className="space-y-3">
            {issue.suggestions.map((s, i) => (
              <li key={i} className="rounded-xl border border-gray-200 p-3 space-y-2">
                <p className="text-sm font-semibold text-gray-900 break-words">{s.label}</p>
                <p className="text-xs text-gray-500">{s.reason}</p>
                {preview === i && (s.kind === "set-field" ? <WordDiff before={before} after={suggestionAfter(s)} /> : <WordDiff before="" after={suggestionAfter(s)} />)}
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setPreview(preview === i ? null : i)} className="px-3 py-1.5 rounded-lg border-2 border-gray-200 text-xs font-bold hover:border-[#6B4A2D]">
                    {preview === i ? "Hide preview" : "Preview change"}
                  </button>
                  <button type="button" onClick={() => onApply(s)} aria-label={`Apply suggestion: ${s.label}`} className="px-3 py-1.5 rounded-lg text-white text-xs font-bold" style={{ background: BRAND }}>
                    Apply suggestion
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {issue.target !== "content" && (
          <button type="button" onClick={onEdit} className="px-4 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold hover:border-[#6B4A2D]">
            Edit manually
          </button>
        )}
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-gray-100 text-sm font-bold">Cancel</button>
      </div>
      <p className="text-[11px] text-gray-500">Applying only changes the draft. Search Console data unavailable (not connected), so no search volumes or rankings are shown.</p>
    </section>
  );
}

function ScoreRow({ live, draft, issues, onFix, onExplainToggle, open }: { live: HealthCategory; draft: HealthCategory; issues: SeoIssue[]; onFix: () => void; onExplainToggle: () => void; open: boolean }) {
  const delta = Math.round((draft.score - live.score) * 10) / 10;
  return (
    <li className="py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-gray-900 min-w-[10rem] flex-1">{live.label}</span>
        <span className="text-sm font-black tabular-nums">{live.score}/{live.max}</span>
        {delta !== 0 && <span className={`text-xs font-bold ${delta > 0 ? "text-green-700" : "text-red-700"}`}>draft {draft.score}/{draft.max} ({delta > 0 ? "+" : ""}{delta})</span>}
        <button type="button" onClick={onExplainToggle} aria-expanded={open} aria-label={`Why is ${live.label} ${live.score} out of ${live.max}?`} className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-semibold hover:border-[#6B4A2D] flex items-center gap-1">
          Why? <ChevronDown size={12} className={open ? "rotate-180" : ""} aria-hidden="true" />
        </button>
        {draft.needsFix && issues.length > 0 ? (
          <button type="button" onClick={onFix} aria-label={`Fix ${live.label}`} className="px-3 py-1 rounded-lg text-white text-xs font-bold flex items-center gap-1" style={{ background: BRAND }}>
            <Wrench size={12} aria-hidden="true" /> Fix
          </button>
        ) : (
          <span className="px-3 py-1 text-xs font-bold text-green-700 flex items-center gap-1"><CheckCircle size={12} aria-hidden="true" /> {draft.needsFix ? "No automatic fix" : "Good"}</span>
        )}
      </div>
      {open && (
        <div className="mt-2 rounded-lg bg-gray-50 p-3 text-sm space-y-2">
          <p className="text-gray-600">{live.measured}</p>
          <ul className="space-y-1">
            {draft.checks.map((c) => (
              <li key={c.label} className={`flex items-start gap-2 ${c.ok ? "text-green-800" : "text-red-800"}`}>
                <span aria-hidden="true">{c.ok ? "✓" : "✗"}</span><span>{c.label}</span>
              </li>
            ))}
          </ul>
          {issues.length > 0 && <p className="text-gray-700"><strong>To improve:</strong> {issues[0].recommendation}</p>}
        </div>
      )}
    </li>
  );
}

export function FixCenter({
  live,
  draft,
  dismissed,
  onFix,
  onDismiss,
  onRestore,
  onReanalyze,
  reanalyzing,
  onApplyMany,
}: {
  live: HealthReport;
  draft: HealthReport;
  dismissed: Set<string>;
  onFix: (issue: SeoIssue) => void;
  onDismiss: (id: string) => void;
  onRestore: (id: string) => void;
  onReanalyze: () => void;
  reanalyzing: boolean;
  onApplyMany: (items: Suggestion[]) => void;
}) {
  const [open, setOpen] = useState<CategoryId | null>(null);
  const [review, setReview] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [showDismissed, setShowDismissed] = useState(false);

  const draftIds = new Set(draft.issues.map((i) => i.id));
  const resolved = live.issues.filter((i) => !draftIds.has(i.id));
  const openIssues = draft.issues.filter((i) => !dismissed.has(i.id)).sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity));
  const hidden = draft.issues.filter((i) => dismissed.has(i.id));
  const delta = draft.score - live.score;

  const fixable = draft.issues.flatMap((i) => i.suggestions.map((s, n) => ({ key: `${i.id}:${n}`, issue: i, s })));
  const safe = fixable.filter((f) => f.issue.mode === "SAFE_AUTO_FIX");

  return (
    <div className="space-y-5">
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Current (live page)</p>
            <p className="text-3xl font-black text-gray-900 tabular-nums">{live.score}/100</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Draft</p>
            <p className="text-3xl font-black text-gray-900 tabular-nums">{draft.score}/100</p>
          </div>
          {delta !== 0 && <p className={`text-sm font-bold ${delta > 0 ? "text-green-700" : "text-red-700"}`}>Potential change: {delta > 0 ? "+" : ""}{delta}</p>}
          <div className="ml-auto flex flex-wrap gap-2">
            <button type="button" onClick={onReanalyze} disabled={reanalyzing} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold hover:border-[#6B4A2D] disabled:opacity-60">
              <RefreshCw size={14} className={reanalyzing ? "animate-spin" : ""} aria-hidden="true" /> Re-analyze live page
            </button>
            <button type="button" onClick={() => setReview((r) => !r)} disabled={!fixable.length} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-50" style={{ background: BRAND }}>
              <Wand2 size={14} aria-hidden="true" /> Fix issues ({fixable.length})
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">An internal content-quality score, not a ranking prediction. The live score is measured on the page as currently built; the draft score includes your unsaved and unpublished changes.</p>
      </section>

      {review && (
        <section className="bg-white rounded-2xl shadow-sm border-2 border-amber-200 p-5 sm:p-6 space-y-3" aria-label="Review fixes">
          <h3 className="font-extrabold text-gray-900">Review fixes</h3>
          <p className="text-xs text-gray-500">Selected changes go into the draft only. Safe fixes use existing pages and settings; everything else needs your review.</p>
          <ul className="space-y-2">
            {fixable.map((f) => (
              <li key={f.key} className="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
                <input
                  type="checkbox"
                  aria-label={f.s.label}
                  className="mt-1"
                  checked={picked.has(f.key)}
                  onChange={(e) => setPicked((p) => { const n = new Set(p); if (e.target.checked) n.add(f.key); else n.delete(f.key); return n; })}
                />
                <div className="min-w-0 text-sm">
                  <p className="font-semibold text-gray-900 break-words">{f.s.label}</p>
                  <p className="text-xs text-gray-500">{f.issue.title} · {MODE_LABEL[f.issue.mode]}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={!picked.size} onClick={() => { onApplyMany(fixable.filter((f) => picked.has(f.key)).map((f) => f.s)); setPicked(new Set()); setReview(false); }} className="px-4 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-50" style={{ background: BRAND }}>
              Apply selected ({picked.size})
            </button>
            <button type="button" disabled={!safe.length} onClick={() => { onApplyMany(safe.map((f) => f.s)); setReview(false); }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-green-300 bg-green-50 text-green-800 text-sm font-bold disabled:opacity-50">
              <ShieldCheck size={14} aria-hidden="true" /> Apply all safe fixes ({safe.length})
            </button>
            <button type="button" onClick={() => setReview(false)} className="px-4 py-2 rounded-xl bg-gray-100 text-sm font-bold">Cancel</button>
          </div>
        </section>
      )}

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
        <h3 className="font-extrabold text-gray-900 mb-1">Issues ({openIssues.length})</h3>
        {openIssues.length === 0 ? (
          <p className="text-sm text-green-700">No open issues in the draft.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {openIssues.map((i) => (
              <li key={i.id} className="py-3 flex flex-wrap items-start gap-3">
                <AlertTriangle size={16} className="mt-0.5 text-amber-500 shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><SeverityBadge severity={i.severity} /><span className="font-semibold text-gray-900 break-words">{i.title}</span></div>
                  <p className="text-xs text-gray-500 mt-0.5">{i.recommendation}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button type="button" onClick={() => onFix(i)} aria-label={`Fix: ${i.title}`} className="px-3 py-1.5 rounded-lg text-white text-xs font-bold flex items-center gap-1" style={{ background: BRAND }}>
                    <Wrench size={12} aria-hidden="true" /> {i.mode === "MANUAL_ONLY" ? "Review" : "Fix"}
                  </button>
                  <button type="button" onClick={() => onDismiss(i.id)} aria-label={`Dismiss: ${i.title}`} title="Hide for now (does not change the score)" className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50">
                    <EyeOff size={12} aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {resolved.length > 0 && (
          <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">
            <p className="font-bold mb-1">Resolved in the draft ({resolved.length})</p>
            <ul className="space-y-0.5">{resolved.map((i) => <li key={i.id} className="flex gap-2"><CheckCircle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />{i.title}</li>)}</ul>
            <p className="text-xs mt-1">Save and publish, then rebuild and upload; the live score updates after you re-analyze the live page.</p>
          </div>
        )}
        {hidden.length > 0 && (
          <div className="mt-3">
            <button type="button" onClick={() => setShowDismissed((s) => !s)} className="text-xs font-semibold text-gray-500 flex items-center gap-1">
              <Eye size={12} aria-hidden="true" /> {showDismissed ? "Hide" : "Show"} dismissed ({hidden.length}) — dismissing never changes the score
            </button>
            {showDismissed && (
              <ul className="mt-2 space-y-1 text-sm">
                {hidden.map((i) => (
                  <li key={i.id} className="flex items-center gap-2 text-gray-500">
                    <span className="flex-1 min-w-0 break-words">{i.title}</span>
                    <button type="button" onClick={() => onRestore(i.id)} aria-label={`Restore: ${i.title}`} className="p-1 rounded hover:bg-gray-100"><X size={12} aria-hidden="true" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
        <h3 className="font-extrabold text-gray-900 mb-1">Score breakdown</h3>
        <ul className="divide-y divide-gray-100">
          {live.categories.map((c) => {
            const d = draft.categories.find((x) => x.id === c.id) || c;
            const catIssues = draft.issues.filter((i) => i.category === c.id);
            return (
              <ScoreRow
                key={c.id}
                live={c}
                draft={d}
                issues={catIssues}
                open={open === c.id}
                onExplainToggle={() => setOpen(open === c.id ? null : c.id)}
                onFix={() => catIssues[0] && onFix(catIssues[0])}
              />
            );
          })}
        </ul>
      </section>
    </div>
  );
}
