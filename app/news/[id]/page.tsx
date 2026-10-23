import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, User } from "lucide-react";
import { AssetImage } from "@/components/ui/asset-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBlogById } from "@/lib/queries";
import { blogCover, blogImages } from "@/lib/blog";
import { cn, formatDate } from "@/lib/utils";
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

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getBlogById(id);
  if (!post) notFound();

  const images = blogImages(post);
  const gallery = images.slice(1);

  return (
    <main>
        <div className="border-b border-sand-200 bg-sand-50">
          <div className="section-container py-4 text-sm text-forest-700/70">
            <Link href="/" className="transition-colors hover:text-forest-900">Home</Link>
            <span className="mx-2" aria-hidden>/</span>
            <Link href="/news" className="transition-colors hover:text-forest-900">News</Link>
            <span className="mx-2" aria-hidden>/</span>
            <span className="font-medium text-forest-950">{post.title}</span>
          </div>
        </div>

        <article className="bg-cream py-14">
          <div className="section-container max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge tone="gold">{post.tags[0] ?? "Update"}</Badge>
              <span className="flex items-center gap-1.5 text-forest-700/70">
                <CalendarDays className="h-4 w-4" aria-hidden /> {formatDate(post.publishedAt)}
              </span>
              {post.author?.name ? (
                <span className="flex items-center gap-1.5 text-forest-700/70">
                  <User className="h-4 w-4" aria-hidden /> {post.author.name}
                </span>
              ) : null}
            </div>

            <h1 className="mt-5 font-serif text-3xl font-semibold leading-tight text-forest-950 sm:text-4xl md:text-5xl">
              {post.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-forest-800/75">{post.excerpt}</p>

            <div className="relative mt-10 aspect-[16/7] overflow-hidden rounded-3xl">
              <AssetImage src={images[0] ?? null} alt={post.title} placeholderIcon="leaf" priority />
            </div>

            <div
              className="rich-text mt-10"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />

            {gallery.length > 0 ? (
              <section className="mt-12 border-t border-sand-200 pt-8">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-forest-700/60">
                    Activity gallery
                  </p>
                  <span className="text-xs text-forest-700/50">
                    {gallery.length} photo{gallery.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {gallery.map((src, index) => {
                    const spansBoth = gallery.length % 2 === 1 && index === gallery.length - 1;
                    return (
                      <div
                        key={`${src}-${index}`}
                        className={cn(
                          "relative aspect-[4/3] overflow-hidden rounded-2xl border border-sand-200 bg-sand-100",
                          spansBoth && "sm:col-span-2 sm:aspect-[16/9]"
                        )}
                      >
                        <AssetImage
                          src={src}
                          alt={`${post.title} — activity photo ${index + 2}`}
                          placeholderIcon="leaf"
                          sizes="(min-width: 640px) 50vw, 100vw"
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null}
          </div>

          <div className="section-container mt-14 max-w-4xl">
            <Button href="/news" variant="ghost">
              <ArrowLeft className="h-4 w-4" aria-hidden /> Back to all news
            </Button>
          </div>
        </article>
      </main>
  );
}