import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { apiError } from "@/lib/api-utils";

// DELETE - Remove specific staff member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (currentUser.role !== UserRole.SALON_ADMIN) {
      return NextResponse.json(
        { error: "Only salon admins can remove staff" },
        { status: 403 },
      );
    }

    const { id } = params;

    // Get salon admin's salon
    const salonAdmin = await prisma.salonAdmin.findFirst({
      where: {
        userId: currentUser.id,
      },
    });

    if (!salonAdmin) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    // Get staff and verify it belongs to this salon
    const staff = await prisma.salonStaff.findFirst({
      where: {
        id,
        salonId: salonAdmin.salonId,
      },
    });

    if (!staff) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 },
      );
    }

    // Delete staff record and associated user
    await prisma.salonStaff.delete({
      where: { id },
    });

    await prisma.user.delete({
      where: { id: staff.userId },
    });

    return NextResponse.json({ message: "Staff member removed successfully" });
  } catch (error) {
    return apiError("Delete Staff Error", error, "Failed to delete staff", 500);
  }
}
