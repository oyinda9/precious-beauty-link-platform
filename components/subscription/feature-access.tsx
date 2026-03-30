"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, X } from "lucide-react";

interface FeatureAccessProps {
  salonId?: string;
}

const FEATURE_GROUPS = {
  Communication: [
    { key: "whatsappNotifications", label: "WhatsApp Notifications" },
    { key: "emailNotifications", label: "Email Notifications" },
    { key: "smsNotifications", label: "SMS Notifications" },
  ],
  Analytics: [
    { key: "revenueTracking", label: "Revenue Tracking" },
    { key: "customerAnalytics", label: "Customer Analytics" },
    { key: "staffPerformanceMetrics", label: "Staff Performance Metrics" },
    { key: "advancedAnalytics", label: "Advanced Analytics" },
    { key: "customReports", label: "Custom Reports" },
  ],
  "Business Tools": [
    { key: "discountsAndCoupons", label: "Discounts & Coupons" },
    { key: "loyaltyPrograms", label: "Loyalty Programs" },
    { key: "waitlistManagement", label: "Waitlist Management" },
    { key: "packageBundles", label: "Package Bundles" },
    { key: "giftCards", label: "Gift Cards" },
    { key: "membershipPlans", label: "Membership Plans" },
  ],
  "Integration & Customization": [
    { key: "googleCalendarSync", label: "Google Calendar Sync" },
    { key: "googleBusinessProfile", label: "Google Business Profile" },
    { key: "customDomain", label: "Custom Domain" },
    { key: "customBranding", label: "Custom Branding" },
    { key: "apiAccess", label: "API Access" },
    { key: "zapierIntegration", label: "Zapier Integration" },
  ],
  "Support & Account": [
    { key: "prioritySupport", label: "Priority Support" },
    { key: "bulkImport", label: "Bulk Import" },
  ],
};

export function FeatureAccess({ salonId }: FeatureAccessProps) {
  const [features, setFeatures] = useState<Record<string, boolean> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await fetch("/api/salon-admin/subscription-info", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch features");
        }

        const data = await response.json();
        setFeatures(data.features);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading features...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  if (!features) {
    return <div>No features found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Features</h2>
        <p className="text-gray-600 mb-6">
          These features are included in your current plan. Upgrade to access
          more.
        </p>
      </div>

      {Object.entries(FEATURE_GROUPS).map(([group, items]) => (
        <Card key={group}>
          <CardHeader>
            <CardTitle className="text-lg">{group}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  {features[item.key as keyof typeof features] ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                  )}
                  <span
                    className={
                      features[item.key as keyof typeof features]
                        ? "text-gray-900"
                        : "text-gray-400 line-through"
                    }
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
