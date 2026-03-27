"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BookingWithReceipt {
  id: string;
  clientPhone: string;
  bookingDate: string;
  totalPrice: number;
  status: string;
  service: {
    name: string;
  };
  payment?: {
    proofOfPayment: string;
    status: string;
  };
}

export function PaymentReceiptsView() {
  const [bookings, setBookings] = useState<BookingWithReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookingsWithReceipts();
  }, []);

  const fetchBookingsWithReceipts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/salon-admin/bookings-with-receipts", {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to load receipts");

      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment receipts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const bookingsWithReceipts = bookings.filter(
    (b) => b.payment?.proofOfPayment,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Payment Receipts
        </h2>
        <Badge className="bg-blue-100 text-blue-800">
          {bookingsWithReceipts.length} Receipt
          {bookingsWithReceipts.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {bookingsWithReceipts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">
              No receipts uploaded yet
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Clients will upload receipts when they make bank transfers
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookingsWithReceipts.map((booking) => (
            <Card
              key={booking.id}
              className="border-slate-200 hover:border-purple-300 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {booking.service.name}
                      </h3>
                      <Badge
                        className={`${
                          booking.payment?.status === "PAID"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {booking.payment?.status === "PAID" ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {booking.payment?.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          Phone
                        </p>
                        <p className="font-mono">{booking.clientPhone}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          Date
                        </p>
                        <p>
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          Amount
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          ₦{booking.totalPrice.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          Booking ID
                        </p>
                        <p className="font-mono text-xs">{booking.id}</p>
                      </div>
                    </div>
                  </div>

                  {booking.payment?.proofOfPayment && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setSelectedReceipt(booking.payment!.proofOfPayment)
                        }
                        className="gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          window.open(
                            booking.payment!.proofOfPayment,
                            "_blank",
                          );
                        }}
                        className="gap-1"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Receipt Preview Dialog */}
      <Dialog
        open={!!selectedReceipt}
        onOpenChange={() => setSelectedReceipt(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Receipt Preview</DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-3">
              {selectedReceipt.endsWith(".pdf") ? (
                <iframe
                  src={selectedReceipt}
                  className="w-full h-96 rounded-lg border"
                />
              ) : (
                <img
                  src={selectedReceipt}
                  alt="Receipt"
                  className="w-full rounded-lg border"
                />
              )}
              <Button
                onClick={() => window.open(selectedReceipt, "_blank")}
                className="w-full gap-2"
              >
                <Download className="w-4 h-4" />
                Download Receipt
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
