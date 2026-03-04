import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { UserRole, BookingStatus } from "@prisma/client";

// GET - Fetch bookings with filters
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const salonId = searchParams.get("salonId");

    const where: any = {};

    // Filter based on user role
    if (currentUser.role === UserRole.CLIENT) {
      where.clientId = currentUser.userId;
    } else if (currentUser.role === UserRole.SALON_OWNER) {
      where.salon = {
        adminId: currentUser.userId,
      };
    }

    if (status) {
      where.status = status;
    }

    if (salonId) {
      where.salonId = salonId;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        client: {
          select: {
            fullName: true,
            email: true,
            phone: true,
          },
        },
        service: true,
        salon: true,
      },
      orderBy: { bookingDate: "desc" },
    });

    return NextResponse.json(
      { bookings },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Bookings GET Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (currentUser.role !== UserRole.CLIENT) {
      return NextResponse.json(
        { error: "Only clients can create bookings" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { salonId, serviceId, bookingDate, startTime, notes } = body;

    if (!salonId || !serviceId || !bookingDate || !startTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Calculate end time
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const endDate = new Date(bookingDate);
    endDate.setHours(startHour + Math.floor((startMinute + service.duration) / 60));
    endDate.setMinutes((startMinute + service.duration) % 60);

    const endTime = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;

    // Check for conflicts
    const existingBooking = await prisma.booking.findFirst({
      where: {
        salonId,
        bookingDate: new Date(bookingDate),
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
        ],
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "Time slot already booked" },
        { status: 409 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        clientId: currentUser.userId,
        salonId,
        serviceId,
        bookingDate: new Date(bookingDate),
        startTime,
        endTime,
        totalPrice: service.price,
        notes: notes || null,
      },
      include: {
        client: true,
        service: true,
        salon: true,
      },
    });

    return NextResponse.json(
      {
        message: "Booking created successfully",
        booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Bookings POST Error]", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
