import React, { useMemo, useState } from "react";
import {
  ChevronDown, Search, Target, MessageSquareQuote, HelpCircle, Quote,
  Plus, Trash2, CheckCircle2, XCircle, AlertTriangle, Link2, BookOpen,
  User, Image as ImageIcon, Sparkles, Globe, ListTree, Info,
} from "lucide-react";

import {
  LIMITS,
  analyseFocusKeyword,
  auditHeadings,
  validateForPublish,
  findUndefinedTerms,
  counterState,
} from "../utils/seoAnalysis";

/**
 * The SEO / AEO / GEO panel that sits below the content editor.
 *
 * Three jobs, in descending order of how much they move the needle:
 *
 *  1. AEO — make the editor write one self-contained paragraph that answers the
 *     post's question. Answer engines quote the first concise answer block they
 *     find; if the post opens with throat-clearing, there is nothing to quote.
 *  2. GEO — make facts attributable and terms defined, so a retrieval engine can
 *     lift a sentence and cite it without having to infer anything.
 *  3. SEO — the familiar snippet preview and keyword checklist.
 *
 * Everything here is advisory UI over the same rules the server enforces. The
 * panel never decides whether a post can publish; it shows what the server will
 * decide, so there are no surprises at the end.
 */

const BRAND = "#6B4A2D";

const inputCls =
  "w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-[#6B4A2D] focus:ring-4 focus:ring-[#6B4A2D]/10 outline-none transition font-medium";

const smallInputCls =
  "w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-[#6B4A2D] outline-none transition";

/* ── Character counter ──────────────────────────────────────────────────── */

const COUNTER_COLOURS = {
  empty: "text-gray-400",
  short: "text-amber-600",
  ok: "text-amber-600",
  good: "text-green-600",
  over: "text-red-600 font-bold",
};

function Counter({ value, min, ideal, max, label }) {
  const length = String(value || "").length;
  const state = counterState(length, { min, ideal, max });
  const pct = Math.min(100, (length / max) * 100);

  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: state === "over" ? "#dc2626" : state === "good" ? "#16a34a" : "#d97706",
          }}
        />
      </div>
      <span className={`text-[11px] font-mono ${COUNTER_COLOURS[state]}`}>
        {length}/{max}
      </span>
      {label && <span className="text-[10px] text-gray-400">{label}</span>}
    </div>
  );
}

/* ── Check row ──────────────────────────────────────────────────────────── */

function CheckRow({ passed, label, hint, severity = "blocker" }) {
  const Icon = passed ? CheckCircle2 : severity === "warning" ? AlertTriangle : XCircle;
  const colour = passed ? "#16a34a" : severity === "warning" ? "#d97706" : "#dc2626";

  return (
    <li className="flex items-start gap-2.5 py-1.5">
      <Icon size={15} style={{ color: colour }} className="shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className={`text-xs font-semibold ${passed ? "text-gray-700" : "text-gray-900"}`}>{label}</p>
        {!passed && hint && <p className="text-[11px] text-gray-500 leading-snug mt-0.5">{hint}</p>}
      </div>
    </li>
  );
}

/* ── Section wrapper ────────────────────────────────────────────────────── */

