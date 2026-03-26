# Schema Migration Guide - SalonBook Spec Alignment

This guide outlines the Prisma schema changes required to align the database with the PRODUCT_SPECIFICATION.md.

**Version:** 1.0  
**Created:** March 26, 2026  
**Status:** Ready for Implementation

---

## Overview of Changes

| Entity                | Change Type | Current → Required  | Impact                                       |
| --------------------- | ----------- | ------------------- | -------------------------------------------- |
| BookingStatus Enum    | Update      | 5 values → 6 values | Breaking change; requires migration          |
| SubscriptionPlan Enum | Update      | 4 values → 5 values | Breaking change; requires migration          |
| Salon Model           | Add Fields  | +5 fields           | Non-breaking; adds bank account storage      |
| Subscription Model    | Add Fields  | +3 fields           | Non-breaking; adds quota tracking            |
| Payment Model         | Add Fields  | +4 fields           | Non-breaking; enhances bank transfer support |
| Booking Model         | Add Field   | +1 field            | Non-breaking; clarifies payment method       |
| AuditLog Model        | New         | N/A                 | New table for security logging               |

---

## Migration 1: Update BookingStatus Enum

**File:** `prisma/schema.prisma`

### Current State

```prisma
enum BookingStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
  NO_SHOW
}
```

### Required State

```prisma
enum BookingStatus {
  PENDING
  AWAITING_PAYMENT
  PAYMENT_SUBMITTED
  PAID
  COMPLETED
  CANCELLED
}
```

### Changes

- ❌ Remove: `CONFIRMED` (replaced by `PAID`)
- ❌ Remove: `NO_SHOW` (deprecated; use `CANCELLED` instead)
- ✅ Add: `AWAITING_PAYMENT` (customer selected bank transfer, awaiting payment)
- ✅ Add: `PAYMENT_SUBMITTED` (customer claims payment sent, awaiting salon confirmation)
- ✅ Add: `PAID` (payment confirmed by salon owner)

### Migration Command

```bash
# Create migration
pnpm exec prisma migrate dev --name update_booking_status_enum

# The migration file will handle existing data:
# CONFIRMED → PAID
# NO_SHOW → CANCELLED
# PENDING → PENDING (unchanged)
# COMPLETED → COMPLETED (unchanged)
# CANCELLED → CANCELLED (unchanged)
```

### Data Migration SQL (if manual migration needed)

```sql
-- No direct data migration needed for enum-only change
-- PostgreSQL handles enum transitions with ALTER TYPE
-- However, you may want to update existing bookings for consistency:

UPDATE "Booking" SET "status" = 'PAID' WHERE "status" = 'CONFIRMED';
UPDATE "Booking" SET "status" = 'CANCELLED' WHERE "status" = 'NO_SHOW';
```

---

## Migration 2: Update SubscriptionPlan Enum

**File:** `prisma/schema.prisma`

### Current State

```prisma
enum SubscriptionPlan {
  TRIAL
  STARTER
  PROFESSIONAL
  ENTERPRISE
}
```

### Required State

```prisma
enum SubscriptionPlan {
  FREE
  STARTER
  STANDARD
  GROWTH
  PREMIUM
}
```

### Changes

- ✅ Add: `FREE` (new free tier with 10 bookings/month)
- ✅ Keep: `STARTER` (₦5,000/month, 30 bookings)
- ⚠️ Rename: `PROFESSIONAL` → `STANDARD` (₦10,000/month, 50 bookings)
- ⚠️ Rename: `ENTERPRISE` → `GROWTH` (₦15,000/month, 100 bookings)
- ✅ Add: `PREMIUM` (₦30,000/month, unlimited bookings)
- ❌ Remove: `TRIAL` (replaced by `FREE` with trial flag on Subscription model)

### Migration Command

```bash
# Create migration
pnpm exec prisma migrate dev --name update_subscription_plans
```

### Data Migration SQL

```sql
-- Rename existing plans
UPDATE "Subscription" SET "plan" = 'STANDARD' WHERE "plan" = 'PROFESSIONAL';
UPDATE "Subscription" SET "plan" = 'GROWTH' WHERE "plan" = 'ENTERPRISE';

-- Handle TRIAL → FREE (check if any TRIAL plans exist)
-- You may want to set appropriate billing dates for these
UPDATE "Subscription" SET "plan" = 'FREE' WHERE "plan" = 'TRIAL';
```

---

## Migration 3: Add Salon Bank Account Fields

**File:** `prisma/schema.prisma`

### Update Salon Model

Add the following fields to the `Salon` model:

```prisma
model Salon {
  // ... existing fields ...

  // Bank account details for payment
  bankAccountName    String?           // "John's Salon Ltd"
  bankAccountNumber  String?           // "1234567890" (encrypted in code)
  bankName          String?           // "First Bank", "GTB", "UBA"
  bankVerified      Boolean           @default(false)  // Manual verification flag
  bankVerificationDate DateTime?       // When account was verified

  // ... rest of fields ...
}
```

### Add Index for Audit Queries

