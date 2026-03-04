import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    console.error("[Check Slug Error]", error);
    return NextResponse.json(
      { error: "Failed to check slug availability" },
      { status: 500 }
    );
  }
}
