"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";

interface BankAccountFormProps {
  salonId: string;
  initialData?: {
    bankAccountName?: string;
    bankAccountNumber?: string;
    bankName?: string;
  };
  onSuccess?: () => void;
}

const NIGERIAN_BANKS = [
  "First Bank",
  "GTBank",
  "UBA",
  "Access Bank",
  "FCMB",
  "Zenith Bank",
  "Guaranty Trust Bank",
  "Fidelity Bank",
  "Union Bank",
  "Stanbic IBTC",
  "Wema Bank",
  "Sterling Bank",
  "Polaris Bank",
  "ALAT",
  "Other",
];

export function SalonBankAccountForm({
  salonId,
  initialData,
  onSuccess,
}: BankAccountFormProps) {
  const [accountName, setAccountName] = useState(
    initialData?.bankAccountName || "",
  );
  const [accountNumber, setAccountNumber] = useState(
    initialData?.bankAccountNumber || "",
  );
  const [bankName, setBankName] = useState(initialData?.bankName || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!accountName.trim()) {
      setError("Account name is required");
      return;
    }

    if (!accountNumber.trim()) {
      setError("Account number is required");
      return;
    }

    if (accountNumber.length !== 10) {
      setError("Account number must be 10 digits");
      return;
    }

    if (!bankName.trim()) {
      setError("Bank name is required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/salons/${salonId}/bank-account`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bankAccountName: accountName,
          bankAccountNumber: accountNumber,
          bankName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update bank account");
      }

      setSuccess(true);
      setError(null);
      onSuccess?.();

      // Reset form after 2 seconds
      setTimeout(() => {
        setAccountName("");
        setAccountNumber("");
        setBankName("");
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-slate-900/50 border-purple-500/30">
      <h3 className="text-lg font-bold text-white mb-2">
        Bank Account Details
      </h3>
      <p className="text-sm text-purple-300 mb-6">
        Enter your bank account details. These will be displayed to customers
        during payment.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Account Name */}
        <div>
          <label className="block text-sm font-medium text-purple-300 mb-2">
            Account Name *
          </label>
          <Input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="e.g., Tunde's Salon Ltd"
            disabled={isLoading}
            className="bg-slate-800/50 border-purple-500/30 text-white placeholder-purple-400/50"
          />
          <p className="text-xs text-purple-400 mt-1">
            Name on your bank account
          </p>
        </div>

        {/* Account Number */}
        <div>
          <label className="block text-sm font-medium text-purple-300 mb-2">
            Account Number *
          </label>
          <Input
            type="text"
            value={accountNumber}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 10);
              setAccountNumber(val);
            }}
            placeholder="10-digit account number"
            disabled={isLoading}
            className="bg-slate-800/50 border-purple-500/30 text-white placeholder-purple-400/50 font-mono"
          />
          <p className="text-xs text-purple-400 mt-1">
            10-digit Nigerian bank account number
          </p>
        </div>

        {/* Bank Name */}
        <div>
          <label className="block text-sm font-medium text-purple-300 mb-2">
            Bank Name *
          </label>
          <select
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 bg-slate-800/50 border border-purple-500/30 text-white rounded-lg focus:outline-none focus:border-purple-500"
          >
            <option value="">Select your bank</option>
            {NIGERIAN_BANKS.map((bank) => (
              <option key={bank} value={bank}>
                {bank}
              </option>
            ))}
          </select>
          <p className="text-xs text-purple-400 mt-1">
            Select your bank from the list
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex gap-2 p-3 bg-red-900/30 border border-red-500/30 rounded text-red-300 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="flex gap-2 p-3 bg-green-900/30 border border-green-500/30 rounded text-green-300 text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>Bank account updated successfully!</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          {isLoading && <Loader className="w-4 h-4 animate-spin" />}
          {isLoading ? "Saving..." : "Save Bank Account"}
        </Button>
      </form>

      {/* Security Note */}
      <div className="mt-4 p-3 bg-purple-500/5 border border-purple-500/20 rounded">
        <p className="text-xs text-purple-300">
          🔒 <strong>Security:</strong> Your bank account details are encrypted
          and only displayed to customers during payment. We never process
          payments directly.
        </p>
      </div>
    </Card>
  );
}
