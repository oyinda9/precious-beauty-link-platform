import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { apiError } from "@/lib/api-utils";

// GET - Fetch reviews for a salon
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get("salonId");

    if (!salonId) {
      return NextResponse.json(
        { error: "salonId is required" },
        { status: 400 },
      );
    }

    const reviews = await prisma.review.findMany({
      where: { salonId },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json(
      {
        reviews,
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length,
      },
      { status: 200 },
    );
  } catch (error) {
    return apiError("Reviews GET Error", error, "Failed to fetch reviews", 500);
  }
}

// POST - Create a new review
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== UserRole.CLIENT) {
      return NextResponse.json(
        { error: "Only clients can post reviews" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { salonId, bookingId, rating, comment } = body;

    if (!salonId || !bookingId || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    // Check if booking exists and belongs to the user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.clientId !== currentUser.userId) {
      return NextResponse.json(
        { error: "Booking not found or unauthorized" },
        { status: 404 },
      );
    }

    // Check if review already exists for this booking
    const existingReview = await prisma.review.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Review already exists for this booking" },
        { status: 409 },
      );
    }

    const review = await prisma.review.create({
      data: {
        salonId,
        clientId: currentUser.userId,
        bookingId,
        rating,
        comment: comment || null,
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Update salon rating
    const allReviews = await prisma.review.findMany({
      where: { salonId },
    });

    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.salon.update({
      where: { id: salonId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json(
      {
        message: "Review created successfully",
        review,
      },
      { status: 201 },
    );
  } catch (error) {
    return apiError(
      "Reviews POST Error",
      error,
      "Failed to create review",
      500,
    );
  }
}
