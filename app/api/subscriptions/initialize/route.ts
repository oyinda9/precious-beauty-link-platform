import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, extractToken } from "@/lib/auth";
import { getPaymentConfig } from "@/lib/payment-config";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
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

    const { salonId, planKey, paymentMethod } = await req.json();

    if (!salonId || !planKey || !paymentMethod) {
      return NextResponse.json(
        {
          error: "Missing required fields: salonId, planKey, paymentMethod",
        },
        { status: 400 },
      );
    }

    // Verify salon exists and belongs to user
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      include: { admins: true },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    // Check if user is salon admin
    const isAdmin = salon.admins.some((admin) => admin.userId === payload.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Not authorized for this salon" },
        { status: 403 },
      );
    }

    // Check existing subscription
    let subscription = await prisma.subscription.findUnique({
      where: { salonId },
    });

    const planConfig: Record<
      string,
      { plan: string; price: number; bookingLimit: number }
    > = {
      FREE: { plan: "FREE", price: 0, bookingLimit: 10 },
      STARTER: { plan: "STARTER", price: 5000, bookingLimit: 30 },
      STANDARD: { plan: "STANDARD", price: 10000, bookingLimit: 50 },
      GROWTH: { plan: "GROWTH", price: 20000, bookingLimit: 100 },
      PREMIUM: { plan: "PREMIUM", price: 30000, bookingLimit: 999999 },
    };

    const plan = planConfig[planKey];
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Determine subscription status based on payment method
    // FREE plan = ACTIVE immediately
    // PAID plans with payment needed = PENDING_PAYMENT until verified
    const subscriptionStatus = plan.price === 0 ? "ACTIVE" : "PENDING_PAYMENT";

    if (!subscription) {
      // Create new subscription
      subscription = await prisma.subscription.create({
        data: {
          salonId,
          plan: plan.plan as any,
          status: subscriptionStatus,
          monthlyBookingLimit: plan.bookingLimit,
          paymentMethod: paymentMethod,
          currentPeriodStart: plan.price === 0 ? new Date() : null,
          currentPeriodEnd:
            plan.price === 0
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              : null,
        },
      });
    } else {
      // Update existing subscription
      subscription = await prisma.subscription.update({
        where: { salonId },
        data: {
          plan: plan.plan as any,
          status: subscriptionStatus,
          monthlyBookingLimit: plan.bookingLimit,
          paymentMethod: paymentMethod,
          currentPeriodStart:
            plan.price === 0 ? new Date() : subscription.currentPeriodStart,
          currentPeriodEnd:
            plan.price === 0
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              : subscription.currentPeriodEnd,
        },
      });
    }

    // Get payment config for display
    const paymentConfig = await getPaymentConfig();

    // Check for environment bank details
    const envBankDetails = {
      accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME,
      accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER,
      bankName: process.env.NEXT_PUBLIC_BANK_NAME,
    };

    // Build response based on subscription status
    let response: any = {
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
      },
    };

    // FREE plan - Activated immediately
    if (plan.price === 0) {
      response.message =
        "Congratulations! Your free trial is now active. Full access granted.";
      return NextResponse.json(response, { status: 200 });
    }

    // PAID plans - Payment required before activation
    if (subscription.status === "PENDING_PAYMENT") {
      response.requiresPayment = true;
      response.paymentRequired =
        "Payment is required to activate your subscription. Please complete the transfer and upload proof.";
    }

    // BANK_TRANSFER - Use env variables or database config
    if (
      paymentMethod === "BANK_TRANSFER" &&
      (envBankDetails.accountName || paymentConfig?.acceptBankTransfer)
    ) {
      response.bankDetails = {
        accountName:
          envBankDetails.accountName || paymentConfig?.bankAccountName,
        accountNumber:
          envBankDetails.accountNumber || paymentConfig?.bankAccountNumber,
        bankName: envBankDetails.bankName || paymentConfig?.bankName,
        bankCode: paymentConfig?.bankCode || null,
        amount: plan.price,
        currency: "NGN",
        note:
          paymentConfig?.paymentNote ||
          "Please transfer to the account and upload proof.",
      };
      response.message =
        "Bank transfer details provided. Please transfer the amount and upload proof.";
    } else if (
      paymentMethod === "CARD_PAYMENT" &&
      paymentConfig?.acceptCardPayment
    ) {
      response.cardDetails = {
        holderName: paymentConfig.cardHolderName,
        lastFour: paymentConfig.cardLastFour,
        brand: paymentConfig.cardBrand || "VISA",
        amount: plan.price,
        currency: "NGN",
        note: paymentConfig.paymentNote || "Payment for salon subscription",
      };
      response.message =
        "Card payment details provided. Please complete payment and upload proof.";
    } else if (
      paymentMethod === "CUSTOM_GATEWAY" &&
      (process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME ||
        paymentConfig?.bankAccountName)
    ) {
      response.bankDetails = {
        accountName:
          process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME ||
          paymentConfig?.bankAccountName,
        accountNumber:
          process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER ||
          paymentConfig?.bankAccountNumber,
        bankName: process.env.NEXT_PUBLIC_BANK_NAME || paymentConfig?.bankName,
        bankCode: paymentConfig?.bankCode || null,
        amount: plan.price,
        currency: "NGN",
        note:
          paymentConfig?.paymentNote ||
          "Please transfer to the account and upload proof.",
      };
      response.message =
        "Payment gateway details provided. Please transfer to the account and upload proof.";
    } else if (paymentMethod === "MONNIFY") {
      response.message = "Redirecting to Monnify payment gateway...";
      response.redirectToMonnify = true;
    } else {
      return NextResponse.json(
        { error: "Payment method not available" },
        { status: 400 },
      );
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Subscription initialization error:", error);
    return NextResponse.json(
      {
        error: "Failed to initialize subscription",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
