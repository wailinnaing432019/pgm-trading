"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  CheckCircle2,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Type,
  FileText,
  Settings2,
} from "lucide-react";
import type { PageSection } from "@prisma/client";
import { submitPageSection } from "@/lib/actions/admin";
import { ImageUploader } from "@/components/ui/image-uploader";
import { SubmitButton } from "@/components/admin/submit-button";
import { usePageEditor } from "@/components/admin/page-editor";
import { cn } from "@/lib/utils";

export type SectionField = "title" | "subtitle" | "body" | "image";

type FieldCopy = { label: string; placeholder: string; hint: string };

type Props = {
  label: string;
  description?: string;
  page: string;
  sectionKey: string;
  fields: SectionField[];
  section: PageSection | null;
};

const genericFieldCopy: Record<Exclude<SectionField, "image">, FieldCopy> = {
  title: {
    label: "Headline / Title",
    placeholder: "Enter main headline…",
    hint: "Main heading displayed prominently in this block",
  },
  subtitle: {
    label: "Eyebrow / Sub-headline",
    placeholder: "e.g. WHAT WE DO or supporting subtitle…",
    hint: "Appears above or just below the headline as context",
  },
  body: {
    label: "Body Text / Description",
    placeholder: "Write descriptive copy for this section…",
    hint: "Rich informative paragraph for visitors",
  },
};

function headingCopy(title: string, eyebrow: string, body: string): Partial<Record<Exclude<SectionField, "image">, FieldCopy>> {
  return {
    title: { label: title, placeholder: "Write the section heading…", hint: "Shown as the section title; keep it short." },
    subtitle: { label: eyebrow, placeholder: "e.g. WHAT WE DO", hint: "Small uppercase label above the heading (optional)." },
    body: { label: body, placeholder: "One or two sentences introducing this block…", hint: "Shown under the heading; 1–2 sentences works best." },
  };
}

/**
 * Copy that fits what each block actually is on the public site, instead of
 * repeating "Title / Subtitle / Body" everywhere.
 */
const sectionFieldCopy: Record<
  string,
  Partial<Record<Exclude<SectionField, "image">, FieldCopy>>
> = {
  hero: {
    title: {
      label: "Main headline",
      placeholder: "e.g. From Myanmar Fields to Global Markets",
      hint: "Large display heading — aim for under 60 characters so it doesn't wrap awkwardly.",
    },
    subtitle: {
      label: "Eyebrow (small label above)",
      placeholder: "e.g. TRUSTED AGRI-TRADE PARTNER",
      hint: "Short uppercase label shown above the headline.",
    },
    body: {
      label: "Lead paragraph",
      placeholder: "One or two sentences under the headline…",
      hint: "Keep to 1–2 sentences so the hero stays uncluttered.",
    },
  },
  story: {
    title: { label: "Story headline", placeholder: "Headline for the company story…", hint: "Appears beside the story image." },
    body: {
      label: "Story text",
      placeholder: "Write 2–3 short paragraphs about the company…",
      hint: "2–4 sentences display best next to the image.",
    },
  },
  storyQuote: {
    title: { label: "Quote", placeholder: "“The full quote goes here…”", hint: "Quote marks are optional — the layout adds styling." },
    subtitle: { label: "Name & role", placeholder: "e.g. Managing Director, PGM Trading", hint: "Attribution shown below the quote." },
  },
  cta: {
    title: { label: "Call-to-action headline", placeholder: "e.g. Ready to source from Myanmar?", hint: "Big closing headline at the bottom of the page." },
    subtitle: { label: "Supporting line", placeholder: "e.g. Talk to our export desk today.", hint: "Short line under the headline, above the buttons." },
  },
  mission: {
    title: { label: "Mission headline", placeholder: "e.g. Our Mission", hint: "Short heading above the mission statement." },
    body: { label: "Mission statement", placeholder: "State the company's core purpose…", hint: "1–3 sentences; shown as body copy." },
  },
  vision: {
    title: { label: "Vision headline", placeholder: "e.g. Our Vision", hint: "Short heading above the vision statement." },
    body: { label: "Vision statement", placeholder: "Describe the long-term ambition…", hint: "1–3 sentences; shown as body copy." },
  },
  servicesHeading: headingCopy("Services heading", "Eyebrow", "Services intro"),
  productHeading: headingCopy("Products heading", "Eyebrow", "Products intro"),
  newsHeading: headingCopy("News heading", "Eyebrow", "News intro"),
  milestonesHeading: headingCopy("Timeline heading", "Eyebrow", "Timeline intro"),
  certificationsHeading: headingCopy("Certifications heading", "Eyebrow", "Certifications intro"),
  capabilitiesHeading: headingCopy("Capabilities heading", "Eyebrow", "Capabilities intro"),
  supplyChain: headingCopy("Supply chain heading", "Eyebrow", "Supply chain overview"),
  quote: {
    title: { label: "Quote", placeholder: "“The highlighted quote…”", hint: "Displayed as the large quote in the grey band." },
    subtitle: { label: "Attribution", placeholder: "e.g. Partner, Yangon", hint: "Name or role shown under the quote." },
  },
  newsletter: {
    title: { label: "Newsletter heading", placeholder: "e.g. Market updates in your inbox", hint: "Shown above the email field in the footer." },
    body: { label: "Supporting copy", placeholder: "One short sentence about the newsletter…", hint: "Keep it brief — space is limited in the footer." },
  },
};

