import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, extractToken, isSuperAdmin } from "@/lib/auth";
import { apiError } from "@/lib/api-utils";

// GET super admin dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = extractToken(authHeader);
    if (!token) {
      console.error("[Admin Dashboard] No token in Authorization header", {
        authHeader,
      });
      return NextResponse.json(
        { error: "Unauthorized - Missing token" },
        { status: 401 },
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      console.error("[Admin Dashboard] Invalid token");
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 },
      );
    }

    if (!isSuperAdmin(payload.role)) {
      console.error("[Admin Dashboard] User not super admin", {
        role: payload.role,
        userId: payload.id,
      });
      return NextResponse.json(
        {
          error: `Forbidden - Requires SUPER_ADMIN role. Current role: ${payload.role}`,
        },
        { status: 403 },
      );
    }

    // Get counts
    const totalSalons = await prisma.salon.count();
    const activeSalons = await prisma.salon.count({
      where: { isActive: true },
    });
    const totalClients = await prisma.client.count();
    const totalBookings = await prisma.booking.count();
    const completedBookings = await prisma.booking.count({
      where: { status: "COMPLETED" },
    });

    // Get total revenue
    const revenueData = await prisma.revenue.aggregate({
      _sum: { amount: true },
    });
    const totalRevenue = revenueData._sum.amount || 0;

    // Get pending approvals (pending payments)
    const pendingApprovals = await prisma.subscription.count({
      where: { status: "PENDING_PAYMENT" },
    });

    // Get subscription breakdown
    const subscriptionStats = await prisma.salon.groupBy({
      by: ["subscriptionStatus"],
      _count: true,
    });

    // Get recent bookings with proper client/user relationship
    const recentBookings = await prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        salon: { select: { id: true, name: true, slug: true } },
        client: { select: { fullName: true, email: true } },
        service: { select: { name: true, price: true } },
      },
    });

    // Get top salons by revenue
    const topSalons = await prisma.revenue.groupBy({
      by: ["salonId"],
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 5,
    });

    const topSalonsData = await Promise.all(
      topSalons.map(async (item: any) => {
        const salon = await prisma.salon.findUnique({
          where: { id: item.salonId },
          select: {
            id: true,
            name: true,
            slug: true,
            _count: {
              select: { bookings: true },
            },
          },
        });
        return {
          salonId: item.salonId,
          salonName: salon?.name || "Unknown",
          totalRevenue: item._sum.amount || 0,
          bookingCount: salon?._count.bookings || 0,
        };
      }),
    );

    // also fetch salons and users for management views
    const salons = await prisma.salon.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        rating: true,
        reviewCount: true,
        isActive: true,
        subscriptionStatus: true,
        createdAt: true,
      },
    });

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // simple analytics: bookings per salon
    const bookingsBySalonRaw = await prisma.booking.groupBy({
      by: ["salonId"],
      _count: { id: true },
    });

    const bookingsBySalon = await Promise.all(
      bookingsBySalonRaw.map(async (b: any) => {
        const s = await prisma.salon.findUnique({
          where: { id: b.salonId },
          select: { id: true, name: true },
        });
        return {
          salonId: b.salonId,
          salonName: s?.name || "Unknown",
          bookings: b._count.id,
        };
      }),
    );

    return NextResponse.json({
      overview: {
        totalSalons,
        activeSalons,
        totalClients,
        totalBookings,
        completedBookings,
        totalRevenue,
        pendingApprovals,
      },
      subscriptionBreakdown: subscriptionStats,
      recentBookings,
      topSalons: topSalonsData,
      salons,
      users,
      analytics: { bookingsBySalon },
    });
  } catch (error) {
    return apiError(
      "Admin Dashboard GET Error",
      error,
      "Internal server error",
      500,
    );
  }
}
