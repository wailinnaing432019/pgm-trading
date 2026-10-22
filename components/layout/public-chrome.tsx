"use client";

import { usePathname } from "next/navigation";
import type { Office, PageSection } from "@prisma/client";
import type { SiteSettings } from "@/lib/site";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LanguageProvider } from "@/lib/i18n";
import { TradeDeskFloating } from "@/components/ui/trade-desk-floating";

type Props = {
  settings: SiteSettings;
  offices: Office[];
  newsletter: PageSection | null;
  children: React.ReactNode;
};

export function PublicChrome({ settings, offices, newsletter, children }: Props) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <LanguageProvider>
      <Header settings={settings} />
      {children}
      <Footer settings={settings} offices={offices} newsletter={newsletter} />
      <TradeDeskFloating settings={settings} />
    </LanguageProvider>
  );
}