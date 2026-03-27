import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, extractToken } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

function getToken(request: NextRequest) {
  return (
    request.cookies.get("token")?.value ||
    request.cookies.get("auth-token")?.value ||
    request.cookies.get("authToken")?.value ||
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("auth_token")?.value ||
    extractToken(request.headers.get("authorization"))
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: bookingId } = await params;

    // Get auth token from cookies or Authorization header
    const token = getToken(request);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    // Verify booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
        salon: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, GIF, or PDF allowed" },
        { status: 400 },
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 },
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.type === "application/pdf" ? "pdf" : "png";
    const filename = `receipt-${bookingId}-${timestamp}.${fileExtension}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "receipts");

    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save file
    const buffer = await file.arrayBuffer();
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, Buffer.from(buffer));

    // Store in database
    const fileUrl = `/uploads/receipts/${filename}`;

    // Create or update payment record with proof
    if (booking.payment) {
      await prisma.payment.update({
        where: { id: booking.payment.id },
        data: {
          proofOfPayment: fileUrl,
        },
      });
    } else {
      // Create payment record if it doesn't exist
      await prisma.payment.create({
        data: {
          bookingId,
          amount: booking.totalPrice,
          proofOfPayment: fileUrl,
          paymentMethod: booking.paymentMethod,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Receipt uploaded successfully",
      fileUrl,
    });
  } catch (error: any) {
    console.error("Receipt upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload receipt" },
      { status: 500 },
    );
  }
}
