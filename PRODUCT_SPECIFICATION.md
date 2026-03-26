# SalonBook - Product Specification

**Platform:** Salon Booking & Subscription Platform for Small and Growing Salon Businesses in Nigeria  
**Currency:** Nigerian Naira (₦)  
**Primary Market:** Nigerian salon owners and beauty professionals  
**Revenue Model:** Subscriptions + Optional fees

---

## Executive Summary

SalonBook is a B2B SaaS platform designed to help small and growing salon businesses in Nigeria manage their bookings and payments. Unlike marketplace models, payments go **directly to salon owners**, while the platform earns revenue through monthly subscriptions and optional feature add-ons. This approach maximizes adoption by reducing friction and building trust with salon owners.

---

## 1. SUBSCRIPTION PLANS

### Free Plan

- **Price:** Free
- **Booking Limit:** Max 10 bookings per month
- **Features:**
  - Very limited features
  - No analytics or notifications
  - Basic booking system (manual or simple)
  - No staff management
- **Use Case:** Trial/sampling for new owners

### Starter Plan

- **Price:** ₦5,000/month
- **Booking Limit:** Max 30 bookings per month
- **Features:**
  - Basic booking system
  - Basic customer management
  - Up to 2 staff members
  - Email notifications (basic)
  - Manual payment confirmation
- **Use Case:** Small salon owners just starting out
- **Upgrade Trigger:** When reaching 25 bookings/month

### Standard Plan

- **Price:** ₦10,000/month
- **Booking Limit:** Max 50 bookings per month
- **Features:**
  - Increased booking limit (50 bookings)
  - SMS/WhatsApp notifications (optional add-on billable separately)
  - Basic analytics dashboard
  - Up to 5 staff members
  - Service categories
  - Basic customer history
- **Use Case:** Growing salons with steady traffic
- **Upgrade Trigger:** When reaching 45 bookings/month

### Growth Plan

- **Price:** ₦15,000/month
- **Booking Limit:** Max 100 bookings per month
- **Features:**
  - Full staff management (unlimited staff)
  - Advanced analytics & insights
  - Higher booking limits (100 bookings)
  - Multiple services per staff
  - Automated reminders & notifications
  - Recurring bookings support
  - Custom branding options
- **Use Case:** Established salons with professional systems
- **Upgrade Trigger:** When reaching 90 bookings/month

### Premium Plan

- **Price:** ₦30,000/month
- **Booking Limit:** Unlimited bookings
- **Features:**
  - Unlimited bookings per month
  - Full analytics dashboard with AI insights
  - Multi-branch support (manage 2+ locations)
  - Automation tools & workflows
  - Advanced payment reconciliation
  - Priority support
  - Custom integrations
  - Marketing tools (email campaigns, promotions)
  - API access
- **Use Case:** Large or multi-location salons
- **Upgrade Trigger:** Requires manual discussion

---

## 2. SALON OWNER SETUP

### Bank Account Registration

When registering or during onboarding, each salon owner must provide:

**Required Information:**

- Account Name (name on bank account)
- Account Number (10-digit Nigerian bank account)
- Bank Name (e.g., "First Bank", "GTB", "UBA")

**Optional Information:**

- Account Type (Savings/Checking)
- Alternate Contact Number

**Database Storage:**

- Store in `Salon` model additional fields (if not already present):
  - `bankAccountName` (String)
  - `bankAccountNumber` (String)
  - `bankName` (String)
  - `bankVerified` (Boolean, default: false)
  - `bankVerificationDate` (DateTime, nullable)

**Security Considerations:**

- Bank details encrypted at rest (consider AES-256 encryption)
- Displayed to customers **only** during booking payment screen
- NOT displayed in dashboard or any admin interface (except to salon owner)
- Audit log all access to bank details

---

## 3. BOOKING FLOW

### Overview

Customers can choose how they want to pay **before** booking is confirmed:

---

### Option A: Pay via Bank Transfer

**Flow:**

