import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Images, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PostMediaCarousel } from "@/components/news/post-media-carousel";
import { getBlogs } from "@/lib/queries";
import { blogImages } from "@/lib/blog";
import { cn, formatDate } from "@/lib/utils";
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
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold-400">News &amp; Media</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold md:text-5xl">Market insights &amp; updates</h1>
          <p className="mt-4 max-w-2xl text-cream/70">
            {total} published article{total === 1 ? "" : "s"} — trade outlooks, harvest reports and company news.
          </p>
        </div>
      </section>

      <section className="bg-sand-50 py-14 md:py-20">
        <div className="section-container">
          {items.length > 0 ? (
            <div className="space-y-8 md:space-y-12">
              {items.map((post, index) => {
                const images = blogImages(post);
                const isReversed = index % 2 === 1;
                const tags = post.tags.length > 0 ? post.tags.slice(0, 3) : ["Update"];

                return (
                  <article
                    key={post.id}
                    className={cn(
                      "card-surface group grid overflow-hidden border border-sand-200/80 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift md:grid-cols-2",
                      isReversed ? "lg:grid-cols-[0.92fr_1.08fr]" : "lg:grid-cols-[1.08fr_0.92fr]"
                    )}
                  >
                    <div className={cn("relative", isReversed ? "md:order-2" : "md:order-1")}>
                      <PostMediaCarousel
                        images={images}
                        alt={post.title}
                        href={`/news/${post.id}`}
                        priority={index < 2}
                        startDelayMs={(index % 4) * 650}
                        sizes="(min-width: 1024px) 52vw, (min-width: 768px) 50vw, 100vw"
                        className="aspect-[16/10] w-full md:aspect-auto md:h-full md:min-h-[340px] lg:min-h-[380px]"
                      />
                    </div>

                    <div
                      className={cn(
                        "flex flex-col justify-between p-6 sm:p-8 lg:p-10",
                        isReversed ? "md:order-1" : "md:order-2"
                      )}
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5 text-xs">
                          {tags.map((tag, tagIdx) => (
                            <Badge key={`${tag}-${tagIdx}`} tone="gold">
                              {tag}
                            </Badge>
                          ))}
                          <span className="flex items-center gap-1 text-forest-700/65">
                            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                            {formatDate(post.publishedAt)}
                          </span>
                          {post.author?.name ? (
                            <span className="flex items-center gap-1 text-forest-700/65">
                              <User className="h-3.5 w-3.5" aria-hidden />
                              {post.author.name}
                            </span>
                          ) : null}
                        </div>

                        <h2 className="mt-4 font-serif text-2xl font-semibold leading-snug text-forest-950 transition-colors group-hover:text-forest-700 lg:text-[1.75rem]">
                          <Link href={`/news/${post.id}`} className="focus-visible:outline-none focus-visible:underline">
                            {post.title}
                          </Link>
                        </h2>

                        <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-forest-800/80 sm:text-base">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-sand-200/80 pt-5">
                        <Link
                          href={`/news/${post.id}`}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700 transition-colors hover:text-forest-900"
                        >
                          Read full article
                          <ArrowUpRight
                            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            aria-hidden
                          />
                        </Link>

                        {images.length > 1 ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-sand-100 px-3 py-1 text-xs font-medium text-forest-700">
                            <Images className="h-3.5 w-3.5 text-gold-600" aria-hidden />
                            {images.length} photos
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
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
