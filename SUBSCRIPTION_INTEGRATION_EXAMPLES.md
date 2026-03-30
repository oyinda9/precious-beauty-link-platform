// Example: Import in your salon admin dashboard

import { SubscriptionStatus } from "@/components/subscription/subscription-status";
import { FeatureAccess } from "@/components/subscription/feature-access";
import { PlanComparisonPage, UpgradePrompt } from "@/components/subscription/upgrade-prompt";
import { useFeatureAccess, useSubscriptionLimits } from "@/hooks/use-subscription";

// ============================================
// Example 1: Display subscription status in dashboard
// ============================================
export function DashboardExample() {
return (
<div className="space-y-6">
<h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Show subscription status and usage */}
      <SubscriptionStatus />

      {/* Rest of dashboard content */}
    </div>

);
}

// ============================================
// Example 2: Display available features
// ============================================
export function SettingsExample() {
return (
<div className="space-y-6">
<h1 className="text-3xl font-bold">Settings</h1>

      {/* Show all available features */}
      <FeatureAccess />
    </div>

);
}

// ============================================
// Example 3: Plan comparison/upgrade page
// ============================================
export function PlansPageExample() {
return <PlanComparisonPage currentPlan="STARTER" />;
}

// ============================================
// Example 4: Use hook to check single feature
// ============================================
export function WhatsAppNotificationsSettings() {
const hasWhatsApp = useFeatureAccess("whatsappNotifications");

if (!hasWhatsApp) {
return (
<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
<p className="text-blue-800">
WhatsApp notifications are available in STARTER and higher plans.
</p>
<button className="mt-2 text-blue-600 underline">Upgrade Now</button>
</div>
);
}

return (
<div>
{/_ Show WhatsApp settings _/}
<h3 className="font-bold">WhatsApp Notifications</h3>
{/_ ... WhatsApp configuration UI ... _/}
</div>
);
}

// ============================================
// Example 5: Use hook to get all limits
// ============================================
export function ResourceUsageExample() {
const {
plan,
bookingLimit,
bookingUsed,
bookingRemaining,
serviceLimit,
serviceUsed,
serviceRemaining,
staffLimit,
staffUsed,
staffRemaining,
loading,
} = useSubscriptionLimits();

if (loading) return <div>Loading...</div>;

return (
<div className="grid grid-cols-3 gap-4">
<div>
<p className="font-semibold">Bookings</p>
<p className="text-2xl">{bookingUsed}/{bookingLimit}</p>
<p className="text-sm text-gray-600">{bookingRemaining} remaining</p>
</div>

      <div>
        <p className="font-semibold">Services</p>
        <p className="text-2xl">{serviceUsed}/{serviceLimit}</p>
        <p className="text-sm text-gray-600">{serviceRemaining} remaining</p>
      </div>

      <div>
        <p className="font-semibold">Staff</p>
        <p className="text-2xl">{staffUsed}/{staffLimit}</p>
        <p className="text-sm text-gray-600">{staffRemaining} remaining</p>
      </div>
    </div>

);
}

// ============================================
// Example 6: Conditional rendering based on limits
// ============================================
export function AddServiceButtonExample() {
const { serviceRemaining, loading } = useSubscriptionLimits();
const [showUpgrade, setShowUpgrade] = useState(false);

const handleAddService = async () => {
if (serviceRemaining <= 0) {
setShowUpgrade(true);
return;
}

    // Proceed with adding service
    console.log("Adding new service...");

};

return (
<>
<button
onClick={handleAddService}
disabled={loading || serviceRemaining <= 0}
className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50" >
Add Service
</button>

      {serviceRemaining > 0 && (
        <p className="text-sm text-gray-600 mt-2">
          {serviceRemaining} more services available
        </p>
      )}

      {serviceRemaining <= 0 && (
        <p className="text-sm text-orange-600 mt-2">
          Service limit reached. Upgrade to add more.
        </p>
      )}

      {showUpgrade && (
        <UpgradePrompt
          currentPlan="STARTER"
          limitType="services"
          onClose={() => setShowUpgrade(false)}
        />
      )}
    </>

);
}

