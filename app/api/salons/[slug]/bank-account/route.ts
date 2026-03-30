import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  logBankAccountUpdate,
  logBankDetailAccess,
} from "@/lib/services/audit-service";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/salons/[slug]/bank-account
 * Get salon bank account details
 * Only salon owner or admin can view full details
 * Returns masked details for customers
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser();
    const ipAddress = request.headers.get("x-forwarded-for") || undefined;

    const salon = await prisma.salon.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        bankAccountName: true,
        bankAccountNumber: true,
        bankName: true,
        bankVerified: true,
        admins: {
          select: { userId: true },
        },
      },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    // Check if user is salon admin
    const isAdmin =
      user && salon.admins.some((admin) => admin.userId === user.id);

    // Log access
    if (user) {
      await logBankDetailAccess(user.id, salon.id, ipAddress);
    }

    // If salon owner/admin, return full details
    if (isAdmin) {
      return NextResponse.json({
        salonId: salon.id,
        salonName: salon.name,
        bankAccountName: salon.bankAccountName,
        bankAccountNumber: salon.bankAccountNumber,
        bankName: salon.bankName,
        bankVerified: salon.bankVerified,
      });
    }

    // Otherwise, return only public info (masked account number)
    const maskedAccountNumber = salon.bankAccountNumber
      ? `****${salon.bankAccountNumber.slice(-4)}`
      : null;

    return NextResponse.json({
      salonId: salon.id,
      salonName: salon.name,
      bankAccountName: salon.bankAccountName,
      bankAccountNumber: maskedAccountNumber,
      bankName: salon.bankName,
    });
  } catch (error) {
    console.error("Get bank account error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * PUT /api/salons/[slug]/bank-account
 * Update salon bank account details
 * Only salon owner/admin can update
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const { bankAccountName, bankAccountNumber, bankName } =
      await request.json();

    // Validation
    if (!bankAccountName || !bankAccountNumber || !bankName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verify salon ownership - find salon by slug first
    const salon = await prisma.salon.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    // Check if user is admin of this salon
    const salonAdmin = await prisma.salonAdmin.findFirst({
      where: {
        salonId: salon.id,
        userId: user.id,
      },
    });

    if (!salonAdmin) {
      return NextResponse.json(
        { error: "Unauthorized or salon not found" },
        { status: 403 },
      );
    }

    // Update bank account
    const updated = await prisma.salon.update({
      where: { id: salon.id },
      data: {
        bankAccountName,
        bankAccountNumber,
        bankName,
        bankVerified: false, // Reset verification when changed
      },
      select: {
        id: true,
        name: true,
        bankAccountName: true,
        bankAccountNumber: true,
        bankName: true,
        bankVerified: true,
      },
    });

    // Log the update
    const ipAddress = request.headers.get("x-forwarded-for") || undefined;
    await logBankAccountUpdate(
      user.id,
      salon.id,
      bankAccountName,
      bankAccountNumber,
      bankName,
      ipAddress,
    );

    return NextResponse.json({
      message: "Bank account updated successfully",
      salon: {
        ...updated,
        bankAccountNumber: updated.bankAccountNumber
          ? `****${updated.bankAccountNumber.slice(-4)}`
          : null,
      },
    });
  } catch (error) {
    console.error("Update bank account error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}
