/**
 * Enhanced Subscription Plans with Size Variations
 *
 * - Small Salon Owners: ₦8,500 for 2 months trial
 * - Big Salon Owners: ₦10,000 (existing elite plans)
 */

export const SUBSCRIPTION_PLANS = {
  // SMALL SALON OWNER PLANS
  SMALL_TRIAL: {
    id: "small_trial",
    label: "Trial (Small Salon)",
    description: "Perfect for getting started",
    price: 8500,
    durationMonths: 2,
    features: [
      "Up to 5 services",
      "Basic booking management",
      "Limited staff profiles",
      "Email support",
      "Basic analytics",
    ],
    maxServices: 5,
    maxStaff: 3,
    targetAudience: "small",
    isDefault: true,
  },

  SMALL_BASIC: {
    id: "small_basic",
    label: "Basic (Small Salon)",
    description: "For growing salons",
    price: 12000,
    durationMonths: 1,
    features: [
      "Up to 15 services",
      "Full booking management",
      "Staff profiles & scheduling",
      "Email & SMS support",
      "Advanced analytics",
      "Customer reviews",
    ],
    maxServices: 15,
    maxStaff: 5,
    targetAudience: "small",
    isDefault: false,
  },

  // BIG SALON OWNER PLANS (Existing Elite Plans)
  BIG_PROFESSIONAL: {
    id: "big_professional",
    label: "Professional (Big Salon)",
    description: "For established salons",
    price: 10000,
    durationMonths: 1,
    features: [
      "Unlimited services",
      "Advanced booking management",
      "Full staff management",
      "Priority support",
      "Advanced analytics & reports",
      "Customer reviews & ratings",
      "Payment integration",
    ],
    maxServices: 999,
    maxStaff: 20,
    targetAudience: "big",
    isDefault: false,
  },

  BIG_ENTERPRISE: {
    id: "big_enterprise",
    label: "Enterprise (Big Salon)",
    description: "For large chains",
    price: 20000,
    durationMonths: 1,
    features: [
      "All Professional features",
      "Unlimited everything",
      "Dedicated account manager",
      "Custom integrations",
      "API access",
      "24/7 priority support",
      "Advanced reporting",
      "Team collaboration tools",
    ],
    maxServices: 9999,
    maxStaff: 999,
    targetAudience: "big",
    isDefault: false,
  },
} as const;

export const SALON_SIZE_THRESHOLDS = {
  SMALL: {
    label: "Small Salon",
    maxServices: 15,
    maxStaff: 5,
    description: "1-2 service chairs, basic operation",
  },
  BIG: {
    label: "Big Salon",
    maxServices: 999,
    maxStaff: 999,
    description: "Multiple service areas, established operation",
  },
} as const;

export function determineSalonSize(servicesCount: number): "SMALL" | "BIG" {
  return servicesCount <= 15 ? "SMALL" : "BIG";
}

export function getApplicablePlans(salonSize: "SMALL" | "BIG") {
  if (salonSize === "SMALL") {
    return [SUBSCRIPTION_PLANS.SMALL_TRIAL, SUBSCRIPTION_PLANS.SMALL_BASIC];
  }
  return [
    SUBSCRIPTION_PLANS.BIG_PROFESSIONAL,
    SUBSCRIPTION_PLANS.BIG_ENTERPRISE,
  ];
}

export function getDefaultPlanForSize(salonSize: "SMALL" | "BIG") {
  if (salonSize === "SMALL") {
    return SUBSCRIPTION_PLANS.SMALL_TRIAL;
  }
  return SUBSCRIPTION_PLANS.BIG_PROFESSIONAL;
}
