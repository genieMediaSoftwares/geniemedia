import React, { useState, useRef } from "react";
import { X } from "lucide-react";

/**
 * The chip/tag input used for keywords and for the areas a post covers.
 *
 * Lifted out of AdminBlogs.jsx unchanged so both fields share one behaviour
 * rather than drifting apart: type and press Enter or comma to add, Backspace
 * on an empty box to remove the last one, click the × to remove any, and a
 * half-typed value is committed on blur instead of being silently thrown away.
 *
 * The value is an array of strings. Callers holding a comma-separated string
 * (the legacy `keywords` column) convert at the call site, which keeps the
 * string-versus-array question out of this component entirely.
 */
export default function TagInput({
  tags = [],
  onChange,
  placeholder = "Type and press Enter…",
  morePlaceholder = "Add more…",
  chipStyle,
}) {
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef();

  const current = Array.isArray(tags) ? tags.filter(Boolean) : [];

  const addFrom = (raw) => {
    const incoming = String(raw)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!incoming.length) return;
    // Case-insensitive de-duplication, keeping the spelling already entered.
    const seen = new Set(current.map((t) => t.toLowerCase()));
    const merged = [...current];
    for (const tag of incoming) {
      if (seen.has(tag.toLowerCase())) continue;
      seen.add(tag.toLowerCase());
      merged.push(tag);
    }
    onChange(merged);
  };

  const removeTag = (idx) => onChange(current.filter((_, i) => i !== idx));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputVal.trim()) {
        addFrom(inputVal);
        setInputVal("");
      }
    } else if (e.key === "Backspace" && !inputVal && current.length) {
      removeTag(current.length - 1);
    }
  };

  const chip = chipStyle || { background: "#F3EBE3", color: "#6B4A2D", border: "1px solid #D4B49A" };

  return (
    <div
      className="flex flex-wrap gap-2 items-center px-3 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus-within:border-[#6B4A2D] focus-within:ring-4 focus-within:ring-[#6B4A2D]/10 transition cursor-text min-h-[48px]"
      onClick={() => inputRef.current?.focus()}
    >
      {current.map((tag, idx) => (
        <span
          key={`${tag}-${idx}`}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={chip}
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(idx);
            }}
            className="ml-0.5 rounded-full hover:bg-[#6B4A2D]/20 p-0.5 transition flex items-center justify-center"
            style={{ color: chip.color }}
            aria-label={`Remove ${tag}`}
          >
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
        onBlur={() => {
          if (inputVal.trim()) {
            addFrom(inputVal);
            setInputVal("");
          }
        }}
        placeholder={current.length === 0 ? placeholder : morePlaceholder}
        className="flex-1 min-w-[120px] text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent font-medium py-0.5"
      />
    </div>
  );
}
