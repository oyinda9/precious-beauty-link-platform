import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

const PLAN_TO_PRISMA = {
  basic: SubscriptionPlan.STARTER,
  standard: SubscriptionPlan.PROFESSIONAL,
  premium: SubscriptionPlan.ENTERPRISE,
} as const;

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const status = String(
      body?.data?.status || body?.status || "",
    ).toUpperCase();
    const reference = String(body?.data?.reference || body?.reference || "");

    if (!reference) return NextResponse.json({ ok: true });

    const parts = reference.split(":"); // sub:{salonId}:{planKey}:{uuid}
    if (parts.length < 4) return NextResponse.json({ ok: true });

    const salonId = parts[1];
    const planKey = parts[2] as keyof typeof PLAN_TO_PRISMA;

    if (status !== "SUCCESS") return NextResponse.json({ ok: true });
    if (!PLAN_TO_PRISMA[planKey]) return NextResponse.json({ ok: true });

    await prisma.subscription.upsert({
      where: { salonId },
      update: {
        plan: PLAN_TO_PRISMA[planKey],
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: addDays(30),
      },
      create: {
        salonId,
        plan: PLAN_TO_PRISMA[planKey],
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: addDays(30),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
