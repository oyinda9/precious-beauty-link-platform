import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractToken, isSuperAdmin } from "@/lib/auth";

/**
 * GET /api/admin/verify
 * Verify if current user is a super admin (for debugging permissions)
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        {
          authorized: false,
          error: "No token provided",
          token: null,
          payload: null,
        },
        { status: 401 },
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        {
          authorized: false,
          error: "Invalid or expired token",
          token: token.substring(0, 20) + "...",
          payload: null,
        },
        { status: 401 },
      );
    }

    const isSuperAdminUser = isSuperAdmin(payload.role);

    return NextResponse.json(
      {
        authorized: true,
        isSuperAdmin: isSuperAdminUser,
        user: {
          id: payload.id,
          email: payload.email,
          fullName: payload.fullName,
          role: payload.role,
        },
        message: isSuperAdminUser
          ? "✓ You are a super admin with full access"
          : `✗ You are not a super admin (role: ${payload.role})`,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        authorized: false,
        error: error.message || "Failed to verify admin status",
      },
      { status: 500 },
    );
  }
}
