"use client";

import { useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { brandIconFallback } from "@/lib/site";

type BrandLogoProps = {
  /** Logo URL from the database. Empty/missing falls back to the brand emblem. */
  src?: string | null;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  style?: CSSProperties;
};

/**
 * Single source of truth for brand imagery across the public site and the
 * admin. Shows the logo configured in Brand & settings and falls back to the
 * bundled brand icon when it is missing or fails to load.
 */
export function BrandLogo({ src, alt = "", className, width, height, style }: BrandLogoProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const candidate = src?.trim();
  const href = !candidate || failedSrc === candidate ? brandIconFallback : candidate;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={href}
      alt={alt}
      width={width}
      height={height}
      style={style}
      draggable={false}
      onError={() => {
        if (candidate && href !== brandIconFallback) setFailedSrc(candidate);
      }}
      className={cn("object-contain", className)}
    />
  );
}
