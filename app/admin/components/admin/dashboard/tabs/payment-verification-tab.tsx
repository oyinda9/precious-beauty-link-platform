"use client";

import { useEffect, useState } from "react";
import {
  Check,
  X,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PendingPayment {
  id: string;
  salonId: string;
  salonName: string;
  ownerName: string;
  ownerEmail: string;
  plan: string;
  amount: number;
  status: string;
  manualPaymentProof?: string;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
  createdAt: string;
}

export function PaymentVerificationTab() {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(
    null,
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/admin/payments/pending", {
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch pending payments");
      }

      const data = await res.json();
      setPayments(data.payments || []);
    } catch (err: any) {
      setError(err.message || "Failed to load pending payments");
      console.error("[PaymentVerificationTab] Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (salonId: string, approved: boolean) => {
    setVerifying(salonId);
    setError("");
    setSuccess("");

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const res = await fetch(`/api/subscriptions/${salonId}/verify-payment`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ approved }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setSuccess(
        approved
          ? `✓ Payment approved! Subscription activated for ${selectedPayment?.salonName}`
          : `✗ Payment rejected for ${selectedPayment?.salonName}`,
      );

      setSelectedPayment(null);
      setTimeout(() => {
        fetchPendingPayments();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to verify payment");
    } finally {
      setVerifying(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  const pendingCount = payments.filter(
    (p) => p.status === "PENDING_PAYMENT",
  ).length;
  const approvedCount = payments.filter((p) => p.status === "ACTIVE").length;
  const rejectedCount = payments.filter(
    (p) => p.status === "PAYMENT_REJECTED",
  ).length;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-slate-800/40 border border-purple-500/30 p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-xs text-purple-300 font-semibold">
              Pending
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{pendingCount}</p>
        </div>
        <div className="rounded-lg bg-slate-800/40 border border-purple-500/30 p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-xs text-purple-300 font-semibold">
              Approved
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{approvedCount}</p>
        </div>
        <div className="rounded-lg bg-slate-800/40 border border-purple-500/30 p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-xs text-purple-300 font-semibold">
              Rejected
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{rejectedCount}</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded flex gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded flex gap-2">
          <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
          <p className="text-xs text-green-300">{success}</p>
        </div>
      )}

      {/* Payments List - Compact Table View */}
      <div className="rounded-lg border border-purple-500/30 overflow-hidden bg-slate-800/40">
        {payments.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3 opacity-50" />
            <p className="text-purple-300 text-sm">All payments verified</p>
          </div>
        ) : (
          <div className="divide-y divide-purple-500/20">
            {/* Header */}
            <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-slate-900/40 text-xs font-semibold text-purple-300 uppercase">
              <div className="col-span-3">Salon / Owner</div>
              <div className="col-span-2">Plan</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-3">Actions</div>
            </div>

            {/* Rows */}
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="grid grid-cols-12 gap-3 px-4 py-3 hover:bg-slate-700/30 transition-colors border-t border-purple-500/20"
              >
                {/* Salon / Owner */}
                <div className="col-span-3">
                  <p className="font-semibold text-white text-sm truncate">
                    {payment.salonName}
                  </p>
                  <p className="text-xs text-purple-300 truncate">
                    {payment.ownerEmail}
                  </p>
                </div>

                {/* Plan */}
                <div className="col-span-2">
                  <p className="text-sm text-white font-medium">
                    {payment.plan}
                  </p>
                </div>

                {/* Amount */}
                <div className="col-span-2">
                  <p className="text-sm font-semibold text-green-400">
                    ₦{payment.amount.toLocaleString()}
                  </p>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <div className="flex items-center gap-1">
                    {payment.status === "PENDING_PAYMENT" && (
                      <>
                        <Clock className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs font-semibold text-yellow-400">
                          Pending
                        </span>
                      </>
                    )}
                    {payment.status === "ACTIVE" && (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-xs font-semibold text-green-400">
                          Approved
                        </span>
                      </>
                    )}
                    {payment.status === "PAYMENT_REJECTED" && (
                      <>
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-xs font-semibold text-red-400">
                          Rejected
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-3 flex gap-2">
                  {payment.status === "PENDING_PAYMENT" ? (
                    <>
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          handleVerifyPayment(payment.salonId, true);
                        }}
                        disabled={verifying === payment.salonId}
                        className="flexitems-center justify-center px-2 py-1 bg-green-600/80 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors"
                      >
                        {verifying === payment.salonId ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          handleVerifyPayment(payment.salonId, false);
                        }}
                        disabled={verifying === payment.salonId}
                        className="flex items-center justify-center px-2 py-1 bg-red-600/80 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors"
                      >
                        {verifying === payment.salonId ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="px-2 py-1 bg-purple-600/50 hover:bg-purple-600 text-white text-xs font-semibold rounded transition-colors"
                      >
                        View
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-purple-300">
                      {payment.status === "ACTIVE"
                        ? "✓ Completed"
                        : "✗ Rejected"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expanded Details Modal - only when selected */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card className="w-full max-w-2xl bg-slate-800 border-purple-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">
                    {selectedPayment.salonName}
                  </CardTitle>
                  <CardDescription className="text-purple-300">
                    {selectedPayment.ownerEmail}
                  </CardDescription>
                </div>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-purple-300 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Payment Details */}
              <div className="bg-purple-500/10 p-4 rounded border border-purple-500/20">
                <p className="text-xs text-purple-400 mb-2 font-semibold">
                  EXPECTED PAYMENT
                </p>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-purple-300">Account Number:</span>
                    <span className="font-mono text-white">
                      {selectedPayment.bankDetails.accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-300">Name:</span>
                    <span className="text-white">
                      {selectedPayment.bankDetails.accountName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-300">Bank:</span>
                    <span className="text-white">
                      {selectedPayment.bankDetails.bankName}
                    </span>
                  </div>
                  <div className="border-t border-purple-500/20 pt-2 mt-2 flex justify-between">
                    <span className="text-purple-300 font-semibold">
                      Amount:
                    </span>
                    <span className="text-lg font-bold text-green-400">
                      ₦{selectedPayment.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Proof Preview */}
              {selectedPayment.manualPaymentProof &&
                selectedPayment.manualPaymentProof.startsWith("data:image") && (
                  <div className="rounded overflow-hidden max-h-72">
                    <img
                      src={selectedPayment.manualPaymentProof}
                      alt="Payment proof"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

              {/* Action Buttons */}
              {selectedPayment.status === "PENDING_PAYMENT" && (
                <div className="flex gap-2 pt-4 border-t border-purple-500/20">
                  <Button
                    onClick={() =>
                      handleVerifyPayment(selectedPayment.salonId, true)
                    }
                    disabled={verifying === selectedPayment.salonId}
                    className="flex-1 h-10 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {verifying === selectedPayment.salonId ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Approve Payment
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() =>
                      handleVerifyPayment(selectedPayment.salonId, false)
                    }
                    disabled={verifying === selectedPayment.salonId}
                    variant="outline"
                    className="flex-1 h-10 border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    {verifying === selectedPayment.salonId ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Reject Payment
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
