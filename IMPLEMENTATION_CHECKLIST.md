# Implementation Checklist - SalonBook Specification

**Status:** In Progress  
**Last Updated:** March 26, 2026  
**Target Completion:** Q2 2026

---

## Phase 1: Database & Schema Updates

### Critical Schema Changes Required

#### Booking Status Enum

- [ ] Update `BookingStatus` enum in `prisma/schema.prisma`
  - Remove: `CONFIRMED`, `NO_SHOW`
  - Add: `AWAITING_PAYMENT`, `PAYMENT_SUBMITTED`, `PAID`
  - Keep: `PENDING`, `COMPLETED`, `CANCELLED`
- [ ] Create migration: `update_booking_status_enum`
- [ ] Update Booking model to reflect new statuses
- [ ] **Current Values:** `PENDING | CONFIRMED | COMPLETED | CANCELLED | NO_SHOW`
- [ ] **Required Values:** `PENDING | AWAITING_PAYMENT | PAYMENT_SUBMITTED | PAID | COMPLETED | CANCELLED`

#### Subscription Plan Enum

- [ ] Update `SubscriptionPlan` enum in `prisma/schema.prisma`
  - Rename: `PROFESSIONAL` → `STANDARD`
  - Rename: `ENTERPRISE` → `GROWTH`
  - Add: `FREE`, `PREMIUM`
  - Keep: `STARTER`
- [ ] Create migration: `update_subscription_plans`
- [ ] **Current Values:** `TRIAL | STARTER | PROFESSIONAL | ENTERPRISE`
- [ ] **Required Values:** `FREE | STARTER | STANDARD | GROWTH | PREMIUM`

#### Salon Model - Bank Account Fields

- [ ] Add `bankAccountName` (String, optional)
- [ ] Add `bankAccountNumber` (String, optional)
- [ ] Add `bankName` (String, optional)
- [ ] Add `bankVerified` (Boolean, default: false)
- [ ] Add `bankVerificationDate` (DateTime, nullable)
- [ ] Create indexes on bank fields for security audit queries
- [ ] Create migration: `add_salon_bank_account_fields`

#### Subscription Model - Booking Limits

- [ ] Add `monthlyBookingLimit` (Int) - derived from plan, but cached
- [ ] Add `bookingsUsedThisMonth` (Int, default: 0)
- [ ] Add `bookingResetDate` (DateTime) - tracks when monthly quota resets
- [ ] Create migration: `add_subscription_booking_limits`

#### Payment Model - Bank Transfer Support

- [ ] Rename `stripePaymentId` → `externalPaymentId` (more generic)
- [ ] Add `paymentMethod` enum: `BANK_TRANSFER | PAY_AT_SALON | CARD | PAYSTACK`
- [ ] Add `referenceNumber` (String) - unique ref for BANK_TRANSFER payments
- [ ] Add `bankTransferConfirmedAt` (DateTime, nullable)
- [ ] Add `confirmationNotes` (String, nullable) - salon owner's notes
- [ ] Create index on `referenceNumber`
- [ ] Create migration: `enhance_payment_model`

#### Booking Model - Payment Type Selection

- [ ] Add `paymentType` enum: `BANK_TRANSFER | PAY_AT_SALON`
- [ ] Add relation to clarify which payment option customer chose
- [ ] Create migration: `add_booking_payment_type`

#### Audit Log Model (New)

- [ ] Create new model for sensitive operations logging
  - `id`, `userId`, `actionType`, `entityType`, `entityId`, `details`, `ipAddress`, `createdAt`
- [ ] Query bank details access → log it
- [ ] Query payment confirmations → log it
- [ ] Create migration: `create_audit_log_model`

---

## Phase 2: Backend API Endpoints

### Booking API Updates

- [ ] `POST /api/bookings` - Update to support `paymentType` (BANK_TRANSFER | PAY_AT_SALON)
- [ ] `POST /api/bookings` - Check monthly booking limit before creation
- [ ] `PUT /api/bookings/:id/confirm-payment` - NEW: Salon owner confirms bank transfer payment
- [ ] `PUT /api/bookings/:id/status` - Update to support new status transitions
- [ ] `GET /api/bookings/:id/payment-details` - Get payment details (bank info for customer)
- [ ] `GET /api/bookings/monthly-summary` - Check booking count vs. limit for current month

