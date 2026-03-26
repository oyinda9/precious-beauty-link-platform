# SalonBook - Specification Navigation Guide

**Quick reference to find what you need**

---

## 🎯 What Are You Looking For?

### I Want to Understand the Product Vision

**→ Read:** [`PRODUCT_SPECIFICATION.md`](PRODUCT_SPECIFICATION.md)

This is the master document covering:

- ✅ Subscription plans and pricing (5 tiers: Free to Premium)
- ✅ Booking flows (bank transfer + pay-at-salon)
- ✅ Payment confirmation process
- ✅ Booking status lifecycle
- ✅ Monetization model (subscriptions + add-ons + booking fees)
- ✅ Onboarding flows
- ✅ User experience goals
- ✅ Success metrics

**Read Time:** 15-20 minutes  
**Best For:** Product managers, stakeholders, new team members

---

### I Need to Implement the Features

**→ Read:** [`IMPLEMENTATION_CHECKLIST.md`](IMPLEMENTATION_CHECKLIST.md)

This is the development roadmap covering:

- ✅ Phase 1-10 breakdown (from DB schema to launch)
- ✅ All required API endpoints
- ✅ Frontend UI changes needed
- ✅ Backend logic changes needed
- ✅ Testing strategy
- ✅ Security & compliance requirements
- ✅ Deployment checklist

**Read Time:** 20 minutes (reference document)  
**Best For:** Engineers, development leads, QA

---

### I Need to Update the Database Schema

**→ Read:** [`SCHEMA_MIGRATION_GUIDE.md`](SCHEMA_MIGRATION_GUIDE.md)

This is the technical DB migration guide covering:

- ✅ 7 specific schema migrations needed
- ✅ Exact Prisma code changes
- ✅ Data migration SQL
- ✅ Rollback procedures
- ✅ Risk assessment
- ✅ Timeline and testing

**Read Time:** 15 minutes (reference document)  
**Best For:** Database engineers, DevOps, backend leads

---

## 📚 Quick Reference Table

| Scenario                       | Document                      | Section               | Time   |
| ------------------------------ | ----------------------------- | --------------------- | ------ |
| New team member orientation    | PRODUCT_SPEC                  | Sections 1-4          | 10 min |
| Implement booking flow         | IMPL_CHECKLIST                | Phase 3               | 5 min  |
| Design payment confirmation UI | PRODUCT_SPEC                  | Section 5             | 5 min  |
| Implement subscription limits  | IMPL_CHECKLIST                | Phase 2               | 5 min  |
| Update database                | SCHEMA_MIGRATION              | Migration 1-7         | 20 min |
| Plan Q2 release                | IMPL_CHECKLIST                | Rollout Plan          | 5 min  |
| Write API docs                 | PRODUCT_SPEC + IMPL_CHECKLIST | Sections 13 + Phase 2 | 10 min |
| Design bank account form       | PRODUCT_SPEC                  | Section 2             | 5 min  |
| Understand payment security    | PRODUCT_SPEC + IMPL_CHECKLIST | Sections 5 & 8        | 10 min |
| Test subscription renewal      | IMPL_CHECKLIST                | Phase 7               | 10 min |

---

## 🔍 Deep Dive by Role

### Product Manager

1. Start: [`PRODUCT_SPECIFICATION.md`](PRODUCT_SPECIFICATION.md) - Full document
2. Then: [`IMPLEMENTATION_CHECKLIST.md`](IMPLEMENTATION_CHECKLIST.md) - Rollout Plan section
3. Reference: FAQ section in PRODUCT_SPEC for customer objections

**Key Sections:**

- Subscription Plans (Section 1)
- Monetization (Section 7)
- User Experience Goals (Section 11)
- Pricing Examples (Section 19)

---

### Backend Engineer

1. Start: [`IMPLEMENTATION_CHECKLIST.md`](IMPLEMENTATION_CHECKLIST.md) - Phase 1-3
2. Then: [`SCHEMA_MIGRATION_GUIDE.md`](SCHEMA_MIGRATION_GUIDE.md) - All migrations
3. Reference: [`PRODUCT_SPECIFICATION.md`](PRODUCT_SPECIFICATION.md) - Sections 3-6 for business logic

**Key Tasks:**

- Implement booking status transitions (PENDING → PAID → COMPLETED)
- Add payment confirmation endpoints
- Add subscription quota checking
- Migrate database schema
- Implement cron jobs for auto-cancellation

---

### Frontend Engineer

1. Start: [`IMPLEMENTATION_CHECKLIST.md`](IMPLEMENTATION_CHECKLIST.md) - Phase 3-4
2. Reference: [`PRODUCT_SPECIFICATION.md`](PRODUCT_SPECIFICATION.md) - Sections 3, 11, 12
3. UI Reference: Screenshots in PRODUCT_SPEC (link to Figma if available)

**Key Tasks:**

- Build booking flow with payment method selection
- Show bank details on payment screen
- Build salon settings for bank account entry
- Build payment confirmation tab in dashboard
- Add subscription management UI
- Build upgrade/downgrade modals

---

### QA/Testing Engineer

1. Start: [`IMPLEMENTATION_CHECKLIST.md`](IMPLEMENTATION_CHECKLIST.md) - Phase 7
2. Reference: [`PRODUCT_SPECIFICATION.md`](PRODUCT_SPECIFICATION.md) - Booking Status Flow (Section 4)
3. Then: [`SCHEMA_MIGRATION_GUIDE.md`](SCHEMA_MIGRATION_GUIDE.md) - Validation Queries section

**Key Test Cases:**

- Bank transfer payment flow (happy path)
- Pay-at-salon payment flow
- Auto-cancel expired bookings (2 hours)
- Auto-cancel unconfirmed payments (24 hours)
- Subscription upgrade/downgrade
- Booking limit enforcement

