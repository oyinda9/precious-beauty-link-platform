import { NextRequest, NextResponse } from "next/server";
import { createHmac, randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { verifyToken, extractToken } from "@/lib/auth";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

const PLAN_AMOUNT: Record<"free" | "basic" | "standard" | "premium", number> = {
  free: 0,
  basic: 10000,
  standard: 15000,
  premium: 30000,
};

const PLAN_TO_PRISMA = {
  basic: SubscriptionPlan.STARTER,
  standard: SubscriptionPlan.PROFESSIONAL,
  premium: SubscriptionPlan.ENTERPRISE,
};

function getToken(request: NextRequest) {
  return (
    request.cookies.get("token")?.value ||
    request.cookies.get("auth-token")?.value ||
    request.cookies.get("authToken")?.value ||
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("auth_token")?.value ||
    request.cookies.get("jwt")?.value ||
    extractToken(request.headers.get("authorization"))
  );
}

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export async function POST(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const jwt = verifyToken(token) as {
      userId?: string;
      id?: string;
      sub?: string;
    } | null;
    const userId = jwt?.userId || jwt?.id || jwt?.sub;
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const planKey = String(
      body?.planKey || "",
    ).toLowerCase() as keyof typeof PLAN_AMOUNT;
    if (!(planKey in PLAN_AMOUNT)) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 },
      );
    }

    const admin = await prisma.salonAdmin.findFirst({
      where: { userId },
      include: { salon: true, user: true },
    });
    if (!admin?.salon || !admin.user?.email) {
      return NextResponse.json(
        { error: "Salon account not found" },
        { status: 404 },
      );
    }

    // Free plan handling
    if (planKey === "free") {
      await prisma.subscription.upsert({
        where: { salonId: admin.salon.id },
        update: {
          plan: SubscriptionPlan.TRIAL,
          status: SubscriptionStatus.TRIAL,
          trialEndsAt: addDays(30),
        },
        create: {
          salonId: admin.salon.id,
          plan: SubscriptionPlan.TRIAL,
          status: SubscriptionStatus.TRIAL,
          trialEndsAt: addDays(30),
        },
      });
      return NextResponse.json({ free: true });
    }

    // OPay credentials
    const merchantId = String(process.env.OPAY_MERCHANT_ID || "").trim();
    const secretKey = String(process.env.OPAY_SECRET_KEY || "").trim();
    const createUrl =
      process.env.OPAY_PAYMENT_CREATE_URL ||
      "https://sandboxapi.opaycheckout.com/api/v1/international/payment/create";

    if (!merchantId || !secretKey) {
      return NextResponse.json(
        { error: "Missing OPay credentials" },
        { status: 500 },
      );
    }

    const card = body?.card || {};
    const reference = `sub_${admin.salon.id}_${planKey}_${randomUUID()}`;

    const opayPayload = {
      amount: { currency: "NGN", total: PLAN_AMOUNT[planKey] * 100 }, // kobo
      bankcard: {
        cardHolderName: String(card.cardHolderName || ""),
        cardNumber: String(card.cardNumber || "").replace(/\s/g, ""),
        cvv: String(card.cvv || ""),
        enable3DS: true,
        expiryMonth: String(card.expiryMonth || ""),
        expiryYear: String(card.expiryYear || ""),
      },
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/opay/callback`,
      country: "NG",
      payMethod: "BankCard",
      product: {
        name: String(body?.productName || "Salon Subscription"),
        description: String(body?.productDescription || `${planKey} plan`),
      },
      reference,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/callback?provider=opay&reference=${encodeURIComponent(reference)}`,
      userInfo: {
        userId,
        userName: admin.user.fullName || admin.salon.name,
        userMobile: admin.user.phone || "",
        userEmail: admin.user.email,
      },
      expireAt: 30,
    };

    // Normalize payload for signature
    const payloadString = JSON.stringify(
      opayPayload,
      Object.keys(opayPayload).sort(),
    );
    const signature = createHmac("sha512", secretKey)
      .update(payloadString)
      .digest("hex");

    // Correct fetch headers for OPay
    const opayRes = await fetch(createUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${signature}`, // required
        MerchantId: merchantId, // required
      },
      body: payloadString,
    });

    const data = await opayRes.json().catch(() => null);
    if (!opayRes.ok || data?.code !== "00000") {
      return NextResponse.json(
        {
          error: data?.message || "OPay create payment failed",
          code: data?.code,
        },
        { status: 400 },
      );
    }

    const redirectUrl =
      data?.data?.nextAction?.redirectUrl || data?.data?.cashierUrl;
    if (!redirectUrl) {
      return NextResponse.json(
        { error: "Missing 3DS redirect URL" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      method: "BankCard",
      redirectUrl,
      reference: data?.data?.reference || reference,
      orderNo: data?.data?.orderNo,
      status: data?.data?.status || "PENDING",
    });
  } catch (err) {
    console.error("OPay subscription POST error:", err);
    return NextResponse.json(
      { error: "Initialization failed" },
      { status: 500 },
    );
  }
}
