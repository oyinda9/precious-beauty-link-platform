import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, extractToken } from "@/lib/auth";

/**
 * POST /api/subscriptions/:salonId/verify-payment
 * Submit payment proof for subscription
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ salonId: string }> },
) {
  try {
    // Await params since they're a Promise in modern Next.js
    const { salonId } = await params;

    if (!salonId) {
      return NextResponse.json({ error: "Invalid salon ID" }, { status: 400 });
    }
    const { proofUrl, transactionRef, notes } = await request.json();

    // Get subscription by salonId
    const subscription = await prisma.subscription.findUnique({
      where: { salonId },
      include: { salon: { include: { admins: true } } },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    // Update subscription with payment proof (no auth required - user just submitted)
    const updated = await prisma.subscription.update({
      where: { salonId },
      data: {
        manualPaymentProof: proofUrl,
        paymentVerifiedAt: null, // Admin will verify
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Payment proof submitted successfully! Admin will verify and activate your subscription within 24 hours.",
        subscription: {
          id: updated.id,
          status: updated.status,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Payment proof submission error:", error);
    return NextResponse.json(
      {
        error: "Failed to submit payment proof",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/subscriptions/:salonId/verify-payment
 * Admin endpoint to verify and activate subscription after payment
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ salonId: string }> },
) {
  try {
    // Await params since they're a Promise in modern Next.js
    const { salonId } = await params;

    if (!salonId) {
      return NextResponse.json({ error: "Invalid salon ID" }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = extractToken(authHeader);
    if (!token) {
      return NextResponse.json(
        { error: "Invalid authorization format" },
        { status: 401 },
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }
    const { approved } = await request.json();

    // Get subscription by salonId
    const subscription = await prisma.subscription.findUnique({
      where: { salonId },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    if (approved) {
      // Activate subscription after payment verified
      const updated = await prisma.subscription.update({
        where: { salonId },
        data: {
          status: "ACTIVE",
          paymentVerifiedAt: new Date(),
          paymentVerifiedBy: payload.id,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Subscription activated. Payment verified.",
          subscription: {
            id: updated.id,
            status: updated.status,
            message: "Your subscription is now ACTIVE!",
          },
        },
        { status: 200 },
      );
    } else {
      // Reject payment
      const updated = await prisma.subscription.update({
        where: { salonId },
        data: {
          status: "PAYMENT_REJECTED",
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: "Payment rejected. Please submit valid proof.",
          subscription: {
            id: updated.id,
            status: updated.status,
          },
        },
        { status: 200 },
      );
    }
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      {
        error: "Failed to verify payment",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
