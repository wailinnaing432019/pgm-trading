import { getAdminSections, getAdminSupplySteps, getStats } from "@/lib/queries";
import { SectionForm } from "@/components/admin/section-form";
import { CollectionSection } from "@/components/admin/collection-section";
import { IconSelect } from "@/components/admin/icon-select";
import { submitStat, deleteStat, submitSupplyStep, deleteSupplyStep } from "@/lib/actions/admin";

export default async function AdminPagesHome() {
  const [sections, steps, stats] = await Promise.all([getAdminSections("home"), getAdminSupplySteps(), getStats()]);

  return (
    <div className="max-w-4xl">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-forest-950">Home page</h1>
        <p className="mt-1 text-sm text-forest-700/70">
          Edit every block visitors see on the homepage. Changes go live instantly.
        </p>
      </div>

      <div className="mt-8 grid gap-6">
        <SectionForm
          label="Hero banner"
          description="Headline, sub-headline and optional cover image at the very top."
          page="home"
          key="hero"
          fields={["title", "subtitle", "image"]}
          section={sections.hero ?? null}
        />
        <SectionForm
          label="Story band"
          description="Short company story plus the Managing Director quote."
          page="home"
          key="story"
          fields={["title", "body", "image"]}
          section={sections.story ?? null}
        />
        <SectionForm
          label="Story quote"
          description="Quote text (headline) and attribution (sub-headline)."
          page="home"
          key="storyQuote"
          fields={["title", "subtitle"]}
          section={sections.storyQuote ?? null}
        />

        <SectionForm
          label="Services band heading"
          page="home"
          key="servicesHeading"
          fields={["title", "subtitle", "body"]}
          section={sections.servicesHeading ?? null}
        />
        <SectionForm
          label="Featured products heading"
          page="home"
          key="productHeading"
          fields={["title", "subtitle", "body"]}
          section={sections.productHeading ?? null}
        />
        <SectionForm
          label="Supply chain heading"
          page="home"
          key="supplyChain"
          fields={["title", "subtitle", "body"]}
          section={sections.supplyChain ?? null}
        />
      </div>

      <CollectionSection
        title="Supply chain steps"
        description="The four steps shown in the dark supply-chain band (Home & Services pages)."
        items={steps}
        saveAction={submitSupplyStep}
        deleteAction={deleteSupplyStep}
        addLabel="Add step"
        renderItem={(item) => (
          <>
            <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-forest-900">Title</label>
                <input name="title" defaultValue={item?.title ?? ""} className="input-admin" />
              </div>
              <IconSelect value={item?.icon ?? null} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-forest-900">Description</label>
              <textarea name="description" rows={3} defaultValue={item?.description ?? ""} className="input-admin" />
            </div>
          </>
        )}
      />

      <div className="mt-10 grid gap-6">
        <SectionForm
          label="News band heading"
          page="home"
          key="newsHeading"
          fields={["title", "subtitle", "body"]}
          section={sections.newsHeading ?? null}
        />
        <SectionForm
          label="Call-to-action band"
          page="home"
          key="cta"
          fields={["title", "subtitle"]}
          section={sections.cta ?? null}
        />
      </div>

      <CollectionSection
        title="Animated statistics"
        description="The counting numbers in the dark band near the top of the homepage."
        items={stats}
        saveAction={submitStat}
        deleteAction={deleteStat}
        addLabel="Add stat"
        renderItem={(item) => (
          <>
            <div className="grid gap-4 sm:grid-cols-[1fr_140px_120px]">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-forest-900">Label</label>
                <input name="label" defaultValue={item?.label ?? ""} placeholder="Tons Exported" className="input-admin" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-forest-900">Value</label>
                <input name="value" type="number" defaultValue={item?.value ?? ""} className="input-admin" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-forest-900">Suffix</label>
                <input name="suffix" defaultValue={item?.suffix ?? "+"} placeholder="+, k MT" className="input-admin" />
              </div>
            </div>
          </>
        )}
      />
    </div>
  );
}