import { getSiteSettings, getAdminSections } from "@/lib/queries";
import { SectionForm } from "@/components/admin/section-form";
import { BrandSettingsForm } from "@/components/admin/brand-settings-form";
import { PageEditor } from "@/components/admin/page-editor";

export default async function AdminPagesBrand() {
  const [settings, sections] = await Promise.all([getSiteSettings(), getAdminSections("shared")]);

  const outline = [
    { id: "section-brand-settings", label: "Global brand & site settings", configured: true },
    { id: "section-newsletter", label: "Footer newsletter band", configured: Boolean(sections.newsletter) },
  ];

  return (
    <PageEditor items={outline}>
      <div className="space-y-10">
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
    </PageEditor>
  );
}