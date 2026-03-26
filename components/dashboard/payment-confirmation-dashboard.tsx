"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, Loader } from "lucide-react";

interface PendingPayment {
  id: string;
  bookingId: string;
  amount: number;
  createdAt: string;
  booking: {
    id: string;
    clientPhone?: string;
    totalPrice: number;
    service: {
      name: string;
    };
    bookingDate: string;
    startTime: string;
    endTime: string;
  };
}

interface PaymentConfirmationDashboardProps {
  salonId: string;
  payments: PendingPayment[];
  onRefresh?: () => void;
}

export function PaymentConfirmationDashboard({
  salonId,
  payments,
  onRefresh,
}: PaymentConfirmationDashboardProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleConfirmPayment = async (
    bookingId: string,
    paymentId: string,
    notes?: string,
  ) => {
    setLoadingId(paymentId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/payments`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirmationNotes: notes || "" }),
      });

      if (!response.ok) {
        throw new Error("Failed to confirm payment");
      }

      setSuccess(`Payment confirmed for booking ${bookingId}`);
      onRefresh?.();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingId(null);
    }
  };

  if (payments.length === 0) {
    return (
      <Card className="p-8 bg-slate-900/50 border-purple-500/30 text-center">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">All Current</h3>
        <p className="text-purple-300">No pending payment confirmations</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {error && (
        <div className="flex gap-2 p-3 bg-red-900/30 border border-red-500/30 rounded text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex gap-2 p-3 bg-green-900/30 border border-green-500/30 rounded text-green-300 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>{success}</p>
        </div>
      )}

      {/* Payments List */}
      {payments.map((payment) => (
        <Card
          key={payment.id}
          className="p-4 bg-slate-900/50 border-purple-500/30 hover:border-purple-500/50 transition"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-white">
                  {payment.booking.service.name}
                </h4>
                <Badge
                  variant="outline"
                  className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Awaiting Confirmation
                </Badge>
              </div>
              <p className="text-sm text-purple-300">
                Booking ID:{" "}
                <span className="font-mono text-xs">{payment.booking.id}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                ₦{payment.amount.toLocaleString()}
              </p>
              <p className="text-xs text-purple-400">
                {new Date(payment.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Expandable Details */}
          <div className="mb-3 pb-3 border-t border-purple-500/20 pt-3">
            <button
              onClick={() =>
                setExpandedId(expandedId === payment.id ? null : payment.id)
              }
              className="text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              {expandedId === payment.id ? "▼ Hide Details" : "▶ Show Details"}
            </button>

            {expandedId === payment.id && (
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-300">Client Phone:</span>
                  <span className="text-white font-mono">
                    {payment.booking.clientPhone || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Booking Date:</span>
                  <span className="text-white">
                    {new Date(payment.booking.bookingDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Time Slot:</span>
                  <span className="text-white">
                    {payment.booking.startTime} - {payment.booking.endTime}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() =>
                handleConfirmPayment(
                  payment.booking.id,
                  payment.id,
                  "Payment verified",
                )
              }
              disabled={loadingId === payment.id}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              {loadingId === payment.id ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Confirming...
                </>
              ) : (
                "✓ Confirm Payment"
              )}
            </Button>
            <Button
              variant="outline"
              className="border-red-500/30 text-red-300 hover:bg-red-500/10"
              disabled={loadingId === payment.id}
            >
              ✕ Reject
            </Button>
          </div>
        </Card>
      ))}

      {/* Instructions */}
      <Card className="p-4 bg-blue-900/20 border-blue-500/30">
        <p className="text-sm text-blue-300">
          <strong>📋 How to confirm:</strong> Verify the payment has arrived in
          your bank account, then click "Confirm Payment" to mark the booking as
          paid.
        </p>
      </Card>
    </div>
  );
}
