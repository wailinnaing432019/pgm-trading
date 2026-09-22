import { z } from "zod";

// ---------------------------------------------------------------------------
// Public forms
// ---------------------------------------------------------------------------

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(120),
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  subject: z.string().trim().min(3, "Please add a short subject").max(200),
  message: z.string().trim().min(10, "Please tell us a little more").max(4000),
});

export const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
});

// ---------------------------------------------------------------------------
// Admin: catalog
// ---------------------------------------------------------------------------

export const productSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2).max(200),
  slug: z.string().trim().min(2).max(220),
  summary: z.string().trim().min(2).max(400),
  description: z.string().trim().min(2).max(20000),
  categoryId: z.string().min(1, "Choose a category"),
  tradeType: z.enum(["EXPORT", "IMPORT", "BOTH"]),
  origin: z.string().trim().max(120).optional().or(z.literal("")),
  unit: z.string().trim().max(40).optional().or(z.literal("")),
  price: z.coerce.number().nonnegative().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  availability: z.coerce.number().int().nonnegative().optional().nullable(),
  isFeatured: z.boolean().optional(),
  images: z.array(z.string()).default([]),
  specs: z.record(z.string(), z.string()).default({}),
  seoTitle: z.string().trim().max(160).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(300).optional().or(z.literal("")),
});

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  image: z.string().trim().max(500).optional().or(z.literal("")),
  position: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

// ---------------------------------------------------------------------------
// Admin: content & media
// ---------------------------------------------------------------------------

export const pageSectionSchema = z.object({
  id: z.string().optional(),
  page: z.string().trim().min(1).max(60),
  key: z.string().trim().min(1).max(60),
  title: z.string().trim().max(300).optional().or(z.literal("")),
  subtitle: z.string().trim().max(500).optional().or(z.literal("")),
  body: z.string().trim().max(10000).optional().nullable(),
  image: z.string().trim().max(500).optional().or(z.literal("")),
  meta: z.record(z.string(), z.unknown()).default({}),
  position: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const statSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(2).max(120),
  value: z.coerce.number().nonnegative(),
  suffix: z.string().trim().max(12).default("+"),
  position: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const blogSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2).max(200),
  slug: z.string().trim().min(2).max(220),
  excerpt: z.string().trim().min(2).max(400),
  body: z.string().trim().min(2),
  coverImage: z.string().trim().max(500).optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  publishedAt: z.coerce.date().optional().nullable(),
});

export const serviceSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2).max(200),
  slug: z.string().trim().min(2).max(220),
  description: z.string().trim().min(2),
  icon: z.string().trim().max(60).optional().or(z.literal("")),
  image: z.string().trim().max(500).optional().or(z.literal("")),
  position: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const officeSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(200),
  address: z.string().trim().min(2).max(500),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().toLowerCase().max(120).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
  position: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

const cardItemSchema = {
  id: z.string().optional(),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().min(2).max(2000),
  icon: z.string().trim().max(60).default("Globe2"),
  position: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
};

export const valueSchema = z.object({ ...cardItemSchema });

export const supplyStepSchema = z.object({ ...cardItemSchema });

export const checklistItemSchema = z.object({
  id: z.string().optional(),
  group: z.string().trim().min(1).max(40),
  title: z.string().trim().min(2).max(300),
  position: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const milestoneSchema = z.object({
  id: z.string().optional(),
  year: z.coerce.number().int().min(1970).max(2100),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  image: z.string().trim().max(500).optional().or(z.literal("")),
  position: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const settingsSchema = z.object({
  companyName: z.string().trim().min(1).max(200),
  legalName: z.string().trim().min(1).max(200),
  shortName: z.string().trim().min(1).max(80),
  tagline: z.string().trim().max(300),
  description: z.string().trim().max(2000),
  url: z.string().trim().url("Enter a valid site URL"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z.string().trim().max(40),
  whatsapp: z.string().trim().max(40),
  facebook: z.string().trim().max(500),
  linkedin: z.string().trim().max(500),
});

// ---------------------------------------------------------------------------
// Admin: auth / leads
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
});

export const inquiryStatusSchema = z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "ARCHIVED"]);