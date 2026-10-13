"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  ShieldCheck,
  RotateCcw,
  ChevronDown,
  CheckCircle2,
  Languages,
} from "lucide-react";
import type { PageSection } from "@prisma/client";
import { submitPageSection } from "@/lib/actions/admin";
import { SubmitButton } from "@/components/admin/submit-button";
import { iconKeys, getLucideIcon } from "@/lib/icons";
import { translateTradeTerm } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export interface CredentialCardItem {
  id?: string;
  title: string;
  subtitle: string;
  value: string;
  badge: string;
  icon: string;
}

const defaultCredentialCards: CredentialCardItem[] = [
  {
    title: "MyCO / DICA Registered",
    subtitle: "Directorate of Investment and Company Administration",
    value: "109847291 (MyCO)",
    badge: "Verified Entity",
    icon: "ShieldCheck",
  },
  {
    title: "Exporter / Importer License",
    subtitle: "Ministry of Commerce (PaThaKa registered)",
    value: "MOC-PTK-2024/0912",
    badge: "Active Exporter",
    icon: "FileCheck2",
  },
  {
    title: "MPBSA Association",
    subtitle: "Myanmar Pulses, Beans & Sesame Seeds Merchants Assoc.",
    value: "Full Member",
    badge: "Trade Assoc.",
    icon: "Award",
  },
  {
    title: "MRF Rice Federation",
    subtitle: "Myanmar Rice Federation trade member",
    value: "Federation Member",
    badge: "Rice Trade",
    icon: "Leaf",
  },
  {
    title: "Quality & Inspection",
    subtitle: "SGS / Bureau Veritas pre-shipment inspection compliant",
    value: "Phytosanitary & Fumigation",
    badge: "SGS / BV Standard",
    icon: "Globe2",
  },
  {
    title: "Ports of Loading",
    subtitle: "Yangon Port Terminals & Thilawa SEZ (MITT)",
    value: "FOB Yangon / Thilawa",
    badge: "Global Logistics",
    icon: "Ship",
  },
];

