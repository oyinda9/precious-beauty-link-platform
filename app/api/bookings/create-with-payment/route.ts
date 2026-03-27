import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/lib/services/booking-service";
import { getCurrentUser } from "@/lib/auth";

/**
 * POST /api/bookings/create-with-payment
 * Create a booking with payment method selection
 * Supports: BANK_TRANSFER | PAY_AT_SALON
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      salonId,
      serviceId,
      staffId,
      clientId,
      clientPhone,
      bookingDate,
      startTime,
      endTime,
      paymentMethod,
      notes,
    } = body;

    // Validation
    if (!salonId || !serviceId || !bookingDate || !startTime) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: salonId, serviceId, bookingDate, startTime",
        },
        { status: 400 },
      );
    }

    if (
      !paymentMethod ||
      !["BANK_TRANSFER", "PAY_AT_SALON"].includes(paymentMethod)
    ) {
      return NextResponse.json(
        {
          error: "paymentMethod must be BANK_TRANSFER or PAY_AT_SALON",
        },
        { status: 400 },
      );
    }

    if (!clientPhone && !clientId) {
      return NextResponse.json(
        { error: "Either clientPhone or clientId must be provided" },
        { status: 400 },
      );
    }

    // Validate booking date is in future
    const bookingDateTime = new Date(bookingDate);
    if (bookingDateTime < new Date()) {
      return NextResponse.json(
        { error: "Booking date must be in the future" },
        { status: 400 },
      );
    }

    // Create booking with new payment flow
    const booking = await createBooking({
      salonId,
      serviceId,
      staffId,
      clientId,
      clientPhone,
      bookingDate: bookingDateTime,
      startTime,
      endTime,
      paymentMethod: paymentMethod as "BANK_TRANSFER" | "PAY_AT_SALON",
      notes,
    });

    // Get bank details for bank transfer from environment
    let bankDetails = null;
    if (paymentMethod === "BANK_TRANSFER") {
      const salon = await require("@/lib/prisma").prisma.salon.findUnique({
        where: { id: salonId },
        select: {
          name: true,
          phone: true,
        },
      });

      if (salon) {
        bankDetails = {
          salonName: salon.name,
          accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || null,
          accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || null,
          bankName: process.env.NEXT_PUBLIC_BANK_NAME || null,
          amount: booking.totalPrice,
          reference: booking.id,
        };
      }
    }

    return NextResponse.json(
      {
        booking: {
          id: booking.id,
          status: booking.status,
          paymentMethod: booking.paymentMethod,
          totalPrice: booking.totalPrice,
          bookingDate: booking.bookingDate,
          startTime: booking.startTime,
          endTime: booking.endTime,
          serviceName: booking.service?.name,
          salonName: booking.salon?.name,
        },
        bankDetails,
        message:
          paymentMethod === "BANK_TRANSFER"
            ? "Booking created. Please transfer the amount shown above to the salon account."
            : "Booking created. Payment will be collected at the salon.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create booking",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/bookings/check-quota
 * Check if salon can create more bookings this month
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get("salonId");

    if (!salonId) {
      return NextResponse.json(
        { error: "salonId is required" },
        { status: 400 },
      );
    }

    const {
      getRemainingBookings,
      getSubscriptionPlan,
    } = require("@/lib/services/subscription-service");

    const subscription = await getSubscriptionPlan(salonId);
    const remaining = await getRemainingBookings(salonId);

    return NextResponse.json({
      salonId,
      plan: subscription.plan,
      bookingLimit: subscription.monthlyBookingLimit,
      used: subscription.bookingsUsedThisMonth,
      remaining,
      quotaReached: remaining <= 0,
    });
  } catch (error) {
    console.error("Check quota error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}
