"use server";

import { prisma } from "@/lib/prisma";
import { inquirySchema, newsletterSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function submitInquiry(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const parsed = inquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Please check the highlighted fields.",
    };
  }

  try {
    await prisma.inquiry.create({ data: parsed.data });
    revalidatePath("/admin/inquiries");
    return { ok: true };
  } catch (error) {
    console.error("[submitInquiry]", error);
    return { ok: false, error: "Could not submit your inquiry. Please try again later." };
  }
}

export async function subscribeNewsletter(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid email." };
  }

  try {
    await prisma.newsletter.upsert({
      where: { email: parsed.data.email },
      update: { subscribed: true },
      create: parsed.data,
    });
    return { ok: true };
  } catch (error) {
    console.error("[subscribeNewsletter]", error);
    return { ok: false, error: "Could not subscribe right now. Please try again." };
  }
}