import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "node:path";
import { getSiteSettings } from "@/lib/queries";
import { brandIconFallback } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const CACHE_HEADERS = { "Cache-Control": "public, max-age=21600" };

function contentTypeFor(filePath: string): string {
  switch (path.extname(filePath).toLowerCase()) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".gif":
      return "image/gif";
    case ".avif":
      return "image/avif";
    default:
      return "image/png";
  }
}

function isRemote(asset: string): boolean {
  return /^https?:\/\//i.test(asset);
}

/** Proxy a logo stored outside /public (e.g. Cloudinary) under our own origin. */
async function readRemoteIcon(url: string): Promise<NextResponse | null> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const contentType = response.headers.get("content-type") ?? "image/png";
    if (!response.ok || !contentType.startsWith("image/")) return null;

    return new NextResponse(await response.arrayBuffer(), {
      headers: { "Content-Type": contentType, ...CACHE_HEADERS },
    });
  } catch {
    return null;
  }
}

/**
 * Serves the brand logo set in Brand & settings as the site favicon,
 * falling back to the baked brand-icon.png when no logo is configured,
 * the file is missing, or the remote logo cannot be fetched.
 */
export async function GET() {
  let settings: { logo?: string | null } | null = null;
  try {
    settings = await getSiteSettings();
  } catch {
    // DB unavailable — fall back to the static icon.
  }

  const logo = settings?.logo?.trim();
  const candidates = logo ? [logo] : [];
  candidates.push(brandIconFallback);

  for (const asset of candidates) {
    if (isRemote(asset)) {
      const remote = await readRemoteIcon(asset);
      if (remote) return remote;
      continue;
    }

    const filePath = path.join(PUBLIC_DIR, asset.replace(/^\/+/, ""));
    // Never serve files outside /public, even if the DB value is malformed.
    if (filePath !== PUBLIC_DIR && !filePath.startsWith(`${PUBLIC_DIR}${path.sep}`)) {
      continue;
    }

    try {
      const buffer = await readFile(filePath);
      return new NextResponse(buffer, {
        headers: { "Content-Type": contentTypeFor(filePath), ...CACHE_HEADERS },
      });
    } catch {
      continue;
    }
  }

  return new NextResponse(null, {
    status: 404,
    headers: { "Cache-Control": "no-store" },
  });
}
