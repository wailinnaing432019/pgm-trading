import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { Stats } from "@/components/home/stats";
import { Services } from "@/components/home/services";
import { ProductShowcase } from "@/components/home/product-showcase";
import { SupplyChain } from "@/components/home/supply-chain";
import { LatestNews } from "@/components/home/latest-news";
import { CtaBand } from "@/components/home/cta-band";
import { getHomeData, getPageContent } from "@/lib/queries";
import { AssetImage } from "@/components/ui/asset-image";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "PGM Trading — Agricultural Import, Export & Distribution",
  description:
    "Pacific Global Myanmar: agricultural import, export, trading, cold-chain distribution and contract farming from Myanmar to global markets.",
  path: "/",
});

export default async function HomePage() {
  const [data, content] = await Promise.all([getHomeData(), getPageContent("home")]);

  const hero = content.hero;
  const story = content.story;
  const storyQuote = content.storyQuote;

  return (
    <main>
      <Hero
        title={hero?.title ?? "From Myanmar Fields to Global Markets"}
        subtitle={
          hero?.subtitle ??
          "Pacific Global Myanmar links farmers, processors and international buyers through transparent import, export, trading and cold-chain distribution."
        }
        image={hero?.image ?? null}
      />
      <Stats stats={data.stats} />
      <Services services={data.services} />
      <ProductShowcase products={data.featuredProducts} />

      {/* Story band powered by CMS content */}
      {story ? (
        <section className="bg-cream py-20 md:py-28">
          <div className="section-container grid items-center gap-12 lg:grid-cols-2">
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-500 via-forest-700 to-forest-950 p-12 text-cream">
                {story.image ? (
                  <div className="absolute inset-0" aria-hidden>
                    <AssetImage src={story.image} alt="" className="opacity-40" />
                    <div className="absolute inset-0 bg-forest-950/70" />
                  </div>
                ) : null}
                <p className="relative font-serif text-lg leading-relaxed text-cream/90">
                  “{storyQuote?.title ?? "We build supply chains that respect the farmer, protect the produce, and deliver certainty to the buyer."}”
                </p>
                <p className="relative mt-6 text-sm font-semibold uppercase tracking-widest text-gold-300">
                  — {storyQuote?.subtitle ?? "Managing Director, PGM"}
                </p>
              </div>
              <div className="absolute -bottom-6 -left-6 -z-10 h-32 w-32 rounded-2xl border-2 border-gold-400/40" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold-600">Our Story</p>
              <h2 className="mt-3 max-w-xl font-serif text-3xl font-semibold text-forest-950 sm:text-4xl">
                {story.title}
              </h2>
              <p className="mt-4 max-w-xl leading-relaxed text-forest-800/80">{story.body}</p>
            </div>
          </div>
        </section>
      ) : null}

      <SupplyChain />
      <LatestNews posts={data.latestNews} />
      <CtaBand />
    </main>
  );
}