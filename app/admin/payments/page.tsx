"use client";

import { useState, useEffect } from "react";
import {
  Check,
  X,
  Loader2,
  AlertCircle,
  Eye,
  Image as ImageIcon,
  FileText,
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

export default function PaymentVerificationPage() {
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
      const res = await fetch("/api/admin/payments/pending", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch pending payments");
      }

      const data = await res.json();
      setPayments(data.payments || []);
    } catch (err: any) {
      setError(err.message || "Failed to load pending payments");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (salonId: string, approved: boolean) => {
    setVerifying(salonId);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/subscriptions/${salonId}/verify-payment`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading pending payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Payment Verification
          </h1>
          <p className="text-gray-600">
            Review and approve subscription payment proofs
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Pending Review</p>
                <p className="text-3xl font-bold text-gray-900">
                  {
                    payments.filter((p) => p.status === "PENDING_PAYMENT")
                      .length
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Approved</p>
                <p className="text-3xl font-bold text-gray-900">
                  {payments.filter((p) => p.status === "ACTIVE").length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Rejected</p>
                <p className="text-3xl font-bold text-gray-900">
                  {
                    payments.filter((p) => p.status === "PAYMENT_REJECTED")
                      .length
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3 mb-6">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Pending Payments List */}
        <div className="space-y-4">
          {payments.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-50" />
                <p className="text-gray-600 text-lg">No pending payments</p>
                <p className="text-gray-500 text-sm">
                  All payment proofs have been verified
                </p>
              </CardContent>
            </Card>
          ) : (
            payments.map((payment) => (
              <Card
                key={payment.id}
                className={`border-2 transition-all cursor-pointer ${
                  selectedPayment?.id === payment.id
                    ? "border-purple-600 bg-purple-50/50"
                    : "border-gray-200 hover:border-purple-300"
                }`}
                onClick={() =>
                  setSelectedPayment(
                    selectedPayment?.id === payment.id ? null : payment,
                  )
                }
              >
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Top Row - Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">
                          Salon
                        </p>
                        <p className="font-semibold text-gray-900">
                          {payment.salonName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {payment.ownerName}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">
                          Plan
                        </p>
                        <p className="font-semibold text-gray-900">
                          {payment.plan}
                        </p>
                        <p className="text-sm text-green-600 font-semibold">
                          ₦{payment.amount.toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">
                          Status
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {payment.status === "PENDING_PAYMENT" && (
                            <>
                              <Clock className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm font-semibold text-yellow-700">
                                Pending
                              </span>
                            </>
                          )}
                          {payment.status === "ACTIVE" && (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-semibold text-green-700">
                                Approved
                              </span>
                            </>
                          )}
                          {payment.status === "PAYMENT_REJECTED" && (
                            <>
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span className="text-sm font-semibold text-red-700">
                                Rejected
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">
                          Submitted
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(payment.createdAt).toLocaleDateString()} at{" "}
                          {new Date(payment.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedPayment?.id === payment.id && (
                      <div className="border-t pt-4 space-y-4">
                        {/* Contact Info */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                            Contact Information
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-600">Email: </span>
                            <span className="font-mono text-gray-900">
                              {payment.ownerEmail}
                            </span>
                          </p>
                        </div>

                        {/* Payment Details */}
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <p className="text-xs text-gray-500 uppercase font-semibold mb-3">
                            Expected Payment Details
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Account Holder:
                              </span>
                              <span className="text-sm font-semibold text-gray-900">
                                {payment.bankDetails.accountName}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Account Number:
                              </span>
                              <span className="text-sm font-mono font-semibold text-gray-900">
                                {payment.bankDetails.accountNumber}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Bank:
                              </span>
                              <span className="text-sm font-semibold text-gray-900">
                                {payment.bankDetails.bankName}
                              </span>
                            </div>
                            <div className="border-t border-purple-200 pt-2 mt-2 flex justify-between">
                              <span className="text-sm font-semibold text-gray-600">
                                Amount:
                              </span>
                              <span className="text-lg font-bold text-purple-600">
                                ₦{payment.amount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Payment Proof */}
                        {payment.manualPaymentProof && (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-500 uppercase font-semibold">
                              Proof of Payment
                            </p>
                            {payment.manualPaymentProof.startsWith(
                              "data:image",
                            ) ? (
                              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                  src={payment.manualPaymentProof}
                                  alt="Payment proof"
                                  className="w-full h-auto max-h-96 object-cover"
                                />
                              </div>
                            ) : payment.manualPaymentProof.includes("pdf") ? (
                              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
                                <FileText className="w-8 h-8 text-red-500" />
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    PDF Document
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {payment.manualPaymentProof
                                      .split("/")
                                      .pop()}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                                <p className="text-sm text-gray-600">
                                  View attached proof
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Buttons - Only show for PENDING payments */}
                        {payment.status === "PENDING_PAYMENT" && (
                          <div className="flex gap-3 pt-4 border-t">
                            <Button
                              onClick={() =>
                                handleVerifyPayment(payment.salonId, true)
                              }
                              disabled={verifying === payment.salonId}
                              className="flex-1 h-11 bg-green-600 text-white hover:bg-green-700"
                            >
                              {verifying === payment.salonId ? (
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
                                handleVerifyPayment(payment.salonId, false)
                              }
                              disabled={verifying === payment.salonId}
                              variant="outline"
                              className="flex-1 h-11 border-red-300 text-red-600 hover:bg-red-50"
                            >
                              {verifying === payment.salonId ? (
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

                        {/* Status Badge for Approved/Rejected */}
                        {payment.status !== "PENDING_PAYMENT" && (
                          <div className="p-4 rounded-lg text-center font-semibold">
                            {payment.status === "ACTIVE" ? (
                              <div className="bg-green-100 text-green-800 py-2 rounded">
                                ✓ Payment Approved - Subscription Active
                              </div>
                            ) : (
                              <div className="bg-red-100 text-red-800 py-2 rounded">
                                ✗ Payment Rejected
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
