"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, requireAdmin, revokeOtherSessions } from "@/lib/auth";
import { hashPassword, isLegacyPasswordHash, verifyPassword } from "@/lib/password";
import { flashAdminToast, TOAST_COOKIE } from "@/lib/toast";
import type { CollectionKind } from "@/lib/section-defaults";
import {
  loginSchema,
  profileUpdateSchema,
  changePasswordSchema,
  createAdminSchema,
  updateAdminSchema,
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
import { normalizeMyanmarUnicode } from "@/lib/myanmar-unicode";
import {
  sendAdminCreatedNotification,
  sendAdminUpdatedNotification,
  sendNewsletterBroadcast,
  type BroadcastProductItem,
} from "@/lib/email";
import {
  deleteMediaFile,
  deleteMediaFiles,
  cleanupOrphanedEntityMedia,
  cleanAllOrphanedMedia,
} from "@/lib/media";

export type AdminActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

/** Safely read a JSON-encoded form field; malformed values fall back instead of throwing. */
function parseJsonField<T>(value: FormDataEntryValue | null, fallback: T): T {
  if (typeof value !== "string" || value.trim() === "") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function nullableTrimmed(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
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
  if (!user || !user.isActive || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return { ok: false, error: "Invalid credentials." } satisfies AdminActionState;
  }

  // Upgrade legacy unsalted SHA-256 hashes the next time the user signs in.
  if (isLegacyPasswordHash(user.passwordHash)) {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(parsed.data.password) },
    });
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
    id: formData.get("id") || undefined,
    title: normalizeMyanmarUnicode(String(formData.get("title") ?? "")),
    summary: normalizeMyanmarUnicode(String(formData.get("summary") ?? "")),
    description: normalizeMyanmarUnicode(String(formData.get("description") ?? "")),
    categoryId: formData.get("categoryId"),
    tradeTypeIds: formData.getAll("tradeTypeIds"),
    origin: normalizeMyanmarUnicode(String(formData.get("origin") ?? "")),
    currency: normalizeMyanmarUnicode(String(formData.get("currency") || "USD")),
    unit: normalizeMyanmarUnicode(String(formData.get("unit") ?? "")),
    price: formData.get("price") || null,
    status: formData.get("status"),
    availability: formData.get("availability") || null,
    isFeatured: formData.get("isFeatured") === "on",
    images: parseJsonField(formData.get("images"), []),
    specs: parseJsonField(formData.get("specs"), {}),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors } satisfies AdminActionState;
  }

  const { tradeTypeIds, id, currency, ...rest } = parsed.data;

  const category = await prisma.category.findUnique({
    where: { id: rest.categoryId },
    select: { id: true },
  });
  if (!category) {
    return {
      ok: false,
      fieldErrors: { categoryId: ["Choose an existing category."] },
    } satisfies AdminActionState;
  }

  const validTypeIds =
    tradeTypeIds.length > 0
      ? (
          await prisma.tradeType.findMany({
            where: { id: { in: tradeTypeIds } },
            select: { id: true },
          })
        ).map((t) => t.id)
      : [];

  const data = {
    ...rest,
    origin: nullableTrimmed(rest.origin),
    unit: nullableTrimmed(rest.unit),
    price: rest.price ?? null,
    availability: rest.availability ?? null,
    specs: {
      ...(typeof rest.specs === "object" && rest.specs ? (rest.specs as Record<string, unknown>) : {}),
      currency: currency || "USD",
    } as Prisma.InputJsonValue,
    images: rest.images,
  };

  try {
    if (id) {
      const existingProduct = await prisma.product.findUnique({
        where: { id },
        select: { images: true },
      });

      await prisma.$transaction([
        prisma.product.update({ where: { id }, data }),
        prisma.productTradeType.deleteMany({ where: { productId: id } }),
        ...validTypeIds.map((tradeTypeId) =>
          prisma.productTradeType.create({ data: { productId: id, tradeTypeId } })
        ),
      ]);

      if (existingProduct?.images) {
        cleanupOrphanedEntityMedia(existingProduct.images, data.images).catch((err) => {
          console.warn("[saveProduct] media cleanup error:", err);
        });
      }
    } else {
      await prisma.product.create({
        data: {
          ...data,
          tradeTypes: {
            create: validTypeIds.map((tradeTypeId) => ({
              tradeType: { connect: { id: tradeTypeId } },
            })),
          },
        },
      });
    }
  } catch (error) {
    console.error("[saveProduct]", error);
    return {
      ok: false,
      error: "Could not save this product. Please check the form and try again.",
    } satisfies AdminActionState;
  }

  revalidateContent();
  revalidatePath("/admin/products");
  return { ok: true } satisfies AdminActionState;
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  const product = await prisma.product.findUnique({
    where: { id },
    select: { images: true },
  });

  try {
    await prisma.product.delete({ where: { id } });
    if (product?.images && product.images.length > 0) {
      deleteMediaFiles(product.images).catch((err) => {
        console.warn("[deleteProduct] media cleanup error:", err);
      });
    }
    await flashAdminToast({ type: "success", text: "Product deleted." });
  } catch (error) {
    console.error("[deleteProduct]", error);
    await flashAdminToast({ type: "error", text: "Could not delete this product. It may already be gone." });
  }
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
    position: formData.get("position") || 0,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    await flashAdminToast({ type: "error", text: "Please check the form — some fields need fixing." });
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors } satisfies AdminActionState;
  }

  const { id, ...rawData } = parsed.data;
  const data = {
    ...rawData,
    description: nullableTrimmed(rawData.description),
  };

  try {
    if (id) {
      await prisma.category.update({ where: { id }, data });
    } else {
      await prisma.category.create({ data });
    }
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const message = "That slug is already used by another category.";
      await flashAdminToast({ type: "error", text: message });
      return { ok: false, fieldErrors: { slug: [message] } } satisfies AdminActionState;
    }
    console.error("[saveCategory]", error);
    await flashAdminToast({ type: "error", text: "Could not save this category. Please try again." });
    return { ok: false, error: "Could not save this category." } satisfies AdminActionState;
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

  const category = await prisma.category.findUnique({
    where: { id },
    select: { image: true },
  });

  try {
    await prisma.category.delete({ where: { id } });
    if (category?.image) {
      deleteMediaFile(category.image).catch((err) => {
        console.warn("[deleteCategory] media cleanup error:", err);
      });
    }
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

export async function toggleCategoryActive(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      select: { isActive: true, name: true },
    });
    if (!category) return;

    const isActive = !category.isActive;
    await prisma.category.update({ where: { id }, data: { isActive } });
    await flashAdminToast({
      type: "success",
      text: isActive
        ? `“${category.name}” is now visible on the site.`
        : `“${category.name}” is now hidden from the site.`,
    });
  } catch (error) {
    console.error("[toggleCategoryActive]", error);
    await flashAdminToast({
      type: "error",
      text: "Could not update category visibility. Please try again.",
    });
  }

  revalidateAdminContent();
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

  const { id, ...rawData } = parsed.data;
  const data = { ...rawData, description: nullableTrimmed(rawData.description) };

  try {
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
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const message = "That label is already used by another trade type.";
      await flashAdminToast({ type: "error", text: message });
      return { ok: false, fieldErrors: { label: [message] } } satisfies AdminActionState;
    }
    console.error("[saveTradeType]", error);
    await flashAdminToast({ type: "error", text: "Could not save this trade type. Please try again." });
    return { ok: false, error: "Could not save this trade type." } satisfies AdminActionState;
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
    meta: parseJsonField(formData.get("meta"), {}),
    position: formData.get("position") || 0,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    await flashAdminToast({ type: "error", text: "Please check the form — some fields need fixing." });
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors } satisfies AdminActionState;
  }

  const { id, ...rawData } = parsed.data;
  const data = {
    ...rawData,
    image: nullableTrimmed(rawData.image),
    meta: rawData.meta as Prisma.InputJsonValue,
  };

  try {
    let existingImage: string | null = null;
    if (id) {
      const existing = await prisma.pageSection.findUnique({
        where: { id },
        select: { image: true },
      });
      existingImage = existing?.image ?? null;
      await prisma.pageSection.update({ where: { id }, data });
    } else {
      const existing = await prisma.pageSection.findUnique({
        where: { page_key: { page: data.page, key: data.key } },
        select: { image: true },
      });
      existingImage = existing?.image ?? null;
      await prisma.pageSection.upsert({
        where: { page_key: { page: data.page, key: data.key } },
        update: data,
        create: data,
      });
    }

    if (existingImage && existingImage !== data.image) {
      deleteMediaFile(existingImage).catch((err) => {
        console.warn("[savePageSection] media cleanup error:", err);
      });
    }
  } catch (error) {
    console.error("[savePageSection]", error);
    await flashAdminToast({ type: "error", text: "Could not save this section. Please try again." });
    return { ok: false, error: "Could not save this section." } satisfies AdminActionState;
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

  const { id, ...rawData } = parsed.data;
  const data = {
    ...rawData,
    icon: nullableTrimmed(rawData.icon),
    image: nullableTrimmed(rawData.image),
  };

  if (id) {
    const existing = await prisma.service.findUnique({
      where: { id },
      select: { image: true },
    });
    await prisma.service.update({ where: { id }, data });
    if (existing?.image && existing.image !== data.image) {
      deleteMediaFile(existing.image).catch((err) => {
        console.warn("[saveService] media cleanup error:", err);
      });
    }
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

  const service = await prisma.service.findUnique({
    where: { id },
    select: { image: true },
  });

  await prisma.service.delete({ where: { id } });
  if (service?.image) {
    deleteMediaFile(service.image).catch((err) => {
      console.warn("[deleteService] media cleanup error:", err);
    });
  }
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

  const { id, ...rawData } = parsed.data;
  const data = {
    ...rawData,
    phone: nullableTrimmed(rawData.phone),
    email: nullableTrimmed(rawData.email),
    whatsapp: nullableTrimmed(rawData.whatsapp),
  };

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

  const { id, ...rawData } = parsed.data;
  const data = {
    ...rawData,
    description: nullableTrimmed(rawData.description),
    image: nullableTrimmed(rawData.image),
  };

  if (id) {
    const existing = await prisma.milestone.findUnique({
      where: { id },
      select: { image: true },
    });
    await prisma.milestone.update({ where: { id }, data });
    if (existing?.image && existing.image !== data.image) {
      deleteMediaFile(existing.image).catch((err) => {
        console.warn("[saveMilestone] media cleanup error:", err);
      });
    }
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

  const milestone = await prisma.milestone.findUnique({
    where: { id },
    select: { image: true },
  });

  await prisma.milestone.delete({ where: { id } });
  if (milestone?.image) {
    deleteMediaFile(milestone.image).catch((err) => {
      console.warn("[deleteMilestone] media cleanup error:", err);
    });
  }
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

  const existingSetting = await prisma.siteSetting.findUnique({
    where: { id: 1 },
    select: { meta: true },
  });

  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: { meta: parsed.data as Prisma.InputJsonValue },
    create: { id: 1, meta: parsed.data as Prisma.InputJsonValue },
  });

  const oldLogo = (existingSetting?.meta as Record<string, unknown> | null)?.logo;
  if (typeof oldLogo === "string" && oldLogo && oldLogo !== parsed.data.logo) {
    deleteMediaFile(oldLogo).catch((err) => {
      console.warn("[saveSiteSettings] media cleanup error:", err);
    });
  }

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

  const rawImages = parseJsonField<unknown>(formData.get("images"), []);
  const images = Array.isArray(rawImages)
    ? rawImages.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    : [];

  const parsed = blogSchema.safeParse({
    id: formData.get("id") ?? undefined,
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    body: formData.get("body"),
    images,
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

  const { id, ...rawData } = parsed.data;
  // The first gallery image doubles as the cover used in listings and previews.
  const data = { ...rawData, coverImage: rawData.images[0] ?? null };

  try {
    if (id) {
      const existing = await prisma.blog.findUnique({
        where: { id },
        select: { images: true, coverImage: true },
      });

      await prisma.blog.update({ where: { id }, data });

      if (existing) {
        const oldImages = [...existing.images, existing.coverImage].filter(Boolean) as string[];
        const newImages = [...data.images, data.coverImage].filter(Boolean) as string[];
        cleanupOrphanedEntityMedia(oldImages, newImages).catch((err) => {
          console.warn("[saveBlog] media cleanup error:", err);
        });
      }
    } else {
      await prisma.blog.create({ data: { ...data, authorId: user.id } });
    }
  } catch (error) {
    console.error("[saveBlog]", error);
    return {
      ok: false,
      error: "Could not save this article. Please check the form and try again.",
    } satisfies AdminActionState;
  }

  await flashAdminToast({
    type: "success",
    text: id ? "Article updated." : "Article published.",
  });
  revalidateAdminContent();
  revalidatePath("/admin/news");
  // Back to the article list so the editor can see the saved result in context.
  redirect("/admin/news");
}

export async function deleteBlog(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  const blog = await prisma.blog.findUnique({
    where: { id },
    select: { images: true, coverImage: true },
  });

  await prisma.blog.delete({ where: { id } });
  if (blog) {
    const allImages = [...blog.images, blog.coverImage].filter(Boolean) as string[];
    if (allImages.length > 0) {
      deleteMediaFiles(allImages).catch((err) => {
        console.warn("[deleteBlog] media cleanup error:", err);
      });
    }
  }
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

// ---------------------------------------------------------------------------
// Admin: Profile & Password Management
// ---------------------------------------------------------------------------

export async function updateMyProfile(
  _prev: AdminActionState | null,
  formData: FormData
): Promise<AdminActionState> {
  const currentUser = await requireAdmin();

  const parsed = profileUpdateSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    } satisfies AdminActionState;
  }

  try {
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        ok: false,
        fieldErrors: { email: ["This email is already in use by another account."] },
      } satisfies AdminActionState;
    }
    console.error("[updateMyProfile]", error);
    return {
      ok: false,
      error: "Could not save your profile changes.",
    } satisfies AdminActionState;
  }

  await flashAdminToast({ type: "success", text: "Profile details updated." });
  revalidateAdminContent();
  return { ok: true } satisfies AdminActionState;
}

