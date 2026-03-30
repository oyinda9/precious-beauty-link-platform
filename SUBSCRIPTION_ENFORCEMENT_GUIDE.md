# Subscription Plan Feature Enforcement System

## Overview

A comprehensive system for enforcing subscription plan limits and features across your platform. Each plan has specific limits for bookings, staff, services, and access to features.

## 📋 Plan Tiers & Limits

| Feature | FREE | STARTER | STANDARD | GROWTH | PREMIUM |
|---------|------|---------|----------|--------|---------|
| **Monthly Bookings** | 10 | 30 | 50 | 100 | ∞ |
| **Max Services** | 5 | 10 | 20 | 50 | ∞ |
| **Max Staff** | 1 | 2 | 5 | 10 | ∞ |
| **Max Customers** | 50 | 200 | 500 | 1,000 | ∞ |
| **User Accounts** | 1 | 2 | 5 | 10 | ∞ |

## 🎯 Features by Plan

### Communication Features
- **WhatsApp Notifications**: FREE (❌) | STARTER+ (✅)
- **Email Notifications**: FREE+ (✅)
- **SMS Notifications**: STARTER+ (✅)

### Analytics & Reporting
- **Revenue Tracking**: FREE (Basic) | STARTER+ (Full)
- **Customer Analytics**: STANDARD+ (✅)
- **Staff Performance Metrics**: STANDARD+ (✅)
- **Advanced Analytics**: STANDARD+ (✅)
- **Custom Reports**: GROWTH+ (✅)

### Business Features
- **Discounts/Coupons**: STARTER+ (Basic) | STANDARD+ (Full)
- **Loyalty Programs**: STANDARD+ (✅)
- **Waitlist Management**: STANDARD+ (✅)
- **Package Bundles**: STARTER+ (✅)
- **Gift Cards**: STANDARD+ (✅)
- **Membership Plans**: STANDARD+ (✅)

### Integration & Customization
- **Google Calendar Sync**: STARTER+ (✅)
- **Google Business Profile**: GROWTH+ (✅)
- **Custom Domain**: GROWTH+ (✅)
- **Custom Branding**: STANDARD+ (✅)
- **API Access**: GROWTH+ (✅)
- **Zapier Integration**: GROWTH+ (✅)

### Support
- **Priority Support**: GROWTH+ (✅)
- **Multi-user Accounts**: STARTER+ (Limited) | PREMIUM (Unlimited)

## 📁 New Files & Utilities

### 1. **`lib/subscription-features.ts`** - Feature & Limit Configuration
Defines all plan features and limits

```typescript
// Get features for a plan
const features = getPlanFeatures("STARTER");

// Check if a plan has a feature
const hasWhatsApp = hasPlanFeature("STARTER", "whatsappNotifications"); // true

// Get a specific limit
const bookingLimit = getPlanLimit("STANDARD", "booking"); // 50

// Check if limit is reached
const isFull = hasReachedLimit("STARTER", "staff", 2); // true

// Get remaining capacity
const remaining = getRemainingCapacity("STARTER", "service", 7); // 3
```

### 2. **`lib/subscription-enforcement.ts`** - Enforcement Utilities
Check subscription status before allowing actions

```typescript
// Check if can create service
const { allowed, reason } = await canCreateService(salonId);
if (!allowed) console.error(reason);

// Check if can add staff
const staffCheck = await canAddStaff(salonId);

// Check if can create booking
const bookingCheck = await canCreateBooking(salonId);
// Returns: { allowed, reason, remaining }

// Get detailed resource capacity
const capacity = await getResourceCapacityInfo(salonId);
// Returns: { plan, services, staff, bookings }

// Check specific feature access
const hasFeature = await hasSalonFeature(salonId, "whatsappNotifications");

// Get all features for salon
const features = await getSalonFeatureAccess(salonId);

// Get booking limits and usage
const limits = await getBookingLimitsUsage(salonId);
// Returns: { plan, limit, used, remaining, resetDate }
```

## 🛠️ Updated API Endpoints

### 1. **POST `/api/salons/[slug]/services`** - Create Service
**Now enforces:** Max services limit per plan

```typescript
// Response if limit exceeded:
{
  "error": "Service limit reached (10 services max for STARTER plan)",
  "status": 403
}
```

### 2. **POST `/api/bookings`** - Create Booking
**Now enforces:** Monthly booking limit per plan

```typescript
// Response if limit exceeded:
{
  "error": "Monthly booking limit reached (30 bookings for STARTER plan)",
  "remaining": 0,
  "status": 403
}
```

### 3. **POST `/api/salon-admin/staff`** (NEW) - Add Staff
**Now enforces:** Max staff limit per plan

```typescript
// Response if limit exceeded:
{
  "error": "Staff limit reached (2 staff max for STARTER plan)",
  "status": 403
}
```

### 4. **GET `/api/salon-admin/subscription-info`** (NEW) - Get Subscription Details
Returns complete subscription info with limits and usage

```json
{
  "subscription": {
    "id": "...",
    "plan": "STARTER",
    "status": "ACTIVE",
    "currentPeriodStart": "2026-03-01",
    "currentPeriodEnd": "2026-04-01"
  },
  "capacity": {
    "plan": "STARTER",
    "services": { "used": 8, "limit": 10, "remaining": 2 },
    "staff": { "used": 2, "limit": 2, "remaining": 0 },
    "bookings": { "used": 15, "limit": 30, "remaining": 15 }
  },
  "limits": {
    "plan": "STARTER",
    "limit": 30,
    "used": 15,
    "remaining": 15,
    "resetDate": "2026-04-01"
  },
  "features": {
    "whatsappNotifications": true,
    "emailNotifications": true,
    "customBranding": false,
    "apiAccess": false,
    ...
  }
}
```

