import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  markPaymentSubmitted,
  confirmPaymentReceived,
} from "@/lib/services/booking-service";
import {
  logPaymentSubmission,
  logPaymentConfirmation,
} from "@/lib/services/audit-service";

/**
 * POST /api/bookings/[bookingId]/submit-payment
 * Customer submits payment (for bank transfer bookings)
 * Status: AWAITING_PAYMENT → PAYMENT_SUBMITTED
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { bookingId: string } },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = params;

    // Mark payment as submitted
    const booking = await markPaymentSubmitted(bookingId);

    // Log payment submission
    const ipAddress = request.headers.get("x-forwarded-for") || undefined;
    await logPaymentSubmission(
      user.id,
      bookingId,
      booking.totalPrice,
      ipAddress,
    );

    return NextResponse.json({
      booking,
      message: "Payment submitted. Awaiting salon owner confirmation.",
    });
  } catch (error) {
    console.error("Submit payment error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/bookings/[bookingId]/confirm-payment
 * Salon owner confirms they received payment
 * Status: PAYMENT_SUBMITTED → PAID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { bookingId: string } },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = params;
    const { confirmationNotes } = await request.json();

    // Verify salon ownership
    const booking = await require("@/lib/prisma").prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        salon: {
          include: {
            admins: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if user is salon admin
    const isAdmin = booking.salon.admins.some(
      (admin: any) => admin.userId === user.id,
    );
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Confirm payment
    const confirmed = await confirmPaymentReceived(
      bookingId,
      confirmationNotes,
    );

    // Log payment confirmation
    const ipAddress = request.headers.get("x-forwarded-for") || undefined;
    await logPaymentConfirmation(
      user.id,
      bookingId,
      confirmed.totalPrice,
      ipAddress,
    );

    return NextResponse.json({
      booking: confirmed,
      message: "Payment confirmed. Booking status updated to PAID.",
    });
  } catch (error) {
    console.error("Confirm payment error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}
