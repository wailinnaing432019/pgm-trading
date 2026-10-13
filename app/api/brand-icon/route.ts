import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "node:path";
import { getSiteSettings } from "@/lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    default:
      return "image/png";
  }
}

/**
 * Serves the brand logo set in Brand & settings as the site favicon,
 * falling back to a baked brand-icon.png when no logo is configured.
 */
export async function GET() {
  let settings: { logo?: string | null } | null = null;
  try {
    settings = await getSiteSettings();
  } catch {
    // DB unavailable — fall back to the static icon.
  }

  const candidates = settings?.logo ? [settings.logo] : [];
  candidates.push("/brand-icon.png");

  for (const asset of candidates) {
    const filePath = path.join(process.cwd(), "public", asset.replace(/^\/+/, ""));
    try {
      const buffer = await readFile(filePath);
      return new NextResponse(buffer, {
        headers: { "Content-Type": contentTypeFor(filePath), ...CACHE_HEADERS },
      });
    } catch {
      continue;
    }
  }

  return new NextResponse(null, { status: 404 });
}