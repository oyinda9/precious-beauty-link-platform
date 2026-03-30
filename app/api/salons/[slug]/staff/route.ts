import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyToken,
  extractToken,
  isSalonAdmin,
  hashPassword,
} from "@/lib/auth";
import { apiError } from "@/lib/api-utils";
import { UserRole } from "@prisma/client";
import { canAddStaff } from "@/lib/subscription-enforcement";

// GET staff for a salon
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = rawSlug?.toString().toLowerCase();

    const salon = await prisma.salon.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    const staff = await prisma.salonStaff.findMany({
      where: {
        salonId: salon.id,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        availability: true,
      },
      orderBy: { user: { fullName: "asc" } },
    });

    return NextResponse.json({ staff });
  } catch (error) {
    return apiError("Staff GET Error", error, "Internal server error", 500);
  }
}

// POST add staff (salon admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const token = extractToken(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !isSalonAdmin(payload.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const salon = await prisma.salon.findUnique({
      where: { slug },
      include: { admins: true },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    // Verify authorization
    const isAuthorized = salon.admins.some(
      (admin) => admin.userId === payload.id,
    );
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check subscription plan limits BEFORE creating
    const canAdd = await canAddStaff(salon.id);
    if (!canAdd.allowed) {
      console.warn(
        `[API] Staff creation blocked for salon ${salon.id}: ${canAdd.reason}`,
      );
      return NextResponse.json(
        {
          error:
            canAdd.reason || "Cannot add staff - subscription limit reached",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { fullName, email, phone, password, specialties, hourlyRate } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phone: phone || null,
        role: UserRole.SALON_STAFF,
      },
    });

    // Create staff record
    const staffMember = await prisma.salonStaff.create({
      data: {
        userId: user.id,
        salonId: salon.id,
        specialties: specialties || [],
        hourlyRate: hourlyRate || null,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Staff member added successfully", staff: staffMember },
      { status: 201 },
    );
  } catch (error) {
    return apiError("Staff POST Error", error, "Internal server error", 500);
  }
}
