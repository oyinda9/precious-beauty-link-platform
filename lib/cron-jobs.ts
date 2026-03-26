import { prisma } from "@/lib/prisma";
import { autoCancelExpiredBookings } from "@/lib/services/booking-service";

/**
 * Cron job 1: Auto-cancel expired bookings
 * Runs every 30 minutes
 * - Cancels AWAITING_PAYMENT bookings > 2 hours old
 * - Cancels PAYMENT_SUBMITTED bookings > 24 hours old
 */
export async function autoCancelExpiredBookingsCron() {
  console.log("[CRON] Starting auto-cancel expired bookings job...");

  try {
    const cancelledCount = await autoCancelExpiredBookings();
    console.log(`[CRON] Auto-cancelled ${cancelledCount} expired bookings`);
    return { success: true, cancelledCount };
  } catch (error) {
    console.error("[CRON] Error auto-cancelling bookings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Cron job 2: Reset monthly booking quotas
 * Runs at 00:01 UTC on the first day of each month
 */
export async function resetMonthlyQuotasCron() {
  console.log("[CRON] Starting monthly quota reset job...");

  try {
    const now = new Date();
    const resetDate = new Date(now.getFullYear(), now.getMonth(), 1);

    const updated = await prisma.subscription.updateMany({
      data: {
        bookingsUsedThisMonth: 0,
        bookingResetDate: resetDate,
      },
    });

    console.log(`[CRON] Reset quotas for ${updated.count} subscriptions`);
    return { success: true, count: updated.count };
  } catch (error) {
    console.error("[CRON] Error resetting quotas:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Cron job 3: Send subscription expiry reminders
 * Runs daily at 09:00 UTC
 * Sends reminders 3 days, 1 day, and on renewal date
 */
export async function subscriptionRemindersCron() {
  console.log("[CRON] Starting subscription reminders job...");

  try {
    const now = new Date();
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Get subscriptions ending in 3 days
    const expiring3Days = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        currentPeriodEnd: {
          gte: in3Days,
          lt: new Date(in3Days.getTime() + 1 * 60 * 60 * 1000), // 1 hour window
        },
      },
      include: { salon: { include: { admins: { include: { user: true } } } } },
    });

    // Get subscriptions ending in 1 day
    const expiring1Day = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        currentPeriodEnd: {
          gte: in1Day,
          lt: new Date(in1Day.getTime() + 1 * 60 * 60 * 1000),
        },
      },
      include: { salon: { include: { admins: { include: { user: true } } } } },
    });

    // Get subscriptions ending today
    const expiringToday = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        currentPeriodEnd: {
          gte: now,
          lt: tomorrow,
        },
      },
      include: { salon: { include: { admins: { include: { user: true } } } } },
    });

    console.log(
      `[CRON] Found ${expiring3Days.length} subscriptions expiring in 3 days`,
    );
    console.log(
      `[CRON] Found ${expiring1Day.length} subscriptions expiring in 1 day`,
    );
    console.log(
      `[CRON] Found ${expiringToday.length} subscriptions expiring today`,
    );

    // TODO: Send email reminders to salon owners
    // For now, just log

    return {
      success: true,
      reminders: {
        in3Days: expiring3Days.length,
        in1Day: expiring1Day.length,
        today: expiringToday.length,
      },
    };
  } catch (error) {
    console.error("[CRON] Error sending reminders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Cron job 4: Enforce subscription statuses
 * Runs every hour
 * - Sets status to SUSPENDED if payment is past due >7 days
 * - Auto-downgrades to FREE if subscription is cancelled
 */
export async function enforceSubscriptionStatusesCron() {
  console.log("[CRON] Starting subscription status enforcement job...");

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Find subscriptions that are past due
    const pastDue = await prisma.subscription.findMany({
      where: {
        status: { in: ["PAST_DUE", "TRIAL"] },
        currentPeriodEnd: { lt: sevenDaysAgo },
      },
    });

    // Suspend old past due subscriptions
    for (const sub of pastDue) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: "SUSPENDED" },
      });
    }

    console.log(`[CRON] Suspended ${pastDue.length} past-due subscriptions`);

    return { success: true, suspended: pastDue.length };
  } catch (error) {
    console.error("[CRON] Error enforcing statuses:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
