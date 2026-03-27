import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, extractToken } from "@/lib/auth";

// GET - Retrieve current payment configuration
export async function GET(req: NextRequest) {
  try {
    // Check if Prisma client is available
    if (!prisma) {
      console.error("Prisma client not initialized");
      return NextResponse.json(
        {
          bankAccountName: null,
          bankAccountNumber: null,
          bankName: null,
          acceptBankTransfer: false,
          acceptCardPayment: false,
          paymentNote: null,
        },
        { status: 200 },
      );
    }

    const config = await prisma.adminPaymentConfig.findFirst({
      where: { isActive: true },
    });

    if (!config) {
      return NextResponse.json(
        {
          bankAccountName: null,
          bankAccountNumber: null,
          bankName: null,
          acceptBankTransfer: false,
          acceptCardPayment: false,
          paymentNote: null,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        id: config.id,
        bankAccountName: config.bankAccountName,
        bankAccountNumber: config.bankAccountNumber,
        bankName: config.bankName,
        bankCode: config.bankCode,
        cardHolderName: config.cardHolderName,
        cardLastFour: config.cardLastFour,
        cardBrand: config.cardBrand,
        acceptBankTransfer: config.acceptBankTransfer,
        acceptCardPayment: config.acceptCardPayment,
        paymentNote: config.paymentNote,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching payment config:", error?.message || error);
    // Return default empty config instead of error to allow registration to continue
    return NextResponse.json(
      {
        bankAccountName: null,
        bankAccountNumber: null,
        bankName: null,
        acceptBankTransfer: false,
        acceptCardPayment: false,
        paymentNote: null,
      },
      { status: 200 },
    );
  }
}

// POST/PUT - Update payment configuration (admin only)
export async function POST(req: NextRequest) {
  try {
    // Verify admin authorization
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = extractToken(authHeader);
    if (!token) {
      return NextResponse.json(
        { error: "Invalid authorization header" },
        { status: 401 },
      );
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only super admins can configure payments" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const {
      bankAccountName,
      bankAccountNumber,
      bankName,
      bankCode,
      cardHolderName,
      cardLastFour,
      cardBrand,
      acceptBankTransfer,
      acceptCardPayment,
      paymentNote,
    } = body;

    // Validate at least one payment method is enabled
    if (!acceptBankTransfer && !acceptCardPayment) {
      return NextResponse.json(
        { error: "At least one payment method must be enabled" },
        { status: 400 },
      );
    }

    // Check if config already exists
    const existingConfig = await prisma.adminPaymentConfig.findFirst({
      where: { isActive: true },
    });

    let config;
    if (existingConfig) {
      // Update existing
      config = await prisma.adminPaymentConfig.update({
        where: { id: existingConfig.id },
        data: {
          bankAccountName: bankAccountName || null,
          bankAccountNumber: bankAccountNumber || null,
          bankName: bankName || null,
          bankCode: bankCode || null,
          cardHolderName: cardHolderName || null,
          cardLastFour: cardLastFour || null,
          cardBrand: cardBrand || "VISA",
          acceptBankTransfer,
          acceptCardPayment,
          paymentNote: paymentNote || null,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new
      config = await prisma.adminPaymentConfig.create({
        data: {
          bankAccountName: bankAccountName || null,
          bankAccountNumber: bankAccountNumber || null,
          bankName: bankName || null,
          bankCode: bankCode || null,
          cardHolderName: cardHolderName || null,
          cardLastFour: cardLastFour || null,
          cardBrand: cardBrand || "VISA",
          acceptBankTransfer,
          acceptCardPayment,
          paymentNote: paymentNote || null,
          isActive: true,
        },
      });
    }

    return NextResponse.json(
      {
        message: "Payment configuration updated successfully",
        config: {
          id: config.id,
          bankAccountName: config.bankAccountName,
          bankAccountNumber: config.bankAccountNumber,
          bankName: config.bankName,
          bankCode: config.bankCode,
          cardHolderName: config.cardHolderName,
          cardLastFour: config.cardLastFour,
          cardBrand: config.cardBrand,
          acceptBankTransfer: config.acceptBankTransfer,
          acceptCardPayment: config.acceptCardPayment,
          paymentNote: config.paymentNote,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating payment config:", error);
    return NextResponse.json(
      {
        error: "Failed to update payment configuration",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
