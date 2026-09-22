import { getAdminSections, getAdminOffices } from "@/lib/queries";
import { SectionForm } from "@/components/admin/section-form";
import { CollectionSection } from "@/components/admin/collection-section";
import { submitOffice, deleteOffice } from "@/lib/actions/admin";

export default async function AdminPagesContact() {
  const [sections, offices] = await Promise.all([getAdminSections("contact"), getAdminOffices()]);

  return (
    <div className="max-w-4xl">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-forest-950">Contact page</h1>
        <p className="mt-1 text-sm text-forest-700/70">
          Edit the contact page hero and your offices / branches. Changes go live instantly.
        </p>
      </div>

      <div className="mt-8 grid gap-6">
        <SectionForm
          label="Hero banner"
          page="contact"
          key="hero"
          fields={["title", "subtitle", "body", "image"]}
          section={sections.hero ?? null}
        />
      </div>

      <CollectionSection
        title="Offices & branches"
        description="Listed on the Contact page and in the footer. The first entry is treated as the head office."
        items={offices}
        saveAction={submitOffice}
        deleteAction={deleteOffice}
        addLabel="Add office"
        renderItem={(item) => (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-forest-900">Name</label>
                <input name="name" defaultValue={item?.name ?? ""} placeholder="Branch — Mandalay" className="input-admin" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-forest-900">Phone</label>
                <input name="phone" defaultValue={item?.phone ?? ""} placeholder="+95 1 234 5678" className="input-admin" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-forest-900">Address</label>
              <textarea name="address" rows={2} defaultValue={item?.address ?? ""} className="input-admin" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-forest-900">Email (optional)</label>
                <input name="email" type="email" defaultValue={item?.email ?? ""} className="input-admin" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-forest-900">WhatsApp (optional)</label>
                <input name="whatsapp" defaultValue={item?.whatsapp ?? ""} className="input-admin" />
              </div>
            </div>
          </>
        )}
      />
    </div>
  );
}