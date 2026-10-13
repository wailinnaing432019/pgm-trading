"use client";

import React from "react";
import { Award, CheckCircle2, FileCheck2, Globe2, ShieldCheck, Ship, type LucideIcon } from "lucide-react";
import type { PageSection } from "@prisma/client";
import { useLanguage, translateTradeTerm } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/site";
import { getLucideIcon } from "@/lib/icons";

interface CustomCredentialItem {
  title: string;
  subtitle: string;
  value: string;
  badge: string;
  icon?: string;
}

export function TradeCredentials({
  settings,
  section,
}: {
  settings: SiteSettings;
  section?: PageSection | null;
}) {
  const { lang, t } = useLanguage();

  // If section was explicitly disabled by admin, hide it
  if (section && !section.isActive) {
    return null;
  }

  const metaObj = (section?.meta ?? {}) as Record<string, unknown>;
  const customItems = Array.isArray(metaObj.items) && metaObj.items.length > 0
    ? (metaObj.items as CustomCredentialItem[])
    : null;

  const defaultItems = [
    {
      icon: ShieldCheck as LucideIcon,
      title: t.trust.regTitle,
      subtitle: t.trust.regSubtitle,
      value: settings.regNumber || "109847291 (MyCO)",
      badge: "Verified Entity",
    },
    {
      icon: FileCheck2 as LucideIcon,
      title: t.trust.licenseTitle,
      subtitle: t.trust.licenseSubtitle,
      value: settings.exportLicense || "MOC-PTK-2024/0912",
      badge: "Active Exporter",
    },
    {
      icon: Award as LucideIcon,
      title: t.trust.mpbsaTitle,
      subtitle: t.trust.mpbsaSubtitle,
      value: "Full Member",
      badge: "Trade Assoc.",
    },
    {
      icon: CheckCircle2 as LucideIcon,
      title: t.trust.mrfTitle,
      subtitle: t.trust.mrfSubtitle,
      value: "Federation Member",
      badge: "Rice Trade",
    },
    {
      icon: Globe2 as LucideIcon,
      title: t.trust.qualityTitle,
      subtitle: t.trust.qualitySubtitle,
      value: "Phytosanitary & Fumigation",
      badge: "SGS / BV Standard",
    },
    {
      icon: Ship as LucideIcon,
      title: t.trust.portTitle,
      subtitle: t.trust.portSubtitle,
      value: "FOB Yangon / Thilawa",
      badge: "Global Logistics",
    },
  ];

  const rawItems = customItems
    ? customItems.map((item) => ({
        icon: getLucideIcon(item.icon),
        title: item.title,
        subtitle: item.subtitle,
        value: item.value,
        badge: item.badge,
      }))
    : defaultItems;

  // Apply auto-translation if visitor selected Myanmar language
  const items = rawItems.map((item) => {
    if (lang === "my") {
      return {
        ...item,
        title: translateTradeTerm(item.title, "my"),
        subtitle: translateTradeTerm(item.subtitle, "my"),
        badge: translateTradeTerm(item.badge, "my"),
        value: translateTradeTerm(item.value, "my"),
      };
    }
    return item;
  });

  const rawTitle = section?.title || t.trust.credentialsTitle;
  const rawSubtitle = section?.subtitle || (lang === "my" ? "ယုံကြည်စိတ်ချရမှုနှင့် စည်းမျဉ်းလိုက်နာမှု" : "Trust & Compliance");
  const rawBody = section?.body || t.trust.credentialsSubtitle;

  const title = lang === "my" ? translateTradeTerm(rawTitle, "my") || t.trust.credentialsTitle : rawTitle;
  const subtitle = lang === "my" ? translateTradeTerm(rawSubtitle, "my") || "ယုံကြည်စိတ်ချရမှုနှင့် စည်းမျဉ်းလိုက်နာမှု" : rawSubtitle;
  const body = lang === "my" ? translateTradeTerm(rawBody, "my") || t.trust.credentialsSubtitle : rawBody;

  return (
    <section className="border-y border-sand-200/80 bg-cream/70 py-14">
      <div className="section-container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
            {subtitle}
          </p>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-forest-950 md:text-3xl">
            {title}
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-forest-800/75">
            {body}
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-2xl border border-sand-200/80 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-forest-600/40 hover:shadow-lift"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-700 transition-colors group-hover:bg-forest-700 group-hover:text-cream">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="rounded-full bg-sand-100 px-2.5 py-0.5 text-[11px] font-semibold text-forest-800">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="mt-4 font-serif text-base font-semibold text-forest-950">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-forest-800/70">
                    {item.subtitle}
                  </p>
                </div>
                <div className="mt-4 border-t border-sand-100 pt-3">
                  <span className="font-mono text-xs font-semibold text-forest-900">
                    {item.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
