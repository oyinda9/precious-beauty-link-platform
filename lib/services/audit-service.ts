import { prisma } from "@/lib/prisma";

/**
 * Log an action in audit log
 */
export async function logAction(
  userId: string | null,
  actionType: string,
  entityType: string,
  entityId: string,
  details?: Record<string, any>,
  ipAddress?: string,
) {
  return await prisma.auditLog.create({
    data: {
      userId,
      actionType,
      entityType,
      entityId,
      details: details ? JSON.stringify(details) : null,
      ipAddress,
    },
  });
}

/**
 * Log bank detail access
 */
export async function logBankDetailAccess(
  userId: string | null,
  salonId: string,
  ipAddress?: string,
) {
  return await logAction(
    userId,
    "VIEWED_BANK_DETAILS",
    "SALON",
    salonId,
    { action: "bank_account_viewed" },
    ipAddress,
  );
}

/**
 * Log payment confirmation
 */
export async function logPaymentConfirmation(
  userId: string | null,
  bookingId: string,
  amount: number,
  ipAddress?: string,
) {
  return await logAction(
    userId,
    "CONFIRMED_PAYMENT",
    "BOOKING",
    bookingId,
    { amount, confirmed_at: new Date() },
    ipAddress,
  );
}

/**
 * Log bank account update
 */
export async function logBankAccountUpdate(
  userId: string,
  salonId: string,
  accountName: string | null,
  accountNumber: string | null,
  bankName: string | null,
  ipAddress?: string,
) {
  return await logAction(
    userId,
    "UPDATED_BANK_ACCOUNT",
    "SALON",
    salonId,
    {
      accountName: accountName ? "***" : null,
      accountNumber: accountNumber ? accountNumber.slice(-4) : null,
      bankName,
      updated_at: new Date(),
    },
    ipAddress,
  );
}

/**
 * Log payment submission
 */
export async function logPaymentSubmission(
  userId: string | null,
  bookingId: string,
  amount: number,
  ipAddress?: string,
) {
  return await logAction(
    userId,
    "SUBMITTED_PAYMENT",
    "BOOKING",
    bookingId,
    { amount, submitted_at: new Date() },
    ipAddress,
  );
}

/**
 * Log subscription upgrade/downgrade
 */
export async function logSubscriptionChange(
  userId: string,
  salonId: string,
  fromPlan: string,
  toPlan: string,
  ipAddress?: string,
) {
  return await logAction(
    userId,
    "CHANGED_SUBSCRIPTION",
    "SUBSCRIPTION",
    salonId,
    { from_plan: fromPlan, to_plan: toPlan, changed_at: new Date() },
    ipAddress,
  );
}

/**
 * Get audit logs for entity
 */
export async function getAuditLogsForEntity(
  entityType: string,
  entityId: string,
) {
  return await prisma.auditLog.findMany({
    where: {
      entityType,
      entityId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get audit logs for user
 */
export async function getAuditLogsForUser(userId: string) {
  return await prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

/**
 * Get all access logs to bank details
 */
export async function getBankAccessLogs(salonId: string) {
  return await prisma.auditLog.findMany({
    where: {
      entityType: "SALON",
      entityId: salonId,
      actionType: "VIEWED_BANK_DETAILS",
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
