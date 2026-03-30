# 🔧 Subscription System - Troubleshooting Guide

## ❌ Common Issues & Solutions

### 1. "useSubscriptionInfo not working - returns loading forever"

**Symptoms:**

- Hook always shows `loading: true`
- No error message
- Component doesn't render

**Causes:**

- Auth token not found in localStorage
- Token is invalid/expired
- API endpoint not accessible
- CORS issues

**Solutions:**

```tsx
// Check 1: Verify auth token exists
console.log("Token:", localStorage.getItem("auth_token"));

// Check 2: Test API endpoint directly
fetch("/api/salon-admin/subscription-info", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
  },
})
  .then((r) => r.json())
  .then(console.log);

// Check 3: Make sure token is set after login
// In your login page/component:
const token = response.data.token;
localStorage.setItem("auth_token", token);
```

**Verification:**

- Open browser DevTools → Application → Storage → localStorage
- Should see "auth_token" entry with JWT value
- Token shouldn't start with "undefined"

---

### 2. "Features showing as disabled even though I have the plan"

**Symptoms:**

- `useFeatureAccess()` returns false for available features
- UI sections hidden that should be visible

**Causes:**

- Subscription status is not "ACTIVE"
- Database subscription record doesn't exist
- Plan tier not set correctly

**Solutions:**

```tsx
// Debug: Check subscription details
const { subscriptionInfo } = useSubscriptionInfo();
console.log("Plan:", subscriptionInfo.subscription.plan);
console.log("Status:", subscriptionInfo.subscription.status);
console.log("Features:", subscriptionInfo.features);

// Verify in database:
// SELECT * FROM "Subscription" WHERE "salonId" = {yourSalonId};
// Check: plan is one of [FREE, STARTER, STANDARD, GROWTH, PREMIUM]
// Check: status is "ACTIVE"
```

**Manual Database Fix (if needed):**

```sql
UPDATE "Subscription"
SET status = 'ACTIVE', plan = 'STARTER'
WHERE id = '{subscriptionId}';
```

---

### 3. "Limits not enforcing - can create unlimited services"

**Symptoms:**

- Can create more services than plan allows
- No 403 error when hitting limit
- Service count not tracked

**Causes:**

- API endpoint not updated with enforcement
- Database not tracking service count
- Request not reaching enforcement check

**Solutions:**

```tsx
// Verify API is checking limits
// In POST /api/salons/[slug]/services route.ts:
// Should have: const canCreate = await canCreateService(salonId);

// Check service count in database
// SELECT COUNT(*) FROM "Service" WHERE "salonId" = {salonId};

// Test API directly with limit-exceeding request
const response = await fetch("/api/salons/slug/services", {
  method: "POST",
  body: JSON.stringify({ name: "Test" }),
});
console.log("Status:", response.status); // Should be 403 when limit hit
```

**Verify Implementation:**

- Open `app/api/salons/[slug]/services/route.ts`
- Should have this code:

```tsx
import { canCreateService } from "@/lib/subscription-enforcement";

export async function POST(request: Request) {
  // ... existing validation ...

  const canCreate = await canCreateService(salonId);
  if (!canCreate.allowed) {
    return Response.json({ error: canCreate.reason }, { status: 403 });
  }

  // ... create service ...
}
```

---

### 4. "useSubscriptionLimits shows all limits as 999999"

**Symptoms:**

- All `limit` values show as 999999 (unlimited)
- `serviceLimit`, `bookingLimit` all very high
- Should be much smaller for lower plans

**Causes:**

- Subscription plan is PREMIUM (all 999999)
- Plan field not correctly saved in database
- getPlanLimit() returning default unlimited

**Solutions:**

```tsx
// Check what plan the subscription actually is
const { plan } = useSubscriptionLimits();
console.log("Current plan:", plan);

// If showing wrong plan, verify in database:
// SELECT plan, status FROM "Subscription" WHERE "salonId" = {id};

// Check getPlanLimit function
// Open lib/subscription-features.ts
// Verify plan passed to getPlanLimit() is correct
```

---

### 5. "SubscriptionStatus component crashes with 'Cannot read property of undefined'"

**Symptoms:**

- Component throws error
- Console shows "Cannot read property 'plan' of undefined"
- Error appears: "subscription.json is not a function"

