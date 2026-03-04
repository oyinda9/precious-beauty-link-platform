import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, verifyToken } from "./auth";
import { UserRole } from "@prisma/client";

export async function withAuth(request: NextRequest) {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized - No token provided" },
      { status: 401 }
    );
  }

  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      { error: "Unauthorized - Invalid token" },
      { status: 401 }
    );
  }

  return { user: payload };
}

export async function withRole(
  request: NextRequest,
  allowedRoles: UserRole[]
) {
  const authResult = await withAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  if (!allowedRoles.includes(authResult.user.role)) {
    return NextResponse.json(
      { error: "Forbidden - Insufficient permissions" },
      { status: 403 }
    );
  }

  return authResult;
}

export function createAuthMiddleware(allowedRoles?: UserRole[]) {
  return async (request: NextRequest) => {
    if (allowedRoles) {
      return await withRole(request, allowedRoles);
    }
    return await withAuth(request);
  };
}
