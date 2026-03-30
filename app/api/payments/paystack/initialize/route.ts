import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { verifyToken, extractToken } from "@/lib/auth";

const PLAN_AMOUNT: Record<
  "FREE" | "STARTER" | "STANDARD" | "GROWTH" | "PREMIUM",
  number
> = {
  FREE: 0,
  STARTER: 5000,
  STANDARD: 10000,
  GROWTH: 20000,
  PREMIUM: 30000,
};

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

    const body = await request.json();
    const planKey = String(
      body?.planKey || "",
    ).toUpperCase() as keyof typeof PLAN_AMOUNT;
    if (!(planKey in PLAN_AMOUNT) || planKey === "FREE") {
      return NextResponse.json({ error: "Invalid paid plan" }, { status: 400 });
    }

    const admin = await prisma.salonAdmin.findFirst({
      where: { userId },
      include: { salon: true, user: true },
    });
    if (!admin?.salon || !admin.user?.email) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
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

    // Paystack expects amount in kobo (1 NGN = 100 kobo)
    const amountInKobo = PLAN_AMOUNT[planKey] * 100;
    const reference = `sub_${admin.salon.id}_${planKey}_${randomUUID()}`;

    // Find or create subscription with reference
    let subscription = await prisma.subscription.findUnique({
      where: { salonId: admin.salon.id },
    });

    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          salonId: admin.salon.id,
          status: "PENDING_PAYMENT",
          reference: reference,
          paymentMethod: "paystack",
          plan: planKey as any,
        },
      });
    } else {
      subscription = await prisma.subscription.update({
        where: { salonId: admin.salon.id },
        data: {
          reference: reference,
          paymentMethod: "paystack",
        },
      });
    }

    const initPayload = {
      email: admin.user.email,
      amount: amountInKobo,
      reference: reference,
      currency: "NGN",
      metadata: {
        salonId: admin.salon.id,
        salonName: admin.salon.name,
        plan: planKey,
        userId: userId,
        fullName: admin.user.fullName || admin.salon.name,
      },
    };

    const initRes = await fetch(`${baseUrl}/transaction/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify(initPayload),
    });

    const initData = await initRes.json().catch(() => null);
    const authorizationUrl = initData?.data?.authorization_url;
    const accessCode = initData?.data?.access_code;

    if (!initRes.ok || !authorizationUrl) {
      return NextResponse.json(
        { error: initData?.message || "Paystack initialization failed" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      redirectUrl: authorizationUrl,
      reference,
      accessCode,
      provider: "paystack",
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Initialization failed" },
      { status: 500 },
    );
  }
}
