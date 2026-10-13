"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createHash } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createSession, destroySession } from "@/lib/auth";
import { flashAdminToast, TOAST_COOKIE } from "@/lib/toast";
import {
  loginSchema,
  productSchema,
  categorySchema,
  tradeTypeSchema,
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

/**
 * Rebuild the whole admin tree so the layout re-renders and picks up the
 * flash toast cookie set by the calling action.
 */
function revalidateAdminContent() {
  revalidateContent();
  revalidatePath("/admin", "layout");
}

/** Erase a consumed flash toast cookie (called client-side from AdminFlash). */
export async function clearAdminToast() {
  const cookieStore = await cookies();
  cookieStore.delete(TOAST_COOKIE);
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
  await flashAdminToast({ type: "success", text: "Welcome back." });
  redirect("/admin");
}

export async function logoutAdmin() {
  await destroySession();
  await flashAdminToast({ type: "info", text: "You've been signed out." });
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
    summary: formData.get("summary"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    tradeTypeIds: formData.getAll("tradeTypeIds"),
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

  const { tradeTypeIds, ...rest } = parsed.data;
  const data = {
    ...rest,
    id: undefined,
    specs: rest.specs as Prisma.InputJsonValue,
    images: rest.images as Prisma.ProductCreateInput["images"],
    price: rest.price ?? undefined,
    availability: rest.availability ?? null,
    seoTitle: rest.seoTitle,
    seoDescription: rest.seoDescription,
  };

  const validTypeIds =
    tradeTypeIds.length > 0
      ? (
          await prisma.tradeType.findMany({
            where: { id: { in: tradeTypeIds } },
            select: { id: true },
          })
        ).map((t) => t.id)
      : [];

  if (parsed.data.id) {
    await prisma.$transaction([
      prisma.product.update({ where: { id: parsed.data.id }, data }),
      prisma.productTradeType.deleteMany({ where: { productId: parsed.data.id } }),
      ...validTypeIds.map((tradeTypeId) =>
        prisma.productTradeType.create({
          data: { productId: parsed.data.id!, tradeTypeId },
        })
      ),
    ]);
  } else {
    const created = await prisma.product.create({ data });
    if (validTypeIds.length > 0) {
      await prisma.productTradeType.createMany({
        data: validTypeIds.map((tradeTypeId) => ({ productId: created.id, tradeTypeId })),
      });
    }
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
  await flashAdminToast({ type: "success", text: "Product deleted." });
  revalidateAdminContent();
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
    await flashAdminToast({ type: "error", text: "Please check the form — some fields need fixing." });
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors } satisfies AdminActionState;
  }

  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.category.update({ where: { id }, data });
  } else {
    await prisma.category.create({ data });
  }

  await flashAdminToast({ type: "success", text: id ? "Category updated." : "Category created." });
  revalidateAdminContent();
  return { ok: true } satisfies AdminActionState;
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    await flashAdminToast({
      type: "error",
      text: `Can't delete — ${productCount} product(s) are still in this category. Move them first.`,
    });
    revalidateAdminContent();
    return;
  }

  try {
    await prisma.category.delete({ where: { id } });
  } catch {
    await flashAdminToast({ type: "error", text: "Can't delete this category right now." });
    revalidateAdminContent();
    return;
  }

  await flashAdminToast({ type: "success", text: "Category deleted." });
  revalidateAdminContent();
}

export async function submitCategory(formData: FormData) {
  await saveCategory(null, formData);
}

