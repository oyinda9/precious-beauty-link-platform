/**
 * Authorization and Authentication Utilities
 *
 * Centralized functions for checking user roles, salon ownership, and access control
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export interface AuthContext {
  userId: string;
  userRole: string;
  salonId?: string;
  email?: string;
  token?: string;
}

/**
 * Extract and verify user info from Bearer token
 */
export async function verifyToken(
  authHeader: string | null,
): Promise<AuthContext | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = authHeader.replace("Bearer ", "");

    // Parse JWT token (in production, use proper JWT verification with secret)
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());

    return {
      userId: payload.id || payload.sub || payload.userId,
      userRole: payload.role,
      email: payload.email,
      token,
    };
  } catch (e) {
    console.error("Token verification error:", e);
    return null;
  }
}

/**
 * Get user's salon ID via SalonAdmin or SalonStaff relationship
 */
export async function getUserSalon(userId: string): Promise<string | null> {
  try {
    // Check if user is a salon admin
    const salonAdmin = await prisma.salonAdmin.findUnique({
      where: { userId },
      select: { salonId: true },
    });

    if (salonAdmin) {
      return salonAdmin.salonId;
    }

    // Check if user is salon staff
    const salonStaff = await prisma.salonStaff.findUnique({
      where: { userId },
      select: { salonId: true },
    });

    if (salonStaff) {
      return salonStaff.salonId;
    }

    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Check if user is admin
 */
export function isAdmin(authContext: AuthContext): boolean {
  return authContext.userRole === "SUPER_ADMIN";
}

/**
 * Check if user is salon owner
 */
export function isSalonOwner(authContext: AuthContext): boolean {
  return (
    authContext.userRole === "SALON_ADMIN" ||
    authContext.userRole === "SALON_OWNER"
  );
}

/**
 * Check if user is salon staff
 */
export function isSalonStaff(authContext: AuthContext): boolean {
  return authContext.userRole === "SALON_STAFF";
}

/**
 * Check if user is client
 */
export function isClient(authContext: AuthContext): boolean {
  return authContext.userRole === "CLIENT";
}

/**
 * Verify user has access to specific salon
 */
export async function verifyUserSalonAccess(
  userId: string,
  salonId: string,
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    // Admins have access to all salons
    if (user?.role === "SUPER_ADMIN") {
      return true;
    }

    // Check if user is admin of this salon
    const salonAdmin = await prisma.salonAdmin.findUnique({
      where: { userId },
      select: { salonId: true },
    });

    if (salonAdmin && salonAdmin.salonId === salonId) {
      return true;
    }

    // Check if user is staff of this salon
    const salonStaff = await prisma.salonStaff.findUnique({
      where: { userId },
      select: { salonId: true },
    });

    if (salonStaff && salonStaff.salonId === salonId) {
      return true;
    }

    return false;
  } catch (e) {
    return false;
  }
}

/**
 * Require authentication middleware
 */
export async function requireAuth(
  request: NextRequest,
): Promise<
  { auth: AuthContext; response: null } | { auth: null; response: NextResponse }
> {
  const authHeader = request.headers.get("authorization");
  const auth = await verifyToken(authHeader);

  if (!auth) {
    return {
      auth: null,
      response: NextResponse.json(
        { error: "Unauthorized: Invalid or missing token" },
        { status: 401 },
      ),
    };
  }

  return { auth, response: null };
}

/**
 * Require specific role
 */
export function requireRole(
  auth: AuthContext,
  ...allowedRoles: string[]
): NextResponse | null {
  if (!allowedRoles.includes(auth.userRole)) {
    return NextResponse.json(
      { error: `Forbidden: Requires one of ${allowedRoles.join(", ")}` },
      { status: 403 },
    );
  }
  return null;
}

/**
 * Require salon ownership
 */
export async function requireSalonOwnership(
  userId: string,
  salonId: string,
): Promise<NextResponse | null> {
  const hasAccess = await verifyUserSalonAccess(userId, salonId);
  if (!hasAccess) {
    return NextResponse.json(
      { error: "Forbidden: No access to this salon" },
      { status: 403 },
    );
  }
  return null;
}

/**
 * API Error helper
 */
export function apiError(message: string, status: number = 400, details?: any) {
  return NextResponse.json(
    {
      error: message,
      ...(process.env.NODE_ENV === "development" && details && { details }),
    },
    { status },
  );
}

/**
 * API Success helper
 */
export function apiSuccess(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}
