import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { apiError } from "@/lib/api-utils";

// GET - Fetch all salons or salons by filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = { isActive: true };

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const salons = await prisma.salon.findMany({
      where,
      include: {
        services: {
          where: { isActive: true },
        },
        _count: {
          select: { bookings: true, reviews: true },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { rating: "desc" },
    });

    const total = await prisma.salon.count({ where });

    return NextResponse.json(
      {
        salons,
        total,
        limit,
        offset,
      },
      { status: 200 },
    );
  } catch (error) {
    return apiError("Salons GET Error", error, "Failed to fetch salons", 500);
  }
}

// POST - Create a new salon (Salon Owner or Admin only)
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (currentUser.role === UserRole.CLIENT) {
      return NextResponse.json(
        { error: "Clients cannot create salons" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      address,
      city,
      phone,
      email,
      latitude,
      longitude,
    } = body;

    if (!name || !address || !city || !phone || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-");

    const salon = await prisma.salon.create({
      data: {
        name,
        slug,
        description: description || null,
        address,
        city,
        phone,
        email,
        latitude: latitude || null,
        longitude: longitude || null,
        id:
          currentUser.role === UserRole.SUPER_ADMIN
            ? currentUser.userId
            : undefined,
      },
    });

    return NextResponse.json(
      {
        message: "Salon created successfully",
        salon,
      },
      { status: 201 },
    );
  } catch (error) {
    return apiError("Salons POST Error", error, "Failed to create salon", 500);
  }
}
