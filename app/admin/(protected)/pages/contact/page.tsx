import { MapPin, PhoneCall, ShieldCheck } from "lucide-react";
import { getAdminOffices, getAdminSections, getSiteSettings } from "@/lib/queries";
import { SectionForm } from "@/components/admin/section-form";
import { CollectionSection } from "@/components/admin/collection-section";
import { saveOffice, deleteOffice } from "@/lib/actions/admin";
import { TrustComplianceForm } from "@/components/admin/trust-compliance-form";
import { PageEditor } from "@/components/admin/page-editor";
import { PageGroup } from "@/components/admin/page-group";

export default async function AdminPagesContact() {
  const [sections, offices, settings] = await Promise.all([
    getAdminSections("contact"),
    getAdminOffices(),
    getSiteSettings(),
  ]);

  const outline = [
    { id: "section-hero", label: "Top banner", configured: Boolean(sections.hero) },
    {
      id: "collection-offices-branches",
      label: "Offices & branches",
      configured: offices.length > 0,
      count: offices.length,
    },
    {
      id: "section-trust",
      label: "Trade credentials",
      configured: Boolean(sections.trust),
    },
  ];

  return (
    <PageEditor items={outline}>
      <div className="space-y-10">
        {/* 1. Top Banner */}
        <PageGroup
          step={1}
          title="Contact Page Welcome Banner"
          description="Headline and invitation copy shown above your offices and inquiry form."
          icon={<PhoneCall className="h-5 w-5" aria-hidden />}
          badge="Top of Contact Page"
        >
          <SectionForm
            label="Top Hero Banner"
            description="Main cover banner and response-time promise at the top of the Contact page."
            page="contact"
            sectionKey="hero"
            fields={["title", "subtitle", "body", "image"]}
            section={sections.hero ?? null}
          />
        </PageGroup>

        {/* 2. Physical Offices & Branches */}
        <PageGroup
          step={2}
          title="Offices & Branch Locations"
          description="Addresses, phones, and messaging numbers shown on the Contact page and site footer."
          icon={<MapPin className="h-5 w-5" aria-hidden />}
          badge="Contact Page & Footer"
        >
          <CollectionSection
            title="Offices & Branches"
            description="The very first entry (#1) is automatically featured as your Head Office. Use the arrows to move an office up or down."
            items={offices}
            collectionKind="office"
            saveAction={saveOffice}
            deleteAction={deleteOffice}
            addLabel="Add office branch"
            renderItem={(item) => (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-forest-900">
                      Office / Branch Name *
                    </label>
                    <input
                      name="name"
                      required
                      defaultValue={item?.name ?? ""}
                      placeholder="e.g. Head Office — Yangon"
                      className="input-admin"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-forest-900">
                      Direct Phone
                    </label>
                    <input
                      name="phone"
                      defaultValue={item?.phone ?? ""}
                      placeholder="+95 1 234 5678"
                      className="input-admin"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-forest-900">
                    Street Address *
                  </label>
                  <textarea
                    name="address"
                    required
                    rows={2}
                    defaultValue={item?.address ?? ""}
                    placeholder="Street, township, city and region…"
                    className="input-admin"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-forest-900">
                      Branch Email (optional)
                    </label>
                    <input
                      name="email"
                      type="email"
                      defaultValue={item?.email ?? ""}
                      placeholder="branch@pgm-trading.com"
                      className="input-admin"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-forest-900">
                      WhatsApp / Viber (optional)
                    </label>
                    <input
                      name="whatsapp"
                      defaultValue={item?.whatsapp ?? ""}
                      placeholder="+959 123 456 789"
                      className="input-admin"
                    />
                  </div>
                </div>
              </>
            )}
          />
        </PageGroup>

        {/* 3. Trust & Compliance Credentials */}
        <PageGroup
          step={3}
          title="Official Trade Registrations & Compliance"
          description="Show company registration numbers, export licenses, and trade associations to build buyer confidence."
          icon={<ShieldCheck className="h-5 w-5" aria-hidden />}
          badge="Bottom of Contact & About"
        >
          <TrustComplianceForm
            section={sections.trust ?? null}
            defaultRegNumber={settings.regNumber}
            defaultExportLicense={settings.exportLicense}
          />
        </PageGroup>
      </div>
    </PageEditor>
  );
}
