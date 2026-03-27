"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Copy, CheckCircle } from "lucide-react";

interface BankDetails {
  salonName: string;
  accountName: string | null;
  accountNumber: string | null;
  bankName: string | null;
  amount: number;
  reference: string;
}

interface BankTransferPaymentDisplayProps {
  bankDetails?: BankDetails;
  onPaymentSubmitted: () => void;
  isSubmitting?: boolean;
}

// Get bank details from environment variables
function getDefaultBankDetails(amount: number, reference: string): BankDetails {
  return {
    salonName: "Precious Beauty Link",
    accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || null,
    accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || null,
    bankName: process.env.NEXT_PUBLIC_BANK_NAME || null,
    amount,
    reference,
  };
}

export function BankTransferPaymentDisplay({
  bankDetails: providedBankDetails,
  onPaymentSubmitted,
  isSubmitting = false,
}: BankTransferPaymentDisplayProps) {
  const [copied, setCopied] = useState<string | null>(null);

  // Use provided bank details or get from environment - use dummy values if neither exist
  const bankDetails = providedBankDetails || getDefaultBankDetails(0, "");

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-lg border border-purple-500/30 text-white">
        <h3 className="text-lg font-bold mb-1">Transfer Details</h3>
        <p className="text-sm text-purple-200 mb-4">
          Send ₦{bankDetails.amount.toLocaleString()} to this account
        </p>

        {/* Account Details */}
        <div className="space-y-3 mb-6">
          {/* Account Name */}
          {bankDetails.accountName && (
            <div>
              <p className="text-xs text-purple-300 mb-1">Account Name</p>
              <div className="flex items-center justify-between bg-purple-900/50 p-3 rounded border border-purple-400/20">
                <span className="font-mono text-sm">
                  {bankDetails.accountName}
                </span>
                <button
                  onClick={() =>
                    handleCopy(bankDetails.accountName || "", "accountName")
                  }
                  className="p-1 hover:bg-purple-700/50 rounded transition"
                >
                  {copied === "accountName" ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Account Number */}
          {bankDetails.accountNumber && (
            <div>
              <p className="text-xs text-purple-300 mb-1">Account Number</p>
              <div className="flex items-center justify-between bg-purple-900/50 p-3 rounded border border-purple-400/20">
                <span className="font-mono text-sm font-bold">
                  {bankDetails.accountNumber}
                </span>
                <button
                  onClick={() =>
                    handleCopy(bankDetails.accountNumber || "", "accountNumber")
                  }
                  className="p-1 hover:bg-purple-700/50 rounded transition"
                >
                  {copied === "accountNumber" ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Bank Name */}
          {bankDetails.bankName && (
            <div>
              <p className="text-xs text-purple-300 mb-1">Bank</p>
              <div className="flex items-center justify-between bg-purple-900/50 p-3 rounded border border-purple-400/20">
                <span className="text-sm">{bankDetails.bankName}</span>
                <button
                  onClick={() =>
                    handleCopy(bankDetails.bankName || "", "bankName")
                  }
                  className="p-1 hover:bg-purple-700/50 rounded transition"
                >
                  {copied === "bankName" ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <p className="text-xs text-purple-300 mb-1">Amount to Transfer</p>
            <div className="flex items-center justify-between bg-purple-900/50 p-3 rounded border border-purple-400/20">
              <span className="font-mono text-lg font-bold">
                ₦{bankDetails.amount.toLocaleString()}
              </span>
              <button
                onClick={() =>
                  handleCopy(bankDetails.amount.toString(), "amount")
                }
                className="p-1 hover:bg-purple-700/50 rounded transition"
              >
                {copied === "amount" ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Reference */}
          <div>
            <p className="text-xs text-purple-300 mb-1">Reference (Optional)</p>
            <div className="flex items-center justify-between bg-purple-900/50 p-3 rounded border border-purple-400/20">
              <span className="font-mono text-xs">{bankDetails.reference}</span>
              <button
                onClick={() => handleCopy(bankDetails.reference, "reference")}
                className="p-1 hover:bg-purple-700/50 rounded transition"
              >
                {copied === "reference" ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Timer Warning */}
        <div className="flex gap-2 bg-purple-900/50 p-3 rounded border border-yellow-500/30 text-sm mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-400" />
          <p className="text-yellow-100">
            Complete payment within 2 hours or your booking will be
            automatically cancelled
          </p>
        </div>
      </div>

      {/* Instruction Steps */}
      <Card className="p-4 bg-slate-900/50 border-purple-500/30">
        <h4 className="font-bold text-white mb-3">
          Steps to Complete Payment:
        </h4>
        <ol className="space-y-2 text-sm text-purple-300">
          <li>1. Open your mobile banking app or visit your bank's website</li>
          <li>2. Select "Transfer Money" or "Send Money"</li>
          <li>3. Enter the account details shown above</li>
          <li>
            4. Use the reference number in the transfer description (optional
            but helpful)
          </li>
          <li>5. Confirm and complete the transfer</li>
          <li>6. Come back and click "I Have Paid" button below</li>
        </ol>
      </Card>

      {/* Action Button */}
      <Button
        onClick={onPaymentSubmitted}
        disabled={isSubmitting}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold"
      >
        {isSubmitting ? "Processing..." : "I Have Paid"}
      </Button>

      {/* Security Note */}
      <p className="text-xs text-purple-400 text-center">
        💡 This is secure. We never store your payment info. You pay the salon
        directly.
      </p>
    </div>
  );
}
