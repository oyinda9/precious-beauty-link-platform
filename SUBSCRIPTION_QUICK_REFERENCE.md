# 📚 Subscription System - Quick Reference

## 🎯 What's Implemented

### ✅ Backend

- [x] Paystack payment gateway (initialize, webhook, verify)
- [x] Subscription enforcement on service/booking/staff creation
- [x] Feature flags for all 5 plans
- [x] Usage tracking and limit checking
- [x] Monthly booking reset

### ✅ Frontend Components

- [x] Subscription status dashboard (progress bars)
- [x] Feature access display (by category)
- [x] Plan comparison modal
- [x] Upgrade prompt dialog

### ✅ React Hooks

- [x] `useSubscriptionInfo()` - Full subscription details
- [x] `useFeatureAccess(feature)` - Single feature check
- [x] `useSubscriptionLimits()` - All limits with helpers

### ✅ Database

- [x] Subscription model with `reference` field
- [x] Migration deployed

---

## 🚀 How to Use

### 1️⃣ Show Subscription Status on Dashboard

```tsx
import { SubscriptionStatus } from "@/components/subscription/subscription-status";

// In your dashboard page/component:
<SubscriptionStatus />;
```

### 2️⃣ Check if Feature is Available

```tsx
import { useFeatureAccess } from "@/hooks/use-subscription";

const hasWhatsApp = useFeatureAccess("whatsappNotifications");
if (!hasWhatsApp) {
  return <UpgradePlanCard />;
}
```

### 3️⃣ Check Remaining Capacity

```tsx
import { useSubscriptionLimits } from "@/hooks/use-subscription";

const { bookingRemaining, serviceRemaining, staffRemaining } =
  useSubscriptionLimits();

if (bookingRemaining <= 0) {
  // Show upgrade prompt
}
```

### 4️⃣ Show Plan Comparison

```tsx
import { PlanComparisonPage } from "@/components/subscription/upgrade-prompt";

<PlanComparisonPage currentPlan="STARTER" />;
```

---

## 📊 Subscription Plans

| Feature            | FREE | STARTER | STANDARD  | GROWTH    | PREMIUM   |
| ------------------ | ---- | ------- | --------- | --------- | --------- |
| **Price**          | Free | ₦5,000  | ₦10,000   | ₦20,000   | ₦30,000   |
| Monthly Bookings   | 10   | 100     | Unlimited | Unlimited | Unlimited |
| Services           | 5    | 20      | 50        | 100       | Unlimited |
| Staff              | 1    | 3       | 5         | 10        | Unlimited |
| Customers          | 50   | 500     | Unlimited | Unlimited | Unlimited |
| WhatsApp           | ✗    | ✓       | ✓         | ✓         | ✓         |
| Advanced Analytics | ✗    | ✗       | ✓         | ✓         | ✓         |
| Custom Domain      | ✗    | ✗       | ✗         | ✓         | ✓         |
| API Access         | ✗    | ✗       | ✗         | ✗         | ✓         |

---

## 🔌 API Endpoints

### Get Subscription Info (Protected)

```
GET /api/salon-admin/subscription-info
Authorization: Bearer {token}

Response: {
  subscription: { plan, status, currentPeriodStart, currentPeriodEnd },
  capacity: {
    bookings: { used, limit },
    services: { used, limit },
    staff: { used, limit },
    customers: { used, limit }
  },
  limits: { used, limit },
  features: { [featureName]: boolean, ... }
}
```

### Create Service (Protected)

```
POST /api/salons/{slug}/services

Validation: Returns 403 if service limit reached
Error: { error: "Service limit reached", reason: "LIMIT_REACHED" }
```

### Create Booking (Protected)

```
POST /api/bookings

Validation: Returns 403 if booking limit reached
Error: { error: "Monthly booking limit reached", remaining: 5 }
```

### Add Staff (Protected)

```
POST /api/salon-admin/staff

Validation: Returns 403 if staff limit reached
Error: { error: "Staff limit reached" }
```

---

## 🛠️ Common Tasks

### ❌ Disable Button When Limit Reached

```tsx
const { serviceRemaining } = useSubscriptionLimits();

<button disabled={serviceRemaining <= 0}>Add Service</button>;
```

### ⚠️ Show Warning at 80% Capacity

