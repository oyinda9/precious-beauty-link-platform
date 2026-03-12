import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/subscription?salonId=xxx
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get("salonId");
    if (!salonId) {
      return NextResponse.json({ error: "Missing salonId" }, { status: 400 });
    }

    const subscription = await prisma.subscription.findFirst({
      where: { salonId },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
