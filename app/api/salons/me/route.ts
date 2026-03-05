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
      where: { userId: payload.userId },
      select: { salon: true },
    });

    const salons = adminLinks.map((link) => link.salon);

    // include basic user info from token
    const user = {
      id: payload.userId,
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role,
    };

    return NextResponse.json({ salons, user }, { status: 200 });
  } catch (error) {
    return apiError("Salon Me GET Error", error, "Internal server error", 500);
  }
}
