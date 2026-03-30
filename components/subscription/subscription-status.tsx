"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  TrendingUp,
  Users,
  BookOpen,
  Zap,
  RefreshCw,
} from "lucide-react";

interface SubscriptionInfo {
  subscription: {
    id: string;
    plan: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
  };
  capacity: {
    plan: string;
    services: { used: number; limit: number; remaining: number };
    staff: { used: number; limit: number; remaining: number };
    bookings: { used: number; limit: number; remaining: number };
  };
  limits: {
    plan: string;
    limit: number;
    used: number;
    remaining: number;
    resetDate: string;
  };
  features: Record<string, boolean>;
}

export function SubscriptionStatus() {
  const [subscriptionInfo, setSubscriptionInfo] =
    useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchSubscriptionInfo = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      else setIsRefreshing(true);

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
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Subscription fetch error:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSubscriptionInfo();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSubscriptionInfo(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchSubscriptionInfo(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading subscription info...</div>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-700 dark:text-red-300 font-medium mb-3">
                  {error}
                </p>
                <Button
                  onClick={() => fetchSubscriptionInfo(true)}
                  disabled={isRefreshing}
                  variant="outline"
                  size="sm"
                  className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/20"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  {isRefreshing ? "Retrying..." : "Try Again"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!subscriptionInfo) {
    return <div>No subscription found</div>;
  }

  const { subscription, capacity, limits } = subscriptionInfo;

  const planColors: Record<
    string,
    { badge: string; header: string; icon: string }
  > = {
    FREE: {
      badge:
        "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
      header:
        "bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-800 dark:to-slate-900",
      icon: "text-slate-600 dark:text-slate-400",
    },
    STARTER: {
      badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      header:
        "bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900",
      icon: "text-blue-600 dark:text-blue-400",
    },
    STANDARD: {
      badge:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      header:
        "bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-800 dark:to-purple-900",
      icon: "text-purple-600 dark:text-purple-400",
    },
    GROWTH: {
      badge:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
      header:
        "bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-800 dark:to-emerald-900",
      icon: "text-emerald-600 dark:text-emerald-400",
    },
    PREMIUM: {
      badge:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      header:
        "bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-800 dark:to-amber-900",
      icon: "text-amber-600 dark:text-amber-400",
    },
  };

  const colors = planColors[subscription.plan] || planColors.FREE;

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const isLimitWarning = (used: number, limit: number) => {
    return limit !== 999999 && used / limit >= 0.8;
  };

  return (
    <div className="space-y-6">
     
      
      {/* Usage Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bookings */}
        <Card
          className={
            isLimitWarning(limits.used, limits.limit) ? "border-orange-300" : ""
          }
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Monthly Bookings
              </CardTitle>
              {isLimitWarning(limits.used, limits.limit) && (
                <AlertCircle className="w-4 h-4 text-orange-500" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Usage</span>
                <span className="font-semibold">
                  {limits.used} / {limits.limit === 999999 ? "∞" : limits.limit}
                </span>
              </div>
              <Progress
                value={getUsagePercentage(limits.used, limits.limit)}
                className="h-2"
              />
            </div>
            <div className="text-xs text-gray-500">
              Resets on {new Date(limits.resetDate).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card
          className={
            isLimitWarning(capacity.services.used, capacity.services.limit)
              ? "border-orange-300"
              : ""
          }
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Services</CardTitle>
              {isLimitWarning(
                capacity.services.used,
                capacity.services.limit,
              ) && <AlertCircle className="w-4 h-4 text-orange-500" />}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Created</span>
                <span className="font-semibold">
                  {capacity.services.used} /{" "}
                  {capacity.services.limit === 999999
                    ? "∞"
                    : capacity.services.limit}
                </span>
              </div>
              <Progress
                value={getUsagePercentage(
                  capacity.services.used,
                  capacity.services.limit,
                )}
                className="h-2"
              />
            </div>
            <div className="text-xs text-gray-500">
              {capacity.services.remaining === 999999
                ? "Unlimited"
                : `${capacity.services.remaining} remaining`}
            </div>
          </CardContent>
        </Card>

        {/* Staff */}
        <Card
          className={
            isLimitWarning(capacity.staff.used, capacity.staff.limit)
              ? "border-orange-300"
              : ""
          }
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team Members
              </CardTitle>
              {isLimitWarning(capacity.staff.used, capacity.staff.limit) && (
                <AlertCircle className="w-4 h-4 text-orange-500" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Active</span>
                <span className="font-semibold">
                  {capacity.staff.used} /{" "}
                  {capacity.staff.limit === 999999 ? "∞" : capacity.staff.limit}
                </span>
              </div>
              <Progress
                value={getUsagePercentage(
                  capacity.staff.used,
                  capacity.staff.limit,
                )}
                className="h-2"
              />
            </div>
            <div className="text-xs text-gray-500">
              {capacity.staff.remaining === 999999
                ? "Unlimited"
                : `${capacity.staff.remaining} remaining`}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* near limit warnings */}
      {(() => {
        const approachingLimits = [];

        if (isLimitWarning(limits.used, limits.limit)) {
          approachingLimits.push({
            name: "Monthly Bookings",
            used: limits.used,
            limit: limits.limit,
            percentage: Math.round((limits.used / limits.limit) * 100),
            remaining: limits.remaining,
          });
        }

        if (isLimitWarning(capacity.services.used, capacity.services.limit)) {
          approachingLimits.push({
            name: "Services",
            used: capacity.services.used,
            limit: capacity.services.limit,
            percentage: Math.round(
              (capacity.services.used / capacity.services.limit) * 100,
            ),
            remaining: capacity.services.remaining,
          });
        }

        if (isLimitWarning(capacity.staff.used, capacity.staff.limit)) {
          approachingLimits.push({
            name: "Team Members",
            used: capacity.staff.used,
            limit: capacity.staff.limit,
            percentage: Math.round(
              (capacity.staff.used / capacity.staff.limit) * 100,
            ),
            remaining: capacity.staff.remaining,
          });
        }

        if (approachingLimits.length === 0) return null;

        return (
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 text-amber-900 dark:text-amber-300">
                  <AlertCircle className="w-5 h-5" />
                  Approaching Limits ({approachingLimits.length})
                </CardTitle>
                <Button
                  onClick={() => fetchSubscriptionInfo(true)}
                  disabled={isRefreshing}
                  variant="ghost"
                  size="sm"
                  className="text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/20"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {approachingLimits.map((limit, idx) => (
                <div
                  key={idx}
                  className="space-y-2 p-4 bg-white dark:bg-slate-900/50 rounded-lg border border-amber-100 dark:border-amber-900/30"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-900 dark:text-white">
                      {limit.name}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
                      {limit.percentage}% used
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {limit.used} of {limit.limit === 999999 ? "∞" : limit.limit}{" "}
                    •{" "}
                    {limit.remaining === 999999
                      ? "Unlimited"
                      : `${limit.remaining} remaining`}
                  </div>
                </div>
              ))}
              <p className="text-sm text-amber-800 dark:text-amber-200 pt-2 border-t border-amber-200 dark:border-amber-900/30">
                💡 Upgrade your plan to unlock more capacity and continue
                growing your business.
              </p>
            </CardContent>
          </Card>
        );
      })()}

      {/* Last Updated */}
      {/* {lastUpdated && (
        <div className="text-xs text-slate-500 dark:text-slate-400 text-center pt-2">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )} */}
    </div>
  );
}
