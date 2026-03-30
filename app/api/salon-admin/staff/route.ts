import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, extractToken, isSalonAdmin } from "@/lib/auth";
import { canAddStaff } from "@/lib/subscription-enforcement";

/**
 * GET staff members for a salon
 */
export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !isSalonAdmin(payload.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get salon admin record to find salon ID
    const admin = await prisma.salonAdmin.findUnique({
      where: { userId: payload.id },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Salon admin not found" },
        { status: 404 },
      );
    }

    const staff = await prisma.salonStaff.findMany({
      where: { salonId: admin.salonId },
      include: { user: true, availability: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ staff });
  } catch (error) {
    console.error("GET Staff Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST - Add a new staff member (checks subscription limits)
 */
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !isSalonAdmin(payload.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, specialties = [], hourlyRate } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Get salon admin record to find salon ID
    const admin = await prisma.salonAdmin.findUnique({
      where: { userId: payload.id },
      include: { salon: true },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Salon admin not found" },
        { status: 404 },
      );
    }

    // Check subscription plan limits BEFORE creating
    const canAdd = await canAddStaff(admin.salonId);
    if (!canAdd.allowed) {
      console.warn(
        `[API] Staff creation blocked for salon ${admin.salonId}: ${canAdd.reason}`,
      );
      return NextResponse.json(
        {
          error: canAdd.reason || "Cannot add staff - subscription limit reached",
        },
        { status: 403 },
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is already staff at this salon
    const existingStaff = await prisma.salonStaff.findUnique({
      where: { userId },
    });

    if (existingStaff && existingStaff.salonId === admin.salonId) {
      return NextResponse.json(
        { error: "User is already a staff member at this salon" },
        { status: 400 },
      );
    }

    // Create staff record
    const staff = await prisma.salonStaff.create({
      data: {
        userId,
        salonId: admin.salonId,
        specialties,
        hourlyRate: hourlyRate || null,
      },
      include: { user: true },
    });

    return NextResponse.json(
      { message: "Staff member added successfully", staff },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("POST Staff Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
