import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { apiError } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    await clearAuthCookie();

    return NextResponse.json({ message: "Logout successful" }, { status: 200 });
  } catch (error) {
    return apiError("Logout Error", error, "Logout failed", 500);
  }
}
