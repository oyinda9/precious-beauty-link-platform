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
    request.cookies.get("token")?.value ||
    request.cookies.get("auth-token")?.value ||
    request.cookies.get("authToken")?.value ||
    request.cookies.get("accessToken")?.value ||
    extractToken(request.headers.get("authorization"))
  );
}

async function getMonnifyAccessToken() {
  const apiKey = String(process.env.MONNIFY_API_KEY || "").trim();
  const secretKey = String(process.env.MONNIFY_SECRET_KEY || "").trim();
  const baseUrl = String(
    process.env.MONNIFY_BASE_URL || "https://sandbox.monnify.com",
  ).trim();

  const basic = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");

  const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}` },
  });

  const data = await res.json().catch(() => null);
  const token = data?.responseBody?.accessToken;
  if (!res.ok || !token)
    throw new Error(data?.responseMessage || "Monnify auth failed");
  return token as string;
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

    const contractCode = String(process.env.MONNIFY_CONTRACT_CODE || "").trim();
    const baseUrl = String(
      process.env.MONNIFY_BASE_URL || "https://sandbox.monnify.com",
    ).trim();
    if (!contractCode) {
      return NextResponse.json(
        { error: "Missing MONNIFY_CONTRACT_CODE" },
        { status: 500 },
      );
    }

    const accessToken = await getMonnifyAccessToken();
    const reference = `sub_${admin.salon.id}_${planKey}_${randomUUID()}`;

    const initPayload = {
      amount: PLAN_AMOUNT[planKey],
      customerName: admin.user.fullName || admin.salon.name,
      customerEmail: admin.user.email,
      paymentReference: reference,
      paymentDescription: String(
        body?.productDescription || `${planKey} subscription`,
      ),
      currencyCode: "NGN",
      contractCode,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/callback?provider=monnify&reference=${encodeURIComponent(reference)}`,
      paymentMethods: ["CARD", "ACCOUNT_TRANSFER"],
    };

    const initRes = await fetch(
      `${baseUrl}/api/v1/merchant/transactions/init-transaction`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(initPayload),
      },
    );

    const initData = await initRes.json().catch(() => null);
    const checkoutUrl = initData?.responseBody?.checkoutUrl;

    if (!initRes.ok || !checkoutUrl) {
      return NextResponse.json(
        { error: initData?.responseMessage || "Monnify init failed" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      redirectUrl: checkoutUrl,
      reference,
      provider: "monnify",
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Initialization failed" },
      { status: 500 },
    );
  }
}