export async function changeMyPassword(
  _prev: AdminActionState | null,
  formData: FormData
): Promise<AdminActionState> {
  const currentUser = await requireAdmin();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    } satisfies AdminActionState;
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: { passwordHash: true },
  });

  if (!user || !verifyPassword(parsed.data.currentPassword, user.passwordHash)) {
    return {
      ok: false,
      fieldErrors: { currentPassword: ["Current password is not correct."] },
    } satisfies AdminActionState;
  }

  try {
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { passwordHash: hashPassword(parsed.data.newPassword) },
    });
    await revokeOtherSessions(currentUser.id);
  } catch (error) {
    console.error("[changeMyPassword]", error);
    return {
      ok: false,
      error: "Could not update your password. Please try again.",
    } satisfies AdminActionState;
  }

  await flashAdminToast({
    type: "success",
    text: "Password updated successfully. Other active sessions were signed out.",
  });
  revalidateAdminContent();
  return { ok: true } satisfies AdminActionState;
}

// ---------------------------------------------------------------------------
// Admin: Team & Account Management
// ---------------------------------------------------------------------------

export async function createAdminAccount(
  _prev: AdminActionState | null,
  formData: FormData
): Promise<AdminActionState> {
  const currentUser = await requireAdmin();

  const parsed = createAdminSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    } satisfies AdminActionState;
  }

  let createdUser: { name: string; email: string; isActive: boolean };
  try {
    createdUser = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: hashPassword(parsed.data.password),
        role: "ADMIN",
        isActive: parsed.data.isActive,
      },
      select: {
        name: true,
        email: true,
        isActive: true,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        ok: false,
        fieldErrors: { email: ["An account with this email already exists."] },
      } satisfies AdminActionState;
    }
    console.error("[createAdminAccount]", error);
    return {
      ok: false,
      error: "Could not create admin account. Please try again.",
    } satisfies AdminActionState;
  }

  // Welcome email with dynamic login link & creator attribution
  sendAdminCreatedNotification({
    admin: createdUser,
    createdBy: {
      name: currentUser.name || "Administrator",
      email: currentUser.email,
    },
  }).catch((err) => {
    console.error("[createAdminAccount] notification error:", err);
  });

  await flashAdminToast({ type: "success", text: "New admin account created." });
  revalidateAdminContent();
  return { ok: true } satisfies AdminActionState;
}

