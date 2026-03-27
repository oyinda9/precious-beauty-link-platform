import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-utils";

/**
 * GET /api/salon-owner/dashboard
 * Returns dashboard data for the authenticated salon owner's salon only
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return apiError("Unauthorized", 401);
    }

    // Extract user ID from token
    const token = authHeader.replace("Bearer ", "");
    let userId: string;

    try {
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString(),
      );
      userId = payload.id || payload.sub || payload.userId;
    } catch (e) {
      return apiError("Invalid token", 401);
    }

    // Get user and verify they own a salon
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== "SALON_ADMIN") {
      return apiError("Access denied: Not a salon owner", 403);
    }

    // Get user's salon from SalonAdmin or SalonStaff
    const salonRel =
      (await prisma.salonAdmin.findUnique({
        where: { userId },
        select: { salonId: true },
      })) ||
      (await prisma.salonStaff.findUnique({
        where: { userId },
        select: { salonId: true },
      }));

    if (!salonRel || !salonRel.salonId) {
      return apiError("No associated salon found", 404);
    }

    const salonId = salonRel.salonId;

    // Fetch only this salon's data
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      include: {
        subscription: true,
      },
    });

    if (!salon) {
      return apiError("Salon not found", 404);
    }

    // Get bookings for THIS salon only
    const bookings = await prisma.booking.findMany({
      where: { salonId },
      include: {
        service: true,
        staff: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Get services for THIS salon only
    const services = await prisma.service.findMany({
      where: { salonId },
    });

    // Get staff for THIS salon only
    const staff = await prisma.salonStaff.findMany({
      where: { salonId },
    });

    // Calculate stats
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(
      (b) => b.status === "COMPLETED",
    ).length;
    const pendingBookings = bookings.filter(
      (b) => b.status === "PENDING",
    ).length;
    const totalRevenue = bookings
      .filter(
        (b) => b.status === "COMPLETED" && b.paymentStatus === "COMPLETED",
      )
      .reduce((sum, b) => sum + b.totalPrice, 0);

    // Get reviews for THIS salon only
    const reviews = await prisma.review.findMany({
      where: { salonId },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const dashboardData = {
      stats: {
        totalBookings,
        completedBookings,
        pendingBookings,
        cancelledBookings: bookings.filter((b) => b.status === "CANCELLED")
          .length,
        totalRevenue,
        bookingTrend: 0, // Calculate based on historical data
        revenueTrend: 0, // Calculate based on historical data
        averageRating,
        reviewCount: reviews.length,
        staffCount: staff.length,
        servicesCount: services.length,
      },
      salon: {
        id: salon.id,
        name: salon.name,
        slug: salon.slug,
        description: salon.description,
        address: salon.address,
        city: salon.city,
        state: salon.state,
        phone: salon.phone,
        email: salon.email,
        subscriptionStatus: salon.subscription?.status,
        subscriptionPlan: salon.subscription?.plan,
      },
      upcomingBookings: bookings
        .filter((b) => b.status !== "CANCELLED")
        .slice(0, 5),
    };

    return NextResponse.json(dashboardData, { status: 200 });
  } catch (error: any) {
    console.error("Dashboard fetch error:", error);
    return apiError(error.message || "Failed to fetch dashboard", 500);
  }
}
