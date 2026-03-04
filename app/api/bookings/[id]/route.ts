import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { UserRole, BookingStatus } from "@prisma/client";

// GET - Fetch a specific booking
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        client: true,
        service: true,
        salon: true,
        review: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check authorization
    if (
      currentUser.role === UserRole.CLIENT &&
      booking.clientId !== currentUser.userId
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    if (
      currentUser.role === UserRole.SALON_OWNER &&
      booking.salon.adminId !== currentUser.userId
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { booking },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Booking GET Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

// PUT - Update booking status or details
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { salon: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check authorization
    if (
      currentUser.role === UserRole.CLIENT &&
      booking.clientId !== currentUser.userId
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    if (
      currentUser.role === UserRole.SALON_OWNER &&
      booking.salon.adminId !== currentUser.userId
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: body,
      include: {
        client: true,
        service: true,
        salon: true,
      },
    });

    return NextResponse.json(
      {
        message: "Booking updated successfully",
        booking: updatedBooking,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Booking PUT Error]", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel a booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { salon: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check authorization
    if (
      currentUser.role === UserRole.CLIENT &&
      booking.clientId !== currentUser.userId
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    if (
      currentUser.role === UserRole.SALON_OWNER &&
      booking.salon.adminId !== currentUser.userId
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Only allow cancellation of pending/confirmed bookings
    if (![BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status)) {
      return NextResponse.json(
        { error: "Cannot cancel booking with this status" },
        { status: 400 }
      );
    }

    const cancelledBooking = await prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
    });

    return NextResponse.json(
      { message: "Booking cancelled successfully", booking: cancelledBooking },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Booking DELETE Error]", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
