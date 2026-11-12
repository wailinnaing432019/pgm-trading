"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, Images, X } from "lucide-react";
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
      {count > 0 && (
        <div className="mb-8">
          {/* Constrained, beautifully proportioned featured image */}
          <div className="relative overflow-hidden rounded-2xl border border-sand-200/90 bg-sand-100 shadow-xs">
            <PostMediaCarousel
              images={images}
              alt={title}
              activeIndex={heroIndex}
              onActiveIndexChange={setHeroIndex}
              onImageClick={(index) => setLightboxIndex(index)}
              showExpandHint
              priority
              sizes="(min-width: 1024px) 720px, 100vw"
              className="aspect-[16/10] max-h-[400px] w-full"
            />
          </div>

          {/* Clean thumbnail strip for multi-photo stories */}
          {count > 1 ? (
            <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-forest-700/60 mr-1 flex items-center gap-1">
                <Images className="h-3 w-3 text-gold-600" /> Gallery:
              </span>
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
                      "relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                      active
                        ? "border-gold-500 ring-2 ring-gold-400/40 opacity-100 scale-102"
                        : "border-sand-200 opacity-60 hover:opacity-100"
                    )}
                  >
                    <AssetImage
                      src={src}
                      alt={`${title} thumbnail ${index + 1}`}
                      placeholderIcon="leaf"
                      sizes="64px"
                    />
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      )}

      {/* Article Body */}
      {children}

      {/* Additional photos gallery section */}
      {gallery.length > 0 ? (
        <section className="mt-12 border-t border-sand-200/80 pt-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest-700/70">
                Photo Gallery
              </p>
              <p className="text-xs text-forest-600/70 mt-0.5">
                {gallery.length} additional photo{gallery.length === 1 ? "" : "s"} from this story
              </p>
            </div>
            <span className="text-[11px] font-medium text-forest-500 flex items-center gap-1">
              <Expand className="h-3 w-3 text-gold-600" /> Click to enlarge
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.map((src, index) => {
              const fullIndex = index + 1;
              return (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  onClick={() => setLightboxIndex(fullIndex)}
                  aria-label={`Open photo ${fullIndex + 1} of ${count} in full screen`}
                  className="group/gal relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-xl border border-sand-200 bg-sand-100 text-left transition hover:border-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                >
                  <AssetImage
                    src={src}
                    alt={`${title} — gallery photo ${fullIndex + 1}`}
                    placeholderIcon="leaf"
                    sizes="(min-width: 640px) 240px, 50vw"
                    className="transition-transform duration-500 group-hover/gal:scale-105"
                  />
                  <span className="glass-dark pointer-events-none absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-cream opacity-0 transition-opacity duration-200 group-hover/gal:opacity-100">
                    <Expand className="h-2.5 w-2.5 text-gold-300" aria-hidden />
                    {fullIndex + 1}/{count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && count > 0 ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photo gallery`}
          className="fixed inset-0 z-50 flex flex-col bg-forest-950/95 text-cream backdrop-blur-md"
          onClick={closeLightbox}
        >
          <div
            className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8 border-b border-cream/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0">
              <p className="truncate font-serif text-base font-semibold sm:text-lg">{title}</p>
              <p className="text-xs tabular-nums text-gold-300">
                Photo {lightboxIndex + 1} of {count}
              </p>
            </div>
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Close full screen gallery"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-cream transition-colors hover:bg-white/20"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-4 py-3 sm:px-14">
            <div
              className="relative flex max-h-full max-w-5xl items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[lightboxIndex]}
                alt={`${title} — photo ${lightboxIndex + 1} of ${count}`}
                className="max-h-[78vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
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
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-cream transition-colors hover:bg-white/20 sm:left-6"
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
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-cream transition-colors hover:bg-white/20 sm:right-6"
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
                        ? "border-gold-400 opacity-100 scale-105"
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
