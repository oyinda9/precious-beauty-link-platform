# SalonBook - Setup Guide

A comprehensive salon booking platform built with Next.js, PostgreSQL, and JWT authentication.

## Project Structure

```
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── salons/         # Salon management
│   │   ├── bookings/       # Booking management
│   │   └── reviews/        # Reviews and ratings
│   ├── dashboard/          # Admin dashboard
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── page.tsx            # Homepage
├── lib/
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # Authentication utilities
│   └── middleware.ts       # Auth middleware
├── prisma/
│   └── schema.prisma       # Database schema
└── scripts/
    └── migrate.sh          # Migration script
```

## Database Setup

### Prerequisites
- PostgreSQL 12+
- Node.js 18+
- pnpm (or npm/yarn)

### Steps

1. **Create a PostgreSQL database:**
   ```bash
   createdb salon_booking
   ```

2. **Update .env.local with your database URL:**
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/salon_booking"
   JWT_SECRET="your-secret-key-here"
   ```

3. **Install dependencies:**
   ```bash
   pnpm install
   ```

4. **Run migrations:**
   ```bash
   pnpm prisma migrate dev --name init
   ```

5. **Generate Prisma client:**
   ```bash
   pnpm prisma generate
   ```

## Database Schema

### Users Table
- Stores user information with role-based access (ADMIN, SALON_OWNER, CLIENT)
- Password hashed with bcryptjs

### Salons Table
- Salon details, location, ratings
- Related services and time slots

### Services Table
- Services offered by salons
- Price and duration information

### Bookings Table
- Client bookings with status tracking
- Service, date, time, and pricing

### Reviews Table
- Ratings and comments from clients
- Linked to bookings

### TimeSlots Table
- Available working hours for salons
- Day of week and time ranges

### Messages Table
- Communication between clients and salon owners

### Admin/SalonOwner/Client Tables
- Role-specific data storage

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Salons
- `GET /api/salons` - List all salons (with filters)
- `POST /api/salons` - Create salon (ADMIN/SALON_OWNER)
- `GET /api/salons/[id]` - Get salon details
- `PUT /api/salons/[id]` - Update salon (ADMIN/OWNER)
- `DELETE /api/salons/[id]` - Delete salon (ADMIN)

### Services
- `GET /api/salons/[id]/services` - List salon services
- `POST /api/salons/[id]/services` - Create service (OWNER)

### Bookings
- `GET /api/bookings` - List user's bookings
- `POST /api/bookings` - Create booking (CLIENT)
- `GET /api/bookings/[id]` - Get booking details
- `PUT /api/bookings/[id]` - Update booking
- `DELETE /api/bookings/[id]` - Cancel booking

### Reviews
- `GET /api/reviews` - List salon reviews
- `POST /api/reviews` - Create review (CLIENT)

## Authentication

The application uses JWT-based authentication with HTTP-only cookies. 

### Features:
- Password hashing with bcryptjs
- 30-day token expiration
- Role-based access control (RBAC)
- Protected API routes

## Admin Dashboard

Access at `/dashboard` after login as admin:
- Overview with statistics and charts
- Salon management
- User management
- Analytics dashboard

## Salon Owner Dashboard

Access at `/owner/dashboard` after login as salon owner:
- Manage salon details
- Manage services
- View bookings
- See reviews

## Client Booking System

Access at `/client/bookings` after login as client:
- Browse salons
- View services
- Make bookings
- Manage appointments
- Leave reviews

## Demo Credentials

After creating demo users, use these to test:
- Admin: admin@salon.com / password123
- Salon Owner: owner@salon.com / password123
- Client: client@salon.com / password123

## Running the Application

### Development
```bash
pnpm dev
```
Open http://localhost:3000

### Production Build
```bash
pnpm build
pnpm start
```

## Environment Variables

```
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# JWT
JWT_SECRET="your-secret-key"

# App
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## Key Features Implemented

✅ User authentication with JWT
✅ Role-based access control (ADMIN, SALON_OWNER, CLIENT)
✅ Complete salon management system
✅ Booking system with conflict detection
✅ Review and rating system
✅ Admin dashboard with analytics
✅ Responsive UI with Tailwind CSS
✅ Database schema with relationships

## Next Steps to Complete

1. Create Salon Owner dashboard pages (`/app/owner/dashboard/`)
2. Create Client booking pages (`/app/client/bookings/`)
3. Implement real-time messaging (socket.io or WebSockets)
4. Add payment integration (Stripe)
5. Implement email notifications
6. Add image uploads for salons
7. Create mobile app
8. Add SMS notifications

## Technologies Used

- **Framework:** Next.js 16
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT + bcryptjs
- **UI:** Tailwind CSS + shadcn/ui
- **Charts:** Recharts
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL is correct
- Ensure database exists

### Migration Errors
- Delete `prisma/migrations` and start fresh
- Run `pnpm prisma migrate reset`

### Authentication Issues
- Clear browser cookies
- Check JWT_SECRET is set
- Verify token is being sent in requests

## Support

For issues or questions, refer to:
- Prisma Documentation: https://www.prisma.io/docs/
- Next.js Documentation: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
