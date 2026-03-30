/**
 * Subscription Plan Enforcement Utilities
 * Middleware and helpers to enforce subscription plan restrictions
 */

import { prisma } from "@/lib/prisma";
import {
  getPlanFeatures,
  getRemainingCapacity,
  hasReachedLimit,
} from "@/lib/subscription-features";

/**
 * Get salon subscription with plan details
 */
export async function getSalonSubscription(salonId: string) {
  let subscription = await prisma.subscription.findUnique({
    where: { salonId },
    include: { salon: true },
  });

  // Auto-create FREE subscription if doesn't exist
  if (!subscription) {
    subscription = await prisma.subscription.create({
      data: {
        salonId,
        plan: "FREE",
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      include: { salon: true },
    });
  }

  // Auto-activate if not active
  if (subscription.status !== "ACTIVE") {
    subscription = await prisma.subscription.update({
      where: { salonId },
      data: {
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      include: { salon: true },
    });
  }

  return subscription;
}

/**
 * Check if salon is on active subscription
 */
export async function isSubscriptionActive(salonId: string): Promise<boolean> {
  const subscription = await getSalonSubscription(salonId);
  if (!subscription) return false;
  return subscription.status === "ACTIVE";
}

/**
 * Check if salon can create a new service - STRICT ENFORCEMENT
 */
export async function canCreateService(salonId: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  try {
    // Get subscription (auto-creates FREE if missing)
    const subscription = await getSalonSubscription(salonId);

    if (!subscription) {
      console.warn(
        `[SERVICE LIMIT] No subscription found for salon ${salonId}`,
      );
      return { allowed: false, reason: "No subscription found" };
    }

    // Subscription is guaranteed to be ACTIVE from getSalonSubscription
    console.log(
      `[SERVICE LIMIT] Got subscription for salon ${salonId}: ${subscription.plan}`,
    );

    // Get current service count
    const serviceCount = await prisma.service.count({
      where: { salonId },
    });

    // Get the strict limit for this plan
    const planFeatures = getPlanFeatures(subscription.plan as any);
    const limit = planFeatures.maxServices;

    console.log(
      `[SERVICE LIMIT] Salon: ${salonId}, Plan: ${subscription.plan}, Current: ${serviceCount}, Limit: ${limit}`,
    );

    // STRICT: if already at limit, REJECT
    if (serviceCount >= limit) {
      console.warn(
        `[SERVICE LIMIT] REJECTED: Salon ${salonId} has ${serviceCount} services, limit is ${limit}`,
      );
      return {
        allowed: false,
        reason: `Service limit of ${limit} reached for ${subscription.plan} plan. Current: ${serviceCount}/${limit}`,
      };
    }

    console.log(
      `[SERVICE LIMIT] ALLOWED: Salon ${salonId} can add service (${serviceCount}/${limit})`,
    );
    return { allowed: true };
  } catch (error) {
    console.error(
      `[SERVICE LIMIT] Error checking service limit for ${salonId}:`,
      error,
    );
    return { allowed: false, reason: "Error checking subscription limit" };
  }
}

/**
 * Check if salon can add a new staff member - STRICT ENFORCEMENT
 */
export async function canAddStaff(salonId: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  try {
    // Get subscription (auto-creates FREE if missing)
    const subscription = await getSalonSubscription(salonId);

    if (!subscription) {
      console.warn(`[STAFF LIMIT] No subscription found for salon ${salonId}`);
      return { allowed: false, reason: "No subscription found" };
    }

    // Subscription is guaranteed to be ACTIVE from getSalonSubscription
    console.log(
      `[STAFF LIMIT] Got subscription for salon ${salonId}: ${subscription.plan}`,
    );

    // Get current staff count - ONLY count active staff
    const staffCount = await prisma.salonStaff.count({
      where: { salonId, isActive: true },
    });

    // Get the strict limit for this plan
    const planFeatures = getPlanFeatures(subscription.plan as any);
    const limit = planFeatures.maxStaff;

    console.log(
      `[STAFF LIMIT] Salon: ${salonId}, Plan: ${subscription.plan}, Current: ${staffCount}, Limit: ${limit}`,
    );

    // STRICT: if already at limit, REJECT
    if (staffCount >= limit) {
      console.warn(
        `[STAFF LIMIT] REJECTED: Salon ${salonId} has ${staffCount} staff, limit is ${limit}`,
      );
      return {
        allowed: false,
        reason: `Staff limit of ${limit} reached for ${subscription.plan} plan. Current: ${staffCount}/${limit}`,
      };
    }

    console.log(
      `[STAFF LIMIT] ALLOWED: Salon ${salonId} can add staff (${staffCount}/${limit})`,
    );
    return { allowed: true };
  } catch (error) {
    console.error(
      `[STAFF LIMIT] Error checking staff limit for ${salonId}:`,
      error,
    );
    return { allowed: false, reason: "Error checking subscription limit" };
  }
}

/**
 * Check if salon can create a new booking - STRICT ENFORCEMENT
 */
export async function canCreateBooking(salonId: string): Promise<{
  allowed: boolean;
  reason?: string;
  remaining: number;
}> {
  try {
    // Get subscription (auto-creates FREE if missing)
    const subscription = await getSalonSubscription(salonId);

    if (!subscription) {
      console.warn(
        `[BOOKING LIMIT] No subscription found for salon ${salonId}`,
      );
      return {
        allowed: false,
        reason: "No subscription found",
        remaining: 0,
      };
    }

    // Subscription is guaranteed to be ACTIVE from getSalonSubscription
    console.log(
      `[BOOKING LIMIT] Got subscription for salon ${salonId}: ${subscription.plan}`,
    );

    // Get current month's bookings (based on subscription period)
    const periodStart = subscription.currentPeriodStart;
    const periodEnd = subscription.currentPeriodEnd;

    // If period dates are null, use current month
    const start =
      periodStart ||
      new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end =
      periodEnd ||
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const bookingCount = await prisma.booking.count({
      where: {
        salonId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    // Get the strict limit for this plan
    const planFeatures = getPlanFeatures(subscription.plan as any);
    const limit = planFeatures.monthlyBookingLimit;
    const remaining = Math.max(0, limit - bookingCount);

    console.log(
      `[BOOKING LIMIT] Salon: ${salonId}, Plan: ${subscription.plan}, Current: ${bookingCount}, Limit: ${limit}`,
    );

    // STRICT: if already at limit, REJECT
    if (bookingCount >= limit) {
      console.warn(
        `[BOOKING LIMIT] REJECTED: Salon ${salonId} has ${bookingCount} bookings, limit is ${limit}`,
      );
      return {
        allowed: false,
        reason: `Monthly booking limit of ${limit} reached for ${subscription.plan} plan. Current: ${bookingCount}/${limit}`,
        remaining: 0,
      };
    }

    console.log(
      `[BOOKING LIMIT] ALLOWED: Salon ${salonId} can create booking (${bookingCount}/${limit})`,
    );
    return { allowed: true, remaining };
  } catch (error) {
    console.error(
      `[BOOKING LIMIT] Error checking booking limit for ${salonId}:`,
      error,
    );
    return {
      allowed: false,
      reason: "Error checking subscription limit",
      remaining: 0,
    };
  }
}

/**
 * Get booking limits and usage for a salon
 */
export async function getBookingLimitsUsage(salonId: string) {
  const subscription = await getSalonSubscription(salonId);
  if (!subscription) {
    return {
      plan: "FREE",
      limit: 0,
      used: 0,
      remaining: 0,
      resetDate: null,
    };
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const bookingCount = await prisma.booking.count({
    where: {
      salonId,
      createdAt: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
  });

  const limit = getPlanFeatures(subscription.plan as any).monthlyBookingLimit;
  const remaining = Math.max(0, limit - bookingCount);

  return {
    plan: subscription.plan,
    limit,
    used: bookingCount,
    remaining,
    resetDate: monthEnd,
  };
}

/**
 * Get feature access for a salon
 */
export async function getSalonFeatureAccess(salonId: string) {
  const subscription = await getSalonSubscription(salonId);
  if (!subscription) {
    return getPlanFeatures("FREE").features;
  }

  return getPlanFeatures(subscription.plan as any).features;
}

/**
 * Check if salon has a specific feature
 */
export async function hasSalonFeature(
  salonId: string,
  featureName: keyof (typeof getPlanFeatures extends (plan: any) => infer T
    ? T extends { features: infer F }
      ? F
      : never
    : never),
): Promise<boolean> {
  const subscription = await getSalonSubscription(salonId);
  if (!subscription) return false;

  const features = getPlanFeatures(subscription.plan as any).features;
  return (features[featureName] as any) === true;
}

/**
 * Get capacity info for all resources
 */
export async function getResourceCapacityInfo(salonId: string) {
  const subscription = await getSalonSubscription(salonId);
  if (!subscription) {
    return {
      plan: "FREE",
      services: { used: 0, limit: 0, remaining: 0 },
      staff: { used: 0, limit: 0, remaining: 0 },
      bookings: { used: 0, limit: 0, remaining: 0 },
    };
  }

  const planFeatures = getPlanFeatures(subscription.plan as any);

  // Get current counts
  const serviceCount = await prisma.service.count({ where: { salonId } });
  const staffCount = await prisma.salonStaff.count({
    where: { salonId, isActive: true },
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const bookingCount = await prisma.booking.count({
    where: {
      salonId,
      createdAt: { gte: monthStart, lte: monthEnd },
    },
  });

  return {
    plan: subscription.plan,
    services: {
      used: serviceCount,
      limit: planFeatures.maxServices,
      remaining: Math.max(0, planFeatures.maxServices - serviceCount),
    },
    staff: {
      used: staffCount,
      limit: planFeatures.maxStaff,
      remaining: Math.max(0, planFeatures.maxStaff - staffCount),
    },
    bookings: {
      used: bookingCount,
      limit: planFeatures.monthlyBookingLimit,
      remaining: Math.max(0, planFeatures.monthlyBookingLimit - bookingCount),
    },
  };
}