1. Customer selects service and booking time
2. System shows available slots (based on staff availability)
3. Customer enters phone number (optional) or logs in
4. **Customer chooses "Pay via Bank Transfer"**
5. System displays:
   - Salon owner's bank account details (Account Name, Number, Bank Name)
   - Exact amount to pay (service price + platform fee if applicable)
   - Unique reference number or booking ID for the transfer
   - Instructions for payment (screenshot of details, time limit to pay)
6. Booking is created with status: **`AWAITING_PAYMENT`**
7. Customer makes bank transfer to salon owner's account
8. Customer returns to app and clicks **"I Have Paid"** button
9. Booking status changes to: **`PAYMENT_SUBMITTED`**
10. Salon owner receives notification that payment is awaiting confirmation
11. Salon owner manually confirms payment in dashboard
12. Booking status becomes: **`PAID`**
13. Customer receives confirmation (SMS/Email)

**Timeout Rule:**

- If booking not paid within 2 hours → automatically set to `CANCELLED`
- Notification sent to customer

---

### Option B: Pay at Salon

**Flow:**

1. Customer selects service and booking time
2. Customer enters phone number (optional) or logs in
3. **Customer chooses "Pay at Salon"**
4. Booking is created immediately with status: **`PENDING`**
5. No payment required upfront
6. Customer receives confirmation (SMS/Email) with booking details
7. Customer arrives at salon for service
8. Salon owner confirms payment after service is completed
9. Status becomes: **`PAID`**
10. Service can now be marked as `COMPLETED`

**Use Case:**

- Customers who prefer cash payment
- Walk-ins or same-day bookings
- Builds customer trust (pay after service, not before)

---

## 4. BOOKING STATUS LIFECYCLE

### Status Definitions

| Status                | Meaning                                               | Next Possible Status         | Duration                   |
| --------------------- | ----------------------------------------------------- | ---------------------------- | -------------------------- |
| **PENDING**           | Booking created, awaiting customer to pay at salon    | PAID, CANCELLED              | Until service time         |
| **AWAITING_PAYMENT**  | Customer selected bank transfer; awaiting payment     | PAYMENT_SUBMITTED, CANCELLED | 2 hours max                |
| **PAYMENT_SUBMITTED** | Customer claims payment sent; salon owner verifying   | PAID, CANCELLED              | Until salon owner confirms |
| **PAID**              | Payment confirmed; booking is active                  | COMPLETED, CANCELLED         | Until service time         |
| **COMPLETED**         | Service finished; booking closed                      | (final)                      | N/A                        |
| **CANCELLED**         | Booking cancelled (by customer or system auto-cancel) | (final)                      | N/A                        |

### Status Transitions Diagram

```
PENDING ──────→ PAID ──────→ COMPLETED
   ↓
   └─→ CANCELLED

AWAITING_PAYMENT ──→ PAYMENT_SUBMITTED ──→ PAID ──→ COMPLETED
        ↓                    ↓
        └────→ CANCELLED ────┘
```

### Auto-Cancel Rules

- **AWAITING_PAYMENT** for 2+ hours → `CANCELLED`
- **PAYMENT_SUBMITTED** for 24+ hours without salon confirmation → `CANCELLED`
- Notify both salon owner and customer of auto-cancellation

---

## 5. PAYMENT CONFIRMATION FLOW

### Bank Transfer Payment Confirmation

**Customer Side:**

1. Sees "I have paid" button (appears after selecting bank transfer)
2. Clicks button after making transfer
3. Booking moves to `PAYMENT_SUBMITTED`
4. Customer sees: "Payment submitted. Awaiting salon owner confirmation."

**Salon Owner Side:**

1. Receives notification (SMS/Email/In-app) about pending payment
2. Logs into dashboard → Bookings → Pending Confirmations
3. Sees booking with bank transfer details
4. Manually verifies receipt of payment (checks own bank account)
5. Clicks "Confirm Payment" in dashboard
6. Booking moves to `PAID`
7. Both customer and staff are notified

**Platform Safeguard:**

- Keep transaction reference visible to both parties
- Log timestamp of confirmation
- Prevent double-confirmation

---

### Pay-at-Salon Payment Confirmation

**Salon Owner Side:**

