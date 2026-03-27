-- CreateTable "AdminPaymentConfig"
CREATE TABLE IF NOT EXISTS "AdminPaymentConfig" (
    "id" TEXT NOT NULL,
    "bankAccountName" TEXT,
    "bankAccountNumber" TEXT,
    "bankName" TEXT,
    "bankCode" TEXT,
    "cardHolderName" TEXT,
    "cardLastFour" TEXT,
    "cardBrand" TEXT NOT NULL DEFAULT 'VISA',
    "acceptBankTransfer" BOOLEAN NOT NULL DEFAULT true,
    "acceptCardPayment" BOOLEAN NOT NULL DEFAULT true,
    "paymentNote" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminPaymentConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AdminPaymentConfig_isActive_idx" ON "AdminPaymentConfig"("isActive");
