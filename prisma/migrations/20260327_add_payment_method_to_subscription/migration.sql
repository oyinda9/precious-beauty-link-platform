-- Add payment-related columns to Subscription table
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT DEFAULT 'MONNIFY';
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "manualPaymentProof" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "paymentVerifiedAt" TIMESTAMP(3);
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "paymentVerifiedBy" TEXT;

-- Create index for paymentVerifiedAt
CREATE INDEX IF NOT EXISTS "Subscription_paymentVerifiedAt_idx" ON "Subscription"("paymentVerifiedAt");
