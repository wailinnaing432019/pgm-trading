import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inquirySchema, newsletterSchema } from "@/lib/validation";

/**
 * POST /api/inquiries — public REST endpoint for the frontend contact form.
 * Mirrors the `submitInquiry` server action for third-party integrations.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = inquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const inquiry = await prisma.inquiry.create({ data: parsed.data });
    return NextResponse.json({ ok: true, id: inquiry.id }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/inquiries]", error);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/newsletter — subscribe an email from the footer form.
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 422 });
    }
    await prisma.newsletter.upsert({
      where: { email: parsed.data.email },
      update: { subscribed: true },
      create: parsed.data,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/newsletter]", error);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}