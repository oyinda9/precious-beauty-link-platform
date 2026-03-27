"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  TrendingUp,
  Crown,
  ArrowUpRight,
  Check,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-500/30">
            <Check className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "TRIAL":
        return (
          <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-100 border border-blue-300 dark:border-blue-500/30">
            Trial
          </Badge>
        );
      case "PAST_DUE":
        return (
          <Badge className="bg-orange-500/20 text-orange-700 dark:text-orange-100 border border-orange-300 dark:border-orange-500/30">
            Past Due
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-500/20 text-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-500/30">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Plan Card */}
      <Card className="p-6 bg-linear-to-br from-purple-100 to-purple-50 border border-purple-200 dark:from-purple-600/10 dark:via-purple-600/5 dark:to-transparent dark:border-purple-500/20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-200 dark:bg-purple-500/20 rounded-lg">
              <Crown className="w-5 h-5 text-purple-700 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-sm text-purple-600 dark:text-slate-200 font-medium">Current Plan</p>
              <h3 className="text-2xl font-bold text-purple-900 dark:text-white capitalize">
                {subscription.plan}
              </h3>
            </div>
          </div>
          {getStatusBadge(subscription.status)}
        </div>
      </Card>

      {/* Usage Card */}
      <Card className="p-6 bg-linear-to-br from-slate-50 to-slate-100 border border-slate-200 dark:from-slate-900/40 dark:to-slate-900/20 dark:border-slate-700/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-600 dark:text-cyan-300" />
            <h4 className="font-semibold text-slate-900 dark:text-white">Booking Usage</h4>
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-100">
            {subscription.used} /{" "}
            {subscription.bookingLimit === 999999
              ? "Unlimited"
              : subscription.bookingLimit}
          </span>
        </div>

        {/* Usage Bar */}
        <div className="mb-3">
          <div className="w-full h-2 bg-slate-300 dark:bg-slate-800/60 rounded-full overflow-hidden border border-slate-400 dark:border-slate-700/50">
            <div
              className={`h-full transition-all rounded-full ${
                usagePercentage >= 100
                  ? "bg-linear-to-r from-red-500 to-red-600"
                  : usagePercentage >= 80
                    ? "bg-linear-to-r from-yellow-500 to-orange-500"
                    : "bg-linear-to-r from-emerald-500 to-cyan-500"
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Remaining Info */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-200 font-medium">Remaining this month</span>
          <span
            className={`font-bold text-xl ${
              subscription.remaining > 0
                ? "text-lime-700 dark:text-lime-300"
                : "text-red-700 dark:text-red-200"
            }`}
          >
            {subscription.remaining}
          </span>
        </div>
      </Card>

      {/* Renewal Card */}
      {subscription.renewalDate && (
        <Card className="p-6 bg-linear-to-br from-slate-50 to-slate-100 border border-slate-200 dark:from-slate-900/40 dark:to-slate-900/20 dark:border-slate-700/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-200 dark:bg-cyan-500/20 rounded-lg">
              <Calendar className="w-5 h-5 text-cyan-700 dark:text-cyan-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600 dark:text-slate-200 font-medium">Next Renewal</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {new Date(subscription.renewalDate).toLocaleDateString(
                  "en-NG",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {subscription.plan !== "PREMIUM" && (
          <Button
            onClick={() => onUpgrade?.("PREMIUM")}
            disabled={isLoading}
            className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 font-medium"
          >
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Upgrade
          </Button>
        )}
        {subscription.plan !== "FREE" && (
          <Button
            onClick={() => onDowngrade?.("STARTER")}
            disabled={isLoading}
            variant="outline"
            className="border-slate-300 dark:border-slate-500 text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/70 font-medium"
          >
            Downgrade
          </Button>
        )}
        <Button
          onClick={onCancel}
          disabled={isLoading}
          variant="outline"
          className="border-red-300 dark:border-red-500 text-red-700 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-950/50 hover:text-red-800 dark:hover:text-red-100 font-medium"
        >
          Cancel Plan
        </Button>
      </div>
    </div>
  );
}