export async function updateAdminAccount(
  _prev: AdminActionState | null,
  formData: FormData
): Promise<AdminActionState> {
  const currentUser = await requireAdmin();

  const parsed = updateAdminSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password") ?? "",
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    } satisfies AdminActionState;
  }

  const target = await prisma.user.findUnique({
    where: { id: parsed.data.id },
    select: { id: true, role: true, name: true, email: true, isActive: true },
  });

  if (!target || target.role !== "ADMIN") {
    return {
      ok: false,
      error: "Admin account not found or protected.",
    } satisfies AdminActionState;
  }

  if (target.id === currentUser.id && !parsed.data.isActive) {
    return {
      ok: false,
      error: "You cannot deactivate your own currently signed-in account.",
    } satisfies AdminActionState;
  }

  const nextPassword = parsed.data.password?.trim();
  const previousState = {
    name: target.name,
    email: target.email,
    isActive: target.isActive,
  };

  try {
    await prisma.user.update({
      where: { id: target.id },
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        isActive: parsed.data.isActive,
        ...(nextPassword ? { passwordHash: hashPassword(nextPassword) } : {}),
      },
    });

    if (!parsed.data.isActive) {
      await prisma.adminSession.deleteMany({ where: { userId: target.id } });
    } else if (nextPassword) {
      if (target.id === currentUser.id) {
        await revokeOtherSessions(target.id);
      } else {
        await prisma.adminSession.deleteMany({ where: { userId: target.id } });
      }
    }
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        ok: false,
        fieldErrors: { email: ["This email is already used by another account."] },
      } satisfies AdminActionState;
    }
    console.error("[updateAdminAccount]", error);
    return {
      ok: false,
      error: "Could not save account changes. Please try again.",
    } satisfies AdminActionState;
  }

  // Dual or single email dispatch depending on email modification
  sendAdminUpdatedNotification({
    changes: {
      oldName: previousState.name,
      newName: parsed.data.name,
      oldEmail: previousState.email,
      newEmail: parsed.data.email,
      oldIsActive: previousState.isActive,
      newIsActive: parsed.data.isActive,
      passwordChanged: Boolean(nextPassword),
    },
    updatedBy: {
      name: currentUser.name || "Administrator",
      email: currentUser.email,
    },
  }).catch((err) => {
    console.error("[updateAdminAccount] notification error:", err);
  });

  await flashAdminToast({ type: "success", text: "Admin account updated." });
  revalidateAdminContent();
  return { ok: true } satisfies AdminActionState;
}

