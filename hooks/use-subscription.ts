"use client";

import { useEffect, useState } from "react";

interface SubscriptionInfo {
  subscription: any;
  capacity: any;
  limits: any;
  features: Record<string, boolean>;
}

export function useSubscriptionInfo() {
  const [subscriptionInfo, setSubscriptionInfo] =
    useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      try {
        const response = await fetch("/api/salon-admin/subscription-info", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch subscription info");
        }

        const data = await response.json();
        setSubscriptionInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionInfo();
  }, []);

  return { subscriptionInfo, loading, error };
}

export function useFeatureAccess(featureName: string): boolean {
  const { subscriptionInfo, loading } = useSubscriptionInfo();

  if (loading || !subscriptionInfo) {
    return false;
  }

  return subscriptionInfo.features[featureName] ?? false;
}

export function useSubscriptionLimits() {
  const { subscriptionInfo: info, loading, error } = useSubscriptionInfo();

  if (!info) {
    return {
      plan: "FREE",
      bookingLimit: 10,
      bookingUsed: 0,
      bookingRemaining: 10,
      serviceLimit: 5,
      serviceUsed: 0,
      serviceRemaining: 5,
      staffLimit: 1,
      staffUsed: 0,
      staffRemaining: 1,
      loading,
      error,
    };
  }

  return {
    plan: info.capacity.plan,
    bookingLimit: info.limits.limit,
    bookingUsed: info.limits.used,
    bookingRemaining: info.limits.remaining,
    serviceLimit: info.capacity.services.limit,
    serviceUsed: info.capacity.services.used,
    serviceRemaining: info.capacity.services.remaining,
    staffLimit: info.capacity.staff.limit,
    staffUsed: info.capacity.staff.used,
    staffRemaining: info.capacity.staff.remaining,
    loading,
    error,
  };
}
