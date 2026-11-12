"use client";

import { useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
import { WhatsAppIcon, ViberIcon } from "@/components/ui/trade-icons";

type ProductShareBarProps = {
  title: string;
  summary?: string;
};

export function ProductShareBar({ title, summary }: ProductShareBarProps) {
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

  const shareToWhatsApp = () => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      const text = encodeURIComponent(
        `Pacific Global Myanmar — ${title}\n${summary ? `${summary}\n` : ""}View specifications: ${url}`
      );
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
    }
  };

  const shareToViber = () => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      const text = encodeURIComponent(
        `Pacific Global Myanmar — ${title}\nView product specifications: ${url}`
      );
      window.open(`viber://forward?text=${text}`, "_blank", "noopener,noreferrer");
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

  const shareToTwitter = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`${title} — Pacific Global Myanmar`);
      window.open(
        `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  const shareViaEmail = () => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      const subject = encodeURIComponent(`${title} — Product Specifications (Pacific Global Myanmar)`);
      const body = encodeURIComponent(
        `Hello,\n\nPlease find the product specifications and export details for ${title} from Pacific Global Myanmar at the link below:\n\n${url}\n\nSummary:\n${summary ?? ""}\n\nRegards,\nPacific Global Myanmar Trade Desk`
      );
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Copy Link Button */}
      <button
        type="button"
        onClick={copyToClipboard}
        title="Copy product link"
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
        title="Share product via WhatsApp"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sand-300 bg-white text-emerald-600 shadow-xs hover:border-emerald-500 hover:bg-emerald-50 transition"
      >
        <WhatsAppIcon className="h-4 w-4" />
      </button>

      {/* Viber Button */}
      <button
        type="button"
        onClick={shareToViber}
        title="Share product via Viber"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sand-300 bg-white text-purple-600 shadow-xs hover:border-purple-500 hover:bg-purple-50 transition"
      >
        <ViberIcon className="h-4 w-4" />
      </button>

      {/* LinkedIn Button */}
      <button
        type="button"
        onClick={shareToLinkedIn}
        title="Share to LinkedIn"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sand-300 bg-white text-sky-700 shadow-xs hover:border-sky-500 hover:bg-sky-50 transition"
      >
        <span className="font-bold text-[11px]">in</span>
      </button>

      {/* X / Twitter Button */}
      <button
        type="button"
        onClick={shareToTwitter}
        title="Share to X"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sand-300 bg-white text-forest-900 shadow-xs hover:border-forest-900 hover:bg-forest-50 transition"
      >
        <span className="font-bold text-[11px]">𝕏</span>
      </button>

      {/* Email Button */}
      <button
        type="button"
        onClick={shareViaEmail}
        title="Email product specifications"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sand-300 bg-white text-forest-700 shadow-xs hover:border-forest-800 hover:bg-sand-50 transition"
      >
        <Mail className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
