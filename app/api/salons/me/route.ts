import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractToken, verifyToken, isSalonAdmin } from "@/lib/auth";
import { apiError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !isSalonAdmin(payload.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // find all salons for which the user is admin
    const adminLinks = await prisma.salonAdmin.findMany({
      where: { userId: payload.id },
      select: { salon: true },
    });

    // Fetch all subscriptions for these salons in a single query
    const salonIds = adminLinks.map((link) => link.salon.id);
    const subscriptions = await prisma.subscription.findMany({
      where: { salonId: { in: salonIds } },
      select: { salonId: true, plan: true, status: true },
    });

    // Create a map for quick lookup
    const subscriptionMap = new Map(
      subscriptions.map((sub) => [
        sub.salonId,
        { plan: sub.plan, status: sub.status },
      ]),
    );

    // Attach subscription data to salons
    const salons = adminLinks.map((link) => ({
      ...link.salon,
      subscription: subscriptionMap.get(link.salon.id) || null,
    }));

    // include basic user info from token
    const user = {
      id: payload.id,
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role,
    };

    return NextResponse.json({ salons, user }, { status: 200 });
  } catch (error) {
    return apiError("Salon Me GET Error", error, "Internal server error", 500);
  }
}
