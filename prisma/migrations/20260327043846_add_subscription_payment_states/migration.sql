/*
  Warnings:

  - The values [NO_SHOW] on the enum `BookingStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [TRIAL,PROFESSIONAL,ENTERPRISE] on the enum `SubscriptionPlan` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `stripePaymentId` on the `Payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[referenceNumber]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Made the column `paymentMethod` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Made the column `paymentMethod` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BookingStatus_new" AS ENUM ('PENDING', 'AWAITING_PAYMENT', 'PAYMENT_SUBMITTED', 'CONFIRMED', 'PAID', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."Booking" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "status" TYPE "BookingStatus_new" USING ("status"::text::"BookingStatus_new");
ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "public"."BookingStatus_old";
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionPlan_new" AS ENUM ('FREE', 'STARTER', 'STANDARD', 'GROWTH', 'PREMIUM');
ALTER TABLE "public"."Subscription" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "Subscription" ALTER COLUMN "plan" TYPE "SubscriptionPlan_new" USING ("plan"::text::"SubscriptionPlan_new");
ALTER TYPE "SubscriptionPlan" RENAME TO "SubscriptionPlan_old";
ALTER TYPE "SubscriptionPlan_new" RENAME TO "SubscriptionPlan";
DROP TYPE "public"."SubscriptionPlan_old";
ALTER TABLE "Subscription" ALTER COLUMN "plan" SET DEFAULT 'STARTER';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SubscriptionStatus" ADD VALUE 'PENDING_PAYMENT';
ALTER TYPE "SubscriptionStatus" ADD VALUE 'PAYMENT_REJECTED';

-- DropIndex
DROP INDEX "Payment_stripePaymentId_idx";

-- DropIndex
DROP INDEX "Subscription_paymentVerifiedAt_idx";

-- AlterTable
ALTER TABLE "AdminPaymentConfig" ALTER COLUMN "cardBrand" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "paymentMethod" SET NOT NULL,
ALTER COLUMN "paymentMethod" SET DEFAULT 'PAY_AT_SALON';

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "stripePaymentId",
ADD COLUMN     "bankTransferConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "confirmationNotes" TEXT,
ADD COLUMN     "externalPaymentId" TEXT,
ADD COLUMN     "referenceNumber" TEXT,
ALTER COLUMN "currency" SET DEFAULT 'NGN',
ALTER COLUMN "paymentMethod" SET NOT NULL,
ALTER COLUMN "paymentMethod" SET DEFAULT 'BANK_TRANSFER';

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "actionType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_userId_key" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_actionType_idx" ON "AuditLog"("actionType");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_referenceNumber_key" ON "Payment"("referenceNumber");

-- CreateIndex
CREATE INDEX "Payment_externalPaymentId_idx" ON "Payment"("externalPaymentId");

-- CreateIndex
CREATE INDEX "Payment_referenceNumber_idx" ON "Payment"("referenceNumber");

-- CreateIndex
CREATE INDEX "Payment_bankTransferConfirmedAt_idx" ON "Payment"("bankTransferConfirmedAt");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
