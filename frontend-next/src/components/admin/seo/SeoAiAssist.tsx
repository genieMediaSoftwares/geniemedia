"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Loader, RefreshCw, Sparkles } from "lucide-react";
import { arr, isRecord, num, str, type RawRecord } from "@/lib/api/coerce";

type JsonFn = (path: string, method?: string, body?: unknown) => Promise<{ res: Response; data: RawRecord | null }>;
type Say = (msg: string, ok?: boolean) => void;

export type AiTask = "metadata" | "topics" | "intent" | "content_gap" | "faq_outline" | "internal_links" | "fix_warning" | "quality";
export type AiDraftInput = {
  seoTitle: string;
  metaDescription: string;
  preferredH1: string;
  primaryTopic: string;
  primaryKeyword: string;
  secondaryTopics: string[];
  searchIntent: string;
  pageType: string;
};
export type AiIssue = { id: string; title: string; detail: string; field: string };

export type AiStatus = {
  configured: boolean;
  model: string;
  dailyLimit: number;
  lastSuccessfulTestAt: number | null;
  lastTest: { status: string; error: string | null; at: number } | null;
  today: { requests: number; cached: number; errors: number; inputTokens: number; outputTokens: number };
};

type AiResponse = {
  result: RawRecord;
  model: string;
  cached: boolean;
  generatedAt: number;
  unverified: string[];
  notes: string[];
  dataSources: { pageContent: boolean; searchConsole: boolean; keywords: number };
};

