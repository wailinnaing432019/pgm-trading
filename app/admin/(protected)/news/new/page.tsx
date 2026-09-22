import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BlogForm } from "@/components/admin/blog-form";

export default function NewBlogPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/news" className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700 hover:text-forest-900">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to news
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-semibold text-forest-950">New article</h1>
      <p className="mt-1 text-sm text-forest-700/70">Compose with the rich-text editor, then publish or save as draft.</p>
      <div className="card-surface mt-6 p-7">
        <BlogForm />
      </div>
    </div>
  );
}