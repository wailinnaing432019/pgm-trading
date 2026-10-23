import type { Blog } from "@prisma/client";

/**
 * Every image attached to an article, newest-first as uploaded. Falls back to
 * the legacy single cover image so older articles keep working untouched.
 */
export function blogImages(post: Pick<Blog, "images" | "coverImage">): string[] {
  const images = (post.images ?? []).map((src) => src.trim()).filter(Boolean);
  if (images.length > 0) return images;
  return post.coverImage ? [post.coverImage] : [];
}

/** The image used for cards, social previews and the article hero. */
export function blogCover(post: Pick<Blog, "images" | "coverImage">): string | null {
  return blogImages(post)[0] ?? null;
}
