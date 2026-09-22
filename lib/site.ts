export type SiteSettings = {
  companyName: string;
  legalName: string;
  shortName: string;
  tagline: string;
  description: string;
  url: string;
  email: string;
  phone: string;
  whatsapp: string;
  facebook: string;
  linkedin: string;
};

export const siteDefaults: SiteSettings = {
  companyName: "Pacific Global Myanmar",
  legalName: "Pacific Global Myanmar Co., Ltd.",
  shortName: "PGM",
  tagline: "From Myanmar Fields to Global Markets",
  description:
    "Pacific Global Myanmar links farmers, processors and international buyers through transparent import, export, trading and cold-chain distribution.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "trade@pgm-trading.com",
  phone: "+95 1 234 5678",
  whatsapp: "+959 123 456 789",
  facebook: "https://facebook.com/pgmtrading",
  linkedin: "https://linkedin.com/company/pgmtrading",
};

export const settingsKeys = Object.keys(siteDefaults) as (keyof SiteSettings)[];

/** Merge raw StiteSetting meta over the defaults, dropping unknown keys. */
export function resolveSettings(meta: unknown): SiteSettings {
  const source = (meta ?? {}) as Record<string, unknown>;
  const resolved = { ...siteDefaults };
  for (const key of settingsKeys) {
    const value = source[key];
    if (typeof value === "string" && value.trim().length > 0) {
      resolved[key] = value.trim();
    }
  }
  return resolved;
}

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Services", href: "/services" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
] as const;

export const tradeTypes = [
  { label: "Export", value: "EXPORT" },
  { label: "Import", value: "IMPORT" },
  { label: "Both", value: "BOTH" },
] as const;