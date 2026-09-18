import React, { useMemo, useState, useRef, useCallback } from "react";
import {
  ChevronDown, Search, MessageSquareQuote, HelpCircle, Quote,
  Plus, Trash2, CheckCircle2, XCircle, AlertTriangle, Link2, BookOpen,
  User, Image as ImageIcon, Sparkles, Globe, ListTree, Info, MapPin,
  ShieldCheck, Share2, Eye, Gauge, Calendar, ExternalLink, Clock, EyeOff,
} from "lucide-react";

import TagInput from "./TagInput";
import {
  LIMITS,
  analyseFocusKeyword,
  auditHeadings,
  validateForPublish,
  findUndefinedTerms,
  extractExternalLinks,
  computeSeoScore,
  counterState,
  SCORE_BANDS,
  ITEM_SECTION,
} from "../utils/seoAnalysis";

/**
 * The panel below the blog editor, written for a non-technical admin.
 *
 * COPY RULE, and it is a hard one: no jargon reaches the screen. The words
 * "meta", "schema", "canonical", "structured data" and the rest appear in this
 * file only in code and comments, never in anything rendered. An editor who has
 * to look up a word before they can fill in a field will skip the field, and a
 * skipped field helps nobody. The data model, the validation rules and the API
 * contract are all unchanged — this is the label layer over them.
 *
 * Sections run in walkthrough order rather than technical grouping, each one
 * opens with a sentence on why it is worth the effort, and every one is
 * optional. Nothing in this panel can stop a draft being saved.
 */

const BRAND = "#6B4A2D";
const SITE_URL = "https://geniemedia.in";

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
    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
      <div className="flex-1 min-w-[80px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
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

function CheckRow({ passed, label, hint, tip, severity = "blocker" }) {
  const Icon = passed ? CheckCircle2 : severity === "warning" ? AlertTriangle : XCircle;
  const colour = passed ? "#16a34a" : severity === "warning" ? "#d97706" : "#dc2626";
  const note = tip || hint;

  return (
    <li className="flex items-start gap-2.5 py-1.5">
      <Icon size={15} style={{ color: colour }} className="shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className={`text-xs font-semibold ${passed ? "text-gray-700" : "text-gray-900"}`}>{label}</p>
        {!passed && note && <p className="text-[11px] text-gray-500 leading-snug mt-0.5">{note}</p>}
      </div>
    </li>
  );
}

/* ── Section wrapper ────────────────────────────────────────────────────── */

/**
 * Each section collapses on its own, so the panel reads as a list of short
 * openable steps rather than one intimidating wall of fields. The score widget
 * needs to be able to open any of them, hence the ref handle.
 */
