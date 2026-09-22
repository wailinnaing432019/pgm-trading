import { getAdminSections, getAdminServices, getAdminChecklist } from "@/lib/queries";
import { SectionForm } from "@/components/admin/section-form";
import { CollectionSection } from "@/components/admin/collection-section";
import { IconSelect } from "@/components/admin/icon-select";
import { submitService, submitChecklistItem, deleteChecklistItem, deleteService } from "@/lib/actions/admin";

export default async function AdminPagesServices() {
  const [sections, services, capabilities] = await Promise.all([
    getAdminSections("services"),
    getAdminServices(),
    getAdminChecklist("capabilities"),
  ]);

  return (
    <div className="max-w-4xl">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-forest-950">Services page</h1>
        <p className="mt-1 text-sm text-forest-700/70">
          Edit every block visitors see on the Services page. Changes go live instantly.
        </p>
      </div>

      <div className="mt-8 grid gap-6">
        <SectionForm
          label="Hero banner"
          page="services"
          key="hero"
          fields={["title", "subtitle", "body", "image"]}
          section={sections.hero ?? null}
        />
        <SectionForm
          label="Services heading"
          page="services"
          key="servicesHeading"
          fields={["title", "subtitle", "body"]}
          section={sections.servicesHeading ?? null}
        />
      </div>

      <CollectionSection
        title="Services"
        description="The service cards on both the Home and Services pages. Slug must be unique."
        items={services}
        saveAction={submitService}
        deleteAction={deleteService}
        addLabel="Add service"
        renderItem={(item) => (
          <>
            <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-forest-900">Title</label>
                <input name="title" defaultValue={item?.title ?? ""} className="input-admin" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-forest-900">Slug</label>
                <input name="slug" defaultValue={item?.slug ?? ""} placeholder="my-service" className="input-admin" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-forest-900">Description</label>
                <textarea name="description" rows={3} defaultValue={item?.description ?? ""} className="input-admin" />
              </div>
              <IconSelect value={item?.icon ?? null} />
            </div>
          </>
        )}
      />

      <div className="mt-10 grid gap-6">
        <SectionForm
          label="Capabilities heading"
          page="services"
          key="capabilitiesHeading"
          fields={["title", "subtitle", "body"]}
          section={sections.capabilitiesHeading ?? null}
        />
      </div>

      <CollectionSection
        title="Capabilities checklist"
        description="The check-mark list in the grey band of the Services page."
        items={capabilities}
        saveAction={submitChecklistItem}
        deleteAction={deleteChecklistItem}
        addLabel="Add capability"
        renderItem={(item) => (
          <>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-forest-900">Item</label>
              <input name="title" defaultValue={item?.title ?? ""} placeholder="e.g. Customs brokerage & export documentation" className="input-admin" />
              <input type="hidden" name="group" value="capabilities" />
            </div>
          </>
        )}
      />

      <div className="mt-10 grid gap-6">
        <SectionForm
          label="Quote"
          description="The highlighted quote in the grey band."
          page="services"
          key="quote"
          fields={["title", "subtitle"]}
          section={sections.quote ?? null}
        />
      </div>
    </div>
  );
}