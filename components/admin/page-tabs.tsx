"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Home", href: "/admin/pages/home" },
  { label: "About", href: "/admin/pages/about" },
  { label: "Services", href: "/admin/pages/services" },
  { label: "Contact", href: "/admin/pages/contact" },
  { label: "Brand & Settings", href: "/admin/pages/brand" },
];

export function PageTabs({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-forest-700 text-cream"
                  : "bg-white text-forest-800 ring-1 ring-sand-200 hover:bg-forest-50"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}