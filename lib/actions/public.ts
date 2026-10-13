"use server";

import { prisma } from "@/lib/prisma";
import { inquirySchema, newsletterSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

async function notifyTradeDesk(inquiry: {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}) {
  // 1. Telegram Notification Bot (Instant & works reliably in Myanmar)
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.TELEGRAM_CHAT_ID;
  if (tgToken && tgChatId) {
    try {
      const text = `🚨 *NEW PGM TRADE DESK INQUIRY / RFQ*\n\n*Subject:* ${inquiry.subject}\n*Name:* ${inquiry.name}\n*Email:* ${inquiry.email}\n*Phone:* ${inquiry.phone || "N/A"}\n\n*Details:*\n${inquiry.message.slice(0, 1500)}`;
      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: tgChatId, text, parse_mode: "Markdown" }),
      });
    } catch (err) {
      console.warn("[notifyTradeDesk] Telegram alert error:", err);
    }
  }

  // 2. Email alert via Resend if configured
  const resendKey = process.env.RESEND_API_KEY;
  const tradeEmail = process.env.TRADE_DESK_EMAIL || "trade@pgm-trading.com";
  if (resendKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "PGM Trade Desk <alerts@pgm-trading.com>",
          to: [tradeEmail],
          subject: `[Trade Desk Alert] ${inquiry.subject}`,
          text: `New trade inquiry received from ${inquiry.name} (${inquiry.email}, Phone: ${inquiry.phone || "N/A"}):\n\n${inquiry.message}`,
        }),
      });
    } catch (err) {
      console.warn("[notifyTradeDesk] Email alert error:", err);
    }
  }
}

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

  // Format B2B RFQ metadata if provided
  const rfqCompany = formData.get("rfq_company")?.toString().trim();
  const rfqVolume = formData.get("rfq_volume")?.toString().trim();
  const rfqIncoterm = formData.get("rfq_incoterm")?.toString().trim();
  const rfqDestination = formData.get("rfq_destination")?.toString().trim();
  const rfqPackaging = formData.get("rfq_packaging")?.toString().trim();

  let finalMessage = parsed.data.message;
  let finalSubject = parsed.data.subject;

  if (rfqCompany || rfqVolume) {
    finalSubject = `[RFQ] ${parsed.data.subject}`;
    finalMessage = [
      `=== OFFICIAL B2B RFQ DETAILS ===`,
      rfqCompany ? `Company: ${rfqCompany}` : null,
      rfqVolume ? `Target Volume: ${rfqVolume}` : null,
      rfqIncoterm ? `Incoterm: ${rfqIncoterm}` : null,
      rfqDestination ? `Destination Port (POD): ${rfqDestination}` : null,
      rfqPackaging ? `Packaging: ${rfqPackaging}` : null,
      `=================================`,
      ``,
      `Notes / Specifications:`,
      parsed.data.message,
    ]
      .filter(Boolean)
      .join("\n");
  }

  try {
    const record = await prisma.inquiry.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        subject: finalSubject,
        message: finalMessage,
      },
    });

    // Notify trade desk in background
    notifyTradeDesk({
      name: record.name,
      email: record.email,
      phone: record.phone,
      subject: record.subject,
      message: record.message,
    }).catch(() => {});

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