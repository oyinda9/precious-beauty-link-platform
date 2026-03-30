import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  updateSubscriptionPlan,
  cancelSubscription,
} from "@/lib/services/subscription-service";
import { logSubscriptionChange } from "@/lib/services/audit-service";

/**
 * POST /api/subscriptions/[salonId]/upgrade
 * Upgrade salon subscription to a higher plan
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ salonId: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { salonId } = await params;
    const { newPlan } = await request.json();

    if (!newPlan) {
      return NextResponse.json(
        { error: "newPlan is required" },
        { status: 400 },
      );
    }

    // Verify salon ownership
    const salon = await require("@/lib/prisma").prisma.salon.findFirst({
      where: {
        id: salonId,
        admins: {
          some: { userId: user.id },
        },
      },
    });

    if (!salon) {
      return NextResponse.json(
        { error: "Unauthorized or salon not found" },
        { status: 403 },
      );
    }

    // Get current subscription
    const currentSub =
      await require("@/lib/prisma").prisma.subscription.findUnique({
        where: { salonId },
      });

    if (!currentSub) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    // Update subscription
    const updated = await updateSubscriptionPlan(salonId, newPlan);

    // Log the change
    const ipAddress = request.headers.get("x-forwarded-for") || undefined;
    await logSubscriptionChange(
      user.id,
      salonId,
      currentSub.plan,
      newPlan,
      ipAddress,
    );

    return NextResponse.json({ subscription: updated });
  } catch (error) {
    console.error("Upgrade error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/subscriptions/[salonId]/downgrade
 * Downgrade subscription to a lower plan
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ salonId: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { salonId } = await params;
    const { newPlan } = await request.json();

    if (!newPlan) {
      return NextResponse.json(
        { error: "newPlan is required" },
        { status: 400 },
      );
    }

    // Verify salon ownership
    const salon = await require("@/lib/prisma").prisma.salon.findFirst({
      where: {
        id: salonId,
        admins: {
          some: { userId: user.id },
        },
      },
    });

    if (!salon) {
      return NextResponse.json(
        { error: "Unauthorized or salon not found" },
        { status: 403 },
      );
    }

    // Get current subscription
    const currentSub =
      await require("@/lib/prisma").prisma.subscription.findUnique({
        where: { salonId },
      });

    if (!currentSub) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    // Update subscription
    const updated = await updateSubscriptionPlan(salonId, newPlan);

    // Log the change
    const ipAddress = request.headers.get("x-forwarded-for") || undefined;
    await logSubscriptionChange(
      user.id,
      salonId,
      currentSub.plan,
      newPlan,
      ipAddress,
    );

    return NextResponse.json({ subscription: updated });
  } catch (error) {
    console.error("Downgrade error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/subscriptions/[salonId]/cancel
 * Cancel subscription
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ salonId: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { salonId } = await params;

    // Verify salon ownership
    const salon = await require("@/lib/prisma").prisma.salon.findFirst({
      where: {
        id: salonId,
        admins: {
          some: { userId: user.id },
        },
      },
    });

    if (!salon) {
      return NextResponse.json(
        { error: "Unauthorized or salon not found" },
        { status: 403 },
      );
    }

    // Get current subscription
    const currentSub =
      await require("@/lib/prisma").prisma.subscription.findUnique({
        where: { salonId },
      });

    if (!currentSub) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    // Cancel subscription
    const cancelled = await cancelSubscription(salonId);

    // Log the change
    const ipAddress = request.headers.get("x-forwarded-for") || undefined;
    await logSubscriptionChange(
      user.id,
      salonId,
      currentSub.plan,
      "FREE",
      ipAddress,
    );

    return NextResponse.json({ subscription: cancelled });
  } catch (error) {
    console.error("Cancel error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}
