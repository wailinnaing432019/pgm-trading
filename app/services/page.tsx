import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { AssetImage } from "@/components/ui/asset-image";
import { SupplyChain } from "@/components/home/supply-chain";
import { CtaBand } from "@/components/home/cta-band";
import { getPageContent, getServices, getChecklist } from "@/lib/queries";
import { getLucideIcon } from "@/lib/icons";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Services — Import, Export, Distribution & Logistics",
  description:
    "Import & export capabilities, warehousing, cold-chain distribution, customs clearance and contract farming from Pacific Global Myanmar.",
  path: "/services",
});

export default async function ServicesPage() {
  const [content, services, capabilities] = await Promise.all([
    getPageContent("services"),
    getServices(),
    getChecklist("capabilities"),
  ]);

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
            {hero?.subtitle ?? "Services"}
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold md:text-5xl">
            {hero?.title ?? "Services & global logistics"}
          </h1>
          {hero?.body ? (
            <p className="mt-4 max-w-2xl text-cream/70">{hero.body}</p>
          ) : null}
        </div>
      </section>

      {/* Service cards */}
      {services.length > 0 ? (
        <section className="bg-cream py-16 md:py-24">
          <div className="section-container">
            <SectionHeading
              eyebrow={content.servicesHeading?.subtitle ?? "What we do"}
              title={content.servicesHeading?.title ?? "Core service lines"}
              description={content.servicesHeading?.body ?? undefined}
            />
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                const Icon = getLucideIcon(service.icon);
                return (
                  <div key={service.id} className="card-surface p-7">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-100 text-forest-700">
                      <Icon className="h-6 w-6" aria-hidden />
                    </div>
                    <h3 className="mt-5 font-serif text-xl font-semibold text-forest-950">{service.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-forest-800/80">{service.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* Capabilities checklist */}
      <section className="bg-sand-50 py-16 md:py-24">
        <div className="section-container grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow={content.capabilitiesHeading?.subtitle ?? "Full-service trading"}
              title={content.capabilitiesHeading?.title ?? "What's included in every shipment"}
              description={content.capabilitiesHeading?.body ?? "We absorb the paperwork so you can focus on the trade."}
            />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {capabilities.map((item) => (
                <li key={item.id} className="flex items-start gap-2.5 text-sm font-medium text-forest-900">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-500 text-forest-950">
                    <ArrowRight className="h-3 w-3" style={{ transform: "rotate(-45deg)" }} aria-hidden />
                  </span>
                  {item.title}
                </li>
              ))}
            </ul>
            <Button href="/contact" className="mt-8">
              Request a logistics quote <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
          <div className="relative">
            <div className="rounded-3xl bg-gradient-to-br from-soil-500 via-soil-700 to-forest-950 p-10 text-cream">
              <p className="font-serif text-2xl font-semibold leading-snug">
                &quot;{content.quote?.title ?? "Give us the origin and the destination — we'll build the route."}&quot;
              </p>
              <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-gold-300">
                {content.quote?.subtitle ?? "Head of Logistics, PGM"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <SupplyChain />
      <div className="bg-cream pt-20">
        <CtaBand />
      </div>
    </main>
  );
}