const btn = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-200 bg-white hover:border-[#6B4A2D] hover:text-[#6B4A2D] disabled:opacity-50";
const primary = "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-white bg-[#6B4A2D] hover:bg-[#5a3d24] disabled:opacity-50";

let statusCache: { at: number; value: AiStatus | null } | null = null;

const toStatus = (d: RawRecord | null): AiStatus | null => {
  if (!d) return null;
  const today = isRecord(d.today) ? d.today : {};
  const lt = isRecord(d.lastTest) ? d.lastTest : null;
  return {
    configured: d.configured === true,
    model: str(d.model) || "",
    dailyLimit: num(d.dailyLimit) || 0,
    lastSuccessfulTestAt: num(d.lastSuccessfulTestAt),
    lastTest: lt ? { status: str(lt.status) || "", error: str(lt.error), at: num(lt.at) || 0 } : null,
    today: { requests: num(today.requests) || 0, cached: num(today.cached) || 0, errors: num(today.errors) || 0, inputTokens: num(today.inputTokens) || 0, outputTokens: num(today.outputTokens) || 0 },
  };
};

export function useAiStatus(json: JsonFn) {
  const [status, setStatus] = useState<AiStatus | null>(statusCache ? statusCache.value : null);
  const [missing, setMissing] = useState(false);
  const reload = useCallback(async (fresh = false) => {
    if (!fresh && statusCache && Date.now() - statusCache.at < 60000) {
      setStatus(statusCache.value);
      return;
    }
    const { res, data } = await json("/api/admin/seo/ai/status");
    if (res.status === 404) setMissing(true);
    const value = res.ok ? toStatus(data) : null;
    statusCache = { at: Date.now(), value };
    setStatus(value);
  }, [json]);
  useEffect(() => {
    queueMicrotask(() => void reload());
  }, [reload]);
  return { status, missing, reload };
}

function AiUnavailable({ missing }: { missing: boolean }) {
  return (
    <p className="text-xs text-gray-500 flex items-center gap-1.5">
      <Sparkles size={13} aria-hidden="true" /> AI unavailable — {missing ? "deploy the updated backend first." : "GEMINI_API_KEY is not configured on the server."}
    </p>
  );
}

// Runs one AI task and renders the result through `children`. Results are
// drafts: nothing is applied until the admin clicks an apply button, and the
// applied value still needs Save Draft / Publish.
export function AiSuggest({
  json, pageId, task, draft, issue, title, description, children,
}: {
  json: JsonFn; say: Say; pageId: number; task: AiTask; draft?: AiDraftInput; issue?: AiIssue | null; title: string; description?: string;
  children: (result: RawRecord) => React.ReactNode;
}) {
  const { status, missing } = useAiStatus(json);
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<AiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (force: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const { res, data } = await json("/api/admin/seo/ai/suggest", "POST", { task, pageId, draft, issue: issue || undefined, force });
      if (!res.ok || !data || !isRecord(data.result)) {
        setOut(null);
        setError((data && str(data.message)) || "AI request failed.");
        return;
      }
      const ds = isRecord(data.dataSources) ? data.dataSources : {};
      setOut({
        result: data.result,
        model: str(data.model) || "",
        cached: data.cached === true,
        generatedAt: num(data.generatedAt) || Date.now(),
        unverified: arr(data.unverified).map(String),
        notes: arr(data.notes).map(String),
        dataSources: { pageContent: ds.pageContent === true, searchConsole: ds.searchConsole === true, keywords: num(ds.keywords) || 0 },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI request failed.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      setOut(null);
      setError(null);
    });
  }, [pageId, task, issue?.id]);

  const unavailable = missing || (status !== null && !status.configured);
  return (
    <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles size={15} className="text-violet-700" aria-hidden="true" />
        <p className="text-sm font-extrabold text-gray-900">{title}</p>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">AI draft · review before use</span>
        {!unavailable && (
          <div className="ml-auto flex gap-2">
            {out ? (
              <button type="button" className={btn} disabled={busy} onClick={() => run(true)}>{busy ? <Loader size={13} className="animate-spin" /> : <RefreshCw size={13} />} Regenerate</button>
            ) : (
              <button type="button" className={btn} disabled={busy || !status} onClick={() => run(false)}>{busy ? <Loader size={13} className="animate-spin" /> : <Sparkles size={13} />} {busy ? "Thinking…" : "Generate"}</button>
            )}
          </div>
        )}
      </div>
      {description && <p className="text-xs text-gray-600">{description}</p>}
      {unavailable && <AiUnavailable missing={missing} />}
      {error && <p role="alert" className="text-sm text-red-700 flex items-start gap-1.5"><AlertTriangle size={14} className="mt-0.5 shrink-0" /> {error}</p>}
      {out && (
        <div className="space-y-2">
          <p className="text-[11px] text-gray-500">
            {out.model} · {out.cached ? `cached result from ${new Date(out.generatedAt).toLocaleString()} (no new AI cost)` : `generated ${new Date(out.generatedAt).toLocaleTimeString()}`} · based on {out.dataSources.pageContent ? "the live page" : "configuration only"}
            {out.dataSources.searchConsole ? " + Search Console data" : ", no Search Console data"}
          </p>
          {out.notes.map((n) => (
            <p key={n} className={`text-xs flex items-start gap-1.5 ${/Check before using/.test(n) ? "text-amber-800 font-semibold" : "text-gray-600"}`}>
              {/Check before using/.test(n) && <AlertTriangle size={13} className="mt-0.5 shrink-0" />} {n}
            </p>
          ))}
          {children(out.result)}
        </div>
      )}
    </div>
  );
}

const Rationale = ({ text }: { text: unknown }) => (str(text) ? <span className="block text-[11px] text-gray-500">{String(text)}</span> : null);
const Row = ({ children }: { children: React.ReactNode }) => <li className="rounded-xl bg-white border border-gray-100 px-3 py-2 text-sm space-y-1">{children}</li>;
const recs = (v: unknown) => arr(v).filter(isRecord);
const strings = (v: unknown) => arr(v).map(String).filter(Boolean);

function Applied({ done, label = "Applied to draft" }: { done: boolean; label?: string }) {
  return done ? <span className="text-xs text-green-700 font-semibold inline-flex items-center gap-1"><CheckCircle size={13} /> {label}</span> : null;
}

// ---------- Configuration tab ----------

