"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Check,
  ExternalLink,
  Home,
  Info,
  PhoneCall,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type PageTabProgress = {
  done: number;
  total: number;
};

interface PageMeta {
  key: "home" | "about" | "services" | "contact" | "brand";
  label: string;
  publicLabel: string;
  href: string;
  publicPath: string | null;
  icon: typeof Home;
  description: string;
}

const tabs: PageMeta[] = [
  {
    key: "home",
    label: "Home Page",
    publicLabel: "Homepage (/)",
    href: "/admin/pages/home",
    publicPath: "/",
    icon: Home,
    description: "Top welcome banner, business statistics, company story, and homepage headings.",
  },
  {
    key: "about",
    label: "About Us",
    publicLabel: "About Us (/about)",
    href: "/admin/pages/about",
    publicPath: "/about",
    icon: Info,
    description: "Company story, mission & vision, core values, timeline, and certifications.",
  },
  {
    key: "services",
    label: "Services",
    publicLabel: "Services (/services)",
    href: "/admin/pages/services",
    publicPath: "/services",
    icon: Briefcase,
    description: "Service cards, shipment capabilities checklist, and logistics highlight quote.",
  },
  {
    key: "contact",
    label: "Contact & Offices",
    publicLabel: "Contact Us (/contact)",
    href: "/admin/pages/contact",
    publicPath: "/contact",
    icon: PhoneCall,
    description: "Office locations, branch phone numbers, and official trade credentials.",
  },
  {
    key: "brand",
    label: "Brand & Footer",
    publicLabel: "Across Entire Website",
    href: "/admin/pages/brand",
    publicPath: null,
    icon: SlidersHorizontal,
    description: "Company logo, name, contact channels, social links, and footer newsletter.",
  },
];

export function PageTabs({
  children,
  progress,
}: {
  children: React.ReactNode;
  progress?: Record<string, PageTabProgress>;
}) {
  const pathname = usePathname();
  const activeTab = tabs.find((tab) => pathname.startsWith(tab.href)) ?? tabs[0];
  const Icon = activeTab.icon;
  const activeProgress = progress?.[activeTab.key];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Page header + tab switcher */}
      <div className="card-surface overflow-hidden border border-sand-200/80 bg-gradient-to-br from-cream via-white to-sand-50/60 shadow-sm">
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 sm:items-center">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-forest-700 text-gold-300 shadow-sm">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-700">
                    Website Content
                  </span>
                  <span className="text-sand-300" aria-hidden>
                    /
                  </span>
                  <span className="rounded-full bg-forest-50 px-2.5 py-0.5 text-xs font-medium text-forest-800 ring-1 ring-forest-200/70">
                    {activeTab.publicLabel}
                  </span>
                  {activeProgress ? (
                    <span className="rounded-full bg-sand-100 px-2.5 py-0.5 text-xs font-medium tabular-nums text-forest-700">
                      {activeProgress.done} of {activeProgress.total} blocks customized
                    </span>
                  ) : null}
                </div>
                <h1 className="mt-1 font-serif text-2xl font-semibold text-forest-950">
                  {activeTab.label}
                </h1>
                <p className="mt-0.5 text-sm text-forest-700/80">{activeTab.description}</p>
              </div>
            </div>

            {activeTab.publicPath !== null ? (
              <Link
                href={activeTab.publicPath}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-forest-600/20 bg-white px-4 py-2 text-xs font-semibold text-forest-800 shadow-xs transition-all hover:bg-forest-700 hover:text-cream hover:shadow-md"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span>Preview live page</span>
              </Link>
            ) : (
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-forest-600/20 bg-white px-4 py-2 text-xs font-semibold text-forest-800 shadow-xs transition-all hover:bg-forest-700 hover:text-cream hover:shadow-md"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span>Visit website</span>
              </Link>
            )}
          </div>
        </div>

        {/* Horizontal swipeable / responsive page tabs */}
        <nav
          aria-label="Website pages"
          className="flex gap-2 overflow-x-auto border-t border-sand-200/80 bg-sand-50/60 px-4 py-3 sm:px-6"
        >
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const active = pathname.startsWith(tab.href);
            const stat = progress?.[tab.key];
            const complete = Boolean(stat && stat.total > 0 && stat.done >= stat.total);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                title={tab.description}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition-all",
                  active
                    ? "bg-forest-700 text-cream shadow-sm"
                    : "bg-white text-forest-800 ring-1 ring-sand-200 hover:bg-forest-50 hover:text-forest-950"
                )}
              >
                <TabIcon
                  className={cn("h-3.5 w-3.5", active ? "text-gold-300" : "text-forest-600")}
                  aria-hidden
                />
                <span>{tab.label}</span>
                {stat ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                      active
                        ? complete
                          ? "bg-gold-400 text-forest-950"
                          : "bg-cream/20 text-cream"
                        : complete
                          ? "bg-forest-100 text-forest-800"
                          : "bg-sand-100 text-forest-700/75"
                    )}
                  >
                    {complete ? (
                      <>
                        <Check className="h-2.5 w-2.5" aria-hidden /> All
                      </>
                    ) : (
                      `${stat.done}/${stat.total}`
                    )}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      {children}
    </div>
  );
}
