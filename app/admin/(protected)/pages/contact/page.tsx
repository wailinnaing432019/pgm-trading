import { getAdminSections, getAdminOffices, getSiteSettings } from "@/lib/queries";
import { SectionForm } from "@/components/admin/section-form";
import { CollectionSection } from "@/components/admin/collection-section";
import { submitOffice, deleteOffice } from "@/lib/actions/admin";
import { TrustComplianceForm } from "@/components/admin/trust-compliance-form";

export default async function AdminPagesContact() {
  const [sections, offices, settings] = await Promise.all([
    getAdminSections("contact"),
    getAdminOffices(),
    getSiteSettings(),
  ]);

  return (
    <div className="max-w-4xl space-y-12">
      {/* 1. Hero & Inquiries Header */}
      <section className="space-y-6">
        <div className="border-b border-sand-200/80 pb-2">
          <h2 className="font-serif text-lg font-semibold text-forest-950">Hero Banner & Heading</h2>
          <p className="text-xs text-forest-700/70">Contact page cover image, headline and invitation copy</p>
        </div>

        <SectionForm
          label="Hero Banner"
          description="Main cover banner and invitation paragraph at the top of the Contact page."
          page="contact"
          sectionKey="hero"
          fields={["title", "subtitle", "body", "image"]}
          section={sections.hero ?? null}
        />
      </section>

      {/* 2. Physical Offices & Branches */}
      <section className="space-y-6">
        <div className="border-b border-sand-200/80 pb-2">
          <h2 className="font-serif text-lg font-semibold text-forest-950">Offices & Branch Network</h2>
          <p className="text-xs text-forest-700/70">
            Headquarters and regional branch offices shown on the Contact page and in the global footer.
          </p>
        </div>

        <CollectionSection
          title="Offices & Branches"
          description="Listed on the Contact page and in the footer. Note: The first entry (#1) is automatically displayed as the Head Office."
          items={offices}
          saveAction={submitOffice}
          deleteAction={deleteOffice}
          addLabel="Add office branch"
          renderItem={(item) => (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-forest-900">Branch Name</label>
                  <input name="name" defaultValue={item?.name ?? ""} placeholder="e.g. Head Office — Yangon or Branch — Mandalay" className="input-admin" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-forest-900">Direct Phone</label>
                  <input name="phone" defaultValue={item?.phone ?? ""} placeholder="+95 1 234 5678" className="input-admin" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-forest-900">Physical Address</label>
                <textarea name="address" rows={2} defaultValue={item?.address ?? ""} placeholder="Street, township, city and state/division…" className="input-admin" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-forest-900">Email (optional)</label>
                  <input name="email" type="email" defaultValue={item?.email ?? ""} placeholder="branch@pgm-trading.com" className="input-admin" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-forest-900">WhatsApp / Viber (optional)</label>
                  <input name="whatsapp" defaultValue={item?.whatsapp ?? ""} placeholder="+959 123 456 789" className="input-admin" />
                </div>
              </div>
            </>
          )}
        />
      </section>

      {/* 3. Trust & Compliance Credentials */}
      <section className="space-y-6">
        <div className="border-b border-sand-200/80 pb-2">
          <h2 className="font-serif text-lg font-semibold text-forest-950">Trust & Compliance Credentials</h2>
          <p className="text-xs text-forest-700/70">
            Customize the heading, description, and individual accreditation cards displayed at the bottom of the Contact page.
          </p>
        </div>

        <TrustComplianceForm
          section={sections.trust ?? null}
          defaultRegNumber={settings.regNumber}
          defaultExportLicense={settings.exportLicense}
        />
      </section>
    </div>
  );
}