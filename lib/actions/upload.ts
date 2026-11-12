"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/auth";
import { deleteMediaFile, isMediaInUse } from "@/lib/media";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

export async function uploadImage(formData: FormData): Promise<UploadResult> {
  await requireAdmin();

  const file = formData.get("file");
  if (typeof window !== "undefined") return { ok: false, error: "Uploads must run on the server." };
  if (!(file instanceof File)) return { ok: false, error: "No file provided." };
  if (file.size === 0) return { ok: false, error: "The selected file is empty." };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: "Image must be under 8 MB." };

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { ok: false, error: "Unsupported image type (use jpg, png, webp, gif or avif)." };
  }

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const mediaDir = path.join(process.cwd(), "public", "media");

  await mkdir(mediaDir, { recursive: true });
  await writeFile(path.join(mediaDir, fileName), Buffer.from(await file.arrayBuffer()));

  return { ok: true, url: `/media/${fileName}` };
}

/**
 * Removes an unsaved uploaded image immediately when the user clicks 'X' in the upload form.
 * If the image is already saved in the database, it is protected and will not be deleted until the form is saved.
 */
export async function deleteUploadedMediaAction(url: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  if (!url || typeof url !== "string") return { ok: false };

  // Only remove if it's not already committed to the database
  const inUse = await isMediaInUse(url);
  if (!inUse) {
    await deleteMediaFile(url);
    return { ok: true };
  }
  return { ok: false };
}
