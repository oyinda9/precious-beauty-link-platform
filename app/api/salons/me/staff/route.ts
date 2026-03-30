import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { apiError } from "@/lib/api-utils";
import { canAddStaff } from "@/lib/subscription-enforcement";

// GET - Fetch all staff members for current user's salon
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      console.error("[GET /api/salons/me/staff] No user authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (currentUser.role !== UserRole.SALON_ADMIN) {
      console.error(
        "[GET /api/salons/me/staff] User role is",
        currentUser.role,
        "expected SALON_ADMIN",
      );
      return NextResponse.json(
        { error: "Only salon admins can view staff" },
        { status: 403 },
      );
    }

    // Get salon admin's salon
    const salonAdmin = await prisma.salonAdmin.findFirst({
      where: {
        userId: currentUser.id,
      },
    });

    if (!salonAdmin) {
      console.error(
        "[GET /api/salons/me/staff] No SalonAdmin record found for user",
        currentUser.id,
        "- User role:",
        currentUser.role,
      );
      return NextResponse.json(
        {
          error:
            "You haven't set up a salon yet. Please complete salon setup through the dashboard.",
          debug: {
            userId: currentUser.id,
            userRole: currentUser.role,
            hasSalonAdminRecord: false,
          },
        },
        { status: 404 },
      );
    }

    // Fetch all staff for this salon
    const staff = await prisma.salonStaff.findMany({
      where: {
        salonId: salonAdmin.salonId,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ staff });
  } catch (error) {
    console.error("[GET /api/salons/me/staff] Error:", error);
    return apiError("Get Staff Error", error, "Failed to fetch staff", 500);
  }
}

// POST - Add new staff member
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      console.error("[POST /api/salons/me/staff] No user authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[POST /api/salons/me/staff] Current user:", {
      id: currentUser.id,
      role: currentUser.role,
    });

    if (currentUser.role !== UserRole.SALON_ADMIN) {
      console.error(
        "[POST /api/salons/me/staff] User role is",
        currentUser.role,
        "expected SALON_ADMIN",
      );
      return NextResponse.json(
        { error: "Only salon admins can add staff" },
        { status: 403 },
      );
    }

    // Get salon admin's salon
    const salonAdmin = await prisma.salonAdmin.findFirst({
      where: {
        userId: currentUser.id,
      },
    });

    if (!salonAdmin) {
      console.error(
        "[POST /api/salons/me/staff] No SalonAdmin record found for user",
        currentUser.id,
        "- User role:",
        currentUser.role,
        "- Checking all SalonAdmin records in DB...",
      );

      // Debug: List all salon admins
      const allAdmins = await prisma.salonAdmin.findMany({
        take: 10,
      });
      console.error(
        "[POST /api/salons/me/staff] All SalonAdmin records:",
        allAdmins,
      );

      return NextResponse.json(
        {
          error:
            "You haven't set up a salon yet. Please complete salon setup through the dashboard.",
          debug: {
            userId: currentUser.id,
            userRole: currentUser.role,
            hasSalonAdminRecord: false,
          },
        },
        { status: 404 },
      );
    }

    console.log("[POST /api/salons/me/staff] Salon admin found:", {
      adminId: salonAdmin.id,
      salonId: salonAdmin.salonId,
    });

    // Check subscription plan limits BEFORE creating
    const canAdd = await canAddStaff(salonAdmin.salonId);
    if (!canAdd.allowed) {
      console.warn(
        `[API] Staff creation blocked for salon ${salonAdmin.salonId}: ${canAdd.reason}`,
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

    console.log("[POST /api/salons/me/staff] Request body:", {
      fullName,
      email,
      phone,
      specialties,
      hourlyRate,
    });

    // Validation
    if (!fullName || !email || !password) {
      console.error("[POST /api/salons/me/staff] Missing required fields");
      return NextResponse.json(
        { error: "Full name, email, and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      console.error("[POST /api/salons/me/staff] Password too short");
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error("[POST /api/salons/me/staff] Email already exists:", email);
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Check if staff member already exists for this email
    const existingStaff = await prisma.salonStaff.findFirst({
      where: {
        user: {
          email,
        },
      },
    });

    if (existingStaff) {
      console.error("[POST /api/salons/me/staff] Staff already exists:", email);
      return NextResponse.json(
        { error: "Staff member with this email already exists" },
        { status: 409 },
      );
    }

    // Create user
    console.log("[POST /api/salons/me/staff] Creating user for:", email);
    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        phone: phone || null,
        password: hashedPassword,
        role: UserRole.SALON_STAFF,
      },
    });

    console.log("[POST /api/salons/me/staff] User created:", user.id);

    // Create staff record
    console.log(
      "[POST /api/salons/me/staff] Creating staff record for salon:",
      salonAdmin.salonId,
    );
    const staff = await prisma.salonStaff.create({
      data: {
        userId: user.id,
        salonId: salonAdmin.salonId,
        specialties: specialties || [],
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
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

    console.log(
      "[POST /api/salons/me/staff] Staff created successfully:",
      staff.id,
    );

    return NextResponse.json(
      {
        message: "Staff member added successfully",
        staff,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/salons/me/staff] Catch block error:", error);
    return apiError("Add Staff Error", error, "Failed to add staff", 500);
  }
}