function Section({ icon, title, subtitle, accent = BRAND, children, badge }) {
  const Icon = icon;

  return (
    <section className="rounded-xl border-2 border-gray-100 overflow-hidden">
      <header className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${accent}1a` }}
        >
          <Icon size={14} style={{ color: accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-extrabold text-gray-900">{title}</h4>
          {subtitle && <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{subtitle}</p>}
        </div>
        {badge}
      </header>
      <div className="p-4 space-y-4 bg-white">{children}</div>
    </section>
  );
}

/* ── Repeatable row list ────────────────────────────────────────────────── */

function RepeatableList({ items, onChange, emptyLabel, addLabel, renderRow, makeEmpty, max = 20 }) {
  const update = (index, patch) =>
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const remove = (index) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-2.5">
      {items.length === 0 && <p className="text-xs text-gray-400 italic">{emptyLabel}</p>}

      {items.map((item, index) => (
        <div key={index} className="relative rounded-lg border border-gray-200 p-3 bg-gray-50/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">#{index + 1}</span>
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-gray-400 hover:text-red-600 transition p-1 rounded"
              title="Remove"
            >
              <Trash2 size={13} />
            </button>
          </div>
          {renderRow(item, (patch) => update(index, patch), index)}
        </div>
      ))}

      {items.length < max && (
        <button
          type="button"
          onClick={() => onChange([...items, makeEmpty()])}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#6B4A2D] hover:text-[#6B4A2D] text-gray-500 transition w-full justify-center"
        >
          <Plus size={13} /> {addLabel}
        </button>
      )}
    </div>
  );
}

/* ── Google SERP mock ───────────────────────────────────────────────────── */

/**
 * Approximates how the result will look in Google.
 *
 * Titles are truncated by pixel width in reality, not character count, but
 * character count is close enough to be useful and is what every editor already
 * understands. The ellipsis shows up at the same point the real snippet cuts.
 */
function SnippetPreview({ title, description, permalink, siteUrl = "https://geniemedia.in" }) {
  const shownTitle = title || "Your meta title will appear here";
  const shownDesc =
    description ||
    "Your meta description will appear here. Write it as the sentence that convinces someone to click rather than a summary of the page.";

  const crumbs = String(permalink || "your-post")
    .split("/")
    .filter(Boolean)
    .join(" › ");

  const truncate = (str, max) => (str.length > max ? `${str.slice(0, max).trimEnd()}…` : str);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 font-sans">
      <p className="text-[10px] uppercase tracking-wide text-gray-400 font-bold mb-2.5">
        Google result preview
      </p>

      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
          <Globe size={11} className="text-gray-500" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] text-gray-800 leading-tight font-medium">Genie Media &amp; Studio</p>
          <p className="text-[11px] text-gray-500 leading-tight truncate">
            {siteUrl.replace(/^https?:\/\//, "")} › blog {crumbs ? `› ${crumbs}` : ""}
          </p>
        </div>
      </div>

      <h3
        className="text-[18px] leading-snug mt-1.5 mb-1 truncate-2"
        style={{ color: "#1a0dab", fontFamily: "arial, sans-serif" }}
      >
        {truncate(shownTitle, LIMITS.metaTitleMax)}
      </h3>

      <p className="text-[13px] leading-[1.58] text-[#4d5156]" style={{ fontFamily: "arial, sans-serif" }}>
        {truncate(shownDesc, LIMITS.metaDescriptionMax)}
      </p>
    </div>
  );
}

/* ── Main panel ─────────────────────────────────────────────────────────── */

export default function SeoPanel({ form, onField, open: openProp, onOpenChange }) {
  // Works either way: uncontrolled by default, controlled when the parent passes
  // `open`. The parent needs control so a rejected publish can force the panel
  // open on the checklist that explains why.
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;

  const setOpen = (next) => {
    const value = typeof next === "function" ? next(open) : next;
    if (!isControlled) setInternalOpen(value);
    if (onOpenChange) onOpenChange(value);
  };

  const content = form.description || "";

  // Re-running the full analysis on every keystroke of a long post is wasteful,
  // so each block is memoised against only the inputs it actually reads.
  const keyword = useMemo(
    () =>
      analyseFocusKeyword({
        keyword: form.focus_keyword,
        title: form.title,
        metaTitle: form.meta_title,
        metaDescription: form.metaDescription,
        permalink: form.permalink,
        altText: form.alt_text,
        content,
      }),
    [form.focus_keyword, form.title, form.meta_title, form.metaDescription, form.permalink, form.alt_text, content]
  );

  const headings = useMemo(() => auditHeadings(content), [content]);
  const undefinedTerms = useMemo(
    () => findUndefinedTerms(content, form.definitions || []),
    [content, form.definitions]
  );
  const validation = useMemo(() => validateForPublish(form), [form]);

  const stats = validation.stats;
  const blockersLeft = validation.blockers.length;

  return (
    <div className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: open ? BRAND : "#e5e7eb" }}>
      {/* ── Header / toggle ── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 sm:px-5 py-4 text-left transition"
        style={{ background: open ? `${BRAND}0d` : "#fff" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: BRAND }}
        >
          <Sparkles size={16} color="#fff" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-extrabold text-gray-900">SEO / AEO / GEO</h3>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
            Search engines, AI answer engines and LLM citation — {stats.wordCount} words ·{" "}
            {stats.readingTime} min read
          </p>
        </div>

        <span
          className="text-[11px] font-extrabold px-2.5 py-1 rounded-full shrink-0"
          style={{
            background: blockersLeft === 0 ? "#dcfce7" : "#fee2e2",
            color: blockersLeft === 0 ? "#15803d" : "#b91c1c",
          }}
        >
          {blockersLeft === 0 ? "Ready to publish" : `${blockersLeft} to fix`}
        </span>

        <ChevronDown
          size={18}
          className="text-gray-400 shrink-0 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      {open && (
        <div className="p-4 sm:p-5 space-y-4 bg-gray-50/50 border-t-2" style={{ borderColor: `${BRAND}33` }}>

          {/* ══════════ 1. SNIPPET PREVIEW ══════════ */}
          <Section
            icon={Search}
            title="Search appearance"
            subtitle="What this post looks like in a Google result, live as you type."
          >
            <SnippetPreview
              title={form.meta_title || form.title}
              description={form.metaDescription}
              permalink={form.permalink}
            />

            <div>
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                Meta title <span className="text-red-500">*</span>
              </label>
              <p className="text-[11px] text-gray-400 mb-1.5">
                Separate from the on-page title. Written for the search result, not the article.
              </p>
              <input
                type="text"
                value={form.meta_title || ""}
                onChange={(e) => onField("meta_title", e.target.value)}
                placeholder={form.title || "Title as it should appear in Google…"}
                className={inputCls}
              />
              <Counter
                value={form.meta_title}
                min={LIMITS.metaTitleMin}
                ideal={LIMITS.metaTitleIdeal}
                max={LIMITS.metaTitleMax}
                label={`ideal ${LIMITS.metaTitleIdeal}–${LIMITS.metaTitleMax}`}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700">Canonical URL</label>
                <p className="text-[11px] text-gray-400 mb-1.5">
                  Only if this content is republished from somewhere else.
                </p>
                <input
                  type="url"
                  value={form.canonical_url || ""}
                  onChange={(e) => onField("canonical_url", e.target.value)}
                  placeholder="Leave empty for the default"
                  className={smallInputCls}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">Indexing</label>
                <p className="text-[11px] text-gray-400 mb-1.5">Leave on index,follow unless you mean it.</p>
                <select
                  value={form.robots_directive || "index,follow"}
                  onChange={(e) => onField("robots_directive", e.target.value)}
                  className={smallInputCls}
                >
                  <option value="index,follow">index, follow — normal</option>
                  <option value="noindex,follow">noindex, follow — hide from search</option>
                  <option value="noindex,nofollow">noindex, nofollow — hide completely</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700">Structured data type</label>
              <select
                value={form.schema_type || "BlogPosting"}
                onChange={(e) => onField("schema_type", e.target.value)}
                className={smallInputCls + " mt-1.5"}
              >
                <option value="BlogPosting">BlogPosting — standard article</option>
                <option value="Article">Article — general editorial</option>
                <option value="NewsArticle">NewsArticle — time-sensitive news</option>
                <option value="HowTo">HowTo — step-by-step instructions</option>
                <option value="FAQPage">FAQPage — mostly questions and answers</option>
              </select>
            </div>
          </Section>

          {/* ══════════ 2. FOCUS KEYWORD ══════════ */}
          <Section
            icon={Target}
            title="Focus keyword"
            subtitle="The one phrase this post should rank for. Everything below is measured against it."
            badge={
              <span
                className="text-[11px] font-extrabold px-2 py-1 rounded-full shrink-0"
                style={{
                  background: keyword.score === keyword.total ? "#dcfce7" : "#fef3c7",
                  color: keyword.score === keyword.total ? "#15803d" : "#b45309",
                }}
              >
                {keyword.score}/{keyword.total}
              </span>
            }
          >
            <input
              type="text"
              value={form.focus_keyword || ""}
              onChange={(e) => onField("focus_keyword", e.target.value)}
              placeholder="e.g. digital marketing agency in visakhapatnam"
              className={inputCls}
            />

            {form.focus_keyword ? (
              <ul className="divide-y divide-gray-50">
                {keyword.checks.map((check) => (
                  <CheckRow key={check.id} {...check} severity="warning" />
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400 italic">
                Enter a focus keyword to see the placement checklist.
              </p>
            )}

            <div>
              <label className="text-xs font-bold text-gray-700">Secondary keywords</label>
              <p className="text-[11px] text-gray-400 mb-1.5">
                Comma separated. Related phrases the post should also cover.
              </p>
              <input
                type="text"
                value={(form.secondary_keywords || []).join(", ")}
                onChange={(e) =>
                  onField(
                    "secondary_keywords",
                    e.target.value.split(",").map((k) => k.trim()).filter(Boolean)
                  )
                }
                placeholder="seo services vizag, local seo, google my business"
                className={smallInputCls}
              />
            </div>
          </Section>

          {/* ══════════ 3. AEO ══════════ */}
          <Section
            icon={MessageSquareQuote}
            title="Answer engine optimisation"
            subtitle="The highest-leverage block on this page. Answer engines quote the first concise, self-contained answer they find."
            accent="#7c3aed"
          >
            <div>
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                Direct answer <span className="text-red-500">*</span>
              </label>
              <p className="text-[11px] text-gray-500 mb-2 leading-snug">
                If someone asked this post's title as a question, what is the one-paragraph answer? Write it
                so it still makes sense quoted on its own, with no surrounding context. This becomes the first
                paragraph after the headline and is wrapped in Speakable and FAQPage markup.
              </p>
              <textarea
                value={form.direct_answer || ""}
                onChange={(e) => onField("direct_answer", e.target.value)}
                rows={4}
                placeholder="A digital marketing agency in Visakhapatnam typically charges…"
                className={inputCls + " resize-none"}
              />
              <div className="flex items-center justify-between mt-1.5">
                <span
                  className={`text-[11px] font-mono ${
                    stats.answerWords === 0
                      ? "text-gray-400"
                      : stats.answerWords >= LIMITS.directAnswerIdealMin &&
                        stats.answerWords <= LIMITS.directAnswerIdealMax
                      ? "text-green-600 font-bold"
                      : "text-amber-600"
                  }`}
                >
                  {stats.answerWords} words
                </span>
                <span className="text-[10px] text-gray-400">
                  target {LIMITS.directAnswerIdealMin}–{LIMITS.directAnswerIdealMax} words
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <HelpCircle size={12} /> FAQ pairs
              </label>
              <p className="text-[11px] text-gray-500 mb-2">
                Generates FAQPage structured data automatically.
                {stats.wordCount > LIMITS.faqRequiredAboveWords && (
                  <strong className="text-amber-700">
                    {" "}
                    This post is over {LIMITS.faqRequiredAboveWords} words, so {LIMITS.faqMinimum} are required.
                  </strong>
                )}
              </p>

              <RepeatableList
                items={form.faq_schema || []}
                onChange={(v) => onField("faq_schema", v)}
                emptyLabel="No FAQ pairs yet."
                addLabel="Add question"
                makeEmpty={() => ({ question: "", answer: "" })}
                renderRow={(item, patch) => (
                  <>
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) => patch({ question: e.target.value })}
                      placeholder="Question as a real person would type it"
                      className={smallInputCls}
                    />
                    <textarea
                      value={item.answer}
                      onChange={(e) => patch({ answer: e.target.value })}
                      rows={2}
                      placeholder="A complete answer in one or two sentences"
                      className={smallInputCls + " resize-none"}
                    />
                  </>
                )}
              />
            </div>
          </Section>

          {/* ══════════ 4. GEO ══════════ */}
          <Section
            icon={Quote}
            title="Generative engine optimisation"
            subtitle="Attributable facts, defined terms and clean structure — what a retrieval engine needs before it will cite you."
            accent="#0891b2"
          >
            <div>
              <label className="text-xs font-bold text-gray-700">Key facts and statistics</label>
              <p className="text-[11px] text-gray-500 mb-2 leading-snug">
                Each fact with the source it came from. An LLM will repeat a fact it can attribute far sooner
                than the same claim buried in a paragraph.
              </p>

              <RepeatableList
                items={form.key_facts || []}
                onChange={(v) => onField("key_facts", v)}
                emptyLabel="No facts added yet."
                addLabel="Add fact"
                makeEmpty={() => ({ fact: "", source: "" })}
                renderRow={(item, patch) => (
                  <>
                    <input
                      type="text"
                      value={item.fact}
                      onChange={(e) => patch({ fact: e.target.value })}
                      placeholder="68% of online experiences begin with a search engine"
                      className={smallInputCls}
                    />
                    <input
                      type="url"
                      value={item.source}
                      onChange={(e) => patch({ source: e.target.value })}
                      placeholder="https://source-of-that-number.com/report"
                      className={smallInputCls}
                    />
                  </>
                )}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <BookOpen size={12} /> Term definitions
              </label>
              <p className="text-[11px] text-gray-500 mb-2 leading-snug">
                Every brand, product or technical term the post introduces, defined in one sentence. These are
                the sentences an LLM lifts verbatim as ground truth.
              </p>

              {undefinedTerms.length > 0 && (
                <div className="mb-2.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
                  <p className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5 mb-1.5">
                    <Info size={11} /> Used but not defined near first mention
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {undefinedTerms.map((t) => (
                      <button
                        key={t.term}
                        type="button"
                        onClick={() =>
                          onField("definitions", [
                            ...(form.definitions || []),
                            { term: t.term, definition: "" },
                          ])
                        }
                        className="text-[11px] font-semibold px-2 py-1 rounded-full bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 transition"
                        title="Add a definition for this term"
                      >
                        + {t.term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <RepeatableList
                items={form.definitions || []}
                onChange={(v) => onField("definitions", v)}
                emptyLabel="No definitions added yet."
                addLabel="Add definition"
                makeEmpty={() => ({ term: "", definition: "" })}
                renderRow={(item, patch) => (
                  <>
                    <input
                      type="text"
                      value={item.term}
                      onChange={(e) => patch({ term: e.target.value })}
                      placeholder="Term"
                      className={smallInputCls}
                    />
                    <textarea
                      value={item.definition}
                      onChange={(e) => patch({ definition: e.target.value })}
                      rows={2}
                      placeholder="One sentence: what it is, stated plainly."
                      className={smallInputCls + " resize-none"}
                    />
                  </>
                )}
              />
            </div>

            {/* Heading hierarchy */}
            <div>
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <ListTree size={12} /> Heading structure
              </label>

              {headings.headings.length === 0 ? (
                <p className="text-[11px] text-gray-400 italic mt-1.5">
                  No headings in the content yet. Break the post into H2 sections.
                </p>
              ) : (
                <>
                  <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50/60 p-2.5 max-h-44 overflow-y-auto">
                    {headings.headings.map((h, i) => (
                      <p
                        key={i}
                        className="text-[11px] text-gray-600 py-0.5 truncate"
                        style={{ paddingLeft: `${(h.level - 1) * 12}px` }}
                      >
                        <span className="font-mono font-bold text-[#6B4A2D]">H{h.level}</span> {h.text}
                      </p>
                    ))}
                  </div>

                  {headings.issues.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {headings.issues.map((issue, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-amber-700">
                          <AlertTriangle size={11} className="shrink-0 mt-0.5" />
                          {issue.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>

            {/* Author / E-E-A-T */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <User size={12} /> Author name
                </label>
                <input
                  type="text"
                  value={form.author_name || ""}
                  onChange={(e) => onField("author_name", e.target.value)}
                  placeholder="Who wrote this"
                  className={smallInputCls + " mt-1.5"}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Author bio</label>
                <textarea
                  value={form.author_bio || ""}
                  onChange={(e) => onField("author_bio", e.target.value)}
                  rows={2}
                  placeholder="One or two sentences on why they are qualified to write this."
                  className={smallInputCls + " mt-1.5 resize-none"}
                />
              </div>
            </div>
          </Section>

          {/* ══════════ 5. IMAGE ══════════ */}
          <Section
            icon={ImageIcon}
            title="Featured image"
            subtitle="Alt text is required before publishing. The 1200×630 social variant is generated on upload."
          >
            <div>
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                Alt text <span className="text-red-500">*</span>
              </label>
              <p className="text-[11px] text-gray-500 mb-1.5">
                Describe what is actually in the image. Read aloud by screen readers and indexed by image
                search.
              </p>
              <input
                type="text"
                value={form.alt_text || ""}
                onChange={(e) => onField("alt_text", e.target.value)}
                placeholder="Genie Media team reviewing an SEO campaign dashboard in the Visakhapatnam office"
                className={inputCls}
                maxLength={LIMITS.altTextMax}
              />
              <Counter value={form.alt_text} min={20} ideal={40} max={LIMITS.altTextMax} />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700">Social share image override</label>
              <p className="text-[11px] text-gray-400 mb-1.5">
                Optional. Leave empty and a 1.91:1 crop is generated from the featured image automatically.
              </p>
              <input
                type="url"
                value={form.og_image_url || ""}
                onChange={(e) => onField("og_image_url", e.target.value)}
                placeholder="https://geniemedia.in/uploads/custom-og.webp"
                className={smallInputCls}
              />
            </div>
          </Section>

          {/* ══════════ 6. PUBLISH CHECKLIST ══════════ */}
          <Section
            icon={CheckCircle2}
            title="Publish checklist"
            subtitle="Enforced on the server. Red items block publishing; amber items are recommendations."
            accent={validation.ok ? "#16a34a" : "#dc2626"}
            badge={
              <span
                className="text-[11px] font-extrabold px-2 py-1 rounded-full shrink-0"
                style={{
                  background: validation.ok ? "#dcfce7" : "#fee2e2",
                  color: validation.ok ? "#15803d" : "#b91c1c",
                }}
              >
                {validation.ok ? "Passing" : `${blockersLeft} blocking`}
              </span>
            }
          >
            <ul className="divide-y divide-gray-50">
              {validation.checks.map((check) => (
                <CheckRow key={check.id} {...check} />
              ))}
            </ul>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100">
              {[
                ["Words", stats.wordCount],
                ["Read time", `${stats.readingTime} min`],
                ["Internal links", stats.internalLinks.length],
                ["FAQ pairs", stats.faqCount],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-gray-50 p-2.5 text-center border border-gray-100">
                  <p className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">{label}</p>
                  <p className="text-sm font-extrabold text-gray-800 mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {stats.internalLinks.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5 mb-1.5">
                  <Link2 size={11} /> Internal links found
                </p>
                <ul className="space-y-1">
                  {stats.internalLinks.slice(0, 8).map((link, i) => (
                    <li key={i} className="text-[11px] text-gray-500 truncate">
                      <span className="text-[#6B4A2D] font-semibold">{link.anchor_text || "(no text)"}</span>
                      {" → "}
                      <span className="font-mono">{link.target_slug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}

