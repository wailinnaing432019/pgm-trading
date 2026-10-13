import Link from "next/link";
import { Newspaper, Pencil, Plus, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteBlog } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { DangerSubmitButton } from "@/components/ui/danger-submit-button";

export default async function AdminNewsPage() {
  const posts = await prisma.blog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-forest-950">News & Media</h1>
          <p className="mt-1 text-sm text-forest-700/70">Write, schedule and manage market insight articles.</p>
        </div>
        <Link
          href="/admin/news/new"
          className="inline-flex items-center gap-2 rounded-full bg-forest-700 px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-forest-800"
        >
          <Plus className="h-4 w-4" aria-hidden /> New article
        </Link>
      </div>

      <div className="card-surface mt-8 overflow-x-auto">
        {posts.length > 0 ? (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-sand-200 text-xs uppercase tracking-wider text-forest-700/60">
                <th className="px-6 py-3.5 font-semibold">Article</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-4 py-3.5 font-semibold">Views</th>
                <th className="px-4 py-3.5 font-semibold">Created</th>
                <th className="px-6 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200">
              {posts.map((post) => (
                <tr key={post.id} className="transition-colors hover:bg-sand-50">
                  <td className="px-6 py-4">
                    <Link href={`/news/${post.id}`} className="font-semibold text-forest-950 hover:text-forest-700">
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <Badge tone={post.status === "PUBLISHED" ? "forest" : "neutral"}>{post.status.toLowerCase()}</Badge>
                  </td>
                  <td className="px-4 py-4 text-forest-800/80">{post.viewCount}</td>
                  <td className="px-4 py-4 text-forest-800/70">{formatDate(post.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/news/${post.id}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-forest-100 text-forest-700 transition-colors hover:bg-forest-700 hover:text-cream"
                        aria-label={`Edit ${post.title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <form action={deleteBlog}>
                        <input type="hidden" name="id" value={post.id} />
                        <DangerSubmitButton
                          confirmText="Delete this article permanently?"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-soil-100 text-soil-800 transition-colors hover:bg-soil-700 hover:text-cream"
                          aria-label={`Delete ${post.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </DangerSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <Newspaper className="h-10 w-10 text-forest-700/40" aria-hidden />
            <p className="font-serif text-lg font-semibold text-forest-950">No articles yet</p>
            <Link href="/admin/news/new" className="text-sm font-semibold text-forest-700 underline underline-offset-4">
              Write your first article
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}