export function AiConfigAssist({
  json, say, pageId, draft, apply,
}: {
  json: JsonFn; say: Say; pageId: number; draft: AiDraftInput;
  apply: (field: "seoTitle" | "metaDescription" | "primaryTopic" | "secondaryTopic" | "searchIntent" | "contentTopic" | "faqTopic", value: string) => void;
}) {
  const [task, setTask] = useState<AiTask>("metadata");
  const [done, setDone] = useState<Set<string>>(new Set());
  const use = (field: Parameters<typeof apply>[0], value: string) => {
    apply(field, value);
    setDone(new Set(done).add(`${field}:${value}`));
    say("Applied to the draft. Review it, then Save Draft or Publish.");
  };
  const isDone = (field: string, value: string) => done.has(`${field}:${value}`);
  const tabs: [AiTask, string][] = [["metadata", "Title & description"], ["topics", "Topics"], ["intent", "Search intent"], ["content_gap", "Content gaps"], ["faq_outline", "FAQs"], ["quality", "Content quality"]];
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="AI suggestions">
        {tabs.map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={task === id} onClick={() => setTask(id)} className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${task === id ? "bg-violet-700 text-white border-violet-700" : "bg-white border-gray-200 text-gray-600"}`}>{label}</button>
        ))}
      </div>
      <AiSuggest json={json} say={say} pageId={pageId} task={task} draft={draft} title="AI suggestions for this page" description="Uses the live page content and the configuration below (including unsaved edits).">
        {(r) => {
          if (task === "metadata") return (
            <div className="grid md:grid-cols-2 gap-3">
              {(["titles", "descriptions"] as const).map((k) => (
                <ul key={k} className="space-y-2">
                  <li className="text-xs font-bold text-gray-500">{k === "titles" ? "SEO titles" : "Meta descriptions"}</li>
                  {recs(r[k]).map((x) => {
                    const text = String(x.text);
                    const field = k === "titles" ? "seoTitle" : "metaDescription";
                    return (
                      <Row key={text}>
                        <span className="block font-medium text-gray-900">{text}</span>
                        <span className={`text-[11px] ${x.lengthOk ? "text-green-700" : "text-amber-700"}`}>{String(x.length)} characters</span>
                        <Rationale text={x.rationale} />
                        {isDone(field, text) ? <Applied done /> : <button type="button" className={btn} onClick={() => use(field, text)}>Use in draft</button>}
                      </Row>
                    );
                  })}
                </ul>
              ))}
            </div>
          );
          if (task === "topics") {
            const p = isRecord(r.primaryTopic) ? r.primaryTopic : {};
            return (
              <ul className="space-y-2">
                {str(p.text) && (
                  <Row>
                    <span className="text-xs font-bold text-gray-500">Primary topic</span>
                    <span className="block font-medium">{String(p.text)}</span>
                    <Rationale text={p.rationale} />
                    {isDone("primaryTopic", String(p.text)) ? <Applied done /> : <button type="button" className={btn} onClick={() => use("primaryTopic", String(p.text))}>Use as primary topic</button>}
                  </Row>
                )}
                {recs(r.secondaryTopics).map((x) => (
                  <Row key={String(x.text)}>
                    <span className="text-xs font-bold text-gray-500">Secondary topic</span>
                    <span className="block font-medium">{String(x.text)}</span>
                    <Rationale text={x.rationale} />
                    {draft.secondaryTopics.some((s) => s.toLowerCase() === String(x.text).toLowerCase()) || isDone("secondaryTopic", String(x.text)) ? <Applied done /> : <button type="button" className={btn} onClick={() => use("secondaryTopic", String(x.text))}>Add secondary topic</button>}
                  </Row>
                ))}
                <li className="text-xs text-gray-500">Keyword ideas from this analysis can be added in the Keywords tab.</li>
              </ul>
            );
          }
          if (task === "intent") return (
            <div className="space-y-2 text-sm">
              <p><strong>Best-fit intent:</strong> {String(r.intent || "—")} <span className="text-xs text-gray-500">({String(r.confidence)} confidence)</span></p>
              <p className="text-gray-700">{String(r.reasoning || "")}</p>
              {strings(r.mismatches).length > 0 && <div><p className="text-xs font-bold text-gray-500">Mismatches</p><ul className="list-disc pl-5 text-sm">{strings(r.mismatches).map((m) => <li key={m}>{m}</li>)}</ul></div>}
              {strings(r.recommendations).length > 0 && <div><p className="text-xs font-bold text-gray-500">Recommendations</p><ul className="list-disc pl-5 text-sm">{strings(r.recommendations).map((m) => <li key={m}>{m}</li>)}</ul></div>}
              {str(r.intent) && draft.searchIntent !== r.intent && (isDone("searchIntent", String(r.intent)) ? <Applied done /> : <button type="button" className={btn} onClick={() => use("searchIntent", String(r.intent))}>Set intent to {String(r.intent)}</button>)}
            </div>
          );
          if (task === "content_gap") return (
            <div className="space-y-2">
              {str(r.coverageSummary) && <p className="text-sm text-gray-700">{String(r.coverageSummary)}</p>}
              <ul className="space-y-2">
                {recs(r.gaps).map((g) => (
                  <Row key={String(g.topic)}>
                    <span className="block font-medium">{String(g.topic)}</span>
                    <Rationale text={g.why} />
                    {str(g.suggestedHeading) && <span className="block text-xs">Suggested heading: “{String(g.suggestedHeading)}”</span>}
                    {isDone("contentTopic", String(g.topic)) ? <Applied done /> : <button type="button" className={btn} onClick={() => use("contentTopic", String(g.topic))}>Add to content topics</button>}
                  </Row>
                ))}
              </ul>
            </div>
          );
          if (task === "faq_outline") return (
            <div className="space-y-3">
              <ul className="space-y-2">
                {recs(r.faqs).map((f) => (
                  <Row key={String(f.question)}>
                    <span className="block font-medium">{String(f.question)}</span>
                    {str(f.answer) ? <span className="block text-xs text-gray-700">Draft answer (from page content): {String(f.answer)}</span> : <span className="block text-xs text-amber-700">No answer on the page yet{str(f.needs) ? ` — needs: ${String(f.needs)}` : ""}.</span>}
                    {isDone("faqTopic", String(f.question)) ? <Applied done /> : <button type="button" className={btn} onClick={() => use("faqTopic", String(f.question))}>Add to FAQ topics</button>}
                  </Row>
                ))}
              </ul>
              {recs(r.blogOutlines).length > 0 && <p className="text-xs text-gray-500">Blog outlines can be saved from SEO Tools → Content Planner.</p>}
            </div>
          );
          if (task === "quality") return (
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              {([["strengths", "Strengths"], ["weaknesses", "Weaknesses"], ["recommendations", "Recommendations"]] as const).map(([k, l]) => strings(r[k]).length > 0 && (
                <div key={k}><p className="text-xs font-bold text-gray-500">{l}</p><ul className="list-disc pl-5">{strings(r[k]).map((s) => <li key={s}>{s}</li>)}</ul></div>
              ))}
              {recs(r.coverage).length > 0 && (
                <div><p className="text-xs font-bold text-gray-500">Topical coverage</p><ul className="space-y-0.5">{recs(r.coverage).map((c) => <li key={String(c.subtopic)} className="text-xs">{c.covered ? "✓" : "✗"} <strong>{String(c.subtopic)}</strong> {str(c.note) ? `— ${String(c.note)}` : ""}</li>)}</ul></div>
              )}
            </div>
          );
          return null;
        }}
      </AiSuggest>
    </div>
  );
}

// ---------- Fix Center ----------

export function AiFixAssist({
  json, say, pageId, draft, issues, apply,
}: {
  json: JsonFn; say: Say; pageId: number; draft: AiDraftInput; issues: AiIssue[];
  apply: (field: "seoTitle" | "metaDescription" | "preferredH1" | "primaryTopic" | "secondaryTopics", value: string) => void;
}) {
  const [issueId, setIssueId] = useState("");
  const issue = issues.find((i) => i.id === issueId) || null;
  const [applied, setApplied] = useState(false);
  if (!issues.length) return null;
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-600">Explain a warning with AI
        <select className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white" value={issueId} onChange={(e) => { setIssueId(e.target.value); setApplied(false); }}>
          <option value="">Choose a warning…</option>
          {issues.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}
        </select>
      </label>
      {issue && (
        <AiSuggest json={json} say={say} pageId={pageId} task="fix_warning" draft={draft} issue={issue} title={`AI: ${issue.title}`}>
          {(r) => {
            const field = String(r.field || "none");
            const value = String(r.proposedValue || "");
            return (
              <div className="space-y-2 text-sm">
                <p className="text-gray-800">{String(r.explanation || "")}</p>
                {strings(r.steps).length > 0 && <ol className="list-decimal pl-5 text-sm">{strings(r.steps).map((s) => <li key={s}>{s}</li>)}</ol>}
                {field !== "none" && value && (
                  <div className="rounded-xl bg-white border border-gray-100 px-3 py-2 space-y-1">
                    <p className="text-xs font-bold text-gray-500">Proposed {field}</p>
                    <p className="font-medium">{value}</p>
                    {applied ? <Applied done /> : (
                      <button type="button" className={primary} onClick={() => { apply(field as Parameters<typeof apply>[0], value); setApplied(true); say("Applied to the draft. Review it in Configuration, then Save Draft or Publish."); }}>Apply to draft</button>
                    )}
                  </div>
                )}
              </div>
            );
          }}
        </AiSuggest>
      )}
    </div>
  );
}

// ---------- Keyword Manager ----------

export function AiKeywordAssist({ json, say, pageId, draft, onChanged }: { json: JsonFn; say: Say; pageId: number; draft: AiDraftInput; onChanged: () => Promise<void> }) {
  const [added, setAdded] = useState<Set<string>>(new Set());
  const add = async (k: RawRecord) => {
    const keyword = String(k.keyword);
    const { res, data } = await json("/api/admin/seo/keywords", "POST", { pageId, keyword, keywordType: k.type, searchIntent: k.intent, priority: "MEDIUM", notes: "AI suggestion — no verified search volume" });
    if (!res.ok) return say((data && str(data.message)) || "Could not add the keyword.", false);
    const id = data && (num(data.id) || (isRecord(data.keyword) ? num(data.keyword.id) : null));
    if (id) await json(`/api/admin/seo/keywords/${id}/mapping`, "PUT", { source: "ai", evidence: k.seenInSearchConsole ? "AI suggestion; query seen in Search Console for this page" : "AI suggestion (Gemini); not verified by search data" });
    setAdded(new Set(added).add(keyword));
    say(`Added “${keyword}” to the keyword plan. It guides content only; nothing on the website changes.`);
    await onChanged();
  };
  return (
    <AiSuggest json={json} say={say} pageId={pageId} task="topics" draft={draft} title="AI keyword ideas" description="Ideas based on what this page actually covers. AI cannot see search volume — treat these as hypotheses and check them in Search Console.">
      {(r) => (
        <ul className="space-y-2">
          {recs(r.keywords).map((k) => (
            <Row key={String(k.keyword)}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{String(k.keyword)}</span>
                <span className="text-[11px] text-gray-500">{String(k.type)} · {String(k.intent)}</span>
                {k.seenInSearchConsole === true && <span className="text-[11px] font-bold text-green-700">seen in Search Console</span>}
              </div>
              <Rationale text={k.rationale} />
              {k.alreadyPlanned === true || added.has(String(k.keyword)) ? <span className="text-xs text-gray-500">Already in the plan</span> : <button type="button" className={btn} onClick={() => add(k)}>Add to keywords</button>}
            </Row>
          ))}
        </ul>
      )}
    </AiSuggest>
  );
}

// ---------- Content Planner & Internal Links (SEO Tools) ----------

export function AiPlannerAssist({ json, say, pages, onSaved }: { json: JsonFn; say: Say; pages: { id: number; path: string; name: string }[]; onSaved: () => Promise<void> }) {
  const [pageId, setPageId] = useState<number>(pages[0]?.id || 0);
  const [task, setTask] = useState<AiTask>("content_gap");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const page = pages.find((p) => p.id === pageId);
  const save = async (body: RawRecord, key: string) => {
    const { res } = await json("/api/admin/seo/content/ideas", "POST", { ...body, source: "ai", target_page: page ? page.path : "" });
    if (res.ok) {
      setSaved(new Set(saved).add(key));
      say("Saved to the content plan.");
      await onSaved();
    } else say("Could not save.", false);
  };
  if (!pages.length) return null;
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <select aria-label="Page" className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white" value={pageId} onChange={(e) => setPageId(Number(e.target.value))}>
          {pages.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.path})</option>)}
        </select>
        <select aria-label="Suggestion type" className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white" value={task} onChange={(e) => setTask(e.target.value as AiTask)}>
          <option value="content_gap">Content gaps</option>
          <option value="faq_outline">FAQs & blog outlines</option>
        </select>
      </div>
      <AiSuggest json={json} say={say} pageId={pageId} task={task} title={`AI content ideas for ${page ? page.name : "page"}`}>
        {(r) => (
          <ul className="space-y-2">
            {task === "content_gap" && recs(r.gaps).map((g) => (
              <Row key={String(g.topic)}>
                <span className="block font-medium">{String(g.topic)}</span>
                <Rationale text={g.why} />
                {saved.has(String(g.topic)) ? <Applied done label="Saved to plan" /> : <button type="button" className={btn} onClick={() => save({ title: String(g.suggestedHeading || g.topic), kind: "service_page", rationale: String(g.why || ""), outline: [String(g.suggestedHeading || g.topic)] }, String(g.topic))}>Save to plan</button>}
              </Row>
            ))}
            {task === "faq_outline" && recs(r.blogOutlines).map((b) => (
              <Row key={String(b.title)}>
                <span className="block font-medium">{String(b.title)}</span>
                <span className="block text-[11px] text-gray-500">For: {String(b.audience || "—")}</span>
                <ul className="list-disc pl-5 text-xs">{strings(b.outline).map((o) => <li key={o}>{o}</li>)}</ul>
                {saved.has(String(b.title)) ? <Applied done label="Saved to plan" /> : <button type="button" className={btn} onClick={() => save({ title: String(b.title), kind: "blog", audience: String(b.audience || ""), outline: strings(b.outline), rationale: "AI blog outline supporting this page" }, String(b.title))}>Save to plan</button>}
              </Row>
            ))}
            {task === "faq_outline" && recs(r.faqs).map((f) => (
              <Row key={String(f.question)}>
                <span className="block font-medium">FAQ: {String(f.question)}</span>
                {str(f.needs) && <span className="block text-xs text-amber-700">Needs: {String(f.needs)}</span>}
                {saved.has(String(f.question)) ? <Applied done label="Saved to plan" /> : <button type="button" className={btn} onClick={() => save({ title: String(f.question), kind: "faq", rationale: str(f.answer) ? `Draft answer: ${String(f.answer)}` : `Needs: ${String(f.needs || "an answer from the team")}` }, String(f.question))}>Save to plan</button>}
              </Row>
            ))}
          </ul>
        )}
      </AiSuggest>
    </div>
  );
}

export function AiLinksAssist({ json, say, pages }: { json: JsonFn; say: Say; pages: { id: number; path: string; name: string }[] }) {
  const [pageId, setPageId] = useState<number>(pages[0]?.id || 0);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const add = async (l: RawRecord) => {
    const { res, data } = await json("/api/admin/seo/links/apply", "POST", { pageId, target: l.target, anchor: l.anchor });
    say((data && str(data.message)) || (res.ok ? "Added to draft." : "Could not add the link."), res.ok);
    if (res.ok) setAdded(new Set(added).add(String(l.target)));
  };
  if (!pages.length) return null;
  return (
    <div className="space-y-2">
      <select aria-label="Page" className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white" value={pageId} onChange={(e) => setPageId(Number(e.target.value))}>
        {pages.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.path})</option>)}
      </select>
      <AiSuggest json={json} say={say} pageId={pageId} task="internal_links" title="AI internal link ideas" description="Only existing pages on the website can be suggested. Adding one puts it in the page's draft related links.">
        {(r) => (
          <ul className="space-y-2">
            {recs(r.links).map((l) => (
              <Row key={String(l.target)}>
                <span className="block font-medium">“{String(l.anchor)}” → {String(l.title || l.target)}</span>
                <span className="block text-[11px] text-gray-500 break-all">{String(l.target)}</span>
                <Rationale text={l.reason} />
                {added.has(String(l.target)) ? <Applied done /> : <button type="button" className={btn} onClick={() => add(l)}>Add to draft</button>}
              </Row>
            ))}
            {recs(r.links).length === 0 && <li className="text-sm text-gray-500">No suitable links found.</li>}
          </ul>
        )}
      </AiSuggest>
    </div>
  );
}

// ---------- Integrations: AI provider settings ----------

export function AiProviderSettings({ json, say }: { json: JsonFn; say: Say }) {
  const { status, missing, reload } = useAiStatus(json);
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState<{ ok: boolean; message: string } | null>(null);
  const test = async () => {
    setBusy(true);
    const { res, data } = await json("/api/admin/seo/ai/test", "POST", {});
    setBusy(false);
    const message = (data && str(data.message)) || (res.ok ? "Connected." : "Test failed.");
    setLastResult({ ok: res.ok, message });
    say(message, res.ok);
    await reload(true);
  };
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles size={16} className="text-violet-700" aria-hidden="true" />
        <h3 className="text-base font-extrabold text-gray-900">AI provider — Google Gemini</h3>
        {status?.configured && <button type="button" className={`${primary} ml-auto`} disabled={busy} onClick={test}>{busy ? <Loader size={14} className="animate-spin" /> : <Sparkles size={14} />} Test connection</button>}
      </div>
      <p className="text-sm text-gray-600">Used only for draft suggestions in the SEO admin. Separate from Search Console and from keyword-volume data. The API key stays on the server.</p>
      {missing ? <p className="text-sm text-red-700">The backend has not been updated yet.</p> : !status ? <Loader size={18} className="animate-spin text-gray-400" /> : !status.configured ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>AI unavailable.</strong> Set <code>GEMINI_API_KEY</code> and <code>GEMINI_MODEL</code> (for example <code>gemini-3.6-flash</code>) in the backend environment, then reload.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div className="rounded-xl bg-gray-50 px-4 py-3"><p className="text-xs font-semibold text-gray-500">Status</p><p className="font-bold">{status.lastTest ? (status.lastTest.status === "ok" ? "Connected" : "Error") : "Configured, not tested"}</p></div>
          <div className="rounded-xl bg-gray-50 px-4 py-3"><p className="text-xs font-semibold text-gray-500">Model</p><p className="font-bold break-all">{status.model}</p></div>
          <div className="rounded-xl bg-gray-50 px-4 py-3"><p className="text-xs font-semibold text-gray-500">Last successful test</p><p className="font-bold">{status.lastSuccessfulTestAt ? new Date(status.lastSuccessfulTestAt).toLocaleString() : "never"}</p></div>
          <div className="rounded-xl bg-gray-50 px-4 py-3"><p className="text-xs font-semibold text-gray-500">Today</p><p className="font-bold">{status.today.requests} / {status.dailyLimit} requests</p><p className="text-xs text-gray-500">{status.today.cached} from cache · {status.today.errors} errors · {(status.today.inputTokens + status.today.outputTokens).toLocaleString()} tokens</p></div>
        </div>
      )}
      {(lastResult || (status?.lastTest && status.lastTest.status === "error")) && (
        <p role="status" className={`text-sm ${lastResult ? (lastResult.ok ? "text-green-700" : "text-red-700") : "text-red-700"}`}>
          {lastResult ? lastResult.message : `Last test failed: ${status?.lastTest?.error || "unknown error"}`}
        </p>
      )}
    </section>
  );
}
