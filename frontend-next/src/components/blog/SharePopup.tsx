"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Linkedin, Mail, MoreHorizontal, Share2, X as Close } from "lucide-react";
import { siFacebook, siInstagram, siTelegram, siWhatsapp, siX, type SimpleIcon } from "simple-icons";

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.className = "fixed opacity-0 pointer-events-none";
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

const canNativeShare = () => typeof navigator !== "undefined" && typeof navigator.share === "function";

const BrandIcon = ({ icon }: { icon: SimpleIcon }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden="true">
    <path d={icon.path} />
  </svg>
);

type Target =
  | { name: string; bg: string; icon: React.ReactNode; href: string }
  | { name: string; bg: string; icon: React.ReactNode; action: "instagram" };

function buildTargets(url: string, title: string): Target[] {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return [
    { name: "WhatsApp", bg: "bg-[#25D366]", icon: <BrandIcon icon={siWhatsapp} />, href: `https://wa.me/?text=${t}%20${u}` },
    { name: "Facebook", bg: "bg-[#0866FF]", icon: <BrandIcon icon={siFacebook} />, href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: "Instagram", bg: "bg-[#FF0069]", icon: <BrandIcon icon={siInstagram} />, action: "instagram" },
    { name: "LinkedIn", bg: "bg-[#0A66C2]", icon: <Linkedin className="w-6 h-6" aria-hidden="true" />, href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { name: "X", bg: "bg-black", icon: <BrandIcon icon={siX} />, href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { name: "Telegram", bg: "bg-[#26A5E4]", icon: <BrandIcon icon={siTelegram} />, href: `https://t.me/share/url?url=${u}&text=${t}` },
    { name: "Email", bg: "bg-[#6B4A2D]", icon: <Mail className="w-6 h-6" aria-hidden="true" />, href: `mailto:?subject=${t}&body=${t}%0A%0A${u}` },
  ];
}

interface ShareSheetProps {
  url: string;
  title: string;
  className?: string;
}

export default function SharePopup({ url, title, className = "" }: ShareSheetProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const native = open && canNativeShare();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  const flash = (message: string) => {
    setNote(message);
    setTimeout(() => setNote(null), 3000);
  };

  const handleCopy = async () => {
    if (await copyText(url)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title, url });
      setOpen(false);
    } catch {
    }
  };

  const shareToInstagram = async () => {
    if (native) return nativeShare();
    if (await copyText(url)) flash("Link copied. Paste it into your Instagram story, post or message.");
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };

  const targets = buildTargets(url, title);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 bg-[#6B4A2D] hover:bg-[#5a3f25] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors w-fit ${className}`}
      >
        <Share2 className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
        <span>Share</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 animate-admin-fade-in" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Share this article"
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:w-[26rem] max-h-[90vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <p className="text-base font-bold text-slate-900">Share this article</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-2 -mr-2 rounded-full text-slate-500 hover:bg-slate-100">
                <Close className="w-5 h-5" />
              </button>
            </div>

            <ul className="grid grid-cols-4 gap-y-4 px-4 pb-4">
              {targets.map((target) => (
                <li key={target.name}>
                  {"href" in target ? (
                    <a
                      href={target.href}
                      target={target.name === "Email" ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                      className="group flex flex-col items-center gap-1.5 text-slate-700"
                    >
                      <span className={`flex items-center justify-center w-12 h-12 rounded-full text-white transition-transform group-hover:scale-110 group-active:scale-95 ${target.bg}`}>
                        {target.icon}
                      </span>
                      <span className="text-[11px] sm:text-xs font-medium">{target.name}</span>
                    </a>
                  ) : (
                    <button type="button" onClick={shareToInstagram} className="group w-full flex flex-col items-center gap-1.5 text-slate-700">
                      <span className={`flex items-center justify-center w-12 h-12 rounded-full text-white transition-transform group-hover:scale-110 group-active:scale-95 ${target.bg}`}>
                        {target.icon}
                      </span>
                      <span className="text-[11px] sm:text-xs font-medium">{target.name}</span>
                    </button>
                  )}
                </li>
              ))}
              {native && (
                <li>
                  <button type="button" onClick={nativeShare} className="group w-full flex flex-col items-center gap-1.5 text-slate-700">
                    <span className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-200 text-slate-700 transition-transform group-hover:scale-110 group-active:scale-95">
                      <MoreHorizontal className="w-6 h-6" aria-hidden="true" />
                    </span>
                    <span className="text-[11px] sm:text-xs font-medium">More</span>
                  </button>
                </li>
              )}
            </ul>

            <div className="px-4">
              <button
                type="button"
                onClick={handleCopy}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors duration-200 ${copied ? "border-green-500 bg-green-50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"}`}
              >
                <span className={`flex items-center justify-center w-9 h-9 rounded-full text-white shrink-0 transition-colors duration-200 ${copied ? "bg-green-500" : "bg-[#6B4A2D]"}`}>
                  {copied ? <Check key="done" className="w-5 h-5 animate-success-pop" strokeWidth={3} /> : <Copy key="copy" className="w-4 h-4" />}
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className={`block text-sm font-semibold ${copied ? "text-green-700" : "text-slate-800"}`}>{copied ? "Link copied!" : "Copy link"}</span>
                  <span className="block text-xs text-slate-500 truncate">{url}</span>
                </span>
              </button>
              <p aria-live="polite" className="min-h-[1.25rem] mt-2 text-xs text-center text-slate-600">{note}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
