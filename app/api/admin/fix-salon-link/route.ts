import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";

/**
 * Quick fix endpoint to link a SALON_ADMIN user to their salon
 * This is a temporary diagnostic/fix route
 */
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (currentUser.role !== UserRole.SALON_ADMIN) {
      return NextResponse.json(
        { error: "Only salon admins can use this fix" },
        { status: 403 },
      );
    }

    // Check if already has a salon admin record
    const existingSalonAdmin = await prisma.salonAdmin.findFirst({
      where: {
        userId: currentUser.id,
      },
    });

    if (existingSalonAdmin) {
      return NextResponse.redirect("/app/salon-admin/staff");
    }

    // Get all salons
    const salons = await prisma.salon.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    if (salons.length === 0) {
      // Redirect to registration if no salons exist
      return NextResponse.redirect("/register-salon-owner");
    }

    // Get the most recent salon
    const salon = salons[0];

    // Link the user to this salon
    const salonAdmin = await prisma.salonAdmin.create({
      data: {
        userId: currentUser.id,
        salonId: salon.id,
      },
    });

    console.log(
      `[FIX] Linked user ${currentUser.id} to salon ${salon.id}`,
      salonAdmin,
    );

    // Redirect to staff page with success indicator
    return NextResponse.redirect("/app/salon-admin/staff?fixed=true");
  } catch (error) {
    console.error("[FIX /api/admin/fix-salon-link] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fix salon link",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
