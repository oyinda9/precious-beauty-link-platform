"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";

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
    <div className=" ">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-20  ">
        {plans.map((plan, index) => (
          <Card
            key={plan.id}
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl ${
              plan.popular
                ? "border-2 border-purple-500 bg-gradient-to-br from-purple-900/30 via-slate-900 to-slate-900 lg:scale-105 shadow-xl shadow-purple-500/25"
                : currentPlan === plan.id
                ? "border-2 border-purple-500/60 bg-gradient-to-br from-purple-900/10 to-slate-900"
                : "border border-purple-500/20 bg-slate-900/50 hover:border-purple-500/40 hover:bg-slate-900/70"
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute top-0 right-0">
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[70px] border-r-[70px] border-t-purple-500 border-r-transparent"></div>
                <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white border-none shadow-lg flex items-center gap-1 z-10">
                  <Sparkles className="w-3 h-3" />
                  Most Popular
                </Badge>
              </div>
            )}

            {/* Current Plan Badge */}
            {currentPlan === plan.id && !plan.popular && (
              <Badge className="absolute top-3 right-3 bg-emerald-600 text-white border-none shadow-lg z-10">
                Current Plan
              </Badge>
            )}

            <div className="p-6">
              {/* Plan Name */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-purple-300/70">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                {plan.price === 0 ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                      Free
                    </span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                      ₦{plan.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-purple-300">/month</span>
                  </div>
                )}
              </div>

              {/* Booking Limit */}
              <div className="mb-6 p-3 bg-gradient-to-r from-purple-500/10 to-purple-500/5 rounded-lg border border-purple-500/20">
                <p className="text-xs text-purple-300 mb-1">Monthly Bookings</p>
                <p className="text-xl font-bold text-white">
                  {plan.bookingLimit === 999999 
                    ? "Unlimited ✨" 
                    : `${plan.bookingLimit.toLocaleString()} bookings`}
                </p>
              </div>

              {/* Features List */}
              <div className="mb-6 space-y-2.5 min-h-[200px]">
                {plan.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-sm text-purple-200/80"
                  >
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      {FEATURE_LABELS[feature] || feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => onSelectPlan?.(plan.id)}
                disabled={isLoading || currentPlan === plan.id}
                className={`w-full font-semibold transition-all duration-200 ${
                  plan.popular
                    ? "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30"
                    : currentPlan === plan.id
                    ? "bg-slate-700/50 text-purple-200 cursor-not-allowed border border-purple-500/30"
                    : "bg-slate-800 hover:bg-slate-700 text-purple-200 border border-purple-500/30 hover:border-purple-500/50 hover:text-white"
                }`}
              >
                {currentPlan === plan.id ? (
                  "✓ Current Plan"
                ) : plan.price === 0 ? (
                  "Get Started Free"
                ) : isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  "Upgrade Now"
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}