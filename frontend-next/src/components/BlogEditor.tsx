"use client";

import {
  Bold as BoldIcon, Italic as ItalicIcon, Underline as UnderlineIcon, Strikethrough as StrikethroughIcon,
  List as ListIcon, ListOrdered as ListOrderedIcon, Quote as QuoteIcon, Code as CodeIcon,
  SquareCode as SquareCodeIcon, Link as LinkIcon, Unlink as UnlinkIcon, AlignLeft as AlignLeftIcon,
  AlignCenter as AlignCenterIcon, AlignRight as AlignRightIcon, Undo2 as Undo2Icon, Redo2 as Redo2Icon,
  RemoveFormatting as RemoveFormattingIcon, Minus as MinusIcon, Pilcrow as PilcrowIcon,
  type LucideIcon,
} from "lucide-react";
import React, { useCallback, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";

/* ─── Toolbar icons (lucide-react) ─────────────────────────────────────────── */
const Icon = ({ d: Glyph, size = 15 }: { d: LucideIcon; size?: number }) => (
  <Glyph size={size} strokeWidth={2} aria-hidden="true" />
);

const icons = {
  bold: BoldIcon,
  italic: ItalicIcon,
  underline: UnderlineIcon,
  strike: StrikethroughIcon,
  ul: ListIcon,
  ol: ListOrderedIcon,
  quote: QuoteIcon,
  code: CodeIcon,
  codeblock: SquareCodeIcon,
  link: LinkIcon,
  unlink: UnlinkIcon,
  alignLeft: AlignLeftIcon,
  alignCenter: AlignCenterIcon,
  alignRight: AlignRightIcon,
  undo: Undo2Icon,
  redo: Redo2Icon,
  clear: RemoveFormattingIcon,
  hr: MinusIcon,
  paragraph: PilcrowIcon,
};

/* ─── ToolBtn ────────────────────────────────────────────────────────────── */
interface ToolBtnProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolBtn({ onClick, active, disabled, title, children }: ToolBtnProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={[
        "relative flex items-center justify-center flex-shrink-0 min-w-[30px] [-webkit-tap-highlight-color:transparent]",
        "w-8 h-8 rounded-lg",
        "text-[12px] font-bold",
        "transition-all duration-150 select-none outline-none",
        "focus-visible:ring-2 focus-visible:ring-[#6B4A2D]/50",
        active
          ? "bg-[#6B4A2D] text-white shadow-md"
          : "text-gray-500 hover:bg-[#6B4A2D]/10 hover:text-[#6B4A2D] active:bg-[#6B4A2D]/20",
        disabled ? "opacity-30 cursor-not-allowed pointer-events-none" : "cursor-pointer",
      ].join(" ")}
    >
      {children}
      {active && (
        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/70" />
      )}
    </button>
  );
}

/* ─── Divider ────────────────────────────────────────────────────────────── */
const Divider = () => (
  <div className="w-px h-5 bg-gray-200 mx-1 self-center flex-shrink-0" aria-hidden="true" />
);

/* ─── ToolbarRow — always scrollable horizontally ────────────────────────── */
interface ToolbarButton {
  title: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
}

