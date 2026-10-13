"use client";

import React, { useState } from "react";
import { MessageSquare, PhoneCall, Send, X } from "lucide-react";
import { WhatsAppIcon, ViberIcon } from "@/components/ui/trade-icons";
import { useLanguage } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/site";

export function TradeDeskFloating({ settings }: { settings: SiteSettings }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const cleanWhatsapp = (settings.whatsapp || "").replace(/[^0-9]/g, "");
  const cleanViber = (settings.viber || settings.phone || "").replace(/[^0-9]/g, "");

  const whatsappUrl = cleanWhatsapp
    ? `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent("Hello Pacific Global Myanmar Trade Desk, I would like to inquire about agricultural export/import products.")}`
    : `https://wa.me/959123456789`;

  const viberUrl = cleanViber ? `viber://chat?number=%2B${cleanViber}` : `viber://chat?number=%2B959123456789`;

  return (
    <aside aria-label="Trade Desk Quick Contact" className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5">
      {/* Popover Menu */}
      {isOpen && (
        <div className="mb-2 flex w-64 flex-col gap-2 rounded-2xl border border-sand-200 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-sand-100 pb-2">
            <div>
              <p className="font-serif text-sm font-bold text-forest-950">PGM Trade Desk</p>
              <p className="text-[11px] text-forest-700/70">Yangon, Myanmar (GMT+6:30)</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-forest-700/60 hover:bg-sand-100 hover:text-forest-900"
              aria-label="Close trade desk menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* WhatsApp Direct */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-900 transition-colors hover:bg-emerald-600 hover:text-white"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <WhatsAppIcon className="h-4 w-4" />
            </span>
            <span>{t.floating.chatWhatsapp}</span>
          </a>

          {/* Viber Direct */}
          <a
            href={viberUrl}
            className="flex items-center gap-3 rounded-xl bg-purple-50 px-3 py-2.5 text-xs font-semibold text-purple-900 transition-colors hover:bg-purple-600 hover:text-white"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white">
              <ViberIcon className="h-4 w-4" />
            </span>
            <span>{t.floating.chatViber}</span>
          </a>

          {/* Direct RFQ */}
          <a
            href="/contact?tab=rfq"
            className="flex items-center gap-3 rounded-xl bg-forest-50 px-3 py-2.5 text-xs font-semibold text-forest-900 transition-colors hover:bg-forest-700 hover:text-white"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest-700 text-white">
              <Send className="h-3.5 w-3.5" />
            </span>
            <span>{t.floating.instantRfq}</span>
          </a>

          {/* Direct Call */}
          <a
            href={`tel:${settings.phone}`}
            className="flex items-center gap-3 rounded-xl bg-sand-50 px-3 py-2 text-[11px] font-medium text-forest-800 hover:bg-sand-100"
          >
            <PhoneCall className="h-3.5 w-3.5 text-forest-600" />
            <span>Call: {settings.phone}</span>
          </a>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex h-13 items-center gap-2.5 rounded-full bg-forest-900 px-4 py-2.5 text-sm font-semibold text-cream shadow-xl ring-2 ring-gold-400/50 transition-all duration-300 hover:scale-105 hover:bg-forest-950 hover:shadow-2xl active:scale-95"
        aria-label="Open Trade Desk Desk"
      >
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
        </span>
        <MessageSquare className="h-4 w-4 text-gold-400" aria-hidden />
        <span className="hidden sm:inline font-serif">{t.floating.tradeDesk}</span>
      </button>
    </aside>
  );
}
