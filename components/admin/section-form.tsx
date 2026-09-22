import { Settings2 } from "lucide-react";
import type { PageSection } from "@prisma/client";
import { submitPageSection } from "@/lib/actions/admin";
import { ImageUploader } from "@/components/ui/image-uploader";

export type SectionField = "title" | "subtitle" | "body" | "image";

type Props = {
  label: string;
  description?: string;
  page: string;
  key: string;
  fields: SectionField[];
  section: PageSection | null;
};

const fieldLabels: Record<Exclude<SectionField, "image">, string> = {
  title: "Headline",
  subtitle: "Eyebrow / sub-headline",
  body: "Body text",
};

export function SectionForm({ label, description, page, key, fields, section }: Props) {
  return (
    <form action={submitPageSection} className="card-surface p-6">
      <input type="hidden" name="id" value={section?.id ?? ""} />
      <input type="hidden" name="page" value={page} />
      <input type="hidden" name="key" value={key} />
      <input type="hidden" name="position" value={String(section?.position ?? 0)} />
      <input type="hidden" name="isActive" value="on" />
      <input type="hidden" name="meta" value="{}" />

      <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-forest-950">
        <Settings2 className="h-5 w-5 text-forest-700" aria-hidden /> {label}
      </h2>
      {description ? <p className="mt-1 text-sm text-forest-700/70">{description}</p> : null}

      <div className="mt-4 grid gap-4">
        {fields.map((field) => {
          if (field === "image") {
            return (
              <ImageUploader
                key={field}
                name="image"
                label="Cover image (optional)"
                initial={section?.image ? [section.image] : []}
              />
            );
          }
          const label = fieldLabels[field];
          if (field === "body") {
            return (
              <div key={field}>
                <label className="mb-1.5 block text-sm font-medium text-forest-900">{label}</label>
                <textarea name="body" rows={4} defaultValue={section?.body ?? ""} className="input-admin" />
              </div>
            );
          }
          return (
            <div key={field}>
              <label className="mb-1.5 block text-sm font-medium text-forest-900">{label}</label>
              <input name={field} defaultValue={section?.[field] ?? ""} className="input-admin" />
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        className="mt-5 inline-flex h-10 items-center rounded-full bg-forest-700 px-5 text-sm font-semibold text-cream transition-colors hover:bg-forest-800"
      >
        Save section
      </button>
    </form>
  );
}