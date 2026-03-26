import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  requireRole,
  apiError,
  apiSuccess,
} from "@/lib/auth-utils";

/**
 * GET /api/client/bookings
 * Returns bookings for the authenticated client only
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const { auth, response: authResponse } = await requireAuth(request);
    if (authResponse) return authResponse;

    // Verify user is a client
    const roleError = requireRole(auth!, "CLIENT");
    if (roleError) return roleError;

    // Get query parameters for filtering
    const searchParams = request.nextParams || {};
    const status = searchParams.status || undefined;

    // Fetch client bookings (filtered by their user ID or phone)
    const clientBookings = await prisma.booking.findMany({
      where: {
        // In a proper implementation, bookings should have a clientId field
        // For now, we filter by phone if available
        clientPhone: auth!.email?.replace("@", "-") || undefined,
        ...(status && { status }),
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
          },
        },
        salon: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            city: true,
            phone: true,
            email: true,
          },
        },
      },
      orderBy: {
        bookingDate: "desc",
      },
      take: 100,
    });

    return apiSuccess({
      bookings: clientBookings,
      count: clientBookings.length,
    });
  } catch (error: any) {
    console.error("Client bookings fetch error:", error);
    return apiError("Failed to fetch your bookings", 500, error.message);
  }
}

/**
 * PATCH /api/client/bookings/[id]/cancel
 * Allows clients to cancel their own bookings
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication
    const { auth, response: authResponse } = await requireAuth(request);
    if (authResponse) return authResponse;

    // Verify user is a client
    const roleError = requireRole(auth!, "CLIENT");
    if (roleError) return roleError;

    const body = await request.json();
    const { bookingId, action } = body;

    if (!bookingId || !action) {
      return apiError("Missing bookingId or action", 400);
    }

    // Only allow clients to cancel their own bookings
    if (action !== "cancel") {
      return apiError("Clients can only cancel bookings", 403);
    }

    // Verify the booking belongs to the client
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return apiError("Booking not found", 404);
    }

    // Verify ownership (simple check - should use clientId in real app)
    if (booking.clientPhone !== auth!.email?.replace("@", "-")) {
      return apiError("You can only cancel your own bookings", 403);
    }

    // Check if booking can still be cancelled
    if (booking.status === "COMPLETED" || booking.status === "CANCELLED") {
      return apiError(
        "Cannot cancel a completed or already cancelled booking",
        400,
      );
    }

    // Cancel the booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
      include: {
        service: true,
        salon: true,
      },
    });

    return apiSuccess({
      booking: updatedBooking,
      message: "Booking cancelled successfully",
    });
  } catch (error: any) {
    console.error("Cancel booking error:", error);
    return apiError("Failed to cancel booking", 500, error.message);
  }
}
