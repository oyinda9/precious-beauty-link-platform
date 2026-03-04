# Salon Owner Onboarding Guide

## How New Salon Owners Register and Create Their Salons

Your platform now has a complete onboarding flow for salon owners to register and create their own salons!

### The Registration Flow

#### Step 1: Choose Account Type
1. Go to `/register`
2. Select **"Salon Owner"** from the Account Type dropdown
3. You'll automatically be redirected to the salon owner registration page

#### Step 2: Create Your Account
On `/register-salon-owner`, **Step 1: Account**:
- Enter your full name
- Enter your email address
- Create a strong password (minimum 8 characters)
- Optionally provide your phone number
- Click **"Continue to Salon Setup"**

#### Step 3: Setup Your Salon
On **Step 2: Salon Setup**:
- **Salon Name**: Enter your salon's name (e.g., "Beauty Haven")
- **Salon URL Slug**: This becomes your public booking URL
  - Auto-generates from salon name (e.g., "beauty-haven")
  - Can be manually edited
  - Real-time validation shows ✓ (available) or ✗ (taken)
  - Results in public booking page: `/salon/beauty-haven`
- **Address**: Street address of your salon
- **City**: City location (required)
- **State**: State/Province (optional)
- **Zip Code**: Postal code (optional)
- **Salon Phone**: Contact number for your salon
- **About Your Salon**: Description that appears on your public page

#### Step 4: Create Account & Salon
- Click **"Create Salon & Account"**
- The system creates:
  - Your user account
  - Your salon with the unique slug
  - Links you as the salon admin
  - Logs you in automatically
- You're redirected to `/salon-admin/dashboard`

### What Happens After Registration

Once registered, salon owners can:

1. **Access their admin dashboard** at `/salon-admin/dashboard`
   - View all bookings
   - Manage booking status (Pending, Confirmed, Completed, Cancelled)
   - See salon statistics and revenue
   - Manage services, staff, and settings

2. **Customers can find your salon** at `/salon/{your-slug}`
   - Public booking page with your salon details
   - Browse services
   - Make bookings without login required
   - Leave reviews

3. **Manage their salon** 
   - Update salon information
   - Add/manage services
   - Manage staff members
   - View bookings and revenue

### API Endpoints Used

- **`POST /api/auth/register`** - Register new user + create salon
  - Now accepts `SALON_ADMIN` role
  - Creates Salon record with slug
  - Creates SalonAdmin record linking user to salon

- **`GET /api/salons/check-slug`** - Real-time slug validation
  - Parameter: `?slug=your-slug`
  - Returns: `{ available: true/false }`

### Key Features

✅ **Real-time Slug Validation** - Check availability as you type
✅ **Auto-generated Slugs** - Automatically creates URL-safe slugs from salon name
✅ **Multi-step Registration** - Separate account and salon setup
✅ **Immediate Access** - Auto-login and redirect to dashboard
✅ **Unique Salon URLs** - Each salon gets unique `/salon/{slug}` page
✅ **Complete Salon Management** - Full admin dashboard access

### Security & Validation

- Slug uniqueness checked before creation
- Email uniqueness enforced
- Password minimum length: 8 characters
- All salon admin operations require authentication
- JWT token-based session management

### Testing the Flow

To test the new registration flow:

1. Go to `http://localhost:3000/register`
2. Select "Salon Owner"
3. You'll be redirected to `/register-salon-owner`
4. Fill in account details (Step 1)
5. Fill in salon details (Step 2)
6. Make sure the slug is available (green checkmark)
7. Click "Create Salon & Account"
8. You should be redirected to your salon admin dashboard

### Example Credentials

For testing, use the existing seed data:
- **Email**: `admin@salon.com`
- **Password**: `password123`
- **Role**: Salon Admin
- **Salon**: Beauty Haven (`beauty-haven`)

### Troubleshooting

**"Salon slug is already taken"**
- The URL slug is not unique
- Try a different variation (e.g., `beauty-haven-2`)

**"Salon details are required"**
- All marked fields (*) on Step 2 are required
- Salon name, slug, address, and city are mandatory

**"Registration failed"**
- Check console for detailed error
- Email might already be in use
- Password must be at least 8 characters

## Summary

Your platform now supports complete self-serve onboarding for salon owners! They can:
1. Register with their email and create a password
2. Setup their salon with all necessary information
3. Automatically get their own admin dashboard
4. Have a public booking page for customers

This eliminates the need for manual salon creation or pre-seeding, making it truly a multi-tenant platform.
