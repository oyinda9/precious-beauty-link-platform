import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { apiError } from "@/lib/api-utils";

const PLAN_MAP = {
  free: "TRIAL",
  basic: "STARTER",
  standard: "PROFESSIONAL",
  premium: "ENTERPRISE",
} as const;

type FrontendPlan = keyof typeof PLAN_MAP;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      fullName,
      phone,
      role = UserRole.CLIENT,
      salonName,
      salonSlug,
      salonAddress,
      salonCity,
      salonPhone,
      plan = "free",
    } = body;

    // Validate input
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate salon owner fields if role is SALON_ADMIN
    if (role === UserRole.SALON_ADMIN) {
      if (!salonName || !salonSlug || !salonAddress || !salonCity) {
        return NextResponse.json(
          { error: "Salon details are required for salon owners" },
          { status: 400 },
        );
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    // Check if slug is available (if salon owner)
    if (role === UserRole.SALON_ADMIN) {
      const existingSalon = await prisma.salon.findUnique({
        where: { slug: salonSlug.toLowerCase() },
      });

      if (existingSalon) {
        return NextResponse.json(
          { error: "Salon slug is already taken" },
          { status: 409 },
        );
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Validate role
    const validRoles = [
      UserRole.CLIENT,
      UserRole.SUPER_ADMIN,
      UserRole.SALON_ADMIN,
    ];
    const userRole = validRoles.includes(role) ? role : UserRole.CLIENT;

    // Validate plan only for salon admin
    const normalizedPlan = String(plan).toLowerCase() as FrontendPlan;
    if (userRole === UserRole.SALON_ADMIN && !(normalizedPlan in PLAN_MAP)) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 },
      );
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phone: phone || null,
        role: userRole,
      },
    });

    let salon = null;

    // Create role-specific records
    if (role === UserRole.SALON_ADMIN) {
      // Create salon
      salon = await prisma.salon.create({
        data: {
          name: salonName,
          slug: salonSlug.toLowerCase(),
          address: salonAddress,
          city: salonCity,
          phone: salonPhone || phone || "",
          email: email,
          description: "",
          rating: 0,
          reviewCount: 0,
        },
      });

      // Create salon admin link only if not exists
      const existingSalonAdmin = await prisma.salonAdmin.findFirst({
        where: {
          userId: user.id,
          salonId: salon.id,
        },
      });
      if (!existingSalonAdmin) {
        await prisma.salonAdmin.create({
          data: {
            userId: user.id,
            salonId: salon.id,
          },
        });
      }

      // Map frontend plan key to SubscriptionPlan enum
      const planEnum = PLAN_MAP[normalizedPlan];

      // Create subscription record for the salon
      await prisma.subscription.create({
        data: {
          salonId: salon.id,
          plan: planEnum,
          status: planEnum === "TRIAL" ? "TRIAL" : "ACTIVE",
        },
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });

    // Set cookie
    await setAuthCookie(token);

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
        salon: salon ? { id: salon.id, slug: salon.slug } : null,
        token,
      },
      { status: 201 },
    );
  } catch (error) {
    return apiError("Register Error", error, "Registration failed", 500);
  }
}
