"use server";

import { prisma } from "@/lib/prisma";
import { inquirySchema, newsletterSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { sendEmail, sendNewsletterWelcomeEmail } from "@/lib/email";

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

  // 2. Email alert via Company Mail SMTP / Resend
  const tradeEmail = process.env.TRADE_DESK_EMAIL || "trade@pgm-trading.com";
  try {
    const alertHtml = `
      <h2>New Trade Inquiry / RFQ Received</h2>
      <p><strong>From:</strong> ${inquiry.name} (${inquiry.email}${inquiry.phone ? ` &middot; Tel: ${inquiry.phone}` : ""})</p>
      <p><strong>Subject:</strong> ${inquiry.subject}</p>
      <hr style="border: 0; border-top: 1px solid #ebdfc9; margin: 16px 0;" />
      <div style="white-space: pre-line; font-family: monospace; font-size: 13px; line-height: 1.6; background: #faf8f2; padding: 16px; border-radius: 8px;">
        ${inquiry.message}
      </div>
    `;

    const alertText = `
New trade inquiry received:
- Name: ${inquiry.name}
- Email: ${inquiry.email}
- Phone: ${inquiry.phone || "N/A"}
- Subject: ${inquiry.subject}

Message:
${inquiry.message}
    `.trim();

    await sendEmail({
      to: tradeEmail,
      subject: `[Trade Desk Alert] ${inquiry.subject}`,
      html: alertHtml,
      text: alertText,
      replyTo: inquiry.email,
    });
  } catch (err) {
    console.warn("[notifyTradeDesk] Email alert error:", err);
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

  const email = parsed.data.email.trim().toLowerCase();

  try {
    await prisma.newsletter.upsert({
      where: { email },
      update: { subscribed: true },
      create: { email, subscribed: true },
    });

    // Send welcome email with anti-spam / unsubscribe notice in background
    sendNewsletterWelcomeEmail(email).catch((err) => {
      console.warn("[subscribeNewsletter] Welcome email error:", err);
    });

    return { ok: true };
  } catch (error) {
    console.error("[subscribeNewsletter]", error);
    return { ok: false, error: "Could not subscribe right now. Please try again." };
  }
}

export async function unsubscribeNewsletterAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  try {
    await prisma.newsletter.updateMany({
      where: { email },
      data: { subscribed: false },
    });
    return { ok: true };
  } catch (error) {
    console.error("[unsubscribeNewsletterAction]", error);
    return { ok: false, error: "Unable to process unsubscribe request right now." };
  }
}

export async function resubscribeNewsletterAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  try {
    await prisma.newsletter.upsert({
      where: { email },
      update: { subscribed: true },
      create: { email, subscribed: true },
    });

    sendNewsletterWelcomeEmail(email).catch((err) => {
      console.warn("[resubscribeNewsletterAction] Welcome email error:", err);
    });

    return { ok: true };
  } catch (error) {
    console.error("[resubscribeNewsletterAction]", error);
    return { ok: false, error: "Unable to process subscription right now." };
  }
}