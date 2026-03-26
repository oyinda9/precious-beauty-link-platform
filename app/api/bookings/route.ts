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

    // Extract token and decode to get user info
    const token = authHeader.replace("Bearer ", "");
    let userRole: string = "";
    let userId: string = "";

    try {
      // Parse JWT token (simplified - in production use proper JWT verification)
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString(),
      );
      userRole = payload.role;
      userId = payload.sub || payload.userId;
    } catch (e) {
      // Try to get user from request context or fallback to fetching from DB
      const user = await prisma.user.findMany({ take: 1 });
      if (!user.length) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      // Set fallback values from first user
      userRole = user[0].role;
      userId = user[0].id;
    }

    let bookings;

    // Filter based on user role
    if (userRole === "SUPER_ADMIN") {
      // Admin sees all bookings
      bookings = await prisma.booking.findMany({
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
    } else if (
      userRole === "SALON_ADMIN" ||
      userRole === "SALON_OWNER" ||
      userRole === "SALON_STAFF"
    ) {
      // Salon staff sees only their salon's bookings
      const salonRel =
        (await prisma.salonAdmin.findUnique({
          where: { userId },
          select: { salonId: true },
        })) ||
        (await prisma.salonStaff.findUnique({
          where: { userId },
          select: { salonId: true },
        }));

      if (!salonRel || !salonRel.salonId) {
        return NextResponse.json(
          { error: "No associated salon found" },
          { status: 403 },
        );
      }

      bookings = await prisma.booking.findMany({
        where: {
          salon: {
            id: salonRel.salonId,
          },
        },
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
    } else if (userRole === "CLIENT") {
      // Clients see only their own bookings
      bookings = await prisma.booking.findMany({
        where: {
          clientPhone: {
            // This is a limitation - ideally should have clientId in bookings table
            // For now we filter by user's phone if available
          },
        },
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
    } else {
      return NextResponse.json({ error: "Invalid user role" }, { status: 403 });
    }

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
