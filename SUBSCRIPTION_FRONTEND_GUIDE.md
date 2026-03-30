# Subscription Frontend Integration Guide

## 📋 Quick Start

### Step 1: Display Subscription Status on Dashboard

```tsx
import { SubscriptionStatus } from "@/components/subscription/subscription-status";

export default function Dashboard() {
  return (
    <>
      <h1>Welcome to your Dashboard</h1>
      <SubscriptionStatus />
    </>
  );
}
```

### Step 2: Show Available Features in Settings

```tsx
import { FeatureAccess } from "@/components/subscription/feature-access";

export default function SettingsPage() {
  return (
    <>
      <h1>Settings</h1>
      <FeatureAccess />
    </>
  );
}
```

### Step 3: Create Upgrade/Plans Page

```tsx
import { PlanComparisonPage } from "@/components/subscription/upgrade-prompt";

export default function PlansPage() {
  return <PlanComparisonPage currentPlan="STARTER" />;
}
```

## 🎯 Using Hooks in Components

### Check Subscription Limits

```tsx
import { useSubscriptionLimits } from "@/hooks/use-subscription";

export function UsageWidget() {
  const {
    bookingLimit,
    bookingUsed,
    bookingRemaining,
    serviceLimit,
    serviceUsed,
    loading,
  } = useSubscriptionLimits();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <p>
        Bookings: {bookingUsed}/{bookingLimit}
      </p>
      <p>Remaining: {bookingRemaining}</p>
    </div>
  );
}
```

### Check Feature Access

```tsx
import { useFeatureAccess } from "@/hooks/use-subscription";

export function NotificationSettings() {
  const hasWhatsApp = useFeatureAccess("whatsappNotifications");
  const hasEmail = useFeatureAccess("emailNotifications");

  return (
    <div>
      {hasWhatsApp && <WhatsAppSettings />}
      {hasEmail && <EmailSettings />}

      {!hasWhatsApp && !hasEmail && <p>Upgrade to enable notifications</p>}
    </div>
  );
}
```

### Get Full Subscription Info

```tsx
import { useSubscriptionInfo } from "@/hooks/use-subscription";

export function SubscriptionDetails() {
  const { subscriptionInfo, loading, error } = useSubscriptionInfo();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Current Plan: {subscriptionInfo.subscription.plan}</h2>
      <p>Status: {subscriptionInfo.subscription.status}</p>

      {/* Display all features */}
      {Object.entries(subscriptionInfo.features).map(([key, enabled]) => (
        <div key={key}>
          <span>
            {key}: {enabled ? "✓" : "✗"}
          </span>
        </div>
      ))}
    </div>
  );
}
```

## 🛠️ Common Patterns

### Disable Button When Limit Reached

```tsx
export function AddServiceButton() {
  const { serviceRemaining } = useSubscriptionLimits();

  return (
    <button
      onClick={handleAddService}
      disabled={serviceRemaining <= 0}
      title={serviceRemaining <= 0 ? "Service limit reached" : ""}
    >
      Add Service
    </button>
  );
}
```

### Show Upgrade Prompt When Limit Hit

```tsx
import { UpgradePrompt } from "@/components/subscription/upgrade-prompt";
import { useState } from "react";

export function CreateBooking() {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { bookingRemaining } = useSubscriptionLimits();

  const handleCreateBooking = () => {
    if (bookingRemaining <= 0) {
      setShowUpgrade(true);
      return;
    }
    // Create booking...
  };

  return (
    <>
      <button onClick={handleCreateBooking}>Create Booking</button>

      {showUpgrade && (
        <UpgradePrompt
          currentPlan="STARTER"
          limitType="bookings"
          onClose={() => setShowUpgrade(false)}
        />
      )}
    </>
  );
}
```

### Conditional Feature Sections

```tsx
export function Dashboard() {
  const hasAdvancedAnalytics = useFeatureAccess("advancedAnalytics");
  const hasLoyaltyPrograms = useFeatureAccess("loyaltyPrograms");
  const hasCustomReports = useFeatureAccess("customReports");

  return (
    <div className="space-y-6">
      {hasAdvancedAnalytics && <AnalyticsSection />}
      {hasLoyaltyPrograms && <LoyaltySection />}
      {hasCustomReports && <ReportsSection />}

      {!hasAdvancedAnalytics && (
        <FeatureUnavailableCard feature="Advanced Analytics" />
      )}
    </div>
  );
}
```

### Progress Towards Limits

