import { unlink, stat, readdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

const MEDIA_DIR = path.join(process.cwd(), "public", "media");

export function isLocalMediaUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const clean = url.trim();
  return clean.startsWith("/media/") || clean.startsWith("media/");
}

export function extractMediaFileName(url: string): string | null {
  if (!isLocalMediaUrl(url)) return null;
  const normalized = url.trim().replace(/^\/?media\//, "");
  // Guard against directory traversal attacks (e.g. "../" or "..\\")
  const base = path.basename(normalized);
  return base || null;
}

/**
 * Safely delete a single file inside public/media/.
 * Will never touch seed images in public/images/ or files outside public/media/.
 */
export async function deleteMediaFile(url: string | null | undefined): Promise<boolean> {
  if (!url) return false;
  const fileName = extractMediaFileName(url);
  if (!fileName) return false;

  const targetPath = path.resolve(MEDIA_DIR, fileName);

  // Security barrier: must strictly reside inside MEDIA_DIR
  if (!targetPath.startsWith(MEDIA_DIR)) {
    console.warn("[media] Security block: attempt to delete outside public/media:", targetPath);
    return false;
  }

  try {
    await unlink(targetPath);
    return true;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return false; // File was already deleted or doesn't exist
    }
    console.error(`[media] Failed to unlink file ${fileName}:`, err);
    return false;
  }
}

/**
 * Delete a list of media URLs from public/media/.
 */
export async function deleteMediaFiles(urls: (string | null | undefined)[]): Promise<number> {
  const valid = urls.filter(isLocalMediaUrl) as string[];
  if (valid.length === 0) return 0;

  const results = await Promise.all(valid.map(deleteMediaFile));
  return results.filter(Boolean).length;
}

/**
 * When an entity (Product, Article, Section) is updated, compare previous images vs new images.
 * Any removed local file will be deleted from disk.
 */
export async function cleanupOrphanedEntityMedia(
  oldUrls: (string | null | undefined)[],
  newUrls: (string | null | undefined)[]
): Promise<number> {
  const newSet = new Set(newUrls.filter(isLocalMediaUrl).map((u) => u!.trim()));
  const toDelete = oldUrls
    .filter(isLocalMediaUrl)
    .map((u) => u!.trim())
    .filter((u) => !newSet.has(u));

  if (toDelete.length === 0) return 0;
  return deleteMediaFiles(toDelete);
}

/**
 * Check whether a media URL is currently saved and referenced in any database table.
 */
export async function isMediaInUse(url: string): Promise<boolean> {
  const fileName = extractMediaFileName(url);
  if (!fileName) return false;
  const mediaUrl = `/media/${fileName}`;

  try {
    const [inProduct, inBlog, inCat, inSection, inService, inMilestone] = await Promise.all([
      prisma.product.findFirst({
        where: { images: { has: mediaUrl } },
        select: { id: true },
      }),
      prisma.blog.findFirst({
        where: {
          OR: [{ coverImage: mediaUrl }, { images: { has: mediaUrl } }],
        },
        select: { id: true },
      }),
      prisma.category.findFirst({
        where: { image: mediaUrl },
        select: { id: true },
      }),
      prisma.pageSection.findFirst({
        where: { image: mediaUrl },
        select: { id: true },
      }),
      prisma.service.findFirst({
        where: { image: mediaUrl },
        select: { id: true },
      }),
      prisma.milestone.findFirst({
        where: { image: mediaUrl },
        select: { id: true },
      }),
    ]);

    return Boolean(inProduct || inBlog || inCat || inSection || inService || inMilestone);
  } catch (error) {
    console.error("[isMediaInUse]", error);
    // In case of database connection issues, err on the side of caution
    return true;
  }
}

/**
 * Maintenance scanner: scans public/media/, checks the database across all tables,
 * and deletes every orphaned file that is no longer referenced anywhere.
 */
export async function cleanAllOrphanedMedia(): Promise<{
  scanned: number;
  deleted: number;
  freedBytes: number;
  deletedFiles: string[];
}> {
  let filesOnDisk: string[] = [];
  try {
    filesOnDisk = await readdir(MEDIA_DIR);
  } catch {
    return { scanned: 0, deleted: 0, freedBytes: 0, deletedFiles: [] };
  }

  if (filesOnDisk.length === 0) {
    return { scanned: 0, deleted: 0, freedBytes: 0, deletedFiles: [] };
  }

  try {
    const [
      products,
      blogs,
      categories,
      sections,
      services,
      milestones,
      siteSettings,
    ] = await Promise.all([
      prisma.product.findMany({ select: { images: true } }),
      prisma.blog.findMany({ select: { images: true, coverImage: true } }),
      prisma.category.findMany({ select: { image: true } }),
      prisma.pageSection.findMany({ select: { image: true, meta: true } }),
      prisma.service.findMany({ select: { image: true } }),
      prisma.milestone.findMany({ select: { image: true } }),
      prisma.siteSetting.findMany({ select: { meta: true } }),
    ]);

    const activeFileNames = new Set<string>();

    const registerUrl = (url: unknown) => {
      if (typeof url === "string") {
        const fileName = extractMediaFileName(url);
        if (fileName) activeFileNames.add(fileName);
      }
    };

    // 1. Products
    for (const p of products) {
      if (Array.isArray(p.images)) p.images.forEach(registerUrl);
    }

    // 2. Blogs
    for (const b of blogs) {
      if (Array.isArray(b.images)) b.images.forEach(registerUrl);
      if (b.coverImage) registerUrl(b.coverImage);
    }

    // 3. Categories
    for (const c of categories) {
      if (c.image) registerUrl(c.image);
    }

    // 4. PageSections
    for (const s of sections) {
      if (s.image) registerUrl(s.image);
      if (s.meta && typeof s.meta === "object") {
        const metaStr = JSON.stringify(s.meta);
        const matches = metaStr.match(/\/media\/[a-zA-Z0-9_\-\.]+/g);
        if (matches) matches.forEach(registerUrl);
      }
    }

    // 5. Services & Milestones
    for (const serv of services) {
      if (serv.image) registerUrl(serv.image);
    }
    for (const m of milestones) {
      if (m.image) registerUrl(m.image);
    }

    // 6. Site Settings
    for (const ss of siteSettings) {
      if (ss.meta && typeof ss.meta === "object") {
        const metaStr = JSON.stringify(ss.meta);
        const matches = metaStr.match(/\/media\/[a-zA-Z0-9_\-\.]+/g);
        if (matches) matches.forEach(registerUrl);
      }
    }

    let deletedCount = 0;
    let freedBytes = 0;
    const deletedFiles: string[] = [];

    for (const file of filesOnDisk) {
      // If not referenced anywhere in database
      if (!activeFileNames.has(file)) {
        const filePath = path.join(MEDIA_DIR, file);
        try {
          const fileStat = await stat(filePath);
          await unlink(filePath);
          deletedCount++;
          freedBytes += fileStat.size;
          deletedFiles.push(file);
        } catch (err) {
          console.warn(`[media] Failed to unlink orphaned file ${file}:`, err);
        }
      }
    }

    return {
      scanned: filesOnDisk.length,
      deleted: deletedCount,
      freedBytes,
      deletedFiles,
    };
  } catch (error) {
    console.error("[cleanAllOrphanedMedia]", error);
    return {
      scanned: filesOnDisk.length,
      deleted: 0,
      freedBytes: 0,
      deletedFiles: [],
    };
  }
}

