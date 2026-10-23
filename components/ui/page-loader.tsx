"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/brand-logo";

type PageLoaderProps = {
  /** Surface the loader sits on. */
  variant?: "light" | "dark";
  /** Fill the viewport instead of sitting inside an existing shell. */
  fullscreen?: boolean;
  label?: string;
};

/**
 * Brand page loader: the logo configured in the admin (served through
 * /api/brand-icon, which falls back to the bundled emblem) sits tight inside a
 * gradient ring whose arrow-head tip orbits around it.
 */
export function PageLoader({
  variant = "light",
  fullscreen = false,
  label = "Loading",
}: PageLoaderProps) {
  const isDark = variant === "dark";
  // SVG paint servers need unique, selector-safe ids.
  const gradientId = `brand-loader${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        "flex w-full items-center justify-center px-6",
        fullscreen ? "min-h-screen py-16" : "min-h-[55vh] py-16",
        isDark ? "bg-forest-950" : "bg-transparent"
      )}
    >
      <div className="relative grid h-24 w-24 place-items-center">
        {/* Breathing halo */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-3 rounded-full blur-lg animate-loader-breathe",
            isDark ? "bg-gold-500/25" : "bg-forest-500/15"
          )}
        />

        {/* Spinning gradient ring with arrow head — hugs the mark */}
        <svg
          viewBox="0 0 96 96"
          className="absolute inset-0 h-full w-full animate-loader-spin motion-reduce:animate-none"
          aria-hidden
        >
          <defs>
            <linearGradient
              id={gradientId}
              x1="22"
              y1="6"
              x2="82"
              y2="90"
              gradientUnits="userSpaceOnUse"
            >
              {isDark ? (
                <>
                  <stop offset="0%" stopColor="#f9eec9" />
                  <stop offset="45%" stopColor="#e9c65f" />
                  <stop offset="100%" stopColor="#c19a57" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#9cc1a3" />
                  <stop offset="42%" stopColor="#30543d" />
                  <stop offset="100%" stopColor="#dfae3a" />
                </>
              )}
            </linearGradient>
          </defs>

          {/* Faint track */}
          <circle
            cx="48"
            cy="48"
            r="42"
            fill="none"
            strokeWidth="3.5"
            stroke={isDark ? "rgb(250 248 242 / 0.10)" : "rgb(17 31 23 / 0.06)"}
          />

          {/* Open arc */}
          <path
            d="M48 6 A42 42 0 1 1 6 48"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Arrow head continuing the arc's direction */}
          <path d="M6 36.5 L1 48 L11 48 Z" fill={`url(#${gradientId})`} />
        </svg>

        {/* Brand icon — no white plate, transparent padding is optically trimmed */}
        <BrandLogo
          src="/api/brand-icon"
          width={80}
          height={80}
          className={cn(
            "relative h-20 w-20",
            isDark
              ? "drop-shadow-[0_6px_18px_rgb(0_0_0/0.55)]"
              : "drop-shadow-[0_6px_16px_rgb(17_31_23/0.18)]"
          )}
          style={{ transform: "translate(1.9px, -1.2px)" }}
        />

        <span className="sr-only">{label}…</span>
      </div>
    </div>
  );
}
