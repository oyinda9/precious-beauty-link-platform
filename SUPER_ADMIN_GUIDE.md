# Super Admin Operations Guide

## Overview
As a super admin, you now have full access to:
- ✅ View dashboard with all statistics
- ✅ Manage all salons (view, edit, delete)
- ✅ Approve/reject payments
- ✅ View all users and bookings
- ✅ Access admin analytics

## Debugging "Forbidden" Errors

If you're getting a "Forbidden" error, follow these steps:

### 1. Verify Your Admin Status
```
GET /api/admin/verify
Header: Authorization: Bearer {your_token}
```

This endpoint will tell you:
- If your token is valid
- Your user role
- Whether you're a super admin

**Example Response (Success):**
```json
{
  "authorized": true,
  "isSuperAdmin": true,
  "user": {
    "id": "user123",
    "email": "superadmin@example.com",
    "role": "SUPER_ADMIN"
  },
  "message": "✓ You are a super admin with full access"
}
```

**Example Response (Failed):**
```json
{
  "authorized": false,
  "isSuperAdmin": false,
  "user": {
    "role": "CLIENT"
  },
  "message": "✗ You are not a super admin (role: CLIENT)"
}
```

### 2. Check Browser Console
Open DevTools (F12) → Console tab and look for:
- `[Admin Dashboard]` logs with error details
- Network tab to verify Authorization header is being sent

### 3. Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| "No token in Authorization header" | Make sure you're logged in. Close and reopen the admin panel. |
| "Invalid token" | Your authentication token expired. Log out and log back in. |
| "Requires SUPER_ADMIN role" | Your user account doesn't have SUPER_ADMIN role. Check database. |
| "Missing token" | Browser might be blocking localStorage. Check browser privacy settings. |

## Super Admin Endpoints

### Dashboard
```
GET /api/admin/dashboard
Authorization: Bearer {token}
```
Returns all statistics, salons, users, bookings.

### Verify Admin Status
```
GET /api/admin/verify
Authorization: Bearer {token}
```
Returns current user info and super admin status.

### Delete Any Salon
```
DELETE /api/salons/{slug}
Authorization: Bearer {token}
```
Soft-delete (deactivate) any salon.

### Update Any Salon
```
PUT /api/salons/{slug}
Authorization: Bearer {token}
Body: { name, email, phone, city, address, ... }
```
Edit any salon details.

### Verify Payments
```
PUT /api/subscriptions/{salonId}/verify-payment
Authorization: Bearer {token}
Body: { approved: true/false }
```
Approve or reject pending payments.

## Creating a Super Admin Account

If you need to create a new super admin:

```bash
npx ts-node scripts/create-superadmin.ts
```

This creates a user with:
- Email: `superadmin@example.com`
- Password: `SuperSecurePassword123!`
- Role: `SUPER_ADMIN`

You can modify the credentials in `scripts/create-superadmin.ts` before running.

## Troubleshooting Checklist

- [ ] Token is present in Authorization header (check Network tab)
- [ ] Token is not expired (verify via /api/admin/verify)
- [ ] User has SUPER_ADMIN role in database
- [ ] Browser isn't blocking localStorage
- [ ] You're using correct format: `Bearer {token}`
- [ ] Request headers include `Content-Type: application/json`

## Security Notes

⚠️ **Remember:**
- Super admin can delete any salon
- Super admin can modify any user's data
- Keep your super admin credentials secure
- Don't share authentication tokens
