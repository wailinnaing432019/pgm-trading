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

export default async function AdminPagesAbout() {
  const [sections, values, milestones, certifications] = await Promise.all([
    getAdminSections("about"),
    getAdminValues(),
    getAdminMilestones(),
    getAdminChecklist("certifications"),
  ]);

  return (
    <div className="max-w-4xl">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-forest-950">About page</h1>
        <p className="mt-1 text-sm text-forest-700/70">
          Edit every block visitors see on the About page. Changes go live instantly.
        </p>
      </div>

      <div className="mt-8 grid gap-6">
        <SectionForm
          label="Hero banner"
          page="about"
          key="hero"
          fields={["title", "subtitle", "image"]}
          section={sections.hero ?? null}
        />
        <SectionForm
          label="Story"
          page="about"
          key="story"
          fields={["title", "body", "image"]}
          section={sections.story ?? null}
        />
        <SectionForm
          label="Mission"
          page="about"
          key="mission"
          fields={["title", "body"]}
          section={sections.mission ?? null}
        />
        <SectionForm
          label="Vision"
          page="about"
          key="vision"
          fields={["title", "body"]}
          section={sections.vision ?? null}
        />
      </div>

      <CollectionSection
        title="Core values"
        description="The four cards under 'What we stand behind'."
        items={values}
        saveAction={submitValue}
        deleteAction={deleteValue}
        addLabel="Add value"
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
          label="Milestones heading"
          page="about"
          key="milestonesHeading"
          fields={["title", "subtitle", "body"]}
          section={sections.milestonesHeading ?? null}
        />
      </div>

      <CollectionSection
        title="Milestones"
        description="Your company journey on the timeline."
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
                <label className="mb-1.5 block text-sm font-medium text-forest-900">Title</label>
                <input name="title" defaultValue={item?.title ?? ""} className="input-admin" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-forest-900">Description (optional)</label>
              <textarea name="description" rows={2} defaultValue={item?.description ?? ""} className="input-admin" />
            </div>
          </>
        )}
      />

      <div className="mt-10 grid gap-6">
        <SectionForm
          label="Certifications heading"
          page="about"
          key="certificationsHeading"
          fields={["title", "subtitle", "body"]}
          section={sections.certificationsHeading ?? null}
        />
      </div>

      <CollectionSection
        title="Certifications & compliance"
        description="The badges shown at the bottom of the About page."
        items={certifications}
        saveAction={submitChecklistItem}
        deleteAction={deleteChecklistItem}
        addLabel="Add certification"
        renderItem={(item) => (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-900">Name</label>
            <input name="title" defaultValue={item?.title ?? ""} placeholder="e.g. ISO 22000:2018" className="input-admin" />
            <input type="hidden" name="group" value="certifications" />
          </div>
        )}
      />
    </div>
  );
}