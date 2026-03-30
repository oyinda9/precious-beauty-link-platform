import { prisma } from "@/lib/prisma";

export interface PaymentConfig {
  id: string;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  bankCode: string | null;
  cardHolderName: string | null;
  cardLastFour: string | null;
  cardBrand: string | null;
  acceptBankTransfer: boolean;
  acceptCardPayment: boolean;
  paymentNote: string | null;
}

/**
 * Get the active payment configuration for custom payments
 */
export async function getPaymentConfig(): Promise<PaymentConfig | null> {
  try {
    const config = await prisma.adminPaymentConfig.findFirst({
      where: { isActive: true },
    });
    return config as PaymentConfig | null;
  } catch (error) {
    console.error("Error fetching payment config:", error);
    return null;
  }
}

/**
 * Check if custom payment methods are available
 */
export async function hasCustomPaymentMethods(): Promise<boolean> {
  const config = await getPaymentConfig();
  if (!config) return false;
  return config.acceptBankTransfer || config.acceptCardPayment;
}

/**
 * Get available payment methods
 */
export async function getAvailablePaymentMethods(): Promise<string[]> {
  const config = await getPaymentConfig();
  if (!config) return ["MONNIFY", "PAYSTACK"];

  const methods: string[] = [];
  if (config.acceptBankTransfer) methods.push("BANK_TRANSFER");
  if (config.acceptCardPayment) methods.push("CARD_PAYMENT");

  // Always include Monnify and Paystack as fallback options
  methods.push("MONNIFY");
  methods.push("PAYSTACK");

  return methods;
}

/**
 * Format bank account for display (masked)
 */
export function formatBankAccountForDisplay(
  accountNumber: string | null | undefined,
): string {
  if (!accountNumber) return "";
  if (accountNumber.length <= 4) return accountNumber;
  const lastFour = accountNumber.slice(-4);
  return `****${lastFour}`;
}

/**
 * Create a bank transfer reference for manual verification
 */
export function generatePaymentReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BT-${timestamp}-${random}`;
}
