import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import { getSiteSettings, getOffices, getSection } from "@/lib/queries";
import { PublicChrome } from "@/components/layout/public-chrome";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const geistSerif = Source_Serif_4({
  variable: "--font-geist-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  // Bust the browser favicon cache whenever the admin changes the brand icon.
  const iconHref = `/api/brand-icon?v=${encodeURIComponent(settings.logo || "fallback")}`;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: {
      default: "Pacific Global Myanmar",
      template: "%s | Pacific Global Myanmar",
    },
    description:
      "Pacific Global Myanmar: agricultural import, export, trading, cold-chain distribution and contract farming — from Myanmar fields to global markets.",
    keywords: [
      "agricultural export",
      "myanmar agricultural trading",
      "rice export myanmar",
      "agro commodities",
      "cold chain distribution",
      "Pacific Global Myanmar",
      "PGM Trading",
    ],
    alternates: {
      canonical: "./",
    },
    openGraph: {
      type: "website",
      locale: "en_MM",
      siteName: "Pacific Global Myanmar",
    },
    icons: {
      icon: iconHref,
      shortcut: iconHref,
      apple: iconHref,
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout(props: LayoutProps<"/">) {
  const [settings, offices, newsletter] = await Promise.all([
    getSiteSettings(),
    getOffices(),
    getSection("shared", "newsletter"),
  ]);

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Pacific Global Myanmar",
        alternateName: "PGM Trading",
        url: siteUrl,
        logo: `${siteUrl}/api/brand-icon`,
        description:
          "Pacific Global Myanmar is a leading agricultural trading, export, cold-chain logistics, and farm management enterprise connecting Myanmar with international markets.",
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: settings.phone || "+959123456789",
            contactType: "customer service",
            availableLanguage: ["English", "Burmese"],
          },
        ],
      },
      {
        "@type": "LocalBusiness",
        "@id": `${siteUrl}/#localbusiness`,
        name: "Pacific Global Myanmar",
        image: `${siteUrl}/api/brand-icon`,
        url: siteUrl,
        telephone: settings.phone || "+959123456789",
        email: settings.email || "trade@pgm-trading.com",
        address: {
          "@type": "PostalAddress",
          streetAddress: offices[0]?.address || "Yangon, Myanmar",
          addressLocality: "Yangon",
          addressCountry: "MM",
        },
        priceRange: "$$",
      },
    ],
  };

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${geistSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <PublicChrome settings={settings} offices={offices} newsletter={newsletter}>
          {props.children}
        </PublicChrome>
      </body>
    </html>
  );
}