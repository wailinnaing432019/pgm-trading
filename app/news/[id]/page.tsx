import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CalendarDays,
  Clock,
  Eye,
  Tag,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AssetImage } from "@/components/ui/asset-image";
import { ArticleMediaGallery } from "@/components/news/article-media-gallery";
import { ArticleShareBar } from "@/components/news/article-share-bar";
import { getBlogById } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { blogCover, blogImages } from "@/lib/blog";
import { formatDate } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getBlogById(id);
  if (!post) {
    return { title: "Article not found", robots: { index: false, follow: true } };
  }

  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/news/${post.id}`,
    image: blogCover(post),
    type: "article",
    publishedTime: (post.publishedAt ?? post.createdAt).toISOString(),
    modifiedTime: post.updatedAt.toISOString(),
  });
}

function calculateReadingTime(text: string): number {
  const plain = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = plain ? plain.split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getBlogById(id);
  if (!post) notFound();

  // Related articles for sidebar and discovery
  const relatedPosts = await prisma.blog.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: post.id },
      publishedAt: { lte: new Date() },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: { author: { select: { name: true } } },
  });

  const images = blogImages(post);
  const tags = post.tags.length > 0 ? post.tags : ["Market Update"];
  const readingTime = calculateReadingTime(post.body);

  return (
    <main className="bg-sand-50/50 min-h-screen">
      {/* Breadcrumb Navigation Header */}
      <div className="border-b border-sand-200/80 bg-white/80 backdrop-blur-xs">
        <div className="section-container flex items-center justify-between py-3.5 text-xs text-forest-700/70">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 overflow-hidden">
            <Link href="/" className="hover:text-forest-950 transition">
              Home
            </Link>
            <span className="text-sand-300">/</span>
            <Link href="/news" className="hover:text-forest-950 transition">
              News &amp; Media
            </Link>
            <span className="text-sand-300">/</span>
            <span className="truncate font-medium text-forest-950 max-w-[200px] sm:max-w-md">
              {post.title}
            </span>
          </nav>
          <Link
            href="/news"
            className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-forest-800 hover:text-gold-600 transition ml-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to News
          </Link>
        </div>
      </div>

      {/* Editorial Article Header */}
      <header className="border-b border-sand-200/60 bg-gradient-to-b from-white to-sand-50/30 py-10 md:py-14">
        <div className="section-container max-w-5xl">
          <div className="flex flex-wrap items-center gap-2.5 text-xs mb-4">
            {tags.map((tag, idx) => (
              <Badge key={`${tag}-${idx}`} tone="gold">
                {tag}
              </Badge>
            ))}
            <span className="flex items-center gap-1.5 text-forest-700/70">
              <CalendarDays className="h-3.5 w-3.5" /> {formatDate(post.publishedAt)}
            </span>
            <span className="text-sand-300">•</span>
            <span className="flex items-center gap-1 text-forest-700/70">
              <Clock className="h-3.5 w-3.5" /> ~{readingTime} min read
            </span>
            {post.author?.name ? (
              <>
                <span className="text-sand-300">•</span>
                <span className="flex items-center gap-1 text-forest-700/70">
                  <User className="h-3.5 w-3.5" /> {post.author.name}
                </span>
              </>
            ) : null}
          </div>

          <h1 className="font-serif text-3xl font-semibold leading-[1.2] text-forest-950 sm:text-4xl md:text-5xl tracking-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-forest-800/80 font-serif italic border-l-2 border-gold-400 pl-4 py-0.5">
              {post.excerpt}
            </p>
          )}
        </div>
      </header>

      {/* Main 2-Column Content Canvas */}
      <div className="section-container max-w-6xl py-10 md:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Main Reading Column (8 cols) */}
          <article className="lg:col-span-8 min-w-0">
            <ArticleMediaGallery images={images} title={post.title}>
              <div
                className="rich-text max-w-none text-forest-900/90"
                dangerouslySetInnerHTML={{ __html: post.body }}
              />
            </ArticleMediaGallery>

            {/* Article Footer: Tags & Sharing */}
            <div className="mt-12 border-t border-sand-200/80 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-forest-600/70 flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" /> Tags:
                  </span>
                  {tags.map((tag, idx) => (
                    <span
                      key={`${tag}-${idx}`}
                      className="rounded-lg bg-sand-200/60 px-2.5 py-1 text-xs font-medium text-forest-900"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <ArticleShareBar title={post.title} />
              </div>
            </div>

            {/* Navigation back button */}
            <div className="mt-8">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 rounded-full border border-sand-300 bg-white px-5 py-2.5 text-xs font-semibold text-forest-800 shadow-xs hover:border-gold-400 hover:bg-sand-50 transition"
              >
                <ArrowLeft className="h-4 w-4" /> Back to all articles
              </Link>
            </div>
          </article>

          {/* Sticky Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Story Information Card */}
            <div className="card-surface p-5 rounded-2xl border border-sand-200/80 space-y-3">
              <h3 className="font-serif text-sm font-semibold text-forest-950 flex items-center gap-2 border-b border-sand-200/70 pb-2.5">
                <Bookmark className="h-4 w-4 text-gold-600" /> Story Information
              </h3>
              <div className="divide-y divide-sand-200/70 text-xs">
                <div className="flex items-center justify-between py-2">
                  <span className="text-forest-600/70">Published</span>
                  <span className="font-medium text-forest-950">{formatDate(post.publishedAt)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-forest-600/70">Reading Time</span>
                  <span className="font-medium text-forest-950">~{readingTime} min</span>
                </div>
                {post.author?.name ? (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-forest-600/70">Author</span>
                    <span className="font-medium text-forest-950">{post.author.name}</span>
                  </div>
                ) : null}
                {post.viewCount > 0 ? (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-forest-600/70">Total Reads</span>
                    <span className="font-medium text-forest-950 flex items-center gap-1">
                      <Eye className="h-3 w-3 text-forest-500" /> {post.viewCount}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* About Company Card */}
            <div className="rounded-2xl bg-forest-950 p-6 text-cream shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-gold-400/10 blur-xl pointer-events-none" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                Pacific Global Myanmar
              </p>
              <h4 className="mt-2 font-serif text-lg font-semibold text-cream leading-snug">
                About Our Company
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-cream/75">
                Headquartered in Yangon, Pacific Global Myanmar connects local agricultural producers and processors with international markets across Asia, Europe, and the Middle East.
              </p>
              <Link
                href="/about"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-gold-300 hover:text-gold-200 transition"
              >
                Discover our story &amp; operations <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Related Articles */}
            {relatedPosts.length > 0 && (
              <div className="card-surface p-5 rounded-2xl border border-sand-200/80 space-y-4">
                <div className="flex items-center justify-between border-b border-sand-200/70 pb-2.5">
                  <h3 className="font-serif text-sm font-semibold text-forest-950">
                    Recent Stories
                  </h3>
                  <Link
                    href="/news"
                    className="text-xs font-semibold text-forest-600 hover:text-gold-600 transition"
                  >
                    View all
                  </Link>
                </div>

                <div className="space-y-3.5 divide-y divide-sand-200/60">
                  {relatedPosts.map((related, idx) => (
                    <article key={related.id} className={idx === 0 ? "" : "pt-3.5"}>
                      <Link href={`/news/${related.id}`} className="group flex gap-3 items-start">
                        <div className="relative h-14 w-18 shrink-0 overflow-hidden rounded-lg border border-sand-200 bg-sand-100">
                          <AssetImage
                            src={blogCover(related)}
                            alt={related.title}
                            placeholderIcon="leaf"
                            sizes="72px"
                            className="transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-medium text-forest-600/70 block">
                            {formatDate(related.publishedAt)}
                          </span>
                          <h4 className="text-xs font-semibold text-forest-950 group-hover:text-gold-700 transition line-clamp-2 leading-snug mt-0.5">
                            {related.title}
                          </h4>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Bottom Recommendation Section */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-sand-200 bg-white py-12 md:py-16">
          <div className="section-container max-w-6xl">
            <div className="flex items-baseline justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest-700/60">
                  More Market News
                </p>
                <h3 className="mt-1 font-serif text-2xl font-semibold text-forest-950">
                  Latest Insights from PGM Trading
                </h3>
              </div>
              <Link
                href="/news"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-forest-800 hover:text-gold-600 transition"
              >
                All news updates <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((article) => (
                <article
                  key={article.id}
                  className="card-surface group flex flex-col overflow-hidden rounded-2xl border border-sand-200/80 transition-all hover:-translate-y-1 hover:shadow-lift"
                >
                  <Link href={`/news/${article.id}`} className="relative aspect-[16/10] overflow-hidden bg-sand-100">
                    <AssetImage
                      src={blogCover(article)}
                      alt={article.title}
                      placeholderIcon="leaf"
                      sizes="(min-width: 1024px) 33vw, 50vw"
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="text-[11px] font-medium text-forest-600/70 mb-1.5">
                        {formatDate(article.publishedAt)}
                      </div>
                      <h4 className="font-serif text-base font-semibold text-forest-950 group-hover:text-gold-700 transition line-clamp-2 leading-snug">
                        <Link href={`/news/${article.id}`}>{article.title}</Link>
                      </h4>
                      <p className="mt-2 text-xs text-forest-700/75 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-sand-200/60 flex items-center justify-between text-xs font-semibold text-forest-800 group-hover:text-gold-700">
                      <span>Read article</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
