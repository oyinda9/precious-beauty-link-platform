# 📚 Subscription System Documentation Index

Welcome! Here's everything you need to know about the subscription system that's just been implemented.

## 🗺️ Where to Start?

### Choose Your Path:

1. **I want to see a quick overview** → Start with [SUBSCRIPTION_QUICK_REFERENCE.md](SUBSCRIPTION_QUICK_REFERENCE.md)
2. **I want step-by-step integration** → Go to [SUBSCRIPTION_FRONTEND_GUIDE.md](SUBSCRIPTION_FRONTEND_GUIDE.md)
3. **I want code examples** → Check [SUBSCRIPTION_INTEGRATION_EXAMPLES.md](SUBSCRIPTION_INTEGRATION_EXAMPLES.md)
4. **Something's not working** → See [SUBSCRIPTION_TROUBLESHOOTING.md](SUBSCRIPTION_TROUBLESHOOTING.md)
5. **I want technical details** → Read [SUBSCRIPTION_ENFORCEMENT_GUIDE.md](SUBSCRIPTION_ENFORCEMENT_GUIDE.md)

---

## 🎯 What Was Built?

### Backend (Already Done ✅)

- **Payment Gateway**: Paystack integration for subscription payments
- **Enforcement System**: Automatic limits on services, staff, bookings per plan
- **Feature Flags**: 24+ features configured for all 5 subscription tiers
- **Usage Tracking**: Monitors resource usage and monthly booking resets
- **API Endpoints**: Protected endpoints for subscription info and resource management

### Frontend (Components Ready ✅)

- **SubscriptionStatus Component**: Dashboard widget showing plan and usage
- **FeatureAccess Component**: Display available features by category
- **UpgradePrompt Component**: Modal for plan comparison and upgrades
- **React Hooks**: Easy-to-use data access for components

### Database (Migrated ✅)

- Subscription model with reference field
- Usage tracking via existing models (Service, Booking, StaffMember)
- Monthly period tracking for booking limits

---

## 📊 The 5 Plans

```
FREE → STARTER → STANDARD → GROWTH → PREMIUM
₦0     ₦5K      ₦10K       ₦20K     ₦30K/month
```

Each plan has:

- Monthly booking limits
- Service/staff/customer caps
- Feature access (WhatsApp, Analytics, Custom Domain, API, etc.)
- Support tier

