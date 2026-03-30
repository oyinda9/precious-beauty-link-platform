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
  MessageCircle,
  Loader2,
  Phone,
  User,
  DollarSign,
  Eye,
  Download,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  service?: BookingService;
  services?: BookingService[];
  salon: {
    id: string;
    name: string;
    slug: string;
  };
  payment?: {
    proofOfPayment?: string;
    status?: string;
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
    "today" | "yesterday" | "upcoming" | "all"
  >("all");
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  const router = useRouter();

  const sortBookingsByDate = (list: Booking[]) => {
    return [...list].sort((a, b) => {
      const aDate = new Date(a.bookingDate).getTime();
      const bDate = new Date(b.bookingDate).getTime();
      return bDate - aDate;
    });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm, dateRange]);

  const fetchBookings = async () => {
    try {
      setIsFetching(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/auth/login");
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

      setBookings(sortBookingsByDate(normalized));
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
        router.push("/auth/login");
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
        });
        return;
      }

      setBookings((prev) => {
        const next = sortBookingsByDate(
          prev.map((b) =>
            b.id === bookingId
              ? { ...b, status: newStatus as Booking["status"] }
              : b,
          ),
        );
        return next;
      });

      toast({ title: "Booking status updated successfully" });
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
    return `${list[0].name} +${list.length - 1}`;
  };

  const filteredBookings = bookings
    .filter((b) => statusFilter === "ALL" || b.status === statusFilter)
    .filter((b) => {
      const services = getBookingServices(b);
      return (
        searchTerm === "" ||
        b.clientPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.client?.user?.fullName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        services.some((s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      );
    });

  const getDateFilteredBookings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return filteredBookings.filter((b) => {
      const bookingDate = new Date(b.bookingDate);
      bookingDate.setHours(0, 0, 0, 0);

      switch (dateRange) {
        case "today":
          return bookingDate.getTime() === today.getTime();
        case "yesterday":
          return bookingDate.getTime() === yesterday.getTime();
        case "upcoming":
          return bookingDate.getTime() > today.getTime();
        default:
          return true;
      }
    });
  };

  const displayBookings = getDateFilteredBookings();
  const totalPages = Math.max(1, Math.ceil(displayBookings.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedBookings = displayBookings.slice(startIndex, endIndex);
  const showingFrom = displayBookings.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(endIndex, displayBookings.length);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/30",
          text: "text-emerald-700 dark:text-emerald-400",
          badge:
            "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
          icon: <CheckCircle className="w-3 h-3" />,
        };
      case "CONFIRMED":
        return {
          bg: "bg-sky-50 dark:bg-sky-950/30",
          text: "text-sky-700 dark:text-sky-400",
          badge: "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300",
          icon: <CheckCircle className="w-3 h-3" />,
        };
      case "PENDING":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/30",
          text: "text-amber-700 dark:text-amber-400",
          badge:
            "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
          icon: <Clock className="w-3 h-3" />,
        };
      case "CANCELLED":
        return {
          bg: "bg-rose-50 dark:bg-rose-950/30",
          text: "text-rose-700 dark:text-rose-400",
          badge:
            "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
          icon: <X className="w-3 h-3" />,
        };
      default:
        return {
          bg: "bg-slate-50 dark:bg-slate-800",
          text: "text-slate-700 dark:text-slate-400",
          badge:
            "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400",
          icon: null,
        };
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    const bookingDate = new Date(dateString);
    bookingDate.setHours(0, 0, 0, 0);

    if (bookingDate.getTime() === today.getTime()) {
      return "Today";
    } else if (bookingDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  // Group bookings by date category
  const getGroupedBookings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: {
      today: Booking[];
      yesterday: Booking[];
      upcoming: Booking[];
      past: Booking[];
    } = {
      today: [],
      yesterday: [],
      upcoming: [],
      past: [],
    };

    paginatedBookings.forEach((booking) => {
      const bookingDate = new Date(booking.bookingDate);
      bookingDate.setHours(0, 0, 0, 0);

      if (bookingDate.getTime() === today.getTime()) {
        groups.today.push(booking);
      } else if (bookingDate.getTime() === yesterday.getTime()) {
        groups.yesterday.push(booking);
      } else if (bookingDate.getTime() > today.getTime()) {
        groups.upcoming.push(booking);
      } else {
        groups.past.push(booking);
      }
    });

    return groups;
  };

  if (loading) {
    return (
      <SalonAdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Loading bookings...
            </p>
          </div>
        </div>
      </SalonAdminLayout>
    );
  }

  const groupedBookings = getGroupedBookings();
  const hasBookings = Object.values(groupedBookings).some(
    (group) => group.length > 0,
  );

  return (
    <SalonAdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-linear-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg shadow-purple-600/20">
                    <CalendarDays className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Appointments
                  </h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400 ml-12">
                  Manage and track all your salon bookings
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {displayBookings.length} total bookings
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-8 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by client, phone, or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-11 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <Select
                value={dateRange}
                onValueChange={(val) => setDateRange(val as any)}
              >
                <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-600">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setDateRange("all");
                  setStatusFilter("ALL");
                }}
                className="h-11 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Clear filters
              </Button>
            </div>
          </div>

          {/* Loading Overlay */}
          {(isFetching || updatingBookingId) && (
            <div className="fixed inset-0 z-50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
              <div className="flex items-center gap-3 rounded-2xl px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Processing...
                </span>
              </div>
            </div>
          )}

          {/* Bookings Tables - Grouped by Date */}
          {!hasBookings ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
                No bookings found
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Today's Bookings */}
              {groupedBookings.today.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                      Today
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent dark:from-blue-800"></div>
                  </div>
                  <BookingTable
                    bookings={groupedBookings.today}
                    handleStatusChange={handleStatusChange}
                    sendWhatsAppMessage={sendWhatsAppMessage}
                    getServiceLabel={getServiceLabel}
                    getInitials={getInitials}
                    getStatusConfig={getStatusConfig}
                    formatDate={formatDate}
                    isFetching={isFetching}
                    updatingBookingId={updatingBookingId}
                    setSelectedReceipt={setSelectedReceipt}
                  />
                </div>
              )}

              {/* Yesterday's Bookings */}
              {groupedBookings.yesterday.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4 mt-8">
                    <div className="px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-sm font-semibold">
                      Yesterday
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent dark:from-purple-800"></div>
                  </div>
                  <BookingTable
                    bookings={groupedBookings.yesterday}
                    handleStatusChange={handleStatusChange}
                    sendWhatsAppMessage={sendWhatsAppMessage}
                    getServiceLabel={getServiceLabel}
                    getInitials={getInitials}
                    getStatusConfig={getStatusConfig}
                    formatDate={formatDate}
                    isFetching={isFetching}
                    updatingBookingId={updatingBookingId}
                    setSelectedReceipt={setSelectedReceipt}
                  />
                </div>
              )}

              {/* Upcoming Bookings */}
              {groupedBookings.upcoming.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4 mt-8">
                    <div className="px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-sm font-semibold">
                      Upcoming
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-emerald-200 to-transparent dark:from-emerald-800"></div>
                  </div>
                  <BookingTable
                    bookings={groupedBookings.upcoming}
                    handleStatusChange={handleStatusChange}
                    sendWhatsAppMessage={sendWhatsAppMessage}
                    getServiceLabel={getServiceLabel}
                    getInitials={getInitials}
                    getStatusConfig={getStatusConfig}
                    formatDate={formatDate}
                    isFetching={isFetching}
                    updatingBookingId={updatingBookingId}
                    setSelectedReceipt={setSelectedReceipt}
                  />
                </div>
              )}

              {/* Past Bookings */}
              {groupedBookings.past.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4 mt-8">
                    <div className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-semibold">
                      Past
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700"></div>
                  </div>
                  <BookingTable
                    bookings={groupedBookings.past}
                    handleStatusChange={handleStatusChange}
                    sendWhatsAppMessage={sendWhatsAppMessage}
                    getServiceLabel={getServiceLabel}
                    getInitials={getInitials}
                    getStatusConfig={getStatusConfig}
                    formatDate={formatDate}
                    isFetching={isFetching}
                    updatingBookingId={updatingBookingId}
                    setSelectedReceipt={setSelectedReceipt}
                  />
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing{" "}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {showingFrom}
                </span>{" "}
                to{" "}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {showingTo}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {displayBookings.length}
                </span>{" "}
                results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-9 px-4 border-slate-200 dark:border-slate-600"
                >
                  ← Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = currentPage;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2)
                      pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;

                    if (pageNum > totalPages) return null;
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-9 w-9 p-0 ${currentPage === pageNum ? "bg-blue-600 hover:bg-blue-700" : "border-slate-200 dark:border-slate-600"}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="h-9 px-4 border-slate-200 dark:border-slate-600"
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Preview Dialog */}
      <Dialog
        open={!!selectedReceipt}
        onOpenChange={() => setSelectedReceipt(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4">
              {selectedReceipt.endsWith(".pdf") ? (
                <iframe
                  src={selectedReceipt}
                  className="w-full h-96 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <img
                  src={selectedReceipt}
                  alt="Receipt"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700"
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
    </SalonAdminLayout>
  );
}

// Separate component for the booking table (reused for each date group)
function BookingTable({
  bookings,
  handleStatusChange,
  sendWhatsAppMessage,
  getServiceLabel,
  getInitials,
  getStatusConfig,
  formatDate,
  isFetching,
  updatingBookingId,
  setSelectedReceipt,
}: {
  bookings: Booking[];
  handleStatusChange: (id: string, status: string) => void;
  sendWhatsAppMessage: (booking: Booking) => void;
  getServiceLabel: (booking: Booking) => string;
  getInitials: (name: string) => string;
  getStatusConfig: (status: string) => any;
  formatDate: (date: string) => string;
  isFetching: boolean;
  updatingBookingId: string | null;
  setSelectedReceipt: (receipt: string | null) => void;
}) {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Receipt
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  WhatsApp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {bookings.map((booking) => {
                const status = getStatusConfig(booking.status);
                return (
                  <tr
                    key={booking.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 bg-gradient-to-br from-blue-500 to-blue-600">
                          <AvatarFallback className="text-white text-xs">
                            {getInitials(
                              booking.client?.user?.fullName || "Client",
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-white text-sm">
                            {booking.client?.user?.fullName || "Guest Client"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {booking.clientPhone || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                        {getServiceLabel(booking)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {booking.startTime}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(booking.bookingDate)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">
                        ₦{booking.totalPrice.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`${status.badge} text-xs font-semibold gap-1.5 px-3 py-1.5`}
                        >
                          {status.icon}
                          {booking.status}
                        </Badge>
                        <Select
                          value={booking.status}
                          onValueChange={(val) =>
                            handleStatusChange(booking.id, val)
                          }
                          disabled={
                            isFetching || updatingBookingId === booking.id
                          }
                        >
                          <SelectTrigger className="h-7 text-xs bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 w-auto hidden group-hover:block">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {booking.payment?.proofOfPayment ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setSelectedReceipt(
                                booking.payment!.proofOfPayment!,
                              )
                            }
                            className="gap-1 h-8 text-xs"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              window.open(
                                booking.payment!.proofOfPayment!,
                                "_blank",
                              )
                            }
                            className="gap-1 h-8 text-xs"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          No receipt
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => sendWhatsAppMessage(booking)}
                        disabled={
                          isFetching || updatingBookingId === booking.id
                        }
                        className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 px-3 flex items-center gap-2"
                        title="Send WhatsApp message"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View - Compact Table Style */}
      <div className="lg:hidden space-y-3">
        {bookings.map((booking) => {
          const status = getStatusConfig(booking.status);
          return (
            <div
              key={booking.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600">
                    <AvatarFallback className="text-white text-sm">
                      {getInitials(booking.client?.user?.fullName || "Client")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      {booking.client?.user?.fullName || "Guest Client"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {booking.clientPhone || "No phone"}
                    </p>
                  </div>
                </div>
                <Badge className={`${status.badge} text-xs font-medium gap-1`}>
                  {status.icon}
                  {booking.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3 py-2 border-t border-b border-slate-100 dark:border-slate-700">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Service
                  </p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {getServiceLabel(booking)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Time
                  </p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">
                    {booking.startTime}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Date
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {formatDate(booking.bookingDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Amount
                  </p>
                  <p className="text-base font-bold text-slate-800 dark:text-white">
                    ₦{booking.totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>

              {booking.payment?.proofOfPayment && (
                <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-300 mb-2">
                    Payment Receipt
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setSelectedReceipt(booking.payment!.proofOfPayment!)
                      }
                      className="flex-1 gap-1 text-xs h-8"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        window.open(booking.payment!.proofOfPayment!, "_blank")
                      }
                      className="flex-1 gap-1 text-xs h-8"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    value={booking.status}
                    onValueChange={(val) => handleStatusChange(booking.id, val)}
                    disabled={isFetching || updatingBookingId === booking.id}
                  >
                    <SelectTrigger
                      className={`h-9 text-xs border-2 rounded-lg font-semibold ${status.badge}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          Pending
                        </div>
                      </SelectItem>
                      <SelectItem value="CONFIRMED">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3" />
                          Confirmed
                        </div>
                      </SelectItem>
                      <SelectItem value="COMPLETED">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3" />
                          Completed
                        </div>
                      </SelectItem>
                      <SelectItem value="CANCELLED">
                        <div className="flex items-center gap-2">
                          <X className="w-3 h-3" />
                          Cancelled
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  size="sm"
                  onClick={() => sendWhatsAppMessage(booking)}
                  disabled={isFetching || updatingBookingId === booking.id}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white h-9 px-3 flex items-center gap-2"
                  title="Send WhatsApp message"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
