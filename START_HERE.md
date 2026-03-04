# 🚀 START HERE - SalonBook Setup

**If you're seeing "Fatal error during initialization", this is the right place!**

## The Problem ❌

The app needs 3 things to work:
1. Dependencies installed
2. Environment variables configured
3. Database connection set up

## The Solution ✅

### Step 1: Create `.env.local` (CRITICAL)

```bash
cp .env.example .env.local
```

This creates the required environment file.

### Step 2: Install Dependencies

```bash
pnpm install
```

Or if using npm:
```bash
npm install
```

### Step 3: Set Up Database

Pick ONE option below:

#### Option A: Local PostgreSQL (Easiest for Development)

```bash
# 1. Make sure PostgreSQL is running
# Mac:     brew services start postgresql
# Linux:   sudo systemctl start postgresql
# Windows: Start PostgreSQL from Services

# 2. Create database
createdb salonbook

# 3. Initialize database tables
pnpm db:push

# 4. Add demo data
pnpm db:seed
```

#### Option B: Docker (If you have Docker installed)

```bash
# Start PostgreSQL container
docker run --name salon-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=salonbook \
  -p 5432:5432 \
  -d postgres:15

# Update DATABASE_URL in .env.local to:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/salonbook"

# Initialize database
pnpm db:push
pnpm db:seed
```

#### Option C: Neon (Cloud Database - No Local Setup)

```bash
# 1. Go to neon.tech and create a free account
# 2. Create a new project
# 3. Copy the connection string from dashboard
# 4. Edit .env.local and replace DATABASE_URL with your Neon connection
# 5. Run:
pnpm db:push
pnpm db:seed
```

### Step 4: Start the Development Server

```bash
pnpm dev
```

You should see:
```
> ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

## Test It Works ✨

1. Open http://localhost:3000
2. Click "Sign In"
3. Use demo credentials:
   - **Email:** `admin@salon.com`
   - **Password:** `password123`
4. Should see the admin dashboard

## Still Getting "Fatal error during initialization"? 🤔

### Check 1: Is .env.local Created?

```bash
# Should show the file exists
ls -la .env.local
```

If it doesn't exist, run:
```bash
cp .env.example .env.local
```

### Check 2: Are Dependencies Installed?

```bash
# Should show many packages
ls node_modules | wc -l
```

If no node_modules, run:
```bash
pnpm install
```

### Check 3: Is DATABASE_URL Set?

```bash
# Should show your database URL
grep DATABASE_URL .env.local
```

Update it in `.env.local` if it's the placeholder value.

### Check 4: Can We Connect to Database?

```bash
# Initialize tables
pnpm db:push
```

If you get connection errors:
- Make sure PostgreSQL is running
- Check DATABASE_URL in .env.local is correct
- Try Option A, B, or C database setup above

### Check 5: Verify Everything

```bash
# Run verification script
node scripts/verify.js
```

Should show all ✅ checks passing.

## Quick Reference

| What | Command | When |
|------|---------|------|
| Create env file | `cp .env.example .env.local` | First time setup |
| Install packages | `pnpm install` | First time or after package.json changes |
| Setup database | `pnpm db:push` | First time after .env.local |
| Add demo data | `pnpm db:seed` | First time after db:push |
| Start app | `pnpm dev` | Every time you work |
| Check setup | `node scripts/verify.js` | When debugging |

## Demo Accounts

After `pnpm db:seed`, you can login as:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@salon.com | password123 |
| Salon Owner | owner@salon.com | password123 |
| Client | client@salon.com | password123 |

## What Gets Created

After `pnpm db:seed`, you'll have:
- ✅ 3 demo user accounts
- ✅ 2 sample salons
- ✅ Services with prices
- ✅ Available time slots
- ✅ Sample bookings
- ✅ Reviews and ratings

## Troubleshooting

### "Port 3000 already in use"
```bash
pnpm dev -- -p 3001
```

### "Cannot find module '@prisma/client'"
```bash
pnpm install
pnpm prisma generate
```

### "Database connection failed"
Check your DATABASE_URL in `.env.local` matches your actual database.

### "ENOENT: no such file or directory, open '.env.local'"
Run: `cp .env.example .env.local`

## Need More Help?

- **Full troubleshooting:** See [INITIALIZATION.md](./INITIALIZATION.md)
- **Detailed setup:** See [QUICKSTART.md](./QUICKSTART.md)
- **What was fixed:** See [FIXES_APPLIED.md](./FIXES_APPLIED.md)
- **Project info:** See [README.md](./README.md)

## TL;DR (Quick Version)

```bash
# Copy env template
cp .env.example .env.local

# Install packages
pnpm install

# Setup database (choose one database option from Step 3 above)

# Initialize tables
pnpm db:push

# Add demo data
pnpm db:seed

# Run!
pnpm dev

# Login with: admin@salon.com / password123
```

---

**You're all set!** 🎉 

Open http://localhost:3000 and start building!