export async function deleteAdminAccount(formData: FormData) {
  const currentUser = await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });

  if (!target || target.role !== "ADMIN") {
    await flashAdminToast({
      type: "error",
      text: "This account is protected and cannot be deleted.",
    });
    revalidateAdminContent();
    return;
  }

  if (target.id === currentUser.id) {
    await flashAdminToast({
      type: "error",
      text: "You cannot delete the account you are currently signed in with.",
    });
    revalidateAdminContent();
    return;
  }

  try {
    await prisma.user.delete({ where: { id: target.id } });
    await flashAdminToast({ type: "success", text: "Admin account deleted." });
  } catch (error) {
    console.error("[deleteAdminAccount]", error);
    await flashAdminToast({
      type: "error",
      text: "Could not delete this admin account right now.",
    });
  }

  revalidateAdminContent();
}

// ---------------------------------------------------------------------------
// Admin: Newsletter Broadcast & Subscriber Management
// ---------------------------------------------------------------------------

export async function sendNewsletterBroadcastAction(
  _prev: AdminActionState | null,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();

  const subject = String(formData.get("subject") ?? "").trim();
  const headline = String(formData.get("headline") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const productIds = formData.getAll("productIds").map(String).filter(Boolean);

  if (!subject) {
    return { ok: false, fieldErrors: { subject: ["Subject is required."] } };
  }
  if (!headline) {
    return { ok: false, fieldErrors: { headline: ["Headline / Title is required."] } };
  }
  if (!message) {
    return { ok: false, fieldErrors: { message: ["Message body is required."] } };
  }

  const subscribers = await prisma.newsletter.findMany({
    where: { subscribed: true },
    select: { email: true },
  });

  if (subscribers.length === 0) {
    return {
      ok: false,
      error: "No active subscribers found to receive this broadcast.",
    };
  }

  let products: BroadcastProductItem[] = [];
  if (productIds.length > 0) {
    const rawProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        title: true,
        summary: true,
        price: true,
        unit: true,
        specs: true,
        images: true,
      },
    });

    products = rawProducts.map((p) => {
      const specs = p.specs && typeof p.specs === "object" ? (p.specs as Record<string, unknown>) : {};
      const currency = typeof specs.currency === "string" ? specs.currency : "USD";
      let image: string | null = null;
      if (Array.isArray(p.images) && p.images.length > 0) {
        const first = p.images[0];
        if (typeof first === "string") image = first;
      }
      return {
        id: p.id,
        title: p.title,
        summary: p.summary,
        price: p.price ? Number(p.price) : null,
        unit: p.unit,
        currency,
        image,
      };
    });
  }

  const result = await sendNewsletterBroadcast({
    subject,
    headline,
    message,
    products,
    recipients: subscribers.map((s) => s.email),
  });

  await flashAdminToast({
    type: "success",
    text: `Broadcast sent to ${result.sent} subscribers${result.failed > 0 ? ` (${result.failed} failed)` : ""}.`,
  });

  revalidatePath("/admin/inquiries");
  return { ok: true };
}