### Subscription API Updates

- [ ] `GET /api/subscriptions/:id` - Include `monthlyBookingLimit`, `bookingsUsedThisMonth`
- [ ] `PUT /api/subscriptions/:id/upgrade` - Upgrade to higher plan
- [ ] `PUT /api/subscriptions/:id/downgrade` - Downgrade to lower plan
- [ ] `POST /api/subscriptions/:id/cancel` - Cancel subscription
- [ ] `POST /api/subscriptions` - Create new subscription (with plan selection)
- [ ] Include pro-rata logic for mid-month upgrades/downgrades

### Salon API Updates

- [ ] `PUT /api/salons/:id/bank-account` - NEW: Update bank account details
- [ ] `GET /api/salons/:id/bank-account` - Retrieve bank account (auth checks: only owner + platform)
- [ ] Add middleware to log all bank detail access to AuditLog

### Payment Validation API

- [ ] `POST /api/payments/validate-bank-transfer` - Verify transfer reference matches booking
- [ ] `GET /api/payments/pending-confirmations` - Salon owner view of awaiting payments

### Utility Endpoints

- [ ] `GET /api/subscriptions/plans` - List all plans with features (for pricing page)
- [ ] `GET /api/subscriptions/plans/:planName/features` - Get specific plan details
- [ ] `POST /api/bookings/check-booking-limit` - Pre-check before booking creation

---

## Phase 3: Frontend - Booking Flow

### Customer Booking Screen

- [ ] Redesign booking page to include payment type selection
- [ ] Add step: "Choose how to pay"
  - Button A: "Pay via Bank Transfer"
  - Button B: "Pay at Salon"
- [ ] Bank Transfer path:
  - [ ] Display salon owner bank details clearly
  - [ ] Show total amount (service + platform fee if enabled)
  - [ ] Show unique reference number / booking ID
  - [ ] Show copy-to-clipboard for account details
  - [ ] Display countdown timer (2 hours to pay)
  - [ ] "I Have Paid" button → confirms payment submitted
- [ ] Pay-at-Salon path:
  - [ ] Simple confirmation screen
  - [ ] Show booking details
  - [ ] Booking created immediately with PENDING status
- [ ] Add payment status tracker (show current status)
- [ ] Add timeout warning ("If you don't pay in 2 hours, booking will be cancelled")

### Booking Confirmation Screen

- [ ] Show booking status badge (PENDING | AWAITING_PAYMENT | PAYMENT_SUBMITTED | PAID)
- [ ] If bank transfer, show "I Have Paid" button until clicked
- [ ] Show cancel booking option (before payment submitted)
- [ ] Display salon contact info for questions

---

## Phase 4: Frontend - Salon Owner Dashboard

### Salon Settings / Bank Account Management

- [ ] Add new "Bank Account" section in Settings
- [ ] Form fields:
  - [ ] Account Name (text input)
  - [ ] Account Number (number input, 10 digits)
  - [ ] Bank Name (dropdown with major Nigerian banks)
- [ ] Save button with validation
- [ ] Success message: "Bank details updated"
- [ ] Warning: "These details will be displayed to customers during payment"
- [ ] Bank verification status (optional badge if verified)

### Booking Management - Payment Confirmations

- [ ] Add new tab or filter: "Pending Payment Confirmations"
- [ ] Show list of bookings with status `AWAITING_PAYMENT` or `PAYMENT_SUBMITTED`
- [ ] For each booking show:
  - [ ] Booking ID
  - [ ] Customer phone
  - [ ] Amount to confirm
  - [ ] Payment reference number
  - [ ] "Confirm Payment" button
  - [ ] "Mark as Cancelled" button
  - [ ] Admin notes field
- [ ] Confirm button → Status becomes `PAID`, notify customer

### Subscription Management Dashboard

