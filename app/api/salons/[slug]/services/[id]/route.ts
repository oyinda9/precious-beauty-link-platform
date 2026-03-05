import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractToken, verifyToken, isSalonAdmin } from "@/lib/auth";
import { apiError } from "@/lib/api-utils";

// PUT update service
export async function PUT(request: NextRequest, { params }: { params: { slug: string; id: string } }) {
  try {
    const token = extractToken(request.headers.get("authorization"));
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !isSalonAdmin(payload.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { slug, id } = params;
    if (!slug || !id) return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });

    // ensure salon exists and user is admin
    const salon = await prisma.salon.findUnique({ where: { slug: slug.toLowerCase() }, include: { admins: true } });
    if (!salon) return NextResponse.json({ error: "Salon not found" }, { status: 404 });

    const isAuthorized = salon.admins.some(a => a.userId === payload.userId);
    if (!isAuthorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { name, description, price, duration, category, image, isActive } = body;
    if (!name || price === undefined || !duration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        description: description !== undefined ? description : undefined,
        price,
        duration,
        category: category !== undefined ? category : undefined,
        image: image !== undefined ? image : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });
    return NextResponse.json({ message: "Service updated", service }, { status: 200 });
  } catch (error) {
    return apiError("Service PUT Error", error, "Internal server error", 500);
  }
}

// DELETE service
export async function DELETE(request: NextRequest, { params }: { params: { slug: string; id: string } }) {
  try {
    const token = extractToken(request.headers.get("authorization"));
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !isSalonAdmin(payload.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { slug, id } = params;
    if (!slug || !id) return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });

    const salon = await prisma.salon.findUnique({ where: { slug: slug.toLowerCase() }, include: { admins: true } });
    if (!salon) return NextResponse.json({ error: "Salon not found" }, { status: 404 });

    const isAuthorized = salon.admins.some(a => a.userId === payload.userId);
    if (!isAuthorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.service.delete({ where: { id } });

    return NextResponse.json({ message: "Service deleted" }, { status: 200 });
  } catch (error) {
    return apiError("Service DELETE Error", error, "Internal server error", 500);
  }
}
