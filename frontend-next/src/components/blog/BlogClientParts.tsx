"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { copyText } from "@/components/blog/SharePopup";

/**
 * The only interactive bits of an article page. Everything else in
 * BlogArticle is server-rendered HTML.
 */

/** The "Share" button beside the date: opens the share sheet. */
export { default as ShareButton } from "@/components/blog/SharePopup";

/** The larger call-to-action copy button at the end of the article. */
export function CopyLinkCta({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    if (await copyText(url)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 sm:px-8 py-3 bg-[#6B4A2D] hover:bg-[#5a3f25] text-white font-semibold text-sm sm:text-base rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Copy icon, then a check mark the moment the link is copied. */}
      {copied ? (
        <Check key="done" className="w-4 h-4 sm:w-5 sm:h-5 text-green-300 animate-success-pop" strokeWidth={3} aria-hidden="true" />
      ) : (
        <Copy key="copy" className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} aria-hidden="true" />
      )}
      <span aria-live="polite">{copied ? "Link Copied!" : "Copy Article Link"}</span>
    </button>
  );
}

interface FallbackImgProps {
  src: string;
  fallback: string;
  alt: string;
  className: string;
  width: number;
  height: number;
  priority?: boolean;
}

/** <img> that swaps to a local placeholder if the uploaded file is missing. */
export function FallbackImg({ src, fallback, alt, className, width, height, priority = false }: FallbackImgProps) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={failed ? fallback : src}
      alt={alt}
      onError={() => setFailed(true)}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      width={width}
      height={height}
      className={className}
    />
  );
}
