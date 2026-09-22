"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createHash } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createSession, destroySession } from "@/lib/auth";
import {
  loginSchema,
  productSchema,
  categorySchema,
  pageSectionSchema,
  statSchema,
  blogSchema,
  serviceSchema,
  officeSchema,
  valueSchema,
  supplyStepSchema,
  checklistItemSchema,
  milestoneSchema,
  settingsSchema,
  inquiryStatusSchema,
} from "@/lib/validation";

export type AdminActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

/** Rebuild every public route after a content/settings change. */
function revalidateContent() {
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

export async function loginAdmin(_prev: AdminActionState | null, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email and password." } satisfies AdminActionState;
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || user.passwordHash !== hashPassword(parsed.data.password) || !user.isActive) {
    return { ok: false, error: "Invalid credentials." } satisfies AdminActionState;
  }

  await createSession(user.id);
  redirect("/admin");
}

export async function logoutAdmin() {
  await destroySession();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Catalog: products
// ---------------------------------------------------------------------------

export async function saveProduct(_prev: AdminActionState | null, formData: FormData) {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    id: formData.get("id") ?? undefined,
    title: formData.get("title"),
    slug: formData.get("slug"),
    summary: formData.get("summary"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    tradeType: formData.get("tradeType"),
    origin: formData.get("origin"),
    unit: formData.get("unit"),
    price: formData.get("price") || null,
    status: formData.get("status"),
    availability: formData.get("availability") || null,
    isFeatured: formData.get("isFeatured") === "on",
    images: JSON.parse((formData.get("images") as string) || "[]"),
    specs: JSON.parse((formData.get("specs") as string) || "{}"),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors } satisfies AdminActionState;
  }

  const data = {
    ...parsed.data,
    id: undefined,
    specs: parsed.data.specs as Prisma.InputJsonValue,
    images: parsed.data.images as Prisma.ProductCreateInput["images"],
    price: parsed.data.price ?? undefined,
    availability: parsed.data.availability ?? null,
    seoTitle: parsed.data.seoTitle,
    seoDescription: parsed.data.seoDescription,
  };

  if (parsed.data.id) {
    await prisma.product.update({ where: { id: parsed.data.id }, data });
  } else {
    await prisma.product.create({ data });
  }

  revalidatePath("/products");
  revalidatePath("/admin/products");
  return { ok: true } satisfies AdminActionState;
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.product.delete({ where: { id } });
  revalidatePath("/products");
  revalidatePath("/admin/products");
}

// ---------------------------------------------------------------------------
// Catalog: categories
// ---------------------------------------------------------------------------

export async function saveCategory(_prev: AdminActionState | null, formData: FormData) {
  await requireAdmin();

  const parsed = categorySchema.safeParse({
    id: formData.get("id") ?? undefined,
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    image: formData.get("image"),
    position: formData.get("position") || 0,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors } satisfies AdminActionState;
  }

  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.category.update({ where: { id }, data });
  } else {
    await prisma.category.create({ data });
  }

  revalidatePath("/products");
  revalidatePath("/admin");
  return { ok: true } satisfies AdminActionState;
}

// ---------------------------------------------------------------------------
// Content: page sections, stats, services
// ---------------------------------------------------------------------------

export async function savePageSection(_prev: AdminActionState | null, formData: FormData) {
  await requireAdmin();

  const parsed = pageSectionSchema.safeParse({
    id: formData.get("id") ?? undefined,
    page: formData.get("page"),
    key: formData.get("key"),
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
    body: formData.get("body"),
    image: formData.get("image"),
    meta: JSON.parse((formData.get("meta") as string) || "{}"),
    position: formData.get("position") || 0,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors } satisfies AdminActionState;
  }

  const { id, ...rawData } = parsed.data;
  const data = { ...rawData, meta: rawData.meta as Prisma.InputJsonValue };

  if (id) {
    await prisma.pageSection.update({ where: { id }, data });
  } else {
    await prisma.pageSection.upsert({
      where: { page_key: { page: data.page, key: data.key } },
      update: data,
      create: data,
    });
  }

  revalidateContent();
  return { ok: true } satisfies AdminActionState;
}

