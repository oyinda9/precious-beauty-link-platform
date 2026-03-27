import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getToken(request: NextRequest) {
  return (
    request.cookies.get("token")?.value ||
    request.cookies.get("auth-token")?.value ||
    request.cookies.get("authToken")?.value ||
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("auth_token")?.value ||
    extractToken(request.headers.get("authorization"))
  );
}

function getUserIdFromToken(token: string) {
  const payload = verifyToken(token) as {
    userId?: string;
    id?: string;
    sub?: string;
  } | null;

  return payload?.userId || payload?.id || payload?.sub || null;
}

export async function GET(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the salon admin record to get salonId
    const admin = await prisma.salonAdmin.findFirst({
      where: { userId },
      select: { salonId: true },
    });

    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const salonId = admin.salonId;

    // Fetch all bookings for this salon with payment receipts
    const bookings = await prisma.booking.findMany({
      where: {
        salonId,
      },
      select: {
        id: true,
        clientPhone: true,
        bookingDate: true,
        totalPrice: true,
        status: true,
        service: {
          select: {
            name: true,
          },
        },
        payment: {
          select: {
            proofOfPayment: true,
            status: true,
          },
        },
      },
      orderBy: {
        bookingDate: "desc",
      },
    });

    return NextResponse.json({
      bookings,
    });
  } catch (error: any) {
    console.error("Error fetching bookings with receipts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
