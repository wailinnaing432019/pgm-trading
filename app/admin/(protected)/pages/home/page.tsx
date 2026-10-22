import { getAdminSections, getAdminSupplySteps, getAllStats } from "@/lib/queries";
import { SectionForm } from "@/components/admin/section-form";
import { CollectionSection } from "@/components/admin/collection-section";
import { IconSelect } from "@/components/admin/icon-select";
import { submitStat, deleteStat, submitSupplyStep, deleteSupplyStep } from "@/lib/actions/admin";

export default async function AdminPagesHome() {
  const [sections, steps, stats] = await Promise.all([getAdminSections("home"), getAdminSupplySteps(), getAllStats()]);

  return (
    <div className="max-w-4xl space-y-12">
      {/* 1. Hero & Introduction */}
      <section className="space-y-6">
        <div className="border-b border-sand-200/80 pb-2">
          <h2 className="font-serif text-lg font-semibold text-forest-950">Hero & Statistics</h2>
          <p className="text-xs text-forest-700/70">Top impressions, main banner and key animated business metrics</p>
        </div>

        <div className="grid gap-6">
          <SectionForm
            label="Hero Banner"
            description="Headline, sub-headline and optional cover image at the very top of the homepage."
            page="home"
            sectionKey="hero"
            fields={["title", "subtitle", "image"]}
            section={sections.hero ?? null}
          />

          <CollectionSection
            title="Animated Statistics"
            description="The counting numbers in the dark band directly below the hero banner."
            items={stats}
            saveAction={submitStat}
            deleteAction={deleteStat}
            addLabel="Add stat"
            renderItem={(item) => (
              <div className="grid gap-4 sm:grid-cols-[1fr_140px_120px]">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-forest-900">Label</label>
                  <input name="label" defaultValue={item?.label ?? ""} placeholder="Tons Exported" className="input-admin" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-forest-900">Value (Number)</label>
                  <input name="value" type="number" defaultValue={item?.value ?? ""} className="input-admin" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-forest-900">Suffix</label>
                  <input name="suffix" defaultValue={item?.suffix ?? "+"} placeholder="+, k MT" className="input-admin" />
                </div>
              </div>
            )}
          />
        </div>
      </section>

      {/* 2. Company Story & Managing Director Quote */}
      <section className="space-y-6">
        <div className="border-b border-sand-200/80 pb-2">
          <h2 className="font-serif text-lg font-semibold text-forest-950">Company Story & Quote</h2>
          <p className="text-xs text-forest-700/70">Short company mission narrative plus leadership statement</p>
        </div>

        <div className="grid gap-6">
          <SectionForm
            label="Story Band"
            description="Company story overview text with optional featured cover image."
            page="home"
            sectionKey="story"
            fields={["title", "body", "image"]}
            section={sections.story ?? null}
          />

          <SectionForm
            label="Leadership Quote"
            description="Quote text (headline) and attribution / title (sub-headline)."
            page="home"
            sectionKey="storyQuote"
            fields={["title", "subtitle"]}
            section={sections.storyQuote ?? null}
          />
        </div>
      </section>

      {/* 3. Catalog & Solutions Intros */}
      <section className="space-y-6">
        <div className="border-b border-sand-200/80 pb-2">
          <h2 className="font-serif text-lg font-semibold text-forest-950">Services & Product Band Headings</h2>
          <p className="text-xs text-forest-700/70">Introductory headers for the dynamic service cards and featured catalog grid</p>
        </div>

        <div className="grid gap-6">
          <SectionForm
            label="Services Band Heading"
            description="Heading and intro text introducing the services grid on the homepage."
            page="home"
            sectionKey="servicesHeading"
            fields={["title", "subtitle", "body"]}
            section={sections.servicesHeading ?? null}
          />

          <SectionForm
            label="Featured Products Heading"
            description="Heading and intro text introducing the featured export catalog items."
            page="home"
            sectionKey="productHeading"
            fields={["title", "subtitle", "body"]}
            section={sections.productHeading ?? null}
          />
        </div>
      </section>

      {/* 4. Supply Chain Band & Steps */}
      <section className="space-y-6">
        <div className="border-b border-sand-200/80 pb-2">
          <h2 className="font-serif text-lg font-semibold text-forest-950">Supply Chain & Operations</h2>
          <p className="text-xs text-forest-700/70">The dark band highlighting the four end-to-end supply chain steps</p>
        </div>

        <div className="grid gap-6">
          <SectionForm
            label="Supply Chain Heading"
            description="Title, subtitle and overview for the supply chain process."
            page="home"
            sectionKey="supplyChain"
            fields={["title", "subtitle", "body"]}
            section={sections.supplyChain ?? null}
          />

          <CollectionSection
            title="Supply Chain Steps"
            description="The four structured steps shown in the dark supply-chain band (Home & Services pages)."
            items={steps}
            saveAction={submitSupplyStep}
            deleteAction={deleteSupplyStep}
            addLabel="Add step"
            renderItem={(item) => (
              <>
                <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-forest-900">Step Title</label>
                    <input name="title" defaultValue={item?.title ?? ""} placeholder="e.g. Sourcing & Origin Inspection" className="input-admin" />
                  </div>
                  <IconSelect value={item?.icon ?? null} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-forest-900">Description</label>
                  <textarea name="description" rows={3} defaultValue={item?.description ?? ""} placeholder="Details about this supply chain phase…" className="input-admin" />
                </div>
              </>
            )}
          />
        </div>
      </section>

      {/* 5. News & Conversion CTA */}
      <section className="space-y-6">
        <div className="border-b border-sand-200/80 pb-2">
          <h2 className="font-serif text-lg font-semibold text-forest-950">News & Final Call-To-Action</h2>
          <p className="text-xs text-forest-700/70">News band heading and the bottom conversion band</p>
        </div>

        <div className="grid gap-6">
          <SectionForm
            label="News Band Heading"
            description="Heading and description shown above the latest articles and market insights."
            page="home"
            sectionKey="newsHeading"
            fields={["title", "subtitle", "body"]}
            section={sections.newsHeading ?? null}
          />

          <SectionForm
            label="Call-To-Action (CTA) Band"
            description="The prominent invitation at the bottom of the page encouraging trade inquiries."
            page="home"
            sectionKey="cta"
            fields={["title", "subtitle"]}
            section={sections.cta ?? null}
          />
        </div>
      </section>
    </div>
  );
}