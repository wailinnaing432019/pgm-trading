import "server-only";
import { cache } from "react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveSettings, siteDefaults, type SiteSettings } from "@/lib/site";

/**
 * All public-facing reads are wrapped in React.cache so multiple Server
 * Components on the same request share one query. Queries gracefully fall
 * back to empty results when the database is unreachable (e.g. local dev
 * before `prisma db push`), keeping the site renderable end-to-end.
 */
async function safe<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    console.error("[queries] database query failed:", error);
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Home page
// ---------------------------------------------------------------------------

export type HomeData = {
  hero: Awaited<ReturnType<typeof getSection>> | null;
  story: Awaited<ReturnType<typeof getSection>> | null;
  stats: Awaited<ReturnType<typeof getStats>>;
  services: Awaited<ReturnType<typeof getServices>>;
  featuredProducts: Awaited<ReturnType<typeof getFeaturedProducts>>;
  latestNews: Awaited<ReturnType<typeof getLatestNews>>;
};

export const getHomeData = cache(async (): Promise<HomeData> => {
  const [hero, story, stats, services, featuredProducts, latestNews] = await Promise.all([
    getSection("home", "hero"),
    getSection("home", "story"),
    getStats(),
    getServices(),
    getFeaturedProducts(8),
    getLatestNews(3),
  ]);

  return { hero, story, stats, services, featuredProducts, latestNews };
});

export const getSection = cache(async (page: string, key: string) => {
  return safe(
    () =>
      prisma.pageSection.findFirst({
        where: { page, key, isActive: true },
      }),
    null
  );
});

export const getStats = cache(async () => {
  return safe(
    () =>
      prisma.stat.findMany({
        where: { isActive: true },
        orderBy: { position: "asc" },
      }),
    []
  );
});

export const getServices = cache(async () => {
  return safe(
    () =>
      prisma.service.findMany({
        where: { isActive: true },
        orderBy: { position: "asc" },
      }),
    []
  );
});

// ---------------------------------------------------------------------------
// Brand, offices & content collections
// ---------------------------------------------------------------------------

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  return safe(
    async () => {
      const row = await prisma.siteSetting.findUnique({ where: { id: 1 } });
      return resolveSettings(row?.meta ?? {});
    },
    siteDefaults
  );
});

export const getOffices = cache(async () => {
  return safe(
    () =>
      prisma.office.findMany({
        where: { isActive: true },
        orderBy: { position: "asc" },
      }),
    []
  );
});

export const getValues = cache(async () => {
  return safe(
    () =>
      prisma.companyValue.findMany({
        where: { isActive: true },
        orderBy: { position: "asc" },
      }),
    []
  );
});

export const getSupplySteps = cache(async () => {
  return safe(
    () =>
      prisma.supplyStep.findMany({
        where: { isActive: true },
        orderBy: { position: "asc" },
      }),
    []
  );
});

export const getChecklist = cache(async (group: string) => {
  return safe(
    () =>
      prisma.checklistItem.findMany({
        where: { group, isActive: true },
        orderBy: { position: "asc" },
      }),
    []
  );
});

/** All active sections for a page, keyed by section key. */
export const getPageContent = cache(async (page: string) => {
  return safe(
    async () => {
      const rows = await prisma.pageSection.findMany({
        where: { page, isActive: true },
        orderBy: { position: "asc" },
      });
      return Object.fromEntries(rows.map((row) => [row.key, row]));
    },
    {}
  );
});

export type PageContent = Awaited<ReturnType<typeof getPageContent>>;

