import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractToken, isSalonAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getResourceCapacityInfo,
  getSalonFeatureAccess,
  getBookingLimitsUsage,
} from "@/lib/subscription-enforcement";

/**
 * GET - Get subscription info and plan details for a salon
 * Returns all plan features, limits, and current usage
 */
export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !isSalonAdmin(payload.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get salon admin to find salon ID
    const admin = await prisma.salonAdmin.findUnique({
      where: { userId: payload.id },
      include: { salon: true },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Salon admin not found" },
        { status: 404 },
      );
    }

    // Get subscription
    let subscription = await prisma.subscription.findUnique({
      where: { salonId: admin.salonId },
    });

    // If no subscription exists, create a FREE plan subscription
    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          salonId: admin.salonId,
          plan: "FREE",
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ), // 1 year for FREE
        },
      });
    }

    // Get resource capacity info
    const capacityInfo = await getResourceCapacityInfo(admin.salonId);

    // Get feature access
    const features = await getSalonFeatureAccess(admin.salonId);

    // Get booking limits
    const bookingLimits = await getBookingLimitsUsage(admin.salonId);

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        createdAt: subscription.createdAt,
      },
      capacity: capacityInfo,
      limits: bookingLimits,
      features,
    });
  } catch (error: any) {
    console.error("GET Subscription Info Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
