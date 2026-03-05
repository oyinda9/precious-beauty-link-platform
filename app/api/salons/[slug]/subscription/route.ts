import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, extractToken, isSuperAdmin } from "@/lib/auth";
import { apiError } from "@/lib/api-utils";
import { SubscriptionStatus, SubscriptionPlan } from "@prisma/client";

// GET subscription for a salon
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const salon = await prisma.salon.findUnique({
      where: { slug: params.slug },
      include: { subscription: true },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    return NextResponse.json({ subscription: salon.subscription });
  } catch (error) {
    return apiError(
      "Subscription GET Error",
      error,
      "Internal server error",
      500,
    );
  }
}

// PUT update subscription (super admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const token = extractToken(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !isSuperAdmin(payload.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { plan, status, trialEndsAt } = body;

    const salon = await prisma.salon.findUnique({
      where: { slug: params.slug },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    // Get or create subscription
    let subscription = await prisma.subscription.findUnique({
      where: { salonId: salon.id },
    });

    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          salonId: salon.id,
          plan: plan || SubscriptionPlan.STARTER,
          status: status || SubscriptionStatus.TRIAL,
        },
      });
    } else {
      subscription = await prisma.subscription.update({
        where: { salonId: salon.id },
        data: {
          plan: plan || subscription.plan,
          status: status || subscription.status,
          trialEndsAt: trialEndsAt
            ? new Date(trialEndsAt)
            : subscription.trialEndsAt,
        },
      });
    }

    // Update salon subscription status
    await prisma.salon.update({
      where: { id: salon.id },
      data: { subscriptionStatus: subscription.status },
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    return apiError(
      "Subscription PUT Error",
      error,
      "Internal server error",
      500,
    );
  }
}
