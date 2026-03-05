"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  LogOut,
  Scissors,
  Menu,
  X,
  CalendarDays,
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  Home,
} from "lucide-react";

interface ClientBooking {
  id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  totalPrice: number;
  notes?: string;
  salon: {
    id: string;
    name: string;
    slug: string;
    address: string;
    city: string;
  };
  service: {
    id: string;
    name: string;
    duration: number;
  };
}

export default function ClientBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<ClientBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch("/api/bookings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to load bookings");
        }

        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.push("/login");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle className="w-3 h-3" />;
      case "PENDING":
        return <Clock className="w-3 h-3" />;
      case "COMPLETED":
        return <CheckCircle className="w-3 h-3" />;
      case "CANCELLED":
        return <X className="w-3 h-3" />;
      default:
        return null;
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

  const filteredBookings =
    filterStatus === "ALL"
      ? bookings
      : bookings.filter((b) => b.status === filterStatus);

  const statusCounts = {
    ALL: bookings.length,
    PENDING: bookings.filter((b) => b.status === "PENDING").length,
    CONFIRMED: bookings.filter((b) => b.status === "CONFIRMED").length,
    COMPLETED: bookings.filter((b) => b.status === "COMPLETED").length,
    CANCELLED: bookings.filter((b) => b.status === "CANCELLED").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-purple-100 sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-2">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">My Bookings</h1>
              <p className="text-xs text-gray-500">
                {bookings.length} appointment{bookings.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-purple-100 shadow-lg p-4 space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => router.push("/")}
            >
              <Home className="w-4 h-4" />
              Browse Salons
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white border-b border-purple-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4">
                <CalendarDays className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  My Bookings
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  View and manage your salon appointments
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="gap-2 border-purple-200 hover:border-purple-300"
              >
                Browse Salons <ArrowRight size={16} />
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="gap-2 border-red-200 hover:border-red-300 text-red-600 hover:text-red-700"
              >
                <LogOut size={16} />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Error loading bookings</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {bookings.length === 0 ? (
          <Card className="text-center py-12 border-2 border-purple-100">
            <CardContent>
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <CalendarDays size={48} className="text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                No Bookings Yet
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                You haven't made any salon appointments yet. Browse our salons
                and book your first appointment today!
              </p>
              <Button
                onClick={() => router.push("/")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 gap-2"
              >
                Browse Salons <ArrowRight size={16} />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Desktop Header with Stats */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Your Appointments
                </h2>
                <p className="text-gray-600">
                  You have {bookings.length} total appointment
                  {bookings.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Status Filter Chips - Mobile & Desktop */}
            <div className="flex flex-wrap gap-2 mb-6">
              {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map(
                (status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                    className={`rounded-full ${
                      filterStatus === status
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        : "border-purple-200 hover:border-purple-300"
                    }`}
                  >
                    {status === "ALL" ? "All" : status}
                    {status !== "ALL" && (
                      <Badge
                        variant="secondary"
                        className={`ml-2 ${
                          filterStatus === status
                            ? "bg-white/20 text-white"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {statusCounts[status as keyof typeof statusCounts]}
                      </Badge>
                    )}
                  </Button>
                ),
              )}
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
              {filteredBookings.length === 0 ? (
                <Card className="text-center py-8 border-2 border-dashed border-purple-200">
                  <CardContent>
                    <p className="text-gray-500">
                      No{" "}
                      {filterStatus !== "ALL" ? filterStatus.toLowerCase() : ""}{" "}
                      bookings found
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredBookings.map((booking) => (
                  <Card
                    key={booking.id}
                    className="border-2 border-purple-100 hover:border-purple-200 transition-all overflow-hidden"
                  >
                    <CardContent className="p-0">
                      {/* Mobile Layout */}
                      <div className="lg:hidden">
                        {/* Status Bar */}
                        <div
                          className={`px-4 py-2 ${getStatusColor(booking.status)} border-b border-purple-100 flex items-center justify-between`}
                        >
                          <div className="flex items-center gap-2">
                            {getStatusIcon(booking.status)}
                            <span className="font-medium text-sm">
                              {booking.status}
                            </span>
                          </div>
                          <span className="text-xs">
                            {new Date(booking.bookingDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-4">
                          {/* Salon & Service */}
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">
                              {booking.salon.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Scissors className="w-4 h-4 text-purple-500" />
                              <p className="text-sm text-gray-600">
                                {booking.service.name} •{" "}
                                {booking.service.duration} mins
                              </p>
                            </div>
                            <div className="flex items-start gap-2 mt-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm">
                                {booking.salon.address}, {booking.salon.city}
                              </span>
                            </div>
                          </div>

                          {/* Date & Time */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-purple-50 rounded-lg p-3">
                              <Calendar className="w-4 h-4 text-purple-600 mb-1" />
                              <p className="text-xs text-gray-600">Date</p>
                              <p className="font-medium text-sm">
                                {new Date(
                                  booking.bookingDate,
                                ).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                            <div className="bg-pink-50 rounded-lg p-3">
                              <Clock className="w-4 h-4 text-pink-600 mb-1" />
                              <p className="text-xs text-gray-600">Time</p>
                              <p className="font-medium text-sm">
                                {formatTime(booking.startTime)}
                              </p>
                            </div>
                          </div>

                          {/* Notes */}
                          {booking.notes && (
                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 italic">
                              " {booking.notes} "
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-2 border-t border-purple-100">
                            <div>
                              <p className="text-xs text-gray-500">
                                Total Amount
                              </p>
                              <p className="text-xl font-bold text-purple-600">
                                ₦{booking.totalPrice.toLocaleString()}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/salon/${booking.salon.slug}`)
                              }
                              className="border-purple-200 hover:border-purple-300"
                            >
                              View Salon
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden lg:block p-6">
                        <div className="grid grid-cols-12 gap-6">
                          {/* Salon & Service - 5 columns */}
                          <div className="col-span-5">
                            <div className="flex items-start gap-3">
                              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3">
                                <Scissors className="w-6 h-6 text-purple-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                  {booking.salon.name}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {booking.service.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Duration: {booking.service.duration} mins
                                </p>
                                <div className="flex items-start gap-2 mt-2 text-sm text-gray-600">
                                  <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                                  <span>
                                    {booking.salon.address},{" "}
                                    {booking.salon.city}
                                  </span>
                                </div>
                                {booking.notes && (
                                  <p className="text-sm text-gray-600 mt-2 italic bg-gray-50 p-2 rounded">
                                    "{booking.notes}"
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Date & Time - 3 columns */}
                          <div className="col-span-3">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-purple-500" />
                                <div>
                                  <p className="text-xs text-gray-500">Date</p>
                                  <p className="font-medium">
                                    {new Date(
                                      booking.bookingDate,
                                    ).toLocaleDateString("en-US", {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-pink-500" />
                                <div>
                                  <p className="text-xs text-gray-500">Time</p>
                                  <p className="font-medium">
                                    {formatTime(booking.startTime)} -{" "}
                                    {formatTime(booking.endTime)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Status & Price - 4 columns */}
                          <div className="col-span-4 flex items-start justify-between">
                            <div>
                              <Badge
                                className={`${getStatusColor(booking.status)} border-0 flex items-center gap-1 px-3 py-1`}
                              >
                                {getStatusIcon(booking.status)}
                                {booking.status}
                              </Badge>
                              <div className="mt-4">
                                <p className="text-xs text-gray-500">
                                  Total Amount
                                </p>
                                <p className="text-2xl font-bold text-purple-600">
                                  ₦{booking.totalPrice.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              onClick={() =>
                                router.push(`/salon/${booking.salon.slug}`)
                              }
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            >
                              View Details{" "}
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Mobile Book More Button */}
            <div className="lg:hidden fixed bottom-6 left-4 right-4">
              <Button
                onClick={() => router.push("/")}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 gap-2 shadow-lg"
              >
                Book More Appointments <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
