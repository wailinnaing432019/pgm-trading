"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Layers,
  MapPin,
  Pencil,
  RotateCcw,
  Sparkles,
  Type,
  Wand2,
} from "lucide-react";
import type { PageSection } from "@prisma/client";
import { savePageSection, type AdminActionState } from "@/lib/actions/admin";
import { ImageUploader } from "@/components/ui/image-uploader";
import { SubmitButton } from "@/components/admin/submit-button";
import { usePageEditor } from "@/components/admin/page-editor";
import { useToast } from "@/components/admin/toast";
import { getSectionGuide, type SectionDefaultContent } from "@/lib/section-defaults";
import { cn } from "@/lib/utils";

export type SectionField = "title" | "subtitle" | "body" | "image";

type Props = {
  label: string;
  description?: string;
  page: string;
  sectionKey: string;
  fields: SectionField[];
  section: PageSection | null;
  defaults?: SectionDefaultContent;
};

const initialState: AdminActionState = { ok: false };

function LengthMeter({ length, recommendedMax }: { length: number; recommendedMax: number }) {
  if (recommendedMax <= 0) return null;
  const ratio = length / recommendedMax;
  const pct = Math.min(100, Math.round(ratio * 100));

  const statusText =
    length === 0
      ? `Up to ~${recommendedMax} chars recommended`
      : ratio <= 0.9
        ? "Great length"
        : ratio <= 1.15
          ? "Getting close to limit"
          : "Long — may wrap on phones";

  const barColor =
    length === 0
      ? "bg-sand-300"
      : ratio <= 0.9
        ? "bg-forest-500"
        : ratio <= 1.15
          ? "bg-gold-500"
          : "bg-soil-500";

  const textColor =
    length === 0
      ? "text-forest-700/50"
      : ratio <= 0.9
        ? "text-forest-700/70"
        : ratio <= 1.15
          ? "text-gold-700"
          : "text-soil-700";

  return (
    <div className="flex items-center justify-between gap-3 pt-0.5">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-sand-200/80" aria-hidden>
        <div
          className={cn("h-full rounded-full transition-all duration-300", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn("shrink-0 text-[11px] font-medium tabular-nums", textColor)}>
        {length} chars · {statusText}
      </span>
    </div>
  );
}

function LiveSectionPreview({
  page,
  sectionKey,
  fields,
  title,
  subtitle,
  body,
  image,
  defaults,
  previewTone,
}: {
  page: string;
  sectionKey: string;
  fields: SectionField[];
  title: string;
  subtitle: string;
  body: string;
  image: string;
  defaults: SectionDefaultContent;
  previewTone: "dark" | "cream" | "quote";
}) {
  const effectiveTitle = title.trim() || defaults.title || "Your headline will appear here";
  const effectiveSubtitle = subtitle.trim() || defaults.subtitle || "";
  const effectiveBody = body.trim() || defaults.body || "";

  const isHomeHero = page === "home" && sectionKey === "hero";
  const isQuote = previewTone === "quote";
  const isDark = previewTone === "dark" || isQuote;
  const usingFallbackPreview =
    (fields.includes("title") && !title.trim() && Boolean(defaults.title)) ||
    (fields.includes("subtitle") && !subtitle.trim() && Boolean(defaults.subtitle)) ||
    (fields.includes("body") && !body.trim() && Boolean(defaults.body));

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 sm:p-6 transition-colors",
        isQuote
          ? "border-forest-800 bg-gradient-to-br from-forest-700 via-forest-800 to-forest-950 text-cream"
          : isDark
            ? "border-forest-800 bg-forest-950 text-cream"
            : "border-sand-200 bg-cream text-forest-950"
      )}
    >
      {image ? (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-forest-950/65" />
        </div>
      ) : null}

      <div className="relative space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              isDark ? "bg-cream/10 text-gold-300" : "bg-sand-100 text-forest-700"
            )}
          >
            <Eye className="h-3 w-3" aria-hidden /> Live Visitor Preview
          </span>
          {usingFallbackPreview ? (
            <span
              className={cn(
                "text-[11px]",
                isDark ? "text-cream/60" : "text-forest-700/60"
              )}
            >
              Blank fields show built-in default text
            </span>
          ) : null}
        </div>

        {isQuote ? (
          <div className="pt-1">
            <p className="font-serif text-base leading-relaxed text-cream/95 sm:text-lg">
              “{effectiveTitle}”
            </p>
            {effectiveSubtitle ? (
              <p className="mt-2.5 text-xs font-semibold uppercase tracking-widest text-gold-300">
                — {effectiveSubtitle}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="pt-1">
            {!isHomeHero && fields.includes("subtitle") && effectiveSubtitle ? (
              <p
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-[0.2em]",
                  isDark ? "text-gold-400" : "text-gold-600"
                )}
              >
                {effectiveSubtitle}
              </p>
            ) : null}

            <h3
              className={cn(
                "mt-1 font-serif text-lg font-semibold leading-snug sm:text-xl",
                isDark ? "text-cream" : "text-forest-950"
              )}
            >
              {effectiveTitle}
            </h3>

            {isHomeHero && effectiveSubtitle ? (
              <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-cream/75 sm:text-sm">
                {effectiveSubtitle}
              </p>
            ) : null}

            {fields.includes("body") && effectiveBody ? (
              <p
                className={cn(
                  "mt-1.5 max-w-2xl whitespace-pre-line text-xs leading-relaxed sm:text-sm line-clamp-3",
                  isDark ? "text-cream/75" : "text-forest-800/80"
                )}
              >
                {effectiveBody}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export function SectionForm({
  label,
  description,
  page,
  sectionKey,
  fields,
  section,
  defaults: customDefaults,
}: Props) {
  const editor = usePageEditor();
  const { pushToast } = useToast();
  const guide = getSectionGuide(page, sectionKey);
  const defaults = customDefaults ?? guide.defaults;

  const [localOpen, setLocalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [justSaved, setJustSaved] = useState(false);

  const [baseline, setBaseline] = useState({
    title: section?.title ?? "",
    subtitle: section?.subtitle ?? "",
    body: section?.body ?? "",
    image: section?.image ?? "",
  });

  const [titleValue, setTitleValue] = useState(baseline.title);
  const [subtitleValue, setSubtitleValue] = useState(baseline.subtitle);
  const [bodyValue, setBodyValue] = useState(baseline.body);
  const [imageValue, setImageValue] = useState(baseline.image);
  const [uploaderVersion, setUploaderVersion] = useState(0);

  const [state, formAction] = useActionState<AdminActionState, FormData>(
    async (prev, formData) => {
      const snapshot = {
        title: String(formData.get("title") ?? ""),
        subtitle: String(formData.get("subtitle") ?? ""),
        body: String(formData.get("body") ?? ""),
        image: String(formData.get("image") ?? ""),
      };
      const result = await savePageSection(prev, formData);
      if (result.ok) {
        setBaseline(snapshot);
        setJustSaved(true);
      } else {
        const firstErr =
          result.error ?? Object.values(result.fieldErrors ?? {}).flat().find(Boolean);
        if (firstErr) pushToast("error", firstErr);
      }
      return result;
    },
    initialState
  );

  const handleImageChange = useCallback((urls: string[]) => {
    setImageValue(urls[0] ?? "");
  }, []);

  const isOpen = editor ? editor.openKey === sectionKey : localOpen;

  const isConfigured = Boolean(
    (fields.includes("title") && (baseline.title || section?.title)) ||
      (fields.includes("body") && (baseline.body || section?.body)) ||
      (fields.includes("image") && (baseline.image || section?.image)) ||
      (fields.includes("subtitle") && (baseline.subtitle || section?.subtitle))
  );

  const dirty =
    (fields.includes("title") && titleValue.trim() !== baseline.title.trim()) ||
    (fields.includes("subtitle") && subtitleValue.trim() !== baseline.subtitle.trim()) ||
    (fields.includes("body") && bodyValue.trim() !== baseline.body.trim()) ||
    (fields.includes("image") && imageValue.trim() !== baseline.image.trim());

  const resetValues = () => {
    setTitleValue(baseline.title);
    setSubtitleValue(baseline.subtitle);
    setBodyValue(baseline.body);
    setImageValue(baseline.image);
    setUploaderVersion((v) => v + 1);
  };

  const closeSection = () => {
    if (dirty && !window.confirm("You have unsaved edits in this block. Discard them?")) return;
    resetValues();
    if (editor) editor.toggleSection(sectionKey, `section-${sectionKey}`);
    else setLocalOpen(false);
  };

  const toggle = () => {
    if (isOpen) {
      closeSection();
      return;
    }
    if (editor) editor.toggleSection(sectionKey, `section-${sectionKey}`);
    else setLocalOpen(true);
  };

  const loadDefaults = () => {
    if (fields.includes("title") && defaults.title) setTitleValue(defaults.title);
    if (fields.includes("subtitle") && defaults.subtitle) setSubtitleValue(defaults.subtitle);
    if (fields.includes("body") && defaults.body) setBodyValue(defaults.body);
  };

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // Auto-hide the saved confirmation pulse cleanly.
  useEffect(() => {
    if (!justSaved) return;
    const timer = window.setTimeout(() => setJustSaved(false), 3500);
    return () => window.clearTimeout(timer);
  }, [justSaved]);

  const previewHeadline =
    titleValue.trim() ||
    section?.title ||
    defaults.title ||
    section?.subtitle ||
    defaults.subtitle ||
    "";

  const hasDefaultsToLoad =
    (fields.includes("title") && Boolean(defaults.title) && !titleValue.trim()) ||
    (fields.includes("subtitle") && Boolean(defaults.subtitle) && !subtitleValue.trim()) ||
    (fields.includes("body") && Boolean(defaults.body) && !bodyValue.trim());

  return (
    <div
      id={`section-${sectionKey}`}
      data-section-key={sectionKey}
      data-section-label={label}
      className={cn(
        "card-surface scroll-mt-24 border transition-all duration-200",
        isOpen
          ? "border-forest-500/40 ring-2 ring-forest-600/10 shadow-lift"
          : "border-sand-200/80 hover:border-forest-300 hover:shadow-md"
      )}
    >
      {/* Collapsed / Accordion Card Header */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={`section-${sectionKey}-panel`}
        className={cn(
          "flex w-full items-center justify-between gap-4 p-4 text-left transition-colors sm:p-5",
          isOpen ? "rounded-t-2xl bg-forest-50/40" : "rounded-2xl hover:bg-sand-50/70"
        )}
      >
        <div className="flex min-w-0 flex-1 items-start gap-3.5 sm:items-center">
          <span
            className={cn(
              "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors sm:mt-0",
              isConfigured
                ? "bg-forest-100 text-forest-700"
                : guide.hiddenUntilSaved
                  ? "bg-gold-100 text-gold-700"
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

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-serif text-base font-semibold text-forest-950 sm:text-lg">
                {label}
              </h3>

              {justSaved ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-forest-700 px-2.5 py-0.5 text-xs font-semibold text-cream animate-fade-up">
                  <Check className="h-3 w-3 text-gold-300" aria-hidden /> Saved!
                </span>
              ) : isConfigured ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-forest-100 px-2.5 py-0.5 text-xs font-medium text-forest-800">
                  <CheckCircle2 className="h-3 w-3 text-forest-600" aria-hidden /> Customized
                </span>
              ) : guide.hiddenUntilSaved ? (
                <span className="inline-flex items-center rounded-full bg-gold-100 px-2.5 py-0.5 text-xs font-medium text-gold-800">
                  Hidden until filled
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-sand-100 px-2.5 py-0.5 text-xs font-medium text-forest-700/70">
                  Using website default
                </span>
              )}

              {dirty ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-gold-200 px-2.5 py-0.5 text-[11px] font-semibold text-forest-950">
                  Unsaved edits
                </span>
              ) : null}
            </div>

            {description ? (
              <p className="mt-0.5 line-clamp-1 text-xs text-forest-700/75 sm:text-sm">
                {description}
              </p>
            ) : null}

            {!isOpen && previewHeadline ? (
              <p className="mt-1.5 line-clamp-1 text-xs text-forest-900/65 italic">
                Currently showing: “{previewHeadline}”
              </p>
            ) : null}
          </div>
        </div>

        <span className="flex shrink-0 items-center gap-2.5">
          {!isOpen && (imageValue || section?.image) ? (
            <span className="hidden h-9 w-14 overflow-hidden rounded-lg border border-sand-200 bg-sand-100 sm:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageValue || section?.image || ""}
                alt=""
                className="h-full w-full object-cover"
              />
            </span>
          ) : null}

          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              isOpen
                ? "bg-forest-700 text-cream"
                : "border border-sand-200 bg-white text-forest-800"
            )}
          >
            {!isOpen ? <Pencil className="h-3 w-3" aria-hidden /> : null}
            <span className="hidden sm:inline">{isOpen ? "Editing" : "Edit"}</span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
              aria-hidden
            />
          </span>
        </span>
      </button>

      {/* Expanded Visual Block Editor */}
      {isOpen && (
        <form
          id={`section-${sectionKey}-panel`}
          action={formAction}
          className="border-t border-sand-200/80 p-4 pt-5 sm:p-6"
        >
          <input type="hidden" name="id" value={section?.id ?? ""} />
          <input type="hidden" name="page" value={page} />
          <input type="hidden" name="key" value={sectionKey} />
          <input type="hidden" name="position" value={String(section?.position ?? 0)} />
          <input type="hidden" name="isActive" value={section?.isActive === false ? "" : "on"} />
          <input type="hidden" name="meta" value={JSON.stringify(section?.meta ?? {})} />

          {/* Context & Helpful Actions Bar */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sand-200/80 bg-sand-50/70 px-4 py-3">
            <p className="flex items-center gap-2 text-xs text-forest-800/85">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-gold-600" aria-hidden />
              <span>
                <strong className="font-semibold text-forest-950">Where it appears:</strong>{" "}
                {guide.whereShown}
              </span>
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {hasDefaultsToLoad ? (
                <button
                  type="button"
                  onClick={loadDefaults}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold-300 bg-gold-100/80 px-3 py-1 text-xs font-semibold text-forest-950 transition-colors hover:bg-gold-200"
                >
                  <Wand2 className="h-3 w-3 text-gold-700" aria-hidden />
                  Fill with website default
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-full border border-sand-200 bg-white px-3 py-1 text-xs font-medium text-forest-800 transition-colors hover:bg-forest-50"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="h-3 w-3" aria-hidden /> Hide preview
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3" aria-hidden /> Show preview
                  </>
                )}
              </button>
            </div>
          </div>

          {guide.hiddenUntilSaved && !isConfigured ? (
            <div className="mb-5 rounded-xl border border-gold-300/80 bg-gold-100/50 px-4 py-3 text-xs text-forest-900">
              <strong className="font-semibold">Tip:</strong> This section stays hidden on your live
              homepage until you save a headline or story text below.
            </div>
          ) : null}

          {/* Live Visitor Preview */}
          {showPreview ? (
            <div className="mb-6">
              <LiveSectionPreview
                page={page}
                sectionKey={sectionKey}
                fields={fields}
                title={titleValue}
                subtitle={subtitleValue}
                body={bodyValue}
                image={imageValue}
                defaults={defaults}
                previewTone={guide.previewTone}
              />
            </div>
          ) : null}

          {/* Editor Fields */}
          <div className="grid gap-5">
            {fields.map((field) => {
              if (field === "image") {
                const imgCopy = guide.imageCopy ?? {
                  label: "Cover / banner photo (optional)",
                  hint: "Wide landscape JPG or WebP, at least 1600×900 px.",
                };
                return (
                  <div
                    key={`${field}-${uploaderVersion}`}
                    className="rounded-xl border border-sand-200/80 bg-sand-50/40 p-4"
                  >
                    <ImageUploader
                      name="image"
                      label={imgCopy.label}
                      initial={imageValue ? [imageValue] : []}
                      onChange={handleImageChange}
                    />
                    <p className="mt-2 text-xs text-forest-700/65">{imgCopy.hint}</p>
                    {state.fieldErrors?.image?.[0] ? (
                      <p className="mt-1 text-xs font-medium text-soil-700" role="alert">
                        {state.fieldErrors.image[0]}
                      </p>
                    ) : null}
                  </div>
                );
              }

              const fieldCopy = guide.fields[field] ?? {
                label: field === "title" ? "Main heading" : field === "subtitle" ? "Small tag above heading" : "Description",
                placeholder: "",
                hint: "",
                recommendedMax: field === "body" ? 200 : 65,
              };

              const value =
                field === "title"
                  ? titleValue
                  : field === "subtitle"
                    ? subtitleValue
                    : bodyValue;
              const fieldError = state.fieldErrors?.[field]?.[0];

              if (field === "body" || (page === "home" && sectionKey === "hero" && field === "subtitle")) {
                return (
                  <div key={field} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <label className="flex items-center gap-1.5 text-sm font-semibold text-forest-950">
                        <FileText className="h-4 w-4 text-forest-600" aria-hidden />
                        {fieldCopy.label}
                      </label>
                      {defaults[field] && value !== defaults[field] ? (
                        <button
                          type="button"
                          onClick={() => {
                            const fallback = defaults[field] ?? "";
                            if (field === "subtitle") setSubtitleValue(fallback);
                            else setBodyValue(fallback);
                          }}
                          className="text-xs font-medium text-forest-700 hover:text-forest-950 hover:underline"
                        >
                          Use default text
                        </button>
                      ) : null}
                    </div>
                    <textarea
                      name={field}
                      rows={field === "body" ? 4 : 3}
                      value={value}
                      onChange={(event) => {
                        if (field === "subtitle") setSubtitleValue(event.target.value);
                        else setBodyValue(event.target.value);
                      }}
                      placeholder={fieldCopy.placeholder}
                      className="input-admin resize-y leading-relaxed"
                    />
                    <LengthMeter length={value.length} recommendedMax={fieldCopy.recommendedMax} />
                    {fieldCopy.hint ? (
                      <p className="text-xs text-forest-700/65">{fieldCopy.hint}</p>
                    ) : null}
                    {fieldError ? (
                      <p className="text-xs font-medium text-soil-700" role="alert">
                        {fieldError}
                      </p>
                    ) : null}
                  </div>
                );
              }

              return (
                <div key={field} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-forest-950">
                      <Type className="h-4 w-4 text-forest-600" aria-hidden />
                      {fieldCopy.label}
                    </label>
                    {defaults[field] && value !== defaults[field] ? (
                      <button
                        type="button"
                        onClick={() => {
                          const fallback = defaults[field] ?? "";
                          if (field === "title") setTitleValue(fallback);
                          else setSubtitleValue(fallback);
                        }}
                        className="text-xs font-medium text-forest-700 hover:text-forest-950 hover:underline"
                      >
                        Use default text
                      </button>
                    ) : null}
                  </div>
                  <input
                    name={field}
                    value={value}
                    onChange={(event) => {
                      if (field === "title") setTitleValue(event.target.value);
                      else setSubtitleValue(event.target.value);
                    }}
                    placeholder={fieldCopy.placeholder}
                    className="input-admin"
                  />
                  <LengthMeter length={value.length} recommendedMax={fieldCopy.recommendedMax} />
                  {fieldCopy.hint ? (
                    <p className="text-xs text-forest-700/65">{fieldCopy.hint}</p>
                  ) : null}
                  {fieldError ? (
                    <p className="text-xs font-medium text-soil-700" role="alert">
                      {fieldError}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Sticky Bottom Save Toolbar */}
          <div className="sticky bottom-0 z-10 -mx-4 -mb-4 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-sand-200/80 bg-cream/95 px-4 py-3.5 backdrop-blur sm:-mx-6 sm:-mb-6 sm:px-6">
            <span className="text-xs text-forest-700/75">
              {dirty ? (
                <span className="font-semibold text-gold-700">
                  Unsaved edits — click Save to update your website.
                </span>
              ) : justSaved ? (
                <span className="font-semibold text-forest-700">
                  Saved and live on your website!
                </span>
              ) : (
                "Changes go live immediately after you save."
              )}
            </span>

            <div className="flex items-center gap-2">
              {dirty ? (
                <button
                  type="button"
                  onClick={resetValues}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold text-forest-700/80 transition-colors hover:bg-sand-100 hover:text-forest-950"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                  Undo
                </button>
              ) : null}

              <button
                type="button"
                onClick={closeSection}
                className="inline-flex h-9 items-center rounded-full px-4 text-xs font-semibold text-forest-700/75 transition-colors hover:bg-sand-100 hover:text-forest-950"
              >
                Close
              </button>

              <SubmitButton variant="primary" size="md" pendingText="Saving…">
                <Check className="h-4 w-4 shrink-0" aria-hidden />
                <span>Save changes</span>
              </SubmitButton>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
