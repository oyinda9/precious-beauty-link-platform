"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X } from "lucide-react";

interface PlanComparison {
  plan: string;
  price: number;
  bookingLimit: number;
  maxServices: number;
  maxStaff: number;
  features: string[];
}

const PLANS: PlanComparison[] = [
  {
    plan: "FREE",
    price: 0,
    bookingLimit: 10,
    maxServices: 5,
    maxStaff: 1,
    features: ["Basic email notifications", "Limited analytics", "1 user account"],
  },
  {
    plan: "STARTER",
    price: 5000,
    bookingLimit: 30,
    maxServices: 10,
    maxStaff: 2,
    features: [
      "WhatsApp notifications",
      "Email & SMS alerts",
      "Basic discounts",
      "Package bundles",
      "Google Calendar sync",
      "2 user accounts",
    ],
  },
  {
    plan: "STANDARD",
    price: 10000,
    bookingLimit: 50,
    maxServices: 20,
    maxStaff: 5,
    features: [
      "All Starter features",
      "Advanced analytics",
      "Custom branding",
      "Staff performance metrics",
      "Loyalty programs",
      "Gift cards",
      "Waitlist management",
      "5 user accounts",
    ],
  },
  {
    plan: "GROWTH",
    price: 20000,
    bookingLimit: 100,
    maxServices: 50,
    maxStaff: 10,
    features: [
      "All Standard features",
      "Google Business profile",
      "Custom domain",
      "API access",
      "Zapier integration",
      "Priority phone support",
      "Bulk import",
      "10 user accounts",
      "Custom reports",
    ],
  },
  {
    plan: "PREMIUM",
    price: 30000,
    bookingLimit: 999999,
    maxServices: 999999,
    maxStaff: 999999,
    features: [
      "Unlimited everything",
      "All Growth features",
      "Dedicated account manager",
      "24/7 priority support",
      "Custom integrations",
      "Unlimited user accounts",
    ],
  },
];

interface UpgradePromptProps {
  currentPlan: string;
  limitType: "bookings" | "services" | "staff";
  onClose?: () => void;
}

export function UpgradePrompt({ currentPlan, limitType, onClose }: UpgradePromptProps) {
  const [open, setOpen] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const handleUpgrade = (plan: string) => {
    setSelectedPlan(plan);
    // TODO: Redirect to payment/upgrade page
    console.log(`Upgrading to ${plan} plan`);
  };

  const currentIndex = PLANS.findIndex((p) => p.plan === currentPlan);
  const recommendedIndex = Math.max(currentIndex + 1, PLANS.findIndex((p) => p.plan === "STANDARD"));
  const recommendedPlan = PLANS[recommendedIndex];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            You've reached the {limitType} limit for your {currentPlan} plan. Upgrade to continue growing.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {/* Current Plan Info */}
          <Card className="border-2 border-gray-300">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-bold text-lg mb-2">{currentPlan} (Current)</h3>
                <p className="text-gray-600 mb-4">Your current plan</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monthly Bookings:</span>
                    <span className="font-semibold">{currentPlan === "PREMIUM" ? "∞" : PLANS.find((p) => p.plan === currentPlan)?.bookingLimit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Services:</span>
                    <span className="font-semibold">{currentPlan === "PREMIUM" ? "∞" : PLANS.find((p) => p.plan === currentPlan)?.maxServices}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Staff:</span>
                    <span className="font-semibold">{currentPlan === "PREMIUM" ? "∞" : PLANS.find((p) => p.plan === currentPlan)?.maxStaff}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Plan */}
          {recommendedPlan && (
            <Card className="border-2 border-green-500 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                    RECOMMENDED
                  </div>
                  <h3 className="font-bold text-lg mb-2">{recommendedPlan.plan}</h3>
                  <p className="text-2xl font-bold text-green-600 mb-4">
                    ₦{recommendedPlan.price.toLocaleString()}/mo
                  </p>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span>Monthly Bookings:</span>
                      <span className="font-semibold">
                        {recommendedPlan.bookingLimit === 999999 ? "∞" : recommendedPlan.bookingLimit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Services:</span>
                      <span className="font-semibold">
                        {recommendedPlan.maxServices === 999999 ? "∞" : recommendedPlan.maxServices}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Staff:</span>
                      <span className="font-semibold">
                        {recommendedPlan.maxStaff === 999999 ? "∞" : recommendedPlan.maxStaff}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleUpgrade(recommendedPlan.plan)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Upgrade to {recommendedPlan.plan}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* All Plans Comparison */}
        <div className="mt-8">
          <h3 className="font-bold mb-4">Compare All Plans</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-semibold">Plan</td>
                  {PLANS.map((p) => (
                    <td key={p.plan} className="py-2 text-center font-semibold">
                      {p.plan}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-2">Price</td>
                  {PLANS.map((p) => (
                    <td key={p.plan} className="py-2 text-center">
                      ₦{p.price.toLocaleString()}/mo
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-2">Bookings/mo</td>
                  {PLANS.map((p) => (
                    <td key={p.plan} className="py-2 text-center">
                      {p.bookingLimit === 999999 ? "∞" : p.bookingLimit}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-2">Services</td>
                  {PLANS.map((p) => (
                    <td key={p.plan} className="py-2 text-center">
                      {p.maxServices === 999999 ? "∞" : p.maxServices}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2">Staff</td>
                  {PLANS.map((p) => (
                    <td key={p.plan} className="py-2 text-center">
                      {p.maxStaff === 999999 ? "∞" : p.maxStaff}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={handleClose}>
            Maybe Later
          </Button>
          {recommendedPlan && (
            <Button onClick={() => handleUpgrade(recommendedPlan.plan)}>
              Upgrade Now
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface PlanComparisonPageProps {
  currentPlan?: string;
}

export function PlanComparisonPage({ currentPlan }: PlanComparisonPageProps) {
  return (
    <div className="max-w-7xl mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-gray-600 text-lg">
          Select the perfect plan for your salon business
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.plan === currentPlan;
          return (
            <Card key={plan.plan} className={isCurrent ? "border-2 border-purple-600" : ""}>
              <CardContent className="pt-6">
                <div className="text-center">
                  {isCurrent && (
                    <div className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                      CURRENT
                    </div>
                  )}
                  <h3 className="font-bold text-lg mb-2">{plan.plan}</h3>
                  <p className="text-2xl font-bold mb-4">₦{plan.price.toLocaleString()}</p>
                  <p className="text-xs text-gray-600 mb-4">/month</p>

                  <div className="space-y-2 text-sm mb-6">
                    <div className="font-semibold text-gray-800">
                      {plan.bookingLimit === 999999 ? "∞" : plan.bookingLimit} Bookings/mo
                    </div>
                    <div className="font-semibold text-gray-800">
                      {plan.maxServices === 999999 ? "∞" : plan.maxServices} Services
                    </div>
                    <div className="font-semibold text-gray-800">
                      {plan.maxStaff === 999999 ? "∞" : plan.maxStaff} Staff Members
                    </div>
                  </div>

                  <Button
                    disabled={isCurrent}
                    className="w-full mb-4"
                    variant={isCurrent ? "outline" : "default"}
                  >
                    {isCurrent ? "Current Plan" : "Select Plan"}
                  </Button>

                  <div className="text-left">
                    <p className="font-semibold text-sm mb-3">Includes:</p>
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
