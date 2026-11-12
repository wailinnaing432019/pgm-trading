"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

type ArticleShareBarProps = {
  title: string;
};

export function ArticleShareBar({ title }: ArticleShareBarProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {
      console.error("Failed to copy link", e);
    }
  };

  const shareToLinkedIn = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  const shareToWhatsApp = () => {
    if (typeof window !== "undefined") {
      const text = encodeURIComponent(`${title} — Pacific Global Myanmar: ${window.location.href}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
    }
  };

  const shareToTwitter = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(title);
      window.open(
        `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className="hidden sm:inline text-xs text-forest-700/60 font-medium mr-1 flex items-center gap-1">
        <Share2 className="h-3.5 w-3.5" /> Share:
      </span>

      {/* Copy Link Button */}
      <button
        type="button"
        onClick={copyToClipboard}
        title="Copy article link"
        className="inline-flex items-center gap-1.5 rounded-full border border-sand-300 bg-white px-3 py-1.5 text-xs font-medium text-forest-800 shadow-xs hover:border-gold-400 hover:bg-sand-50 transition"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-emerald-700 font-semibold">Copied</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 text-forest-500" />
            <span>Copy Link</span>
          </>
        )}
      </button>

      {/* WhatsApp Button */}
      <button
        type="button"
        onClick={shareToWhatsApp}
        title="Share to WhatsApp"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sand-300 bg-white text-xs font-medium text-forest-700 shadow-xs hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition"
      >
        <span className="font-bold text-[11px]">WA</span>
      </button>

      {/* LinkedIn Button */}
      <button
        type="button"
        onClick={shareToLinkedIn}
        title="Share to LinkedIn"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sand-300 bg-white text-xs font-medium text-forest-700 shadow-xs hover:border-sky-500 hover:bg-sky-50 hover:text-sky-700 transition"
      >
        <span className="font-bold text-[11px]">in</span>
      </button>

      {/* X / Twitter Button */}
      <button
        type="button"
        onClick={shareToTwitter}
        title="Share to X (Twitter)"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sand-300 bg-white text-xs font-medium text-forest-700 shadow-xs hover:border-forest-900 hover:bg-forest-50 hover:text-forest-950 transition"
      >
        <span className="font-bold text-[11px]">𝕏</span>
      </button>
    </div>
  );
}
