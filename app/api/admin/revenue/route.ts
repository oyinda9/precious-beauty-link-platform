import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, extractToken, isSuperAdmin } from "@/lib/auth";

// GET all revenue data (super admin only)
export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || !isSuperAdmin(payload.role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());
    const month = searchParams.get("month");

    let where: any = { year };
    if (month) {
      where.month = parseInt(month);
    }

    const revenue = await prisma.revenue.findMany({
      where,
      include: {
        salon: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { month: "asc" },
    });

    // Calculate totals
    const totalRevenue = revenue.reduce((sum: any, r: { amount: any; }) => sum + r.amount, 0);
    const totalBookings = revenue.reduce((sum: any, r: { totalBookings: any; }) => sum + r.totalBookings, 0);
    const totalClients = revenue.reduce((sum: any, r: { totalClients: any; }) => sum + r.totalClients, 0);

    return NextResponse.json({
      revenue,
      totals: {
        revenue: totalRevenue,
        bookings: totalBookings,
        clients: totalClients,
      },
    });
  } catch (error) {
    console.error("[Revenue GET Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
