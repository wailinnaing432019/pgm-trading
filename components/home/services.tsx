import {
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import type { Service } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { getSection } from "@/lib/queries";
import { getLucideIcon } from "@/lib/icons";

export async function Services({ services }: { services: Service[] }) {
  const heading = await getSection("home", "servicesHeading");
  if (services.length === 0) return null;

  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="section-container">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={heading?.subtitle ?? "Core Services"}
            title={heading?.title ?? "One partner for the whole agri value chain"}
            description={
              heading?.body ??
              "From grower contracts and warehousing to customs clearance and international freight — managed end-to-end."
            }
          />
          <Button href="/services" variant="outline" className="shrink-0">
            All Services <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = getLucideIcon(service.icon) as LucideIcon;
            return (
              <div
                key={service.id}
                className="card-surface group relative overflow-hidden p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-100 text-forest-700 transition-colors group-hover:bg-forest-700 group-hover:text-gold-300">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mt-5 font-serif text-xl font-semibold text-forest-950">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-forest-800/80">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}