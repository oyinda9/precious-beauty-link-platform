-- Add bank account columns to Salon table
ALTER TABLE "Salon" ADD COLUMN IF NOT EXISTS "bankAccountName" TEXT;
ALTER TABLE "Salon" ADD COLUMN IF NOT EXISTS "bankAccountNumber" TEXT;
ALTER TABLE "Salon" ADD COLUMN IF NOT EXISTS "bankName" TEXT;
ALTER TABLE "Salon" ADD COLUMN IF NOT EXISTS "bankVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Salon" ADD COLUMN IF NOT EXISTS "bankVerificationDate" TIMESTAMP(3);

-- Add indexes for Salon
CREATE INDEX IF NOT EXISTS "Salon_bankVerified_idx" ON "Salon"("bankVerified");
CREATE INDEX IF NOT EXISTS "Salon_bankVerificationDate_idx" ON "Salon"("bankVerificationDate");

-- Add booking columns to Subscription table
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "monthlyBookingLimit" INTEGER NOT NULL DEFAULT 30;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "bookingsUsedThisMonth" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "bookingResetDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add index for Subscription
CREATE INDEX IF NOT EXISTS "Subscription_bookingResetDate_idx" ON "Subscription"("bookingResetDate");

-- Add paymentMethod column to Booking table if it doesn't exist
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT;
