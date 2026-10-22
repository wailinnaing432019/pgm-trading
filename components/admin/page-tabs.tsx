"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Info,
  Briefcase,
  PhoneCall,
  SlidersHorizontal,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PageMeta {
  label: string;
  href: string;
  publicPath: string | null;
  icon: typeof Home;
  description: string;
}

const tabs: PageMeta[] = [
  {
    label: "Home",
    href: "/admin/pages/home",
    publicPath: "/",
    icon: Home,
    description: "Homepage hero, statistics, featured products, and supply chain.",
  },
  {
    label: "About",
    href: "/admin/pages/about",
    publicPath: "/about",
    icon: Info,
    description: "Company history, mission, vision, values, and certifications.",
  },
  {
    label: "Services",
    href: "/admin/pages/services",
    publicPath: "/services",
    icon: Briefcase,
    description: "Agricultural supply chain solutions and capabilities.",
  },
  {
    label: "Contact",
    href: "/admin/pages/contact",
    publicPath: "/contact",
    icon: PhoneCall,
    description: "Offices, branches, phone lines, and email inquiries.",
  },
  {
    label: "Brand & Settings",
    href: "/admin/pages/brand",
    publicPath: null,
    icon: SlidersHorizontal,
    description: "Global logo, brand typography, company legal name, and socials.",
  },
];

export function PageTabs({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeTab = tabs.find((tab) => pathname.startsWith(tab.href)) ?? tabs[0];
  const Icon = activeTab.icon;

  return (
    <div className="space-y-6">
      {/* Page header + tab switcher */}
      <div className="card-surface border border-sand-200/80 bg-gradient-to-r from-cream via-sand-50/50 to-cream p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-700 text-gold-300 shadow-sm">
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-serif text-2xl font-semibold text-forest-950">
                  {activeTab.label}
                </h1>
                {activeTab.publicPath !== null ? (
                  <span className="rounded-full bg-forest-100 px-2.5 py-0.5 font-mono text-xs font-medium text-forest-800">
                    Live route: {activeTab.publicPath}
                  </span>
                ) : (
                  <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-xs font-medium text-gold-800">
                    Shared Global
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-forest-700/80">{activeTab.description}</p>
            </div>
          </div>

          {activeTab.publicPath !== null && (
            <Link
              href={activeTab.publicPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-forest-600/20 bg-white px-4 py-2 text-xs font-semibold text-forest-800 shadow-sm transition-all hover:bg-forest-700 hover:text-cream hover:shadow-md"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              <span>View saved page</span>
            </Link>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-sand-200/80 pt-5">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-xs transition-all",
                  active
                    ? "bg-forest-700 text-cream shadow-sm"
                    : "bg-white text-forest-800 ring-1 ring-sand-200 hover:bg-forest-50 hover:text-forest-950"
                )}
              >
                <TabIcon className={cn("h-3.5 w-3.5", active ? "text-gold-300" : "text-forest-600")} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {children}
    </div>
  );
}
