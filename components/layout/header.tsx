"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Menu, Phone, X, Wheat } from "lucide-react";
import { navLinks, type SiteSettings } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Header({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Utility bar */}
      <div className="hidden bg-forest-950 text-cream/80 md:block">
        <div className="section-container flex h-9 items-center justify-between text-xs">
          <p className="flex items-center gap-2">
            <Wheat className="h-3.5 w-3.5 text-gold-400" aria-hidden />
            <span className="font-medium tracking-wide">{settings.tagline}</span>
          </p>
          <div className="flex items-center gap-6">
            <a href={`mailto:${settings.email}`} className="flex items-center gap-1.5 transition-colors hover:text-gold-300">
              <Mail className="h-3.5 w-3.5" aria-hidden />
              {settings.email}
            </a>
            <a href={`tel:${settings.phone}`} className="flex items-center gap-1.5 transition-colors hover:text-gold-300">
              <Phone className="h-3.5 w-3.5" aria-hidden />
              {settings.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="border-b border-sand-200 bg-cream/90 backdrop-blur-lg">
        <div className="section-container flex h-16 items-center justify-between md:h-[72px]">
          <Link href="/" className="flex items-center gap-2.5" aria-label={`${settings.companyName} home`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-700 text-cream">
              <Wheat className="h-5 w-5 text-gold-300" aria-hidden />
            </span>
            <span className="leading-tight">
              <span className="block font-serif text-lg font-semibold tracking-tight text-forest-950">
                {settings.shortName}
              </span>
              <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-forest-600">
                Trade & Distribution
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {navLinks.map((link) => {
              const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-forest-700 text-cream"
                      : "text-forest-800 hover:bg-forest-100"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <Button href="/contact" size="sm" variant="gold" className="ml-3">
              Get a Quote
            </Button>
          </nav>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-forest-900 transition-colors hover:bg-forest-100 lg:hidden"
            aria-expanded={open}
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open ? (
          <nav className="border-t border-sand-200 bg-cream px-5 pb-6 pt-3 lg:hidden" aria-label="Mobile">
            <ul className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block rounded-xl px-4 py-3 text-base font-medium transition-colors",
                        active ? "bg-forest-700 text-cream" : "text-forest-900 hover:bg-forest-100"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Button href="/contact" className="mt-4 w-full" onClick={() => setOpen(false)}>
              Get a Quote
            </Button>
          </nav>
        ) : null}
      </div>
    </header>
  );
}