// ============================================
// Example 7: Feature flag system for UI
// ============================================
export function FeatureFlagExample() {
const hasAnalytics = useFeatureAccess("advancedAnalytics");
const hasLoyalty = useFeatureAccess("loyaltyPrograms");
const hasCRM = useFeatureAccess("customerAnalytics");

return (
<div className="space-y-4">
{/_ Analytics section - only show if feature enabled _/}
{hasAnalytics && (
<section className="p-4 border rounded-lg">
<h3>Advanced Analytics</h3>
{/_ Your analytics UI _/}
</section>
)}

      {/* Loyalty programs - only show if feature enabled */}
      {hasLoyalty && (
        <section className="p-4 border rounded-lg">
          <h3>Loyalty Programs</h3>
          {/* Your loyalty UI */}
        </section>
      )}

      {/* Customer Analytics - only show if feature enabled */}
      {hasCRM && (
        <section className="p-4 border rounded-lg">
          <h3>Customer Analytics</h3>
          {/* Your CRM UI */}
        </section>
      )}

      {/* Show upgrade prompt if none of the features are enabled */}
      {!hasAnalytics && !hasLoyalty && !hasCRM && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="mb-3">Unlock advanced features with a paid plan</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            View Plans
          </button>
        </div>
      )}
    </div>

);
}

// ============================================
// Example 8: Error handling when creating service
// ============================================
export async function handleCreateService(
salonSlug: string,
serviceData: any,
token: string,
) {
try {
const response = await fetch(`/api/salons/${salonSlug}/services`, {
method: "POST",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${token}`,
},
body: JSON.stringify(serviceData),
});

    const data = await response.json();

    // Service creation failed due to subscription limit
    if (response.status === 403) {
      return {
        success: false,
        error: data.error,
        reason: "LIMIT_REACHED",
        // Show upgrade prompt
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: data.error,
        reason: "ERROR",
      };
    }

    return {
      success: true,
      service: data.service,
    };

} catch (error) {
return {
success: false,
error: error instanceof Error ? error.message : "Unknown error",
reason: "NETWORK_ERROR",
};
}
}

// ============================================
// Example 9: Displaying subscription info on settings
// ============================================
import { useSubscriptionInfo } from "@/hooks/use-subscription";

export function SubscriptionSettingsExample() {
const { subscriptionInfo, loading, error } = useSubscriptionInfo();

if (loading) return <div>Loading subscription...</div>;
if (error) return <div className="text-red-600">Error: {error}</div>;
if (!subscriptionInfo) return <div>No subscription found</div>;

const { subscription, capacity, limits } = subscriptionInfo;

return (
<div className="space-y-6">
<div>
<h2 className="text-xl font-bold mb-4">Your Subscription</h2>
<div className="grid grid-cols-2 gap-4">
<div className="p-4 bg-gray-50 rounded-lg">
<p className="text-gray-600">Current Plan</p>
<p className="text-2xl font-bold">{subscription.plan}</p>
</div>
<div className="p-4 bg-gray-50 rounded-lg">
<p className="text-gray-600">Status</p>
<p className="text-2xl font-bold capitalize">{subscription.status}</p>
</div>
</div>
</div>

      <div>
        <h3 className="font-bold mb-4">Current Usage</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span>Bookings</span>
              <span>{limits.used} / {limits.limit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(limits.used / limits.limit) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>Services</span>
              <span>
                {capacity.services.used} / {capacity.services.limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{
                  width: `${
                    (capacity.services.used / capacity.services.limit) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>Staff</span>
              <span>{capacity.staff.used} / {capacity.staff.limit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${
                    (capacity.staff.used / capacity.staff.limit) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg">
          Upgrade Plan
        </button>
      </div>
    </div>

);
}
