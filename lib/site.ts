export type SiteSettings = {
  companyName: string;
  legalName: string;
  shortName: string;
  brandTag: string;
  tagline: string;
  logo: string;
  description: string;
  url: string;
  email: string;
  phone: string;
  whatsapp: string;
  viber: string;
  telegram: string;
  facebook: string;
  linkedin: string;
  regNumber: string;
  exportLicense: string;
};

export const siteDefaults: SiteSettings = {
  companyName: "Pacific Global Myanmar",
  legalName: "Pacific Global Myanmar Co., Ltd.",
  shortName: "PGM",
  brandTag: "Trade & Distribution",
  tagline: "From Myanmar Fields to Global Markets",
  logo: "",
  description:
    "Pacific Global Myanmar links farmers, processors and international buyers through transparent import, export, trading and cold-chain distribution.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "trade@pgm-trading.com",
  phone: "+95 1 234 5678",
  whatsapp: "+959 123 456 789",
  viber: "+959 123 456 789",
  telegram: "pgm_trade_desk",
  facebook: "https://facebook.com/pgmtrading",
  linkedin: "https://linkedin.com/company/pgmtrading",
  regNumber: "109847291 (MyCO / DICA)",
  exportLicense: "MOC-PTK-2024/0912 (PaThaKa)",
};

export const settingsKeys = Object.keys(siteDefaults) as (keyof SiteSettings)[];

/** Bundled emblem used wherever a configured logo is missing or unreadable. */
export const brandIconFallback = "/brand-icon.png";

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