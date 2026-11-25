import { useId } from "react";
import { AssetImage } from "@/components/ui/asset-image";

type PageBannerProps = {
  eyebrow: string;
  title: string;
  description?: string | null;
  image?: string | null;
};

export function PageBanner({ eyebrow, title, description, image }: PageBannerProps) {
  const waveGradientId = useId();

  return (
    <section className="relative overflow-hidden border-b border-sand-200 bg-forest-950 py-14 text-cream md:py-20">
      <div className="absolute inset-0" aria-hidden>
        {image ? (
          <>
            <AssetImage
              src={image}
              alt=""
              priority
              fetchPriority="high"
              sizes="100vw"
              className="opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-forest-950/80 via-forest-950/55 to-soil-950/70" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-900/95 to-soil-950/90" />
            <div className="absolute -left-24 -top-28 h-[380px] w-[380px] rounded-full bg-forest-500/45 blur-[100px]" />
            <div className="absolute -bottom-32 right-[-60px] h-[420px] w-[460px] rounded-full bg-soil-500/50 blur-[110px]" />
            <div className="absolute left-1/2 top-1/4 h-[260px] w-[320px] -translate-x-1/2 rounded-full bg-gold-500/20 blur-[95px]" />
            <svg
              className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full opacity-30 md:h-28"
              viewBox="0 0 1440 160"
              preserveAspectRatio="none"
            >
              <path
                d="M0,96 C240,144 480,32 760,80 C1040,128 1240,48 1440,84 L1440,160 L0,160 Z"
                fill={`url(#${waveGradientId})`}
              />
              <defs>
                <linearGradient id={waveGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4e845d" stopOpacity="0.5" />
                  <stop offset="55%" stopColor="#cd9527" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#8f5b3d" stopOpacity="0.7" />
                </linearGradient>
              </defs>
            </svg>
          </>
        )}
      </div>
      <div className="grain pointer-events-none absolute inset-0" aria-hidden />

      <div className="section-container relative">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold-400">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold md:text-5xl">
          {title}
        </h1>
        {description ? <p className="mt-4 max-w-2xl text-cream/70">{description}</p> : null}
      </div>
    </section>
  );
}
