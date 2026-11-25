import type { Metadata } from "next";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { InquiryForm } from "@/components/contact/inquiry-form";
import { PageBanner } from "@/components/layout/page-banner";
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
      <PageBanner
        eyebrow={hero?.subtitle ?? "Contact"}
        title={hero?.title ?? "Let's move crops & cargo"}
        description={hero?.body}
        image={hero?.image}
      />

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
                  {office.latitude && office.longitude ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${office.latitude},${office.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-forest-700 hover:text-forest-950 underline underline-offset-2"
                    >
                      <MapPin className="h-3.5 w-3.5 text-forest-600" aria-hidden /> View on Google Maps
                      <ExternalLink className="h-3 w-3 ml-0.5 opacity-70" aria-hidden />
                    </a>
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

            {offices.length > 0 ? (() => {
              const headOffice = offices[0];
              const mapSrc =
                headOffice.latitude && headOffice.longitude
                  ? `https://maps.google.com/maps?q=${headOffice.latitude},${headOffice.longitude}&z=16&output=embed`
                  : headOffice.address?.startsWith("http")
                    ? headOffice.address
                    : `https://www.google.com/maps?q=${encodeURIComponent(
                        headOffice.address || headOffice.name || "Yangon, Myanmar"
                      )}&output=embed`;

              const externalMapUrl =
                headOffice.latitude && headOffice.longitude
                  ? `https://www.google.com/maps/search/?api=1&query=${headOffice.latitude},${headOffice.longitude}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      headOffice.address || headOffice.name || "Yangon, Myanmar"
                    )}`;

              return (
                <div className="card-surface overflow-hidden">
                  <div className="flex items-center justify-between border-b border-sand-200/80 bg-sand-100/60 px-4 py-2.5">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-forest-900">
                      <MapPin className="h-3.5 w-3.5 text-forest-700" aria-hidden />
                      {headOffice.name}
                    </span>
                    <a
                      href={externalMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-forest-700 transition-colors hover:text-forest-950"
                    >
                      <span>Directions</span>
                      <ExternalLink className="h-3 w-3" aria-hidden />
                    </a>
                  </div>
                  <iframe
                    title={`${headOffice.name} — map`}
                    src={mapSrc}
                    className="h-64 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              );
            })() : null}
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