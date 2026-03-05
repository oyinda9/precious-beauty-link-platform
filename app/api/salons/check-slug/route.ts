import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.salon.findUnique({
      where: { slug: slug.toLowerCase() },
    });

    return NextResponse.json(
      {
        available: !existing,
        slug: slug.toLowerCase(),
      },
      { status: 200 }
    );
  } catch (error) {
    return apiError("Check Slug Error", error, "Failed to check slug availability", 500);
  }
}
