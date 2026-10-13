import { getSiteSettings, getAdminSections } from "@/lib/queries";
import { SectionForm } from "@/components/admin/section-form";
import { BrandSettingsForm } from "@/components/admin/brand-settings-form";

export default async function AdminPagesBrand() {
  const [settings, sections] = await Promise.all([getSiteSettings(), getAdminSections("shared")]);

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-forest-950">Brand & Settings</h1>
        <p className="mt-1 text-sm text-forest-700/70">
          Global company identity, contacts, and shared blocks used in the header, footer and SEO across all pages.
        </p>
      </div>

      <BrandSettingsForm settings={settings} />

      <div>
        <h2 className="mb-4 font-serif text-lg font-semibold text-forest-950">
          Shared Page Content
        </h2>
        <SectionForm
          label="Footer Newsletter Band"
          description="Heading and description copy shown above the newsletter subscription form in the global footer."
          page="shared"
          sectionKey="newsletter"
          fields={["title", "body"]}
          section={sections.newsletter ?? null}
        />
      </div>
    </div>
  );
}