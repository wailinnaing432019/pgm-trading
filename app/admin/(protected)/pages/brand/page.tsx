import { Mail, SlidersHorizontal } from "lucide-react";
import { getSiteSettings, getAdminSections } from "@/lib/queries";
import { SectionForm } from "@/components/admin/section-form";
import { BrandSettingsForm } from "@/components/admin/brand-settings-form";
import { PageEditor } from "@/components/admin/page-editor";
import { PageGroup } from "@/components/admin/page-group";

export default async function AdminPagesBrand() {
  const [settings, sections] = await Promise.all([
    getSiteSettings(),
    getAdminSections("shared"),
  ]);

  const outline = [
    {
      id: "section-brand-settings",
      label: "Brand & contact info",
      configured: true,
    },
    {
      id: "section-newsletter",
      label: "Footer newsletter box",
      configured: Boolean(sections.newsletter),
    },
  ];

  return (
    <PageEditor items={outline}>
      <div className="space-y-10">
        <PageGroup
          step={1}
          title="Company Logo, Identity & Channels"
          description="Update your brand name, logo, email, WhatsApp/Viber/Telegram, and registration numbers across the whole website."
          icon={<SlidersHorizontal className="h-5 w-5" aria-hidden />}
          badge="Used Everywhere"
        >
          <BrandSettingsForm settings={settings} />
        </PageGroup>

        <PageGroup
          step={2}
          title="Footer Newsletter Band"
          description="The signup invitation bar appearing at the bottom of every page."
          icon={<Mail className="h-5 w-5" aria-hidden />}
          badge="Site Footer"
        >
          <SectionForm
            label="Footer Newsletter Invitation"
            description="Heading and short note above the email subscription form."
            page="shared"
            sectionKey="newsletter"
            fields={["title", "body"]}
            section={sections.newsletter ?? null}
          />
        </PageGroup>
      </div>
    </PageEditor>
  );
}
