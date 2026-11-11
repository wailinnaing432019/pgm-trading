"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useInView, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, Images } from "lucide-react";
import { AssetImage } from "@/components/ui/asset-image";
import { cn } from "@/lib/utils";

type PostMediaCarouselProps = {
  images: string[];
  alt: string;
  href?: string;
  onImageClick?: (index: number) => void;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  className?: string;
  sizes?: string;
  priority?: boolean;
  compact?: boolean;
  intervalMs?: number;
  startDelayMs?: number;
  placeholderIcon?: "leaf" | "package" | "crop";
  showExpandHint?: boolean;
};

export function PostMediaCarousel({
  images,
  alt,
  href,
  onImageClick,
  activeIndex,
  onActiveIndexChange,
  className,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  compact = false,
  intervalMs = 3800,
  startDelayMs = 0,
  placeholderIcon = "leaf",
  showExpandHint = false,
}: PostMediaCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const inView = useInView(containerRef, { amount: 0.2 });
  const prefersReducedMotion = useReducedMotion();

  const [internalIndex, setInternalIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = images.length;
  const isControlled = activeIndex !== undefined;
  const rawIndex = isControlled ? activeIndex : internalIndex;
  const current = count > 0 ? ((rawIndex % count) + count) % count : 0;

  const setCurrent = useCallback(
    (updater: number | ((prev: number) => number)) => {
      if (count === 0) return;
      if (isControlled) {
        const next = typeof updater === "function" ? updater(current) : updater;
        onActiveIndexChange?.(((next % count) + count) % count);
      } else {
        setInternalIndex((prev) => {
          const normalizedPrev = ((prev % count) + count) % count;
          const next = typeof updater === "function" ? updater(normalizedPrev) : updater;
          return ((next % count) + count) % count;
        });
      }
    },
    [count, current, isControlled, onActiveIndexChange]
  );

  useEffect(() => {
    if (count <= 1 || !inView || paused || prefersReducedMotion) return;

    let intervalId: ReturnType<typeof setInterval> | undefined;
    const startTimer = setTimeout(() => {
      intervalId = setInterval(() => {
        setCurrent((prev) => (prev + 1) % count);
      }, intervalMs);
    }, startDelayMs);

    return () => {
      clearTimeout(startTimer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [count, inView, paused, prefersReducedMotion, intervalMs, startDelayMs, setCurrent]);

  function goPrev(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setCurrent((prev) => (prev - 1 + count) % count);
  }

  function goNext(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setCurrent((prev) => (prev + 1) % count);
  }

  function goTo(index: number, event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setCurrent(index);
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    if (count <= 1 || compact) return;
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (count <= 1 || compact || touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 36) return;
    if (delta > 0) {
      setCurrent((prev) => (prev - 1 + count) % count);
    } else {
      setCurrent((prev) => (prev + 1) % count);
    }
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={cn("group/media relative overflow-hidden bg-sand-100", className)}
    >
      {count === 0 ? (
        <AssetImage
          src={null}
          alt={alt}
          placeholderIcon={placeholderIcon}
          className="h-full w-full"
        />
      ) : (
        images.map((src, index) => {
          const isActive = index === current;
          return (
            <div
              key={`${src}-${index}`}
              aria-hidden={!isActive}
              className={cn(
                "absolute inset-0 transition-all duration-700 ease-out",
                isActive
                  ? "z-[1] scale-100 opacity-100"
                  : "pointer-events-none z-0 scale-[1.04] opacity-0"
              )}
            >
              <AssetImage
                src={src}
                alt={isActive ? `${alt}${count > 1 ? ` — photo ${index + 1} of ${count}` : ""}` : ""}
                placeholderIcon={placeholderIcon}
                priority={priority && index === 0}
                sizes={sizes}
                className="transition-transform duration-700 ease-out group-hover/media:scale-[1.03]"
              />
            </div>
          );
        })
      )}

      {/* Navigation or lightbox trigger sits on its own layer, never wrapping control buttons */}
      {href ? (
        <Link
          href={href}
          aria-label={`Read article: ${alt}`}
          className="absolute inset-0 z-[2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-400"
        />
      ) : onImageClick && count > 0 ? (
        <button
          type="button"
          onClick={() => onImageClick(current)}
          aria-label={`View photo ${current + 1} of ${count} in full screen`}
          className="absolute inset-0 z-[2] cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-400"
        />
      ) : null}

      {/* Scrim for high-contrast dots & badges */}
      {count > 1 && !compact ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-24 bg-gradient-to-t from-forest-950/65 via-forest-950/20 to-transparent"
          aria-hidden
        />
      ) : null}

      {/* Photo count badge */}
      {count > 1 ? (
        compact ? (
          <span className="glass-dark pointer-events-none absolute bottom-1.5 right-1.5 z-10 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-cream">
            <Images className="h-2.5 w-2.5 text-gold-300" aria-hidden />
            {count}
          </span>
        ) : (
          <div className="pointer-events-none absolute right-3.5 top-3.5 z-10 flex items-center gap-2">
            {showExpandHint && onImageClick ? (
              <span className="glass-dark hidden items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-cream/90 opacity-0 transition-opacity duration-200 group-hover/media:opacity-100 sm:inline-flex">
                <Expand className="h-3 w-3 text-gold-300" aria-hidden />
                Fullscreen
              </span>
            ) : null}
            <span className="glass-dark inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tabular-nums text-cream">
              <Images className="h-3.5 w-3.5 text-gold-300" aria-hidden />
              {current + 1} / {count}
            </span>
          </div>
        )
      ) : showExpandHint && onImageClick && count === 1 ? (
        <span className="glass-dark pointer-events-none absolute right-3.5 top-3.5 z-10 hidden items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-cream/90 opacity-0 transition-opacity duration-200 group-hover/media:opacity-100 sm:inline-flex">
          <Expand className="h-3 w-3 text-gold-300" aria-hidden />
          Fullscreen
        </span>
      ) : null}

      {/* Prev / Next controls and indicator dots */}
      {count > 1 && !compact ? (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous photo"
            className="glass-dark absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-cream transition-all duration-200 hover:bg-forest-950/85 focus-visible:opacity-100 md:opacity-0 md:group-hover/media:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next photo"
            className="glass-dark absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-cream transition-all duration-200 hover:bg-forest-950/85 focus-visible:opacity-100 md:opacity-0 md:group-hover/media:opacity-100"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>

          <div
            className="absolute inset-x-0 bottom-3.5 z-10 flex items-center justify-center gap-1.5 px-4"
            role="tablist"
            aria-label="Article photos"
          >
            {images.map((_, index) => {
              const active = index === current;
              return (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`Show photo ${index + 1} of ${count}`}
                  onClick={(e) => goTo(index, e)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    active
                      ? "w-6 bg-gold-400 shadow-sm"
                      : "w-2 bg-cream/65 hover:bg-cream"
                  )}
                />
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

