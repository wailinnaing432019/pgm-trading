"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  FolderTree,
  Inbox,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Package,
  PanelLeft,
  Settings,
  Tags,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAdmin } from "@/lib/actions/admin";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /**
   * Path prefix that keeps this item highlighted on sibling/nested routes.
   * Pages lives at /admin/pages/home but must stay active on /admin/pages/about, etc.
   */
  match?: string;
};

const nav: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Trade Types", href: "/admin/trade-types", icon: Tags },
  { label: "Pages & Content", href: "/admin/pages/home", icon: Settings, match: "/admin/pages" },
  { label: "News & Media", href: "/admin/news", icon: Newspaper },
  { label: "Inquiries", href: "/admin/inquiries", icon: Inbox },
];

function isNavActive(item: NavItem, pathname: string) {
  if (item.href === "/admin") return pathname === "/admin";
  const prefix = item.match ?? item.href;
  return (
    pathname === item.href ||
    pathname === prefix ||
    pathname.startsWith(`${prefix}/`)
  );
}

export function AdminShell({
  children,
  userName,
  userEmail,
  logo,
}: {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  logo?: string;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-sand-50">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-forest-950 text-cream md:flex">
        <Link href="/admin" className="flex items-center gap-2.5 px-6 py-5">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" className="h-8 w-auto max-w-[140px] object-contain" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-800 text-gold-300">
              <Wheat className="h-5 w-5" aria-hidden />
            </span>
          )}
          <span className="leading-tight">
            <span className="block font-serif text-base font-semibold">PGM Admin</span>
            <span className="block text-[11px] uppercase tracking-wider text-cream/50">CMS</span>
          </span>
        </Link>

        <nav className="mt-4 flex-1 space-y-1 px-3" aria-label="Admin">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-forest-800 text-gold-300" : "text-cream/70 hover:bg-forest-900 hover:text-cream"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-cream/70 transition-colors hover:bg-forest-900 hover:text-cream"
          >
            <PanelLeft className="h-4 w-4" aria-hidden />
            View Site
          </Link>
        </nav>

        <div className="border-t border-cream/10 p-4">
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-cream/70 transition-colors hover:bg-forest-900 hover:text-cream"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-sand-200 bg-cream/90 backdrop-blur-lg">
          <div className="flex h-16 items-center justify-between px-5 md:px-8">
            <p className="text-sm font-medium text-forest-700/70">
              Signed in as <span className="font-semibold text-forest-950">{userName}</span>
              <span className="ml-2 hidden text-forest-700/50 sm:inline">{userEmail}</span>
            </p>
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-sand-300 px-4 py-2 text-sm font-medium text-forest-800 transition-colors hover:bg-forest-50 md:hidden"
              >
                <LogOut className="h-4 w-4" aria-hidden /> Sign out
              </button>
            </form>
            <span className="hidden items-center gap-2 rounded-full bg-forest-700 px-3.5 py-1.5 text-xs font-semibold text-cream md:inline-flex">
              <FileText className="h-3.5 w-3.5" aria-hidden /> {userName}
            </span>
          </div>

          {/* Mobile nav */}
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:hidden" aria-label="Admin mobile">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(item, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-colors",
                    active ? "bg-forest-700 text-cream" : "bg-white text-forest-800 ring-1 ring-sand-200"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden /> {item.label}
                </Link>
              );
            })}
            <Link href="/" className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-medium text-forest-800 ring-1 ring-sand-200">
              <PanelLeft className="h-3.5 w-3.5" aria-hidden /> View Site
            </Link>
          </nav>
        </header>
        <main className="flex-1 px-5 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}