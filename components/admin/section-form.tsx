"use client";

import { useState } from "react";
import {
  ChevronDown,
  CheckCircle2,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Type,
  FileText,
  Eye,
  Settings2,
  Languages,
} from "lucide-react";
import type { PageSection } from "@prisma/client";
import { submitPageSection } from "@/lib/actions/admin";
import { ImageUploader } from "@/components/ui/image-uploader";
import { SubmitButton } from "@/components/admin/submit-button";
import { translateTradeTerm } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type SectionField = "title" | "subtitle" | "body" | "image";

type Props = {
  label: string;
  description?: string;
  page: string;
  sectionKey: string;
  fields: SectionField[];
  section: PageSection | null;
  defaultExpanded?: boolean;
};

const fieldLabels: Record<Exclude<SectionField, "image">, { label: string; placeholder: string; hint: string }> = {
  title: {
    label: "Headline / Title",
    placeholder: "Enter main headline…",
    hint: "Main heading displayed prominently in this block",
  },
  subtitle: {
    label: "Eyebrow / Sub-headline",
    placeholder: "e.g. WHAT WE DO or Supporting subtitle…",
    hint: "Appears above or just below the headline as context",
  },
  body: {
    label: "Body Text / Description",
    placeholder: "Write descriptive copy for this section…",
    hint: "Rich informative paragraph for visitors",
  },
};

