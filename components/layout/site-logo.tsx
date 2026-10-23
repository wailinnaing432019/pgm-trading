"use client";

import { BrandLogo } from "@/components/ui/brand-logo";
import type { SiteSettings } from "@/lib/site";

export function SiteLogo({ settings }: { settings: SiteSettings }) {
  return (
    <span className="flex h-11 max-w-[200px] items-center justify-center">
      <BrandLogo src={settings.logo} className="h-11 w-auto max-w-[200px]" />
    </span>
  );
}