- [ ] Show current plan with monthly renewal date
- [ ] Show booking usage: "25 / 30 bookings used this month"
- [ ] Show upgrade recommendation if >80% of quota used
- [ ] Upgrade button → Show plan comparison modal
- [ ] Downgrade option (if not in first billing cycle)
- [ ] Cancel subscription button (with confirmation)
- [ ] Show add-ons section:
  - [ ] SMS notifications (₦500/month)
  - [ ] WhatsApp notifications (₦800/month)
  - [ ] Extra staff accounts (₦2,000/month per)
  - [ ] Marketing tools (₦3,000/month)
  - [ ] API access (₦5,000/month)
  - [ ] Priority support (₦1,000/month)

### Dashboard Analytics - Booking Limits

- [ ] Show monthly booking trend
- [ ] Show plan limit vs actual usage
- [ ] Show upgrade path: "Upgrade to Standard (₦10,000/month) for 50 bookings"

---

## Phase 5: Frontend - Admin Dashboard (Super Admin)

### Subscription Oversight

- [ ] Admin view of all subscriptions (filterable by plan, status)
- [ ] Bulk actions: Upgrade, downgrade, suspend, cancel
- [ ] Manual override capability (for support issues)
- [ ] Revenue dashboard:
  - [ ] MRR (Monthly Recurring Revenue) total
  - [ ] Churn rate (%)
  - [ ] Average revenue per user (ARPU)
  - [ ] Plan distribution (pie chart)

### Payment Processing Monitoring

- [ ] View pending payment confirmations across all salons
- [ ] Flag suspicious patterns (e.g., same café always over-paying)
- [ ] Manual payment confirmation override (for disputes)

---

## Phase 6: Infrastructure & Integrations

### Payment Gateway Integration (Paystack)

- [ ] Set up Paystack API keys (prod + test)
- [ ] Implement subscription billing via Paystack
- [ ] Webhook handlers for:
  - [ ] Subscription renewal success
  - [ ] Subscription renewal failed (payment declined)
  - [ ] Customer refund processed
- [ ] Add fallback to manual billing (for edge cases)

### Notifications System

- [ ] SMS notifications (Paystack SMS API or Twilio):
  - [ ] Booking confirmation (customer)
  - [ ] Payment pending (customer reminder at 1 hour mark)
  - [ ] Payment submitted (salon owner notification)
  - [ ] Payment confirmed (customer notification)
  - [ ] Booking cancelled (both parties)
  - [ ] Subscription expiry warning (3 days, 1 day, on-day)
- [ ] Email notifications:
  - [ ] Same events as SMS
  - [ ] Subscription receipts
  - [ ] Payment reconciliation reports
  - [ ] Upgrade recommendations
- [ ] In-app notifications:
  - [ ] Real-time badge on "Pending Payments" tab
  - [ ] Toast alerts for status changes

### Scheduled Jobs / Cron Tasks

- [ ] **Auto-cancel expired bookings:** Every 30 min, cancel `AWAITING_PAYMENT` > 2 hours old
- [ ] **Auto-cancel unconfirmed payments:** Every 1 hour, cancel `PAYMENT_SUBMITTED` > 24 hours old
- [ ] **Monthly quota reset:** At start of month, reset `bookingsUsedThisMonth` to 0
- [ ] **Subscription renewal reminders:** 3 days, 1 day before renewal
- [ ] **Subscription expiry enforcement:** On renewal date, check payment status; suspend if failed
- [ ] **Trial expiry:** 14 days from signup, downgrade to Free if not subscribed

---

## Phase 7: Testing

### Unit Tests

- [ ] Test booking status transitions (valid/invalid paths)
- [ ] Test payment confirmation logic
- [ ] Test booking limit enforcement
- [ ] Test subscription plan feature access
- [ ] Test quota reset logic (monthly)

### Integration Tests

- [ ] Full booking flow: Bank transfer path
- [ ] Full booking flow: Pay-at-salon path
- [ ] Full subscription upgrade flow
- [ ] Auto-cancel expired bookings
- [ ] Paystack webhook handling

### E2E Tests

- [ ] Customer completes booking with bank transfer
- [ ] Salon owner confirms manually
- [ ] Admin views all bookings and subscriptions
- [ ] Subscription renewal triggers via Paystack

---

## Phase 8: Security & Compliance

### Data Protection

- [ ] Encrypt bank account fields at rest (AES-256)
- [ ] Add field-level encryption for `bankAccountNumber`
- [ ] Implement audit logging for bank detail access
- [ ] Rate limiting on payment confirmation endpoints
- [ ] Secure password hashing (bcryptjs, salt rounds ≥ 12)

