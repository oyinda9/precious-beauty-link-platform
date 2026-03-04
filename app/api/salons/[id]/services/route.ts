import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";

// GET - Fetch services for a salon
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const services = await prisma.service.findMany({
      where: {
        salonId: id,
        isActive: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      { services },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Services GET Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

// POST - Create a new service
export async function POST(
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

    // Check if salon belongs to user
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

    const body = await request.json();
    const { name, description, price, duration } = body;

    if (!name || price === undefined || !duration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        salonId: id,
        name,
        description: description || null,
        price: parseFloat(price),
        duration: parseInt(duration),
      },
    });

    return NextResponse.json(
      {
        message: "Service created successfully",
        service,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Services POST Error]", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}
