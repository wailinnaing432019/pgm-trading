import type { Metadata } from "next";

/**
 * Central metadata helpers.
 *
 * Editors only fill in the obvious fields (title, summary, excerpt). These
 * helpers derive clean, correctly-sized search metadata from them so nobody
 * has to think about SEO fields in the admin UI.
 */

export const SITE_NAME = "Pacific Global Myanmar";
export const SEO_TITLE_MAX = 60;
export const SEO_DESCRIPTION_MAX = 160;

/** Collapse whitespace/newlines so CMS rich text never leaks into tags. */
export function cleanMetadataText(value?: string | null): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

/** Cut on a word boundary at (roughly) the SERP limit, without an ellipsis. */
export function truncateAtWord(value: string, max: number): string {
  const text = cleanMetadataText(value);
  if (max <= 0 || text.length <= max) return text;

  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > Math.floor(max * 0.6) ? cut.slice(0, lastSpace) : cut;
  return base.replace(/[\s,;:.!?—–-]+$/, "");
}

/** Strip duplicate company suffix, then size the title for Google. */
export function metaTitle(value: string): string {
  const cleaned = cleanMetadataText(value);
  const withoutSuffix = cleaned
    .replace(/\s*(?:\||—|–|-)\s*(?:Pacific Global Myanmar|PGM Trading)\s*$/i, "")
    .trim();
  return truncateAtWord(withoutSuffix || cleaned, SEO_TITLE_MAX);
}

/** First usable description wins, sized for Google. */
export function metaDescription(...values: (string | null | undefined)[]): string | undefined {
  const found = values.map(cleanMetadataText).find(Boolean);
  if (!found) return undefined;
  return truncateAtWord(found, SEO_DESCRIPTION_MAX);
}

export type PageMetadataInput = {
  title: string;
  description?: string | null;
  /** Root-relative path, e.g. "/products/abc". Used for canonical + OG URL. */
  path: string;
  image?: string | null;
  type?: "website" | "article";
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  canonical?: string;
};

export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  noIndex = false,
  publishedTime,
  modifiedTime,
  canonical,
}: PageMetadataInput): Metadata {
  const finalTitle = metaTitle(title);
  const finalDescription = metaDescription(description);
  const finalImage = image?.trim() || undefined;

  const openGraph: Metadata["openGraph"] =
    type === "article"
      ? {
          type: "article",
          title: finalTitle,
          description: finalDescription,
          url: path,
          siteName: SITE_NAME,
          locale: "en_MM",
          ...(finalImage ? { images: [{ url: finalImage, alt: finalTitle }] } : {}),
          ...(publishedTime ? { publishedTime } : {}),
          ...(modifiedTime ? { modifiedTime } : {}),
        }
      : {
          type: "website",
          title: finalTitle,
          description: finalDescription,
          url: path,
          siteName: SITE_NAME,
          locale: "en_MM",
          ...(finalImage ? { images: [{ url: finalImage, alt: finalTitle }] } : {}),
        };

  return {
    title: finalTitle,
    ...(finalDescription ? { description: finalDescription } : {}),
    alternates: { canonical: canonical ?? "./" },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph,
    ...(finalDescription
      ? {
          twitter: {
            card: "summary_large_image",
            title: finalTitle,
            description: finalDescription,
            ...(finalImage ? { images: [finalImage] } : {}),
          },
        }
      : {}),
  };
}
