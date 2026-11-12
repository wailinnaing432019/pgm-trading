import { Award, Clock, Compass, HeartHandshake } from "lucide-react";
import {
  getAdminChecklist,
  getAdminMilestones,
  getAdminSections,
  getAdminValues,
} from "@/lib/queries";
import { SectionForm } from "@/components/admin/section-form";
import { CollectionSection } from "@/components/admin/collection-section";
import { IconSelect } from "@/components/admin/icon-select";
import {
  saveValue,
  deleteValue,
  saveMilestone,
  deleteMilestone,
  saveChecklistItem,
  deleteChecklistItem,
} from "@/lib/actions/admin";
import { PageEditor } from "@/components/admin/page-editor";
import { PageGroup } from "@/components/admin/page-group";

export default async function AdminPagesAbout() {
  const [sections, values, milestones, certifications] = await Promise.all([
    getAdminSections("about"),
    getAdminValues(),
    getAdminMilestones(),
    getAdminChecklist("certifications"),
  ]);

  const outline = [
    { id: "section-hero", label: "Top banner", configured: Boolean(sections.hero) },
    { id: "section-story", label: "Our story", configured: Boolean(sections.story) },
    { id: "section-mission", label: "Mission statement", configured: Boolean(sections.mission) },
    { id: "section-vision", label: "Long-term vision", configured: Boolean(sections.vision) },
    {
      id: "section-valuesHeading",
      label: "Core values heading",
      configured: Boolean(sections.valuesHeading),
    },
    {
      id: "collection-core-values",
      label: "Core values cards",
      configured: values.length > 0,
      count: values.length,
    },
    {
      id: "section-milestonesHeading",
      label: "Timeline heading",
      configured: Boolean(sections.milestonesHeading),
    },
    {
      id: "collection-company-milestones",
      label: "Company milestones",
      configured: milestones.length > 0,
      count: milestones.length,
    },
    {
      id: "section-certificationsHeading",
      label: "Certifications heading",
      configured: Boolean(sections.certificationsHeading),
    },
    {
      id: "collection-certifications-compliance-badges",
      label: "Certifications & badges",
      configured: certifications.length > 0,
      count: certifications.length,
    },
  ];

  return (
    <PageEditor items={outline}>
      <div className="space-y-10">
        {/* 1. Top Banner, Story, Mission & Vision */}
        <PageGroup
          step={1}
          title="Who We Are, Mission & Vision"
          description="The opening banner, your company story, and the Mission & Vision highlight cards."
          icon={<Compass className="h-5 w-5" aria-hidden />}
          badge="Top of About Page"
        >
          <SectionForm
            label="Top Hero Banner"
            description="Main headline, small label, optional intro sentence, and background photo."
            page="about"
            sectionKey="hero"
            fields={["title", "subtitle", "body", "image"]}
            section={sections.hero ?? null}
          />

          <SectionForm
            label="Our Story"
            description="Your company background displayed on the left side of the About page."
            page="about"
            sectionKey="story"
            fields={["title", "body"]}
            section={sections.story ?? null}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <SectionForm
              label="Our Mission"
              description="PGM's daily purpose and agricultural promise."
              page="about"
              sectionKey="mission"
              fields={["title", "body"]}
              section={sections.mission ?? null}
            />

            <SectionForm
              label="Our Vision"
              description="Where the company is heading long-term."
              page="about"
              sectionKey="vision"
              fields={["title", "body"]}
              section={sections.vision ?? null}
            />
          </div>
        </PageGroup>

        {/* 2. Core Values */}
        <PageGroup
          step={2}
          title="Core Values"
          description="The principle cards displayed next to your company story."
          icon={<HeartHandshake className="h-5 w-5" aria-hidden />}
          badge="Side-by-Side Cards"
        >
          <SectionForm
            label="Core Values Heading"
            description="Small tag and heading shown above your core value cards."
            page="about"
            sectionKey="valuesHeading"
            fields={["title", "subtitle"]}
            section={sections.valuesHeading ?? null}
          />

          <CollectionSection
            title="Core Values"
            description="Add, edit, or reorder the guiding values cards (e.g. Integrity, Quality, Farmer Empowerment)."
            items={values}
            collectionKind="value"
            saveAction={saveValue}
            deleteAction={deleteValue}
            addLabel="Add value"
            renderItem={(item) => (
              <>
                <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-forest-900">
                      Value Title *
                    </label>
                    <input
                      name="title"
                      required
                      defaultValue={item?.title ?? ""}
                      placeholder="e.g. Integrity & Transparency"
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
                    placeholder="Briefly explain what this value means to your partners…"
                    className="input-admin"
                  />
                </div>
              </>
            )}
          />
        </PageGroup>

        {/* 3. Company Journey Timeline */}
        <PageGroup
          step={3}
          title="Company Growth Timeline"
          description="Key milestones across the years shown as a vertical timeline."
          icon={<Clock className="h-5 w-5" aria-hidden />}
          badge="Timeline Section"
        >
          <SectionForm
            label="Timeline Heading"
            description="Heading and short intro displayed above your company milestones."
            page="about"
            sectionKey="milestonesHeading"
            fields={["title", "subtitle", "body"]}
            section={sections.milestonesHeading ?? null}
          />

          <CollectionSection
            title="Company Milestones"
            description="Entries shown along the vertical growth timeline. Use the arrows to arrange the order."
            items={milestones}
            collectionKind="milestone"
            saveAction={saveMilestone}
            deleteAction={deleteMilestone}
            addLabel="Add milestone"
            renderItem={(item) => (
              <>
                <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-forest-900">
                      Year *
                    </label>
                    <input
                      name="year"
                      type="number"
                      required
                      min={1970}
                      max={2100}
                      defaultValue={item?.year ?? new Date().getFullYear()}
                      className="input-admin"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-forest-900">
                      Milestone Title *
                    </label>
                    <input
                      name="title"
                      required
                      defaultValue={item?.title ?? ""}
                      placeholder="e.g. Cold-Chain Facility Opened"
                      className="input-admin"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-forest-900">
                    Short Note (optional)
                  </label>
                  <textarea
                    name="description"
                    rows={2}
                    defaultValue={item?.description ?? ""}
                    placeholder="Brief summary of what happened that year…"
                    className="input-admin"
                  />
                </div>
              </>
            )}
          />
        </PageGroup>

        {/* 4. Certifications & Standards */}
        <PageGroup
          step={4}
          title="Quality Certifications & Standards"
          description="Industry badges and quality standards displayed near the bottom of the About page."
          icon={<Award className="h-5 w-5" aria-hidden />}
          badge="Trust Badges"
        >
          <SectionForm
            label="Certifications Heading"
            description="Heading and intro explaining your quality compliance standards."
            page="about"
            sectionKey="certificationsHeading"
            fields={["title", "subtitle", "body"]}
            section={sections.certificationsHeading ?? null}
          />

          <CollectionSection
            title="Certifications & Compliance Badges"
            description="Shown as rounded gold-accent badges at the bottom of the About page."
            items={certifications}
            collectionKind="checklistItem"
            saveAction={saveChecklistItem}
            deleteAction={deleteChecklistItem}
            addLabel="Add certification"
            renderItem={(item) => (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-forest-900">
                  Certification or Standard Name *
                </label>
                <input
                  name="title"
                  required
                  defaultValue={item?.title ?? ""}
                  placeholder="e.g. ISO 22000:2018 or HACCP Certified"
                  className="input-admin"
                />
                <input type="hidden" name="group" value="certifications" />
              </div>
            )}
          />
        </PageGroup>
      </div>
    </PageEditor>
  );
}
