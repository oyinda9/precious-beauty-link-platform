/**
 * Subscription Plan Features & Limits
 * Defines what features and limits are available for each subscription plan
 */

export type SubscriptionPlan =
  | "FREE"
  | "STARTER"
  | "STANDARD"
  | "GROWTH"
  | "PREMIUM";

export interface PlanFeatures {
  name: string;
  price: number;
  monthlyBookingLimit: number;
  maxServices: number;
  maxStaff: number;
  maxCustomers: number;
  maxUserAccounts: number;
  features: {
    whatsappNotifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    autoBooking: boolean;
    customBranding: boolean;
    advancedAnalytics: boolean;
    revenueTracking: boolean;
    customerAnalytics: boolean;
    staffPerformanceMetrics: boolean;
    discountsAndCoupons: boolean;
    loyaltyPrograms: boolean;
    googleCalendarSync: boolean;
    googleBusinessProfile: boolean;
    waitlistManagement: boolean;
    packageBundles: boolean;
    giftCards: boolean;
    membershipPlans: boolean;
    customDomain: boolean;
    apiAccess: boolean;
    zapierIntegration: boolean;
    prioritySupport: boolean;
    customReports: boolean;
    bulkImport: boolean;
  };
}

export const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeatures> = {
  FREE: {
    name: "Free / Trial",
    price: 0,
    monthlyBookingLimit: 10,
    maxServices: 5,
    maxStaff: 1,
    maxCustomers: 50,
    maxUserAccounts: 1,
    features: {
      whatsappNotifications: false,
      emailNotifications: true,
      smsNotifications: false,
      autoBooking: false,
      customBranding: false,
      advancedAnalytics: false,
      revenueTracking: true, // Basic
      customerAnalytics: false,
      staffPerformanceMetrics: false,
      discountsAndCoupons: false,
      loyaltyPrograms: false,
      googleCalendarSync: false,
      googleBusinessProfile: false,
      waitlistManagement: false,
      packageBundles: false,
      giftCards: false,
      membershipPlans: false,
      customDomain: false,
      apiAccess: false,
      zapierIntegration: false,
      prioritySupport: false,
      customReports: false,
      bulkImport: false,
    },
  },
  STARTER: {
    name: "Starter",
    price: 5000,
    monthlyBookingLimit: 30,
    maxServices: 10,
    maxStaff: 2,
    maxCustomers: 200,
    maxUserAccounts: 2,
    features: {
      whatsappNotifications: true,
      emailNotifications: true,
      smsNotifications: true, // Limited
      autoBooking: true, // Basic
      customBranding: false,
      advancedAnalytics: false,
      revenueTracking: true,
      customerAnalytics: true, // Basic
      staffPerformanceMetrics: false,
      discountsAndCoupons: true, // Basic
      loyaltyPrograms: false,
      googleCalendarSync: true,
      googleBusinessProfile: false,
      waitlistManagement: false,
      packageBundles: true, // Basic
      giftCards: false,
      membershipPlans: false,
      customDomain: false,
      apiAccess: false,
      zapierIntegration: false,
      prioritySupport: false,
      customReports: false,
      bulkImport: false,
    },
  },
  STANDARD: {
    name: "Standard",
    price: 10000,
    monthlyBookingLimit: 50,
    maxServices: 20,
    maxStaff: 5,
    maxCustomers: 500,
    maxUserAccounts: 5,
    features: {
      whatsappNotifications: true,
      emailNotifications: true,
      smsNotifications: true,
      autoBooking: true,
      customBranding: true,
      advancedAnalytics: true,
      revenueTracking: true,
      customerAnalytics: true,
      staffPerformanceMetrics: true,
      discountsAndCoupons: true,
      loyaltyPrograms: true,
      googleCalendarSync: true,
      googleBusinessProfile: false,
      waitlistManagement: true,
      packageBundles: true,
      giftCards: true,
      membershipPlans: true, // Basic
      customDomain: false,
      apiAccess: false,
      zapierIntegration: false,
      prioritySupport: true, // Email support
      customReports: false,
      bulkImport: false,
    },
  },
  GROWTH: {
    name: "Growth",
    price: 20000,
    monthlyBookingLimit: 100,
    maxServices: 50,
    maxStaff: 10,
    maxCustomers: 1000,
    maxUserAccounts: 10,
    features: {
      whatsappNotifications: true,
      emailNotifications: true,
      smsNotifications: true,
      autoBooking: true,
      customBranding: true,
      advancedAnalytics: true,
      revenueTracking: true,
      customerAnalytics: true,
      staffPerformanceMetrics: true,
      discountsAndCoupons: true,
      loyaltyPrograms: true,
      googleCalendarSync: true,
      googleBusinessProfile: true,
      waitlistManagement: true,
      packageBundles: true,
      giftCards: true,
      membershipPlans: true,
      customDomain: true,
      apiAccess: true,
      zapierIntegration: true,
      prioritySupport: true, // Phone + Email support
      customReports: true,
      bulkImport: true, // Basic
    },
  },
  PREMIUM: {
    name: "Premium",
    price: 30000,
    monthlyBookingLimit: 999999, // Unlimited
    maxServices: 999999,
    maxStaff: 999999,
    maxCustomers: 999999,
    maxUserAccounts: 999999,
    features: {
      whatsappNotifications: true,
      emailNotifications: true,
      smsNotifications: true,
      autoBooking: true,
      customBranding: true,
      advancedAnalytics: true,
      revenueTracking: true,
      customerAnalytics: true,
      staffPerformanceMetrics: true,
      discountsAndCoupons: true,
      loyaltyPrograms: true,
      googleCalendarSync: true,
      googleBusinessProfile: true,
      waitlistManagement: true,
      packageBundles: true,
      giftCards: true,
      membershipPlans: true,
      customDomain: true,
      apiAccess: true,
      zapierIntegration: true,
      prioritySupport: true, // Dedicated account manager
      customReports: true,
      bulkImport: true,
    },
  },
};

/**
 * Get features for a subscription plan
 */
export function getPlanFeatures(plan: SubscriptionPlan): PlanFeatures {
  return PLAN_FEATURES[plan];
}

/**
 * Check if a plan has a specific feature
 */
export function hasPlanFeature(
  plan: SubscriptionPlan,
  featureKey: keyof PlanFeatures["features"],
): boolean {
  const features = PLAN_FEATURES[plan];
  return features.features[featureKey] as boolean;
}

/**
 * Get plan limit for a resource
 */
export function getPlanLimit(
  plan: SubscriptionPlan,
  limitType: "booking" | "service" | "staff" | "customer" | "users",
): number {
  const features = PLAN_FEATURES[plan];
  switch (limitType) {
    case "booking":
      return features.monthlyBookingLimit;
    case "service":
      return features.maxServices;
    case "staff":
      return features.maxStaff;
    case "customer":
      return features.maxCustomers;
    case "users":
      return features.maxUserAccounts;
    default:
      return 0;
  }
}

/**
 * Check if a salon has reached a resource limit
 */
export function hasReachedLimit(
  plan: SubscriptionPlan,
  limitType: "booking" | "service" | "staff" | "customer" | "users",
  currentCount: number,
): boolean {
  const limit = getPlanLimit(plan, limitType);
  return currentCount >= limit;
}

/**
 * Get remaining capacity for a resource
 */
export function getRemainingCapacity(
  plan: SubscriptionPlan,
  limitType: "booking" | "service" | "staff" | "customer" | "users",
  currentCount: number,
): number {
  const limit = getPlanLimit(plan, limitType);
  return Math.max(0, limit - currentCount);
}
