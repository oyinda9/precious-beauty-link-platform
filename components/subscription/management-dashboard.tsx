"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  TrendingUp,
  Zap,
  Calendar,
  AlertTriangle,
} from "lucide-react";

interface SubscriptionStatus {
  salonId: string;
  plan: string;
  bookingLimit: number;
  used: number;
  remaining: number;
  quotaReached: boolean;
  status: string;
  renewalDate?: string;
}

interface SubscriptionManagementProps {
  salonId: string;
  subscription: SubscriptionStatus;
  onUpgrade?: (planId: string) => void;
  onDowngrade?: (planId: string) => void;
  onCancel?: () => void;
}

export function SubscriptionManagementDashboard({
  salonId,
  subscription,
  onUpgrade,
  onDowngrade,
  onCancel,
}: SubscriptionManagementProps) {
  const [isLoading, setIsLoading] = useState(false);
  const usagePercentage = (subscription.used / subscription.bookingLimit) * 100;
  const shouldShowUpgradePrompt = usagePercentage >= 80;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-900/30 border-green-500/30 text-green-300";
      case "TRIAL":
        return "bg-blue-900/30 border-blue-500/30 text-blue-300";
      case "PAST_DUE":
        return "bg-yellow-900/30 border-yellow-500/30 text-yellow-300";
      case "CANCELLED":
      case "SUSPENDED":
        return "bg-red-900/30 border-red-500/30 text-red-300";
      default:
        return "bg-purple-900/30 border-purple-500/30 text-purple-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <Card className="p-6 bg-gradient-to-br from-purple-900/40 to-slate-900/50 border-purple-500/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Current Plan */}
          <div>
            <p className="text-sm text-purple-300 mb-1">Current Plan</p>
            <p className="text-2xl font-bold text-white capitalize">
              {subscription.plan}
            </p>
          </div>

          {/* Status */}
          <div>
            <p className="text-sm text-purple-300 mb-1">Status</p>
            <Badge className={`${getStatusColor(subscription.status)}`}>
              {subscription.status}
            </Badge>
          </div>

          {/* Monthly Limit */}
          <div>
            <p className="text-sm text-purple-300 mb-1">Monthly Limit</p>
            <p className="text-2xl font-bold text-white">
              {subscription.bookingLimit === 999999
                ? "∞"
                : subscription.bookingLimit}
            </p>
          </div>

          {/* Remaining */}
          <div>
            <p className="text-sm text-purple-300 mb-1">Remaining This Month</p>
            <p className="text-2xl font-bold text-green-400">
              {subscription.remaining}
            </p>
          </div>
        </div>

        {/* Usage Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-purple-300">Booking Usage</span>
            <span className="text-sm font-bold text-white">
              {subscription.used} /{" "}
              {subscription.bookingLimit === 999999
                ? "∞"
                : subscription.bookingLimit}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-800/50 rounded-full overflow-hidden border border-purple-500/20">
            <div
              className={`h-full transition-all ${
                usagePercentage >= 100
                  ? "bg-red-500"
                  : usagePercentage >= 80
                    ? "bg-yellow-500"
                    : "bg-green-500"
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Renewal Info */}
        {subscription.renewalDate && (
          <div className="flex items-center gap-2 text-sm text-purple-300 mt-4">
            <Calendar className="w-4 h-4" />
            <span>
              Renews on{" "}
              {new Date(subscription.renewalDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </Card>

      {/* Upgrade Prompt */}
      {shouldShowUpgradePrompt && subscription.bookingLimit !== 999999 && (
        <Card className="p-4 bg-yellow-900/20 border-yellow-500/30">
          <div className="flex gap-4">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-bold text-yellow-300 mb-1">
                You're Approaching Your Booking Limit
              </h4>
              <p className="text-sm text-yellow-200 mb-3">
                {subscription.remaining} bookings remaining this month. Upgrade
                your plan to accept more bookings.
              </p>
              <Button
                onClick={() => onUpgrade?.(subscription.plan)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Upgrade Options
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Quota Reached Alert */}
      {subscription.quotaReached && (
        <Card className="p-4 bg-red-900/20 border-red-500/30">
          <div className="flex gap-4">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-bold text-red-300 mb-1">
                Booking Limit Reached
              </h4>
              <p className="text-sm text-red-200">
                You've reached your monthly booking limit. Upgrade to start
                accepting more bookings.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Upgrade Button */}
        <Button
          onClick={() => onUpgrade?.(subscription.plan)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
        >
          <Zap className="w-4 h-4 mr-2" />
          Upgrade Plan
        </Button>

        {/* Downgrade Button (if not on Free or Starter) */}
        {!["FREE", "STARTER"].includes(subscription.plan) && (
          <Button
            onClick={() => onDowngrade?.(subscription.plan)}
            variant="outline"
            className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
          >
            Downgrade
          </Button>
        )}

        {/* Cancel Button */}
        <Button
          onClick={() => {
            if (
              confirm(
                "Are you sure you want to cancel? Your salon will be downgraded to the Free plan.",
              )
            ) {
              onCancel?.();
            }
          }}
          variant="outline"
          className="border-red-500/30 text-red-300 hover:bg-red-500/10"
        >
          Cancel Subscription
        </Button>
      </div>

      {/* Plan Features */}
      <Card className="p-6 bg-slate-900/50 border-purple-500/30">
        <h3 className="font-bold text-white mb-4">Current Plan Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-purple-300">
          <div>✓ Basic booking system</div>
          {subscription.used <= subscription.bookingLimit && (
            <div>✓ Unlimited staff members</div>
          )}
          {subscription.status === "ACTIVE" && (
            <div>✓ Full access to features</div>
          )}
          <div>✓ Customer management</div>
        </div>
      </Card>
    </div>
  );
}
