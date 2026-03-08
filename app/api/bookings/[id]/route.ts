import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { UserRole, BookingStatus } from "@prisma/client";
import { apiError } from "@/lib/api-utils";
import { sendSMS, sendWhatsApp } from "@/lib/sms";
import { sendEmail } from "@/lib/email";

// GET - Fetch a specific booking
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 },
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        client: true,
        service: true,
        salon: true,
        review: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check authorization
    if (
      currentUser.role === UserRole.CLIENT &&
      booking.clientId !== currentUser.userId
    ) {
      return NextResponse.json(
        { error: "Forbidden - You can only view your own bookings" },
        { status: 403 },
      );
    }

    // For salon admins/owners, check if they are admins of this salon
    if (
      currentUser.role === UserRole.SALON_ADMIN ||
      currentUser.role === UserRole.SALON_STAFF
    ) {
      const salonAdmin = await prisma.salonAdmin.findFirst({
        where: {
          salonId: booking.salonId,
          userId: currentUser.userId,
        },
      });

      if (!salonAdmin) {
        return NextResponse.json(
          { error: "Forbidden - You are not an admin of this salon" },
          { status: 403 },
        );
      }
    }

    return NextResponse.json({ booking }, { status: 200 });
  } catch (error) {
    return apiError("Booking GET Error", error, "Failed to fetch booking", 500);
  }
}

// PUT - Update booking status or details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 },
      );
    }

    const body = await request.json();

    console.log("Updating booking:", id, "with data:", body);

    // First, get the booking to check authorization
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        salon: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check authorization based on role
    if (currentUser.role === UserRole.CLIENT) {
      // Clients can only cancel their own bookings
      if (booking.clientId !== currentUser.userId) {
        return NextResponse.json(
          { error: "Forbidden - You can only update your own bookings" },
          { status: 403 },
        );
      }

      // Clients can only cancel bookings, not change to other statuses
      if (body.status !== BookingStatus.CANCELLED) {
        return NextResponse.json(
          { error: "Clients can only cancel bookings" },
          { status: 403 },
        );
      }

      // Check if booking can be cancelled
      const cancellableStatuses: string[] = [
        BookingStatus.PENDING,
        BookingStatus.CONFIRMED,
      ];
      if (!cancellableStatuses.includes(booking.status)) {
        return NextResponse.json(
          { error: "Cannot cancel booking with this status" },
          { status: 400 },
        );
      }
    }

    // For salon admins and owners
    if (
      currentUser.role === UserRole.SALON_ADMIN ||
      currentUser.role === UserRole.SALON_STAFF
    ) {
      // Check if user is an admin of this salon
      const salonAdmin = await prisma.salonAdmin.findFirst({
        where: {
          salonId: booking.salonId,
          userId: currentUser.userId,
        },
      });

      if (!salonAdmin) {
        return NextResponse.json(
          { error: "Forbidden - You are not an admin of this salon" },
          { status: 403 },
        );
      }

      // Validate status transitions for salon admins
      if (body.status) {
        type StatusTransitionMap = {
          [key: string]: string[];
        };

        const validTransitions: StatusTransitionMap = {
          [BookingStatus.PENDING]: [
            BookingStatus.CONFIRMED,
            BookingStatus.CANCELLED,
          ],
          [BookingStatus.CONFIRMED]: [
            BookingStatus.COMPLETED,
            BookingStatus.CANCELLED,
          ],
          [BookingStatus.COMPLETED]: [],
          [BookingStatus.CANCELLED]: [],
        };

        const currentStatus = booking.status;
        const targetStatus = body.status;

        if (!validTransitions[currentStatus]?.includes(targetStatus)) {
          return NextResponse.json(
            {
              error: `Cannot transition from ${currentStatus} to ${targetStatus}`,
            },
            { status: 400 },
          );
        }
      }
    }

    // For salon staff - they might have limited permissions
    if (currentUser.role === UserRole.SALON_STAFF) {
      // Check if user is staff of this salon
      const salonStaff = await prisma.salonStaff.findFirst({
        where: {
          salonId: booking.salonId,
          userId: currentUser.userId,
        },
      });

      if (!salonStaff) {
        return NextResponse.json(
          { error: "Forbidden - You are not staff of this salon" },
          { status: 403 },
        );
      }

      // Staff might only be able to update certain statuses
      if (body.status) {
        // Staff can only mark as completed or confirmed, not cancel
        const allowedStaffTransitions: string[] = [
          BookingStatus.CONFIRMED,
          BookingStatus.COMPLETED,
        ];
        if (!allowedStaffTransitions.includes(body.status)) {
          return NextResponse.json(
            { error: "Staff can only confirm or complete bookings" },
            { status: 403 },
          );
        }
      }
    }

    // Prepare update data - only update allowed fields
    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;

    // If no valid fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        service: true,
        salon: true,
      },
    });

    // Send notifications if booking is confirmed
    if (body.status === BookingStatus.CONFIRMED) {
      const client = updatedBooking.client;
      const salon = updatedBooking.salon;
      const address = `${salon.name}, ${salon.address}, ${salon.city}`;
      // Prefer user phone, fallback to guest phone
      const clientNumber = client?.phone || updatedBooking.clientPhone;
      const clientName = client?.fullName || "Guest";
      const clientEmail = client?.email;
      const message = `Hi ${clientName}, your booking at ${salon.name} has been CONFIRMED!\n\nAddress: ${address}\n\nWould you like to pay online or in person?`;
      try {
        // Send WhatsApp/SMS if phone available
        if (clientNumber && salon.phone) {
          await sendWhatsApp({ to: clientNumber, body: message });
        }
        // Send email if email available
        if (clientEmail) {
          const businessWhatsApp = process.env.BUSINESS_WHATSAPP_NUMBER || "2348012345678";
          const waMessage = encodeURIComponent(message);
          const waLink = `https://wa.me/${businessWhatsApp}?text=${waMessage}`;
          await sendEmail({
            to: clientEmail,
            subject: `Booking Confirmed at ${salon.name}`,
            text: `${message}\n\nContact us on WhatsApp: ${waLink}`,
            html: `<p>Hi ${clientName},</p><p>Your booking at <b>${salon.name}</b> has been <b>CONFIRMED</b>!</p><p><b>Address:</b> ${address}</p><p>Would you like to pay online or in person?</p><p><a href="${waLink}" style="color:#25D366;font-weight:bold;">Chat with us on WhatsApp</a></p>`,
          });
        }
      } catch (notifyErr) {
        console.error("Notification error:", notifyErr);
      }
    }

    return NextResponse.json(
      {
        message: "Booking updated successfully",
        booking: updatedBooking,
      },
      { status: 200 },
    );
  } catch (error) {
    return apiError(
      "Booking PUT Error",
      error,
      "Failed to update booking",
      500,
    );
  }
}

