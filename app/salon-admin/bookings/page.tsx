"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CalendarDays,
  Clock,
  Calendar,
  Search,
  Filter,
  ChevronRight,
  CheckCircle,
  X,
  MessageSquare,
  Loader2, // ✅ add
} from "lucide-react";
import SalonAdminLayout from "@/components/dashboard/salon-admin-layout";

// Types
interface BookingService {
  id?: string;
  name: string;
  duration: number;
  price?: number;
}

interface Booking {
  id: string;
  bookingDate: string;
  createdAt?: string;
  updatedAt?: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  paymentStatus: string;
  totalPrice: number;
  clientPhone?: string;
  client?: {
    user?: {
      fullName: string;
      email: string;
      phone: string;
    };
  };
  service?: BookingService; // single shape
  services?: BookingService[]; // multi shape
  salon: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<
    "today" | "week" | "month" | "all"
  >("all");
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(
    null,
  );

  // ✅ Pagination state
  const PAGE_SIZE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();

  const sortBookingsNewestFirst = (list: Booking[]) => {
    return [...list].sort((a, b) => {
      const aTime = new Date(
        a.createdAt || a.updatedAt || a.bookingDate,
      ).getTime();
      const bTime = new Date(
        b.createdAt || b.updatedAt || b.bookingDate,
      ).getTime();

      // fallback if either date is invalid
      if (Number.isNaN(aTime) && Number.isNaN(bTime)) {
        return b.id.localeCompare(a.id);
      }
      if (Number.isNaN(aTime)) return 1;
      if (Number.isNaN(bTime)) return -1;

      return bTime - aTime;
    });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ✅ Reset to first page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm, dateRange]);

  const fetchBookings = async () => {
    try {
      setIsFetching(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();

      const normalized: Booking[] = (data.bookings || []).map((b: any) => ({
        ...b,
        services: Array.isArray(b.services)
          ? b.services
          : b.service
            ? [b.service]
            : [],
      }));

      setBookings(sortBookingsNewestFirst(normalized));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  };

  const getApiErrorMessage = async (response: Response) => {
    try {
      const data = await response.json();
      return (
        data?.error ||
        data?.message ||
        data?.details ||
        `Request failed (${response.status})`
      );
    } catch {
      return `Request failed (${response.status})`;
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    if (updatingBookingId === bookingId) return;
    try {
      setUpdatingBookingId(bookingId);
      setIsFetching(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const msg =
          (await getApiErrorMessage(response)) || "Status update failed";

        toast({
          title: "Status update failed",
          description: msg,
          variant: "destructive",
          className: "bg-red-600 text-white border-red-700",
        });

        return;
      }

      // instant local update + keep newest order
      setBookings((prev) => {
        const next = sortBookingsNewestFirst(
          prev.map((b) =>
            b.id === bookingId
              ? { ...b, status: newStatus as Booking["status"] }
              : b,
          ),
        );

        return next;
      });

      toast({
        title: "Booking status updated successfully",
      });

      await fetchBookings();
    } catch (err: any) {
      toast({
        title: "Status update failed",
        description: err?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setUpdatingBookingId(null);
      setIsFetching(false);
    }
  };

  const sendWhatsAppMessage = (
    booking: Booking,
    statusOverride?: Booking["status"],
  ) => {
    if (!booking.clientPhone) {
      toast({
        title: "No phone number",
        description: "Client phone number is missing for this booking.",
        variant: "destructive",
      });
      return;
    }

    let phone = booking.clientPhone.replace(/[^\d]/g, "");
    if (phone.startsWith("0")) phone = "234" + phone.slice(1);

    const statusToUse = statusOverride ?? booking.status;

    const statusTextMap: Record<Booking["status"], string> = {
      PENDING: "is pending",
      CONFIRMED: "has been confirmed",
      COMPLETED: "has been completed",
      CANCELLED: "has been cancelled",
    };

    const services = getBookingServices(booking);
    const serviceName = services.length > 0 ? services[0].name : "service";

    const message = encodeURIComponent(
      `Hello, your booking for ${serviceName} at ${booking.salon?.name || "the salon"} on ${new Date(booking.bookingDate).toLocaleDateString()} at ${booking.startTime} ${statusTextMap[statusToUse]}.`,
    );

    window.open(
      `https://wa.me/${phone}?text=${message}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const getBookingServices = (booking: Booking): BookingService[] => {
    if (Array.isArray(booking.services) && booking.services.length)
      return booking.services;
    if (booking.service) return [booking.service];
    return [];
  };

  const getServiceLabel = (booking: Booking): string => {
    const list = getBookingServices(booking);
    if (!list.length) return "No service";
    if (list.length === 1) return list[0].name;
    return `${list[0].name} +${list.length - 1} more`;
  };

  const getTotalDuration = (booking: Booking): number => {
    return getBookingServices(booking).reduce(
      (sum, s) => sum + (s.duration || 0),
      0,
    );
  };

  const filteredBookings = bookings
    .filter((b) => statusFilter === "ALL" || b.status === statusFilter)
    .filter((b) => {
      const services = getBookingServices(b);
      return (
        searchTerm === "" ||
        b.clientPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        services.some((s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      );
    });

  const getDateFilteredBookings = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return filteredBookings.filter((b) => {
      const bookingDate = new Date(b.bookingDate);
      switch (dateRange) {
        case "today":
          return bookingDate >= today;
        case "week": {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return bookingDate >= weekAgo;
        }
        case "month": {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return bookingDate >= monthAgo;
        }
        default:
          return true;
      }
    });
  };

  const displayBookings = getDateFilteredBookings();

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(displayBookings.length / PAGE_SIZE));

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;

  const paginatedBookings = displayBookings.slice(startIndex, endIndex);

  const showingFrom = displayBookings.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(endIndex, displayBookings.length);

  // Keep current page valid when data size changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      case "CONFIRMED":
        return "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800";
      case "PENDING":
        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
      case "CANCELLED":
        return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-3 h-3" />;
      case "CONFIRMED":
        return <CheckCircle className="w-3 h-3" />;
      case "PENDING":
        return <Clock className="w-3 h-3" />;
      case "CANCELLED":
        return <X className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "GU";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <SalonAdminLayout>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Loading bookings...
            </p>
          </div>
        </div>
      </SalonAdminLayout>
    );
  }

  return (
    <SalonAdminLayout>
      <Card className="relative border-0 bg-white dark:bg-slate-800 shadow-sm">
        {/* ✅ Global backend preloader overlay */}
        {(isFetching || updatingBookingId) && (
          <div className="absolute inset-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-[1px] flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Please wait...
              </span>
            </div>
          </div>
        )}

        <CardHeader className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-slate-600" />
                All Bookings
              </CardTitle>
              <CardDescription>
                Manage and track all appointments
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-64 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                />
              </div>
              <Select
                value={dateRange}
                onValueChange={(val) =>
                  setDateRange(val as "today" | "week" | "month" | "all")
                }
              >
                <SelectTrigger className="w-full sm:w-40 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-6 pt-0">
          {/* Mobile Booking Cards */}
          <div className="lg:hidden space-y-4">
            {displayBookings.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No bookings found</p>
              </div>
            ) : (
              paginatedBookings.map((booking) => (
                <Card
                  key={booking.id}
                  className="overflow-hidden border-0 shadow-sm w-full"
                >
                  <div
                    className={`h-1 w-full ${
                      booking.status === "COMPLETED"
                        ? "bg-emerald-500"
                        : booking.status === "CONFIRMED"
                          ? "bg-sky-500"
                          : booking.status === "PENDING"
                            ? "bg-amber-500"
                            : "bg-rose-500"
                    }`}
                  />
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300">
                            {getInitials("Guest")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white text-base sm:text-lg">
                            Guest Client
                          </p>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            {getServiceLabel(booking)} (
                            {getBookingServices(booking).length})
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {booking.clientPhone ? (
                              `📞 ${booking.clientPhone}`
                            ) : (
                              <span className="text-rose-500">No phone</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={`${getStatusColor(booking.status)} flex items-center gap-1 w-fit px-3 py-1 mt-2 sm:mt-0`}
                      >
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
                        <Calendar className="w-4 h-4 text-slate-600 mb-1" />
                        <p className="text-xs text-slate-500">Date</p>
                        <p className="text-sm font-medium">
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
                        <Clock className="w-4 h-4 text-slate-600 mb-1" />
                        <p className="text-xs text-slate-500">Time</p>
                        <p className="text-sm font-medium">
                          {booking.startTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700 gap-2">
                      <div>
                        <p className="text-xs text-slate-500">Total Amount</p>
                        <p className="text-lg font-bold text-slate-800 dark:text-white">
                          ₦{booking.totalPrice.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 w-full xs:flex-row xs:items-center xs:w-auto">
                        <Select
                          value={booking.status}
                          onValueChange={(val) =>
                            handleStatusChange(booking.id, val)
                          }
                          disabled={
                            isFetching || updatingBookingId === booking.id
                          } // ✅ add
                        >
                          <SelectTrigger className="w-full xs:w-32 h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendWhatsAppMessage(booking)}
                          disabled={
                            isFetching || updatingBookingId === booking.id
                          } // ✅ add
                          className="rounded-full border-green-500 text-green-700 bg-white hover:bg-green-50 w-full xs:w-auto flex items-center justify-center gap-2"
                        >
                          <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.91 2.75 15.79 3.86 17.33L2.08 21.83L6.72 20.09C8.22 21.09 10 21.66 11.96 21.66C17.42 21.66 21.87 17.21 21.87 11.75C21.87 6.29 17.5 2 12.04 2Z M12.04 4.5C16.14 4.5 19.37 7.73 19.37 11.83C19.37 15.93 16.14 19.16 12.04 19.16C10.36 19.16 8.78 18.64 7.47 17.73L4.5 18.67L5.48 15.82C4.5 14.45 3.96 12.8 3.96 11.09C3.96 7 7.19 3.77 11.29 3.77L12.04 4.5Z" />
                          </svg>
                          WhatsApp
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Client
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Service
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Date & Time
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Status
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Amount
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 text-slate-500"
                    >
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  paginatedBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300">
                              {getInitials("Guest")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-white">
                              Guest Client
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">
                            {getServiceLabel(booking)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {getTotalDuration(booking)} mins
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            {new Date(booking.bookingDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-slate-500" />
                            {booking.startTime} - {booking.endTime}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          className={`${getStatusColor(booking.status)} flex items-center gap-1 w-fit px-3 py-1`}
                        >
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-lg font-bold text-slate-800 dark:text-white">
                            ₦{booking.totalPrice.toLocaleString()}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Select
                            value={booking.status}
                            onValueChange={(val) =>
                              handleStatusChange(booking.id, val)
                            }
                            disabled={
                              isFetching || updatingBookingId === booking.id
                            } // ✅ add
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">Pending</SelectItem>
                              <SelectItem value="CONFIRMED">
                                Confirmed
                              </SelectItem>
                              <SelectItem value="COMPLETED">
                                Completed
                              </SelectItem>
                              <SelectItem value="CANCELLED">
                                Cancelled
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => sendWhatsAppMessage(booking)}
                            disabled={
                              isFetching || updatingBookingId === booking.id
                            } // ✅ add
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.91 2.75 15.79 3.86 17.33L2.08 21.83L6.72 20.09C8.22 21.09 10 21.66 11.96 21.66C17.42 21.66 21.87 17.21 21.87 11.75C21.87 6.29 17.5 2 12.04 2Z M12.04 4.5C16.14 4.5 19.37 7.73 19.37 11.83C19.37 15.93 16.14 19.16 12.04 19.16C10.36 19.16 8.78 18.64 7.47 17.73L4.5 18.67L5.48 15.82C4.5 14.45 3.96 12.8 3.96 11.09C3.96 7 7.19 3.77 11.29 3.77L12.04 4.5Z" />
                            </svg>
                            WhatsApp
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ✅ Simple Mobile-Friendly Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-700 mt-6">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {displayBookings.length === 0
                  ? "No results"
                  : `${showingFrom}–${showingTo} of ${displayBookings.length}`}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  ← Prev
                </Button>

                <span className="px-3 py-1 text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded">
                  {currentPage} / {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </SalonAdminLayout>
  );
}
