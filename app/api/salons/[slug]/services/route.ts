import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyToken,
  extractToken,
  isSalonAdmin,
} from "@/lib/auth";

// GET services for a salon
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Await the params in Next.js 15+
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    const salon = await prisma.salon.findUnique({
      where: { slug: slug },
      select: { id: true },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    const services = await prisma.service.findMany({
      where: {
        salonId: salon.id,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error("[Services GET Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST create service (salon admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Await the params in Next.js 15+
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    const token = extractToken(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !isSalonAdmin(payload.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const salon = await prisma.salon.findUnique({
      where: { slug: slug },
      include: { admins: true },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    // Verify authorization
    const isAuthorized = salon.admins.some(
      (admin) => admin.userId === payload.userId,
    );
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, price, duration, category, image } = body;

    if (!name || price === undefined || !duration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const service = await prisma.service.create({
      data: {
        salonId: salon.id,
        name,
        description: description || null,
        price,
        duration,
        category: category || null,
        image: image || null,
      },
    });

    return NextResponse.json(
      { message: "Service created successfully", service },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("[Services POST Error]", error);
    return NextResponse.json(
      { error: error?.message || error?.toString() || "Internal server error" },
      { status: 500 },
    );
  }
}