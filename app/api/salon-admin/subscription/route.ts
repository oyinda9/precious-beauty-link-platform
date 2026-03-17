import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, extractToken } from "@/lib/auth";
import { SubscriptionPlan } from "@prisma/client";

const PLAN_VIEW: Record<
  SubscriptionPlan,
  {
    planName: string;
    amount: number;
    currency: string;
    billingCycle: "month" | "year";
  }
> = {
  TRIAL: {
    planName: "Free",
    amount: 0,
    currency: "NGN",
    billingCycle: "month",
  },
  STARTER: {
    planName: "Basic",
    amount: 10000,
    currency: "NGN",
    billingCycle: "month",
  },
  PROFESSIONAL: {
    planName: "Standard",
    amount: 15000,
    currency: "NGN",
    billingCycle: "month",
  },
  ENTERPRISE: {
    planName: "Premium",
    amount: 30000,
    currency: "NGN",
    billingCycle: "month",
  },
};

export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get("token")?.value ||
      request.cookies.get("auth-token")?.value ||
      request.cookies.get("authToken")?.value ||
      request.cookies.get("accessToken")?.value ||
      request.cookies.get("auth_token")?.value ||
      extractToken(request.headers.get("authorization"));

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: {
      userId?: string;
      id?: string;
      sub?: string;
      email?: string;
    } | null = null;

    try {
      payload = verifyToken(token) as {
        userId?: string;
        id?: string;
        sub?: string;
        email?: string;
      } | null;
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = payload?.userId || payload?.id || payload?.sub;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1) Preferred path: salonAdmin -> salon -> subscription
    let admin = await prisma.salonAdmin.findFirst({
      where: { userId },
      include: {
        salon: {
          include: { subscription: true },
        },
      },
    });

    // 2) Fallback path: user email -> salon.email (for older records/missing salonAdmin link)
    if (!admin?.salon) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (user?.email) {
        const salonByEmail = await prisma.salon.findFirst({
          where: { email: user.email },
          include: { subscription: true },
        });

        if (salonByEmail) {
          const sub = salonByEmail.subscription;

          if (!sub) {
            return NextResponse.json({
              planName: "No Plan",
              amount: 0,
              currency: "NGN",
              billingCycle: "month",
              status: "inactive",
              nextPaymentDate: null,
            });
          }

          const view = PLAN_VIEW[sub.plan] ?? PLAN_VIEW.TRIAL;

          return NextResponse.json({
            planName: view.planName,
            amount: view.amount,
            currency: view.currency,
            billingCycle: view.billingCycle,
            status: String(sub.status).toLowerCase(),
            nextPaymentDate: sub.currentPeriodEnd ?? sub.trialEndsAt ?? null,
          });
        }
      }
    }

    if (!admin?.salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    const sub = admin.salon.subscription;
    if (!sub) {
      return NextResponse.json({
        planName: "No Plan",
        amount: 0,
        currency: "NGN",
        billingCycle: "month",
        status: "inactive",
        nextPaymentDate: null,
      });
    }

    const view = PLAN_VIEW[sub.plan] ?? PLAN_VIEW.TRIAL;

    return NextResponse.json({
      planName: view.planName,
      amount: view.amount,
      currency: view.currency,
      billingCycle: view.billingCycle,
      status: String(sub.status).toLowerCase(),
      nextPaymentDate: sub.currentPeriodEnd ?? sub.trialEndsAt ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load subscription" },
      { status: 500 },
    );
  }
}
