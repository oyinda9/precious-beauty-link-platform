import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const salon = await prisma.salon.findUnique({
      where: { id },
      include: {
        services: {
          where: { isActive: true },
        },
        timeSlots: {
          where: { isActive: true },
        },
        reviews: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: { bookings: true, reviews: true },
        },
      },
    });

    if (!salon) {
      return NextResponse.json(
        { error: "Salon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { salon },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Salon GET Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch salon" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    // Check if user is owner or admin
    const salon = await prisma.salon.findUnique({
      where: { id },
    });

    if (!salon) {
      return NextResponse.json(
        { error: "Salon not found" },
        { status: 404 }
      );
    }

    if (
      currentUser.role !== UserRole.ADMIN &&
      salon.adminId !== currentUser.userId
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const updatedSalon = await prisma.salon.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(
      {
        message: "Salon updated successfully",
        salon: updatedSalon,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Salon PUT Error]", error);
    return NextResponse.json(
      { error: "Failed to update salon" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = params;

    await prisma.salon.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Salon deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Salon DELETE Error]", error);
    return NextResponse.json(
      { error: "Failed to delete salon" },
      { status: 500 }
    );
  }
}
