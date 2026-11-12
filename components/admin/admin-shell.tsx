"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderTree,
  Inbox,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Package,
  PanelLeft,
  Settings,
  ShieldCheck,
  Tags,
  UserCircle,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/brand-logo";
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
  { label: "Pages & Contents Setup", href: "/admin/pages/home", icon: Settings, match: "/admin/pages" },
  { label: "News & Media", href: "/admin/news", icon: Newspaper },
  { label: "Inquiries", href: "/admin/inquiries", icon: Inbox },
  { label: "Admin Accounts", href: "/admin/admins", icon: Users },
  { label: "My Profile", href: "/admin/profile", icon: UserCircle },
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
  userRole = "ADMIN",
  logo,
}: {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  userRole?: "ADMIN" | "SUPER_ADMIN";
  logo?: string;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-sand-50">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-forest-950 text-cream md:flex">
        <Link href="/admin" className="flex items-center gap-2.5 px-6 py-5">
          <BrandLogo
            src={logo}
            className={logo ? "h-8 w-auto max-w-[140px]" : "h-9 w-9"}
          />
          <span className="leading-tight">
            <span className="block font-serif text-base font-semibold">PGM Admin</span>
            <span className="block text-[11px] uppercase tracking-wider text-cream/50">CMS &middot; v1.1.1</span>
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

        <div className="border-t border-cream/10 p-3">
          <div className="flex items-center justify-between gap-2 rounded-xl bg-forest-900/60 p-2">
            <Link
              href="/admin/profile"
              title="Manage your profile"
              className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1 transition hover:bg-forest-800/80"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-forest-800 text-gold-300">
                {userRole === "SUPER_ADMIN" ? (
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                ) : (
                  <UserCircle className="h-4 w-4" aria-hidden />
                )}
              </div>
              <div className="min-w-0 flex-1 text-left leading-tight">
                <p className="truncate text-xs font-semibold text-cream group-hover:text-gold-200">
                  {userName}
                </p>
                <p className="truncate text-[10px] text-cream/50">
                  {userRole === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                </p>
              </div>
            </Link>
            <form action={logoutAdmin} className="shrink-0">
              <button
                type="submit"
                title="Sign out"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-cream/60 transition hover:bg-forest-800 hover:text-rose-300"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                <span className="sr-only">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-sand-200 bg-cream/90 backdrop-blur-lg">
          <div className="flex h-16 items-center justify-between px-5 md:px-8">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 md:hidden">
                <BrandLogo
                  src={logo}
                  className={logo ? "h-7 w-auto max-w-[120px]" : "h-7 w-7"}
                />
                <span className="font-serif text-sm font-semibold text-forest-950">PGM Admin</span>
              </div>
              <div className="hidden items-center gap-2 text-xs font-medium text-forest-700/70 md:flex">
                <span className="font-serif text-sm font-semibold text-forest-950">PGM Admin CMS</span>
                <span className="text-sand-300">/</span>
                <span>Management Portal</span>
              </div>
            </div>

            {/* Combined User Info & Sign Out */}
            <div className="flex items-center rounded-full border border-sand-300 bg-white/90 shadow-xs backdrop-blur-xs">
              <Link
                href="/admin/profile"
                title="Manage your profile & password"
                className="group flex items-center gap-2.5 py-1 pl-1.5 pr-3 transition hover:opacity-85"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-900 text-gold-300">
                  {userRole === "SUPER_ADMIN" ? (
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                  ) : (
                    <UserCircle className="h-3.5 w-3.5" aria-hidden />
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold leading-tight text-forest-950 group-hover:text-forest-800">
                      {userName}
                    </span>
                    <span className="rounded-full bg-forest-100 px-1.5 py-0.2 text-[9px] font-semibold text-forest-800">
                      {userRole === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                    </span>
                  </div>
                  <span className="hidden text-[10px] leading-tight text-forest-600/70 sm:inline truncate max-w-[160px]">
                    {userEmail}
                  </span>
                </div>
              </Link>

              <div className="h-5 w-px bg-sand-200" aria-hidden="true" />

              <form action={logoutAdmin}>
                <button
                  type="submit"
                  title="Sign out"
                  className="inline-flex items-center gap-1.5 rounded-r-full px-3 py-1.5 text-xs font-medium text-forest-700 transition hover:bg-rose-50 hover:text-rose-700"
                >
                  <LogOut className="h-3.5 w-3.5 text-forest-500" aria-hidden />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </form>
            </div>
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