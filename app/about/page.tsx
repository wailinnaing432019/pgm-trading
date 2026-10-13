import type { Metadata } from "next";
import { Award, Eye, Goal } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { AssetImage } from "@/components/ui/asset-image";
import { getPageContent, getMilestones, getValues, getChecklist, getSiteSettings } from "@/lib/queries";
import { getLucideIcon } from "@/lib/icons";
import { TradeCredentials } from "@/components/layout/trade-credentials";

export const metadata: Metadata = {
  title: "About Us — Our Story, Vision & Values",
  description:
    "Pacific Global Myanmar: our company story, mission, vision, core values and certification milestones.",
};

export default async function AboutPage() {
  const [content, milestones, values, certifications, settings] = await Promise.all([
    getPageContent("about"),
    getMilestones(),
    getValues(),
    getChecklist("certifications"),
    getSiteSettings(),
  ]);

  const hero = content.hero;
  const story = content.story;
  const mission = content.mission;
  const vision = content.vision;

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
            {hero?.subtitle ?? "About Us"}
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold md:text-5xl">
            {hero?.title ?? "Rooted in the land, geared for trade"}
          </h1>
          {hero?.body ? <p className="mt-4 max-w-2xl text-cream/70">{hero.body}</p> : null}
        </div>
      </section>

      {/* Story + mission/vision */}
      <section className="bg-cream py-16 md:py-24">
        <div className="section-container grid gap-14 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold-600">Who we are</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-forest-950">{story?.title ?? "Our story"}</h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-forest-800/85">
              {story?.body ??
                "Founded in Yangon, Pacific Global Myanmar builds resilient supply chains that move Myanmar's finest produce and agro-inputs across borders — reliably, traceably, sustainably."}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-forest-50 p-6">
                <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-forest-950">
                  <Goal className="h-5 w-5 text-forest-700" aria-hidden /> {mission?.title ?? "Our Mission"}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-forest-800/80">
                  {mission?.body ??
                    "Connect Myanmar's agricultural heartland with world markets through dependable logistics and fair, transparent trade."}
                </p>
              </div>
              <div className="rounded-2xl bg-forest-50 p-6">
                <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-forest-950">
                  <Eye className="h-5 w-5 text-forest-700" aria-hidden /> {vision?.title ?? "Our Vision"}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-forest-800/80">
                  {vision?.body ??
                    "A Myanmar agri-trade hub trusted by every link of the chain — from smallholder farmers to global food companies."}
                </p>
              </div>
            </div>
          </div>

          {/* Values */}
          <div>
            <SectionHeading
              eyebrow={(content.valuesHeading?.subtitle ?? "Core Values")}
              title={content.valuesHeading?.title ?? "What we stand behind"}
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {values.map((value) => {
                const Icon = getLucideIcon(value.icon);
                return (
                  <div key={value.id} className="card-surface p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <h3 className="mt-4 font-serif text-lg font-semibold text-forest-950">{value.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-forest-800/75">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Milestones timeline */}
      {milestones.length > 0 ? (
        <section className="bg-sand-50 py-16 md:py-24">
          <div className="section-container">
            <SectionHeading
              align="center"
              eyebrow={content.milestonesHeading?.subtitle ?? "Milestones"}
              title={content.milestonesHeading?.title ?? "Our growth, season by season"}
              description={content.milestonesHeading?.body ?? "Key moments in the PGM journey."}
            />
            <ol className="relative mt-14 space-y-10 border-l-2 border-forest-200 pl-8">
              {milestones.map((m) => (
                <li key={m.id} className="relative">
                  <span className="absolute -left-[41px] flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 ring-4 ring-sand-50" aria-hidden />
                  <p className="text-sm font-semibold uppercase tracking-wider text-gold-600">{m.year}</p>
                  <h3 className="mt-1 font-serif text-xl font-semibold text-forest-950">{m.title}</h3>
                  {m.description ? (
                    <p className="mt-1 max-w-2xl text-sm leading-relaxed text-forest-800/75">{m.description}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* Certifications */}
      {certifications.length > 0 ? (
        <section className="bg-cream py-16 md:py-24">
          <div className="section-container">
            <SectionHeading
              align="center"
              eyebrow={content.certificationsHeading?.subtitle ?? "Quality & Compliance"}
              title={content.certificationsHeading?.title ?? "Certified at every step"}
              description={
                content.certificationsHeading?.body ??
                "Compliance badges we maintain across farming, milling, warehousing and export."
              }
            />
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {certifications.map((cert) => (
                <span key={cert.id} className="inline-flex items-center gap-2 rounded-full bg-forest-50 px-5 py-2.5 text-sm font-semibold text-forest-800 ring-1 ring-forest-200">
                  <Award className="h-4 w-4 text-gold-600" aria-hidden /> {cert.title}
                </span>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Myanmar Official Trade Credentials & Compliance */}
      <TradeCredentials settings={settings} />
    </main>
  );
}