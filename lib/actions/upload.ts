"use server";

import { requireAdmin } from "@/lib/auth";
import { deleteMediaFile, isMediaInUse } from "@/lib/media";

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