---

### DevOps/Infrastructure

1. Start: [`SCHEMA_MIGRATION_GUIDE.md`](SCHEMA_MIGRATION_GUIDE.md) - Complete document
2. Then: [`IMPLEMENTATION_CHECKLIST.md`](IMPLEMENTATION_CHECKLIST.md) - Phase 6, 10
3. Reference: [`PRODUCT_SPECIFICATION.md`](PRODUCT_SPECIFICATION.md) - Section 17

**Key Tasks:**

- Set up Paystack integration (test + prod keys)
- Configure SMS/Email notifications
- Set up cron jobs for quota reset, auto-cancel, reminders
- Set up monitoring & alerting
- Plan blue-green deployment for migrations
- Set up audit logging

---

### Designer/UX

1. Start: [`PRODUCT_SPECIFICATION.md`](PRODUCT_SPECIFICATION.md) - Sections 2, 3, 11, 12
2. Then: [`IMPLEMENTATION_CHECKLIST.md`](IMPLEMENTATION_CHECKLIST.md) - Phase 3-4 UI requirements
3. Reference: Customer journey flows (Sections 3, 12)

**Key Flows to Design:**

- Booking page with payment method selection
- Payment screen showing bank details
- Dashboard bank account settings
- Payment confirmation tab for salon owner
- Subscription plan comparison modal
- Upgrade/downgrade flows

---

## 📊 Status Tracking

| Component              | Status          | Spec Doc           | Impl Checklist      |
| ---------------------- | --------------- | ------------------ | ------------------- |
| Products Spec          | ✅ Complete     | PRODUCT_SPEC       | -                   |
| Implementation Roadmap | ✅ Complete     | -                  | IMPL_CHECKLIST      |
| Database Migrations    | ✅ Planned      | -                  | SCHEMA_MIGRATION    |
| API Endpoints          | ⏳ To Implement | PRODUCT_SPEC §13   | IMPL_CHECKLIST §2   |
| Frontend UI            | ⏳ To Implement | PRODUCT_SPEC §3,11 | IMPL_CHECKLIST §3-4 |
| Payment Integration    | ⏳ To Implement | PRODUCT_SPEC §5    | IMPL_CHECKLIST §6   |
| Testing                | ⏳ To Implement | PRODUCT_SPEC §4    | IMPL_CHECKLIST §7   |

---

## 🚀 Quick Start Checklist

**To get started on any task:**

1. **Read the relevant section** from navigation above
2. **Reference the implementation checklist** for step-by-step guidance
3. **Consult the product spec** for business logic details
4. **Check the migration guide** if database changes needed
5. **Ask questions** if spec is unclear

---

## 📞 Common Questions

**Q: Where do I find the booking status flow?**  
A: [`PRODUCT_SPECIFICATION.md`](PRODUCT_SPECIFICATION.md) Section 4 - "Booking Status Lifecycle"

**Q: How do I implement bank transfer payments?**  
A: [`PRODUCT_SPECIFICATION.md`](PRODUCT_SPECIFICATION.md) Section 3 "Option A" + [`IMPLEMENTATION_CHECKLIST.md`](IMPLEMENTATION_CHECKLIST.md) Phase 2-3

**Q: What database changes are needed?**  
A: [`SCHEMA_MIGRATION_GUIDE.md`](SCHEMA_MIGRATION_GUIDE.md) Migrations 1-7 + [`IMPLEMENTATION_CHECKLIST.md`](IMPLEMENTATION_CHECKLIST.md) Phase 1

**Q: What are the subscription plans and pricing?**  
A: [`PRODUCT_SPECIFICATION.md`](PRODUCT_SPECIFICATION.md) Section 1

**Q: What's the rollout timeline?**  
A: [`IMPLEMENTATION_CHECKLIST.md`](IMPLEMENTATION_CHECKLIST.md) Rollout Plan section

**Q: What payment methods do we support?**  
A: [`PRODUCT_SPECIFICATION.md`](PRODUCT_SPECIFICATION.md) Sections 3-6 + [`IMPLEMENTATION_CHECKLIST.md`](IMPLEMENTATION_CHECKLIST.md) Phase 6

**Q: How do subscription limits work?**  
A: [`PRODUCT_SPECIFICATION.md`](PRODUCT_SPECIFICATION.md) Section 6 + [`IMPLEMENTATION_CHECKLIST.md`](IMPLEMENTATION_CHECKLIST.md) Phase 2

---

## 🔗 Related Documentation

Also see:

- [`START_HERE.md`](START_HERE.md) - Project overview
- [`SETUP.md`](SETUP.md) - Development setup
- [`DEPLOYMENT.md`](DEPLOYMENT.md) - Production deployment
- [`README.md`](README.md) - Quick reference

---

## 📅 Document Updates

| Doc                         | Last Updated   | Next Review    |
| --------------------------- | -------------- | -------------- |
| PRODUCT_SPECIFICATION.md    | March 26, 2026 | Q2 2026        |
| IMPLEMENTATION_CHECKLIST.md | March 26, 2026 | April 9, 2026  |
| SCHEMA_MIGRATION_GUIDE.md   | March 26, 2026 | March 28, 2026 |

---

## 💡 Pro Tips

1. **Bookmark these documents** for quick reference
2. **Share the appropriate doc** with new team members based on their role
3. **Use the checklist** as your implementation task tracker in Jira/Linear
4. **Reference specific sections** in PRs and code reviews
5. **Update these docs** as you learn from implementation

---

**Document Purpose:** Navigation guide for the SalonBook specification suite  
**Created:** March 26, 2026  
**Maintained By:** Engineering Lead + Product Team
