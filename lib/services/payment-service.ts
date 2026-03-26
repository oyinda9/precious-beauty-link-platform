import { prisma } from "@/lib/prisma";

/**
 * Create payment for booking
 */
export async function createPayment(
  bookingId: string,
  amount: number,
  paymentMethod: "BANK_TRANSFER" | "PAY_AT_SALON",
) {
  const referenceNumber = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  return await prisma.payment.create({
    data: {
      bookingId,
      amount,
      currency: "NGN",
      paymentMethod,
      referenceNumber,
      status: "PENDING",
    },
  });
}

/**
 * Get payment details for booking
 */
export async function getPaymentByBookingId(bookingId: string) {
  return await prisma.payment.findUnique({
    where: { bookingId },
    include: {
      booking: {
        include: {
          salon: {
            select: {
              bankAccountName: true,
              bankAccountNumber: true,
              bankName: true,
              name: true,
              phone: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Get pending payment confirmations for a salon
 */
export async function getPendingPaymentConfirmations(salonId: string) {
  return await prisma.payment.findMany({
    where: {
      booking: { salonId },
      status: "PENDING",
    },
    include: {
      booking: {
        include: {
          client: true,
          service: true,
          salon: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Mark payment as submitted (customer clicked "I have paid")
 */
export async function submitPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  // Update booking status to PAYMENT_SUBMITTED
  await prisma.booking.update({
    where: { id: payment.bookingId },
    data: { status: "PAYMENT_SUBMITTED" },
  });

  return await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "COMPLETED", // Will be confirmed by salon owner
    },
  });
}

/**
 * Confirm payment (salon owner confirms the payment was received)
 */
export async function confirmPayment(
  paymentId: string,
  confirmationNotes?: string,
) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  // Update booking status to PAID
  await prisma.booking.update({
    where: { id: payment.bookingId },
    data: { status: "PAID" },
  });

  return await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "COMPLETED",
      bankTransferConfirmedAt: new Date(),
      confirmationNotes,
    },
  });
}

/**
 * Get payment details by reference number
 */
export async function getPaymentByReference(referenceNumber: string) {
  return await prisma.payment.findUnique({
    where: { referenceNumber },
    include: {
      booking: {
        include: {
          salon: true,
          service: true,
          client: true,
        },
      },
    },
  });
}

/**
 * Get all payments for a booking
 */
export async function getPaymentsForBooking(bookingId: string) {
  return await prisma.payment.findMany({
    where: { bookingId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Refund payment
 */
export async function refundPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  // Update booking to CANCELLED
  await prisma.booking.update({
    where: { id: payment.bookingId },
    data: { status: "CANCELLED" },
  });

  return await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "REFUNDED",
    },
  });
}

/**
 * Check if payment is expired (bank transfer must be completed within 2 hours)
 */
export function isPaymentExpired(paymentCreatedAt: Date): boolean {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  return paymentCreatedAt < twoHoursAgo;
}

/**
 * Check if payment confirmation is expired (must be confirmed within 24 hours)
 */
export function isConfirmationExpired(
  paymentSubmittedAt: Date | undefined,
): boolean {
  if (!paymentSubmittedAt) return false;
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return paymentSubmittedAt < twentyFourHoursAgo;
}
