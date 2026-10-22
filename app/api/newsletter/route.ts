import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validation";

/**
 * Subscribe an email address to the newsletter.
 *
 * POST /api/newsletter is the documented public endpoint; PUT is kept as an
 * alias for older integrations.
 */
async function subscribe(request: Request) {
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
    console.error("[api/newsletter]", error);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return subscribe(request);
}

export async function PUT(request: Request) {
  return subscribe(request);
}
