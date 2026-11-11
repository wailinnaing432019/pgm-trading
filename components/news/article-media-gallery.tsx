"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { AssetImage } from "@/components/ui/asset-image";
import { PostMediaCarousel } from "@/components/news/post-media-carousel";
import { cn } from "@/lib/utils";

type ArticleMediaGalleryProps = {
  images: string[];
  title: string;
  children: React.ReactNode;
};

export function ArticleMediaGallery({ images, title, children }: ArticleMediaGalleryProps) {
  const [heroIndex, setHeroIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const count = images.length;
  const gallery = images.slice(1);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const showPrev = useCallback(() => {
    if (count === 0) return;
    setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + count) % count));
  }, [count]);

  const showNext = useCallback(() => {
    if (count === 0) return;
    setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % count));
  }, [count]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        showPrev();
      } else if (event.key === "ArrowRight") {
        showNext();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxIndex, closeLightbox, showPrev, showNext]);

  return (
    <>
      <div className="mt-10">
        <PostMediaCarousel
          images={images}
          alt={title}
          activeIndex={heroIndex}
          onActiveIndexChange={setHeroIndex}
          onImageClick={(index) => setLightboxIndex(index)}
          showExpandHint
          priority
          sizes="(min-width: 1024px) 896px, 100vw"
          className="aspect-[16/9] max-h-[520px] w-full rounded-3xl border border-sand-200"
        />

        {count > 1 ? (
          <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
            {images.map((src, index) => {
              const active = index === heroIndex;
              return (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  onClick={() => setHeroIndex(index)}
                  aria-label={`Preview photo ${index + 1} of ${count}`}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                    active
                      ? "border-gold-500 ring-2 ring-gold-400/50"
                      : "border-sand-200 opacity-70 hover:opacity-100"
                  )}
                >
                  <AssetImage
                    src={src}
                    alt={`${title} thumbnail ${index + 1}`}
                    placeholderIcon="leaf"
                    sizes="96px"
                  />
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {children}

      {gallery.length > 0 ? (
        <section className="mt-12 border-t border-sand-200 pt-8">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-forest-700/60">
              Activity gallery
            </p>
            <span className="text-xs text-forest-700/50">
              {gallery.length} additional photo{gallery.length === 1 ? "" : "s"} · click to expand
            </span>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {gallery.map((src, index) => {
              const spansBoth = gallery.length % 2 === 1 && index === gallery.length - 1;
              const fullIndex = index + 1;
              return (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  onClick={() => setLightboxIndex(fullIndex)}
                  aria-label={`Open photo ${fullIndex + 1} of ${count} in full screen`}
                  className={cn(
                    "group/gal relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-2xl border border-sand-200 bg-sand-100 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400",
                    spansBoth && "sm:col-span-2 sm:aspect-[16/9]"
                  )}
                >
                  <AssetImage
                    src={src}
                    alt={`${title} — activity photo ${fullIndex + 1}`}
                    placeholderIcon="leaf"
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="transition-transform duration-500 group-hover/gal:scale-105"
                  />
                  <span className="glass-dark pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-cream opacity-0 transition-opacity duration-200 group-hover/gal:opacity-100">
                    <Expand className="h-3.5 w-3.5 text-gold-300" aria-hidden />
                    {fullIndex + 1} / {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {lightboxIndex !== null && count > 0 ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photo gallery`}
          className="fixed inset-0 z-50 flex flex-col bg-forest-950/95 text-cream backdrop-blur-md"
          onClick={closeLightbox}
        >
          <div
            className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0">
              <p className="truncate font-serif text-base font-semibold sm:text-lg">{title}</p>
              <p className="text-xs tabular-nums text-cream/65">
                Photo {lightboxIndex + 1} of {count}
              </p>
            </div>
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Close full screen gallery"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-cream transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-4 py-2 sm:px-14">
            <div
              className="relative flex max-h-full max-w-5xl items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[lightboxIndex]}
                alt={`${title} — photo ${lightboxIndex + 1} of ${count}`}
                className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
              />
            </div>

            {count > 1 ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showPrev();
                  }}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-cream transition-colors hover:bg-white/20 sm:left-6"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showNext();
                  }}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-cream transition-colors hover:bg-white/20 sm:right-6"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
              </>
            ) : null}
          </div>

          {count > 1 ? (
            <div
              className="flex items-center justify-center gap-2 overflow-x-auto px-5 pb-5 pt-2"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((src, index) => {
                const active = index === lightboxIndex;
                return (
                  <button
                    key={`${src}-lb-${index}`}
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    aria-label={`Jump to photo ${index + 1}`}
                    className={cn(
                      "relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                      active
                        ? "border-gold-400 opacity-100"
                        : "border-transparent opacity-50 hover:opacity-90"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

