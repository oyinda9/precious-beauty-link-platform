"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertCircle,
  Copy,
  CheckCircle,
  X,
  Download,
  Share2,
  Clock,
  MapPin,
  Smartphone,
} from "lucide-react";
import { getBankDetails } from "@/lib/bank-details";

interface BookingConfirmationModalProps {
  bookingId: string;
  amount: number;
  salonName: string;
  serviceName: string;
  bookingDate: string;
  startTime: string;
  paymentMethod: "BANK_TRANSFER" | "PAY_AT_SALON";
  onClose: () => void;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
}

export function BookingConfirmationModal({
  bookingId,
  amount,
  salonName,
  serviceName,
  bookingDate,
  startTime,
  paymentMethod,
  onClose,
  bankAccountName,
  bankAccountNumber,
  bankName,
}: BookingConfirmationModalProps) {
  const [copied, setCopied] = useState<string | null>(null);
  
  // Use salon's bank details if provided, otherwise fallback to default
  const defaultDetails = getBankDetails();
  const bankDetails = {
    accountName: bankAccountName || defaultDetails.accountName,
    accountNumber: bankAccountNumber || defaultDetails.accountNumber,
    bankName: bankName || defaultDetails.bankName,
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShare = () => {
    const message = `I just booked an appointment at ${salonName} for ${serviceName} on ${formatDate(bookingDate)} at ${startTime}. Booking ID: ${bookingId}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return date;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <Card className="w-full max-w-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
        {/* Success Header */}
        <div className="bg-linear-to-r from-green-500 to-emerald-600 px-6 sm:px-8 py-5 sm:py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 rounded-full blur animate-pulse"></div>
                <div className="relative bg-white rounded-full p-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Booking Confirmed!
                </h2>
                <p className="text-green-100 text-sm sm:text-base mt-1">
                  Your appointment is all set
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Booking Reference */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
              Booking Reference
            </p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono">
                {bookingId}
              </p>
              <button
                onClick={() => handleCopy(bookingId, "bookingId")}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {copied === "bookingId" ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-1.5">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  Salon
                </p>
              </div>
              <p className="text-base font-semibold text-slate-900 dark:text-white">
                {salonName}
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-1.5">
                <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
                <p className="text-sm font-medium text-purple-900 dark:text-purple-300">
                  Service
                </p>
              </div>
              <p className="text-base font-semibold text-slate-900 dark:text-white">
                {serviceName}
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-1.5">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0" />
                <p className="text-sm font-medium text-orange-900 dark:text-orange-300">
                  Date & Time
                </p>
              </div>
              <p className="text-base font-semibold text-slate-900 dark:text-white">
                {formatDate(bookingDate)} at {startTime}
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
              <p className="text-xs font-medium text-green-900 dark:text-green-300 mb-1">
                Total Amount
              </p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                ₦{amount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Payment Status Section */}
          <div
            className={`rounded-lg p-3 border-2 ${
              paymentMethod === "BANK_TRANSFER"
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
            }`}
          >
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  paymentMethod === "BANK_TRANSFER"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              />
              <p
                className={`text-sm font-medium ${
                  paymentMethod === "BANK_TRANSFER"
                    ? "text-blue-900 dark:text-blue-300"
                    : "text-amber-900 dark:text-amber-300"
                }`}
              >
                {paymentMethod === "BANK_TRANSFER"
                  ? "Bank Transfer Required - 2 hours to pay"
                  : "Pay at Salon - Arrive a few minutes early"}
              </p>
            </div>

            {/* Bank Transfer Details */}
            {paymentMethod === "BANK_TRANSFER" && bankDetails && (
              <div className="space-y-2">
                {bankDetails.accountName && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-400 block mb-1.5 uppercase tracking-wide">
                      Account Name
                    </label>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-blue-200 dark:border-blue-800">
                      <span className="flex-1 font-mono text-sm font-medium text-slate-900 dark:text-white">
                        {bankDetails.accountName}
                      </span>
                      <button
                        onClick={() =>
                          handleCopy(
                            bankDetails.accountName || "",
                            "accountName",
                          )
                        }
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      >
                        {copied === "accountName" ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {bankDetails.accountNumber && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-400 block mb-1.5 uppercase tracking-wide">
                      Account Number
                    </label>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-blue-200 dark:border-blue-800">
                      <span className="flex-1 font-mono text-sm font-bold text-slate-900 dark:text-white">
                        {bankDetails.accountNumber}
                      </span>
                      <button
                        onClick={() =>
                          handleCopy(
                            bankDetails.accountNumber || "",
                            "accountNumber",
                          )
                        }
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      >
                        {copied === "accountNumber" ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {bankDetails.bankName && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-400 block mb-1.5 uppercase tracking-wide">
                      Bank Name
                    </label>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-blue-200 dark:border-blue-800">
                      <span className="text-sm font-medium text-slate-900 dark:text-white flex-1">
                        {bankDetails.bankName}
                      </span>
                      <button
                        onClick={() =>
                          handleCopy(bankDetails.bankName || "", "bankName")
                        }
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      >
                        {copied === "bankName" ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">
              Next Steps:
            </h4>
            <ol className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {paymentMethod === "BANK_TRANSFER" ? (
                <>
                  <li className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold shrink-0">
                      1
                    </span>
                    <span>
                      Transfer the amount using the bank details above
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold shrink-0">
                      2
                    </span>
                    <span>You'll receive a confirmation SMS/WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold shrink-0">
                      3
                    </span>
                    <span>Arrive 5 minutes early on your scheduled date</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold shrink-0">
                      1
                    </span>
                    <span>Arrive 5 minutes early at the salon</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold shrink-0">
                      2
                    </span>
                    <span>Confirm your booking with reception</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold shrink-0">
                      3
                    </span>
                    <span>Pay the amount when service is completed</span>
                  </li>
                </>
              )}
            </ol>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 px-4 sm:px-5 py-3 flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleShare}
            variant="outline"
            className="flex items-center justify-center gap-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="flex items-center justify-center gap-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-slate-300 dark:border-slate-600"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                handleShare();
                onClose();
              }}
              className="flex-1 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              Done & Share
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
