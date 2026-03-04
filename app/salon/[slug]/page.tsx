"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";

export default function SalonBookingPage() {
  const { slug } = useParams();

  const [salon, setSalon] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedService || !bookingDate || !startTime) {
      setMessage({ type: "error", text: "Please fill all required fields." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salonId: salon?.id,
          serviceId: selectedService,
          staffId: selectedStaff || null,
          bookingDate,
          startTime,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: `Booking confirmed! Ref: ${data.booking.id}`,
        });
        setSelectedService(null);
        setSelectedStaff(null);
        setBookingDate("");
        setStartTime("");
        setNotes("");
      } else {
        setMessage({ type: "error", text: data.error || "Booking failed." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading salon details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
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

  const selectedServiceData = services.find((s) => s.id === selectedService);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-8">
      {/* Header Card */}
      <div className="bg-white shadow-lg sticky top-0 z-20 border-b border-purple-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-4 shadow-lg hidden sm:block">
              <Scissors className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {salon.name}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                {salon.description}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span className="truncate">
                    {salon.address}, {salon.city}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-purple-500 flex-shrink-0" />
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
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Book Your Appointment
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            {message && (
              <div
                className={`p-4 rounded-xl mb-6 flex items-start gap-3 ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-sm sm:text-base">{message.text}</span>
              </div>
            )}

            <form onSubmit={handleBooking} className="space-y-8">
              {/* Services Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-purple-600" />
                  Select Service *
                </h3>
                <div className="space-y-3">
                  {services.map((svc) => (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => setSelectedService(svc.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedService === svc.id
                          ? "border-purple-500 bg-purple-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-purple-200 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-800">
                          {svc.name}
                        </span>
                        <span className="font-bold text-purple-600">
                          <span>₦{svc.price.toLocaleString()}</span>
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {svc.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{svc.duration} minutes</span>
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
                        {member.user.fullName}
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
                    />
                  </div>
                </div>
                {startTime && (
                  <p className="mt-2 text-sm text-purple-600">
                    Selected time: {formatTime(startTime)}
                  </p>
                )}
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

              {/* Summary Card */}
              {selectedServiceData && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Booking Summary
                  </h4>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium text-gray-800">
                      {selectedServiceData.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium text-gray-800">
                      {selectedServiceData.duration} mins
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold mt-3 pt-3 border-t border-purple-200">
                    <span className="text-gray-800">Total:</span>
                    <span className="text-purple-600">
                      {selectedServiceData.price}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={false}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition shadow-lg hover:shadow-xl"
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
                href="/bookings"
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
    </div>
  );
}