1. Service is completed
2. Salon owner or staff logs into app → Bookings
3. Finds booking marked as `PENDING` or `PAID` (check flow)
4. Clicks "Confirm Payment" or "Mark as Complete"
5. Status moves to `PAID` then `COMPLETED`
6. Customer receives confirmation receipt

**No customer action needed** — trusted transaction after service delivery.

---

## 6. BOOKING LIMITS (Feature Enforcement)

### Subscription Plan Booking Limits

| Plan     | Monthly Limit | Behavior at Limit                         |
| -------- | ------------- | ----------------------------------------- |
| Free     | 10 bookings   | Can't create new bookings; upgrade prompt |
| Starter  | 30 bookings   | Can't create new bookings; upgrade prompt |
| Standard | 50 bookings   | Can't create new bookings; upgrade prompt |
| Growth   | 100 bookings  | Can't create new bookings; upgrade prompt |
| Premium  | Unlimited     | No limit                                  |

### Implementation

- Track bookings per salon per calendar month
- Check limit before allowing booking creation
- If limit reached, show upgrade modal with plan comparison
- Reset counter on month change (calendar month Jan 1 - Jan 31, etc.)
- Count all non-cancelled bookings (PENDING, AWAITING_PAYMENT, PAYMENT_SUBMITTED, PAID, COMPLETED)

---

## 7. MONETIZATION MODEL

### Revenue Streams

#### 1. **Monthly Subscription Fees** (Primary Revenue)

- Recurring charge on subscription renewal date
- Plan-based pricing (see Section 1)
- Auto-billing via Paystack or Stripe (Nigeria payments)
- Failed payment → suspension after 7 days grace period

#### 2. **Optional Booking Fees per Transaction** (Secondary Revenue)

- Platform fee per booking: **₦50 - ₦100** (configurable)
- Added to customer's total (customer pays, salon owner gets service price only)
- Can be toggled on/off per salon or globally
- Recommended: OFF for first 3 months (user acquisition), ON after

#### 3. **Paid Add-Ons** (Tertiary Revenue)

- **SMS Notifications:** ₦500/month (10 SMS credits)
- **WhatsApp Notifications:** ₦800/month (20 WhatsApp credits)
- **Extra Staff Accounts:** ₦2,000/month per additional staff (up to plan limit)
- **Marketing Tools:** ₦3,000/month (email campaigns, promo codes)
- **API Access:** ₦5,000/month (for developers/integrations)
- **Priority Support:** ₦1,000/month (dedicated support agent)

---

## 8. SUBSCRIPTION MANAGEMENT

### Subscription Lifecycle

#### Subscription States

- **TRIAL** (14 days free)
- **ACTIVE** (paid and current)
- **PAST_DUE** (payment failed, 7-day grace)
- **CANCELLED** (no longer active)
- **SUSPENDED** (feature-limited; e.g., unpaid)

#### Trial Period

- New salons get 14-day free trial on all features
- No card required during trial
- Day 13: Reminder email "Your trial ends in 1 day"
- Day 14: Option to subscribe or downgrade to Free plan
- Day 15: Auto-downgrade to Free if no action taken

#### Renewal

- Monthly auto-renewal on the same day of month
- 3-day advance reminder
- Failed payment → 7-day grace period
- After 7 days: Features restricted or suspended

#### Cancellation

- Salon owner can cancel anytime from Settings
- Immediate downgrade to Free plan
- If Free plan booking limit exceeded → booking requests rejected
- Pro-rated refund (if applicable, depends on payment processor)

---

## 9. FEATURE RESTRICTIONS BASED ON SUBSCRIPTION

### Feature Access Matrix

