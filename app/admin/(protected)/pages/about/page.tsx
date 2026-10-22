import { getAdminSections, getAdminValues, getAdminMilestones, getAdminChecklist } from "@/lib/queries";
import { SectionForm } from "@/components/admin/section-form";
import { CollectionSection } from "@/components/admin/collection-section";
import { IconSelect } from "@/components/admin/icon-select";
import {
  submitValue,
  deleteValue,
  submitMilestone,
  deleteMilestone,
  submitChecklistItem,
  deleteChecklistItem,
} from "@/lib/actions/admin";
import { PageEditor } from "@/components/admin/page-editor";

export default async function AdminPagesAbout() {
  const [sections, values, milestones, certifications] = await Promise.all([
    getAdminSections("about"),
    getAdminValues(),
    getAdminMilestones(),
    getAdminChecklist("certifications"),
  ]);

  const outline = [
    { id: "section-hero", label: "Hero banner", configured: Boolean(sections.hero) },
    { id: "section-story", label: "Our story", configured: Boolean(sections.story) },
    { id: "section-mission", label: "Mission statement", configured: Boolean(sections.mission) },
    { id: "section-vision", label: "Long-term vision", configured: Boolean(sections.vision) },
    { id: "collection-core-values", label: "Core values", configured: values.length > 0, count: values.length },
    { id: "section-milestonesHeading", label: "Timeline heading", configured: Boolean(sections.milestonesHeading) },
    { id: "collection-company-milestones", label: "Company milestones", configured: milestones.length > 0, count: milestones.length },
    { id: "section-certificationsHeading", label: "Certifications heading", configured: Boolean(sections.certificationsHeading) },
    { id: "collection-certifications-compliance-badges", label: "Certifications & badges", configured: certifications.length > 0, count: certifications.length },
  ];

  return (
    <PageEditor items={outline}>
      <div className="space-y-12">
      {/* 1. Hero & Mission Narrative */}
      <section className="space-y-6">
        <div className="border-b border-sand-200/80 pb-2">
          <h2 className="font-serif text-lg font-semibold text-forest-950">Hero & Mission Narrative</h2>
          <p className="text-xs text-forest-700/70">Top impressions, company foundation story, mission and vision</p>
        </div>

        <div className="grid gap-6">
          <SectionForm
            label="Hero Banner"
            description="Cover image, main headline and lead intro paragraph for the About page."
            page="about"
            sectionKey="hero"
            fields={["title", "subtitle", "image"]}
            section={sections.hero ?? null}
          />

          <SectionForm
            label="Our Story"
            description="Background of Pacific Global Myanmar and our commitment to sustainable agriculture."
            page="about"
            sectionKey="story"
            fields={["title", "body", "image"]}
            section={sections.story ?? null}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <SectionForm
              label="Mission Statement"
              description="Core purpose and driving agricultural mandate."
              page="about"
              sectionKey="mission"
              fields={["title", "body"]}
              section={sections.mission ?? null}
            />

            <SectionForm
              label="Long-Term Vision"
              description="Where we are heading in regional trade & cold-chain distribution."
              page="about"
              sectionKey="vision"
              fields={["title", "body"]}
              section={sections.vision ?? null}
            />
          </div>
        </div>
      </section>

      {/* 2. Core Values */}
      <section className="space-y-6">
        <div className="border-b border-sand-200/80 pb-2">
          <h2 className="font-serif text-lg font-semibold text-forest-950">Core Values</h2>
          <p className="text-xs text-forest-700/70">The foundational pillars displayed under &apos;What We Stand Behind&apos;</p>
        </div>

        <CollectionSection
          title="Core Values"
          description="The cards explaining our foundational principles (Integrity, Quality, Farmer Empowerment, etc.)."
          items={values}
          saveAction={submitValue}
          deleteAction={deleteValue}
          addLabel="Add value"
          renderItem={(item) => (
            <>
              <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-forest-900">Value Title</label>
                  <input name="title" defaultValue={item?.title ?? ""} placeholder="e.g. Integrity & Transparency" className="input-admin" />
                </div>
                <IconSelect name="icon" value={item?.icon ?? null} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-forest-900">Description</label>
                <textarea name="description" rows={3} defaultValue={item?.description ?? ""} placeholder="Explanation of this core value…" className="input-admin" />
              </div>
            </>
          )}
        />
      </section>

      {/* 3. Company Journey Timeline */}
      <section className="space-y-6">
        <div className="border-b border-sand-200/80 pb-2">
          <h2 className="font-serif text-lg font-semibold text-forest-950">Company Timeline</h2>
          <p className="text-xs text-forest-700/70">Historical growth steps from founding to present day</p>
        </div>

        <div className="grid gap-6">
          <SectionForm
            label="Milestones Heading"
            description="Heading and intro text for the historical journey timeline."
            page="about"
            sectionKey="milestonesHeading"
            fields={["title", "subtitle", "body"]}
            section={sections.milestonesHeading ?? null}
          />

          <CollectionSection
            title="Company Milestones"
            description="Entries shown on the interactive company journey timeline."
            items={milestones}
            saveAction={submitMilestone}
            deleteAction={deleteMilestone}
            addLabel="Add milestone"
            renderItem={(item) => (
              <>
                <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-forest-900">Year</label>
                    <input name="year" type="number" defaultValue={item?.year ?? new Date().getFullYear()} className="input-admin" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-forest-900">Milestone Title</label>
                    <input name="title" defaultValue={item?.title ?? ""} placeholder="e.g. Export Terminal Launched" className="input-admin" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-forest-900">Description (optional)</label>
                  <textarea name="description" rows={2} defaultValue={item?.description ?? ""} placeholder="Brief note on what was accomplished in this year…" className="input-admin" />
                </div>
              </>
            )}
          />
        </div>
      </section>

      {/* 4. Certifications & Compliance */}
      <section className="space-y-6">
        <div className="border-b border-sand-200/80 pb-2">
          <h2 className="font-serif text-lg font-semibold text-forest-950">Certifications & Standards</h2>
          <p className="text-xs text-forest-700/70">Accreditations, export quality marks and food safety certifications</p>
        </div>

        <div className="grid gap-6">
          <SectionForm
            label="Certifications Heading"
            description="Heading and overview copy for our quality and international compliance accreditations."
            page="about"
            sectionKey="certificationsHeading"
            fields={["title", "subtitle", "body"]}
            section={sections.certificationsHeading ?? null}
          />

          <CollectionSection
            title="Certifications & Compliance Badges"
            description="Accreditation pills shown at the bottom of the About page."
            items={certifications}
            saveAction={submitChecklistItem}
            deleteAction={deleteChecklistItem}
            addLabel="Add certification"
            renderItem={(item) => (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-forest-900">Certification Name / Standard</label>
                <input name="title" defaultValue={item?.title ?? ""} placeholder="e.g. ISO 22000:2018 or HACCP Certified" className="input-admin" />
                <input type="hidden" name="group" value="certifications" />
              </div>
            )}
          />
        </div>
      </section>
      </div>
    </PageEditor>
  );
}