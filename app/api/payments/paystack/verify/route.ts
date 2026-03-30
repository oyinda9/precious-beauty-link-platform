import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, extractToken } from "@/lib/auth";

function getToken(request: NextRequest) {
  return (
    request.cookies.get("auth_token")?.value ||
    request.cookies.get("token")?.value ||
    request.cookies.get("auth-token")?.value ||
    request.cookies.get("authToken")?.value ||
    request.cookies.get("accessToken")?.value ||
    extractToken(request.headers.get("authorization"))
  );
}

export async function POST(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const jwt = verifyToken(token) as {
      id?: string;
      sub?: string;
    } | null;
    const userId = jwt?.id || jwt?.sub;
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { reference } = await request.json();
    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const secretKey = String(process.env.PAYSTACK_SECRET_KEY || "").trim();
    const baseUrl = String(
      process.env.PAYSTACK_BASE_URL || "https://api.paystack.co",
    ).trim();

    if (!secretKey) {
      return NextResponse.json(
        { error: "Missing PAYSTACK_SECRET_KEY" },
        { status: 500 },
      );
    }

    // Verify transaction with Paystack
    const verifyRes = await fetch(
      `${baseUrl}/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    const verifyData = await verifyRes.json().catch(() => null);

    if (!verifyRes.ok) {
      return NextResponse.json(
        { error: verifyData?.message || "Verification failed" },
        { status: 400 },
      );
    }

    const { status, data } = verifyData;

    if (status && data?.status === "success") {
      // Find and update subscription
      const subscription = await prisma.subscription.findFirst({
        where: { reference: reference || undefined },
      });

      if (subscription) {
        // Update subscription to ACTIVE
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: "ACTIVE",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            paymentVerifiedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message: "Payment verified and subscription activated",
          subscription: {
            id: subscription.id,
            status: "ACTIVE",
            plan: subscription.plan,
          },
        });
      }
    }

    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 400 },
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Verification failed" },
      { status: 500 },
    );
  }
}
