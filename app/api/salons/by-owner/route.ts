import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const owner = req.nextUrl.searchParams.get("owner");
    
    if (!owner) {
      return NextResponse.json(
        { error: "Owner email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: owner },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Find salon admin record for this user
    const salonAdmin = await prisma.salonAdmin.findUnique({
      where: { userId: user.id },
      select: { salonId: true },
    });

    if (!salonAdmin) {
      return NextResponse.json(
        { error: "No salon found for this user" },
        { status: 404 }
      );
    }

    // Get salon details
    const salon = await prisma.salon.findUnique({
      where: { id: salonAdmin.salonId },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!salon) {
      return NextResponse.json(
        { error: "Salon data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(salon, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching salon by owner:", error);
    return NextResponse.json(
      { error: "Failed to fetch salon information" },
      { status: 500 }
    );
  }
}
