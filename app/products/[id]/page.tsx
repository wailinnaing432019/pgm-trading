import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Boxes,
  Check,
  FileText,
  MapPin,
  Package,
  Scale,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AssetImage } from "@/components/ui/asset-image";
import { ProductCard } from "@/components/products/product-card";
import { WhatsAppIcon, ViberIcon } from "@/components/ui/trade-icons";
import { getProductById, getProducts, getSiteSettings } from "@/lib/queries";
import { formatSpecs } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "Product not found" };

  return {
    title: product.seoTitle ?? product.title,
    description: product.seoDescription ?? product.summary,
    openGraph: { title: product.title, description: product.summary },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, settings] = await Promise.all([getProductById(id), getSiteSettings()]);
  if (!product) notFound();

  const related = await getProducts({ category: product.category?.slug, limit: 4 });
  const specs = formatSpecs(product.specs as Record<string, unknown>);
  const tradeLabels = product.tradeTypes.map((t) => t.tradeType.label);
  const cleanWhatsapp = (settings.whatsapp || "").replace(/[^0-9]/g, "");
  const cleanViber = (settings.viber || settings.phone || "").replace(/[^0-9]/g, "");
  const whatsappUrl = cleanWhatsapp
    ? `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(`Hello PGM Trade Desk, I would like to request an official quote for ${product.title} (Origin: ${product.origin ?? "Myanmar"}, Unit: ${product.unit ?? "MT"}).`)}`
    : `https://wa.me/959123456789`;
  const viberUrl = cleanViber ? `viber://chat?number=%2B${cleanViber}` : `viber://chat?number=%2B959123456789`;
  const rfqLink = `/contact?tab=rfq&subject=${encodeURIComponent(`${product.title} RFQ`)}`;

  return (
    <main className="bg-cream">
        {/* Breadcrumb */}
        <div className="border-b border-sand-200 bg-sand-50">
          <div className="section-container flex items-center gap-2 py-4 text-sm text-forest-700/70">
            <Link href="/" className="transition-colors hover:text-forest-900">Home</Link>
            <span aria-hidden>/</span>
            <Link href="/products" className="transition-colors hover:text-forest-900">Products</Link>
            <span aria-hidden>/</span>
            <Link href={`/products?category=${product.category?.slug}`} className="transition-colors hover:text-forest-900">
              {product.category?.name}
            </Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-forest-950">{product.title}</span>
          </div>
        </div>

        <section className="section-container grid gap-12 py-14 lg:grid-cols-2 lg:py-20">
          {/* Gallery */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <AssetImage src={product.images[0]} alt={product.title} placeholderIcon="leaf" priority />
            <div className="absolute left-4 top-4 flex max-w-[calc(100%-2rem)] flex-wrap gap-2">
              {tradeLabels.map((label) => (
                <Badge key={label} tone="forest">{label}</Badge>
              ))}
              {product.isFeatured ? <Badge tone="gold">Featured</Badge> : null}
            </div>
            {product.availability === 0 ? (
              <div className="absolute bottom-4 left-4 rounded-full bg-soil-700 px-3 py-1 text-xs font-semibold text-cream">
                Currently out of stock — enquire for next batch
              </div>
            ) : null}
          </div>

          {/* Summary */}
          <div className="flex flex-col">
            <h1 className="font-serif text-4xl font-semibold leading-tight text-forest-950 md:text-5xl">
              {product.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-forest-800/80">{product.summary}</p>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {product.price !== null ? (
                <div className="rounded-2xl bg-forest-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-forest-700/60">Indicative price</p>
                  <p className="mt-1 font-serif text-xl font-semibold text-forest-950">
                    USD {product.price.toLocaleString()}
                    {product.unit ? <span className="text-sm font-normal text-forest-700/60"> / {product.unit}</span> : null}
                  </p>
                </div>
              ) : null}
              {product.origin ? (
                <div className="rounded-2xl bg-forest-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-forest-700/60">Origin</p>
                  <p className="mt-1 flex items-center gap-1.5 font-medium text-forest-950">
                    <MapPin className="h-4 w-4 text-forest-700" aria-hidden /> {product.origin}
                  </p>
                </div>
              ) : null}
              <div className="rounded-2xl bg-forest-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-forest-700/60">Trading</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-forest-950">
                  <Boxes className="h-4 w-4 shrink-0 text-forest-700" aria-hidden />
                  {tradeLabels.length > 0 ? tradeLabels.join(", ") : "—"}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button href={rfqLink} size="lg" variant="gold" className="flex-1">
                  <Send className="h-4 w-4" aria-hidden /> Request Official RFQ (FOB / CIF)
                </Button>
                <Button href="/contact?subject=General%20trade%20enquiry" size="lg" variant="outline">
                  Talk to Export Desk
                </Button>
              </div>

              {/* Instant Messenger Shortcuts for International & Myanmar Traders */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  <span>Trade via WhatsApp</span>
                </a>
                <a
                  href={viberUrl}
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-purple-700 hover:shadow"
                >
                  <ViberIcon className="h-4 w-4" />
                  <span>Trade via Viber</span>
                </a>
              </div>
            </div>

            <a href={`tel:${settings.phone}`} className="mt-4 text-sm text-forest-700/70">
              Prefer to talk? Call {settings.phone}
            </a>
          </div>
        </section>

        {/* Description + specs */}
        <section className="border-t border-sand-200 bg-sand-50 py-14">
          <div className="section-container grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-forest-950">Product Description</h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-forest-800/85">
                {product.description}
              </p>

              <div className="mt-8 flex items-center gap-3 rounded-2xl bg-forest-700 p-5 text-cream">
                <FileText className="h-8 w-8 shrink-0 text-gold-300" aria-hidden />
                <p className="text-sm leading-relaxed">
                  Full specification sheets, lab reports and load samples are available on request from our
                  export desk.
                </p>
              </div>
            </div>

            {specs.length > 0 ? (
              <div className="card-surface overflow-hidden">
                <div className="border-b border-sand-200 bg-cream px-6 py-4">
                  <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-forest-950">
                    <Scale className="h-5 w-5 text-forest-700" aria-hidden /> Specifications & Packaging
                  </h3>
                </div>
                <dl className="divide-y divide-sand-200">
                  {specs.map(({ key, value }) => (
                    <div key={key} className="flex items-start justify-between gap-4 bg-cream px-6 py-3.5">
                      <dt className="text-sm font-medium text-forest-800/70">{key}</dt>
                      <dd className="flex items-center gap-1.5 text-right text-sm font-medium text-forest-950">
                        <Check className="h-3.5 w-3.5 text-forest-600" aria-hidden /> {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>
        </section>

        {/* Related */}
        {related.items.length > 1 ? (
          <section className="py-16">
            <div className="section-container">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-semibold text-forest-950">Related Products</h2>
                <Button href={`/products?category=${product.category?.slug}`} variant="ghost" className="pr-0">
                  <Package className="mr-1 h-4 w-4" aria-hidden /> View category
                </Button>
              </div>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {related.items
                  .filter((p) => p.id !== product.id)
                  .slice(0, 3)
                  .map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
              </div>
            </div>
          </section>
        ) : null}

        <div className="pb-16">
          <div className="section-container">
            <Button href="/products" variant="ghost">
              <ArrowLeft className="h-4 w-4" aria-hidden /> Back to catalog
            </Button>
          </div>
        </div>
      </main>
  );
}