| Feature            | Free | Starter | Standard | Growth   | Premium    |
| ------------------ | ---- | ------- | -------- | -------- | ---------- |
| Bookings/month     | 10   | 30      | 50       | 100      | ∞          |
| Staff management   | 1    | 2       | 5        | ∞        | ∞          |
| Services/staff     | 3    | 5       | 10       | 20       | ∞          |
| Basic dashboard    | ✓    | ✓       | ✓        | ✓        | ✓          |
| Analytics          | ✗    | ✗       | Basic    | Advanced | AI-Powered |
| SMS/WhatsApp       | ✗    | Add-on  | Add-on   | ✓        | ✓          |
| Recurring bookings | ✗    | ✗       | ✗        | ✓        | ✓          |
| Multi-branch       | ✗    | ✗       | ✗        | ✗        | ✓          |
| API access         | ✗    | ✗       | ✗        | Add-on   | ✓          |
| Priority support   | ✗    | ✗       | Add-on   | Add-on   | ✓          |
| Custom branding    | ✗    | ✗       | ✗        | ✓        | ✓          |
| Automation tools   | ✗    | ✗       | ✗        | ✓        | ✓          |

### Enforcement Rules

1. **Hard Limit:** If subscription expires or booking limit reached → show warning modal, prevent new bookings
2. **Soft Limit:** Missing a feature → show upgrade prompt in UI, don't block access to other features
3. **Graceful Downgrade:** If downgrading from Premium to Starter → existing 10 staff members still visible but can't edit until compliant
4. **Upgrade Prompts:** Show contextual upgrade modals ("Unlock analytics with Standard plan")

---

## 10. SYSTEM RULES

### Subscription Expiry Handling

**If Subscription Expires or Invoice Unpaid:**

Option 1: **Disable New Bookings** (Recommended for SaaS model)

- Existing bookings continue
- Can't create new bookings
- Dashboard shows "Subscription expired" banner
- Prompt to renew or downgrade to Free plan

Option 2: **Feature Restriction** (Gradual degradation)

- New bookings allowed but limited to Free plan limits
- Analytics hidden
- Advanced features disabled
- Still functional, but diminished

**Recommended Approach:** Option 1

- Simpler to implement
- Encourages timely renewal
- Maintains data integrity

### Booking Limit Enforcement

**When limit reached during month:**

1. Show modal: "You've reached your booking limit (30/30) for January"
2. "Upgrade to Standard plan (₦10,000/month) to get 50 bookings"
3. Show pricing comparison table
4. Option to upgrade or close modal
5. Block booking creation until upgraded or month resets

**Edge Cases:**

- Partial month (e.g., upgrade on Jan 15) → pro-rated limit calculation
- Booking cancellation → should NOT decrement quota (counts toward limit)
- Trial bookings → COUNT toward limit

---

## 11. USER EXPERIENCE GOALS

### Design Philosophy

1. **Low Entry Barrier**
   - Free plan to try without commitment
   - No upfront cost (except subscription renewal)
   - Simple onboarding (5 minutes max)

2. **Flexible Payment**
   - Bank transfer (no payment gateway fees charged to salon)
   - Pay-at-salon (zero friction upfront)
   - Multiple remittance methods

3. **Encourage Upgrades**
   - Free plan drastically limited (10 bookings)
   - Clear upgrade paths in UI
   - Show growth trajectory ("You've had 25 bookings. Standard plan = 50!")

