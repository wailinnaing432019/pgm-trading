"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Mail, Menu, Phone, X } from "lucide-react";
import { navLinks, type SiteSettings } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/brand-logo";
import { SiteLogo } from "@/components/layout/site-logo";
import { useLanguage } from "@/lib/i18n";
import { WhatsAppIcon, ViberIcon } from "@/components/ui/trade-icons";
import { viberHref, whatsappHref } from "@/lib/contact-links";

export function Header({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();

  const whatsappUrl = whatsappHref(settings.whatsapp);
  const viberUrl = viberHref(settings.viber || settings.phone);

  const navLabels: Record<string, string> = {
    "/": t.nav.home,
    "/about": t.nav.about,
    "/products": t.nav.products,
    "/services": t.nav.services,
    "/news": t.nav.news,
    "/contact": t.nav.contact,
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Utility bar */}
      <div className="hidden bg-forest-950 text-cream/80 md:block">
        <div className="section-container flex h-9 items-center justify-between text-xs">
          <p className="flex items-center gap-2">
            <BrandLogo src={settings.logo} className="h-6 w-auto max-w-[90px]" />
            <span className="font-medium tracking-wide">{settings.tagline}</span>
          </p>
          <div className="flex items-center gap-5">
            {/* WhatsApp direct */}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 transition-colors hover:text-emerald-400"
                title="WhatsApp Trade Desk"
              >
                <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            )}

            {/* Viber direct */}
            {viberUrl && (
              <a
                href={viberUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 transition-colors hover:text-purple-300"
                title="Viber Trade Desk"
              >
                <ViberIcon className="h-3.5 w-3.5 text-purple-400" />
                <span>Viber</span>
              </a>
            )}

            <a href={`mailto:${settings.email}`} className="flex items-center gap-1.5 transition-colors hover:text-gold-300">
              <Mail className="h-3.5 w-3.5" aria-hidden />
              {settings.email}
            </a>
            <a href={`tel:${settings.phone}`} className="flex items-center gap-1.5 transition-colors hover:text-gold-300">
              <Phone className="h-3.5 w-3.5" aria-hidden />
              {settings.phone}
            </a>

            {/* Language Switcher */}
            <div className="ml-2 flex items-center rounded-full bg-forest-900 p-0.5 border border-forest-800">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors",
                  lang === "en" ? "bg-gold-500 text-forest-950" : "text-cream/70 hover:text-cream"
                )}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("my")}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors",
                  lang === "my" ? "bg-gold-500 text-forest-950" : "text-cream/70 hover:text-cream"
                )}
              >
                မြန်မာ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="border-b border-sand-200 bg-cream/90 backdrop-blur-lg">
        <div className="section-container flex h-16 items-center justify-between md:h-[72px]">
          <Link href="/" className="flex items-center gap-2.5" aria-label={`${settings.companyName} home`}>
            <SiteLogo settings={settings} />
            <span className="leading-tight">
              <span className="block font-serif text-lg font-semibold tracking-tight text-forest-950">
                {settings.shortName}
              </span>
              <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-forest-600">
                {settings.brandTag}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {navLinks.map((link) => {
              const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              const label = navLabels[link.href] || link.label;
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
                  {label}
                </Link>
              );
            })}
            <Button href="/contact?tab=rfq" size="sm" variant="gold" className="ml-3">
              {t.nav.getQuote}
            </Button>
          </nav>

          <div className="flex items-center gap-2 lg:hidden">
            {/* Mobile language toggle */}
            <button
              type="button"
              onClick={() => setLang(lang === "en" ? "my" : "en")}
              className="flex items-center gap-1 rounded-full border border-sand-300 bg-white px-2.5 py-1 text-xs font-semibold text-forest-900"
            >
              <Globe className="h-3.5 w-3.5 text-forest-600" />
              <span>{lang === "en" ? "မြန်မာ" : "EN"}</span>
            </button>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full text-forest-900 transition-colors hover:bg-forest-100"
              aria-expanded={open}
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open ? (
          <nav className="border-t border-sand-200 bg-cream px-5 pb-6 pt-3 lg:hidden" aria-label="Mobile">
            <ul className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                const label = navLabels[link.href] || link.label;
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
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 flex flex-col gap-2">
              <Button href="/contact?tab=rfq" className="w-full" onClick={() => setOpen(false)}>
                {t.nav.getQuote}
              </Button>

              <div className="grid grid-cols-2 gap-2 pt-2">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </a>
                )}
                {viberUrl && (
                  <a
                    href={viberUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-xs font-semibold text-white"
                  >
                    <ViberIcon className="h-4 w-4" />
                    <span>Viber</span>
                  </a>
                )}
              </div>
            </div>
          </nav>
        ) : null}
      </div>
    </header>
  );
}