// DELETE - Cancel a booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 },
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        salon: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check authorization
    if (currentUser.role === UserRole.CLIENT) {
      if (booking.clientId !== currentUser.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // For salon admins and owners
    if (
      currentUser.role === UserRole.SALON_ADMIN ||
      currentUser.role === UserRole.SALON_STAFF
    ) {
      const salonAdmin = await prisma.salonAdmin.findFirst({
        where: {
          salonId: booking.salonId,
          userId: currentUser.userId,
        },
      });

      if (!salonAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // For salon staff
    if (currentUser.role === UserRole.SALON_STAFF) {
      const salonStaff = await prisma.salonStaff.findFirst({
        where: {
          salonId: booking.salonId,
          userId: currentUser.userId,
        },
      });

      if (!salonStaff) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Only allow cancellation of pending/confirmed bookings
    const cancellableStatuses: string[] = [
      BookingStatus.PENDING,
      BookingStatus.CONFIRMED,
    ];
    if (!cancellableStatuses.includes(booking.status)) {
      return NextResponse.json(
        { error: "Cannot cancel booking with this status" },
        { status: 400 },
      );
    }

    const cancelledBooking = await prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
    });

    return NextResponse.json(
      { message: "Booking cancelled successfully", booking: cancelledBooking },
      { status: 200 },
    );
  } catch (error) {
    return apiError(
      "Booking DELETE Error",
      error,
      "Failed to cancel booking",
      500,
    );
  }
}
