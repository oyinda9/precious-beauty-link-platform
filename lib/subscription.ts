import { prisma } from "@/lib/prisma";
import { SubscriptionPlan } from "@prisma/client";

const PLAN_VIEW: Record<
  SubscriptionPlan,
  {
    planKey: string;
    planName: string;
    amount: number;
    billingCycle: "month" | "year";
  }
> = {
  TRIAL: {
    planKey: "free",
    planName: "Free",
    amount: 0,
    billingCycle: "month",
  },
  STARTER: {
    planKey: "basic",
    planName: "Basic",
    amount: 5000,
    billingCycle: "month",
  },
  PROFESSIONAL: {
    planKey: "standard",
    planName: "Standard",
    amount: 15000,
    billingCycle: "month",
  },
  ENTERPRISE: {
    planKey: "premium",
    planName: "Premium",
    amount: 30000,
    billingCycle: "month",
  },
};

export async function getSalonWithSubscriptionBySlug(slug: string) {
  return prisma.salon.findUnique({
    where: { slug },
    include: { subscription: true },
  });
}

export function toSubscriptionView(subscription: any) {
  if (!subscription) {
    return {
      planKey: "free",
      planName: "Free",
      amount: 0,
      currency: "NGN",
      billingCycle: "month",
      status: "inactive",
      nextPaymentDate: null,
    };
  }

  const view =
    PLAN_VIEW[subscription.plan as SubscriptionPlan] ?? PLAN_VIEW.TRIAL;

  return {
    planKey: view.planKey,
    planName: view.planName,
    amount: view.amount,
    currency: "NGN",
    billingCycle: view.billingCycle,
    status: String(subscription.status).toLowerCase(),
    nextPaymentDate:
      subscription.currentPeriodEnd ?? subscription.trialEndsAt ?? null,
  };
}
