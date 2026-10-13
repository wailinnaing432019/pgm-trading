import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import type { Office, PageSection } from "@prisma/client";
import { navLinks, type SiteSettings } from "@/lib/site";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { SiteLogo } from "@/components/layout/site-logo";
import { WhatsAppIcon, ViberIcon, TelegramIcon } from "@/components/ui/trade-icons";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M13.5 21v-7h2.4l.4-2.9h-2.8V9.3c0-.8.2-1.4 1.4-1.4h1.5V5.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2H8v2.9h2.3v7h3.2z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6.9 9H4v11h2.9V9zM5.4 7.6a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zM20 13.6c0-2.8-1.5-4.1-3.5-4.1-1.6 0-2.3.9-2.7 1.5V9H11v11h2.9v-5.8c0-1 .2-2 1.5-2 1.2 0 1.6 1 1.6 2V20H20v-6.4z" />
    </svg>
  );
}

export function Footer({
  settings,
  offices,
  newsletter,
}: {
  settings: SiteSettings;
  offices: Office[];
  newsletter: PageSection | null;
}) {
  const cleanWhatsapp = (settings.whatsapp || "").replace(/[^0-9]/g, "");
  const cleanViber = (settings.viber || settings.phone || "").replace(/[^0-9]/g, "");

  return (
    <footer className="mt-auto bg-forest-950 text-cream/80">
      {/* Newsletter band */}
      <div className="border-b border-cream/10">
        <div className="section-container grid gap-6 py-12 md:grid-cols-2 md:items-center">
          <div>
            <h3 className="font-serif text-2xl font-semibold text-cream">
              {newsletter?.title ?? "Market insights, straight to your inbox"}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-cream/60">
              {newsletter?.body ?? "Seasonal produce updates, export price outlooks and trade alerts — weekly, no spam."}
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Main footer */}
      <div className="section-container grid gap-10 py-14 md:grid-cols-4 sm:grid-cols-2">
        <div className="md:col-span-1">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Home">
            <SiteLogo settings={settings} />
            <span className="leading-tight">
              <span className="block font-serif text-lg font-semibold text-cream">{settings.shortName}</span>
              <span className="block text-[11px] uppercase tracking-[0.14em] text-cream/50">
                {settings.brandTag}
              </span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/60">
            {settings.description}
          </p>

          <div className="mt-5 flex items-center gap-2.5">
            <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-800 text-cream/80 transition-colors hover:bg-gold-500 hover:text-forest-950" aria-label="Facebook">
              <FacebookIcon className="h-4 w-4" />
            </a>
            <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-800 text-cream/80 transition-colors hover:bg-gold-500 hover:text-forest-950" aria-label="LinkedIn">
              <LinkedInIcon className="h-4 w-4" />
            </a>
            {settings.telegram && (
              <a href={`https://t.me/${settings.telegram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-800 text-cream/80 transition-colors hover:bg-sky-500 hover:text-white" aria-label="Telegram">
                <TelegramIcon className="h-4 w-4" />
              </a>
            )}
            {cleanWhatsapp && (
              <a href={`https://wa.me/${cleanWhatsapp}`} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-800 text-cream/80 transition-colors hover:bg-emerald-500 hover:text-white" aria-label="WhatsApp">
                <WhatsAppIcon className="h-4 w-4" />
              </a>
            )}
            {cleanViber && (
              <a href={`viber://chat?number=%2B${cleanViber}`} className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-800 text-cream/80 transition-colors hover:bg-purple-600 hover:text-white" aria-label="Viber">
                <ViberIcon className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gold-400">Quick Links</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-gold-300">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/contact?tab=rfq" className="font-semibold text-gold-400 transition-colors hover:text-gold-300">
                Request Official RFQ →
              </Link>
            </li>
            <li>
              <Link href="/admin" className="transition-colors hover:text-gold-300">
                Admin Dashboard
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gold-400">Offices & Warehouses</h4>
          <ul className="mt-4 space-y-3 text-sm">
            {offices.map((office) => (
              <li key={office.id} className="flex gap-2 leading-relaxed">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden />
                <span>
                  <span className="font-medium text-cream">{office.name}</span>
                  <span className="block text-cream/60">{office.address}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gold-400">Trade Desk</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={`mailto:${settings.email}`} className="flex items-center gap-2 transition-colors hover:text-gold-300">
                <Mail className="h-4 w-4 text-gold-400" aria-hidden />
                {settings.email}
              </a>
            </li>
            <li>
              <a href={`tel:${settings.phone}`} className="flex items-center gap-2 transition-colors hover:text-gold-300">
                <Phone className="h-4 w-4 text-gold-400" aria-hidden />
                {settings.phone}
              </a>
            </li>
            {cleanWhatsapp && (
              <li>
                <a href={`https://wa.me/${cleanWhatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors hover:text-emerald-400">
                  <WhatsAppIcon className="h-4 w-4 text-emerald-400" />
                  <span>WhatsApp: {settings.whatsapp}</span>
                </a>
              </li>
            )}
            {cleanViber && (
              <li>
                <a href={`viber://chat?number=%2B${cleanViber}`} className="flex items-center gap-2 transition-colors hover:text-purple-300">
                  <ViberIcon className="h-4 w-4 text-purple-400" />
                  <span>Viber: {settings.viber}</span>
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Official Credentials & Compliance Strip */}
      <div className="border-t border-cream/10 bg-forest-950/80 py-4 text-xs text-cream/65">
        <div className="section-container flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
            <span className="flex items-center gap-1.5 font-semibold text-gold-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>DICA Reg: {settings.regNumber || "109847291 (MyCO)"}</span>
            </span>
            <span>MOC License: {settings.exportLicense || "MOC-PTK-2024/0912 (PaThaKa)"}</span>
            <span className="hidden sm:inline">MPBSA & MRF Trade Member</span>
            <span className="hidden md:inline">SGS / BV Quality Inspection Compliant</span>
          </div>
          <span className="text-gold-400/90 font-medium">Yangon Port & Thilawa MITT Gateways</span>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="section-container flex flex-col items-center justify-between gap-2 py-6 text-xs text-cream/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {settings.legalName}. All rights reserved.</p>
          <p>Myanmar Agricultural Import · Export · Trading · Cold-Chain Distribution</p>
        </div>
      </div>
    </footer>
  );
}