**Causes:**

- useSubscriptionInfo() returns null data
- Component assumes data exists before checking loading state
- API error response not handled

**Solutions:**

```tsx
// Wrap with null check
import { SubscriptionStatus } from "@/components/subscription/subscription-status";
import { useSubscriptionInfo } from "@/hooks/use-subscription";

export function DashboardWithError() {
  const { subscriptionInfo, loading, error } = useSubscriptionInfo();

  if (loading) return <div>Loading subscription...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!subscriptionInfo) return <div>No subscription found</div>;

  return <SubscriptionStatus />;
}
```

---

### 6. "UpgradePrompt modal not showing when limit reached"

**Symptoms:**

- Button disabled but modal doesn't appear
- `showUpgrade` state not toggling
- Modal imports not working

**Causes:**

- State management issue
- Component not imported correctly
- Missing useState hook

**Solutions:**

```tsx
import { UpgradePrompt } from "@/components/subscription/upgrade-prompt";
import { useState } from "react"; // ⭐ Make sure this is imported!

export function MyComponent() {
  const [showUpgrade, setShowUpgrade] = useState(false); // Initialize!

  return (
    <>
      <button onClick={() => setShowUpgrade(true)}>Open Upgrade</button>

      {/* Conditional render requires state to be true */}
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

---

### 7. "useFeatureAccess always returns false"

**Symptoms:**

- Even premium features return false
- Feature flags not working
- All sections show as "Upgrade to enable"

**Causes:**

- Subscription not found
- Features not configured in subscription-features.ts
- Feature name doesn't match configuration

**Solutions:**

```tsx
// Check subscription details first
const { subscriptionInfo, loading, error } = useSubscriptionInfo();

if (!subscriptionInfo) {
  console.error("No subscription found");
  return <NoSubscription />;
}

// Check feature exists in config
console.log("All features:", Object.keys(subscriptionInfo.features));

// Check specific feature
const hasWhatsApp = subscriptionInfo.features["whatsappNotifications"];
console.log("WhatsApp enabled?", hasWhatsApp);

// Proper hook usage
const result = useFeatureAccess("whatsappNotifications");
console.log("Hook result:", result); // Should be boolean
```

**Verify feature name matches:**

```tsx
// These are the EXACT feature names (case-sensitive):
"whatsappNotifications";
"emailNotifications";
"smsNotifications";
"autoBooking";
"customBranding";
"advancedAnalytics";
"revenueTracking";
"customerAnalytics";
"staffPerformanceMetrics";
"discountsAndCoupons";
"loyaltyPrograms";
"googleCalendarSync";
"googleBusinessProfile";
"waitlistManagement";
"packageBundles";
"giftCards";
"membershipPlans";
"customDomain";
"apiAccess";
"zapierIntegration";
"prioritySupport";
"customReports";
"bulkImport";
"multiUserAccounts";
```

---

### 8. "API returns 401 when calling subscription endpoints"

**Symptoms:**

- Fetch returns 401 status
- API response: `{ error: "Unauthorized" }`
- Works with some users but not others

**Causes:**

- Token not in Authorization header
- Token is invalid/expired
- User is not salon admin
- Endpoint requires different auth header format

**Solutions:**

```tsx
// Make sure token is sent correctly
const token = localStorage.getItem("auth_token");

