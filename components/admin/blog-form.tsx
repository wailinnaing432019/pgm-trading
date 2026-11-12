"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Images,
  Loader2,
  Save,
  Sparkles,
  Tag,
  User,
} from "lucide-react";
import type { Blog } from "@prisma/client";
import { saveBlog, type AdminActionState } from "@/lib/actions/admin";
import { ImageUploader } from "@/components/ui/image-uploader";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { TagInput } from "@/components/admin/tag-input";
import { useToast } from "@/components/admin/toast";
import { blogImages } from "@/lib/blog";

const initialState: AdminActionState = { ok: false };

function FieldError({
  fieldErrors,
  name,
}: {
  fieldErrors?: Record<string, string[] | undefined>;
  name: string;
}) {
  const message = fieldErrors?.[name]?.[0];
  return message ? (
    <p className="mt-1.5 text-xs font-medium text-rose-600" role="alert">
      {message}
    </p>
  ) : null;
}

type BlogWithAuthor = Blog & {
  author?: { name: string; email: string } | null;
};

export function BlogForm({ post }: { post?: BlogWithAuthor }) {
  const [state, action, pending] = useActionState<AdminActionState, FormData>(
    saveBlog,
    initialState
  );
  const { pushToast } = useToast();

  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(post?.status ?? "DRAFT");
  const [publishedAt, setPublishedAt] = useState(
    post?.publishedAt
      ? new Date(post.publishedAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );

  const initialImages = post ? blogImages(post) : [];
  const [imagesCount, setImagesCount] = useState(initialImages.length);

  useEffect(() => {
    if (state.error) {
      pushToast("error", state.error);
    } else if (state.fieldErrors) {
      const firstError = Object.values(state.fieldErrors).flat().find(Boolean);
      if (firstError) pushToast("error", firstError);
    }
  }, [state, pushToast]);

  // Live insights
  const plainText = body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = plainText ? plainText.split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="id" value={post?.id} />

      {/* Top Header / Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-sand-200/80 pb-6">
        <div>
          <Link
            href="/admin/news"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-forest-700/70 hover:text-forest-900 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to news &amp; media
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-2xl font-semibold text-forest-950 sm:text-3xl">
              {post ? "Edit Article" : "Create New Article"}
            </h1>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                status === "PUBLISHED"
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
              }`}
            >
              {status === "PUBLISHED" ? (
                <>
                  <CheckCircle2 className="h-3 w-3" /> Published
                </>
              ) : (
                <>
                  <FileText className="h-3 w-3" /> Draft
                </>
              )}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {post && post.status === "PUBLISHED" && (
            <Link
              href={`/news/${post.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-sand-300 bg-white px-4 py-2 text-xs font-medium text-forest-800 shadow-xs hover:bg-sand-50 transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Live Article</span>
            </Link>
          )}

          <Link
            href="/admin/news"
            className="rounded-full px-4 py-2 text-xs font-semibold text-forest-700 hover:text-forest-950 transition"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-forest-800 px-6 text-xs font-semibold text-cream shadow-sm transition hover:bg-forest-900 disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : post ? (
              <Save className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-gold-300" aria-hidden />
            )}
            {post ? "Save Changes" : status === "PUBLISHED" ? "Publish Article" : "Save Draft"}
          </button>
        </div>
      </div>

      {/* Two-Column Editor Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Column (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Article Title & Excerpt Card */}
          <div className="card-surface p-6 sm:p-7 space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-forest-700/70">
                  Article Title *
                </label>
                <span className="text-[11px] text-forest-500/70">
                  {title.length}/200
                </span>
              </div>
              <input
                name="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                placeholder="Enter a compelling headline..."
                className="mt-2 w-full border-0 border-b border-sand-200 bg-transparent px-0 py-2 font-serif text-xl sm:text-2xl font-semibold text-forest-950 placeholder:text-forest-700/35 focus:border-gold-500 focus:outline-none transition"
              />
              <FieldError fieldErrors={state.fieldErrors} name="title" />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-forest-700/70">
                  Article Summary / Excerpt *
                </label>
                <span className="text-[11px] text-forest-500/70">
                  {excerpt.length}/400
                </span>
              </div>
              <textarea
                name="excerpt"
                required
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                maxLength={400}
                placeholder="A concise 1-2 sentence overview for news feed cards, article previews, and social media sharing..."
                className="input-admin mt-2 resize-none text-sm leading-relaxed"
              />
              <p className="mt-1 text-[11px] text-forest-600/60">
                This appears as the highlighted deck on the article page and the card preview on the News page.
              </p>
              <FieldError fieldErrors={state.fieldErrors} name="excerpt" />
            </div>
          </div>

          {/* Rich Text Body Editor Card */}
          <div className="card-surface p-6 sm:p-7 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-semibold text-forest-950">
                  Article Body *
                </h3>
                <p className="text-xs text-forest-700/70">
                  Format headings, bullet lists, blockquotes, and links with live preview.
                </p>
              </div>
            </div>

            <RichTextEditor
              name="body"
              defaultValue={body}
              onChange={setBody}
              placeholder="Tell your story here. Use formatting buttons above for headings, quotes, and links..."
              minHeight="420px"
            />
            <FieldError fieldErrors={state.fieldErrors} name="body" />
          </div>

          {/* Photo Gallery & Cover Card */}
          <div className="card-surface p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-semibold text-forest-950 flex items-center gap-2">
                  <Images className="h-4 w-4 text-gold-600" />
                  Media Gallery &amp; Cover Image
                </h3>
                <p className="text-xs text-forest-700/70 mt-0.5">
                  The first photo automatically serves as the primary cover across news listings and social shares.
                </p>
              </div>
            </div>

            <ImageUploader
              name="images"
              label="Article Photos"
              multiple
              initial={initialImages}
              maxImages={24}
              onChange={(urls) => setImagesCount(urls.length)}
            />
            <FieldError fieldErrors={state.fieldErrors} name="images" />
          </div>
        </div>

        {/* Sidebar Column (1 col) */}
        <div className="space-y-6">
          {/* Publishing & Status Card */}
          <div className="card-surface p-6 space-y-5">
            <h3 className="font-serif text-sm font-semibold text-forest-950 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold-600" />
              Publishing Settings
            </h3>

            {/* Status Radio Pills */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-forest-700/70">
                Article Status
              </label>
              <input type="hidden" name="status" value={status} />

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("DRAFT")}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                    status === "DRAFT"
                      ? "border-amber-400 bg-amber-50/60 text-amber-900 shadow-xs ring-1 ring-amber-300"
                      : "border-sand-200 bg-white text-forest-700/80 hover:bg-sand-50"
                  }`}
                >
                  <FileText className="h-4 w-4 mb-1 text-amber-600" />
                  <span className="text-xs font-semibold">Draft</span>
                  <span className="text-[10px] text-forest-600/60">Admin only</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus("PUBLISHED")}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                    status === "PUBLISHED"
                      ? "border-emerald-500 bg-emerald-50/60 text-emerald-950 shadow-xs ring-1 ring-emerald-300"
                      : "border-sand-200 bg-white text-forest-700/80 hover:bg-sand-50"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4 mb-1 text-emerald-600" />
                  <span className="text-xs font-semibold">Published</span>
                  <span className="text-[10px] text-forest-600/60">Visible to public</span>
                </button>
              </div>
              <FieldError fieldErrors={state.fieldErrors} name="status" />
            </div>

            {/* Publication Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-forest-700/70 mb-1.5">
                Publication Date
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-500" />
                <input
                  name="publishedAt"
                  type="date"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="input-admin pl-9 text-xs"
                />
              </div>
              <FieldError fieldErrors={state.fieldErrors} name="publishedAt" />
            </div>

            {/* Author Display */}
            <div className="rounded-xl bg-sand-50 p-3 text-xs border border-sand-200/80 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest-900 text-gold-300">
                <User className="h-3.5 w-3.5" />
              </div>
              <div className="leading-tight">
                <span className="block font-semibold text-forest-950">
                  {post?.author?.name ?? "Current Admin"}
                </span>
                <span className="block text-[10px] text-forest-600/60">Article Author</span>
              </div>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={pending}
              className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-forest-800 px-6 text-sm font-semibold text-cream shadow-sm transition hover:bg-forest-900 disabled:opacity-60"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : post ? (
                <Save className="h-4 w-4" aria-hidden />
              ) : (
                <Sparkles className="h-4 w-4 text-gold-300" aria-hidden />
              )}
              {post ? "Update Article" : status === "PUBLISHED" ? "Publish Article" : "Save as Draft"}
            </button>
          </div>

          {/* Tags & Taxonomy Card */}
          <div className="card-surface p-6 space-y-4">
            <h3 className="font-serif text-sm font-semibold text-forest-950 flex items-center gap-2">
              <Tag className="h-4 w-4 text-forest-600" />
              Tags &amp; Categories
            </h3>
            <p className="text-xs text-forest-700/70">
              Assign trade tags to help visitors filter related topics on the news page.
            </p>

            <TagInput
              name="tags"
              initialTags={post?.tags ?? []}
            />
          </div>

          {/* Article Stats Card */}
          <div className="card-surface p-6 space-y-3">
            <h3 className="font-serif text-sm font-semibold text-forest-950 flex items-center gap-2">
              <Eye className="h-4 w-4 text-forest-600" />
              Article Overview
            </h3>
            <div className="divide-y divide-sand-200 text-xs text-forest-800">
              <div className="flex items-center justify-between py-2">
                <span className="text-forest-600/70 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Reading Time
                </span>
                <span className="font-medium text-forest-950">~{readingTime} min</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-forest-600/70">Word Count</span>
                <span className="font-medium text-forest-950">{wordCount} words</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-forest-600/70">Gallery Images</span>
                <span className="font-medium text-forest-950">{imagesCount} uploaded</span>
              </div>
              {post && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-forest-600/70">Total Views</span>
                  <span className="font-medium text-forest-950">{post.viewCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