export function SectionForm({
  label,
  description,
  page,
  sectionKey,
  fields,
  section,
  defaultExpanded = true,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showPreview, setShowPreview] = useState(false);
  const [titleValue, setTitleValue] = useState(section?.title ?? "");
  const [subtitleValue, setSubtitleValue] = useState(section?.subtitle ?? "");
  const [bodyValue, setBodyValue] = useState(section?.body ?? "");

  // Determine if this section has customized content
  const isConfigured = Boolean(
    (fields.includes("title") && section?.title) ||
    (fields.includes("body") && section?.body) ||
    (fields.includes("image") && section?.image) ||
    (fields.includes("subtitle") && section?.subtitle)
  );

  const [isTranslating, setIsTranslating] = useState(false);

  const handleAutoTranslate = async (targetLang: "my" | "en") => {
    setIsTranslating(true);
    try {
      const payload: { key: "title" | "subtitle" | "body"; text: string }[] = [];
      if (titleValue) payload.push({ key: "title", text: titleValue });
      if (subtitleValue) payload.push({ key: "subtitle", text: subtitleValue });
      if (bodyValue) payload.push({ key: "body", text: bodyValue });

      if (payload.length === 0) {
        setIsTranslating(false);
        return;
      }

      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: payload.map((p) => p.text),
          target: targetLang,
        }),
      });

      const data = await res.json();
      if (data.ok && Array.isArray(data.translations)) {
        payload.forEach((p, idx) => {
          const translated = data.translations[idx];
          if (translated) {
            if (p.key === "title") setTitleValue(translated);
            if (p.key === "subtitle") setSubtitleValue(translated);
            if (p.key === "body") setBodyValue(translated);
          }
        });
      }
    } catch (err) {
      console.error("[AutoTranslate] error:", err);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div
      id={`section-${sectionKey}`}
      data-section-key={sectionKey}
      data-section-label={label}
      className={cn(
        "card-surface overflow-hidden border border-sand-200/80 transition-all duration-200 scroll-mt-24",
        isExpanded ? "ring-1 ring-forest-600/10 shadow-card" : "hover:border-forest-300"
      )}
    >
      {/* Header bar: acts as accordion trigger */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex cursor-pointer select-none items-center justify-between gap-4 p-5 transition-colors hover:bg-forest-50/40"
      >
        <div className="flex min-w-0 items-center gap-3.5">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
              isConfigured
                ? "bg-forest-100 text-forest-700"
                : "bg-sand-100 text-forest-800/60"
            )}
          >
            {sectionKey === "hero" ? (
              <Sparkles className="h-4 w-4" aria-hidden />
            ) : fields.includes("image") ? (
              <ImageIcon className="h-4 w-4" aria-hidden />
            ) : (
              <Layers className="h-4 w-4" aria-hidden />
            )}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-serif text-base font-semibold text-forest-950 sm:text-lg">
                {label}
              </h2>
              {isConfigured ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-forest-100 px-2.5 py-0.5 text-xs font-medium text-forest-800">
                  <CheckCircle2 className="h-3 w-3 text-forest-600" aria-hidden /> Configured
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-sand-100 px-2 py-0.5 text-xs font-medium text-forest-700/60">
                  Default / Unset
                </span>
              )}
            </div>
            {description ? (
              <p className="mt-0.5 text-xs text-forest-700/70 sm:text-sm line-clamp-1">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Collapsed summary pill */}
          {!isExpanded && section?.title && (
            <span className="hidden max-w-[200px] truncate text-xs text-forest-700/60 md:inline-block">
              “{section.title}”
            </span>
          )}
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
      </div>

      {/* Expanded Content Form */}
      {isExpanded && (
        <form action={submitPageSection} className="border-t border-sand-200/80 p-5 pt-6 sm:p-6">
          <input type="hidden" name="id" value={section?.id ?? ""} />
          <input type="hidden" name="page" value={page} />
          <input type="hidden" name="key" value={sectionKey} />
          <input type="hidden" name="position" value={String(section?.position ?? 0)} />
          <input type="hidden" name="isActive" value="on" />
          <input type="hidden" name="meta" value="{}" />

          {/* Quick Toolbar: Auto-Translate & Live Preview */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isTranslating}
                onClick={() => handleAutoTranslate("my")}
                className="inline-flex items-center gap-1.5 rounded-full bg-gold-400/20 px-3 py-1 text-xs font-bold text-forest-900 transition-colors hover:bg-gold-400/35 disabled:opacity-50"
                title="Translate current headline and body into Myanmar Unicode"
              >
                <Languages className={cn("h-3.5 w-3.5 text-gold-700", isTranslating && "animate-spin")} />
                <span>{isTranslating ? "Translating…" : "Translate to Myanmar (မြန်မာ)"}</span>
              </button>
              <button
                type="button"
                disabled={isTranslating}
                onClick={() => handleAutoTranslate("en")}
                className="inline-flex items-center gap-1 rounded-full border border-sand-300 bg-sand-50 px-2.5 py-1 text-xs font-medium text-forest-800 transition-colors hover:bg-forest-50 disabled:opacity-50"
                title="Translate back to English"
              >
                <span>English</span>
              </button>
            </div>

            {(titleValue || bodyValue || subtitleValue) && (
              <button
                type="button"
                onClick={() => setShowPreview((p) => !p)}
                className="inline-flex items-center gap-1.5 rounded-full border border-sand-300 bg-sand-50 px-3 py-1 text-xs font-medium text-forest-800 transition-colors hover:bg-forest-50"
              >
                <Eye className="h-3.5 w-3.5" aria-hidden />
                {showPreview ? "Hide Preview" : "Live Typography Preview"}
              </button>
            )}
          </div>

          {/* Live Preview Box */}
          {showPreview && (titleValue || subtitleValue || bodyValue) && (
            <div className="mb-6 rounded-2xl border border-gold-300/60 bg-gradient-to-br from-cream via-sand-50 to-gold-50/30 p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gold-700">
                <span>Section Appearance Preview</span>
                <span className="text-[11px] font-normal normal-case text-forest-700/60">
                  Approximate typography styling
                </span>
              </div>
              {subtitleValue ? (
                <p className="text-xs font-bold uppercase tracking-widest text-gold-600">
                  {subtitleValue}
                </p>
              ) : null}
              {titleValue ? (
                <h3 className="mt-1 font-serif text-xl font-semibold text-forest-950 sm:text-2xl">
                  {titleValue}
                </h3>
              ) : null}
              {bodyValue ? (
                <p className="mt-2 text-sm leading-relaxed text-forest-800/80">
                  {bodyValue}
                </p>
              ) : null}
            </div>
          )}

          <div className="grid gap-5">
            {fields.map((field) => {
              if (field === "image") {
                return (
                  <div key={field} className="rounded-xl border border-sand-200/60 bg-sand-50/50 p-4">
                    <ImageUploader
                      name="image"
                      label="Cover / Banner Image (optional)"
                      initial={section?.image ? [section.image] : []}
                    />
                    <p className="mt-2 text-xs text-forest-700/60">
                      Recommended: High resolution landscape JPG or WebP (min. 1600×900 px)
                    </p>
                  </div>
                );
              }

              const config = fieldLabels[field];

              if (field === "body") {
                return (
                  <div key={field} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-sm font-medium text-forest-900">
                        <FileText className="h-4 w-4 text-forest-600" aria-hidden />
                        {config.label}
                      </label>
                      <span className="text-xs text-forest-700/50">
                        {bodyValue.length} characters
                      </span>
                    </div>
                    <textarea
                      name="body"
                      rows={4}
                      value={bodyValue}
                      onChange={(e) => setBodyValue(e.target.value)}
                      placeholder={config.placeholder}
                      className="input-admin resize-y"
                    />
                    <p className="text-xs text-forest-700/60">{config.hint}</p>
                  </div>
                );
              }

              return (
                <div key={field} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-forest-900">
                      <Type className="h-4 w-4 text-forest-600" aria-hidden />
                      {config.label}
                    </label>
                    <span className="text-xs text-forest-700/50">
                      {field === "title" ? titleValue.length : subtitleValue.length} chars
                    </span>
                  </div>
                  <input
                    name={field}
                    value={field === "title" ? titleValue : subtitleValue}
                    onChange={(e) => {
                      if (field === "title") setTitleValue(e.target.value);
                      else setSubtitleValue(e.target.value);
                    }}
                    placeholder={config.placeholder}
                    className="input-admin"
                  />
                  <p className="text-xs text-forest-700/60">{config.hint}</p>
                </div>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-sand-200/80 pt-5">
            <span className="text-xs text-forest-700/60">
              Changes update immediately on the public website.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="inline-flex h-10 items-center rounded-full px-4 text-xs font-semibold text-forest-700/70 transition-colors hover:bg-sand-100 hover:text-forest-900"
              >
                Collapse
              </button>
              <SubmitButton
                variant="primary"
                pendingText="Saving section…"
              >
                <Settings2 className="h-4 w-4 shrink-0" aria-hidden />
                <span>Save Section</span>
              </SubmitButton>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}