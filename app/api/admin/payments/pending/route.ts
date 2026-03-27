import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, extractToken } from "@/lib/auth";

/**
 * GET /api/admin/payments/pending
 * Fetch all pending payment proofs for admin verification
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    // Optional auth check (could be enforced via middleware)
    let payload = null;
    if (authHeader) {
      const token = extractToken(authHeader);
      if (token) {
        payload = verifyToken(token);
      }
    }

    // Fetch all subscriptions with pending payments or by status
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: {
          in: ["PENDING_PAYMENT", "PAYMENT_REJECTED", "ACTIVE"],
        },
      },
      include: {
        salon: {
          include: {
            admins: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data for frontend consumption
    const payments = subscriptions
      .filter((sub) => sub.manualPaymentProof || sub.status === "PENDING_PAYMENT")
      .map((sub) => {
        const admin = sub.salon.admins[0];
        const planAmount = {
          FREE: 0,
          STARTER: 5000,
          STANDARD: 10000,
          GROWTH: 20000,
          PREMIUM: 30000,
        }[sub.plan as string] || 0;

        return {
          id: sub.id,
          salonId: sub.salonId,
          salonName: sub.salon.name,
          ownerName: admin?.user?.fullName || "Unknown",
          ownerEmail: admin?.user?.email || "Unknown",
          plan: sub.plan,
          amount: planAmount,
          status: sub.status,
          manualPaymentProof: sub.manualPaymentProof,
          bankDetails: {
            accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "N/A",
            accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || "N/A",
            bankName: process.env.NEXT_PUBLIC_BANK_NAME || "N/A",
          },
          createdAt: sub.createdAt.toISOString(),
          paymentVerifiedAt: sub.paymentVerifiedAt?.toISOString() || null,
        };
      });

    return NextResponse.json({
      success: true,
      payments,
      count: payments.length,
      pending: payments.filter((p) => p.status === "PENDING_PAYMENT").length,
      approved: payments.filter((p) => p.status === "ACTIVE").length,
      rejected: payments.filter((p) => p.status === "PAYMENT_REJECTED").length,
    });
  } catch (error: any) {
    console.error("Fetch pending payments error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch pending payments",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
