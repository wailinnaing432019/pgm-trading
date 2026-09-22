import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import { getSiteSettings, getOffices, getSection } from "@/lib/queries";
import { PublicChrome } from "@/components/layout/public-chrome";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const geistSerif = Source_Serif_4({
  variable: "--font-geist-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "PGM Trading — Myanmar Agricultural Import, Export & Distribution",
    template: "%s | PGM Trading",
  },
  description:
    "Pacific Global Myanmar: agricultural import, export, trading, cold-chain distribution and contract farming — from Myanmar fields to global markets.",
  keywords: [
    "agricultural export",
    "myanmar",
    "rice export",
    "agro trading",
    "cold chain",
    "PGM Trading",
  ],
  openGraph: {
    type: "website",
    locale: "en_MM",
    siteName: "PGM Trading",
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout(props: LayoutProps<"/">) {
  const [settings, offices, newsletter] = await Promise.all([
    getSiteSettings(),
    getOffices(),
    getSection("shared", "newsletter"),
  ]);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${geistSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <PublicChrome settings={settings} offices={offices} newsletter={newsletter}>
          {props.children}
        </PublicChrome>
      </body>
    </html>
  );
}