function ToolbarRow({ groups }: { groups: ToolbarButton[][] }) {
  return (
    <div
      className="flex items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1.5 px-2"
      role="toolbar"
    >
      {groups.map((group, gi) => (
        <React.Fragment key={gi}>
          {gi > 0 && <Divider />}
          {group.map((btn, bi) => (
            <ToolBtn
              key={bi}
              title={btn.title}
              onClick={btn.onClick}
              active={btn.active}
              disabled={btn.disabled}
            >
              {btn.icon}
            </ToolBtn>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN BlogEditor
═══════════════════════════════════════════════════════════════════════════ */
export default function BlogEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions: [
      // StarterKit v3 bundles Link and Underline; they are added below with
      // their own settings, so the bundled copies are switched off.
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: false, underline: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Start writing your blog content here…" }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    onFocus:  () => setIsFocused(true),
    onBlur:   () => setIsFocused(false),
    editorProps: {
      attributes: {
        class: [
          "prose prose-sm max-w-none",
          "focus:outline-none",
          "min-h-[220px]",
          "px-4 py-3",
          "text-gray-800 text-sm sm:text-[15px]",
          "leading-relaxed",
          // Content styling for the editable area (formerly a <style> block).
          "[&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:italic [&_p.is-editor-empty:first-child]:before:text-[#b0b7c0]",
          "[&_p]:my-[0.4em] [&_p]:leading-[1.75]",
          "[&_h1]:text-[clamp(1.3em,4vw,1.75em)] [&_h1]:font-extrabold [&_h1]:mt-[0.8em] [&_h1]:mb-[0.3em] [&_h1]:leading-[1.2]",
          "[&_h2]:text-[clamp(1.1em,3vw,1.4em)] [&_h2]:font-bold [&_h2]:mt-[0.8em] [&_h2]:mb-[0.3em] [&_h2]:leading-[1.3]",
          "[&_h3]:text-[clamp(1em,2.5vw,1.15em)] [&_h3]:font-bold [&_h3]:mt-[0.8em] [&_h3]:mb-[0.3em] [&_h3]:leading-[1.4]",
          "[&_ul]:list-disc [&_ul]:pl-[1.4rem] [&_ol]:list-decimal [&_ol]:pl-[1.4rem] [&_li]:my-[0.2em] [&_li]:leading-[1.6]",
          "[&_blockquote]:my-[1em] [&_blockquote]:border-l-[3px] [&_blockquote]:border-[#6B4A2D] [&_blockquote]:py-[0.3em] [&_blockquote]:pl-[1em] [&_blockquote]:pr-0 [&_blockquote]:italic [&_blockquote]:text-gray-500 [&_blockquote]:bg-[rgba(107,74,45,0.04)] [&_blockquote]:rounded-r-md",
          "[&_code]:bg-gray-100 [&_code]:px-[0.45em] [&_code]:py-[0.15em] [&_code]:rounded [&_code]:text-[0.88em] [&_code]:text-[#6B4A2D] [&_code]:font-mono [&_code]:break-all",
          "[&_pre]:my-[1em] [&_pre]:bg-[#1a1a2e] [&_pre]:text-slate-200 [&_pre]:px-4 [&_pre]:py-[0.9rem] [&_pre]:rounded-[10px] [&_pre]:overflow-x-auto [&_pre]:text-[0.85em] [&_pre]:font-mono [&_pre]:leading-[1.6]",
          "[&_pre_code]:bg-transparent [&_pre_code]:text-inherit [&_pre_code]:p-0 [&_pre_code]:text-[length:inherit] [&_pre_code]:break-normal",
          "[&_hr]:border-0 [&_hr]:border-t-2 [&_hr]:border-gray-200 [&_hr]:my-6",
          "[&_a]:text-[#6B4A2D] [&_a]:underline [&_a]:underline-offset-2 [&_a]:break-words [&_a:hover]:text-[#9b6a3d]",
          "[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg",
          "[&_*::selection]:bg-[rgba(107,74,45,0.18)]",
        ].join(" "),
      },
    },
  });

  const handleLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href || "";
    const url  = window.prompt("Enter URL:", prev);
    if (url === null) return;
    if (url === "") { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  /* ── Active states ── */
  const a = {
    bold:        editor.isActive("bold"),
    italic:      editor.isActive("italic"),
    underline:   editor.isActive("underline"),
    strike:      editor.isActive("strike"),
    h1:          editor.isActive("heading", { level: 1 }),
    h2:          editor.isActive("heading", { level: 2 }),
    h3:          editor.isActive("heading", { level: 3 }),
    para:        editor.isActive("paragraph"),
    ul:          editor.isActive("bulletList"),
    ol:          editor.isActive("orderedList"),
    blockquote:  editor.isActive("blockquote"),
    code:        editor.isActive("code"),
    codeBlock:   editor.isActive("codeBlock"),
    link:        editor.isActive("link"),
    alignLeft:   editor.isActive({ textAlign: "left" }),
    alignCenter: editor.isActive({ textAlign: "center" }),
    alignRight:  editor.isActive({ textAlign: "right" }),
  };

  /* ── Active format pills ── */
  const activeLabels = [
    a.bold && "Bold", a.italic && "Italic", a.underline && "Underline",
    a.strike && "Strike", a.h1 && "H1", a.h2 && "H2", a.h3 && "H3",
    a.ul && "Bullet", a.ol && "Numbered", a.blockquote && "Quote",
    a.code && "Code", a.codeBlock && "Code Block", a.link && "Link",
    a.alignCenter && "Center", a.alignRight && "Right",
  ].filter((label): label is string => Boolean(label));

  /* ── Word / char count ── */
  const charCount = editor.storage.characterCount?.characters?.() ?? editor.getText().length;
  const wordCount = editor.getText().split(/\s+/).filter(Boolean).length;

  /* ══════════════════════════════════════════════════════════════
     TOOLBAR GROUPS
     ALL groups shown on BOTH mobile and desktop.
     Split into 2 rows (each independently scrollable) so that
     narrow screens never hide any button — just scroll to see all.
  ══════════════════════════════════════════════════════════════ */

  /* Row 1: History + Inline marks + Code + Link + Clear */
  const row1Groups = [
    /* History */
    [
      {
        title: "Undo (Ctrl+Z)",
        onClick: () => editor.chain().focus().undo().run(),
        active: false,
        disabled: !editor.can().undo(),
        icon: <Icon d={icons.undo} />,
      },
      {
        title: "Redo (Ctrl+Y)",
        onClick: () => editor.chain().focus().redo().run(),
        active: false,
        disabled: !editor.can().redo(),
        icon: <Icon d={icons.redo} />,
      },
    ],
    /* Inline marks */
    [
      { title: "Bold (Ctrl+B)",   onClick: () => editor.chain().focus().toggleBold().run(),      active: a.bold,      icon: <Icon d={icons.bold} /> },
      { title: "Italic (Ctrl+I)", onClick: () => editor.chain().focus().toggleItalic().run(),    active: a.italic,    icon: <Icon d={icons.italic} /> },
      { title: "Underline",       onClick: () => editor.chain().focus().toggleUnderline().run(), active: a.underline, icon: <Icon d={icons.underline} /> },
      { title: "Strikethrough",   onClick: () => editor.chain().focus().toggleStrike().run(),    active: a.strike,    icon: <Icon d={icons.strike} /> },
    ],
    /* Code + Link + Clear */
    [
      {
        title: "Inline Code",
        onClick: () => editor.chain().focus().toggleCode().run(),
        active: a.code,
        icon: <Icon d={icons.code} />,
      },
      {
        title: a.link ? "Remove Link" : "Insert Link",
        onClick: handleLink,
        active: a.link,
        icon: <Icon d={a.link ? icons.unlink : icons.link} />,
      },
      {
        title: "Clear Formatting",
        onClick: () => editor.chain().focus().unsetAllMarks().clearNodes().run(),
        active: false,
        icon: <Icon d={icons.clear} />,
      },
    ],
  ];

  /* Row 2: Headings + Lists + Blocks + Alignment */
  const row2Groups = [
    /* Headings + Paragraph */
    [
      {
        title: "Heading 1",
        onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        active: a.h1,
        icon: <span className="text-[10px] font-black tracking-tight leading-none">H1</span>,
      },
      {
        title: "Heading 2",
        onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        active: a.h2,
        icon: <span className="text-[10px] font-black tracking-tight leading-none">H2</span>,
      },
      {
        title: "Heading 3",
        onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        active: a.h3,
        icon: <span className="text-[10px] font-black tracking-tight leading-none">H3</span>,
      },
      {
        title: "Paragraph",
        onClick: () => editor.chain().focus().setParagraph().run(),
        active: a.para && !a.h1 && !a.h2 && !a.h3,
        icon: <Icon d={icons.paragraph} />,
      },
    ],
    /* Lists */
    [
      { title: "Bullet List",  onClick: () => editor.chain().focus().toggleBulletList().run(),  active: a.ul, icon: <Icon d={icons.ul} /> },
      { title: "Ordered List", onClick: () => editor.chain().focus().toggleOrderedList().run(), active: a.ol, icon: <Icon d={icons.ol} /> },
    ],
    /* Block-level */
    [
      { title: "Blockquote",      onClick: () => editor.chain().focus().toggleBlockquote().run(),  active: a.blockquote, icon: <Icon d={icons.quote} /> },
      { title: "Code Block",      onClick: () => editor.chain().focus().toggleCodeBlock().run(),   active: a.codeBlock,  icon: <Icon d={icons.codeblock} /> },
      { title: "Horizontal Rule", onClick: () => editor.chain().focus().setHorizontalRule().run(), active: false,        icon: <Icon d={icons.hr} /> },
    ],
    /* Text Alignment */
    [
      { title: "Align Left",   onClick: () => editor.chain().focus().setTextAlign("left").run(),   active: a.alignLeft,   icon: <Icon d={icons.alignLeft} /> },
      { title: "Align Center", onClick: () => editor.chain().focus().setTextAlign("center").run(), active: a.alignCenter, icon: <Icon d={icons.alignCenter} /> },
      { title: "Align Right",  onClick: () => editor.chain().focus().setTextAlign("right").run(),  active: a.alignRight,  icon: <Icon d={icons.alignRight} /> },
    ],
  ];

  /* ─────────────────────────────────────────────────────────── */
  return (
    <>
      <div
        className={[
          "w-full rounded-xl border-2 bg-white",
          "overflow-y-auto",
          "max-h-[70vh] sm:max-h-[600px]",
          "transition-all duration-200 shadow-sm",
          isFocused
            ? "border-[#6B4A2D] shadow-[0_0_0_3px_rgba(107,74,45,0.08)]"
            : "border-gray-200",
        ].join(" ")}
      >

        {/* ── Sticky Toolbar ── */}
        <div
          className={[
            "sticky top-0 z-20",
            "bg-white",
            "border-b border-gray-200",
            isFocused ? "shadow-[0_1px_12px_rgba(107,74,45,0.10)]" : "",
          ].join(" ")}
        >
          {/* Focus accent line */}
          <div
            className={`h-[2.5px] w-full transition-opacity duration-300 bg-[linear-gradient(90deg,#6B4A2D,#b07d50_50%,rgba(107,74,45,0.08))] ${isFocused ? "opacity-100" : "opacity-0"}`}
          />

         
          <div className="divide-y divide-gray-100">
            {/* Row 1: Undo/Redo + Inline marks + Code/Link/Clear */}
            <ToolbarRow groups={row1Groups} />
            {/* Row 2: Headings + Lists + Blocks + Alignment */}
            <ToolbarRow groups={row2Groups} />
          </div>

          {/* Active format pills */}
          {activeLabels.length > 0 && (
            <div
              className="flex items-center gap-1 px-3 py-1 bg-[#faf9f7] border-t border-gray-100 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              aria-live="polite"
              aria-label="Active formatting"
            >
              <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider whitespace-nowrap flex-shrink-0 mr-0.5">
                Active:
              </span>
              {activeLabels.map((label) => (
                <span
                  key={label}
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 bg-[rgba(107,74,45,0.10)] text-[#6B4A2D]"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Editor content ── */}
        <EditorContent editor={editor} />

        {/* ── Sticky footer ── */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm border-t border-gray-100">
          <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
            {charCount} chars · {wordCount} words
          </span>
          <span className="text-[10px] text-gray-300 italic whitespace-nowrap">
            Select text to format
          </span>
        </div>

      </div>

    </>
  );
}