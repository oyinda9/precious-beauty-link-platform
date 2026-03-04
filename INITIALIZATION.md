# SalonBook - Initialization Guide

This guide will help you fix the initialization error and get the application running.

## Error: "Fatal error during initialization"

This error typically occurs due to one of the following issues:

### 1. Missing Environment Variables (.env.local)

**Problem:** The `.env.local` file is missing or incomplete.

**Solution:**

1. Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and set the required variables:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/salonbook"
   JWT_SECRET="your-strong-secret-key-here"
   NODE_ENV="development"
   ```

### 2. Missing Dependencies

**Problem:** Dependencies may not be installed properly.

**Solution:**

```bash
# Install all dependencies
pnpm install

# Or if using npm:
npm install

# Or if using yarn:
yarn install
```

### 3. Database Not Connected

**Problem:** Prisma cannot connect to the database.

**Solution for Local PostgreSQL:**

```bash
# 1. Make sure PostgreSQL is running
# Mac (Homebrew): brew services start postgresql
# Linux: sudo systemctl start postgresql
# Windows: Start PostgreSQL from Services

# 2. Create database
createdb salonbook

# 3. Update DATABASE_URL in .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/salonbook"

# 4. Push schema to database
pnpm db:push

# 5. Seed demo data
pnpm db:seed
```

**Solution for Neon (PostgreSQL Hosting):**

```bash
# 1. Create account at neon.tech
# 2. Create a new project
# 3. Copy the connection string
# 4. Update DATABASE_URL in .env.local:
DATABASE_URL="postgresql://user:password@ep-xxxxx.region.neon.tech/salonbook?sslmode=require"

# 5. Push schema to database
pnpm db:push

# 6. Seed demo data
pnpm db:seed
```

### 4. Prisma Client Not Generated

**Problem:** Prisma client may not be generated.

**Solution:**

```bash
# Generate Prisma client
pnpm prisma generate

# Or regenerate with migration
pnpm db:migrate
```

## Complete Setup Steps

Follow these steps in order:

### Step 1: Install Dependencies
```bash
pnpm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your database URL and JWT_SECRET
```

### Step 3: Set Up Database

**For Local PostgreSQL:**
```bash
# Create database
createdb salonbook

# Update .env.local with:
# DATABASE_URL="postgresql://user:password@localhost:5432/salonbook"

# Push schema
pnpm db:push
```

**For Neon:**
```bash
# 1. Go to neon.tech and create a project
# 2. Copy connection string from dashboard
# 3. Update .env.local with DATABASE_URL
# 4. Run:
pnpm db:push
```

### Step 4: Seed Demo Data
```bash
pnpm db:seed
```

This creates:
- Admin user: `admin@salon.com` / `password123`
- Salon owner: `owner@salon.com` / `password123`
- Client user: `client@salon.com` / `password123`
- Sample salons and services

### Step 5: Run Development Server
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Testing After Setup

### 1. Test Admin Login
- URL: `http://localhost:3000/login`
- Email: `admin@salon.com`
- Password: `password123`
- Should redirect to `/dashboard`

### 2. Test API Connection
```bash
curl http://localhost:3000/api/auth/me
# Should return 401 if not authenticated (expected)
```

## Troubleshooting

### "Error: getaddrinfo ENOTFOUND" (Database Connection)
- Check DATABASE_URL in .env.local
- Ensure PostgreSQL is running
- For Neon, ensure you have internet connection

### "Error: Module not found '@prisma/client'"
```bash
pnpm install
pnpm prisma generate
```

### "Error: Column 'ownerIds' does not exist"
- The schema has been fixed
- Run: `pnpm db:push` to update your database

### "Port 3000 already in use"
```bash
pnpm dev -- -p 3001
```

### Prisma Client Generation Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules .next
pnpm install
pnpm prisma generate
```

## What the Database Looks Like

The Prisma schema creates 9 tables:

1. **users** - Main user table with roles (ADMIN, SALON_OWNER, CLIENT)
2. **admin** - Admin profile records
3. **salonowner** - Salon owner profile records
4. **client** - Client profile records
5. **salons** - Salon information
6. **services** - Services offered by salons
7. **bookings** - Appointment bookings
8. **timeslots** - Operating hours/availability
9. **reviews** - Customer reviews and ratings
10. **messages** - Messages between users

## Environment Variables Reference

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | `postgresql://...` | PostgreSQL connection string |
| JWT_SECRET | Yes | `abcd1234...` | Secret key for JWT tokens (32+ chars) |
| NODE_ENV | No | `development` | Environment (development/production) |

## Next Steps

After initialization:

1. Log in as admin: `admin@salon.com` / `password123`
2. Explore the dashboard at `/dashboard`
3. Check the API documentation in the codebase
4. Review the project structure in README.md

## Still Having Issues?

1. Check database connection: `pnpm db:push --skip-generate`
2. Verify env variables: `echo $DATABASE_URL`
3. Check Prisma status: `pnpm prisma db execute --stdin`
4. Review server logs in terminal during `pnpm dev`

For more detailed information, see the README.md and PROJECT_SUMMARY.md files.
