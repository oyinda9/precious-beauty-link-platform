import { prisma } from "@/lib/prisma";
import { SubscriptionPlan } from "@prisma/client";

export const SUBSCRIPTION_PLANS = {
  FREE: { name: "FREE", price: 0, bookingLimit: 10, features: ["basic"] },
  STARTER: {
    name: "STARTER",
    price: 5000,
    bookingLimit: 30,
    features: ["booking", "customer_mgmt", "2_staff"],
  },
  STANDARD: {
    name: "STANDARD",
    price: 10000,
    bookingLimit: 50,
    features: ["booking", "customer_mgmt", "5_staff", "analytics", "sms_addon"],
  },
  GROWTH: {
    name: "GROWTH",
    price: 15000,
    bookingLimit: 100,
    features: [
      "booking",
      "customer_mgmt",
      "unlimited_staff",
      "advanced_analytics",
      "recurring_bookings",
      "automation",
    ],
  },
  PREMIUM: {
    name: "PREMIUM",
    price: 30000,
    bookingLimit: 999999,
    features: [
      "unlimited_bookings",
      "full_analytics",
      "multi_branch",
      "automation",
      "api_access",
      "priority_support",
    ],
  },
};

/**
 * Get subscription plan details
 */
export async function getSubscriptionPlan(salonId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { salonId },
    include: { salon: true },
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  return subscription;
}

/**
 * Check if salon has reached booking limit for the month
 */
export async function checkBookingQuota(salonId: string): Promise<boolean> {
  const subscription = await getSubscriptionPlan(salonId);

  // Check if reset needed (monthly)
  const now = new Date();
  const resetDate = new Date(subscription.bookingResetDate);

  if (
    resetDate.getMonth() !== now.getMonth() ||
    resetDate.getFullYear() !== now.getFullYear()
  ) {
    // Reset quota
    await prisma.subscription.update({
      where: { salonId },
      data: {
        bookingsUsedThisMonth: 0,
        bookingResetDate: new Date(now.getFullYear(), now.getMonth(), 1),
      },
    });

    subscription.bookingsUsedThisMonth = 0;
  }

  // Check if under limit
  return subscription.bookingsUsedThisMonth < subscription.monthlyBookingLimit;
}

/**
 * Get remaining bookings for current month
 */
export async function getRemainingBookings(salonId: string): Promise<number> {
  const subscription = await getSubscriptionPlan(salonId);

  // Check if reset needed
  const now = new Date();
  const resetDate = new Date(subscription.bookingResetDate);

  if (
    resetDate.getMonth() !== now.getMonth() ||
    resetDate.getFullYear() !== now.getFullYear()
  ) {
    await prisma.subscription.update({
      where: { salonId },
      data: {
        bookingsUsedThisMonth: 0,
        bookingResetDate: new Date(now.getFullYear(), now.getMonth(), 1),
      },
    });

    return subscription.monthlyBookingLimit;
  }

  return subscription.monthlyBookingLimit - subscription.bookingsUsedThisMonth;
}

/**
 * Increment booking usage for the month
 */
export async function incrementBookingUsage(salonId: string): Promise<void> {
  const subscription = await getSubscriptionPlan(salonId);

  // Check if reset needed
  const now = new Date();
  const resetDate = new Date(subscription.bookingResetDate);

  if (
    resetDate.getMonth() !== now.getMonth() ||
    resetDate.getFullYear() !== now.getFullYear()
  ) {
    // Reset first
    await prisma.subscription.update({
      where: { salonId },
      data: {
        bookingsUsedThisMonth: 1,
        bookingResetDate: new Date(now.getFullYear(), now.getMonth(), 1),
      },
    });
  } else {
    // Increment
    await prisma.subscription.update({
      where: { salonId },
      data: {
        bookingsUsedThisMonth: {
          increment: 1,
        },
      },
    });
  }
}

/**
 * Decrement booking usage when booking is cancelled
 */
export async function decrementBookingUsage(salonId: string): Promise<void> {
  await prisma.subscription.update({
    where: { salonId },
    data: {
      bookingsUsedThisMonth: {
        decrement: 1,
      },
    },
  });
}

/**
 * Create subscription for new salon
 */
export async function createSubscription(salonId: string, plan: string) {
  const planConfig = SUBSCRIPTION_PLANS[plan as SubscriptionPlan];

  if (!planConfig) {
    throw new Error(`Invalid plan: ${plan}`);
  }

  const now = new Date();
  const trialEnd = new Date(now);
  trialEnd.setDate(trialEnd.getDate() + 14);

  return await prisma.subscription.create({
    data: {
      salonId,
      plan: (plan as SubscriptionPlan) || "STARTER",
      status: "TRIAL",
      monthlyBookingLimit: planConfig.bookingLimit,
      trialEndsAt: trialEnd,
      bookingResetDate: new Date(now.getFullYear(), now.getMonth(), 1),
    },
  });
}

/**
 * Upgrade or downgrade subscription plan
 */
export async function updateSubscriptionPlan(
  salonId: string,
  newPlan: SubscriptionPlan,
) {
  const planConfig = SUBSCRIPTION_PLANS[newPlan];

  if (!planConfig) {
    throw new Error(`Invalid plan: ${newPlan}`);
  }

  return await prisma.subscription.update({
    where: { salonId },
    data: {
      plan: newPlan,
      monthlyBookingLimit: planConfig.bookingLimit,
      status: "ACTIVE",
    },
  });
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(salonId: string) {
  return await prisma.subscription.update({
    where: { salonId },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      plan: "FREE",
      monthlyBookingLimit: 10,
    },
  });
}

/**
 * Get all subscription plans for display
 */
export function getAllSubscriptionPlans() {
  return SUBSCRIPTION_PLANS;
}
