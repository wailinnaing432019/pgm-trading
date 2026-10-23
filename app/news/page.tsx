import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, ArrowUpRight } from "lucide-react";
import { AssetImage } from "@/components/ui/asset-image";
import { Badge } from "@/components/ui/badge";
import { getBlogs } from "@/lib/queries";
import { blogCover } from "@/lib/blog";
import { formatDate } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "News, Trade Updates & Market Insights",
  description:
    "Export market movements, harvest outlooks and company announcements from Pacific Global Myanmar.",
  path: "/news",
});

export default async function NewsPage() {
  const { items, total } = await getBlogs(30);

  return (
    <main>
        <section className="border-b border-sand-200 bg-forest-950 py-14 text-cream md:py-20">
          <div className="section-container">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold-400">News & Media</p>
            <h1 className="mt-3 font-serif text-4xl font-semibold md:text-5xl">Market insights & updates</h1>
            <p className="mt-4 max-w-2xl text-cream/70">
              {total} published article{total === 1 ? "" : "s"} — trade outlooks, harvest reports and company news.
            </p>
          </div>
        </section>

        <section className="bg-sand-50 py-16">
          <div className="section-container">
            {items.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((post) => (
                  <Link
                    key={post.id}
                    href={`/news/${post.id}`}
                    className="card-surface group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <AssetImage
                        src={blogCover(post)}
                        alt={post.title}
                        placeholderIcon="leaf"
                        className="transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-center gap-3 text-xs">
                        <Badge tone="gold">{post.tags[0] ?? "Update"}</Badge>
                        <span className="flex items-center gap-1 text-forest-700/60">
                          <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                          {formatDate(post.publishedAt)}
                        </span>
                      </div>
                      <h2 className="mt-3 line-clamp-2 font-serif text-lg font-semibold leading-snug text-forest-950 group-hover:text-forest-700">
                        {post.title}
                      </h2>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-forest-800/75">{post.excerpt}</p>
                      <span className="mt-auto flex items-center gap-1 pt-4 text-sm font-semibold text-forest-700">
                        Read article <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-sand-300 bg-white/60 px-6 py-20 text-center">
                <p className="font-serif text-xl font-semibold text-forest-950">No articles yet</p>
                <p className="mx-auto mt-2 max-w-md text-sm text-forest-800/70">
                  Market updates and company news will be published here soon.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
  );
}