export async function submitPageSection(formData: FormData) {
  await savePageSection(null, formData);
}

export async function submitStat(formData: FormData) {
  await saveStat(null, formData);
}

export async function saveStat(_prev: AdminActionState | null, formData: FormData) {
  await requireAdmin();

  const parsed = statSchema.safeParse({
    id: formData.get("id") ?? undefined,
    label: formData.get("label"),
    value: formData.get("value"),
    suffix: formData.get("suffix"),
    position: formData.get("position") || 0,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors } satisfies AdminActionState;
  }

  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.stat.update({ where: { id }, data });
  } else {
    await prisma.stat.create({ data });
  }

  revalidateContent();
  return { ok: true } satisfies AdminActionState;
}

export async function deleteStat(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.stat.delete({ where: { id } });
  revalidateContent();
}

export async function saveService(_prev: AdminActionState | null, formData: FormData) {
  await requireAdmin();

  const parsed = serviceSchema.safeParse({
    id: formData.get("id") ?? undefined,
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    icon: formData.get("icon"),
    image: formData.get("image"),
    position: formData.get("position") || 0,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors } satisfies AdminActionState;
  }

  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.service.update({ where: { id }, data });
  } else {
    await prisma.service.create({ data });
  }

  revalidateContent();
  return { ok: true } satisfies AdminActionState;
}

export async function deleteService(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.service.delete({ where: { id } });
  revalidateContent();
}

export async function submitService(formData: FormData) {
  await saveService(null, formData);
}

export async function submitOffice(formData: FormData) {
  await saveOffice(null, formData);
}

export async function submitValue(formData: FormData) {
  await saveValue(null, formData);
}

export async function submitSupplyStep(formData: FormData) {
  await saveSupplyStep(null, formData);
}

export async function submitChecklistItem(formData: FormData) {
  await saveChecklistItem(null, formData);
}

export async function submitMilestone(formData: FormData) {
  await saveMilestone(null, formData);
}

// ---------------------------------------------------------------------------
// Content collections: offices, values, supply steps, checklists, milestones
// ---------------------------------------------------------------------------

export async function saveOffice(_prev: AdminActionState | null, formData: FormData) {
  await requireAdmin();

  const parsed = officeSchema.safeParse({
    id: formData.get("id") ?? undefined,
    name: formData.get("name"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    whatsapp: formData.get("whatsapp"),
    position: formData.get("position") || 0,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors } satisfies AdminActionState;
  }

  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.office.update({ where: { id }, data });
  } else {
    await prisma.office.create({ data });
  }

  revalidateContent();
  return { ok: true } satisfies AdminActionState;
}

export async function deleteOffice(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.office.delete({ where: { id } });
  revalidateContent();
}

export async function saveValue(_prev: AdminActionState | null, formData: FormData) {
  await requireAdmin();

  const parsed = valueSchema.safeParse({
    id: formData.get("id") ?? undefined,
    title: formData.get("title"),
    description: formData.get("description"),
    icon: formData.get("icon") || "Globe2",
    position: formData.get("position") || 0,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors } satisfies AdminActionState;
  }

  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.companyValue.update({ where: { id }, data });
  } else {
    await prisma.companyValue.create({ data });
  }

  revalidateContent();
  return { ok: true } satisfies AdminActionState;
}

export async function deleteValue(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.companyValue.delete({ where: { id } });
  revalidateContent();
}

export async function saveSupplyStep(_prev: AdminActionState | null, formData: FormData) {
  await requireAdmin();

  const parsed = supplyStepSchema.safeParse({
    id: formData.get("id") ?? undefined,
    title: formData.get("title"),
    description: formData.get("description"),
    icon: formData.get("icon") || "Route",
    position: formData.get("position") || 0,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors } satisfies AdminActionState;
  }

  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.supplyStep.update({ where: { id }, data });
  } else {
    await prisma.supplyStep.create({ data });
  }

  revalidateContent();
  return { ok: true } satisfies AdminActionState;
}