## 🎨 Frontend Integration Examples

### Display Plan Limits in Dashboard

```typescript
import { useEffect, useState } from "react";

export function SubscriptionLimits() {
  const [limits, setLimits] = useState(null);

  useEffect(() => {
    fetch("/api/salon-admin/subscription-info", {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => setLimits(data))
  }, [])

  if (!limits) return <div>Loading...</div>;

  return (
    <div>
      <h2>Current Plan: {limits.capacity.plan}</h2>
      
      <div>Services: {limits.capacity.services.used} / {limits.capacity.services.limit}</div>
      <div>Staff: {limits.capacity.staff.used} / {limits.capacity.staff.limit}</div>
      <div>Bookings: {limits.capacity.bookings.used} / {limits.capacity.bookings.limit}</div>
      
      {limits.capacity.services.remaining === 0 && (
        <p className="text-red-500">⚠️ Service limit reached. Upgrade to add more.</p>
      )}
    </div>
  );
}
```

### Disable "Add Service" Button When Limit Reached

```typescript
import { canCreateService } from "@/lib/subscription-enforcement";

export function AddServiceButton() {
  const [canAdd, setCanAdd] = useState(true);
  const [reason, setReason] = useState("");

  useEffect(() => {
    canCreateService(salonId).then(result => {
      setCanAdd(result.allowed);
      setReason(result.reason);
    })
  }, [salonId])

  return (
    <button disabled={!canAdd} title={reason}>
      Add Service
    </button>
  );
}
```

## 🔧 Implementation Checklist

### Phase 1: Core Enforcement (Done ✅)
- [x] Features configuration file created
- [x] Enforcement utilities created
- [x] Service creation endpoint updated
- [x] Booking creation endpoint updated
- [x] Staff endpoint created with enforcement
- [x] Subscription info API endpoint created

### Phase 2: Frontend Integration (Ready)
- [ ] Add subscription info display to dashboard
- [ ] Show plan limits in salon settings
- [ ] Display "upgrade" prompts when limits near
- [ ] Add feature availability badges to UI
- [ ] Show usage progress bars for limits

### Phase 3: Advanced Features (Optional)
- [ ] Implement feature toggles in UI based on plan
- [ ] Add notifications when limits are reached
- [ ] Create upgrade flow/modals
- [ ] Add plan comparison page
- [ ] Implement trial period tracking
- [ ] Add feature request system for upsets

### Phase 4: Notifications (When Ready)
- [ ] Implement WhatsApp notifications
- [ ] Add email notification system
- [ ] Create SMS notification gateway
- [ ] Add in-app notifications

## 🔐 How Limits Are Enforced

### Booking Limits
1. User creates booking via API
2. System calculates current month's bookings
3. Checks count against plan limit
4. Returns error if limit exceeded
5. Monthly counter resets on 1st of month

### Service Limits
1. Admin tries to create service
2. System counts existing active services
3. Checks count against plan limit
4. Returns error if limit exceeded

### Staff Limits
1. Admin tries to add staff member
2. System counts active staff
3. Checks count against plan limit
4. Returns error if limit exceeded

### Feature Access
1. Frontend fetches `/api/salon-admin/subscription-info`
2. Receives boolean flags for each feature
3. UI conditionally renders/hides features
4. Backend also checks on feature API calls

## 📊 Features Configuration

All features and limits are defined in `PLAN_FEATURES` object. To add new features:

1. Add to `features` object in `PLAN_FEATURES`
2. Update all plan tiers with true/false values
3. Use `hasSalonFeature()` to check in code
4. Use `getSalonFeatureAccess()` to get all features

```typescript
// Example: Adding a new feature
PLAN_FEATURES: {
  FREE: {
    features: {
      newFeatureName: false,  // Add here
      ...
    }
  },
  STARTER: {
    features: {
      newFeatureName: true,   // Add here
      ...
    }
  },
  // ... etc for all plans
}
```

## 🚀 Using in API Endpoints

```typescript
import { canCreateService, canAddStaff, canCreateBooking } from "@/lib/subscription-enforcement";

// In your endpoint:
const check = await canCreateService(salon Id);
if (!check.allowed) {
  return NextResponse.json(
    { error: check.reason },
    { status: 403 }
  );
}
// Continue with creation...
```

## 📞 Support Plan Tiers

- **FREE**: Community support (forums)
- **STARTER**: Email support (24-48h response)
- **STANDARD**: Email + Phone support (24h response)
- **GROWTH**: Dedicated support (24h response)
- **PREMIUM**: Dedicated account manager (4h response)

## 🎁 Upgrade Workflow

When user hits a limit:
1. Show friendly error message
2. Link to upgrade page
3. Show their current plan vs needed plan
4. Display price difference
5. Process upgrade payment
6. Immediately activate new limits

## 📝 Database Considerations

The `Subscription` model already has these fields we use:
- `plan: SubscriptionPlan` - Current plan tier
- `status: SubscriptionStatus` - ACTIVE/PENDING/CANCELLED
- `monthlyBookingLimit` - Customizable booking limit
- `currentPeriodStart/End` - For billing cycles

No new columns needed - everything works with existing schema!
