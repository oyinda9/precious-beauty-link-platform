"use client";

import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BookingConfirmationModal } from "@/components/booking/booking-confirmation-modal";

// Utility to detect iPhone
function isIphone() {
  if (typeof navigator === "undefined") return false;
  return /iPhone/.test(navigator.userAgent);
}
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Scissors,
  User,
  MessageSquare,
  CheckCircle,
  XCircle,
  Check,
} from "lucide-react";

export default function SalonBookingPage() {
  const { slug } = useParams();

  const [salon, setSalon] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [notes, setNotes] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "BANK_TRANSFER" | "PAY_AT_SALON"
  >("PAY_AT_SALON");
  const [submitting, setSubmitting] = useState(false);

  // Confirmation modal state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        if (!slug) return;

        const salonRes = await fetch(`/api/salons/${slug}`);
        if (!salonRes.ok) throw new Error("Salon not found");

        const salonData = await salonRes.json();
        setSalon(salonData.salon);

        const servicesRes = await fetch(`/api/salons/${slug}/services`);
        const servicesData = await servicesRes.json();
        setServices(servicesData.services || []);

        const staffRes = await fetch(`/api/salons/${slug}/staff`);
        const staffData = await staffRes.json();
        setStaff(staffData.staff || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      selectedServices.length === 0 ||
      !bookingDate ||
      !startTime ||
      !clientPhone ||
      !selectedPaymentMethod
    ) {
      toast({
        title: "Missing Fields",
        description:
          "Please select service(s), date, time, phone, and payment method.",
        variant: "destructive",
      });
      return;
    }
    // Basic phone validation
    if (!/^\+?\d{10,15}$/.test(clientPhone.replace(/\s/g, ""))) {
      toast({
        title: "Invalid Phone Number",
        description:
          "Please enter a valid phone number (10-15 digits, include country code if possible).",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const bookingPayload = {
        salonId: salon?.id,
        serviceIds: selectedServices,
        staffId: selectedStaff || undefined,
        bookingDate,
        startTime,
        notes: notes || undefined,
        clientPhone: clientPhone.trim(),
        paymentMethod: selectedPaymentMethod,
      };

      // Log payload for debugging
      console.log("Booking Payload:", bookingPayload);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      const data = await res.json();

      if (res.ok) {
        // Store booking data for modal
        const selectedServicesData = services.filter((s) =>
          selectedServices.includes(s.id),
        );
        const serviceName = selectedServicesData.map((s) => s.name).join(", ");

        setConfirmationData({
          bookingId: data.booking.id,
          amount: data.booking.totalPrice,
          salonName: data.booking.salonName,
          serviceName: serviceName,
          bookingDate: data.booking.bookingDate,
          startTime: data.booking.startTime,
          paymentMethod: data.booking.paymentMethod,
          bankAccountName: salon?.bankAccountName,
          bankAccountNumber: salon?.bankAccountNumber,
          bankName: salon?.bankName,
        });
        setShowConfirmation(true);

        // Clear form
        setSelectedServices([]);
        setSelectedStaff(null);
        setBookingDate("");
        setStartTime("");
        setNotes("");
        setClientPhone("");
        setSelectedPaymentMethod("PAY_AT_SALON");
      } else {
        console.error("Booking error:", data);
        toast({
          title: "Booking Failed",
          description:
            data.error || data.message || "Booking failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Booking exception:", err);
      toast({
        title: "Booking Error",
        description: err.message || "An error occurred while booking.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const selectedServicesData = services.filter((s) =>
    selectedServices.includes(s.id),
  );
  const totalPrice = selectedServicesData.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServicesData.reduce(
    (sum, s) => sum + s.duration,
    0,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading salon details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-red-500 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Salon Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The salon you're looking for doesn't exist.
          </p>
          <Link
            href="/"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition"
          >
            Browse Salons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-pink-50 pb-8">
      {/* Header Card */}
      <div className="bg-white shadow-lg sticky top-0 z-20 border-b border-purple-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-start gap-4">
            <div className="bg-linear-to-br from-purple-600 to-pink-600 rounded-2xl p-4 shadow-lg hidden sm:block">
              <Scissors className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {salon.name}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                {salon.description}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-purple-500 shrink-0" />
                  <span className="truncate">
                    {salon.address}, {salon.city}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>{salon.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <div className="max-w-2xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Form Header */}
          <div className="bg-linear-to-r from-purple-600 to-pink-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Book Your Appointment
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            <form onSubmit={handleBooking} className="space-y-8">
              {/* Services Section - Multiple Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-purple-600" />
                  Select Services * ({selectedServices.length} selected)
                </h3>
                <div className="space-y-3">
                  {services.map((svc) => (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => toggleService(svc.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedServices.includes(svc.id)
                          ? "border-purple-500 bg-purple-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-purple-200 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                selectedServices.includes(svc.id)
                                  ? "border-purple-500 bg-purple-500"
                                  : "border-gray-300 bg-white"
                              }`}
                            >
                              {selectedServices.includes(svc.id) && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span className="font-semibold text-gray-800">
                              {svc.name}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2 ml-7">
                            {svc.description}
                          </p>
                          <div className="flex items-center text-sm text-gray-500 ml-7">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{svc.duration} minutes</span>
                          </div>
                        </div>
                        <span className="font-bold text-purple-600 shrink-0 ml-4">
                          ₦{svc.price.toLocaleString()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Staff Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600" />
                  Select Staff (Optional)
                </h3>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStaff(null)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                      selectedStaff === null
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 bg-white hover:border-purple-200"
                    }`}
                  >
                    <span className="font-medium text-gray-800">
                      🤝 Any Available Staff
                    </span>
                  </button>

                  {staff.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => setSelectedStaff(member.id)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                        selectedStaff === member.id
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 bg-white hover:border-purple-200"
                      }`}
                    >
                      <span className="font-medium text-gray-800 block">
                        {member.fullName}
                      </span>
                      <span className="text-gray-600 text-sm">
                        {member.specialties.join(" • ") || "All services"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Select Date & Time *
                </h3>

                {/* Date & Time Inputs - Fixed for all devices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition bg-white text-gray-800"
                      style={{
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        appearance: "none",
                      }}
                    />
                  </div>

                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition bg-white text-gray-800"
                      style={{
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        appearance: "none",
                      }}
                    />
                  </div>
                </div>

                {startTime && (
                  <p className="mt-3 text-sm text-purple-600">
                    Selected time: {formatTime(startTime)}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-purple-600" />
                  Your Phone Number *
                </h3>
                <input
                  type="tel"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
                  placeholder="e.g. +2348012345678"
                  value={clientPhone}
                  onChange={(e) => {
                    // Filter to only allow digits, +, -, and spaces
                    const filtered = e.target.value.replace(/[^\d+\- ]/g, "");
                    setClientPhone(filtered);
                  }}
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  Additional Notes
                </h3>
                <textarea
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
                  rows={3}
                  placeholder="Any special requests or preferences? (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">💳</span>
                  How would you like to pay? *
                </h3>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod("PAY_AT_SALON")}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedPaymentMethod === "PAY_AT_SALON"
                        ? "border-purple-500 bg-purple-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-purple-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-1 shrink-0 transition-all ${
                          selectedPaymentMethod === "PAY_AT_SALON"
                            ? "border-purple-500 bg-purple-500"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {selectedPaymentMethod === "PAY_AT_SALON" && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-gray-800 block">
                          Pay at Salon (Cash or Card)
                        </span>
                        <p className="text-gray-600 text-sm mt-1">
                          Pay upon arrival at the salon with cash or card
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod("BANK_TRANSFER")}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedPaymentMethod === "BANK_TRANSFER"
                        ? "border-purple-500 bg-purple-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-purple-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-1 shrink-0 transition-all ${
                          selectedPaymentMethod === "BANK_TRANSFER"
                            ? "border-purple-500 bg-purple-500"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {selectedPaymentMethod === "BANK_TRANSFER" && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-gray-800 block">
                          Bank Transfer
                        </span>
                        <p className="text-gray-600 text-sm mt-1">
                          Transfer to our bank account (2 hours to pay)
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Summary Card */}
              {selectedServicesData.length > 0 && (
                <div className="bg-linear-to-r from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Booking Summary ({selectedServicesData.length} service
                    {selectedServicesData.length > 1 ? "s" : ""})
                  </h4>
                  <div className="space-y-2 mb-3">
                    {selectedServicesData.map((svc) => (
                      <div
                        key={svc.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-gray-600">{svc.name}</span>
                        <span className="font-medium text-gray-800">
                          ₦{svc.price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-sm mb-2 pb-2 border-b border-purple-300">
                    <span className="text-gray-600">Total Duration:</span>
                    <span className="font-medium text-gray-800">
                      {totalDuration} mins
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-gray-800">Total Price:</span>
                    <span className="text-purple-600">
                      ₦{totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-linear-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Booking...
                  </span>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center space-y-2">
              <Link
                href="/client-bookings"
                className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-1"
              >
                <Calendar className="w-4 h-4" />
                View My Bookings
              </Link>
              <p className="text-xs text-gray-500">
                By booking, you agree to our cancellation policy
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {showConfirmation && confirmationData && (
        <BookingConfirmationModal
          bookingId={confirmationData.bookingId}
          amount={confirmationData.amount}
          salonName={confirmationData.salonName}
          serviceName={confirmationData.serviceName}
          bookingDate={confirmationData.bookingDate}
          startTime={confirmationData.startTime}
          paymentMethod={confirmationData.paymentMethod || "PAY_AT_SALON"}
          onClose={() => setShowConfirmation(false)}
          bankAccountName={confirmationData.bankAccountName}
          bankAccountNumber={confirmationData.bankAccountNumber}
          bankName={confirmationData.bankName}
        />
      )}
    </div>
  );
}
