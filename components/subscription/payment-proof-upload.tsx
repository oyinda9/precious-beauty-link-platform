"use client";

import { useState, useRef } from "react";
import {
  Upload,
  FileCheck,
  AlertCircle,
  Loader2,
  X,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentProofUploadProps {
  subscriptionId: string;
  salonId: string;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    amount: number;
  };
  paymentMethod: "BANK_TRANSFER" | "CARD_PAYMENT" | "CUSTOM_GATEWAY";
  onSuccess?: () => void;
  token?: string;
}

export default function PaymentProofUpload({
  subscriptionId,
  salonId,
  bankDetails,
  paymentMethod,
  onSuccess,
  token,
}: PaymentProofUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState<string>("");
  const [copyFeedback, setCopyFeedback] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Please upload an image (JPG, PNG, GIF) or PDF");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setUploadedFile(file);
    setError("");

    // Generate preview
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview("");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(text === bankDetails.accountNumber ? "number" : "name");
    setTimeout(() => setCopyFeedback(""), 2000);
  };

  const handleSubmitProof = async () => {
    if (!uploadedFile) {
      setError("Please select a file to upload");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      // In a real app, you would upload to a service like Cloudinary, Firebase Storage, or S3
      // For now, we'll use a data URL as proof
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const proofUrl = e.target?.result as string;

          const response = await fetch(
            `/api/subscriptions/${salonId}/verify-payment`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                proofUrl,
                transactionRef: `${Date.now()}`,
                notes: `Payment proof for ${paymentMethod}`,
              }),
            },
          );

          const data = await response.json();

          if (!response.ok) {
            setError(data.error || "Failed to submit payment proof");
            return;
          }

          setSuccess(
            "Payment proof submitted successfully! Our admin will verify and activate your subscription within 24 hours.",
          );
          setSubmitted(true);
          setUploadedFile(null);
          setPreview("");

          // Call success callback after delay
          if (onSuccess) {
            setTimeout(onSuccess, 2000);
          }
        } catch (err: any) {
          setError(err.message || "Failed to submit proof");
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(uploadedFile);
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
      setUploading(false);
    }
  };

  const paymentMethodLabel = {
    BANK_TRANSFER: "Bank Transfer",
    CARD_PAYMENT: "Card Payment",
    CUSTOM_GATEWAY: "Payment Gateway",
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-purple-600" />
          Upload Payment Proof
        </CardTitle>
        <CardDescription>
          Submit your {paymentMethodLabel[paymentMethod]} receipt or transaction
          screenshot
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Payment Details Summary */}
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-sm text-gray-600">Payment Method:</span>
            <span className="font-semibold text-gray-900">
              {paymentMethodLabel[paymentMethod]}
            </span>
          </div>
          <div className="border-t border-purple-200 pt-3 space-y-2">
            <div className="text-sm">
              <p className="text-gray-600">Account Holder:</p>
              <div className="flex items-center justify-between mt-1">
                <p className="font-mono text-gray-900">
                  {bankDetails.accountName}
                </p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bankDetails.accountName)}
                  className="p-1 hover:bg-purple-200 rounded transition-colors"
                  title="Copy account name"
                >
                  <Copy className="w-4 h-4 text-purple-600" />
                </button>
              </div>
              {copyFeedback === "name" && (
                <p className="text-xs text-green-600 mt-1">✓ Copied</p>
              )}
            </div>

            <div className="text-sm">
              <p className="text-gray-600">Account Number:</p>
              <div className="flex items-center justify-between mt-1">
                <p className="font-mono text-gray-900">
                  {bankDetails.accountNumber}
                </p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bankDetails.accountNumber)}
                  className="p-1 hover:bg-purple-200 rounded transition-colors"
                  title="Copy account number"
                >
                  <Copy className="w-4 h-4 text-purple-600" />
                </button>
              </div>
              {copyFeedback === "number" && (
                <p className="text-xs text-green-600 mt-1">✓ Copied</p>
              )}
            </div>

            <div className="text-sm">
              <p className="text-gray-600">Bank:</p>
              <p className="font-semibold text-gray-900 mt-1">
                {bankDetails.bankName}
              </p>
            </div>

            <div className="text-sm bg-white p-2 rounded border border-purple-100">
              <p className="text-gray-600">Amount:</p>
              <p className="font-bold text-lg text-purple-600 mt-1">
                ₦{bankDetails.amount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* File Upload Area */}
        {!submitted && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Upload Receipt or Screenshot{" "}
              <span className="text-red-500">*</span>
            </Label>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50/50 transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!uploadedFile ? (
                <div className="space-y-3">
                  <Upload className="w-12 h-12 text-purple-400 mx-auto" />
                  <div>
                    <p className="font-semibold text-gray-800">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF or PDF (max 5MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <FileCheck className="w-12 h-12 text-green-500 mx-auto" />
                  <p className="font-semibold text-gray-800">
                    {uploadedFile.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}
            </div>

            {/* File Preview */}
            {preview && uploadedFile?.type.startsWith("image/") && (
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="Payment proof preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setUploadedFile(null);
                    setPreview("");
                    setError("");
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmitProof}
              disabled={!uploadedFile || uploading}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading Proof...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Payment Proof
                </>
              )}
            </Button>
          </div>
        )}

        {/* Success State */}
        {submitted && success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
            <div className="flex gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">
                  Proof Submitted Successfully! ✓
                </p>
                <p className="text-sm text-green-700 mt-1">{success}</p>
              </div>
            </div>

            {/* Waiting Note */}
            <div className="p-3 bg-white border border-green-200 rounded space-y-2">
              <p className="text-sm font-medium text-gray-800">
                📋 What happens next:
              </p>
              <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                <li>We've received your payment proof</li>
                <li>Our admin team will verify it within 24 hours</li>
                <li>You'll receive an email once verified</li>
                <li>
                  Your subscription will activate immediately after verification
                </li>
              </ul>
            </div>

            {/* Redirect Message */}
            <p className="text-xs text-gray-500 text-center">
              Redirecting to login in a moment...
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          <p className="font-semibold mb-2">💡 Tip:</p>
          <p>
            Make sure your receipt clearly shows the transaction date, amount (₦
            {bankDetails.amount.toLocaleString()}), and account number for
            faster verification.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
