import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { UserRole, BookingStatus } from "@prisma/client";

// GET - Fetch bookings with filters
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const salonId = searchParams.get("salonId");

    const where: any = {};

    // Filter based on user role
    if (currentUser.role === UserRole.CLIENT) {
      where.clientId = currentUser.userId;
    } else if (currentUser.role === UserRole.SALON_ADMIN) {
      // Get salon IDs for this admin
      const salonAdmins = await prisma.salonAdmin.findMany({
        where: { userId: currentUser.userId },
        select: { salonId: true },
      });
      const salonIds = salonAdmins.map((sa) => sa.salonId);
      where.salonId = { in: salonIds };
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

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error("[Bookings GET Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    // Allow anonymous bookings (no auth required)
    // If user is logged in and is a client, use their ID; otherwise, booking is anonymous
    let currentUser = null;
    try {
      currentUser = await getCurrentUser();
    } catch {}

    const body = await request.json();
    const {
      salonId,
      serviceId,
      bookingDate,
      startTime,
      notes,
      clientName,
      clientEmail,
      clientPhone,
    } = body;

    if (!salonId || !serviceId || !bookingDate || !startTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Fetch service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Calculate end time
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const endDate = new Date(bookingDate);
    endDate.setHours(
      startHour + Math.floor((startMinute + service.duration) / 60),
    );
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
        { status: 409 },
      );
    }

    // If user is logged in and is a client, use their ID; otherwise, create a guest booking (clientId: undefined)
    const guestInfo =
      clientName || clientEmail || clientPhone
        ? `Guest: ${clientName || ""} | Email: ${clientEmail || ""} | Phone: ${clientPhone || ""}`
        : null;

    const bookingData: any = {
      salonId,
      serviceId,
      bookingDate: new Date(bookingDate),
      startTime,
      endTime,
      totalPrice: service.price,
      notes: notes ? `${notes}\n${guestInfo}` : guestInfo,
    };

    if (currentUser && currentUser.role === UserRole.CLIENT) {
      bookingData.clientId = currentUser.userId;
    }

    const booking = await prisma.booking.create({
      data: bookingData,
      include: {
        client: true,
        service: true,
        salon: true,
      },
    });

    // Format totalPrice as Naira in the response
    const bookingWithNaira = {
      ...booking,
      totalPriceNaira: `₦${Number(booking.totalPrice).toLocaleString()}`,
    };
    return NextResponse.json(
      {
        message: "Booking created successfully",
        booking: bookingWithNaira,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[Bookings POST Error]", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create booking";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
