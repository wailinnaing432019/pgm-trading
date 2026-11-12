import { Briefcase, CheckSquare, LayoutTemplate } from "lucide-react";
import { getAdminChecklist, getAdminSections, getAdminServices } from "@/lib/queries";
import { SectionForm } from "@/components/admin/section-form";
import { CollectionSection } from "@/components/admin/collection-section";
import { IconSelect } from "@/components/admin/icon-select";
import {
  saveService,
  deleteService,
  saveChecklistItem,
  deleteChecklistItem,
} from "@/lib/actions/admin";
import { PageEditor } from "@/components/admin/page-editor";
import { PageGroup } from "@/components/admin/page-group";

export default async function AdminPagesServices() {
  const [sections, services, capabilities] = await Promise.all([
    getAdminSections("services"),
    getAdminServices(),
    getAdminChecklist("capabilities"),
  ]);

  const outline = [
    { id: "section-hero", label: "Top banner", configured: Boolean(sections.hero) },
    {
      id: "section-servicesHeading",
      label: "Services heading",
      configured: Boolean(sections.servicesHeading),
    },
    {
      id: "collection-services-catalog",
      label: "Service cards",
      configured: services.length > 0,
      count: services.length,
    },
    {
      id: "section-capabilitiesHeading",
      label: "Capabilities heading",
      configured: Boolean(sections.capabilitiesHeading),
    },
    {
      id: "collection-capabilities-checklist",
      label: "Capabilities checklist",
      configured: capabilities.length > 0,
      count: capabilities.length,
    },
    { id: "section-quote", label: "Logistics quote", configured: Boolean(sections.quote) },
  ];

  return (
    <PageEditor items={outline}>
      <div className="space-y-10">
        {/* 1. Top Banner & Intro */}
        <PageGroup
          step={1}
          title="Page Banner & Services Intro"
          description="The opening dark banner at the top of Services, plus the heading above your service cards."
          icon={<LayoutTemplate className="h-5 w-5" aria-hidden />}
          badge="Top of Services Page"
        >
          <SectionForm
            label="Top Hero Banner"
            description="Cover background photo, main headline, and intro sentence for the Services page."
            page="services"
            sectionKey="hero"
            fields={["title", "subtitle", "body", "image"]}
            section={sections.hero ?? null}
          />

          <SectionForm
            label="Services Section Heading"
            description="Heading shown above your service cards on the Services page (Homepage uses Home Page -> Services Section Heading)."
            page="services"
            sectionKey="servicesHeading"
            fields={["title", "subtitle", "body"]}
            section={sections.servicesHeading ?? null}
          />
        </PageGroup>

        {/* 2. Service Offerings */}
        <PageGroup
          step={2}
          title="Service Offerings"
          description="The core services you provide to farmers and international buyers."
          icon={<Briefcase className="h-5 w-5" aria-hidden />}
          badge="Home & Services Pages"
        >
          <CollectionSection
            title="Services Catalog"
            description="Each card below appears on both the Home and Services pages. Use the arrows to change their display order."
            items={services}
            collectionKind="service"
            saveAction={saveService}
            deleteAction={deleteService}
            addLabel="Add service"
            renderItem={(item) => (
              <>
                <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-forest-900">
                      Service Title *
                    </label>
                    <input
                      name="title"
                      required
                      defaultValue={item?.title ?? ""}
                      placeholder="e.g. Cold-Chain Distribution"
                      className="input-admin"
                    />
                  </div>
                  <IconSelect name="icon" value={item?.icon ?? null} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-forest-900">
                    Service Description *
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    defaultValue={item?.description ?? ""}
                    placeholder="Explain how this service helps buyers or growers…"
                    className="input-admin"
                  />
                </div>
              </>
            )}
          />
        </PageGroup>

        {/* 3. Shipment Capabilities & Quote */}
        <PageGroup
          step={3}
          title="Shipment Checklist & Highlight Quote"
          description="Show what is included with every order alongside a quote from your logistics team."
          icon={<CheckSquare className="h-5 w-5" aria-hidden />}
          badge="Middle of Services Page"
        >
          <SectionForm
            label="Capabilities Heading"
            description="Title and short intro beside your included shipment checklist."
            page="services"
            sectionKey="capabilitiesHeading"
            fields={["title", "subtitle", "body"]}
            section={sections.capabilitiesHeading ?? null}
          />

          <CollectionSection
            title="Capabilities Checklist"
            description="Displayed as two columns of check-arrow points next to the highlight quote."
            items={capabilities}
            collectionKind="checklistItem"
            saveAction={saveChecklistItem}
            deleteAction={deleteChecklistItem}
            addLabel="Add capability"
            renderItem={(item) => (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-forest-900">
                  Capability Point *
                </label>
                <input
                  name="title"
                  required
                  defaultValue={item?.title ?? ""}
                  placeholder="e.g. Customs brokerage & export documentation"
                  className="input-admin"
                />
                <input type="hidden" name="group" value="capabilities" />
              </div>
            )}
          />

          <SectionForm
            label="Logistics Highlight Quote"
            description="The warm gradient quote box displayed beside the capabilities checklist."
            page="services"
            sectionKey="quote"
            fields={["title", "subtitle"]}
            section={sections.quote ?? null}
          />
        </PageGroup>
      </div>
    </PageEditor>
  );
}
