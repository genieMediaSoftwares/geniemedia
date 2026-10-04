"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

/**
 * The only interactive bits of an article page. Everything else in
 * BlogArticle is server-rendered HTML.
 */

const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/** The compact "Share" button beside the date. */
export function CopyLinkButton({ url }: { url: string }) {
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
      title="Copy link"
      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 bg-[#6B4A2D] hover:bg-[#5a3f25] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors w-fit"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-300" strokeWidth={2.5} />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" strokeWidth={2} />
          <span>Share</span>
        </>
      )}
    </button>
  );
}

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
      <Share2 className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
      {copied ? "Copied to Clipboard!" : "Copy Article Link"}
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
