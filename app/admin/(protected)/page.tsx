import Link from "next/link";
import {
  ArrowUpRight,
  Boxes,
  FolderTree,
  Inbox,
  MailPlus,
  MapPinned,
  Newspaper,
  PackagePlus,
  Star,
} from "lucide-react";
import { getAdminStats, getAdminInquiries } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const [stats, inquiries] = await Promise.all([getAdminStats(), getAdminInquiries("NEW")]);

  const cards = [
    { label: "Products", value: stats.products, href: "/admin/products", icon: Boxes },
    { label: "Articles", value: stats.blogs, href: "/admin/news", icon: Newspaper },
    { label: "Services", value: stats.services, href: "/admin/pages/services", icon: FolderTree },
    { label: "Offices & Branches", value: stats.offices, href: "/admin/pages/contact", icon: MapPinned },
    { label: "Newsletter subs", value: stats.newsletters, href: "/admin/inquiries", icon: MailPlus },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-forest-950">Dashboard</h1>
          <p className="mt-1 text-sm text-forest-700/70">Everything your editors need, in one place.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-full bg-forest-700 px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-forest-800"
        >
          <PackagePlus className="h-4 w-4" aria-hidden /> Add Product
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href} className="card-surface group flex items-center gap-4 p-6 transition-all hover:-translate-y-0.5 hover:shadow-lift">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-100 text-forest-700 transition-colors group-hover:bg-forest-700 group-hover:text-gold-300">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <span>
                <span className="block font-serif text-2xl font-semibold text-forest-950">{card.value}</span>
                <span className="block text-sm text-forest-700/70">{card.label}</span>
              </span>
            </Link>
          );
        })}
      </div>

      {/* New inquiries */}
      <div className="card-surface mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-sand-200 px-6 py-4">
          <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-forest-950">
            <Inbox className="h-5 w-5 text-forest-700" aria-hidden />
            New inquiries
            <span className="rounded-full bg-gold-100 px-2 py-0.5 text-xs font-bold text-gold-700">
              {stats.pendingInquiries}
            </span>
          </h2>
          <Link href="/admin/inquiries" className="inline-flex items-center gap-1 text-sm font-semibold text-forest-700 hover:text-forest-900">
            Manage <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {inquiries.length > 0 ? (
          <ul className="divide-y divide-sand-200">
            {inquiries.slice(0, 5).map((inquiry) => (
              <li key={inquiry.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div className="min-w-0">
                  <p className="font-medium text-forest-950">
                    {inquiry.subject}
                    <span className="ml-2 text-sm font-normal text-forest-700/60">— {inquiry.name}</span>
                  </p>
                  <p className="mt-0.5 text-sm text-forest-700/70">{formatDate(inquiry.createdAt)}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-soil-100 px-3 py-1 text-xs font-semibold text-soil-800">
                  <Star className="h-3 w-3" aria-hidden /> New
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-6 py-10 text-center text-sm text-forest-700/60">No new inquiries right now.</p>
        )}
      </div>
    </div>
  );
}