# SalonBook - Salon Booking Platform

A comprehensive, production-ready salon booking platform built with modern web technologies. Connect clients with beauty salons, manage appointments, and streamline salon operations.

## Overview

SalonBook is a full-stack application that enables:

- **Clients** to discover salons, book appointments, and leave reviews
- **Salon Owners** to manage their salon, services, and bookings
- **Admins** to oversee the entire platform with analytics and user management

## 📋 Documentation

**Start here for product & implementation details:**

| Document                                                       | Purpose                                                                                                                                                                    |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [**PRODUCT_SPECIFICATION.md**](PRODUCT_SPECIFICATION.md)       | **Complete product spec** — Subscription plans, booking flows, payment methods, monetization, and user experience goals. Read this first to understand the product vision. |
| [**IMPLEMENTATION_CHECKLIST.md**](IMPLEMENTATION_CHECKLIST.md) | **Development roadmap** — Phase-by-phase checklist of all features to implement, from database updates to testing and deployment.                                          |
| [**SCHEMA_MIGRATION_GUIDE.md**](SCHEMA_MIGRATION_GUIDE.md)     | **Database migration instructions** — Step-by-step guide for updating Prisma schema to support subscriptions, booking limits, and bank transfers.                          |
| [**SETUP.md**](SETUP.md)                                       | Setup and quickstart instructions                                                                                                                                          |
| [**DEPLOYMENT.md**](DEPLOYMENT.md)                             | Production deployment guide                                                                                                                                                |

> **Key Features (from Product Spec):**
>
> - 5 subscription plans (Free → Premium) with booking limits
> - Bank transfer + pay-at-salon payment options
> - Direct payments to salon owners (platform-agnostic)
> - Booking status workflow: PENDING → AWAITING_PAYMENT → PAYMENT_SUBMITTED → PAID → COMPLETED
> - Monthly subscription billing via Paystack

## Tech Stack

### Frontend

- **Framework:** Next.js 16 with React 19
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Icons:** Lucide React

### Backend

- **Runtime:** Node.js with Next.js API Routes
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** JWT + bcryptjs
- **Validation:** Zod

### Infrastructure

- **Package Manager:** pnpm
- **Deployment:** Vercel ready

## Project Structure

```
salon-booking/
├── app/
│   ├── api/                          # API Routes
│   │   ├── auth/
│   │   │   ├── register/route.ts     # User registration
│   │   │   ├── login/route.ts        # User login
│   │   │   ├── logout/route.ts       # User logout
│   │   │   └── me/route.ts           # Get current user
│   │   ├── salons/
│   │   │   ├── route.ts              # List/create salons
│   │   │   ├── [id]/route.ts         # Get/update/delete salon
│   │   │   └── [id]/services/route.ts # Manage services
│   │   ├── bookings/
│   │   │   ├── route.ts              # List/create bookings
│   │   │   └── [id]/route.ts         # Get/update/cancel booking
│   │   └── reviews/route.ts          # Manage reviews
│   ├── dashboard/                    # Admin Dashboard
│   │   ├── page.tsx                  # Overview with stats
│   │   ├── layout.tsx                # Dashboard layout
│   │   ├── salons/page.tsx           # Salon management
│   │   ├── users/page.tsx            # User management
│   │   └── analytics/page.tsx        # Analytics & insights
│   ├── login/page.tsx                # Login page
│   ├── register/page.tsx             # Registration page
│   └── page.tsx                      # Landing page
├── components/
│   └── ui/                           # shadcn/ui components
├── lib/
│   ├── prisma.ts                     # Prisma client
│   ├── auth.ts                       # Auth utilities (JWT, password)
│   └── middleware.ts                 # Auth middleware
├── prisma/
│   └── schema.prisma                 # Database schema
├── scripts/
│   ├── seed.ts                       # Database seeding
│   └── migrate.sh                    # Migration script
├── SETUP.md                          # Setup instructions
├── README.md                         # This file
└── package.json                      # Dependencies

```

## Database Schema

The platform uses 9 interconnected tables:

### Core Tables

- **Users:** User accounts with role-based access (ADMIN, SALON_OWNER, CLIENT)
- **Admin:** Admin-specific data
- **SalonOwner:** Salon owner profiles with license info
- **Client:** Client profiles with preferred salons

### Salon Management

- **Salon:** Salon information, location, ratings
- **Service:** Services offered by salons (price, duration)
- **TimeSlot:** Available working hours for salons

### Bookings & Reviews

- **Booking:** Client appointments with status tracking
- **Review:** Ratings and comments from clients

### Communication

- **Message:** Direct messaging between users

