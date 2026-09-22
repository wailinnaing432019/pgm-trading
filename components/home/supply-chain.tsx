import { SectionHeading } from "@/components/ui/section-heading";
import { getSection, getSupplySteps } from "@/lib/queries";
import { getLucideIcon } from "@/lib/icons";

export async function SupplyChain() {
  const [heading, steps] = await Promise.all([getSection("home", "supplyChain"), getSupplySteps()]);
  if (steps.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-forest-950 py-20 text-cream md:py-28">
      <div className="absolute inset-0" aria-hidden>
        <div className="absolute right-[-120px] top-[-80px] h-[420px] w-[420px] rounded-full bg-forest-600/40 blur-[120px]" />
        <div className="grain absolute inset-0" />
      </div>

      <div className="section-container relative">
        <SectionHeading
          eyebrow={heading?.subtitle ?? "Global Supply Chain"}
          title={heading?.title ?? "Designed to move, engineered to stay fresh"}
          description={
            heading?.body ?? "A single orchestrated corridor from Myanmar's growing regions to receiving ports worldwide."
          }
          className="[&_h2]:text-cream [&_p]:text-cream/70"
        />

        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = getLucideIcon(step.icon);
            return (
              <li key={step.id} className="glass-dark relative rounded-2xl p-6">
                <span className="absolute right-5 top-5 font-serif text-4xl font-semibold text-cream/10">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500/15 text-gold-300">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 font-serif text-lg font-semibold text-cream">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/60">{step.description}</p>
              </li>
            );
          })}
        </ol>

        <div className="mt-12 overflow-hidden rounded-2xl border border-cream/10">
          <div className="flex flex-col items-center justify-between gap-4 bg-cream/5 px-6 py-5 md:flex-row">
            <p className="text-sm text-cream/70">
              Tracking produce from{" "}
              <span className="font-semibold text-gold-300">farm plot</span> to{" "}
              <span className="font-semibold text-gold-300">buyer&apos;s dock</span> — transparently, every step.
            </p>
            <p className="font-serif text-sm text-cream/50">Live shipment visibility available to trading partners</p>
          </div>
        </div>
      </div>
    </section>
  );
}