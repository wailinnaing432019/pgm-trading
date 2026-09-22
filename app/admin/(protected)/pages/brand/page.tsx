import { getSiteSettings, getAdminSections } from "@/lib/queries";
import { SectionForm } from "@/components/admin/section-form";
import { submitSiteSettings } from "@/lib/actions/admin";

export default async function AdminPagesBrand() {
  const [settings, sections] = await Promise.all([getSiteSettings(), getAdminSections("shared")]);

  return (
    <div className="max-w-4xl">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-forest-950">Brand & settings</h1>
        <p className="mt-1 text-sm text-forest-700/70">
          Company identity, contact details and social links — used in the header, footer and contact page.
        </p>
      </div>

      <form action={submitSiteSettings} className="card-surface mt-8 p-6">
        <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-forest-950">Company identity</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-forest-900">Company name</label>
            <input name="companyName" defaultValue={settings.companyName} className="input-admin" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-forest-900">Legal name (copyright line)</label>
            <input name="legalName" defaultValue={settings.legalName} className="input-admin" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-900">Short name (logo)</label>
            <input name="shortName" defaultValue={settings.shortName} className="input-admin" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-900">Tagline</label>
            <input name="tagline" defaultValue={settings.tagline} className="input-admin" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-forest-900">Description (footer + SEO)</label>
            <textarea name="description" rows={3} defaultValue={settings.description} className="input-admin" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-forest-900">Site URL</label>
            <input name="url" defaultValue={settings.url} className="input-admin" />
          </div>
        </div>

        <h2 className="mt-8 flex items-center gap-2 font-serif text-lg font-semibold text-forest-950">Contact & social links</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-900">Email</label>
            <input name="email" type="email" defaultValue={settings.email} className="input-admin" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-900">Phone</label>
            <input name="phone" defaultValue={settings.phone} className="input-admin" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-900">WhatsApp</label>
            <input name="whatsapp" defaultValue={settings.whatsapp} className="input-admin" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-900">Facebook URL</label>
            <input name="facebook" defaultValue={settings.facebook} className="input-admin" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-900">LinkedIn URL</label>
            <input name="linkedin" defaultValue={settings.linkedin} className="input-admin" />
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-forest-700 px-6 text-sm font-semibold text-cream transition-colors hover:bg-forest-800"
        >
          Save settings
        </button>
      </form>

      <div className="mt-10 grid gap-6">
        <SectionForm
          label="Footer newsletter band"
          description="Heading and description shown above the newsletter form in the footer."
          page="shared"
          key="newsletter"
          fields={["title", "body"]}
          section={sections.newsletter ?? null}
        />
      </div>
    </div>
  );
}