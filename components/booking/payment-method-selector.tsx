"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, CreditCard, Banknote } from "lucide-react";

interface PaymentMethodSelectorProps {
  amount: number;
  total_duration: number;
  onSelect: (method: "BANK_TRANSFER" | "PAY_AT_SALON") => void;
  isLoading?: boolean;
}

export function PaymentMethodSelector({
  amount,
  total_duration,
  onSelect,
  isLoading = false,
}: PaymentMethodSelectorProps) {
  const [selected, setSelected] = useState<
    "BANK_TRANSFER" | "PAY_AT_SALON" | null
  >(null);

  const handleSelect = (method: "BANK_TRANSFER" | "PAY_AT_SALON") => {
    setSelected(method);
    onSelect(method);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">
          How would you like to pay?
        </h2>
        <p className="text-purple-300 text-sm">
          Choose your preferred payment method. No payment processing fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bank Transfer Option */}
        <Card
          onClick={() => handleSelect("BANK_TRANSFER")}
          className={`p-6 cursor-pointer transition-all border-2 ${
            selected === "BANK_TRANSFER"
              ? "border-purple-500 bg-purple-500/10"
              : "border-purple-500/30 bg-slate-900/50 hover:border-purple-500/60"
          }`}
        >
          <div className="flex items-start gap-3">
            <CreditCard className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">Bank Transfer</h3>
              <p className="text-sm text-purple-300 mb-3">
                Transfer directly to salon's account. You control when to pay.
              </p>
              <ul className="text-xs text-purple-400 space-y-1">
                <li>✓ No upfront fees</li>
                <li>✓ Direct to salon owner</li>
                <li>✓ 2-hour payment window</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Pay at Salon Option */}
        <Card
          onClick={() => handleSelect("PAY_AT_SALON")}
          className={`p-6 cursor-pointer transition-all border-2 ${
            selected === "PAY_AT_SALON"
              ? "border-purple-500 bg-purple-500/10"
              : "border-purple-500/30 bg-slate-900/50 hover:border-purple-500/60"
          }`}
        >
          <div className="flex items-start gap-3">
            <Banknote className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">Pay at Salon</h3>
              <p className="text-sm text-purple-300 mb-3">
                No upfront payment. Pay after service is complete.
              </p>
              <ul className="text-xs text-purple-400 space-y-1">
                <li>✓ Zero risk</li>
                <li>✓ Pay after service</li>
                <li>✓ Cash payment accepted</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Amount Summary */}
      {selected && (
        <Card className="p-4 bg-purple-500/5 border-purple-500/30">
          <div className="flex justify-between items-center">
            <span className="text-purple-300 font-medium">Total Amount</span>
            <span className="text-2xl font-bold text-white">
              ₦{amount.toLocaleString()}
            </span>
          </div>
          {selected === "BANK_TRANSFER" && (
            <p className="text-xs text-purple-400 mt-2">
              Please complete the bank transfer within 2 hours
            </p>
          )}
          {selected === "PAY_AT_SALON" && (
            <p className="text-xs text-purple-400 mt-2">
              Your booking will be held for 24 hours
            </p>
          )}
        </Card>
      )}

      {/* Info Alert */}
      <div className="flex gap-3 text-xs text-purple-400 bg-purple-500/5 p-3 rounded-lg border border-purple-500/20">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          No credit card needed. Your payment goes directly to the salon owner.
        </p>
      </div>
    </div>
  );
}
