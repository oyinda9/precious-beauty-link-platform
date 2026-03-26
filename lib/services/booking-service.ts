import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import {
  checkBookingQuota,
  incrementBookingUsage,
} from "./subscription-service";
import { createPayment } from "./payment-service";

/**
 * Create a new booking with payment method selection
 */
export async function createBooking(data: {
  salonId: string;
  serviceId: string;
  staffId?: string;
  clientId?: string;
  clientPhone?: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  paymentMethod: "BANK_TRANSFER" | "PAY_AT_SALON";
  notes?: string;
}) {
  // Check booking quota
  const hasQuota = await checkBookingQuota(data.salonId);
  if (!hasQuota) {
    throw new Error(
      "Booking limit reached for this month. Please upgrade your plan.",
    );
  }

  // Get service price
  const service = await prisma.service.findUnique({
    where: { id: data.serviceId },
  });

  if (!service) {
    throw new Error("Service not found");
  }

  // Create booking
  let bookingStatus: BookingStatus = "PENDING";
  if (data.paymentMethod === "BANK_TRANSFER") {
    bookingStatus = "AWAITING_PAYMENT";
  } else {
    bookingStatus = "PENDING";
  }

  const booking = await prisma.booking.create({
    data: {
      salonId: data.salonId,
      serviceId: data.serviceId,
      staffId: data.staffId,
      clientId: data.clientId,
      clientPhone: data.clientPhone,
      bookingDate: data.bookingDate,
      startTime: data.startTime,
      endTime: data.endTime,
      status: bookingStatus,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      totalPrice: service.price,
    },
    include: {
      service: true,
      salon: true,
      client: true,
    },
  });

  // Create payment record
  await createPayment(
    booking.id,
    service.price,
    data.paymentMethod as "BANK_TRANSFER" | "PAY_AT_SALON",
  );

  // Increment booking usage
  await incrementBookingUsage(data.salonId);

  return booking;
}

/**
 * Get booking details
 */
export async function getBooking(bookingId: string) {
  return await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      salon: true,
      client: true,
      staff: true,
      payment: true,
    },
  });
}

/**
 * Get bookings for a salon
 */
export async function getBookingsForSalon(
  salonId: string,
  filter?: {
    status?: BookingStatus;
    startDate?: Date;
    endDate?: Date;
    clientId?: string;
  },
) {
  return await prisma.booking.findMany({
    where: {
      salonId,
      ...(filter?.status && { status: filter.status }),
      ...(filter?.startDate &&
        filter?.endDate && {
          bookingDate: {
            gte: filter.startDate,
            lte: filter.endDate,
          },
        }),
      ...(filter?.clientId && { clientId: filter.clientId }),
    },
    include: {
      service: true,
      client: true,
      staff: true,
      payment: true,
    },
    orderBy: { bookingDate: "asc" },
  });
}

/**
 * Get bookings for a client
 */
export async function getBookingsForClient(clientId: string) {
  return await prisma.booking.findMany({
    where: { clientId },
    include: {
      service: true,
      salon: true,
      staff: true,
      payment: true,
    },
    orderBy: { bookingDate: "desc" },
  });
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatus,
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Validate status transition
  const validTransitions: Record<BookingStatus, BookingStatus[]> = {
    PENDING: ["PAID", "CANCELLED"],
    AWAITING_PAYMENT: ["PAYMENT_SUBMITTED", "CANCELLED"],
    PAYMENT_SUBMITTED: ["PAID", "CANCELLED"],
    PAID: ["COMPLETED", "CANCELLED"],
    COMPLETED: [],
    CANCELLED: [],
  };

  if (!validTransitions[booking.status].includes(newStatus)) {
    throw new Error(`Cannot transition from ${booking.status} to ${newStatus}`);
  }

  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status: newStatus },
    include: {
      service: true,
      salon: true,
      client: true,
      payment: true,
    },
  });
}

/**
 * Mark payment as submitted (BANK_TRANSFER: customer clicked "I have paid")
 */
export async function markPaymentSubmitted(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.status !== "AWAITING_PAYMENT") {
    throw new Error(
      "Only bookings awaiting payment can be marked as submitted",
    );
  }

  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "PAYMENT_SUBMITTED" },
    include: {
      payment: true,
      service: true,
      salon: true,
    },
  });
}

/**
 * Mark payment as confirmed (BANK_TRANSFER: salon owner confirmed payment)
 */
export async function confirmPaymentReceived(
  bookingId: string,
  notes?: string,
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.status !== "PAYMENT_SUBMITTED") {
    throw new Error(
      "Only bookings with submitted payment can be marked as confirmed",
    );
  }

  // Update payment
  if (booking.payment) {
    await prisma.payment.update({
      where: { id: booking.payment.id },
      data: {
        status: "COMPLETED",
        bankTransferConfirmedAt: new Date(),
        confirmationNotes: notes,
      },
    });
  }

  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "PAID" },
    include: {
      payment: true,
      service: true,
      salon: true,
      client: true,
    },
  });
}

/**
 * Cancel booking
 */
export async function cancelBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.status === "COMPLETED" || booking.status === "CANCELLED") {
    throw new Error(`Cannot cancel a ${booking.status} booking`);
  }

  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
    include: {
      service: true,
      salon: true,
    },
  });
}

/**
 * Complete booking (after service is done)
 */
export async function completeBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.status !== "PAID") {
    throw new Error(
      "Only paid bookings can be marked as completed. Current status:",
      booking.status,
    );
  }

  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "COMPLETED" },
    include: {
      service: true,
      salon: true,
      client: true,
    },
  });
}

/**
 * Get bookings that need auto-cancellation
 * AWAITING_PAYMENT > 2 hours
 * PAYMENT_SUBMITTED > 24 hours
 */
export async function getExpiredBookings() {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return await prisma.booking.findMany({
    where: {
      OR: [
        {
          status: "AWAITING_PAYMENT",
          createdAt: { lt: twoHoursAgo },
        },
        {
          status: "PAYMENT_SUBMITTED",
          createdAt: { lt: twentyFourHoursAgo },
        },
      ],
    },
  });
}

/**
 * Auto-cancel expired bookings
 */
export async function autoCancelExpiredBookings() {
  const expiredBookings = await getExpiredBookings();

  for (const booking of expiredBookings) {
    await cancelBooking(booking.id);
    console.log(`Auto-cancelled expired booking: ${booking.id}`);
  }

  return expiredBookings.length;
}