export async function saveTradeType(_prev: AdminActionState | null, formData: FormData) {
  await requireAdmin();

  const parsed = tradeTypeSchema.safeParse({
    id: formData.get("id") ?? undefined,
    label: formData.get("label"),
    description: formData.get("description"),
    position: formData.get("position") || 0,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    await flashAdminToast({ type: "error", text: "Please check the form — some fields need fixing." });
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors } satisfies AdminActionState;
  }

  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.tradeType.update({ where: { id }, data });
  } else {
    const existing = await prisma.tradeType.findFirst({
      where: { label: { equals: data.label, mode: "insensitive" } },
    });
    if (existing) {
      await prisma.tradeType.update({ where: { id: existing.id }, data });
    } else {
      await prisma.tradeType.create({ data });
    }
  }

  await flashAdminToast({ type: "success", text: id ? "Trade type updated." : "Trade type created." });
  revalidateAdminContent();
  return { ok: true } satisfies AdminActionState;
}

export async function deleteTradeType(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  const productCount = await prisma.productTradeType.count({ where: { tradeTypeId: id } });
  if (productCount > 0) {
    await flashAdminToast({
      type: "error",
      text: `Can't delete — ${productCount} product(s) still use this trade type. Unassign them first.`,
    });
    revalidateAdminContent();
    return;
  }

  try {
    await prisma.tradeType.delete({ where: { id } });
  } catch {
    await flashAdminToast({ type: "error", text: "Can't delete this trade type right now." });
    revalidateAdminContent();
    return;
  }

  await flashAdminToast({ type: "success", text: "Trade type deleted." });
  revalidateAdminContent();
}

export async function submitTradeType(formData: FormData) {
  await saveTradeType(null, formData);
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
    title: formData.get("title") ?? undefined,
    subtitle: formData.get("subtitle") ?? undefined,
    body: formData.get("body") ?? undefined,
    image: formData.get("image") ?? undefined,
    meta: JSON.parse((formData.get("meta") as string) || "{}"),
    position: formData.get("position") || 0,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    await flashAdminToast({ type: "error", text: "Please check the form — some fields need fixing." });
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

  await flashAdminToast({ type: "success", text: "Section saved." });
  revalidateAdminContent();
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
    await flashAdminToast({ type: "error", text: "Please check the form — some fields need fixing." });
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors } satisfies AdminActionState;
  }

  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.stat.update({ where: { id }, data });
  } else {
    await prisma.stat.create({ data });
  }

  await flashAdminToast({ type: "success", text: id ? "Stat updated." : "Stat created." });
  revalidateAdminContent();
  return { ok: true } satisfies AdminActionState;
}

export async function deleteStat(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.stat.delete({ where: { id } });
  await flashAdminToast({ type: "success", text: "Stat deleted." });
  revalidateAdminContent();
}

export async function saveService(_prev: AdminActionState | null, formData: FormData) {
  await requireAdmin();

  const parsed = serviceSchema.safeParse({
    id: formData.get("id") ?? undefined,
    title: formData.get("title"),
    description: formData.get("description"),
    icon: formData.get("icon"),
    image: formData.get("image"),
    position: formData.get("position") || 0,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    await flashAdminToast({ type: "error", text: "Please check the form — some fields need fixing." });
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors } satisfies AdminActionState;
  }

  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.service.update({ where: { id }, data });
  } else {
    await prisma.service.create({ data });
  }

  await flashAdminToast({ type: "success", text: id ? "Service updated." : "Service created." });
  revalidateAdminContent();
  return { ok: true } satisfies AdminActionState;
}

export async function deleteService(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.service.delete({ where: { id } });
  await flashAdminToast({ type: "success", text: "Service deleted." });
  revalidateAdminContent();
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
    await flashAdminToast({ type: "error", text: "Please check the form — some fields need fixing." });
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors } satisfies AdminActionState;
  }

  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.office.update({ where: { id }, data });
  } else {
    await prisma.office.create({ data });
  }

  await flashAdminToast({ type: "success", text: id ? "Office updated." : "Office created." });
  revalidateAdminContent();
  return { ok: true } satisfies AdminActionState;
}

