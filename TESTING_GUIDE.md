# Multi-Tenant Salon Booking System - Testing Guide

## Quick Start

### 1. **Setup Database**
```bash
cd c:/Users/shola/precious-beauty-link-platform

# Create migration and push schema
pnpm prisma migrate dev --name init

# Seed initial data
pnpm db:seed
```

### 2. **Start Development Server**
```bash
pnpm dev
```
Application runs on `http://localhost:3000`

---

## System Architecture

### User Roles
- **SUPER_ADMIN**: Full platform access, manage all salons, revenue, subscriptions
- **SALON_ADMIN**: Manage single salon, staff, services, bookings
- **SALON_STAFF**: Provide services, view their bookings
- **CLIENT**: Browse salons, book appointments

---

## Test Scenarios

### **Scenario 1: Client Books Appointment**

#### Step 1: Register as Client
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "client@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "+1234567890",
  "role": "CLIENT"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": { "id": "...", "email": "client@example.com", "role": "CLIENT" }
}
```

**Store the token in localStorage:**
```javascript
localStorage.setItem('auth_token', token);
```

#### Step 2: View Available Salons
```
GET http://localhost:3000/api/salons
```

Response shows all active salons with services and staff.

#### Step 3: Browse Salon Details
```
GET http://localhost:3000/api/salons/[SALON_SLUG]
```

Example:
```
GET http://localhost:3000/api/salons/bella-salon
```

Visit in browser:
```
http://localhost:3000/salon/bella-salon
```

#### Step 4: Book Appointment via UI
Go to: `http://localhost:3000/salon/[salon-slug]`

1. Select a service
2. Optionally select staff
3. Choose date and time
4. Add notes
5. Click "Confirm Booking"

Or POST directly:
```
POST http://localhost:3000/api/bookings
Authorization: Bearer [TOKEN]
Content-Type: application/json

{
  "salonId": "salon-id",
  "serviceId": "service-id",
  "staffId": null,
  "bookingDate": "2026-03-15",
  "startTime": "14:00",
  "endTime": "15:00",
  "notes": "Looking for a relaxing experience"
}
```

#### Step 5: View My Bookings
```
GET http://localhost:3000/api/bookings
Authorization: Bearer [TOKEN]
```

Or visit: `http://localhost:3000/bookings`

---

### **Scenario 2: Salon Admin Manages Bookings**

#### Step 1: Register as Salon Admin
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "admin@bella-salon.com",
  "password": "password123",
  "fullName": "Sarah Admin",
  "phone": "+1234567890",
  "role": "SALON_ADMIN"
}
```

#### Step 2: Assign Admin to Salon (Super Admin Task)
*Requires super admin token*

```
PUT http://localhost:3000/api/salons/bella-salon/admin
Authorization: Bearer [SUPER_ADMIN_TOKEN]
Content-Type: application/json

{
  "userId": "salon-admin-user-id"
}
```

(This would need to be manually added via database for now)

#### Step 3: Add Staff to Salon
```
POST http://localhost:3000/api/salons/bella-salon/staff
Authorization: Bearer [SALON_ADMIN_TOKEN]
Content-Type: application/json

{
  "fullName": "Emma Stylist",
  "email": "emma@bella-salon.com",
  "phone": "+1234567890",
  "password": "password123",
  "specialties": ["haircut", "coloring"],
  "hourlyRate": 25
}
```

#### Step 4: Add Services to Salon
```
POST http://localhost:3000/api/salons/bella-salon/services
Authorization: Bearer [SALON_ADMIN_TOKEN]
Content-Type: application/json

{
  "name": "Full Color Treatment",
  "description": "Professional hair coloring",
  "price": 85.00,
  "duration": 120,
  "category": "coloring",
  "image": "https://example.com/image.jpg"
}
```

#### Step 5: View Salon Admin Dashboard
```
http://localhost:3000/salon-admin/dashboard
```

Shows:
- All bookings for your salon
- Revenue statistics
- Staff management
- Service management

---

### **Scenario 3: Super Admin Oversees Platform**

#### Step 1: Register as Super Admin
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "superadmin@platform.com",
  "password": "password123",
  "fullName": "Platform Admin",
  "phone": "+1234567890",
  "role": "SUPER_ADMIN"
}
```

#### Step 2: View Dashboard
```
GET http://localhost:3000/api/admin/dashboard
Authorization: Bearer [SUPER_ADMIN_TOKEN]
```