export const getFeaturedProducts = cache(async (limit = 8) => {
  return safe(
    async () => {
      const products = await prisma.product.findMany({
        where: { status: "PUBLISHED", isFeatured: true },
        include: {
          category: true,
          tradeTypes: { include: { tradeType: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
      });
      return products.map((p) => ({
        ...p,
        price: p.price ? Number(p.price) : null,
      }));
    },
    []
  );
});

export const getLatestNews = cache(async (limit = 3) => {
  return safe(
    () =>
      prisma.blog.findMany({
        where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
        orderBy: { publishedAt: "desc" },
        take: limit,
      }),
    []
  );
});

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export type ProductListParams = {
  category?: string;
  tradeType?: string;
  q?: string;
  featuredOnly?: boolean;
  limit?: number;
  offset?: number;
};

export const getCategories = cache(async () => {
  return safe(
    () =>
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { position: "asc" },
        include: { _count: { select: { products: { where: { status: "PUBLISHED" } } } } },
      }),
    []
  );
});

export const getAdminCategories = cache(async () => {
  return safe(
    () =>
      prisma.category.findMany({
        orderBy: [{ position: "asc" }, { name: "asc" }],
        include: { _count: { select: { products: true } } },
      }),
    []
  );
});

export const getTradeTypes = cache(async () => {
  return safe(
    () =>
      prisma.tradeType.findMany({
        where: { isActive: true },
        orderBy: { position: "asc" },
      }),
    []
  );
});

export const getAdminTradeTypes = cache(async () => {
  return safe(
    () =>
      prisma.tradeType.findMany({
        orderBy: { position: "asc" },
        include: { _count: { select: { products: true } } },
      }),
    []
  );
});

export const getProducts = cache(async (params: ProductListParams = {}) => {
  const { category, tradeType, q, featuredOnly, limit = 12, offset = 0 } = params;

  const where: Prisma.ProductWhereInput = { status: "PUBLISHED" };
  if (category) where.category = { slug: category };
  if (tradeType) where.tradeTypes = { some: { tradeTypeId: tradeType } };
  if (featuredOnly) where.isFeatured = true;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { summary: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  return safe(
    async () => {
      const [items, total] = await prisma.$transaction([
        prisma.product.findMany({
          where,
          include: {
            category: true,
            tradeTypes: { include: { tradeType: true } },
          },
          orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
          take: limit,
          skip: offset,
        }),
        prisma.product.count({ where }),
      ]);

      return {
        items: items.map((p) => ({ ...p, price: p.price ? Number(p.price) : null })),
        total,
      };
    },
    { items: [], total: 0 }
  );
});

export const getProductById = cache(async (id: string) => {
  return safe(
    async () => {
      const product = await prisma.product.findFirst({
        where: { id, status: "PUBLISHED" },
        include: {
          category: true,
          tradeTypes: { include: { tradeType: true } },
        },
      });
      return product ? { ...product, price: product.price ? Number(product.price) : null } : null;
    },
    null
  );
});

// ---------------------------------------------------------------------------
// Content (About / Services / News)
// ---------------------------------------------------------------------------

export const getMilestones = cache(async () => {
  return safe(
    () =>
      prisma.milestone.findMany({
        where: { isActive: true },
        orderBy: { position: "asc" },
      }),
    []
  );
});

export const getBlogs = cache(async (limit = 50, offset = 0) => {
  return safe(
    async () => {
      const [items, total] = await prisma.$transaction([
        prisma.blog.findMany({
          where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
          include: { author: { select: { name: true } } },
          orderBy: { publishedAt: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.blog.count({ where: { status: "PUBLISHED", publishedAt: { lte: new Date() } } }),
      ]);
      return { items, total };
    },
    { items: [], total: 0 }
  );
});

export const getBlogById = cache(async (id: string) => {
  return safe(
    async () => {
      const blog = await prisma.blog.findFirst({
        where: { id, status: "PUBLISHED", publishedAt: { lte: new Date() } },
        include: { author: { select: { name: true } } },
      });
      if (blog) {
        await prisma.blog.update({ where: { id: blog.id }, data: { viewCount: { increment: 1 } } });
      }
      return blog;
    },
    null
  );
});

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const getAdminStats = cache(async () => {
  return safe(
    async () => {
      const [
        products,
        categories,
        inquiries,
        blogs,
        pendingInquiries,
        newsletters,
        services,
        offices,
        milestones,
      ] = await Promise.all([
        prisma.product.count(),
        prisma.category.count(),
        prisma.inquiry.count(),
        prisma.blog.count(),
        prisma.inquiry.count({ where: { status: "NEW" } }),
        prisma.newsletter.count(),
        prisma.service.count(),
        prisma.office.count(),
        prisma.milestone.count(),
      ]);
      return { products, categories, inquiries, blogs, pendingInquiries, newsletters, services, offices, milestones };
    },
    { products: 0, categories: 0, inquiries: 0, blogs: 0, pendingInquiries: 0, newsletters: 0, services: 0, offices: 0, milestones: 0 }
  );
});

/** All sections for a page, including inactive ones, keyed by key. */
export const getAdminSections = cache(async (page: string) => {
  return safe(
    async () => {
      const rows = await prisma.pageSection.findMany({
        where: { page },
        orderBy: { position: "asc" },
      });
      return Object.fromEntries(rows.map((row) => [row.key, row]));
    },
    {}
  );
});

export const getAdminOffices = cache(async () => {
  return safe(
    () =>
      prisma.office.findMany({
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      }),
    []
  );
});

export const getAdminValues = cache(async () => {
  return safe(
    () =>
      prisma.companyValue.findMany({
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      }),
    []
  );
});

export const getAdminSupplySteps = cache(async () => {
  return safe(
    () =>
      prisma.supplyStep.findMany({
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      }),
    []
  );
});

export const getAdminChecklist = cache(async (group: string) => {
  return safe(
    () =>
      prisma.checklistItem.findMany({
        where: { group },
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      }),
    []
  );
});

export const getAdminMilestones = cache(async () => {
  return safe(
    () =>
      prisma.milestone.findMany({
        orderBy: [{ position: "asc" }, { year: "desc" }],
      }),
    []
  );
});

export const getAdminServices = cache(async () => {
  return safe(
    () =>
      prisma.service.findMany({
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      }),
    []
  );
});

export const getAdminProducts = cache(async (query = "") => {
  return safe(
    async () => {
      const items = await prisma.product.findMany({
        where: query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { summary: { contains: query, mode: "insensitive" } },
              ],
            }
          : undefined,
        include: {
          category: { select: { name: true, slug: true } },
          tradeTypes: { include: { tradeType: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 100,
      });
      return items.map((p) => ({ ...p, price: p.price ? Number(p.price) : null }));
    },
    []
  );
});

export const getAdminInquiries = cache(async (status?: string) => {
  return safe(
    () =>
      prisma.inquiry.findMany({
        where: status ? { status: status as Prisma.InquiryWhereInput["status"] } : undefined,
        include: { assignedTo: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    []
  );
});