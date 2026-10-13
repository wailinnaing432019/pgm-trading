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
    <div className="max-w-4xl space-y-12">
      {/* 1. Hero & Header */}
      <section className="space-y-6">
        <div className="border-b border-sand-200/80 pb-2">
          <h2 className="font-serif text-lg font-semibold text-forest-950">Hero & Header</h2>
          <p className="text-xs text-forest-700/70">Top banner and introduction for our logistics and trading services</p>
        </div>

        <div className="grid gap-6">
          <SectionForm
            label="Hero Banner"
            description="Cover image, main headline and intro copy at the very top of the Services page."
            page="services"
            sectionKey="hero"
            fields={["title", "subtitle", "body", "image"]}
            section={sections.hero ?? null}
          />

          <SectionForm
            label="Services Grid Heading"
            description="Heading and intro text introducing the services catalog on both Home and Services pages."
            page="services"
            sectionKey="servicesHeading"
            fields={["title", "subtitle", "body"]}
            section={sections.servicesHeading ?? null}
          />
        </div>
      </section>

      {/* 2. Services Catalog */}
      <section className="space-y-6">
        <div className="border-b border-sand-200/80 pb-2">
          <h2 className="font-serif text-lg font-semibold text-forest-950">Service Offerings</h2>
          <p className="text-xs text-forest-700/70">Individual solutions shown across Home and Services pages</p>
        </div>

        <CollectionSection
          title="Services Catalog"
          description="Detailed service cards (Cold Storage, Contract Farming, Export Brokerage, Farm Inputs, etc.)."
          items={services}
          saveAction={submitService}
          deleteAction={deleteService}
          addLabel="Add service"
          renderItem={(item) => (
            <>
              <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-forest-900">Service Title</label>
                  <input name="title" defaultValue={item?.title ?? ""} placeholder="e.g. Cold Chain Storage & Warehousing" className="input-admin" />
                </div>
                <IconSelect value={item?.icon ?? null} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-forest-900">Service Description</label>
                <textarea name="description" rows={3} defaultValue={item?.description ?? ""} placeholder="Comprehensive overview of this service…" className="input-admin" />
              </div>
            </>
          )}
        />
      </section>

      {/* 3. Capabilities & Highlight Quote */}
      <section className="space-y-6">
        <div className="border-b border-sand-200/80 pb-2">
          <h2 className="font-serif text-lg font-semibold text-forest-950">Operational Capabilities & Quote</h2>
          <p className="text-xs text-forest-700/70">Detailed checklist of our supply chain capabilities and featured client quote</p>
        </div>

        <div className="grid gap-6">
          <SectionForm
            label="Capabilities Heading"
            description="Heading copy introducing our operational infrastructure and compliance checklist."
            page="services"
            sectionKey="capabilitiesHeading"
            fields={["title", "subtitle", "body"]}
            section={sections.capabilitiesHeading ?? null}
          />

          <CollectionSection
            title="Capabilities Checklist"
            description="The checkmark points in the grey capabilities band."
            items={capabilities}
            saveAction={submitChecklistItem}
            deleteAction={deleteChecklistItem}
            addLabel="Add capability"
            renderItem={(item) => (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-forest-900">Capability Item</label>
                <input name="title" defaultValue={item?.title ?? ""} placeholder="e.g. Customs brokerage & export documentation" className="input-admin" />
                <input type="hidden" name="group" value="capabilities" />
              </div>
            )}
          />

          <SectionForm
            label="Service Highlight Quote"
            description="The highlighted quote text and attribution in the grey band."
            page="services"
            sectionKey="quote"
            fields={["title", "subtitle"]}
            section={sections.quote ?? null}
          />
        </div>
      </section>
    </div>
  );
}