export function TrustComplianceForm({
  section,
  defaultRegNumber = "",
  defaultExportLicense = "",
}: {
  section: PageSection | null;
  defaultRegNumber?: string;
  defaultExportLicense?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Controlled section texts
  const [subtitle, setSubtitle] = useState(section?.subtitle ?? "Trust & Compliance");
  const [title, setTitle] = useState(section?.title ?? "Official Trade Registrations & Compliance");
  const [body, setBody] = useState(
    section?.body ??
      "Fully registered and compliant with Myanmar Ministry of Commerce and recognized trade associations."
  );

  // Initialize meta items or fallback
  const metaObj = (section?.meta ?? {}) as Record<string, unknown>;
  const initialCards: CredentialCardItem[] =
    Array.isArray(metaObj.items) && metaObj.items.length > 0
      ? (metaObj.items as CredentialCardItem[])
      : defaultCredentialCards.map((c) => {
          if (c.icon === "ShieldCheck" && defaultRegNumber) return { ...c, value: defaultRegNumber };
          if (c.icon === "FileCheck2" && defaultExportLicense) return { ...c, value: defaultExportLicense };
          return c;
        });

  const [cards, setCards] = useState<CredentialCardItem[]>(initialCards);
  const [isActive, setIsActive] = useState(section ? section.isActive : true);

  const updateCard = (index: number, patch: Partial<CredentialCardItem>) => {
    setCards((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const addCard = () => {
    setCards((prev) => [
      ...prev,
      {
        title: "New Accreditation / License",
        subtitle: "Certifying body or agency",
        value: "Reg. / Status",
        badge: "Compliance",
        icon: "Award",
      },
    ]);
  };

  const removeCard = (index: number) => {
    setCards((prev) => prev.filter((_, i) => i !== index));
  };

  const resetDefaults = () => {
    setCards(
      defaultCredentialCards.map((c) => {
        if (c.icon === "ShieldCheck" && defaultRegNumber) return { ...c, value: defaultRegNumber };
        if (c.icon === "FileCheck2" && defaultExportLicense) return { ...c, value: defaultExportLicense };
        return c;
      })
    );
  };

  // One-click auto translate handler
  const autoTranslate = (toLang: "my" | "en") => {
    if (toLang === "my") {
      setSubtitle("ယုံကြည်စိတ်ချရမှုနှင့် စည်းမျဉ်းလိုက်နာမှု");
      setTitle("တရားဝင် ကုန်သွယ်ရေးမှတ်ပုံတင်နှင့် အသိအမှတ်ပြုလက်မှတ်များ");
      setBody(
        "စီးပွားရေးနှင့် ကူးသန်းရောင်းဝယ်ရေးဝန်ကြီးဌာနနှင့် ကုန်သည်အသင်းချုပ်များ၏ စည်းမျဉ်းများနှင့်အညီ တရားဝင်ရပ်တည်ဆောင်ရွက်ပါသည်။"
      );
      setCards((prev) =>
        prev.map((c) => ({
          ...c,
          title: translateTradeTerm(c.title, "my"),
          subtitle: translateTradeTerm(c.subtitle, "my"),
          badge: translateTradeTerm(c.badge, "my"),
          value: translateTradeTerm(c.value, "my"),
        }))
      );
    } else {
      setSubtitle("Trust & Compliance");
      setTitle("Official Trade Registrations & Compliance");
      setBody(
        "Fully registered and compliant with Myanmar Ministry of Commerce and recognized trade associations."
      );
      setCards((prev) =>
        prev.map((c) => ({
          ...c,
          title: translateTradeTerm(c.title, "en"),
          subtitle: translateTradeTerm(c.subtitle, "en"),
          badge: translateTradeTerm(c.badge, "en"),
          value: translateTradeTerm(c.value, "en"),
        }))
      );
    }
  };

  const metaJson = JSON.stringify({ items: cards });

  return (
    <div className="card-surface overflow-hidden border border-sand-200/80 shadow-card">
      {/* Header bar */}
      <div
        onClick={() => setIsExpanded((p) => !p)}
        className="flex cursor-pointer select-none items-center justify-between gap-4 p-5 transition-colors hover:bg-forest-50/40"
      >
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest-100 text-forest-700">
            <ShieldCheck className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base font-semibold text-forest-950 sm:text-lg">
                Trust & Compliance Section
              </h3>
              {section?.id ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-forest-100 px-2.5 py-0.5 text-xs font-medium text-forest-800">
                  <CheckCircle2 className="h-3 w-3 text-forest-600" /> Customized
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-sand-100 px-2 py-0.5 text-xs font-medium text-forest-700/60">
                  Default Active
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-forest-700/70 sm:text-sm">
              Manage the trade credentials, certifications, and compliance cards shown on the Contact page.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full text-forest-700/60 transition-transform duration-200 hover:bg-sand-100 hover:text-forest-900"
          aria-label={isExpanded ? "Collapse section" : "Expand section"}
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-200", isExpanded && "rotate-180")}
          />
        </button>
      </div>

      {isExpanded && (
        <form action={submitPageSection} className="border-t border-sand-200/80 p-5 pt-6 sm:p-6 grid gap-6">
          <input type="hidden" name="id" value={section?.id ?? ""} />
          <input type="hidden" name="page" value="contact" />
          <input type="hidden" name="key" value="trust" />
          <input type="hidden" name="position" value="10" />
          <input type="hidden" name="meta" value={metaJson} />

          {/* Visibility & Auto-Translate Quick Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-sand-50/70 p-3.5 border border-sand-200">
            <div>
              <p className="text-sm font-semibold text-forest-950">Section Controls & Translation</p>
              <p className="text-xs text-forest-700/70">
                Toggle visibility or 1-click auto-translate all fields into Myanmar or English.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Auto Translate Buttons */}
              <button
                type="button"
                onClick={() => autoTranslate("my")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gold-400/20 px-3 py-1.5 text-xs font-bold text-forest-900 transition-colors hover:bg-gold-400/40"
                title="Convert all titles, subtitles, and badges into Myanmar Unicode"
              >
                <Languages className="h-3.5 w-3.5 text-gold-700" />
                <span>Auto-Translate to Myanmar (မြန်မာ)</span>
              </button>

              <button
                type="button"
                onClick={() => autoTranslate("en")}
                className="inline-flex items-center gap-1 rounded-lg border border-sand-300 bg-white px-2.5 py-1.5 text-xs font-medium text-forest-800 transition-colors hover:bg-sand-100"
                title="Convert back to English"
              >
                <span>English</span>
              </button>

              <div className="ml-2 pl-2 border-l border-sand-300 flex items-center">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-sand-300 accent-forest-700"
                  />
                  <span className="ml-1.5 text-xs font-semibold text-forest-900">
                    {isActive ? "Visible" : "Hidden"}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Section Heading & Subtitle */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-forest-900">
                Eyebrow / Sub-headline
              </label>
              <input
                name="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Trust & Compliance"
                className="input-admin"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-forest-900">
                Main Headline
              </label>
              <input
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Official Trade Registrations & Compliance"
                className="input-admin"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-forest-900">
                Section Description Copy
              </label>
              <textarea
                name="body"
                rows={2}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Introductory paragraph explaining compliance and standards…"
                className="input-admin"
              />
            </div>
          </div>

          {/* Individual Credential Cards Editor */}
          <div className="space-y-4 pt-2 border-t border-sand-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-serif text-sm font-bold text-forest-950 sm:text-base">
                  Credential Cards ({cards.length})
                </h4>
                <p className="text-xs text-forest-700/70">
                  Each card appears in the grid with an icon, badge, title, subtitle, and registration/status value.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetDefaults}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-sand-300 bg-white px-3 py-1.5 text-xs font-semibold text-forest-800 transition-colors hover:bg-sand-50"
                  title="Reset to default 6 Myanmar trading cards"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Defaults</span>
                </button>
                <button
                  type="button"
                  onClick={addCard}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-forest-100 px-3 py-1.5 text-xs font-semibold text-forest-900 transition-colors hover:bg-forest-700 hover:text-cream"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Card</span>
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {cards.map((card, idx) => {
                const IconComponent = getLucideIcon(card.icon);
                return (
                  <div
                    key={idx}
                    className="relative flex flex-col justify-between rounded-xl border border-sand-200 bg-sand-50/50 p-4 transition-all hover:border-forest-400/50"
                  >
                    <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-sand-200/60">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest-100 text-forest-800">
                          <IconComponent className="h-4 w-4" />
                        </span>
                        <select
                          value={card.icon}
                          onChange={(e) => updateCard(idx, { icon: e.target.value })}
                          className="h-8 rounded-lg border border-sand-300 bg-white px-2 text-xs font-medium text-forest-900"
                        >
                          {iconKeys.map((key) => (
                            <option key={key} value={key}>
                              {key}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeCard(idx)}
                        className="rounded-md p-1 text-soil-700 hover:bg-soil-100"
                        title="Delete this credential card"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-forest-900">
                          Title
                        </label>
                        <input
                          value={card.title}
                          onChange={(e) => updateCard(idx, { title: e.target.value })}
                          placeholder="e.g. MyCO / DICA Registered"
                          className="h-9 w-full rounded-lg border border-sand-200 bg-white px-2.5 text-xs focus:border-forest-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-forest-900">
                          Subtitle / Issuer
                        </label>
                        <input
                          value={card.subtitle}
                          onChange={(e) => updateCard(idx, { subtitle: e.target.value })}
                          placeholder="e.g. Directorate of Investment and Company Administration"
                          className="h-9 w-full rounded-lg border border-sand-200 bg-white px-2.5 text-xs focus:border-forest-600 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold text-forest-900">
                            Value / Reg. No.
                          </label>
                          <input
                            value={card.value}
                            onChange={(e) => updateCard(idx, { value: e.target.value })}
                            placeholder="e.g. 109847291 (MyCO)"
                            className="h-9 w-full rounded-lg border border-sand-200 bg-white px-2.5 text-xs focus:border-forest-600 focus:outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold text-forest-900">
                            Badge Text
                          </label>
                          <input
                            value={card.badge}
                            onChange={(e) => updateCard(idx, { badge: e.target.value })}
                            placeholder="e.g. Verified Entity"
                            className="h-9 w-full rounded-lg border border-sand-200 bg-white px-2.5 text-xs focus:border-forest-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="flex items-center justify-between border-t border-sand-200/80 pt-4">
            <span className="text-xs text-forest-700/60">
              Changes update immediately on the live Contact page.
            </span>
            <SubmitButton variant="primary" pendingText="Saving Trust Section…">
              Save Trust & Compliance
            </SubmitButton>
          </div>
        </form>
      )}
    </div>
  );
}
