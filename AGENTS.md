# Next.js SEO, Core Web Vitals & Domain Architecture Rules

You are an expert Next.js (App Router) developer focused on Technical SEO, Core Web Vitals (LCP < 2.5s), and clean architecture. Strictly follow these rules whenever creating or modifying pages, components, layouts, or configurations.

## 1. Domain & Canonical Management (Free Subdomain Ready)
- **Single Source of Truth:** Never hardcode domain names (e.g., `nip.io`, `publicvm.com`, or `localhost`). Always read the base URL from `process.env.NEXT_PUBLIC_SITE_URL` with a safe fallback.
- **Metadata Base:** Set `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')` in the root `app/layout.tsx`.
- **Canonical URLs:** Every public page must define `alternates: { canonical: './' }` inside its `metadata` or `generateMetadata` export so search engines index the exact active domain and avoid duplicate content penalties across temporary/free domains.
- **Environment Variable Example:** Ensure `.env.example` documents `NEXT_PUBLIC_SITE_URL=https://pacific-global-myanmar.publicvm.com`.

## 2. Rendering & Metadata Strategy
- **Server-First Rendering:** Keep pages as React Server Components (RSC) by default. Only add `'use client'` to small, isolated interactive leaf components (e.g., mobile menu toggles, filter forms, modals). Never make an entire `page.tsx` a client component.
- **Dynamic & Static Metadata:**
  - Every route must export static `metadata` or async `generateMetadata()`.
  - Include unique `title` (50–60 chars), `description` (150–160 chars), `openGraph` (title, description, url, siteName, images, type), and `twitter` (`summary_large_image`) tags.
  - Use a title template in `app/layout.tsx`: `title: { default: 'Pacific Global Myanmar', template: '%s | Pacific Global Myanmar' }`.

## 3. Core Web Vitals & LCP Optimization (Target LCP < 2.5s)
- **Hero / Above-the-Fold Images:**
  - Always use `next/image` (`<Image />`) instead of standard `<img>` tags or CSS `background-image` for hero banners.
  - Add `priority` and `fetchPriority="high"` to the main Hero image (the Largest Contentful Paint element).
  - Never apply `loading="lazy"` to above-the-fold images.
- **Image Sizing & Formats:**
  - Always specify explicit `width` and `height` (or `fill` with a sized relative parent container) to prevent Cumulative Layout Shift (CLS = 0).
  - Configure `sizes` prop accurately on responsive images (e.g., `sizes="(max-width: 768px) 100vw, 50vw"`).
  - Enforce descriptive, keyword-relevant `alt` attributes on every `<Image />` (use `alt=""` only for purely decorative icons).
- **Fonts:** Load fonts exclusively via `next/font/google` or `next/font/local` with `display: 'swap'` to eliminate layout shifts and render-blocking font requests.

## 4. Technical SEO Files (`app/sitemap.ts` & `app/robots.ts`)
- **Dynamic Sitemap (`app/sitemap.ts`):**
  - Generate an XML sitemap dynamically using `MetadataRoute.Sitemap`.
  - Include all static routes and dynamically fetched routes (e.g., product/commodity pages) with `lastModified`, `changeFrequency`, and `priority`.
  - Construct all URLs using `process.env.NEXT_PUBLIC_SITE_URL`.
- **Robots Configuration (`app/robots.ts`):**
  - Generate `robots.txt` using `MetadataRoute.Robots`.
  - Allow all crawlers (`userAgent: '*'`, `allow: '/'`) on public routes, disallow private/admin/API routes (`/api/`, `/admin/`, `/dashboard/`), and link `sitemap: `${baseUrl}/sitemap.xml``.

## 5. Semantic HTML & Structured Data (JSON-LD)
- **Heading Hierarchy:** Enforce strictly ONE `<h1>` per page containing the primary topic/keywords. Follow sequential order (`<h2>` -> `<h3>`) without skipping levels.
- **Semantic Landmarks:** Wrap page sections in `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, and `<footer>` rather than generic nested `<div>` elements.
- **JSON-LD Schema:** Inject valid `application/ld+json` structured data scripts in `layout.tsx` (for `Organization` / `LocalBusiness` schema) and in detail pages (for `Product` / `BreadcrumbList` schema) to enable Google Rich Snippets.
- **Crawlable Links:** Use Next.js `<Link href="...">` with descriptive anchor text for all internal navigation. Never use `<div onClick={...}>` or `<button>` for page-to-page routing.