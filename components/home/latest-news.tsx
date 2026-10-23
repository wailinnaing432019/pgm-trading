import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import type { Blog } from "@prisma/client";
import { AssetImage } from "@/components/ui/asset-image";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { blogCover } from "@/lib/blog";
import { getSection } from "@/lib/queries";

export async function LatestNews({ posts }: { posts: Blog[] }) {
  const heading = await getSection("home", "newsHeading");
  if (posts.length === 0) return null;

  const [lead, ...rest] = posts;

  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="section-container">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={heading?.subtitle ?? "News & Insights"}
            title={heading?.title ?? "Trade updates from the paddy fields"}
            description={
              heading?.body ?? "Export market movements, harvest outlooks and company announcements."
            }
          />
          <Button href="/news" variant="outline" className="shrink-0">
            All News <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {/* Lead article */}
          <Link
            href={`/news/${lead.id}`}
            className="card-surface group relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lift lg:col-span-2"
          >
            <div className="relative h-72 overflow-hidden lg:h-80">
              <AssetImage
                src={blogCover(lead)}
                alt={lead.title}
                placeholderIcon="leaf"
                className="transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-7">
              <div className="flex items-center gap-3 text-xs">
                <Badge tone="gold">{lead.tags[0] ?? "Update"}</Badge>
                <span className="flex items-center gap-1 text-forest-700/60">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                  {formatDate(lead.publishedAt)}
                </span>
              </div>
              <h3 className="mt-4 font-serif text-2xl font-semibold leading-snug text-forest-950 group-hover:text-forest-700">
                {lead.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-forest-800/75">{lead.excerpt}</p>
            </div>
          </Link>

          {/* Secondary articles */}
          <div className="flex flex-col gap-6">
            {rest.map((post) => (
              <Link
                key={post.id}
                href={`/news/${post.id}`}
                className="card-surface group flex gap-4 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                  <AssetImage src={blogCover(post)} alt={post.title} placeholderIcon="package" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-forest-700/60">{formatDate(post.publishedAt)}</p>
                  <h4 className="mt-1 line-clamp-2 font-serif text-base font-semibold leading-snug text-forest-950 group-hover:text-forest-700">
                    {post.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}