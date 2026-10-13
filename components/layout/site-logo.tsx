"use client";

import { Wheat } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/lib/site";

export function SiteLogo({ settings }: { settings: SiteSettings }) {
  if (settings.logo) {
    return (
      <span className="flex h-11 max-w-[200px] items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={settings.logo}
          alt=""
          className="h-11 w-auto max-w-[200px] object-contain"
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
        "bg-forest-700 text-cream"
      )}
    >
      <Wheat className="h-5 w-5 text-gold-300" aria-hidden />
    </span>
  );
}