export async function deleteOffice(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.office.delete({ where: { id } });
  await flashAdminToast({ type: "success", text: "Office deleted." });
  revalidateAdminContent();
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
    await flashAdminToast({ type: "error", text: "Please check the form — some fields need fixing." });
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors } satisfies AdminActionState;
  }

  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.companyValue.update({ where: { id }, data });
  } else {
    await prisma.companyValue.create({ data });
  }

  await flashAdminToast({ type: "success", text: id ? "Value updated." : "Value created." });
  revalidateAdminContent();
  return { ok: true } satisfies AdminActionState;
}

export async function deleteValue(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.companyValue.delete({ where: { id } });
  await flashAdminToast({ type: "success", text: "Value deleted." });
  revalidateAdminContent();
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
    await flashAdminToast({ type: "error", text: "Please check the form — some fields need fixing." });
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors } satisfies AdminActionState;
  }

  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.supplyStep.update({ where: { id }, data });
  } else {
    await prisma.supplyStep.create({ data });
  }

  await flashAdminToast({ type: "success", text: id ? "Step updated." : "Step created." });
  revalidateAdminContent();
  return { ok: true } satisfies AdminActionState;
}

export async function deleteSupplyStep(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.supplyStep.delete({ where: { id } });
  await flashAdminToast({ type: "success", text: "Step deleted." });
  revalidateAdminContent();
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
    await flashAdminToast({ type: "error", text: "Please check the form — some fields need fixing." });
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors } satisfies AdminActionState;
  }

  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.checklistItem.update({ where: { id }, data });
  } else {
    await prisma.checklistItem.create({ data });
  }

  await flashAdminToast({ type: "success", text: id ? "Checklist item updated." : "Checklist item created." });
  revalidateAdminContent();
  return { ok: true } satisfies AdminActionState;
}

export async function deleteChecklistItem(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.checklistItem.delete({ where: { id } });
  await flashAdminToast({ type: "success", text: "Checklist item deleted." });
  revalidateAdminContent();
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
    await flashAdminToast({ type: "error", text: "Please check the form — some fields need fixing." });
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors } satisfies AdminActionState;
  }

  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.milestone.update({ where: { id }, data });
  } else {
    await prisma.milestone.create({ data });
  }

  await flashAdminToast({ type: "success", text: id ? "Milestone updated." : "Milestone created." });
  revalidateAdminContent();
  return { ok: true } satisfies AdminActionState;
}

export async function deleteMilestone(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.milestone.delete({ where: { id } });
  await flashAdminToast({ type: "success", text: "Milestone deleted." });
  revalidateAdminContent();
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
    brandTag: formData.get("brandTag"),
    tagline: formData.get("tagline"),
    logo: formData.get("logo") || "",
    description: formData.get("description"),
    url: formData.get("url"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
    viber: formData.get("viber") || "",
    telegram: formData.get("telegram") || "",
    facebook: formData.get("facebook"),
    linkedin: formData.get("linkedin"),
    regNumber: formData.get("regNumber") || "",
    exportLicense: formData.get("exportLicense") || "",
  });

  if (!parsed.success) {
    await flashAdminToast({ type: "error", text: "Please check the form — some fields need fixing." });
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors } satisfies AdminActionState;
  }

  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: { meta: parsed.data as Prisma.InputJsonValue },
    create: { id: 1, meta: parsed.data as Prisma.InputJsonValue },
  });

  await flashAdminToast({ type: "success", text: "Site settings saved." });
  revalidateAdminContent();
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
  await flashAdminToast({ type: "success", text: "Article deleted." });
  revalidateAdminContent();
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
  if (!parsed.success) {
    await flashAdminToast({ type: "error", text: "Invalid status." });
    revalidateAdminContent();
    return;
  }

  await prisma.inquiry.update({ where: { id }, data: { status: parsed.data } });
  await flashAdminToast({ type: "success", text: "Inquiry status updated." });
  revalidateAdminContent();
}

export async function deleteInquiry(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.inquiry.delete({ where: { id } });
  await flashAdminToast({ type: "success", text: "Inquiry deleted." });
  revalidateAdminContent();
}