const imageCopy: Record<string, { label: string; hint: string }> = {
  hero: {
    label: "Hero background image",
    hint: "Full-width banner. Landscape JPG or WebP, at least 1600×900 px.",
  },
  story: {
    label: "Story image",
    hint: "Shown beside the story text. Landscape JPG or WebP, at least 1200×900 px.",
  },
};

export function SectionForm({
  label,
  description,
  page,
  sectionKey,
  fields,
  section,
}: Props) {
  const editor = usePageEditor();
  const [localOpen, setLocalOpen] = useState(false);

  const [titleValue, setTitleValue] = useState(section?.title ?? "");
  const [subtitleValue, setSubtitleValue] = useState(section?.subtitle ?? "");
  const [bodyValue, setBodyValue] = useState(section?.body ?? "");

  const isOpen = editor ? editor.openKey === sectionKey : localOpen;

  const resetValues = () => {
    setTitleValue(section?.title ?? "");
    setSubtitleValue(section?.subtitle ?? "");
    setBodyValue(section?.body ?? "");
  };

  const closeSection = () => {
    if (dirty && !window.confirm("Discard unsaved changes in this section?")) return;
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

  const isConfigured = Boolean(
    (fields.includes("title") && section?.title) ||
    (fields.includes("body") && section?.body) ||
    (fields.includes("image") && section?.image) ||
    (fields.includes("subtitle") && section?.subtitle)
  );

  const dirty =
    (fields.includes("title") && titleValue.trim() !== (section?.title ?? "").trim()) ||
    (fields.includes("subtitle") && subtitleValue.trim() !== (section?.subtitle ?? "").trim()) ||
    (fields.includes("body") && bodyValue.trim() !== (section?.body ?? "").trim());

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  return (
    <div
      id={`section-${sectionKey}`}
      data-section-key={sectionKey}
      data-section-label={label}
      className={cn(
        "card-surface scroll-mt-24 border border-sand-200/80 transition-all duration-200",
        isOpen ? "ring-1 ring-forest-600/10 shadow-card" : "hover:border-forest-300"
      )}
    >
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={`section-${sectionKey}-panel`}
        className={cn(
          "flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-forest-50/40 sm:p-5",
          isOpen && "rounded-t-2xl"
        )}
      >
        <div className="flex min-w-0 items-center gap-3.5">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
              isConfigured ? "bg-forest-100 text-forest-700" : "bg-sand-100 text-forest-800/60"
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
                  Using default
                </span>
              )}
              {dirty ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-semibold text-gold-800">
                  Unsaved
                </span>
              ) : null}
            </div>
            {description ? (
              <p className="mt-0.5 line-clamp-1 text-xs text-forest-700/70 sm:text-sm">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <span className="flex shrink-0 items-center gap-2">
          {!isOpen && section?.title ? (
            <span className="hidden max-w-[200px] truncate text-xs text-forest-700/60 xl:inline-block">
              “{section.title}”
            </span>
          ) : null}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-forest-700/60 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
            aria-hidden
          />
        </span>
      </button>

      {isOpen && (
        <form
          id={`section-${sectionKey}-panel`}
          action={submitPageSection}
          className="border-t border-sand-200/80 p-4 pt-5 sm:p-6"
        >
          <input type="hidden" name="id" value={section?.id ?? ""} />
          <input type="hidden" name="page" value={page} />
          <input type="hidden" name="key" value={sectionKey} />
          <input type="hidden" name="position" value={String(section?.position ?? 0)} />
          <input type="hidden" name="isActive" value={section?.isActive === false ? "" : "on"} />
          <input type="hidden" name="meta" value={JSON.stringify(section?.meta ?? {})} />

          <div className="grid gap-5">
            {fields.map((field) => {
              if (field === "image") {
                const copy = imageCopy[sectionKey] ?? {
                  label: "Cover / banner image (optional)",
                  hint: "Landscape JPG or WebP, at least 1600×900 px.",
                };
                return (
                  <div key={field} className="rounded-xl border border-sand-200/60 bg-sand-50/50 p-4">
                    <ImageUploader
                      name="image"
                      label={copy.label}
                      initial={section?.image ? [section.image] : []}
                    />
                    <p className="mt-2 text-xs text-forest-700/60">{copy.hint}</p>
                  </div>
                );
              }

              const config = sectionFieldCopy[sectionKey]?.[field] ?? genericFieldCopy[field];

              if (field === "body") {
                return (
                  <div key={field} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <label className="flex items-center gap-1.5 text-sm font-medium text-forest-900">
                        <FileText className="h-4 w-4 text-forest-600" aria-hidden />
                        {config.label}
                      </label>
                      <span className="shrink-0 text-xs tabular-nums text-forest-700/50">
                        {bodyValue.length} characters
                      </span>
                    </div>
                    <textarea
                      name="body"
                      rows={5}
                      value={bodyValue}
                      onChange={(event) => setBodyValue(event.target.value)}
                      placeholder={config.placeholder}
                      className="input-admin resize-y"
                    />
                    <p className="text-xs text-forest-700/60">{config.hint}</p>
                  </div>
                );
              }

              return (
                <div key={field} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-forest-900">
                      <Type className="h-4 w-4 text-forest-600" aria-hidden />
                      {config.label}
                    </label>
                    <span className="shrink-0 text-xs tabular-nums text-forest-700/50">
                      {field === "title" ? titleValue.length : subtitleValue.length} characters
                    </span>
                  </div>
                  <input
                    name={field}
                    value={field === "title" ? titleValue : subtitleValue}
                    onChange={(event) => {
                      if (field === "title") setTitleValue(event.target.value);
                      else setSubtitleValue(event.target.value);
                    }}
                    placeholder={config.placeholder}
                    className="input-admin"
                  />
                  <p className="text-xs text-forest-700/60">{config.hint}</p>
                </div>
              );
            })}
          </div>

          <div className="sticky bottom-0 z-10 -mx-4 -mb-4 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-sand-200/80 bg-cream/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:-mb-6 sm:px-6">
            <span className="text-xs text-forest-700/60">
              {dirty ? "You have unsaved changes." : "Changes update immediately on the public website."}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeSection}
                className="inline-flex h-9 items-center rounded-full px-4 text-xs font-semibold text-forest-700/70 transition-colors hover:bg-sand-100 hover:text-forest-900"
              >
                Close
              </button>
              <SubmitButton variant="primary" size="sm" pendingText="Saving section…">
                <Settings2 className="h-4 w-4 shrink-0" aria-hidden />
                <span>Save section</span>
              </SubmitButton>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