```prisma
model Salon {
  // ... fields ...

  @@index([bankVerified])
  @@index([bankVerificationDate])
}
```

### Migration Command

```bash
# Create migration
pnpm exec prisma migrate dev --name add_salon_bank_account_fields
```

### Implementation Notes

- Bank account fields are **optional** (`String?`) for backward compatibility
- Implement field-level encryption for `bankAccountNumber` in application code (not in schema)
- Add middleware to log all access to bank account details (AuditLog)
- Display warning to customers: "Bank details are never stored or shared with third parties"

---

## Migration 4: Add Subscription Quota Tracking

**File:** `prisma/schema.prisma`

### Update Subscription Model

Add the following fields to the `Subscription` model:

```prisma
model Subscription {
  // ... existing fields ...

  // Booking quota tracking
  monthlyBookingLimit    Int             @default(30)   // Based on plan
  bookingsUsedThisMonth  Int             @default(0)    // Resets monthly
  bookingResetDate       DateTime        @default(now()) // When quota resets

  // ... rest of fields ...
}
```

### Migration Command

```bash
pnpm exec prisma migrate dev --name add_subscription_booking_limits
```

### Data Migration SQL

```sql
-- Set booking limits based on existing plan
UPDATE "Subscription" SET "monthlyBookingLimit" = 10 WHERE "plan" = 'FREE';
UPDATE "Subscription" SET "monthlyBookingLimit" = 30 WHERE "plan" = 'STARTER';
UPDATE "Subscription" SET "monthlyBookingLimit" = 50 WHERE "plan" = 'STANDARD';
UPDATE "Subscription" SET "monthlyBookingLimit" = 100 WHERE "plan" = 'GROWTH';
UPDATE "Subscription" SET "monthlyBookingLimit" = 999999 WHERE "plan" = 'PREMIUM';

-- Reset quotas
UPDATE "Subscription" SET "bookingsUsedThisMonth" = 0;

-- Set reset date to start of current month
UPDATE "Subscription" SET "bookingResetDate" = DATE_TRUNC('month', CURRENT_DATE);
```

### Implementation Logic (Application Code)

```typescript
// In your booking service:
async function checkBookingQuota(salonId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({ where: { salonId } });

  // Check if reset needed
  const currentMonth = new Date();
  if (sub.bookingResetDate.getMonth() !== currentMonth.getMonth()) {
    // Reset quota
    await prisma.subscription.update({
      where: { salonId },
      data: {
        bookingsUsedThisMonth: 0,
        bookingResetDate: new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          1,
        ),
      },
    });
    sub.bookingsUsedThisMonth = 0;
  }

  return sub.bookingsUsedThisMonth < sub.monthlyBookingLimit;
}
```

---

## Migration 5: Enhance Payment Model for Bank Transfers

**File:** `prisma/schema.prisma`

### Update Payment Model

```prisma
model Payment {
  id              String        @id @default(cuid())
  bookingId       String        @unique
  amount          Float
  currency        String        @default("NGN")  // Change from USD

  // Generic external payment ID (Stripe, Paystack, etc.)
  externalPaymentId String?      // Was: stripePaymentId

  // Payment method
  paymentMethod   String?       // BANK_TRANSFER | PAY_AT_SALON | CARD | PAYSTACK

  // Bank transfer specific fields
  referenceNumber String?       @unique  // Customer provides or system generates
  bankTransferConfirmedAt DateTime?     // When salon owner confirmed
  confirmationNotes String?             // Notes from salon owner

  status          PaymentStatus @default(PENDING)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  booking         Booking       @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  @@index([externalPaymentId])
  @@index([referenceNumber])
  @@index([bankTransferConfirmedAt])
}
```

### Migration Command

```bash
pnpm exec prisma migrate dev --name enhance_payment_model
```

### Data Migration SQL

```sql
-- Rename stripePaymentId to externalPaymentId
ALTER TABLE "Payment" RENAME COLUMN "stripePaymentId" TO "externalPaymentId";

-- Set default paymentMethod based on existing data
UPDATE "Payment" SET "paymentMethod" = 'CARD' WHERE "externalPaymentId" IS NOT NULL;
UPDATE "Payment" SET "paymentMethod" = 'PAY_AT_SALON' WHERE "externalPaymentId" IS NULL;
```

---

## Migration 6: Add Payment Type to Booking

**File:** `prisma/schema.prisma`

### Update Booking Model

```prisma
model Booking {
  // ... existing fields ...

  // Payment method choice
  paymentMethod   String        @default("PAY_AT_SALON")  // BANK_TRANSFER | PAY_AT_SALON

  status        BookingStatus @default(PENDING)
  paymentStatus PaymentStatus @default(PENDING)  // Deprecated in favor of Payment.status

  // ... rest of fields ...
}
```

### Migration Command

```bash
pnpm exec prisma migrate dev --name add_booking_payment_method
```

---

## Migration 7: Create AuditLog Model

**File:** `prisma/schema.prisma`

### New AuditLog Model