export async function toggleNewsletterSubscriber(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const sub = await prisma.newsletter.findUnique({ where: { id } });
  if (!sub) return;

  await prisma.newsletter.update({
    where: { id },
    data: { subscribed: !sub.subscribed },
  });

  await flashAdminToast({
    type: "success",
    text: `Subscriber marked as ${!sub.subscribed ? "Active" : "Unsubscribed"}.`,
  });
  revalidatePath("/admin/inquiries");
}

export async function deleteNewsletterSubscriber(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  try {
    await prisma.newsletter.delete({ where: { id } });
    await flashAdminToast({ type: "success", text: "Subscriber removed." });
  } catch (error) {
    console.error("[deleteNewsletterSubscriber]", error);
  }
  revalidatePath("/admin/inquiries");
}

export async function moveCollectionItem(
  kind: CollectionKind,
  id: string,
  direction: "up" | "down"
) {
  await requireAdmin();

  type PositionItem = { id: string; position?: number; year?: number };
  type ModelDelegate = {
    findMany: (args?: unknown) => Promise<PositionItem[]>;
    update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown>;
  };

  const delegates: Record<CollectionKind, ModelDelegate> = {
    stat: prisma.stat as unknown as ModelDelegate,
    service: prisma.service as unknown as ModelDelegate,
    office: prisma.office as unknown as ModelDelegate,
    value: prisma.companyValue as unknown as ModelDelegate,
    supplyStep: prisma.supplyStep as unknown as ModelDelegate,
    checklistItem: prisma.checklistItem as unknown as ModelDelegate,
    milestone: prisma.milestone as unknown as ModelDelegate,
  };

  const delegate = delegates[kind];
  if (!delegate) return;

  const items = await delegate.findMany({
    orderBy:
      kind === "milestone"
        ? [{ year: "asc" }, { id: "asc" }]
        : [{ position: "asc" }, { id: "asc" }],
  });

  const currentIndex = items.findIndex((it) => it.id === id);
  if (currentIndex === -1) return;
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= items.length) return;

  const currentItem = items[currentIndex];
  const targetItem = items[targetIndex];

  if (kind === "milestone") {
    const currentYear = currentItem.year ?? 2020;
    const targetYear = targetItem.year ?? 2020;
    await delegate.update({ where: { id: currentItem.id }, data: { year: targetYear } });
    await delegate.update({ where: { id: targetItem.id }, data: { year: currentYear } });
  } else {
    const currentPos = currentItem.position ?? currentIndex;
    const targetPos = targetItem.position ?? targetIndex;
    const newCurrentPos =
      currentPos === targetPos
        ? direction === "up"
          ? targetPos - 1
          : targetPos + 1
        : targetPos;
    await delegate.update({ where: { id: currentItem.id }, data: { position: newCurrentPos } });
    await delegate.update({ where: { id: targetItem.id }, data: { position: currentPos } });
  }

  revalidateAdminContent();
}

/**
 * Server Action to manually purge unreferenced media files from public/media/
 * to free up cloud server storage.
 */
export async function cleanOrphanedMediaAction(): Promise<AdminActionState> {
  await requireAdmin();

  try {
    const result = await cleanAllOrphanedMedia();
    const mb = (result.freedBytes / (1024 * 1024)).toFixed(2);
    await flashAdminToast({
      type: "success",
      text: `Cleaned ${result.deleted} orphaned file(s) and freed ${mb} MB of server storage.`,
    });
    revalidateAdminContent();
    return { ok: true };
  } catch (error) {
    console.error("[cleanOrphanedMediaAction]", error);
    await flashAdminToast({
      type: "error",
      text: "Could not complete media cleanup scan right now.",
    });
    return { ok: false, error: "Media cleanup failed." };
  }
}