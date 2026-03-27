/**
 * Bank details utility - centralized access to payment account information
 * Used for displaying bank transfer details to customers
 */

export interface BankDetailsInfo {
  accountName: string | null;
  accountNumber: string | null;
  bankName: string | null;
}

/**
 * Get bank account details from environment variables
 * Available on both client and server side with NEXT_PUBLIC_ prefix
 */
export function getBankDetails(): BankDetailsInfo {
  // These must be NEXT_PUBLIC_ to be accessible on client side
  return {
    accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || null,
    accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || null,
    bankName: process.env.NEXT_PUBLIC_BANK_NAME || null,
  };
}

/**
 * Check if bank details are fully configured
 */
export function isBankDetailsConfigured(): boolean {
  const details = getBankDetails();
  return !!(details.accountName && details.accountNumber && details.bankName);
}

/**
 * Format bank account number for display (mask most digits)
 * e.g., 8132828531 -> ****8531
 */
export function formatAccountNumber(accountNumber: string | null): string | null {
  if (!accountNumber || accountNumber.length < 4) {
    return accountNumber;
  }
  return `****${accountNumber.slice(-4)}`;
}
