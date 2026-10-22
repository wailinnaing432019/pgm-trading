import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { InquiryForm } from "@/components/contact/inquiry-form";
import { AssetImage } from "@/components/ui/asset-image";
import { getPageContent, getOffices, getSectionForDisplay, getSiteSettings } from "@/lib/queries";
import { TradeCredentials } from "@/components/layout/trade-credentials";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact & Trade Enquiries",
  description:
    "Reach Pacific Global Myanmar for export pricing, import sourcing, distribution and logistics enquiries.",
  path: "/contact",
});

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; tab?: string }>;
}) {
  const [content, trustSection, offices, settings] = await Promise.all([
    getPageContent("contact"),
    getSectionForDisplay("contact", "trust"),
    getOffices(),
    getSiteSettings(),
  ]);
  const { subject, tab } = await searchParams;
  const hero = content.hero;

  return (
    <main>
      <section className="relative overflow-hidden border-b border-sand-200 bg-forest-950 py-14 text-cream md:py-20">
        {hero?.image ? (
          <div className="absolute inset-0" aria-hidden>
            <AssetImage src={hero.image} alt="" className="opacity-30" />
            <div className="absolute inset-0 bg-forest-950/70" />
          </div>
        ) : null}
        <div className="section-container relative">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold-400">
            {hero?.subtitle ?? "Contact"}
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold md:text-5xl">
            {hero?.title ?? "Let's move crops & cargo"}
          </h1>
          {hero?.body ? <p className="mt-4 max-w-2xl text-cream/70">{hero.body}</p> : null}
        </div>
      </section>

      <section className="bg-sand-50 py-16">
        <div className="section-container grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Contact details & map */}
          <div className="flex flex-col gap-6">
            {offices.length > 0 ? (
              offices.map((office) => (
                <div key={office.id} className="card-surface p-6">
                  <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-forest-950">
                    <MapPin className="h-5 w-5 text-forest-700" aria-hidden /> {office.name}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-forest-800/75">{office.address}</p>
                  {office.phone ? (
                    <p className="mt-2 flex items-center gap-2 text-sm font-medium text-forest-900">
                      <Phone className="h-4 w-4 text-forest-700" aria-hidden /> {office.phone}
                    </p>
                  ) : null}
                  {office.email ? (
                    <a
                      href={`mailto:${office.email}`}
                      className="mt-2 flex items-center gap-2 text-sm font-medium text-forest-900"
                    >
                      <Mail className="h-4 w-4 text-forest-700" aria-hidden /> {office.email}
                    </a>
                  ) : null}
                  {office.whatsapp ? (
                    <p className="mt-2 flex items-center gap-2 text-sm font-medium text-forest-900">
                      <Phone className="h-4 w-4 text-forest-700" aria-hidden /> WhatsApp {office.whatsapp}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="card-surface flex flex-col gap-3 p-6">
                <p className="text-sm text-forest-700/70">Office details coming soon. Reach us directly below.</p>
                <a href={`mailto:${settings.email}`} className="text-sm font-medium text-forest-700 underline underline-offset-4 hover:text-forest-900">
                  {settings.email}
                </a>
              </div>
            )}

            <div className="card-surface flex flex-col gap-2 p-6">
              <p className="flex items-center gap-2 text-sm font-semibold text-forest-950">
                <Mail className="h-4 w-4 text-forest-700" aria-hidden /> Email us
              </p>
              <a href={`mailto:${settings.email}`} className="text-sm text-forest-700 underline underline-offset-4 hover:text-forest-900">
                {settings.email}
              </a>
            </div>

            {offices.length > 0 ? (
              <div className="card-surface overflow-hidden">
                <iframe
                  title={`${offices[0].name} — map`}
                  src="https://www.google.com/maps?q=Yangon%2C%20Myanmar&output=embed"
                  className="h-64 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            ) : null}
          </div>

          {/* Form */}
          <div>
            <InquiryForm
              initialSubject={subject}
              initialTab={tab === "general" ? "general" : "rfq"}
              phone={settings.phone}
              whatsapp={settings.whatsapp}
              viber={settings.viber}
            />
          </div>
        </div>
      </section>

      {/* Official Credentials & Compliance */}
      <TradeCredentials settings={settings} section={trustSection} />
    </main>
  );
}