```tsx
export function ResourceWarnings() {
  const {
    bookingLimit,
    bookingUsed,
    serviceLimit,
    serviceUsed,
    staffLimit,
    staffUsed,
  } = useSubscriptionLimits();

  const isBookingAtLimit = bookingUsed / bookingLimit >= 0.9;
  const isServiceAtLimit = serviceUsed / serviceLimit >= 0.9;
  const isStaffAtLimit = staffUsed / staffLimit >= 0.9;

  return (
    <div>
      {isBookingAtLimit && (
        <WarningCard
          title="Bookings Limit Approaching"
          message={`You have ${bookingLimit - bookingUsed} bookings left this month`}
        />
      )}

      {isServiceAtLimit && (
        <WarningCard
          title="Services Limit Approaching"
          message={`${serviceLimit - serviceUsed} services remaining`}
        />
      )}

      {isStaffAtLimit && (
        <WarningCard
          title="Staff Limit Approaching"
          message={`${staffLimit - staffUsed} staff slots remaining`}
        />
      )}
    </div>
  );
}
```

## 🎨 Component Usage Details

### SubscriptionStatus Component

Displays overall subscription status with usage cards.

**Features:**

- Plan name and status
- Usage progress bars for bookings, services, staff
- Warning indicators for limits approaching 80%
- Billing period information

**Usage:**

```tsx
<SubscriptionStatus />
```

### FeatureAccess Component

Shows all available features by category with checkmarks.

**Categories:**

- Communication
- Analytics
- Business Tools
- Integration & Customization
- Support & Account

**Usage:**

```tsx
<FeatureAccess salonId={salonId} />
```

### UpgradePrompt Component

Modal dialog showing upgrade options when limit is hit.

**Props:**

- `currentPlan`: Current subscription plan
- `limitType`: Type of limit ("bookings" | "services" | "staff")
- `onClose?`: Callback when closed

**Usage:**

```tsx
<UpgradePrompt
  currentPlan="STARTER"
  limitType="bookings"
  onClose={() => setShowModal(false)}
/>
```

### PlanComparisonPage Component

Full-page plan comparison with upgrade buttons.

**Props:**

- `currentPlan?`: Current subscription plan

**Usage:**

```tsx
<PlanComparisonPage currentPlan="STARTER" />
```

## 🔧 Integration Checklist

- [ ] Add `<SubscriptionStatus />` to dashboard
- [ ] Add `<FeatureAccess />` to settings page
- [ ] Create `/plans` page with `<PlanComparisonPage />`
- [ ] Use `useFeatureAccess()` to conditionally render features
- [ ] Use `useSubscriptionLimits()` in create/add buttons
- [ ] Add `<UpgradePrompt />` when limits are hit
- [ ] Add warning cards when approaching limits
- [ ] Disable UI elements when limits are reached
- [ ] Handle API errors for subscription limits (403 status)

## 📝 API Integration

When creating bookings, services, or staff:

```tsx
const response = await fetch("/api/bookings", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

if (response.status === 403) {
  // Subscription limit exceeded
  const error = await response.json();
  showUpgradePrompt(error.reason);
}
```

## 🎯 Authorization

All components require authentication token:

```tsx
// Ensure token is in localStorage or sessionStorage
localStorage.setItem("auth_token", token);
// Components will automatically use it
```

## 🚀 Performance

- Hooks cache subscription data
- Components only fetch once on mount
- Manual refresh available via return value
- Minimal re-renders on data fetch

## 📊 Supported Features in useFeatureAccess

```typescript
"whatsappNotifications" |
  "emailNotifications" |
  "smsNotifications" |
  "autoBooking" |
  "customBranding" |
  "advancedAnalytics" |
  "revenueTracking" |
  "customerAnalytics" |
  "staffPerformanceMetrics" |
  "discountsAndCoupons" |
  "loyaltyPrograms" |
  "googleCalendarSync" |
  "googleBusinessProfile" |
  "waitlistManagement" |
  "packageBundles" |
  "giftCards" |
  "membershipPlans" |
  "customDomain" |
  "apiAccess" |
  "zapierIntegration" |
  "prioritySupport" |
  "customReports" |
  "bulkImport" |
  "multiUserAccounts";
```

## 🐛 Troubleshooting

### Components showing loading forever

- Check that auth token is in localStorage with key "auth_token"
- Verify API endpoint `/api/salon-admin/subscription-info` is accessible
- Check browser network tab for 401 errors

### Features not showing as available

- Verify subscription status is "ACTIVE"
- Check plan tier in database
- Inspect API response in browser dev tools

### Progress bars not updating

- Refresh page to clear cache
- Check API is returning correct usage numbers
- Verify booking count is being tracked correctly