### PCI DSS Compliance

- [ ] Don't store credit card information (third-party only)
- [ ] Ensure HTTPS on all endpoints
- [ ] Implement CSRF protection on forms
- [ ] Add Content Security Policy headers

### Payment Security

- [ ] Validate payment amounts match booking totals
- [ ] Prevent double-confirmation of payments
- [ ] Add fraud detection (unusual payment patterns)
- [ ] Capture payment reconciliation errors

---

## Phase 9: Documentation & Training

### User Documentation

- [ ] **For Salon Owners:**
  - [ ] How to add bank account details
  - [ ] How to confirm customer payments
  - [ ] How to upgrade/downgrade plans
  - [ ] FAQ: How does payment work?
  - [ ] Payment troubleshooting guide

- [ ] **For Customers:**
  - [ ] How to make bank transfer payment
  - [ ] How to pay at salon
  - [ ] Booking cancellation policy
  - [ ] FAQ: Is my payment safe?

### Developer Documentation

- [ ] API documentation for payment confirmation endpoints
- [ ] Database schema documentation for new fields
- [ ] Booking state machine diagram
- [ ] Subscription lifecycle diagram
- [ ] Paystack integration guide

---

## Phase 10: Deployment & Monitoring

### Pre-Launch Checklist

- [ ] Database migrations tested on staging
- [ ] API endpoints load-tested (1000+ concurrent users)
- [ ] Payment webhook handlers tested with Paystack sandbox
- [ ] SMS/Email service reliability verified
- [ ] Cron job scheduling verified
- [ ] Error logging & monitoring operational
- [ ] Staging environment mirrors production setup

### Monitoring & Alerts

- [ ] Monitor booking status distribution (% in each status)
- [ ] Alert if auto-cancel cron fails
- [ ] Alert if failed payments exceed 5%
- [ ] Monitor subscription renewal success rate
- [ ] Track API response times (target: <200ms median)
- [ ] Monitor SMS delivery rates (target: >99%)

### Gradual Rollout

- [ ] Stage 1: Internal testing (team only)
- [ ] Stage 2: Beta with 20 salon partners
- [ ] Stage 3: Expanded beta with 200 salons
- [ ] Stage 4: Full rollout to all users

---

## Current Status by Component

| Component             | Status      | Priority | % Complete |
| --------------------- | ----------- | -------- | ---------- |
| Product Spec          | ✅ Complete | High     | 100%       |
| DB Schema Updates     | ⏳ Pending  | Critical | 0%         |
| Booking API           | ⏳ Pending  | Critical | 20%        |
| Subscription API      | ⏳ Pending  | High     | 30%        |
| Booking UI Flow       | ⏳ Pending  | High     | 10%        |
| Salon Settings        | ⏳ Pending  | High     | 5%         |
| Payment Confirmations | ⏳ Pending  | High     | 0%         |
| Admin Dashboard       | ⏳ Pending  | Medium   | 40%        |
| Paystack Integration  | ⏳ Pending  | High     | 0%         |
| Notifications         | ⏳ Pending  | High     | 20%        |
| Cron Jobs             | ⏳ Pending  | High     | 0%         |
| Testing               | ⏳ Pending  | Medium   | 5%         |
| Docs                  | ⏳ Pending  | Medium   | 0%         |

---

## Dependencies & Blockers

### No Current Blockers

- ✅ All dependencies available
- ✅ Team capacity adequate
- ✅ No external vendor delays

### Timeline Assumptions

- Assume 1 sprint = 2 weeks
- 10 weeks total (5 sprints) to Phase 8 (launch-ready)
- Phase 9-10: 2 weeks (concurrent with beta rollout)

---

## Sign-Off & Stakeholders

- [ ] **Product Manager:** Approval on feature set
- [ ] **Tech Lead:** Approval on technical approach
- [ ] **Design Lead:** Approval on UX/UI flows
- [ ] **QA Lead:** Approval on test strategy

---

**Document Owner:** Engineering Team  
**Last Updated:** March 26, 2026  
**Next Review:** April 9, 2026 (end of Phase 1)
