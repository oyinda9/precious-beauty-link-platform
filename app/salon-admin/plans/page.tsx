"use client";

import { PlanComparisonPage } from "@/components/subscription/upgrade-prompt";
import SalonAdminLayout from "@/components/dashboard/salon-admin-layout";
import { useSubscriptionInfo } from "@/hooks/use-subscription";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlansPage() {
  const { subscriptionInfo, loading } = useSubscriptionInfo();

  const currentPlan = subscriptionInfo?.subscription?.plan || "FREE";

  return (
    <SalonAdminLayout>
      <div className="space-y-6 pb-10">
        <div>
          <h1 className="text-3xl font-bold">Upgrade Your Plan</h1>
          <p className="text-gray-500 mt-2">
            Choose the perfect plan for your salon and unlock powerful features
          </p>
        </div>

        {loading ? (
          <Skeleton className="w-full h-96" />
        ) : (
          <PlanComparisonPage currentPlan={currentPlan} />
        )}
      </div>
    </SalonAdminLayout>
  );
}
