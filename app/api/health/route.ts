import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-utils";

export async function GET() {
  try {
    // Simple DB check
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    return apiError("Healthcheck Error", err, "Database connectivity error", 500);
  }
}
