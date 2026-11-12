import { BookHeart, Boxes, Megaphone, Route, Sparkles } from "lucide-react";
import { getAdminSections, getAdminSupplySteps, getAllStats } from "@/lib/queries";
import { SectionForm } from "@/components/admin/section-form";
import { CollectionSection } from "@/components/admin/collection-section";
import { IconSelect } from "@/components/admin/icon-select";
import { saveStat, deleteStat, saveSupplyStep, deleteSupplyStep } from "@/lib/actions/admin";
import { PageEditor } from "@/components/admin/page-editor";
import { PageGroup } from "@/components/admin/page-group";

export default async function AdminPagesHome() {
  const [sections, steps, stats] = await Promise.all([
    getAdminSections("home"),
    getAdminSupplySteps(),
    getAllStats(),
  ]);

  const outline = [
    { id: "section-hero", label: "Welcome banner", configured: Boolean(sections.hero) },
    {
      id: "collection-key-numbers",
      label: "Key numbers",
      configured: stats.length > 0,
      count: stats.length,
    },
    { id: "section-story", label: "Company story", configured: Boolean(sections.story) },
    { id: "section-storyQuote", label: "Leadership quote", configured: Boolean(sections.storyQuote) },
    {
      id: "section-servicesHeading",
      label: "Services heading",
      configured: Boolean(sections.servicesHeading),
    },
    {
      id: "section-productHeading",
      label: "Products heading",
      configured: Boolean(sections.productHeading),
    },
    {
      id: "section-supplyChain",
      label: "Supply chain heading",
      configured: Boolean(sections.supplyChain),
    },
    {
      id: "collection-supply-chain-steps",
      label: "Supply chain steps",
      configured: steps.length > 0,
      count: steps.length,
    },
    { id: "section-newsHeading", label: "News heading", configured: Boolean(sections.newsHeading) },
    { id: "section-cta", label: "Bottom invitation banner", configured: Boolean(sections.cta) },
  ];

  return (
    <PageEditor items={outline}>
      <div className="space-y-10">
        {/* 1. Welcome Banner & Statistics */}
        <PageGroup
          step={1}
          title="First Impression & Key Numbers"
          description="The very first banner visitors see when opening the site, plus the 4 animated statistics bar."
          icon={<Sparkles className="h-5 w-5" aria-hidden />}
          badge="Top of Homepage"
        >
          <SectionForm
            label="Welcome Hero Banner"
            description="Main welcome headline, short intro sentence, and optional background photo."
            page="home"
            sectionKey="hero"
            fields={["title", "subtitle", "image"]}
            section={sections.hero ?? null}
          />

          <CollectionSection
            title="Key Numbers"
            description="The highlight numbers shown in the dark bar right below the welcome banner (e.g. Tons Exported, Partner Countries)."
            items={stats}
            collectionKind="stat"
            saveAction={saveStat}
            deleteAction={deleteStat}
            addLabel="Add number"
            renderItem={(item) => (
              <div className="grid gap-4 sm:grid-cols-[1fr_140px_120px]">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-forest-900">
                    Label *
                  </label>
                  <input
                    name="label"
                    required
                    defaultValue={item?.label ?? ""}
                    placeholder="e.g. Tons Exported"
                    className="input-admin"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-forest-900">
                    Number *
                  </label>
                  <input
                    name="value"
                    type="number"
                    required
                    min={0}
                    defaultValue={item?.value ?? ""}
                    placeholder="480000"
                    className="input-admin"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-forest-900">
                    Unit / Symbol
                  </label>
                  <input
                    name="suffix"
                    defaultValue={item?.suffix ?? "+"}
                    placeholder="+, k MT"
                    className="input-admin"
                  />
                </div>
              </div>
            )}
          />
        </PageGroup>

        {/* 2. Company Story & Leadership Quote */}
        <PageGroup
          step={2}
          title="Company Story & Leadership Quote"
          description="Share who PGM is alongside a featured quote from leadership."
          icon={<BookHeart className="h-5 w-5" aria-hidden />}
          badge="Middle of Homepage"
        >
          <SectionForm
            label="Our Story Band"
            description="Company background headline, paragraph, and optional quote backdrop photo. Hidden on homepage until saved."
            page="home"
            sectionKey="story"
            fields={["title", "body", "image"]}
            section={sections.story ?? null}
          />

          <SectionForm
            label="Leadership Quote Card"
            description="The dark green quote box displayed beside your company story."
            page="home"
            sectionKey="storyQuote"
            fields={["title", "subtitle"]}
            section={sections.storyQuote ?? null}
          />
        </PageGroup>

        {/* 3. Services & Featured Products Headings */}
        <PageGroup
          step={3}
          title="Services & Products Headings"
          description="Introductory titles shown above your service cards and featured commodity listings."
          icon={<Boxes className="h-5 w-5" aria-hidden />}
          badge="Section Titles"
        >
          <SectionForm
            label="Services Section Heading"
            description="Heading and short intro displayed above your services on the homepage."
            page="home"
            sectionKey="servicesHeading"
            fields={["title", "subtitle", "body"]}
            section={sections.servicesHeading ?? null}
          />

          <SectionForm
            label="Featured Products Heading"
            description="Heading and short intro displayed above featured products on the homepage."
            page="home"
            sectionKey="productHeading"
            fields={["title", "subtitle", "body"]}
            section={sections.productHeading ?? null}
          />
        </PageGroup>

        {/* 4. Supply Chain & Operations */}
        <PageGroup
          step={4}
          title="Supply Chain Process"
          description="The dark section explaining how PGM moves produce from farms to global buyers."
          icon={<Route className="h-5 w-5" aria-hidden />}
          badge="Home & Services Pages"
        >
          <SectionForm
            label="Supply Chain Heading"
            description="Heading and overview above the numbered supply chain steps."
            page="home"
            sectionKey="supplyChain"
            fields={["title", "subtitle", "body"]}
            section={sections.supplyChain ?? null}
          />

          <CollectionSection
            title="Supply Chain Steps"
            description="Shown as numbered cards (01, 02, 03, 04) on both the Home and Services pages. Use the arrows to reorder steps."
            items={steps}
            collectionKind="supplyStep"
            saveAction={saveSupplyStep}
            deleteAction={deleteSupplyStep}
            addLabel="Add step"
            renderItem={(item) => (
              <>
                <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-forest-900">
                      Step Title *
                    </label>
                    <input
                      name="title"
                      required
                      defaultValue={item?.title ?? ""}
                      placeholder="e.g. Sourcing & Origin Inspection"
                      className="input-admin"
                    />
                  </div>
                  <IconSelect name="icon" value={item?.icon ?? null} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-forest-900">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    defaultValue={item?.description ?? ""}
                    placeholder="Briefly explain what happens in this step…"
                    className="input-admin"
                  />
                </div>
              </>
            )}
          />
        </PageGroup>

        {/* 5. News Heading & Bottom Invitation */}
        <PageGroup
          step={5}
          title="News Intro & Contact Invitation"
          description="The latest news heading and the final invitation banner encouraging buyers to contact you."
          icon={<Megaphone className="h-5 w-5" aria-hidden />}
          badge="Bottom of Homepage"
        >
          <SectionForm
            label="Latest News Heading"
            description="Heading and intro shown above the latest 3 articles on the homepage."
            page="home"
            sectionKey="newsHeading"
            fields={["title", "subtitle", "body"]}
            section={sections.newsHeading ?? null}
          />

          <SectionForm
            label="Bottom Invitation Banner"
            description="The dark green call-to-action card with 'Start an Inquiry' and phone buttons (Home & Services)."
            page="home"
            sectionKey="cta"
            fields={["title", "subtitle"]}
            section={sections.cta ?? null}
          />
        </PageGroup>
      </div>
    </PageEditor>
  );
}