function Section({ id, icon, step, title, subtitle, accent = BRAND, children, badge, registerRef, forceOpen }) {
  const Icon = icon;
  const [open, setOpen] = useState(Boolean(forceOpen));

  const attach = (node) => {
    if (node && registerRef) registerRef(id, { node, open: () => setOpen(true) });
  };

  return (
    <section ref={attach} className="rounded-xl border-2 border-gray-100 overflow-hidden scroll-mt-24 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-3 sm:px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2.5 text-left hover:bg-gray-100/70 transition"
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${accent}1a` }}
        >
          <Icon size={14} style={{ color: accent }} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] sm:text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
            {step && <span className="text-[10px] font-bold text-gray-400 shrink-0">{step}.</span>}
            <span className="truncate">{title}</span>
          </h4>
          {subtitle && <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{subtitle}</p>}
        </div>

        {badge}

        <ChevronDown
          size={16}
          className="text-gray-400 shrink-0 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      {open && <div className="p-3 sm:p-4 space-y-4 bg-white">{children}</div>}
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

/* ── Google result mock ─────────────────────────────────────────────────── */

const truncate = (str, max) => (str.length > max ? `${str.slice(0, max).trimEnd()}…` : str);

/**
 * Approximates how the result looks in Google.
 *
 * Google truncates by pixel width rather than character count, but character
 * count is close enough to be useful and is the thing an editor can see
 * directly in the box they are typing into.
 */
function SnippetPreview({ title, description, permalink }) {
  const shownTitle = title || "Your title will appear here";
  const shownDesc =
    description ||
    "Your description will appear here. Write it as the sentence that convinces someone to click, rather than a summary of the page.";

  const crumbs = String(permalink || "your-post").split("/").filter(Boolean).join(" › ");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 font-sans overflow-hidden">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
          <Globe size={11} className="text-gray-500" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] text-gray-800 leading-tight font-medium">Genie Media &amp; Studio</p>
          <p className="text-[11px] text-gray-500 leading-tight truncate">
            geniemedia.in › blog {crumbs ? `› ${crumbs}` : ""}
          </p>
        </div>
      </div>

      <h3
        className="text-[16px] sm:text-[18px] leading-snug mt-1.5 mb-1 break-words"
        style={{ color: "#1a0dab", fontFamily: "arial, sans-serif" }}
      >
        {truncate(shownTitle, LIMITS.metaTitleMax)}
      </h3>

      <p
        className="text-[12px] sm:text-[13px] leading-[1.58] text-[#4d5156] break-words"
        style={{ fontFamily: "arial, sans-serif" }}
      >
        {truncate(shownDesc, LIMITS.metaDescriptionMax)}
      </p>
    </div>
  );
}

/* ── Share card mock ────────────────────────────────────────────────────── */

/**
 * What the link looks like pasted into WhatsApp, Facebook or LinkedIn.
 *
 * Mirrors the card the share endpoint on the server produces, at the 1200x630
 * proportions those platforms crop to. Read-only: every value shown is
 * collected elsewhere in this panel, so there is nothing to edit here.
 */
function SharePreview({ image, title, description, permalink }) {
  const shownTitle = title || "Your title will appear here";
  const shownDesc = description || "Your description will appear here.";

  return (
    <div className="max-w-md w-full">
      <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
        <div className="relative w-full bg-gray-100" style={{ aspectRatio: "1200 / 630" }}>
          {image ? (
            <img
              src={image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-1.5">
              <ImageIcon size={22} />
              <span className="text-[11px] font-semibold">No photo yet</span>
            </div>
          )}
        </div>

        <div className="p-3 bg-[#f7f8fa] border-t border-gray-200">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">geniemedia.in</p>
          <p className="text-[13px] font-bold text-gray-900 leading-snug mt-0.5 break-words">
            {truncate(shownTitle, 70)}
          </p>
          <p className="text-[11px] text-gray-500 leading-snug mt-1 break-words">{truncate(shownDesc, 120)}</p>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 mt-2 font-mono break-all">
        {SITE_URL}/blog/{String(permalink || "").replace(/^\/+/, "")}
      </p>
    </div>
  );
}

/* ── Full article mock ──────────────────────────────────────────────────── */

const previewReadingTime = (html) =>
  Math.max(
    1,
    Math.round(
      String(html || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length / 225
    )
  );

/**
 * A read-only rendering of the finished page from the current form state.
 *
 * The classes mirror Blogdetail.jsx deliberately so this stays a fair likeness
 * if that page's styling changes. It renders from `form` only — nothing is
 * fetched and nothing is saved.
 *
 * Note what is NOT here: the short answer and the keyword list. Neither is
 * shown to readers on the real page, so showing them here would make this
 * preview a lie.
 */
function ArticlePreview({ form }) {
  const facts = (form.key_facts || []).filter((f) => f && String(f.fact || "").trim());
  const faqs = (form.faq_schema || []).filter(
    (f) => f && String(f.question || "").trim() && String(f.answer || "").trim()
  );
  const areas = (form.areas_covered || []).filter(Boolean);

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
      <div className="px-3 py-2 bg-gray-100 border-b border-gray-200 flex items-center gap-2">
        <div className="flex gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <p className="text-[10px] text-gray-500 font-mono truncate">
          {SITE_URL}/blog/{String(form.permalink || "").replace(/^\/+/, "")}
        </p>
      </div>

      <div className="max-h-[520px] overflow-y-auto">
        {form.imagePreview && (
          <div className="w-full bg-stone-100" style={{ aspectRatio: "16 / 9" }}>
            <img
              src={form.imagePreview}
              alt={form.alt_text || ""}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}

        <div className="px-4 sm:px-5 py-5 sm:py-6 max-w-2xl mx-auto">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 font-medium mb-3 pb-3 border-b border-slate-100">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#6B4A2D]" /> Today
            </span>
            {form.author_name && (
              <>
                <span className="text-slate-300">/</span>
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#6B4A2D]" /> {form.author_name}
                </span>
              </>
            )}
            <span className="text-slate-300">/</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#6B4A2D]" /> {previewReadingTime(form.description)} min read
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight tracking-tight mb-3 break-words">
            {form.title || "Your blog title"}
          </h1>

          {areas.length > 0 && (
            <p className="text-xs text-slate-500 mb-4 flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#6B4A2D] shrink-0 mt-0.5" />
              <span>
                <span className="font-semibold text-slate-600">Serving:</span> {areas.join(", ")}
              </span>
            </p>
          )}

          <div
            className="
              text-[15px] leading-[1.8] text-slate-700 break-words
              [&_p]:my-3 [&_p]:leading-[1.8]
              [&_h2]:text-lg [&_h2]:sm:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-6 [&_h2]:mb-2
              [&_h2]:pb-1.5 [&_h2]:border-b [&_h2]:border-slate-100
              [&_h3]:text-base [&_h3]:sm:text-lg [&_h3]:font-bold [&_h3]:text-slate-800 [&_h3]:mt-5 [&_h3]:mb-2
              [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
              [&_li]:my-1
              [&_a]:text-[#6B4A2D] [&_a]:underline [&_a]:underline-offset-2
              [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4
              [&_strong]:font-bold [&_strong]:text-slate-900
              [&_table]:w-full [&_table]:text-sm
            "
            // Admin-authored content, shown read-only to the person who just
            // typed it. The public page sanitises the same HTML before display.
            dangerouslySetInnerHTML={{ __html: form.description || "<p>Your article will appear here.</p>" }}
          />

          {facts.length > 0 && (
            <section className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 mb-3">
                <Quote className="w-4 h-4 text-[#6B4A2D]" /> Key facts
              </h2>
              <ul className="space-y-2">
                {facts.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6B4A2D] shrink-0" />
                    <span className="break-words">
                      {f.fact}
                      {f.source && <span className="ml-1.5 text-[11px] font-semibold text-[#6B4A2D]">Source</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {faqs.length > 0 && (
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900 mb-3 pb-1.5 border-b border-slate-100">
                <HelpCircle className="w-4 h-4 text-[#6B4A2D]" /> Frequently asked questions
              </h2>
              <div className="space-y-3">
                {faqs.map((f, i) => (
                  <div key={i} className="rounded-lg border border-slate-200 p-3">
                    <h3 className="text-sm font-bold text-slate-900 mb-1 break-words">{f.question}</h3>
                    <p className="text-sm text-slate-700 leading-relaxed break-words">{f.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {form.author_bio && (
            <section className="mt-8 rounded-xl bg-stone-50 border border-stone-200 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#6B4A2D] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">
                    {form.author_name || "Genie Media Editorial Team"}
                  </p>
                  <p className="text-xs leading-relaxed text-slate-600 mt-0.5 break-words">{form.author_bio}</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Score widget ───────────────────────────────────────────────────────── */

/**
 * The compact score, pinned so it stays visible while the editor scrolls.
 *
 * Fixed rather than sticky: the form is long and deeply nested, and a sticky
 * element inside it gets clipped by the first ancestor with its own overflow.
 * Hidden entirely until there is a title or some content — showing a hard zero
 * to someone who has typed nothing is discouraging and tells them nothing.
 */
function ScoreWidget({ score, onOpen }) {
  if (!score.visible) return null;

  const band = SCORE_BANDS[score.band];
  const circumference = 2 * Math.PI * 20;

  return (
    <button
      type="button"
      onClick={onOpen}
      title="Open your score and tips"
      className="fixed z-40 right-2 sm:right-5 top-16 sm:top-24 flex items-center gap-2.5 rounded-2xl border-2 bg-white/95 backdrop-blur shadow-lg px-2.5 sm:px-3 py-2 sm:py-2.5 hover:shadow-xl transition-all hover:scale-[1.03]"
      style={{ borderColor: band.bar }}
    >
      <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0">
        <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
          <circle cx="24" cy="24" r="20" fill="none" stroke="#f1f5f9" strokeWidth="5" />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke={band.bar}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - score.score / 100)}
            style={{ transition: "stroke-dashoffset .4s ease" }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-extrabold"
          style={{ color: band.fg }}
        >
          {score.score}
        </span>
      </div>

      <div className="text-left hidden sm:block">
        <p className="text-[11px] font-extrabold" style={{ color: band.fg }}>
          {band.label}
        </p>
        <p className="text-[10px] text-gray-500 leading-tight mt-0.5">
          {score.mustFix > 0 ? (
            <span className="font-bold text-red-600">{score.mustFix} must fix</span>
          ) : (
            <span className="font-bold text-green-600">Ready to publish</span>
          )}
        </p>
        <p className="text-[10px] text-gray-400 leading-tight">{score.niceToHave} nice to have</p>
      </div>
    </button>
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

  const [previewTab, setPreviewTab] = useState("google");

  // Section handles, so the score widget can scroll to and open any of them.
  const sectionRefs = useRef({});
  const registerRef = useCallback((id, handle) => {
    sectionRefs.current[id] = handle;
  }, []);

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
  const externalLinks = useMemo(() => extractExternalLinks(content), [content]);
  const score = useMemo(() => computeSeoScore(form), [form]);

  const stats = validation.stats;
  const blockersLeft = validation.blockers.length;

  /** Opens the panel, then scrolls to and expands the named section. */
  const goToSection = useCallback((id) => {
    setOpen(true);
    // Two frames: one for the panel to mount its children, one for the section
    // to exist in the layout before anything tries to scroll to it.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const handle = sectionRefs.current[id];
        if (!handle || !handle.node) return;
        handle.open();
        handle.node.scrollIntoView({ behavior: "smooth", block: "start" });
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shareImage = form.og_image_url || form.imagePreview || form.existingImageUrl || "";

  return (
    <>
      <ScoreWidget score={score} onOpen={() => goToSection("score")} />

      <div className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: open ? BRAND : "#e5e7eb" }}>
        {/* ── Header / toggle ── */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-5 py-3.5 sm:py-4 text-left transition"
          style={{ background: open ? `${BRAND}0d` : "#fff" }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: BRAND }}>
            <Sparkles size={16} color="#fff" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-extrabold text-gray-900">Help People Find This Post</h3>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
              All optional — {stats.wordCount} words · {stats.readingTime} min read
            </p>
          </div>

          <span
            className="text-[10px] sm:text-[11px] font-extrabold px-2 sm:px-2.5 py-1 rounded-full shrink-0"
            style={{
              background: blockersLeft === 0 ? "#dcfce7" : "#fee2e2",
              color: blockersLeft === 0 ? "#15803d" : "#b91c1c",
            }}
          >
            {blockersLeft === 0 ? "Ready" : `${blockersLeft} to fix`}
          </span>

          <ChevronDown
            size={18}
            className="text-gray-400 shrink-0 transition-transform"
            style={{ transform: open ? "rotate(180deg)" : "none" }}
          />
        </button>

        {open && (
          <div className="p-3 sm:p-5 space-y-3 bg-gray-50/50 border-t-2" style={{ borderColor: `${BRAND}33` }}>

            {/* ══════════ FRAMING COPY — always visible, never collapsed ══════════ */}
            <div className="rounded-xl bg-white border-2 border-dashed border-gray-200 px-3.5 sm:px-4 py-3.5">
              <p className="text-xs sm:text-[13px] leading-relaxed text-gray-600">
                This is everything below the blog editor that helps people find this post on Google, get quick
                answers to their questions, and helps AI tools like ChatGPT describe it correctly.{" "}
                <strong className="text-gray-800">
                  Nothing here is required — you can Save or Publish with none of it filled in.
                </strong>{" "}
                But every section you do fill in genuinely helps more people find and trust this article. Tap any
                section below to open it; each one explains what it is for in plain words.
              </p>
            </div>

            {/* ══════════ 1. GET FOUND ON GOOGLE ══════════ */}
            <Section
              id="seo"
              step={1}
              icon={Search}
              title="Get Found on Google (SEO)"
              subtitle="A short title, a few keywords, and the page address"
              registerRef={registerRef}
              forceOpen
              badge={
                <span
                  className="text-[10px] sm:text-[11px] font-extrabold px-2 py-1 rounded-full shrink-0"
                  style={{
                    background: keyword.score === keyword.total ? "#dcfce7" : "#fef3c7",
                    color: keyword.score === keyword.total ? "#15803d" : "#b45309",
                  }}
                >
                  {keyword.score}/{keyword.total}
                </span>
              }
            >
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400 font-bold mb-2">
                  How this looks in Google
                </p>
                <SnippetPreview
                  title={form.meta_title || form.title}
                  description={form.metaDescription}
                  permalink={form.permalink}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">Title for Google</label>
                <p className="text-[11px] text-gray-500 mb-1.5">
                  The headline people see in search results. It can be shorter and punchier than your blog title.
                  Leave it blank and your blog title is used.
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
                  label={`best around ${LIMITS.metaTitleIdeal}–${LIMITS.metaTitleMax}`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">Main keyword</label>
                <p className="text-[11px] text-gray-500 mb-1.5">
                  The one phrase someone would type into Google to find this post. This is never shown on the
                  post itself — everything in the checklist below is measured against it.
                </p>
                <input
                  type="text"
                  value={form.focus_keyword || ""}
                  onChange={(e) => onField("focus_keyword", e.target.value)}
                  placeholder="e.g. digital marketing agency in visakhapatnam"
                  className={inputCls}
                />
              </div>

              {form.focus_keyword ? (
                <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                  <p className="text-[11px] font-bold text-gray-600 mb-1">Where your keyword appears</p>
                  <ul className="divide-y divide-gray-100">
                    {keyword.checks.map((check) => (
                      <CheckRow key={check.id} {...check} severity="warning" />
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">
                  Enter a main keyword above to see where it does and does not appear.
                </p>
              )}

              <div>
                <label className="text-xs font-bold text-gray-700">Other phrases this post covers</label>
                <p className="text-[11px] text-gray-500 mb-1.5">
                  Related phrases people might search for. Separate them with commas. These are not shown on the
                  post either.
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

            {/* ══════════ 2. ANSWER QUESTIONS DIRECTLY ══════════ */}
            <Section
              id="aeo"
              step={2}
              icon={MessageSquareQuote}
              title="Answer Questions Directly (AEO)"
              subtitle="A short answer + FAQs, so Google can quote you directly"
              accent="#7c3aed"
              registerRef={registerRef}
            >
              <div>
                <label className="text-xs font-bold text-gray-700">The short answer</label>

                <div className="flex items-start gap-1.5 rounded-lg bg-violet-50 border border-violet-200 px-2.5 py-2 my-1.5">
                  <EyeOff size={12} className="text-violet-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-violet-800 leading-snug">
                    <strong>Readers never see this.</strong> It is only sent to Google and AI tools, as the
                    summary they read before deciding how to describe your post.
                  </p>
                </div>

                <p className="text-[11px] text-gray-500 mb-2 leading-snug">
                  If someone asked this post as a question, what is the answer in one short paragraph? Write it
                  so it still makes sense on its own, away from the rest of the article.
                </p>

                <textarea
                  value={form.direct_answer || ""}
                  onChange={(e) => onField("direct_answer", e.target.value)}
                  rows={4}
                  placeholder="A digital marketing agency in Visakhapatnam typically charges…"
                  className={inputCls + " resize-none"}
                />

                <div className="flex items-center justify-between mt-1.5 gap-2">
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
                  <span className="text-[10px] text-gray-400 text-right">
                    best around {LIMITS.directAnswerIdealMin}–{LIMITS.directAnswerIdealMax} words
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <HelpCircle size={12} /> Common questions and answers
                </label>
                <p className="text-[11px] text-gray-500 mb-2">
                  Questions people actually ask about this topic. These <strong>do</strong> appear at the bottom
                  of your published post, and Google often shows them directly underneath your result.
                  {stats.wordCount > LIMITS.faqRequiredAboveWords && (
                    <strong className="text-amber-700">
                      {" "}
                      This post is long, so at least {LIMITS.faqMinimum} are needed before publishing.
                    </strong>
                  )}
                </p>

                <RepeatableList
                  items={form.faq_schema || []}
                  onChange={(v) => onField("faq_schema", v)}
                  emptyLabel="No questions added yet."
                  addLabel="Add question"
                  makeEmpty={() => ({ question: "", answer: "" })}
                  renderRow={(item, patch) => (
                    <>
                      <input
                        type="text"
                        value={item.question}
                        onChange={(e) => patch({ question: e.target.value })}
                        placeholder="Question, worded the way someone would actually ask it"
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

            {/* ══════════ 3. HELP AI TOOLS UNDERSTAND THIS POST ══════════ */}
            <Section
              id="geo"
              step={3}
              icon={Quote}
              title="Help AI Tools Understand This Post"
              subtitle="What this post is about, and which areas it covers"
              accent="#0891b2"
              registerRef={registerRef}
            >
              <div>
                <label className="text-xs font-bold text-gray-700">Facts and numbers worth quoting</label>
                <p className="text-[11px] text-gray-500 mb-2 leading-snug">
                  Any statistic or claim, with a link to where it came from. AI tools repeat a fact they can
                  credit far more readily than the same claim buried in a paragraph. These appear on your
                  published post.
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
                        placeholder="https://where-that-number-came-from.com"
                        className={smallInputCls}
                      />
                    </>
                  )}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <BookOpen size={12} /> Words worth explaining
                </label>
                <p className="text-[11px] text-gray-500 mb-2 leading-snug">
                  Any product name or industry term you use, explained in one sentence. AI tools treat these
                  sentences as the definition and repeat them word for word.
                </p>

                {undefinedTerms.length > 0 && (
                  <div className="mb-2.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
                    <p className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5 mb-1.5">
                      <Info size={11} /> Used in your post but never explained
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {undefinedTerms.map((t) => (
                        <button
                          key={t.term}
                          type="button"
                          onClick={() =>
                            onField("definitions", [...(form.definitions || []), { term: t.term, definition: "" }])
                          }
                          className="text-[11px] font-semibold px-2 py-1 rounded-full bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 transition"
                          title="Explain this word"
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
                  emptyLabel="Nothing explained yet."
                  addLabel="Add an explanation"
                  makeEmpty={() => ({ term: "", definition: "" })}
                  renderRow={(item, patch) => (
                    <>
                      <input
                        type="text"
                        value={item.term}
                        onChange={(e) => patch({ term: e.target.value })}
                        placeholder="The word or name"
                        className={smallInputCls}
                      />
                      <textarea
                        value={item.definition}
                        onChange={(e) => patch({ definition: e.target.value })}
                        rows={2}
                        placeholder="One sentence: what it is, in plain words."
                        className={smallInputCls + " resize-none"}
                      />
                    </>
                  )}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <ListTree size={12} /> Your sections
                </label>
                <p className="text-[11px] text-gray-500 mb-1.5">
                  Your subheadings, in the order they appear. Clear sections help both readers and AI tools
                  follow the post.
                </p>

                {headings.headings.length === 0 ? (
                  <p className="text-[11px] text-gray-400 italic">
                    No subheadings yet. Breaking the post into sections makes it much easier to read.
                  </p>
                ) : (
                  <>
                    <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-2.5 max-h-44 overflow-y-auto">
                      {headings.headings.map((h, i) => (
                        <p
                          key={i}
                          className="text-[11px] text-gray-600 py-0.5 truncate"
                          style={{ paddingLeft: `${(h.level - 1) * 12}px` }}
                        >
                          <span className="font-mono font-bold text-[#6B4A2D]">·</span> {h.text}
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

              <div>
                <label className="text-xs font-bold text-gray-700">What kind of post is this?</label>
                <p className="text-[11px] text-gray-400 mb-1.5">
                  Leave this on the first option unless the post is clearly one of the others.
                </p>
                <select
                  value={form.schema_type || "BlogPosting"}
                  onChange={(e) => onField("schema_type", e.target.value)}
                  className={smallInputCls}
                >
                  <option value="BlogPosting">A normal blog post</option>
                  <option value="Article">A longer article or guide</option>
                  <option value="NewsArticle">News or an announcement</option>
                  <option value="HowTo">Step-by-step instructions</option>
                  <option value="FAQPage">Mostly questions and answers</option>
                </select>
              </div>
            </Section>

            {/* ══════════ 4. AREAS COVERED ══════════ */}
            <Section
              id="areas"
              step={4}
              icon={MapPin}
              title="Tell People Which Areas This Covers"
              subtitle="If this post is about a place, say which one"
              accent="#0d9488"
              registerRef={registerRef}
            >
              <div>
                <p className="text-[11px] text-gray-500 mb-2 leading-snug">
                  If this post is about serving a specific city, area, or region, list them here. This helps
                  Google match the post to people searching nearby.
                </p>
                <TagInput
                  tags={form.areas_covered || []}
                  onChange={(v) => onField("areas_covered", v)}
                  placeholder="Visakhapatnam, Vizianagaram, Anakapalli…"
                  morePlaceholder="Add another place…"
                  chipStyle={{ background: "#ccfbf1", color: "#0f766e", border: "1px solid #5eead4" }}
                />
                <p className="text-[11px] text-gray-400 mt-1.5">
                  Press Enter or comma after each place. Leave empty if this post is not about anywhere in
                  particular.
                </p>
              </div>

              {(form.areas_covered || []).length > 0 && (
                <div className="rounded-lg bg-teal-50 border border-teal-200 px-3 py-2.5">
                  <p className="text-[11px] font-bold text-teal-800 mb-1">This will show on your post as:</p>
                  <p className="text-xs text-teal-900 break-words">
                    <span className="font-semibold">Serving:</span> {(form.areas_covered || []).join(", ")}
                  </p>
                </div>
              )}
            </Section>

            {/* ══════════ 5. WHO WROTE & CHECKED THIS ══════════ */}
            <Section
              id="people"
              step={5}
              icon={ShieldCheck}
              title="Who Wrote & Checked This"
              subtitle="Posts with a named author and reviewer are trusted more"
              accent="#c2410c"
              registerRef={registerRef}
            >
              <p className="text-[11px] text-gray-500 leading-snug">
                Posts with a named author and reviewer are trusted more by both readers and Google — especially
                for anything health, finance, or advice-related.
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <User size={12} /> Written by
                  </label>
                  <input
                    type="text"
                    value={form.author_name || ""}
                    onChange={(e) => onField("author_name", e.target.value)}
                    placeholder="Who wrote this post"
                    className={smallInputCls + " mt-1.5"}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700">About the author</label>
                  <textarea
                    value={form.author_bio || ""}
                    onChange={(e) => onField("author_bio", e.target.value)}
                    rows={2}
                    placeholder="A sentence or two on why they know this subject."
                    className={smallInputCls + " mt-1.5 resize-none"}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-700 mb-2">Checked by (optional)</p>

                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={form.reviewer_name || ""}
                    onChange={(e) => onField("reviewer_name", e.target.value)}
                    placeholder="Name of whoever checked it"
                    className={smallInputCls}
                  />
                  <input
                    type="text"
                    value={form.reviewer_role || ""}
                    onChange={(e) => onField("reviewer_role", e.target.value)}
                    placeholder="Their role, e.g. Senior SEO Strategist"
                    className={smallInputCls}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2.5 mt-2.5">
                  <button
                    type="button"
                    onClick={() => onField("reviewed_at", new Date().toISOString())}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-[#6B4A2D] hover:text-[#6B4A2D] text-gray-600 transition"
                  >
                    <Calendar size={13} /> Mark as reviewed today
                  </button>

                  {form.reviewed_at ? (
                    <span className="text-[11px] text-gray-600">
                      Last checked{" "}
                      <strong>
                        {new Date(form.reviewed_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </strong>
                      <button
                        type="button"
                        onClick={() => onField("reviewed_at", "")}
                        className="ml-2 text-gray-400 hover:text-red-600 underline"
                      >
                        clear
                      </button>
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-400 italic">Not checked yet</span>
                  )}
                </div>
              </div>
            </Section>

            {/* ══════════ 6. DESCRIBE YOUR PHOTO ══════════ */}
            <Section
              id="photo"
              step={6}
              icon={ImageIcon}
              title="Describe Your Photo"
              subtitle="A plain description of the featured image"
              registerRef={registerRef}
            >
              <div>
                <label className="text-xs font-bold text-gray-700">What is in the photo?</label>
                <p className="text-[11px] text-gray-500 mb-1.5">
                  One sentence describing what the picture actually shows. Blind readers hear this read aloud,
                  and it is how your photo gets found in Google Images.
                </p>
                <input
                  type="text"
                  value={form.alt_text || ""}
                  onChange={(e) => onField("alt_text", e.target.value)}
                  placeholder="Genie Media team reviewing a campaign dashboard in the Visakhapatnam office"
                  className={inputCls}
                  maxLength={LIMITS.altTextMax}
                />
                <Counter value={form.alt_text} min={20} ideal={40} max={LIMITS.altTextMax} />
              </div>

              {form.imagePreview && (
                <div className="rounded-lg overflow-hidden border border-gray-200" style={{ aspectRatio: "16/9" }}>
                  <img
                    src={form.imagePreview}
                    alt={form.alt_text || "Featured image"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-700">Use a different photo when shared</label>
                <p className="text-[11px] text-gray-400 mb-1.5">
                  Leave this blank and the featured image is used automatically, cropped to fit.
                </p>
                <input
                  type="url"
                  value={form.og_image_url || ""}
                  onChange={(e) => onField("og_image_url", e.target.value)}
                  placeholder="https://geniemedia.in/uploads/your-photo.webp"
                  className={smallInputCls}
                />
              </div>
            </Section>

            {/* ══════════ 7. LINK TO OTHER PAGES ══════════ */}
            <Section
              id="links"
              step={7}
              icon={Link2}
              title="Link to Other Pages"
              subtitle="Link to your own pages, and to trustworthy outside sources"
              accent="#2563eb"
              registerRef={registerRef}
            >
              <p className="text-[11px] text-gray-500 leading-snug">
                Add links inside your article using the link button in the editor above. Linking to your own
                pages keeps readers on the site; linking to a trustworthy outside source shows your facts came
                from somewhere real.
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-200 p-3 min-w-0">
                  <p className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5 mb-2">
                    <Link2 size={11} /> Your own pages ({stats.internalLinks.length})
                  </p>
                  {stats.internalLinks.length === 0 ? (
                    <p className="text-[11px] text-gray-400 italic">
                      None yet. Link to at least one other page on your site.
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {stats.internalLinks.slice(0, 8).map((link, i) => (
                        <li key={i} className="text-[11px] text-gray-500 truncate">
                          <span className="text-[#6B4A2D] font-semibold">{link.anchor_text || "(no text)"}</span>
                          {" → "}
                          <span className="font-mono">{link.target_slug}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-lg border border-gray-200 p-3 min-w-0">
                  <p className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5 mb-2">
                    <ExternalLink size={11} /> Outside sources ({externalLinks.length})
                  </p>
                  {externalLinks.length === 0 ? (
                    <p className="text-[11px] text-gray-400 italic">
                      None yet. Optional, but it backs up what you have written.
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {externalLinks.slice(0, 8).map((link, i) => (
                        <li key={i} className="text-[11px] text-gray-500 truncate">
                          <span className="text-blue-700 font-semibold">{link.anchor_text || "(no text)"}</span>
                          {" → "}
                          <span className="font-mono">{link.url.replace(/^https?:\/\//, "").split("/")[0]}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Section>

            {/* ══════════ 8. EXTRA INFO FOR GOOGLE ══════════ */}
            <Section
              id="extra"
              step={8}
              icon={Info}
              title="Extra Info for Google (Automatic)"
              subtitle="Nothing to type — just two on/off switches"
              accent="#64748b"
              registerRef={registerRef}
            >
              <div>
                <label className="text-xs font-bold text-gray-700">Should this post show up in Google?</label>
                <p className="text-[11px] text-gray-400 mb-1.5">
                  Leave this on the first option unless you have a reason not to.
                </p>
                <select
                  value={form.robots_directive || "index,follow"}
                  onChange={(e) => onField("robots_directive", e.target.value)}
                  className={smallInputCls}
                >
                  <option value="index,follow">Yes — show it in search results (normal)</option>
                  <option value="noindex,follow">No — keep it off Google, but still follow its links</option>
                  <option value="noindex,nofollow">No — hide it from Google completely</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">
                  This exact article also lives at another URL
                </label>
                <p className="text-[11px] text-gray-400 mb-1.5">
                  Rare — leave blank unless you know you need this. Use it only when the identical article is
                  already published somewhere else and that copy should count as the original.
                </p>
                <input
                  type="url"
                  value={form.canonical_url || ""}
                  onChange={(e) => onField("canonical_url", e.target.value)}
                  placeholder="Leave empty for the normal setting"
                  className={smallInputCls}
                />
              </div>
            </Section>

            {/* ══════════ 9. HOW IT LOOKS WHEN SHARED ══════════ */}
            <Section
              id="share"
              step={9}
              icon={Share2}
              title="How It Looks When Shared"
              subtitle="The card people see on WhatsApp, Facebook and LinkedIn"
              accent="#059669"
              registerRef={registerRef}
            >
              <p className="text-[11px] text-gray-500 leading-snug">
                This is what appears when someone pastes a link to this post into a chat or a social post. It is
                built from your photo, your title for Google and your description — there is nothing to fill in
                here.
              </p>

              <SharePreview
                image={shareImage}
                title={form.meta_title || form.title}
                description={form.metaDescription}
                permalink={form.permalink}
              />
            </Section>

            {/* ══════════ 10. PREVIEW BEFORE YOU PUBLISH ══════════ */}
            <Section
              id="preview"
              step={10}
              icon={Eye}
              title="Preview Before You Publish"
              subtitle="See the finished page without leaving this screen"
              accent="#7c3aed"
              registerRef={registerRef}
            >
              <div className="flex gap-1.5 p-1 bg-gray-100 rounded-lg w-full sm:w-fit">
                {[
                  ["google", "Google result"],
                  ["full", "Full article page"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPreviewTab(key)}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-bold transition ${
                      previewTab === key ? "bg-white shadow text-[#6B4A2D]" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {previewTab === "google" ? (
                <SnippetPreview
                  title={form.meta_title || form.title}
                  description={form.metaDescription}
                  permalink={form.permalink}
                />
              ) : (
                <ArticlePreview form={form} />
              )}
            </Section>

            {/* ══════════ 11. YOUR SCORE & TIPS ══════════ */}
            <Section
              id="score"
              step={11}
              icon={Gauge}
              title="Your Score & Tips"
              subtitle="Everything above, in one list, with what to do next"
              accent={SCORE_BANDS[score.band].bar}
              registerRef={registerRef}
              badge={
                score.visible ? (
                  <span
                    className="text-[10px] sm:text-[11px] font-extrabold px-2 py-1 rounded-full shrink-0"
                    style={{ background: SCORE_BANDS[score.band].bg, color: SCORE_BANDS[score.band].fg }}
                  >
                    {score.score}/100
                  </span>
                ) : null
              }
            >
              {!score.visible ? (
                <p className="text-xs text-gray-400 italic">Your score appears once you start writing.</p>
              ) : (
                <>
                  <div className="rounded-xl p-4" style={{ background: SCORE_BANDS[score.band].bg }}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black" style={{ color: SCORE_BANDS[score.band].fg }}>
                        {score.score}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold" style={{ color: SCORE_BANDS[score.band].fg }}>
                          {SCORE_BANDS[score.band].label}
                        </p>
                        <p className="text-[11px] text-gray-600">
                          {score.mustFix > 0
                            ? `${score.mustFix} thing${score.mustFix > 1 ? "s" : ""} to fix before you can publish`
                            : "Nothing is blocking you from publishing"}
                          {score.niceToHave > 0 &&
                            ` · ${score.niceToHave} optional improvement${score.niceToHave > 1 ? "s" : ""}`}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 h-2 bg-white/60 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${score.score}%`, background: SCORE_BANDS[score.band].bar }}
                      />
                    </div>
                  </div>

                  {[
                    ["Needed before publishing", "required"],
                    ["Where your keyword appears", "keyword"],
                    ["Nice to have", "extra"],
                  ].map(([heading, group]) => {
                    const items = score.items.filter((i) => i.group === group);
                    if (!items.length) return null;

                    return (
                      <div key={group}>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-1">
                          {heading}
                        </p>
                        <ul className="divide-y divide-gray-50">
                          {items.map((item) => (
                            <li key={item.id} className="flex items-start gap-2.5 py-1.5">
                              <span className="shrink-0 mt-0.5 text-[13px] leading-none">
                                {item.passed ? "✅" : group === "required" ? "❌" : "⚠️"}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p
                                  className={`text-xs font-semibold ${
                                    item.passed ? "text-gray-600" : "text-gray-900"
                                  }`}
                                >
                                  {item.label}
                                </p>
                                {!item.passed && item.tip && (
                                  <p className="text-[11px] text-gray-500 leading-snug mt-0.5">{item.tip}</p>
                                )}
                              </div>
                              {!item.passed && ITEM_SECTION[item.id] && (
                                <button
                                  type="button"
                                  onClick={() => goToSection(ITEM_SECTION[item.id])}
                                  className="shrink-0 text-[10px] font-bold text-[#6B4A2D] hover:underline"
                                >
                                  Fix
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100">
                    {[
                      ["Words", stats.wordCount],
                      ["Read time", `${stats.readingTime} min`],
                      ["Your links", stats.internalLinks.length],
                      ["Questions", stats.faqCount],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-lg bg-gray-50 p-2.5 text-center border border-gray-100">
                        <p className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">{label}</p>
                        <p className="text-sm font-extrabold text-gray-800 mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Section>
          </div>
        )}
      </div>
    </>
  );
}
