import { unlink, stat, readdir } from "fs/promises";
import path from "path";
import { UTApi } from "uploadthing/server";
import { prisma } from "@/lib/prisma";

const MEDIA_DIR = path.join(process.cwd(), "public", "media");
const ORPHAN_GRACE_PERIOD_MS = 10 * 60 * 1000; // Protect in-flight form uploads for 10 min

function getUTApi(): UTApi | null {
  if (!process.env.UPLOADTHING_TOKEN && !process.env.UPLOADTHING_SECRET) {
    return null;
  }
  return new UTApi();
}

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

export function isUploadThingUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.toLowerCase();
    return (
      host === "utfs.io" ||
      host.endsWith(".ufs.sh") ||
      host === "uploadthing.com" ||
      host.endsWith(".uploadthing.com")
    );
  } catch {
    return false;
  }
}

export function extractUploadThingKey(url: string | null | undefined): string | null {
  if (!isUploadThingUrl(url)) return null;
  try {
    const parsed = new URL(url!.trim());
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length >= 2 && parts[0] === "f") {
      return parts[1];
    }
    if (parts.length >= 3 && parts[0] === "a") {
      return parts[2];
    }
    return parts[parts.length - 1] ?? null;
  } catch {
    return null;
  }
}

export function isManagedMediaUrl(url: string | null | undefined): boolean {
  return isUploadThingUrl(url) || isLocalMediaUrl(url);
}

async function deleteLocalFile(fileName: string): Promise<boolean> {
  const targetPath = path.resolve(MEDIA_DIR, fileName);

  if (!targetPath.startsWith(MEDIA_DIR)) {
    console.warn("[media] Security block: attempt to delete outside public/media:", targetPath);
    return false;
  }

  try {
    await unlink(targetPath);
    return true;
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || code === "EROFS") {
      return false;
    }
    console.error(`[media] Failed to unlink file ${fileName}:`, err);
    return false;
  }
}

/**
 * Safely delete a list of managed media URLs (UploadThing cloud files and/or local /media/ files).
 * Never touches static assets outside managed uploads.
 */
export async function deleteMediaFiles(urls: (string | null | undefined)[]): Promise<number> {
  const valid = urls
    .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
    .map((u) => u.trim());

  if (valid.length === 0) return 0;

  const utKeys = new Set<string>();
  const localFiles = new Set<string>();

  for (const url of valid) {
    const utKey = extractUploadThingKey(url);
    if (utKey) {
      utKeys.add(utKey);
      continue;
    }
    const localName = extractMediaFileName(url);
    if (localName) {
      localFiles.add(localName);
    }
  }

  let deletedCount = 0;

  if (utKeys.size > 0) {
    const utapi = getUTApi();
    if (utapi) {
      try {
        const res = await utapi.deleteFiles(Array.from(utKeys));
        deletedCount += res.deletedCount;
      } catch (err) {
        console.error("[media] Failed to delete UploadThing files:", err);
      }
    }
  }

  if (localFiles.size > 0) {
    const results = await Promise.all(Array.from(localFiles).map(deleteLocalFile));
    deletedCount += results.filter(Boolean).length;
  }

  return deletedCount;
}

/**
 * Safely delete a single managed media URL (UploadThing or local /media/).
 */
export async function deleteMediaFile(url: string | null | undefined): Promise<boolean> {
  if (!url) return false;
  const count = await deleteMediaFiles([url]);
  return count > 0;
}

/**
 * When an entity (Product, Article, Section) is updated, compare previous images vs new images.
 * Any removed UploadThing or local file will be deleted.
 */
export async function cleanupOrphanedEntityMedia(
  oldUrls: (string | null | undefined)[],
  newUrls: (string | null | undefined)[]
): Promise<number> {
  const newSet = new Set(newUrls.filter(isManagedMediaUrl).map((u) => u!.trim()));
  const toDelete = oldUrls
    .filter(isManagedMediaUrl)
    .map((u) => u!.trim())
    .filter((u) => !newSet.has(u));

  if (toDelete.length === 0) return 0;
  return deleteMediaFiles(toDelete);
}

/**
 * Scan all media-bearing database tables and collect every referenced URL,
 * UploadThing file key, and local /media/ file name.
 */
