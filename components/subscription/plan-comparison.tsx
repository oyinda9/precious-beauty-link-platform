"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  bookingLimit: number;
  features: string[];
  period: string;
  currency: string;
  description: string;
  popular?: boolean;
}

interface SubscriptionPlanComparisonProps {
  plans: SubscriptionPlan[];
  currentPlan?: string;
  onSelectPlan?: (planId: string) => void;
  isLoading?: boolean;
  salones?: string;
}

const FEATURE_LABELS: Record<string, string> = {
  booking: "Booking System",
  customer_mgmt: "Customer Management",
  "2_staff": "2 Staff Members",
  "5_staff": "5 Staff Members",
  unlimited_staff: "Unlimited Staff",
  analytics: "Basic Analytics",
  advanced_analytics: "Advanced Analytics",
  full_analytics: "Full Analytics Dashboard",
  sms_addon: "SMS Notifications (Add-on)",
  recurring_bookings: "Recurring Bookings",
  automation: "Automation Tools",
  multi_branch: "Multi-Branch Support",
  api_access: "API Access",
  priority_support: "Priority Support",
  basic: "Basic Features",
  unlimited_bookings: "Unlimited Bookings",
};

export function SubscriptionPlanComparison({
  plans,
  currentPlan,
  onSelectPlan,
  isLoading,
  salones,
}: SubscriptionPlanComparisonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={`relative overflow-hidden transition-all border-2 ${
            plan.popular
              ? "border-purple-500 bg-gradient-to-br from-purple-900/40 to-slate-900/50 lg:scale-105 lg:z-10"
              : currentPlan === plan.id
                ? "border-purple-500/50 bg-purple-900/20"
                : "border-purple-500/30 bg-slate-900/50"
          }`}
        >
          {/* Popular Badge */}
          {plan.popular && (
            <Badge className="absolute top-3 right-3 bg-purple-600 text-white">
              Most Popular
            </Badge>
          )}

          {/* Current Plan Badge */}
          {currentPlan === plan.id && !plan.popular && (
            <Badge className="absolute top-3 right-3 bg-green-600 text-white">
              Current Plan
            </Badge>
          )}

          <div className="p-6">
            {/* Plan Name */}
            <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
            <p className="text-xs text-purple-300 mb-4">{plan.description}</p>

            {/* Price */}
            <div className="mb-4">
              {plan.price === 0 ? (
                <p className="text-3xl font-bold text-white">Free</p>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    ₦{plan.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-purple-300">/month</span>
                </div>
              )}
            </div>

            {/* Booking Limit */}
            <div className="mb-6 p-3 bg-purple-500/10 rounded border border-purple-500/20">
              <p className="text-xs text-purple-300 mb-1">Monthly Bookings</p>
              <p className="text-lg font-bold text-white">
                {plan.bookingLimit === 999999 ? "Unlimited" : plan.bookingLimit}
              </p>
            </div>

            {/* Features List */}
            <div className="mb-6 space-y-2">
              {plan.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-sm text-purple-300"
                >
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{FEATURE_LABELS[feature] || feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Button
              onClick={() => onSelectPlan?.(plan.id)}
              disabled={isLoading || currentPlan === plan.id}
              className={`w-full font-semibold ${
                plan.popular
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : currentPlan === plan.id
                    ? "bg-slate-700/50 text-purple-200 cursor-not-allowed"
                    : "bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30"
              }`}
            >
              {currentPlan === plan.id
                ? "Current Plan"
                : plan.price === 0
                  ? "Get Started"
                  : isLoading
                    ? "Loading..."
                    : "Upgrade Now"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
