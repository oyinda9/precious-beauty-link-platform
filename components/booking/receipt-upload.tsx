"use client";

import { useState, useRef } from "react";
import {
  Upload,
  FileCheck,
  AlertCircle,
  Loader2,
  X,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ReceiptUploadProps {
  bookingId: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export function ReceiptUpload({
  bookingId,
  onSuccess,
  onClose,
}: ReceiptUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState<string>("");
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

  const handleUpload = async () => {
    if (!uploadedFile) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const response = await fetch(`/api/bookings/${bookingId}/receipt`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload receipt");
      }

      const data = await response.json();
      setSuccess("Receipt uploaded successfully!");
      setSubmitted(true);
      setUploadedFile(null);
      setPreview("");

      // Call onSuccess callback
      onSuccess?.();

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose?.();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to upload receipt");
    } finally {
      setUploading(false);
    }
  };

  if (submitted && success) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-sm font-medium text-green-700 dark:text-green-300">
            {success}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div>
        <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-2">
          Upload Payment Receipt
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
          Upload a screenshot or PDF of your bank transfer confirmation as proof
          of payment
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {preview && (
        <div className="space-y-2">
          <img
            src={preview}
            alt="Receipt preview"
            className="w-full h-32 object-cover rounded border border-blue-200 dark:border-blue-800"
          />
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {uploadedFile?.name}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          disabled={uploading}
          className="text-xs"
        />

        <Button
          onClick={handleUpload}
          disabled={!uploadedFile || uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
          size="sm"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Receipt
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Supported formats: JPG, PNG, GIF, PDF (Max 5MB)
      </p>
    </div>
  );
}