4. **Trust & Transparency**
   - Direct payment to salon owner (platform doesn't hold money)
   - Clear pricing, no hidden fees
   - Manual payment confirmation (salon owner verifies on own bank)

5. **Accessibility**
   - Mobile-first design (salons use phones)
   - Local language support (future: Yoruba, Igbo, Hausa)
   - Simple analytics (not overwhelming)

---

## 12. ONBOARDING FLOW

### Step-by-Step Salon Owner Onboarding

1. **Sign Up** (2 min)
   - Email / Phone
   - Password
   - Salon name

2. **Salon Details** (3 min)
   - Salon address
   - Phone number
   - Operating hours

3. **Bank Account** (2 min)
   - Account name
   - Account number
   - Bank name
   - [Verify bank account - optional API integration]

4. **Services** (3 min)
   - Add 3-5 basic services
   - Name, price, duration

5. **Staff** (2 min)
   - Add staff members (optional)
   - Assign services to staff

6. **Welcome** (1 min)
   - Summary of plan (Free/Starter/Trial)
   - Link to dashboard

**Total Onboarding Time:** ~10 minutes
**Success Metric:** >80% completion rate

---

## 13. CUSTOMER BOOKING FLOW

### Customer Perspective (First-Time Booking)

1. **Find Salon** → Search/Browse
2. **View Services** → Click service
3. **Select Time Slot** → Pick date/time from available slots
4. **Enter Contact Info** → Phone (optional), email
5. **Choose Payment** → Bank Transfer OR Pay at Salon
6. **Confirm** → Review & submit
7. **Receive Confirmation** → SMS/Email with booking ID + salon details

**Total Booking Time:** ~3 minutes

---

## 14. ADMIN DASHBOARD

### Salon Owner Dashboard

**Home/Overview Tab:**

- Total bookings (month/year)
- Revenue collected (month/year)
- Upcoming bookings (next 7 days)
- Customer satisfaction (reviews/ratings)

**Booking Management Tab:**

- List all bookings (filterable by status, date, staff)
- Quick actions: Confirm payment, Mark complete, Cancel
- Bulk actions (select multiple, mark as complete)

**Analytics Tab (Growth+ plans):**

- Bookings by service
- Revenue trends (chart)
- Customer repeat rates
- Peak hours
- Staff performance

**Settings Tab:**

- Salon info (edit name, address, phone)
- Bank account management (update details)
- Staff management (add/remove/edit)
- Services management (add/remove/edit)
- Notification preferences
- Subscription management (view plan, upgrade/downgrade)

**Payments Tab (Growth+ plans):**

- Payment history
- Revenue reconciliation
- Bank transfer logs

---

## 15. SUCCESS METRICS & KPIs

### User Acquisition

- Signups per week
- Free trial → paid conversion rate (target: 20%)
- Free → Starter upgrade rate (target: 40% of Free active)

### Monetization

- Average subscription value (MRR - Monthly Recurring Revenue)
- Churn rate (target: <5% quarterly)
- Upgrade frequency (Free → Starter → Standard)
- Add-on adoption rate

### Product

- Bookings per active salon (target: 5+ per day)
- Mobile app usage (target: 60%+ of traffic)
- Customer satisfaction (target: 4.5+ star rating)
- Payment success rate (target: 95%+)

---

## 16. ROLLOUT PLAN

### Phase 1 (MVP - Weeks 1-4)

- ✅ Free Plan (10 bookings/month, basic booking)
- ✅ Starter Plan (30 bookings/month, ₦5,000/month)
- ✅ Booking system (PENDING, AWAITING_PAYMENT, PAID, COMPLETED statuses)
- ✅ Bank transfer payment flow
- ✅ Bank account registration
- ✅ Basic salon owner dashboard

### Phase 2 (Weeks 5-12)

- Standard Plan (50 bookings/month, ₦10,000/month)
- Basic analytics dashboard
- SMS notifications (Paystack SMS API)
- Booking limit enforcement
- Multi-staff management (assign services to staff)

### Phase 3 (Weeks 13-16)

- Growth Plan (100 bookings/month, ₦15,000/month)
- Advanced analytics
- Recurring bookings
- Custom branding
- Automation rules

### Phase 4 (Weeks 17-20)

- Premium Plan (Unlimited, ₦30,000/month)
- Multi-branch support
- API access
- AI-powered insights
- Marketing tools

---

## 17. TECHNICAL REQUIREMENTS

### Database Schema Updates (if needed)

```sql
-- Salon Model: Add bank account fields
ALTER TABLE Salon ADD COLUMN bankAccountName VARCHAR(255);
ALTER TABLE Salon ADD COLUMN bankAccountNumber VARCHAR(20);
ALTER TABLE Salon ADD COLUMN bankName VARCHAR(100);
ALTER TABLE Salon ADD COLUMN bankVerified BOOLEAN DEFAULT false;
ALTER TABLE Salon ADD COLUMN bankVerificationDate TIMESTAMP;

-- Booking Model: Update status enum
-- BookingStatus: PENDING | AWAITING_PAYMENT | PAYMENT_SUBMITTED | PAID | COMPLETED | CANCELLED

-- Subscription Model: Ensure SubscriptionPlan enum covers all plans
-- SubscriptionPlan: FREE | STARTER | STANDARD | GROWTH | PREMIUM
```

### API Endpoints (to be implemented/updated)

- `POST /api/subscriptions` - Create subscription
- `PUT /api/subscriptions/:id` - Update subscription (upgrade/downgrade)
- `POST /api/bookings` - Create booking (with payment selection)
- `PUT /api/bookings/:id/payment-confirm` - Salon owner confirms payment
- `PUT /api/bookings/:id/status` - Update booking status
- `GET /api/bookings/monthly-count` - Check booking limit
- `GET /api/salon/:id/bank-details` - Get salon bank details (for customer payment screen)

### Payment Gateway Integration

- **Primary:** Paystack (for SA subscription billing + add-ons)
- **Alternative:** Stripe (for future international expansion)

### Notifications

- **SMS:** Paystack SMS API or Twilio
- **Email:** SendGrid or Mailgun
- **In-app:** WebSocket or polling

---

## 18. COMPLIANCE & LEGAL

### Data Protection

- User data encrypted at rest (AES-256)
- Bank details encrypted separately
- Audit logs for all sensitive operations
- GDPR compliance (for EU users in future)

### Payment Compliance

- PCI DSS compliance (third-party payment processor)
- Terms of Service clarifying payment responsibility
- Fraud detection & prevention

### Terms & Conditions

- Subscription auto-renewal policy
- Cancellation terms (refund policy)
- Dispute resolution for failed payments
- Platform liability limits

---

## 19. APPENDIX: PRICING EXAMPLES

### Scenario: Small Salon Owner

- Plan: **Starter** (₦5,000/month)
- Bookings: 25/month
- Booking fee (per booking): ₦50
- Services: Hair, makeup, nails
- Staff: 2 stylists

**Monthly Revenue to Platform:**

- Subscription: ₦5,000
- Booking fees: 25 × ₦50 = ₦1,250
- **Total MRR:** ₦6,250

---

### Scenario: Growing Salon Chain

- Plan: **Premium** (₦30,000/month)
- Bookings: 150+/month (unlimited)
- Booking fee: ₦100 per booking
- Services: Hair, makeup, nails, spa, massages
- Staff: 15+ employees across 2 locations
- Add-ons: SMS (₦500), Email marketing (₦3,000)

**Monthly Revenue to Platform:**

- Subscription: ₦30,000
- Booking fees: 150 × ₦100 = ₦15,000
- Add-ons: ₦3,500
- **Total MRR:** ₦48,500

---

## 20. FAQ

### For Salon Owners

**Q: Where does customer payment go?**  
A: Directly to your bank account. We never hold customer money. You manage payment confirmation in your dashboard.

**Q: What if the customer doesn't actually pay?**  
A: You manually verify the transfer amount matches, then confirm in our dashboard. If you don't confirm within 24 hours, the booking auto-cancels.

**Q: Can I refund a customer?**  
A: Yes, process refunds directly with your bank (outside our platform). Mark the booking as cancelled in your dashboard for record-keeping.

**Q: Do I pay transaction fees?**  
A: No. Our platform fee is the monthly subscription. Bank transfers have no extra fees beyond your bank's normal transfer cost.

**Q: What happens when my subscription expires?**  
A: You'll get warned 3 days before. If it expires, you can't create new bookings until you renew. Existing bookings are safe.

---

### For Customers

**Q: Is my payment info safe?**  
A: We don't store payment info. You transfer directly to the salon owner's bank account — the same way you'd pay anyone.

**Q: Can I pay at the salon instead of online?**  
A: Yes! Select "Pay at Salon" when booking. Just show up and pay cash after your service.

**Q: What if I need to cancel my booking?**  
A: Cancel anytime in your confirmation email or by contacting the salon. Refunds depend on the salon's policy.

---

## Document Version History

| Version | Date       | Author       | Changes                                      |
| ------- | ---------- | ------------ | -------------------------------------------- |
| 1.0     | 2026-03-26 | Product Team | Initial comprehensive specification document |

---

**Last Updated:** March 26, 2026  
**Next Review:** Q2 2026 (after Phase 2 completion)
