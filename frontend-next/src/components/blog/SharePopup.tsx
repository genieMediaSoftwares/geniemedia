"use client";

import { useState, useRef, useEffect } from "react";
import {
  Linkedin,
  Facebook,
  Twitter,
  Link2,
  Check,
  X,
  Share2,
} from "lucide-react";

/** Platforms shown in the share popup. */
interface SharePlatform {
  /** Key used for the icon lookup / aria label. */
  name: string;
  /** URL opened when the user clicks the tile. */
  shareUrl: string;
  /** Brand background colour for the tile. */
  bg: string;
  /** Icon shown on the tile (lucide-react component). */
  icon: React.ReactNode;
}

/** Build the platform list from a URL + optional title. */
function buildPlatforms(url: string, title: string): SharePlatform[] {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title || "Check this out!");

  return [
    {
      name: "WhatsApp",
      shareUrl: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      bg: "#25D366",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bg: "#1877F2",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 fill-current">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      shareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      bg: "#0A66C2",
      icon: <Linkedin className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "Twitter",
      shareUrl: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      bg: "#000000",
      icon: <Twitter className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "Instagram",
      shareUrl: `https://www.instagram.com/`,
      bg: "#E4405F",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 fill-current">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Exported popup component                                            */
/* ------------------------------------------------------------------ */

interface SharePopupProps {
  /** Absolute URL to share. */
  url: string;
  /** Title used in share text (Twitter, WhatsApp). */
  title?: string;
  /** Extra class on the trigger button. */
  className?: string;
  /** Trigger button label when not copying. */
  label?: string;
  /** Trigger icon before the label. */
  triggerIcon?: React.ReactNode;
  /** Variant: "icon" = icon-only trigger, "full" = icon + text trigger. */
  variant?: "icon" | "full";
}

export default function SharePopup({
  url,
  title = "",
  className = "",
  label = "Share",
  triggerIcon,
  variant = "icon",
}: SharePopupProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const platforms = buildPlatforms(url, title);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const handleCopy = async () => {
    const ok = await copyText(url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = (shareUrl: string) => {
    window.open(shareUrl, "_blank", "width=600,height=500,noopener,noreferrer");
    setOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={popupRef}>
      {/* ── Trigger ───────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        title="Share"
        aria-haspopup="true"
        aria-expanded={open}
        className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] rounded-lg font-semibold transition-colors ${
          variant === "icon"
            ? "px-3 py-2 bg-[#6B4A2D] hover:bg-[#5a3f25] text-white"
            : "px-4 py-2.5 bg-[#6B4A2D] hover:bg-[#5a3f25] text-white text-xs sm:text-sm"
        }`}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-green-300" strokeWidth={2.5} />
            <span>Copied!</span>
          </>
        ) : (
          <>
            {triggerIcon ?? <Share2 className="w-4 h-4" strokeWidth={2} />}
            {variant === "full" && <span>{label}</span>}
          </>
        )}
      </button>

      {/* ── Popup ────────────────────────────────────── */}
      {open && (
        <div
          role="dialog"
          aria-label="Share options"
          className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-admin-fade-in"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-xs sm:text-sm font-bold text-gray-700">Share this article</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Social tiles */}
          <div className="grid grid-cols-4 gap-2 p-3 sm:p-4">
            {platforms.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleShare(p.shareUrl)}
                title={`Share on ${p.name}`}
                className="flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-lg"
                style={{ backgroundColor: `${p.bg}12`, color: p.bg }}
              >
                <span
                  className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-transform"
                  style={{ backgroundColor: p.bg }}
                >
                  <span className="text-white">{p.icon}</span>
                </span>
                <span className="text-[10px] sm:text-xs font-semibold truncate w-full text-center">
                  {p.name}
                </span>
              </button>
            ))}
          </div>

          {/* Copy link row */}
          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            <button
              type="button"
              onClick={handleCopy}
              className="w-full flex items-center gap-2.5 px-3 sm:px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 transition-colors"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#6B4A2D] text-white shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 truncate">
                {copied ? "Link copied to clipboard!" : "Copy article link"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small helper – kept separate so the admin card can reuse it.       */
/* ------------------------------------------------------------------ */

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers / restricted contexts
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}