Response:
```json
{
  "overview": {
    "totalSalons": 5,
    "activeSalons": 4,
    "totalClients": 42,
    "totalBookings": 156,
    "completedBookings": 120
  },
  "subscriptionBreakdown": [
    { "subscriptionStatus": "ACTIVE", "_count": 3 },
    { "subscriptionStatus": "TRIAL", "_count": 1 }
  ],
  "recentBookings": [...],
  "topSalons": [...]
}
```

Visit: `http://localhost:3000/admin/dashboard`

#### Step 3: View All Salons
```
GET http://localhost:3000/api/salons
Authorization: Bearer [SUPER_ADMIN_TOKEN]
```

Visit: `http://localhost:3000/admin/salons`

#### Step 4: Create New Salon
```
POST http://localhost:3000/api/salons
Authorization: Bearer [SUPER_ADMIN_TOKEN]
Content-Type: application/json

{
  "name": "Luxe Wellness Spa",
  "slug": "luxe-wellness-spa",
  "description": "Premium spa and wellness center",
  "address": "456 Luxury Lane",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "phone": "+12125551234",
  "email": "info@luxewellness.com",
  "website": "https://luxewellness.com"
}
```

#### Step 5: Manage Subscriptions
```
PUT http://localhost:3000/api/salons/luxe-wellness-spa/subscription
Authorization: Bearer [SUPER_ADMIN_TOKEN]
Content-Type: application/json

{
  "plan": "PROFESSIONAL",
  "status": "ACTIVE",
  "trialEndsAt": null
}
```

#### Step 6: View Revenue Analytics
```
GET http://localhost:3000/api/admin/revenue?year=2026&month=3
Authorization: Bearer [SUPER_ADMIN_TOKEN]
```

Response:
```json
{
  "revenue": [
    {
      "id": "...",
      "salonId": "...",
      "amount": 1250.50,
      "month": 3,
      "year": 2026,
      "totalBookings": 15,
      "totalClients": 12,
      "salon": { "name": "Bella Salon" }
    }
  ],
  "totals": {
    "revenue": 5432.10,
    "bookings": 68,
    "clients": 45
  }
}
```

---

## UI Navigation Map

```
HOME (/)
├── /login                    # Login page
├── /register                 # Register page
├── /salons                   # Browse salons (client)
├── /salon/[slug]             # Book appointment
├── /bookings                 # My bookings (client)
├── /salon-admin/dashboard    # Salon admin panel
│   ├── Bookings
│   ├── Staff & Services
│   └── Settings
├── /admin/dashboard          # Super admin overview
├── /admin/salons             # All salons management
├── /admin/revenue            # Revenue analytics
└── /admin/bookings           # All bookings
```

---

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Client Endpoints
- `GET /api/salons` - List all salons
- `GET /api/salons/[slug]` - Get salon details
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get my bookings

### Salon Admin Endpoints
- `POST /api/salons/[slug]/services` - Add service
- `POST /api/salons/[slug]/staff` - Add staff
- `PUT /api/salons/[slug]` - Update salon
- `GET /api/salons/[slug]/services` - List services
- `GET /api/salons/[slug]/staff` - List staff

### Super Admin Endpoints
- `GET /api/salons` - List all salons
- `POST /api/salons` - Create salon
- `PUT /api/salons/[slug]/subscription` - Manage subscription
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/revenue` - Revenue by month

---

## Testing with cURL

### Register Client
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "role": "CLIENT"
  }'
```

### Create Booking
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "salonId": "salon-id",
    "serviceId": "service-id",
    "bookingDate": "2026-03-15",
    "startTime": "14:00"
  }'
```

---

## Troubleshooting

### Token Issues
- Ensure token is stored correctly in localStorage
- Token format: `Authorization: Bearer [token]`
- Check token expiration (default: 7 days)

### Database Issues
```bash
# Reset database
pnpm prisma migrate reset

# Check schema
pnpm prisma studio
```

### API Errors
- Check browser console for errors
- Verify user role has proper permissions
- Ensure all required fields are provided

---

## Next Steps

1. **Payments**: Integrate Stripe for booking payments
2. **Reviews**: Add review system after completed bookings
3. **Notifications**: Email/SMS confirmations
4. **Calendar**: Visual calendar for bookings
5. **Analytics**: Advanced reporting for salon admins

