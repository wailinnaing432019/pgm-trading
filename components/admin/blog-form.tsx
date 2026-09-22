"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import type { Blog } from "@prisma/client";
import { saveBlog, type AdminActionState } from "@/lib/actions/admin";
import { ImageUploader } from "@/components/ui/image-uploader";

const initialState: AdminActionState = { ok: false };

export function BlogForm({ post }: { post?: Blog }) {
  const [state, action, pending] = useActionState<AdminActionState, FormData>(saveBlog, initialState);

  return (
    <form action={action} className="grid gap-5">
      <input type="hidden" name="id" value={post?.id} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Title *</label>
          <input name="title" required defaultValue={post?.title} className="input-admin" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Slug *</label>
          <input name="slug" required defaultValue={post?.slug} placeholder="q3-rice-export-outlook" className="input-admin" />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Excerpt *</label>
        <input name="excerpt" required defaultValue={post?.excerpt} className="input-admin" />
      </div>

      <div>
        <ImageUploader
          name="coverImage"
          label="Cover image"
          initial={post?.coverImage ? [post.coverImage] : []}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Tags (comma separated)</label>
        <input name="tags" defaultValue={post?.tags.join(", ")} placeholder="exports, rice, market" className="input-admin" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">
          Body (rich text — produced by the Tiptap editor)
        </label>
        <textarea name="body" required rows={12} defaultValue={post?.body} className="input-admin font-mono text-xs" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Status *</label>
          <select name="status" defaultValue={post?.status ?? "DRAFT"} className="input-admin">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Published at</label>
          <input
            name="publishedAt"
            type="date"
            defaultValue={post?.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}
            className="input-admin"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-forest-700 px-8 text-sm font-semibold text-cream transition-colors hover:bg-forest-800 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
          {post ? "Update article" : "Publish article"}
        </button>
        {state.ok ? (
          <p className="text-sm font-medium text-forest-700" role="status">Saved — news feed refreshed.</p>
        ) : !state.ok && state.error ? (
          <p className="text-sm text-soil-700" role="alert">{state.error}</p>
        ) : null}
      </div>
    </form>
  );
}