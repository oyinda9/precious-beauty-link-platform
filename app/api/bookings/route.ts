import { NextRequest, NextResponse } from "next/server";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      salonId,
      serviceIds,
      staffId,
      bookingDate,
      startTime,
      notes,
      clientPhone,
      // Ignore any client-provided status fields
      status: _ignoredStatus,
      paymentStatus: _ignoredPaymentStatus,
    } = body;

    if (!salonId) {
      return NextResponse.json(
        { error: "Salon ID is required" },
        { status: 400 },
      );
    }

    if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return NextResponse.json(
        { error: "At least one service must be selected" },
        { status: 400 },
      );
    }

    if (!bookingDate) {
      return NextResponse.json(
        { error: "Booking date is required" },
        { status: 400 },
      );
    }

    if (!startTime) {
      return NextResponse.json(
        { error: "Start time is required" },
        { status: 400 },
      );
    }

    if (!clientPhone || clientPhone.trim() === "") {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 },
      );
    }

    const salonExists = await prisma.salon.findUnique({
      where: { id: salonId },
    });

    if (!salonExists) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        salonId,
      },
    });

    if (services.length !== serviceIds.length) {
      return NextResponse.json(
        { error: "One or more services not found" },
        { status: 404 },
      );
    }

    const totalPrice = services.reduce((sum, svc) => sum + svc.price, 0);
    const totalDuration = services.reduce((sum, svc) => sum + svc.duration, 0);

    const booking = await prisma.booking.create({
      data: {
        salon: { connect: { id: salonId } },
        service: { connect: { id: serviceIds[0] } },
        bookingDate: new Date(bookingDate),
        startTime,
        endTime: calculateEndTime(startTime, totalDuration),
        clientPhone: clientPhone.trim(),
        notes: notes || null,

        // Force initial states
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,

        totalPrice,
        ...(staffId && { staffId }),
      },
      include: {
        service: {
          select: { id: true, name: true, price: true, duration: true },
        },
        salon: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            city: true,
          },
        },
      },
    });

    return NextResponse.json(
      { booking, message: "Booking created successfully" },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Booking error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to create booking",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      include: {
        service: true,
        salon: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            city: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch bookings",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

function calculateEndTime(startTime: string, duration: number): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + duration;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;

  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
}
