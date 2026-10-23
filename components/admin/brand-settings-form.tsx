"use client";

import { useState } from "react";
import {
  Building2,
  Globe,
  Share2,
  Mail,
  Phone,
  MessageCircle,
  Sliders,
  Send,
} from "lucide-react";
import type { SiteSettings } from "@/lib/site";
import { submitSiteSettings } from "@/lib/actions/admin";
import { ImageUploader } from "@/components/ui/image-uploader";
import { SubmitButton } from "@/components/admin/submit-button";
import { cn } from "@/lib/utils";

export function BrandSettingsForm({ settings }: { settings: SiteSettings }) {
  const [activeTab, setActiveTab] = useState<"identity" | "site" | "contact">("identity");
  const [shortName, setShortName] = useState(settings.shortName);
  const [brandTag, setBrandTag] = useState(settings.brandTag);
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [desc, setDesc] = useState(settings.description);

  return (
    <form
      id="section-brand-settings"
      data-section-key="brand-settings"
      data-section-label="Brand & Company Settings"
      action={submitSiteSettings}
      className="card-surface overflow-hidden border border-sand-200/80 shadow-sm scroll-mt-24"
    >
      {/* Settings Navigation Header */}
      <div className="border-b border-sand-200/80 bg-sand-50/50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-forest-950">
              <Sliders className="h-5 w-5 text-forest-700" aria-hidden />
              Global Brand & Site Configuration
            </h2>
            <p className="mt-0.5 text-xs text-forest-700/70 sm:text-sm">
              Controls branding, copyright, contact details and shared footer content.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <SubmitButton
              variant="primary"
              size="sm"
              pendingText="Saving settings…"
            >
              Save All Settings
            </SubmitButton>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="mt-5 flex gap-2 border-t border-sand-200/60 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab("identity")}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors",
              activeTab === "identity"
                ? "bg-forest-700 text-cream"
                : "bg-white text-forest-800 ring-1 ring-sand-200 hover:bg-forest-50"
            )}
          >
            <Building2 className="h-3.5 w-3.5" aria-hidden /> Company Identity
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("site")}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors",
              activeTab === "site"
                ? "bg-forest-700 text-cream"
                : "bg-white text-forest-800 ring-1 ring-sand-200 hover:bg-forest-50"
            )}
          >
            <Globe className="h-3.5 w-3.5" aria-hidden /> Site
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("contact")}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors",
              activeTab === "contact"
                ? "bg-forest-700 text-cream"
                : "bg-white text-forest-800 ring-1 ring-sand-200 hover:bg-forest-50"
            )}
          >
            <Share2 className="h-3.5 w-3.5" aria-hidden /> Contact & Socials
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Tab 1: Company Identity */}
        <div className={cn("grid gap-5", activeTab !== "identity" && "hidden")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-forest-900">
                Company Name
              </label>
              <input
                name="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="input-admin"
              />
              <p className="mt-1 text-xs text-forest-700/60">Primary public trade brand name</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-forest-900">
                Legal Registered Name
              </label>
              <input
                name="legalName"
                defaultValue={settings.legalName}
                className="input-admin"
              />
              <p className="mt-1 text-xs text-forest-700/60">Used on official invoices & footer copyright line</p>
            </div>

            <div className="sm:col-span-2">
              <ImageUploader
                name="logo"
                label="Brand Logo (shown in Header & Footer)"
                initial={settings.logo ? [settings.logo] : []}
              />
              <p className="mt-1 text-xs text-forest-700/60">
                Transparent PNG, SVG or WebP recommended. Leave blank to use the default brand icon.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-forest-900">
                Short Name (beside logo)
              </label>
              <input
                name="shortName"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="PGM"
                className="input-admin"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-forest-900">
                Brand Tag (under logo)
              </label>
              <input
                name="brandTag"
                value={brandTag}
                onChange={(e) => setBrandTag(e.target.value)}
                placeholder="Trade & Distribution"
                className="input-admin"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-forest-900">
                Official Tagline
              </label>
              <input
                name="tagline"
                defaultValue={settings.tagline}
                placeholder="From Myanmar Fields to Global Markets"
                className="input-admin"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-forest-900">
                DICA / MyCO Company Reg. No.
              </label>
              <input
                name="regNumber"
                defaultValue={settings.regNumber ?? ""}
                placeholder="109847291 (MyCO / DICA)"
                className="input-admin"
              />
              <p className="mt-1 text-xs text-forest-700/60">Displayed in footer & credentials for international buyer due diligence</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-forest-900">
                Export / Import License (PaThaKa)
              </label>
              <input
                name="exportLicense"
                defaultValue={settings.exportLicense ?? ""}
                placeholder="MOC-PTK-2024/0912 (PaThaKa)"
                className="input-admin"
              />
              <p className="mt-1 text-xs text-forest-700/60">Ministry of Commerce registered trading license number</p>
            </div>
          </div>
        </div>

        {/* Tab 2: Site */}
        <div className={cn("grid gap-5", activeTab !== "site" && "hidden")}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-900">
              Site URL
            </label>
            <input
              name="url"
              defaultValue={settings.url}
              placeholder="https://pgm-trading.com"
              className="input-admin"
            />
            <p className="mt-1 text-xs text-forest-700/60">Used for canonical links and social sharing previews</p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="mb-1.5 block text-sm font-medium text-forest-900">
                Site description (footer)
              </label>
              <span className="text-xs text-forest-700/50">{desc.length} characters</span>
            </div>
            <textarea
              name="description"
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="input-admin resize-y"
            />
            <p className="mt-1 text-xs text-forest-700/60">
              Recommended: 120–160 characters
            </p>
          </div>
        </div>

        {/* Tab 3: Contact & Socials */}
        <div className={cn("grid gap-5", activeTab !== "contact" && "hidden")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="flex items-center gap-1.5 mb-1.5 text-sm font-medium text-forest-900">
                <Mail className="h-4 w-4 text-forest-600" aria-hidden /> Primary Email
              </label>
              <input
                name="email"
                type="email"
                defaultValue={settings.email}
                className="input-admin"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 mb-1.5 text-sm font-medium text-forest-900">
                <Phone className="h-4 w-4 text-forest-600" aria-hidden /> Phone Number
              </label>
              <input
                name="phone"
                defaultValue={settings.phone}
                className="input-admin"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 mb-1.5 text-sm font-medium text-forest-900">
                <MessageCircle className="h-4 w-4 text-forest-600" aria-hidden /> WhatsApp Number
              </label>
              <input
                name="whatsapp"
                defaultValue={settings.whatsapp}
                placeholder="+959 123 456 789"
                className="input-admin"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 mb-1.5 text-sm font-medium text-forest-900">
                <Phone className="h-4 w-4 text-purple-600" aria-hidden /> Viber Number
              </label>
              <input
                name="viber"
                defaultValue={settings.viber ?? ""}
                placeholder="+959 123 456 789"
                className="input-admin"
              />
              <p className="mt-1 text-xs text-forest-700/60">Essential for local Myanmar farmers & distributors</p>
            </div>
            <div>
              <label className="flex items-center gap-1.5 mb-1.5 text-sm font-medium text-forest-900">
                <Send className="h-4 w-4 text-sky-600" aria-hidden /> Telegram Username / Channel
              </label>
              <input
                name="telegram"
                defaultValue={settings.telegram ?? ""}
                placeholder="pgm_trade_desk"
                className="input-admin"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-forest-900">
                Facebook Page URL
              </label>
              <input
                name="facebook"
                defaultValue={settings.facebook}
                placeholder="https://facebook.com/…"
                className="input-admin"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-forest-900">
                LinkedIn Company URL
              </label>
              <input
                name="linkedin"
                defaultValue={settings.linkedin}
                placeholder="https://linkedin.com/company/…"
                className="input-admin"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Save Button */}
      <div className="flex items-center justify-between border-t border-sand-200/80 bg-sand-50/30 p-5">
        <span className="text-xs text-forest-700/60">
          Saved settings take effect immediately across all site pages.
        </span>
        <SubmitButton
          variant="primary"
          pendingText="Saving settings…"
        >
          Save Settings
        </SubmitButton>
      </div>
    </form>
  );
}
