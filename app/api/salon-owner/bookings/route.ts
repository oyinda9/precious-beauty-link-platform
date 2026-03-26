import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  requireRole,
  requireSalonOwnership,
  apiError,
  apiSuccess,
} from "@/lib/auth-utils";

/**
 * GET /api/salon-owner/bookings
 * Returns bookings for the authenticated salon owner's salon only
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const { auth, response: authResponse } = await requireAuth(request);
    if (authResponse) return authResponse;

    // Verify user is a salon owner
    const roleError = requireRole(
      auth!,
      "SALON_ADMIN",
      "SALON_OWNER",
      "SALON_STAFF",
    );
    if (roleError) return roleError;

    // Get user's salon from SalonAdmin or SalonStaff
    const salonRel =
      (await prisma.salonAdmin.findUnique({
        where: { userId: auth!.userId },
        select: { salonId: true },
      })) ||
      (await prisma.salonStaff.findUnique({
        where: { userId: auth!.userId },
        select: { salonId: true },
      }));

    if (!salonRel || !salonRel.salonId) {
      return apiError("No associated salon found", 404);
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const sortBy = searchParams.get("sortBy") || "date";

    // Fetch only THIS salon's bookings
    const bookings = await prisma.booking.findMany({
      where: {
        salonId: salonRel.salonId,
        ...(status && status !== "ALL" && { status }),
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
          },
        },
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy:
        sortBy === "price"
          ? { totalPrice: "desc" }
          : sortBy === "status"
            ? { status: "asc" }
            : { createdAt: "desc" },
      take: 200,
    });

    // Calculate stats
    const stats = {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "PENDING").length,
      confirmed: bookings.filter((b) => b.status === "CONFIRMED").length,
      completed: bookings.filter((b) => b.status === "COMPLETED").length,
      cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
    };

    return apiSuccess({
      bookings,
      stats,
      salonId: salonRel.salonId,
    });
  } catch (error: any) {
    console.error("Salon bookings fetch error:", error);
    return apiError("Failed to fetch bookings", 500, error.message);
  }
}

/**
 * PATCH /api/salon-owner/bookings/[id]
 * Update booking status (confirm, complete, cancel)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication
    const { auth, response: authResponse } = await requireAuth(request);
    if (authResponse) return authResponse;

    // Verify user is a salon staff
    const roleError = requireRole(
      auth!,
      "SALON_ADMIN",
      "SALON_OWNER",
      "SALON_STAFF",
    );
    if (roleError) return roleError;

    const body = await request.json();
    const { bookingId, status } = body;

    if (!bookingId || !status) {
      return apiError("Missing bookingId or status", 400);
    }

    // Verify valid status
    const validStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return apiError("Invalid status", 400);
    }

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { salon: true },
    });

    if (!booking) {
      return apiError("Booking not found", 404);
    }

    // Verify user owns the salon
    const salonRel =
      (await prisma.salonAdmin.findUnique({
        where: { userId: auth!.userId },
        select: { salonId: true },
      })) ||
      (await prisma.salonStaff.findUnique({
        where: { userId: auth!.userId },
        select: { salonId: true },
      }));

    if (!salonRel || salonRel.salonId !== booking.salonId) {
      return apiError("You can only update your own salon's bookings", 403);
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        service: true,
        salon: true,
        staff: true,
      },
    });

    return apiSuccess({
      booking: updatedBooking,
      message: `Booking ${status.toLowerCase()} successfully`,
    });
  } catch (error: any) {
    console.error("Update booking error:", error);
    return apiError("Failed to update booking", 500, error.message);
  }
}