async function collectActiveMediaRefs(): Promise<{
  urls: Set<string>;
  uploadThingKeys: Set<string>;
  localFileNames: Set<string>;
}> {
  const [products, blogs, categories, sections, services, milestones, siteSettings] =
    await Promise.all([
      prisma.product.findMany({ select: { images: true } }),
      prisma.blog.findMany({ select: { images: true, coverImage: true } }),
      prisma.category.findMany({ select: { image: true } }),
      prisma.pageSection.findMany({ select: { image: true, meta: true } }),
      prisma.service.findMany({ select: { image: true } }),
      prisma.milestone.findMany({ select: { image: true } }),
      prisma.siteSetting.findMany({ select: { meta: true } }),
    ]);

  const urls = new Set<string>();
  const uploadThingKeys = new Set<string>();
  const localFileNames = new Set<string>();

  const registerUrl = (raw: unknown) => {
    if (typeof raw !== "string") return;
    const trimmed = raw.trim();
    if (!trimmed) return;
    urls.add(trimmed);

    const utKey = extractUploadThingKey(trimmed);
    if (utKey) uploadThingKeys.add(utKey);

    const fileName = extractMediaFileName(trimmed);
    if (fileName) localFileNames.add(fileName);
  };

  const registerJsonUrls = (meta: unknown) => {
    if (!meta || typeof meta !== "object") return;
    const metaStr = JSON.stringify(meta);
    const matches = metaStr.match(
      /(?:https?:\/\/[^\s"']+|\/media\/[a-zA-Z0-9_\-\.]+)/g
    );
    if (matches) matches.forEach(registerUrl);
  };

  for (const p of products) {
    if (Array.isArray(p.images)) p.images.forEach(registerUrl);
  }
  for (const b of blogs) {
    if (Array.isArray(b.images)) b.images.forEach(registerUrl);
    if (b.coverImage) registerUrl(b.coverImage);
  }
  for (const c of categories) {
    if (c.image) registerUrl(c.image);
  }
  for (const s of sections) {
    if (s.image) registerUrl(s.image);
    registerJsonUrls(s.meta);
  }
  for (const serv of services) {
    if (serv.image) registerUrl(serv.image);
  }
  for (const m of milestones) {
    if (m.image) registerUrl(m.image);
  }
  for (const ss of siteSettings) {
    registerJsonUrls(ss.meta);
  }

  return { urls, uploadThingKeys, localFileNames };
}

/**
 * Check whether a media URL (UploadThing or local /media/) is currently referenced in any database table.
 */
export async function isMediaInUse(url: string): Promise<boolean> {
  const trimmed = url.trim();
  if (!trimmed) return false;

  try {
    const refs = await collectActiveMediaRefs();
    if (refs.urls.has(trimmed)) return true;

    const utKey = extractUploadThingKey(trimmed);
    if (utKey && refs.uploadThingKeys.has(utKey)) return true;

    const fileName = extractMediaFileName(trimmed);
    if (fileName && refs.localFileNames.has(fileName)) return true;

    return false;
  } catch (error) {
    console.error("[isMediaInUse]", error);
    // In case of database connection issues, err on the side of caution
    return true;
  }
}

/**
 * Maintenance scanner: checks UploadThing cloud storage (and local public/media/ if present)
 * against all database tables and deletes orphaned files to conserve free-tier quota.
 */
export async function cleanAllOrphanedMedia(): Promise<{
  scanned: number;
  deleted: number;
  freedBytes: number;
  deletedFiles: string[];
}> {
  let scanned = 0;
  let deletedCount = 0;
  let freedBytes = 0;
  const deletedFiles: string[] = [];

  try {
    const activeRefs = await collectActiveMediaRefs();
    const now = Date.now();

    // 1. Clean orphaned files on UploadThing cloud storage
    const utapi = getUTApi();
    if (utapi) {
      const orphanKeys: string[] = [];
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const page = await utapi.listFiles({ limit: 500, offset });
        scanned += page.files.length;

        for (const file of page.files) {
          if (file.status !== "Uploaded") continue;
          // Leave very recent uploads alone in case a user is still editing a form
          if (now - file.uploadedAt < ORPHAN_GRACE_PERIOD_MS) continue;
          if (!activeRefs.uploadThingKeys.has(file.key)) {
            orphanKeys.push(file.key);
            freedBytes += file.size;
            deletedFiles.push(file.name || file.key);
          }
        }

        hasMore = page.hasMore;
        offset += page.files.length;
        if (page.files.length === 0) break;
      }

      // Delete in batches of 100
      for (let i = 0; i < orphanKeys.length; i += 100) {
        const batch = orphanKeys.slice(i, i + 100);
        const res = await utapi.deleteFiles(batch);
        deletedCount += res.deletedCount;
      }
    }

    // 2. Clean orphaned local files in public/media/ (if directory exists locally)
    let filesOnDisk: string[] = [];
    try {
      filesOnDisk = await readdir(MEDIA_DIR);
    } catch {
      filesOnDisk = [];
    }

    scanned += filesOnDisk.length;
    for (const file of filesOnDisk) {
      if (!activeRefs.localFileNames.has(file)) {
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

    return { scanned, deleted: deletedCount, freedBytes, deletedFiles };
  } catch (error) {
    console.error("[cleanAllOrphanedMedia]", error);
    return { scanned, deleted: deletedCount, freedBytes, deletedFiles };
  }
}
