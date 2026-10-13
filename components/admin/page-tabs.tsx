"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Info,
  Briefcase,
  PhoneCall,
  SlidersHorizontal,
  ExternalLink,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionAnchor {
  id: string;
  label: string;
}

interface PageMeta {
  label: string;
  href: string;
  publicPath: string | null;
  icon: typeof Home;
  description: string;
  sections: SectionAnchor[];
}

const tabs: PageMeta[] = [
  {
    label: "Home",
    href: "/admin/pages/home",
    publicPath: "/",
    icon: Home,
    description: "Homepage hero, statistics, featured products, and supply chain.",
    sections: [
      { id: "section-hero", label: "Hero" },
      { id: "collection-animated-statistics", label: "Stats" },
      { id: "section-story", label: "Story" },
      { id: "section-storyQuote", label: "Quote" },
      { id: "section-servicesHeading", label: "Services" },
      { id: "section-productHeading", label: "Products" },
      { id: "collection-supply-chain-steps", label: "Supply Chain" },
      { id: "section-newsHeading", label: "News" },
      { id: "section-cta", label: "CTA Band" },
    ],
  },
  {
    label: "About",
    href: "/admin/pages/about",
    publicPath: "/about",
    icon: Info,
    description: "Company history, mission, vision, values, and certifications.",
    sections: [
      { id: "section-hero", label: "Hero" },
      { id: "section-story", label: "Story" },
      { id: "section-mission", label: "Mission" },
      { id: "section-vision", label: "Vision" },
      { id: "collection-core-values", label: "Values" },
      { id: "section-milestonesHeading", label: "Timeline" },
      { id: "collection-company-milestones", label: "Milestones" },
      { id: "collection-certifications-compliance-badges", label: "Certifications" },
    ],
  },
  {
    label: "Services",
    href: "/admin/pages/services",
    publicPath: "/services",
    icon: Briefcase,
    description: "Agricultural supply chain solutions and capabilities.",
    sections: [
      { id: "section-hero", label: "Hero" },
      { id: "section-servicesHeading", label: "Heading" },
      { id: "collection-services-catalog", label: "Catalog" },
      { id: "section-capabilitiesHeading", label: "Capabilities" },
      { id: "collection-capabilities-checklist", label: "Checklist" },
      { id: "section-quote", label: "Quote" },
    ],
  },
  {
    label: "Contact",
    href: "/admin/pages/contact",
    publicPath: "/contact",
    icon: PhoneCall,
    description: "Offices, branches, phone lines, and email inquiries.",
    sections: [
      { id: "section-hero", label: "Hero" },
      { id: "collection-offices-branches", label: "Offices & Branches" },
    ],
  },
  {
    label: "Brand & Settings",
    href: "/admin/pages/brand",
    publicPath: null,
    icon: SlidersHorizontal,
    description: "Global logo, brand typography, company legal name, and socials.",
    sections: [
      { id: "section-brand-settings", label: "Brand Settings" },
      { id: "section-newsletter", label: "Footer Newsletter" },
    ],
  },
];

function PageSectionToolbar({ activeTab }: { activeTab: PageMeta }) {
  const [filterQuery, setFilterQuery] = useState("");

  useEffect(() => {
    const q = filterQuery.toLowerCase().trim();
    const elements = document.querySelectorAll<HTMLElement>("[data-section-key]");

    elements.forEach((el) => {
      if (!q) {
        el.style.display = "";
        el.classList.remove("ring-2", "ring-gold-400");
      } else {
        const label = (el.getAttribute("data-section-label") || "").toLowerCase();
        const text = el.innerText.toLowerCase();
        if (label.includes(q) || text.includes(q)) {
          el.style.display = "";
          el.classList.add("ring-2", "ring-gold-400");
        } else {
          el.style.display = "none";
          el.classList.remove("ring-2", "ring-gold-400");
        }
      }
    });
  }, [filterQuery]);

  const toggleAll = (expand: boolean) => {
    const sectionElements = document.querySelectorAll<HTMLElement>("[data-section-key]");
    sectionElements.forEach((el) => {
      const btn = el.querySelector<HTMLButtonElement>("button[aria-label*='section'], button[aria-label*='item']");
      if (btn) {
        const isCurrentlyExpanded = btn.getAttribute("aria-label")?.includes("Collapse");
        if (expand && !isCurrentlyExpanded) {
          btn.click();
        } else if (!expand && isCurrentlyExpanded) {
          btn.click();
        }
      }
    });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("ring-2", "ring-gold-400");
      setTimeout(() => el.classList.remove("ring-2", "ring-gold-400"), 2000);
    }
  };

  return (
    <div className="card-surface border border-sand-200/80 bg-sand-50/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search filter input */}
        <div className="relative min-w-[240px] flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-700/40" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter sections on this page (e.g. hero, quote, steps)…"
            className="h-9 w-full rounded-full border border-sand-200 bg-white pl-9 pr-4 text-xs text-forest-950 placeholder:text-forest-700/40 focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500"
          />
          {filterQuery && (
            <button
              type="button"
              onClick={() => setFilterQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-forest-700/50 hover:text-forest-900"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick jump navigation & expand toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden items-center gap-1 sm:flex">
            <button
              type="button"
              onClick={() => toggleAll(true)}
              className="rounded px-2 py-1 text-[11px] font-medium text-forest-700/70 hover:bg-sand-100 hover:text-forest-900"
            >
              Expand All
            </button>
            <span className="text-forest-300">·</span>
            <button
              type="button"
              onClick={() => toggleAll(false)}
              className="rounded px-2 py-1 text-[11px] font-medium text-forest-700/70 hover:bg-sand-100 hover:text-forest-900"
            >
              Collapse All
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {activeTab.sections.slice(0, 6).map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollToSection(sec.id)}
                className="inline-flex items-center gap-1 rounded-md border border-sand-200 bg-white px-2.5 py-1 text-[11px] font-medium text-forest-800 transition-colors hover:border-forest-400 hover:bg-forest-50"
              >
                <span>{sec.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageTabs({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Find active tab
  const activeTab = tabs.find((t) => pathname.startsWith(t.href)) ?? tabs[0];
  const Icon = activeTab.icon;

  return (
    <div className="space-y-8">
      {/* Page Header & Live Preview Bar */}
      <div className="card-surface border border-sand-200/80 bg-gradient-to-r from-cream via-sand-50/50 to-cream p-6 shadow-sm">
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
              <span>Preview Live Page</span>
            </Link>
          )}
        </div>

        {/* Tab Switcher Pills */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-sand-200/80 pt-5">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all shadow-xs",
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

      {/* Quick Search & Section Jump Bar (keyed by pathname to reset per page) */}
      <PageSectionToolbar key={pathname} activeTab={activeTab} />

      {/* Main Page Content */}
      <div>{children}</div>
    </div>
  );
}