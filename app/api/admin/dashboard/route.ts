import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, extractToken, isSuperAdmin } from "@/lib/auth";

// GET super admin dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !isSuperAdmin(payload.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    // Get subscription breakdown
    const subscriptionStats = await prisma.salon.groupBy({
      by: ["subscriptionStatus"],
      _count: true,
    });

    // Get recent bookings
    // include full salon record to avoid TS "slug" select error
    const recentBookings = await prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        salon: true,
        client: { select: { id: true, fullName: true } },
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
          salonName: salon?.name,
          salonSlug: salon?.slug,
          totalRevenue: item._sum.amount || 0,
          totalBookings: salon?._count.bookings || 0,
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
      },
      subscriptionBreakdown: subscriptionStats,
      recentBookings,
      topSalons: topSalonsData,
      salons,
      users,
      analytics: { bookingsBySalon },
    });
  } catch (error) {
    console.error("[Admin Dashboard GET Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
