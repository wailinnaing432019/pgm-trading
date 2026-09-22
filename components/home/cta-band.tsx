import { ArrowRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSection, getSiteSettings } from "@/lib/queries";

export async function CtaBand() {
  const [section, settings] = await Promise.all([getSection("home", "cta"), getSiteSettings()]);

  return (
    <section className="bg-cream pb-20 md:pb-28">
      <div className="section-container">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-800 via-forest-900 to-forest-950 px-8 py-14 text-cream md:px-14 md:py-16">
          <div className="grain absolute inset-0" aria-hidden />
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gold-500/20 blur-[90px]" aria-hidden />

          <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="max-w-xl font-serif text-3xl font-semibold leading-tight md:text-4xl">
                {section?.title ??
                  "Ready to trade? Let's talk specifications, pricing and shipping windows."}
              </h2>
              <p className="mt-3 max-w-lg text-cream/70">
                {section?.subtitle ??
                  "Our export desk responds within one business day with grades, load availability and freight quotes."}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button href="/contact" size="lg" variant="gold">
                Start an Inquiry <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
              <a
                href={`tel:${settings.phone}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-cream/25 px-8 py-3 text-sm font-medium text-cream transition-colors hover:border-gold-300 hover:text-gold-200"
              >
                <PhoneCall className="h-4 w-4" aria-hidden />
                {settings.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}