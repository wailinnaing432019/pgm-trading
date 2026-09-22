import { ArrowRight, Globe2, Leaf, ShieldCheck, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssetImage } from "@/components/ui/asset-image";

type HeroProps = {
  title: string;
  subtitle: string | null;
  image?: string | null;
};

export function Hero({ title, subtitle, image }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-forest-950 text-cream">
      {/* Ambient gradient mesh / optional hero image */}
      <div className="absolute inset-0" aria-hidden>
        {image ? (
          <>
            <AssetImage src={image} alt="" priority className="opacity-35" />
            <div className="absolute inset-0 bg-gradient-to-br from-forest-950/80 via-forest-950/50 to-forest-900/60" />
          </>
        ) : (
          <>
            <div className="absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full bg-forest-600/50 blur-[120px]" />
            <div className="absolute -bottom-40 right-[-80px] h-[520px] w-[520px] rounded-full bg-soil-600/40 blur-[130px]" />
            <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] rounded-full bg-gold-500/15 blur-[100px]" />
          </>
        )}
      </div>
      <div className="grain absolute inset-0" aria-hidden />

      <div className="section-container relative grid gap-12 py-20 md:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <div className="mb-6 flex flex-wrap gap-2">
            <span className="glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium tracking-wide text-cream/90">
              <Leaf className="h-3.5 w-3.5 text-gold-300" aria-hidden /> Farm-to-Table Traceability
            </span>
            <span className="glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium tracking-wide text-cream/90">
              <Globe2 className="h-3.5 w-3.5 text-gold-300" aria-hidden /> Exporting to 24+ Countries
            </span>
          </div>

          <h1 className="max-w-2xl text-balance text-4xl font-semibold leading-[1.08] text-cream sm:text-5xl lg:text-6xl">
            {title}
          </h1>

          {subtitle ? (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/70">
              {subtitle}
            </p>
          ) : null}

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button href="/products" size="lg" variant="gold">
              Explore Products <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
            <Button href="/contact" size="lg" variant="outline" className="border-cream/30 text-cream hover:border-gold-300 hover:bg-cream/10">
              Contact Us
            </Button>
          </div>
        </div>

        {/* Glass feature cards */}
        <div className="relative hidden lg:block" aria-hidden>
          <div className="glass-dark absolute right-4 top-8 w-72 rounded-2xl p-6">
            <ShieldCheck className="h-8 w-8 text-gold-300" />
            <p className="mt-4 font-serif text-lg font-semibold text-cream">Certified Quality</p>
            <p className="mt-1 text-sm text-cream/60">ISO 22000, GAP & organic compliance across supply lines.</p>
          </div>
          <div className="glass-dark relative ml-auto mt-40 w-72 rounded-2xl p-6">
            <Sprout className="h-8 w-8 text-gold-300" />
            <p className="mt-4 font-serif text-lg font-semibold text-cream">Cold-Chain Network</p>
            <p className="mt-1 text-sm text-cream/60">18,000 MT of temperature-controlled warehousing in the delta.</p>
          </div>
        </div>
      </div>
    </section>
  );
}