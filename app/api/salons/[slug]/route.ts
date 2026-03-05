import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, extractToken, isSuperAdmin } from "@/lib/auth";
import { apiError } from "@/lib/api-utils";

// GET salon by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    // derive slug: handle params being a Promise and fallback to parsing URL
    const resolvedParams =
      params && typeof (params as any).then === "function"
        ? await (params as any)
        : params;
    const url = new URL(request.url);
    const rawSlug =
      resolvedParams?.slug || url.pathname.split("/").filter(Boolean).pop();
    if (!rawSlug) {
      return NextResponse.json(
        { error: "Invalid salon slug" },
        { status: 400 },
      );
    }
    const normalized = rawSlug.toString().toLowerCase();
    const salon = await prisma.salon.findUnique({
      where: { slug: normalized },
      include: {
        services: {
          where: { isActive: true },
        },
        staff: {
          where: { isActive: true },
          include: {
            availability: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    return NextResponse.json({ salon });
  } catch (error) {
    return apiError("Salon GET Error", error, "Internal server error", 500);
  }
}

// PUT update salon (super admin or salon admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    // unwrap params if needed
    const resolvedParams =
      params && typeof (params as any).then === "function"
        ? await (params as any)
        : params;
    if (!resolvedParams?.slug) {
      return NextResponse.json(
        { error: "Invalid salon slug" },
        { status: 400 },
      );
    }
    const token = extractToken(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const url = new URL(request.url);
    const rawSlug =
      resolvedParams?.slug || url.pathname.split("/").filter(Boolean).pop();
    const normalized = rawSlug.toString().toLowerCase();
    const salon = await prisma.salon.findUnique({
      where: { slug: normalized },
      include: { admins: true },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    // Check authorization
    const isAdmin = salon.admins.some(
      (admin) => admin.userId === payload.userId,
    );
    if (!isSuperAdmin(payload.role) && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const updatedSalon = await prisma.salon.update({
      where: { slug: normalized },
      data: body,
    });

    return NextResponse.json({ salon: updatedSalon });
  } catch (error) {
    return apiError("Salon PUT Error", error, "Internal server error", 500);
  }
}

// DELETE (soft-delete) salon (super admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const resolvedParams =
      params && typeof (params as any).then === "function"
        ? await (params as any)
        : params;
    if (!resolvedParams?.slug) {
      return NextResponse.json(
        { error: "Invalid salon slug" },
        { status: 400 },
      );
    }

    const token = extractToken(request.headers.get("authorization"));
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !isSuperAdmin(payload.role))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const url = new URL(request.url);
    const rawSlug =
      resolvedParams?.slug || url.pathname.split("/").filter(Boolean).pop();
    const normalized = rawSlug.toString().toLowerCase();

    const salon = await prisma.salon.findUnique({
      where: { slug: normalized },
    });
    if (!salon)
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });

    // Soft-delete: mark as inactive
    const updated = await prisma.salon.update({
      where: { slug: normalized },
      data: { isActive: false },
    });

    return NextResponse.json(
      { message: "Salon deactivated", salon: updated },
      { status: 200 },
    );
  } catch (error) {
    return apiError("Salon DELETE Error", error, "Internal server error", 500);
  }
}