const response = await fetch("/api/salon-admin/subscription-info", {
  method: "GET",
  headers: {
    // ⭐ Key requirement: Bearer token format
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

if (response.status === 401) {
  console.error("Invalid token:", token);
  // Redirect to login
  window.location.href = "/login";
}

// Test token validity:
console.log("Token starts with:", token?.substring(0, 20));
console.log("Has Bearer format:", token?.includes("Bearer"));
```

---

### 9. "Booking/Service creation API returns 403 unexpectedly"

**Symptoms:**

- Can't create booking/service even though limit available
- API returns: `{ error: "Service limit reached" }`
- But interface shows slots available

**Causes:**

- Database count is wrong
- Monthly booking period calc wrong
- API using stale data

**Solutions:**

```tsx
// Check database counts
// Services:
SELECT COUNT(*) FROM "Service" WHERE "salonId" = {id};

// Bookings (monthly):
SELECT COUNT(*) FROM "Booking"
WHERE "salonId" = {id}
  AND "startTime" >= CURRENT_DATE - INTERVAL '1 month'
  AND "status" != 'CANCELLED';

// Staff:
SELECT COUNT(*) FROM "StaffMember" WHERE "salonId" = {id};

// If counts seem correct, clear API cache:
// - Restart dev server
// - Clear browser cache/session storage
// - Check for cron jobs that might be updating wrong values
```

---

### 10. "Monthly booking limit not resetting"

**Symptoms:**

- Stuck at 0 bookings for month
- Or stuck at previous month's count
- `bookingRemaining` never updates

**Causes:**

- Monthly reset logic broken
- `currentPeriodEnd` not set correctly
- Booking query filtering wrong dates

**Solutions:**

```tsx
// Verify subscription period dates
const { subscriptionInfo } = useSubscriptionInfo();
const { currentPeriodStart, currentPeriodEnd } = subscriptionInfo.subscription;

console.log("Period start:", currentPeriodStart);
console.log("Period end:", currentPeriodEnd);
console.log("Today:", new Date().toISOString());

// Check if today is within period
const today = new Date();
const end = new Date(currentPeriodEnd);
const inPeriod = today <= end;
console.log("In current period?", inPeriod);

// Debug booking count query in lib/subscription-enforcement.ts:
// Should filter: startTime >= currentPeriodStart && startTime <= currentPeriodEnd
```

**Database check:**

```sql
-- See current subscription periods
SELECT "salonId", "plan", "currentPeriodStart", "currentPeriodEnd",
       "status", "createdAt" FROM "Subscription";
```

---

## 🔍 Debug Checklist

Use this when something isn't working:

```tsx
// 1. Check auth token
console.log("1. Token exists?", !!localStorage.getItem("auth_token"));

// 2. Test API endpoint
fetch("/api/salon-admin/subscription-info", {
  headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
})
  .then((r) => r.json())
  .then((d) => console.log("2. API response:", d));

// 3. Check subscription exists
const { subscriptionInfo } = useSubscriptionInfo();
console.log("3. Subscription exists?", !!subscriptionInfo);

// 4. Verify plan
console.log("4. Plan:", subscriptionInfo?.subscription.plan);

// 5. Check status
console.log("5. Status:", subscriptionInfo?.subscription.status);

// 6. Test feature flag
console.log(
  "6. WhatsApp enabled?",
  subscriptionInfo?.features.whatsappNotifications,
);

// 7. Check limits
console.log("7. Service limit:", subscriptionInfo?.capacity.services.limit);
console.log("7. Service used:", subscriptionInfo?.capacity.services.used);

// 8. Test hook
const { serviceRemaining } = useSubscriptionLimits();
console.log("8. Service remaining:", serviceRemaining);
```

---

## ✅ Verification Steps

### After adding SubscriptionStatus to dashboard:

1. Navigate to dashboard
2. Should see subscription plan name
3. Should see usage progress bars
4. Should see red warning if >80% used

### After adding useFeatureAccess:

1. Call hook with feature name
2. Should return boolean
3. Should show correct value for plan
4. Should update immediately on plan change

### After adding UpgradePrompt:

1. Click button when limit at 0
2. Modal should appear
3. Should show "Upgrade Now" button
4. Should close with X or "Maybe Later"

---

## 🚀 Getting Help

If none of these solutions work:

1. Check browser console for errors (F12 → Console)
2. Check network tab for API responses (F12 → Network)
3. Verify database state (use Prisma Studio or direct query)
4. Check that all files from repo are present
5. Restart dev server: `npm run dev` or `pnpm dev`
6. Clear browser cache: Ctrl+Shift+Delete
7. Check `.env` file has required variables

---

## 📞 Support Info

**Key Files to Check:**

- `lib/subscription-features.ts` - Feature configuration
- `lib/subscription-enforcement.ts` - Enforcement logic
- `app/api/salon-admin/subscription-info/route.ts` - API endpoint
- `hooks/use-subscription.ts` - React hooks
- `components/subscription/*` - UI components

**Database Tools:**

- Open Prisma Studio: `npx prisma studio`
- Check subscription directly: `SELECT * FROM "Subscription";`
- Check services: `SELECT * FROM "Service" WHERE "salonId" = 'XX';`

Good luck! 🎉