```prisma
model AuditLog {
  id              String    @id @default(cuid())
  userId          String?   // Salon owner or admin performing action
  actionType      String    // "VIEWED_BANK_DETAILS", "CONFIRMED_PAYMENT", "ACCESSED_SALON"
  entityType      String    // "SALON", "BOOKING", "PAYMENT", "SUBSCRIPTION"
  entityId        String    // ID of the entity being accessed
  details         String?   // JSON string with additional context
  ipAddress       String?   // IP of requester
  createdAt       DateTime  @default(now())

  user            User?     @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([actionType])
  @@index([entityType])
  @@index([entityId])
  @@index([createdAt])
}
```

### Add Relation to User Model

```prisma
model User {
  // ... existing fields ...
  auditLogs       AuditLog[]
}
```

### Migration Command

```bash
pnpm exec prisma migrate dev --name create_audit_log_model
```

### Example Usage (Application Code)

```typescript
// Log bank detail access
async function logBankDetailAccess(
  userId: string,
  salonId: string,
  ipAddress: string,
) {
  await prisma.auditLog.create({
    data: {
      userId,
      actionType: "VIEWED_BANK_DETAILS",
      entityType: "SALON",
      entityId: salonId,
      details: JSON.stringify({ salonName: "..." }),
      ipAddress,
    },
  });
}

// Log payment confirmation
async function logPaymentConfirmation(
  userId: string,
  bookingId: string,
  ipAddress: string,
) {
  await prisma.auditLog.create({
    data: {
      userId,
      actionType: "CONFIRMED_PAYMENT",
      entityType: "BOOKING",
      entityId: bookingId,
      ipAddress,
    },
  });
}
```

---

## Complete Migration Execution Path

### Step 1: Backup Current Database

```bash
# Backup production database
pg_dump $DATABASE_URL > salon_backup_$(date +%Y%m%d).sql
```

### Step 2: Update Schema Definitions

Edit `prisma/schema.prisma` with all changes from Migrations 1-7.

### Step 3: Create All Migrations

```bash
# Prisma will interactive ask you questions
pnpm exec prisma migrate dev --name all_spec_alignments
```

### Step 4: Run Data Migrations

If you created any data migration SQL, run it:

```bash
# Run manually if needed
psql -d $DATABASE_URL -f migration_data.sql
```

### Step 5: Generate Prisma Client

```bash
pnpm exec prisma generate
```

### Step 6: Test in Staging

- Full integration tests pass
- API responses include new fields
- Booking flows work with new statuses
- Subscription quota tracking functions

### Step 7: Deploy to Production

- Blue-green deployment (zero downtime)
- Monitor for any issues
- Have rollback plan ready

---

## Rollback Plan

If migration fails in production:

```bash
# Rollback to previous migration
pnpm exec prisma migrate resolve --rolled-back <migration_name>

# Or restore from backup
psql -d $DATABASE_URL < salon_backup_YYYYMMDD.sql

# And revert schema.prisma to previous state
git checkout HEAD~1 prisma/schema.prisma
pnpm exec prisma generate
```

---

## Post-Migration Validation

### Validation Queries

```sql
-- Check enum values exist
SELECT enumlabel FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'BookingStatus');

-- Check new Salon columns
\d "Salon"

-- Verify data integrity
SELECT COUNT(*) as total_bookings FROM "Booking";
SELECT COUNT(*) as distinct_statuses FROM (
  SELECT DISTINCT "status" FROM "Booking"
) as t;

-- Check subscription plans
SELECT plan, COUNT(*) as count FROM "Subscription" GROUP BY plan;
```

### Performance Check

- Query `Bookings` by status → should use index < 50ms
- Query bank details audit logs → should use index < 100ms
- Monthly quota calculation → should complete < 200ms

---

## Timeline

| Phase | Task                     | Duration | End Date |
| ----- | ------------------------ | -------- | -------- |
| 1     | Schema design & testing  | 2 days   | March 28 |
| 2     | Create migration files   | 1 day    | March 29 |
| 3     | Staging environment test | 2 days   | March 31 |
| 4     | Production deployment    | 1 day    | April 1  |
| 5     | Validation & monitoring  | 1 day    | April 2  |

---

## Risk Assessment

| Risk                         | Likelihood | Impact   | Mitigation                            |
| ---------------------------- | ---------- | -------- | ------------------------------------- |
| Data loss during migration   | Low        | Critical | Backup + staging test + rollback plan |
| Breaking existing bookings   | Medium     | High     | Data migration SQL + thorough testing |
| Enum conflicts in production | Low        | High     | Blue-green deployment + monitoring    |
| Performance degradation      | Low        | Medium   | Index strategy + query optimization   |

---

## References

- **Product Specification:** `PRODUCT_SPECIFICATION.md`
- **Implementation Checklist:** `IMPLEMENTATION_CHECKLIST.md`
- **Prisma Docs:** https://www.prisma.io/docs/concepts/components/prisma-migrate
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---

**Document Owner:** Database Team  
**Last Updated:** March 26, 2026  
**Next Review:** March 28, 2026 (pre-staging deployment)