## API Endpoints

### Authentication (No Auth Required)

```
POST   /api/auth/register         # Register new user
POST   /api/auth/login            # User login
POST   /api/auth/logout           # User logout
GET    /api/auth/me               # Get current user info
```

### Salons (Public Read, Auth Required for Write)

```
GET    /api/salons                # List all salons (filterable)
POST   /api/salons                # Create salon (ADMIN/OWNER)
GET    /api/salons/[id]           # Get salon details
PUT    /api/salons/[id]           # Update salon
DELETE /api/salons/[id]           # Delete salon (ADMIN)
```

### Services (Auth Required)

```
GET    /api/salons/[id]/services  # List salon services
POST   /api/salons/[id]/services  # Create service (OWNER)
```

### Bookings (Auth Required)

```
GET    /api/bookings              # List user bookings (filtered by role)
POST   /api/bookings              # Create booking (CLIENT)
GET    /api/bookings/[id]         # Get booking details
PUT    /api/bookings/[id]         # Update booking status
DELETE /api/bookings/[id]         # Cancel booking
```

### Reviews (Auth Required)

```
GET    /api/reviews               # List salon reviews (with query)
POST   /api/reviews               # Create review (CLIENT)
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- pnpm (or npm/yarn)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd salon-booking
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local`:

   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/salon_booking"
   JWT_SECRET="your-secret-key-change-in-production"
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   ```

4. **Setup database**

   ```bash
   pnpm db:push
   pnpm db:seed
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000)

## Demo Credentials

After running the seed script:

| Role        | Email            | Password    |
| ----------- | ---------------- | ----------- |
| Admin       | admin@salon.com  | password123 |
| Salon Owner | owner@salon.com  | password123 |
| Client      | client@salon.com | password123 |

## Key Features

### Client Features

✅ Browse salons with search and filters  
✅ View salon details and services  
✅ Book appointments with conflict detection  
✅ Manage bookings (view, cancel)  
✅ Leave reviews and ratings  
✅ Track booking history

### Salon Owner Features

✅ Manage salon information  
✅ Add and edit services  
✅ View and manage bookings  
✅ Set working hours  
✅ View customer reviews  
✅ Access performance metrics

### Admin Features

✅ Manage all salons  
✅ Manage users (view, filter)  
✅ Analytics dashboard  
✅ Booking overview  
✅ Revenue tracking  
✅ Platform-wide statistics

## Authentication & Security

- **Password Security:** bcryptjs with salt rounds
- **Token Management:** JWT with 30-day expiration
- **Session Storage:** HTTP-only cookies
- **CORS:** Same-origin by default
- **Input Validation:** Zod schema validation
- **SQL Injection Prevention:** Parameterized queries via Prisma

## Available Scripts

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm db:push          # Push schema to database
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed database with demo data
```

## Deployment

### Deploy to Vercel

1. **Push to GitHub**

   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Add environment variables
   - Deploy

### Environment Variables on Vercel

- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: Secure random string (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `NEXT_PUBLIC_API_URL`: Your production URL

## Development Roadmap

### Phase 2 - Enhanced Features

- [ ] Real-time messaging with WebSockets
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Payment processing (Stripe)
- [ ] Staff management for salons
- [ ] Multi-location salon support

### Phase 3 - Mobile & Advanced

- [ ] Mobile app (React Native)
- [ ] Advanced calendar view
- [ ] Waitlist system
- [ ] Loyalty program
- [ ] Marketing tools
- [ ] API for third-party integrations

## Performance Optimizations

- Prisma query optimization
- Database indexes on frequently queried fields
- Next.js image optimization
- Efficient date handling with date-fns
- Client-side caching with fetch
- Server-side caching potential

## Error Handling

All API endpoints include:

- Proper HTTP status codes
- Structured error messages
- Input validation
- Authorization checks
- Database constraint enforcement

## Testing

The platform includes example flows for:

- User registration and login
- Salon creation and management
- Booking workflow
- Review submission
- Admin operations

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL

# Reset migrations
pnpm prisma migrate reset
```

### Authentication Issues

- Clear browser cookies
- Verify JWT_SECRET is set
- Check token expiration

### Build Issues

```bash
# Clear build cache
rm -rf .next
pnpm build
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions:

- Check the [SETUP.md](SETUP.md) file
- Review API documentation in code comments
- Check Prisma docs: https://www.prisma.io/docs/
- Next.js docs: https://nextjs.org/docs

## Acknowledgments

- Built with Next.js and Vercel
- UI components from shadcn/ui
- Database powered by PostgreSQL and Prisma
- Icons from Lucide React
