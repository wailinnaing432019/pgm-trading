import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BlogForm } from "@/components/admin/blog-form";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.blog.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/news" className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700 hover:text-forest-900">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to news
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-semibold text-forest-950">Edit article</h1>
      <p className="mt-1 text-sm text-forest-700/70">{post.title}</p>
      <div className="card-surface mt-6 p-7">
        <BlogForm post={post} />
      </div>
    </div>
  );
}