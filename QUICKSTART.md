# Quick Start Guide - SalonBook

Get SalonBook running locally in 5 minutes.

## 1. Install Dependencies

```bash
pnpm install
```

## 2. Setup Database

Create a `.env.local` file:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/salon_booking"
JWT_SECRET="your-secret-key-here"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### Option A: Local PostgreSQL

```bash
# Create database
createdb salon_booking

# Create user (if needed)
createuser -P postgres
```

### Option B: Docker

```bash
docker run --name salon-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=salon_booking \
  -p 5432:5432 \
  -d postgres:15
```

## 3. Initialize Database

```bash
# Run migrations
pnpm db:push

# Seed with demo data
pnpm db:seed
```

## 4. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 5. Login with Demo Account

- **Email:** admin@salon.com
- **Password:** password123

## Project Structure Overview

- **`/app`** - Pages and API routes
  - `/api` - Backend endpoints
  - `/dashboard` - Admin interface
  - `/login` - Authentication pages
- **`/lib`** - Utilities (auth, prisma, middleware)
- **`/prisma`** - Database schema
- **`/scripts`** - Database seed script
- **`/components/ui`** - UI components (shadcn/ui)

## Available Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start prod server
pnpm db:push          # Sync schema to database
pnpm db:seed          # Seed demo data
pnpm lint             # Run linter
```

## Key Features to Try

### Admin Dashboard
- Go to `/dashboard`
- View statistics and charts
- Manage salons and users

### Client Booking
- Register as a client
- Browse salons
- Book appointments
- Leave reviews

### Salon Owner
- Register as salon owner
- Manage services
- View bookings
- Access analytics

## API Testing

### Register
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

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@salon.com",
    "password": "password123"
  }'
```

### Get Salons
```bash
curl http://localhost:3000/api/salons
```

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env.local`
- Test: `psql $DATABASE_URL -c "SELECT 1;"`

### Port Already in Use
```bash
# Kill process on port 3000 (Linux/Mac)
lsof -ti:3000 | xargs kill -9

# Or use different port
pnpm dev -- -p 3001
```

### Seed Script Fails
```bash
# Reset database
pnpm prisma migrate reset

# Then seed again
pnpm db:seed
```

## Next Steps

1. Read [README.md](README.md) for full documentation
2. Check [SETUP.md](SETUP.md) for detailed setup
3. Review [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
4. Explore API routes in `/app/api`
5. Customize UI in `/app` pages

## Learn More

- **Next.js:** https://nextjs.org/docs
- **Prisma:** https://www.prisma.io/docs/
- **PostgreSQL:** https://www.postgresql.org/docs/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com/

## Getting Help

- Check documentation files (README.md, SETUP.md, DEPLOYMENT.md)
- Review code comments in API routes
- Test with provided API examples
- Check browser console for client-side errors
- Check server logs for API errors

## Tips for Development

- Use browser DevTools to inspect network requests
- Check Prisma Studio: `pnpm prisma studio`
- Use VS Code REST Client extension for API testing
- Keep `pnpm dev` running for hot reload
- Review database schema in `/prisma/schema.prisma`

Enjoy building with SalonBook!