See [SUBSCRIPTION_QUICK_REFERENCE.md](SUBSCRIPTION_QUICK_REFERENCE.md#-subscription-plans) for full feature matrix.

---

## 🚀 3-Step Integration

### Step 1: Add Dashboard Widget

```tsx
// In app/salon-admin/dashboard/page.tsx
import { SubscriptionStatus } from "@/components/subscription/subscription-status";

<SubscriptionStatus />;
```

### Step 2: Show Available Features

```tsx
// In app/salon-admin/settings/page.tsx
import { FeatureAccess } from "@/components/subscription/feature-access";

<FeatureAccess />;
```

### Step 3: Implement Plan Comparison

```tsx
// Create app/salon-admin/plans/page.tsx
import { PlanComparisonPage } from "@/components/subscription/upgrade-prompt";

export default function PlansPage() {
  return <PlanComparisonPage currentPlan="STARTER" />;
}
```

That's it! ✨

---

## 🧠 Available Hooks

### useSubscriptionInfo()

Get full subscription details including limits and features.

```tsx
const { subscriptionInfo, loading, error } = useSubscriptionInfo();
// subscriptionInfo.subscription.plan
// subscriptionInfo.capacity.services.used
// subscriptionInfo.features.whatsappNotifications
```

### useSubscriptionLimits()

Get all limits with convenient shorthand properties.

```tsx
const {
  bookingLimit,
  bookingUsed,
  bookingRemaining,
  serviceLimit,
  serviceUsed,
  serviceRemaining,
  staffLimit,
  staffUsed,
  staffRemaining,
} = useSubscriptionLimits();
```

### useFeatureAccess(featureName)

Check if a single feature is available.

```tsx
const hasWhatsApp = useFeatureAccess("whatsappNotifications");
```

For complete hook reference, see [SUBSCRIPTION_FRONTEND_GUIDE.md#-using-hooks-in-components).

---

## 🔌 API Quick Reference

### GET /api/salon-admin/subscription-info

Returns subscription status, usage, limits, and features.

```
Status 200 (with data) | 401 (unauthorized) | 403 (forbidden)
```

### POST /api/bookings

Creates booking with automatic limit enforcement.

```
Returns 403 if limit exceeded: { error: "...", remaining: 5 }
```

### POST /api/salons/{slug}/services

Creates service with automatic limit enforcement.

```
Returns 403 if limit exceeded: { error: "...", reason: "LIMIT_REACHED" }
```

### POST /api/salon-admin/staff

Creates staff with automatic limit enforcement.

```
Returns 403 if limit exceeded: { error: "..." }
```

---

## 💡 Common Integration Patterns

### Disable Button When Limit Reached

```tsx
const { serviceRemaining } = useSubscriptionLimits();
<button disabled={serviceRemaining <= 0}>Add Service</button>;
```

### Show Warning at 80% Capacity

```tsx
{
  percentUsed >= 80 && <CapacityWarning />;
}
```

### Conditionally Show Feature Sections

```tsx
{
  useFeatureAccess("advancedAnalytics") && <AnalyticsTab />;
}
```

### Show Upgrade Prompt on Limit Hit

```tsx
if (response.status === 403) {
  setShowUpgradeModal(true);
}
```

See [SUBSCRIPTION_INTEGRATION_EXAMPLES.md](SUBSCRIPTION_INTEGRATION_EXAMPLES.md) for more patterns.

---

## 📁 Key Files

### Frontend Components

| File                                              | Purpose               |
| ------------------------------------------------- | --------------------- |
| `components/subscription/subscription-status.tsx` | Dashboard widget      |
| `components/subscription/feature-access.tsx`      | Feature display       |
| `components/subscription/upgrade-prompt.tsx`      | Plan comparison modal |
| `hooks/use-subscription.ts`                       | React hooks           |

### Backend Enforcement

| File                                             | Purpose               |
| ------------------------------------------------ | --------------------- |
| `lib/subscription-features.ts`                   | Feature configuration |
| `lib/subscription-enforcement.ts`                | Enforcement utilities |
| `app/api/salon-admin/subscription-info/route.ts` | Info endpoint         |
| `app/api/salon-admin/staff/route.ts`             | Staff creation        |
| `app/api/salons/[slug]/services/route.ts`        | Service creation      |
| `app/api/bookings/route.ts`                      | Booking creation      |

### Database

| File                   | Status                                  |
| ---------------------- | --------------------------------------- |
| `prisma/schema.prisma` | Updated with reference field            |
| **Migrations**         | All applied via `prisma migrate deploy` |

---

## ✅ Pre-Integration Checklist

Before adding components to your pages:

- [ ] Auth token is stored in localStorage as `"auth_token"`
- [ ] `/api/salon-admin/subscription-info` endpoint is accessible
- [ ] Your salon has an active subscription record
- [ ] All API endpoints are returning correct data
- [ ] Development server is running

---

## 🎓 Documentation Map

Each document covers different aspects:

### For Overview

📄 **SUBSCRIPTION_QUICK_REFERENCE.md** (5 min read)

- What's implemented
- All 5 plans overview
- API endpoints summary
- Common tasks

### For Implementation

📄 **SUBSCRIPTION_FRONTEND_GUIDE.md** (15 min read)

- Quick start steps
- Using hooks
- Common patterns
- Integration checklist

### For Code Examples

📄 **SUBSCRIPTION_INTEGRATION_EXAMPLES.md** (20 min read)

- Real component examples
- 9+ integration patterns
- Error handling
- Feature flags system

### For Troubleshooting

📄 **SUBSCRIPTION_TROUBLESHOOTING.md** (When needed)

- 10 common issues
- Detailed solutions
- Debug checklist
- Verification steps

### For Deep Dive

📄 **SUBSCRIPTION_ENFORCEMENT_GUIDE.md** (30 min read)

- Complete architecture
- Database schema details
- Enforcement logic
- Implementation checklist

---

## 🚨 If Something's Wrong

1. **Something not loading?** → Check [Troubleshooting #1](SUBSCRIPTION_TROUBLESHOOTING.md#1-usesubscriptioninfo-not-working---returns-loading-forever)
2. **Features disabled?** → Check [Troubleshooting #2](SUBSCRIPTION_TROUBLESHOOTING.md#2-features-showing-as-disabled-even-though-i-have-the-plan)
3. **Limits not working?** → Check [Troubleshooting #3](SUBSCRIPTION_TROUBLESHOOTING.md#3-limits-not-enforcing---can-create-unlimited-services)
4. **API returning 401?** → Check [Troubleshooting #8](SUBSCRIPTION_TROUBLESHOOTING.md#8-api-returns-401-when-calling-subscription-endpoints)
5. **Run debug checklist** → [Full checklist](SUBSCRIPTION_TROUBLESHOOTING.md#-debug-checklist)

---

## 🎯 Next Steps (Priority Order)

### 🔴 High Priority

1. Add `<SubscriptionStatus />` to `app/salon-admin/dashboard/page.tsx`
2. Test hooks in a component to verify data loading
3. Add limit checks to create buttons

### 🟡 Medium Priority

4. Add `<FeatureAccess />` to settings page
5. Implement `<UpgradePrompt />` when limits hit
6. Create `/plans` page with `<PlanComparisonPage />`

### 🟢 Low Priority

7. Implement upgrade payment flow
8. Add feature visibility toggles throughout UI
9. Implement notification system (feature flags ready)

---

## 💻 Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (via Supabase or Railway)
- **Payments**: Paystack (test credentials active)
- **UI Components**: Radix UI / shadcn/ui

---

## 📞 Quick Help

**Need to check subscription in database?**

```bash
npx prisma studio
# Navigate to Subscription table
```

**Need to see API response?**
Open browser DevTools → Network tab → `/api/salon-admin/subscription-info`

**Need to reset a salon's subscription?**

```sql
UPDATE "Subscription"
SET plan = 'STARTER', status = 'ACTIVE'
WHERE "salonId" = '{salonId}';
```

---

## 🎉 You're Ready!

The subscription system is **fully implemented** and ready to integrate. All backend enforcement is active. Start with the 3-step integration above and refer to the appropriate documentation as needed.

**Questions?** Check the documentation index above, then refer to troubleshooting guide for specific issues.

**Everything working?** Great! Here's what happens next:

- Customers see their plan and usage
- Features unlock based on plan tier
- Trying to exceed limits shows upgrade prompt
- Monthly booking count resets automatically
- Payment gateway ready for upgrades

Let me know if you need anything else! 🚀