```tsx
const { serviceLimit, serviceUsed } = useSubscriptionLimits();
const percentUsed = (serviceUsed / serviceLimit) * 100;

{
  percentUsed >= 80 && <CapacityWarning />;
}
```

### 🔄 Show Upgrade Prompt

```tsx
import { UpgradePrompt } from "@/components/subscription/upgrade-prompt";
import { useState } from "react";

const [showUpgrade, setShowUpgrade] = useState(false);

{
  showUpgrade && (
    <UpgradePrompt
      currentPlan="STARTER"
      limitType="bookings"
      onClose={() => setShowUpgrade(false)}
    />
  );
}
```

### 🎯 Conditionally Show Features

```tsx
const hasAnalytics = useFeatureAccess("advancedAnalytics");

{
  hasAnalytics && <AnalyticsDashboard />;
}
{
  !hasAnalytics && <UpgradeSuggestion feature="advanced analytics" />;
}
```

---

## 📂 Key Files

### Components

- `components/subscription/subscription-status.tsx` - Dashboard widget
- `components/subscription/feature-access.tsx` - Feature list
- `components/subscription/upgrade-prompt.tsx` - Modal & page

### Hooks

- `hooks/use-subscription.ts` - All subscription hooks

### Backend

- `lib/subscription-features.ts` - Feature configuration
- `lib/subscription-enforcement.ts` - Enforcement utilities
- `app/api/salon-admin/subscription-info/route.ts` - API
- `app/api/salon-admin/staff/route.ts` - Staff management
- `app/api/salons/[slug]/services/route.ts` - Service creation
- `app/api/bookings/route.ts` - Booking creation

---

## 🎓 Features by Plan (Full Matrix)

**COMMUNICATION**

- WhatsApp Notifications: STARTER+
- Email Notifications: STARTER+
- SMS Notifications: STARTER+
- Auto Booking: GROWTH+

**ANALYTICS**

- Advanced Analytics: STANDARD+
- Revenue Tracking: STANDARD+
- Customer Analytics: STANDARD+
- Staff Performance Metrics: STANDARD+
- Custom Reports: PREMIUM

**BUSINESS TOOLS**

- Discounts & Coupons: STARTER+
- Loyalty Programs: STARTER+
- Waitlist Management: STARTER+
- Package Bundles: STANDARD+
- Gift Cards: GROWTH+
- Membership Plans: GROWTH+

**INTEGRATION & CUSTOMIZATION**

- Custom Branding: STANDARD+
- Google Calendar Sync: STARTER+
- Google Business Profile: STARTER+
- Custom Domain: GROWTH+
- API Access: PREMIUM
- Zapier Integration: PREMIUM

**SUPPORT & ACCOUNT**

- Priority Support: GROWTH+
- Multi-User Accounts: STARTER+
- Bulk Import: PREMIUM

---

## 🔐 Security

All endpoints require:

- Valid auth token in `Authorization` header
- Verify user is salon admin
- Check subscription status is ACTIVE
- Cross-origin checks

---

## 🐛 Common Issues & Solutions

| Issue                           | Solution                                               |
| ------------------------------- | ------------------------------------------------------ |
| "Auth token not found"          | Ensure token stored in localStorage as "auth_token"    |
| Components show loading forever | Verify /api/salon-admin/subscription-info accessible   |
| Features showing as disabled    | Check subscription.status === "ACTIVE"                 |
| Limits not enforcing            | Verify booking count tracked, API called before create |
| UI not updating                 | Clear browser cache, refresh page                      |

---

## 📝 Next Steps

1. **Add SubscriptionStatus to dashboard**

   ```
   app/salon-admin/dashboard/page.tsx → import + render SubscriptionStatus
   ```

2. **Add FeatureAccess to settings**

   ```
   app/salon-admin/settings/page.tsx → import + render FeatureAccess
   ```

3. **Create upgrade flow**

   ```
   Hook payment system to UpgradePrompt "Upgrade Now" button
   ```

4. **Conditional feature rendering**

   ```
   Use useFeatureAccess() to wrap feature sections
   ```

5. **Implement notifications**
   ```
   WhatsApp, Email, SMS methods checking feature flags
   ```

---

## 🎉 You're All Set!

The subscription system is **fully functional** and ready to integrate into existing pages. All backend enforcement is active. Start by adding `<SubscriptionStatus />` to your dashboard!