export async function deleteSupplyStep(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.supplyStep.delete({ where: { id } });
  revalidateContent();
}

export async function saveChecklistItem(_prev: AdminActionState | null, formData: FormData) {
  await requireAdmin();

  const parsed = checklistItemSchema.safeParse({
    id: formData.get("id") ?? undefined,
    group: formData.get("group"),
    title: formData.get("title"),
    position: formData.get("position") || 0,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors } satisfies AdminActionState;
  }

  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.checklistItem.update({ where: { id }, data });
  } else {
    await prisma.checklistItem.create({ data });
  }

  revalidateContent();
  return { ok: true } satisfies AdminActionState;
}

export async function deleteChecklistItem(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.checklistItem.delete({ where: { id } });
  revalidateContent();
}

export async function saveMilestone(_prev: AdminActionState | null, formData: FormData) {
  await requireAdmin();

  const parsed = milestoneSchema.safeParse({
    id: formData.get("id") ?? undefined,
    year: formData.get("year"),
    title: formData.get("title"),
    description: formData.get("description"),
    image: formData.get("image"),
    position: formData.get("position") || 0,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors } satisfies AdminActionState;
  }

  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.milestone.update({ where: { id }, data });
  } else {
    await prisma.milestone.create({ data });
  }

  revalidateContent();
  return { ok: true } satisfies AdminActionState;
}

export async function deleteMilestone(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.milestone.delete({ where: { id } });
  revalidateContent();
}

// ---------------------------------------------------------------------------
// Brand settings
// ---------------------------------------------------------------------------

export async function saveSiteSettings(_prev: AdminActionState | null, formData: FormData) {
  await requireAdmin();

  const parsed = settingsSchema.safeParse({
    companyName: formData.get("companyName"),
    legalName: formData.get("legalName"),
    shortName: formData.get("shortName"),
    tagline: formData.get("tagline"),
    description: formData.get("description"),
    url: formData.get("url"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
    facebook: formData.get("facebook"),
    linkedin: formData.get("linkedin"),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors } satisfies AdminActionState;
  }

  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: { meta: parsed.data as Prisma.InputJsonValue },
    create: { id: 1, meta: parsed.data as Prisma.InputJsonValue },
  });

  revalidateContent();
  return { ok: true } satisfies AdminActionState;
}

export async function submitSiteSettings(formData: FormData) {
  await saveSiteSettings(null, formData);
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

export async function saveBlog(_prev: AdminActionState | null, formData: FormData) {
  const user = await requireAdmin();

  const parsed = blogSchema.safeParse({
    id: formData.get("id") ?? undefined,
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    body: formData.get("body"),
    coverImage: formData.get("coverImage"),
    tags: String(formData.get("tags") ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    status: formData.get("status"),
    publishedAt: formData.get("publishedAt") || new Date(),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors } satisfies AdminActionState;
  }

  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.blog.update({ where: { id }, data });
  } else {
    await prisma.blog.create({ data: { ...data, authorId: user.id } });
  }

  revalidatePath("/news");
  revalidatePath("/admin/news");
  return { ok: true } satisfies AdminActionState;
}

export async function deleteBlog(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.blog.delete({ where: { id } });
  revalidatePath("/news");
  revalidatePath("/admin/news");
}

// ---------------------------------------------------------------------------
// Inquiries / leads
// ---------------------------------------------------------------------------

export async function updateInquiryStatus(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id");
  const status = formData.get("status");
  if (typeof id !== "string" || typeof status !== "string") return;

  const parsed = inquiryStatusSchema.safeParse(status);
  if (!parsed.success) return;

  await prisma.inquiry.update({ where: { id }, data: { status: parsed.data } });
  revalidatePath("/admin/inquiries");
}

export async function deleteInquiry(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.inquiry.delete({ where: { id } });
  revalidatePath("/admin/inquiries");
}