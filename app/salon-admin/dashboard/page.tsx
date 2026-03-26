"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  CalendarDays,
  DollarSign,
  Users,
  CheckCircle,
  Award,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Clock,
  Copy,
  ExternalLink,
  Store,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Share2,
  Phone,
} from "lucide-react";
import SalonAdminLayout from "@/components/dashboard/salon-admin-layout";

interface Booking {
  id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  paymentStatus: string;
  totalPrice: number;
  clientPhone?: string;
  service: {
    name: string;
    duration: number;
  };
  salon: {
    id: string;
    name: string;
    slug: string;
  };
}

interface SalonInfo {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  email: string;
  phone: string;
}

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [salon, setSalon] = useState<SalonInfo | null>(null);
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSalonInfo, setShowSalonInfo] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    averageRating: 4.8,
    totalCustomers: 0,
    growthRate: 12.5,
  });
  const router = useRouter();

  useEffect(() => {
    fetchSalonInfo();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/auth/login");
        return;
      }
      const res = await fetch("/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      const allBookings = data.bookings || [];
      setBookings(allBookings);
      const uniqueCustomers = new Set(
        allBookings.map((b: Booking) => b.clientPhone).filter(Boolean),
      ).size;
      setStats({
        totalBookings: allBookings.length,
        pendingBookings: allBookings.filter(
          (b: Booking) => b.status === "PENDING",
        ).length,
        completedBookings: allBookings.filter(
          (b: Booking) => b.status === "COMPLETED",
        ).length,
        confirmedBookings: allBookings.filter(
          (b: Booking) => b.status === "CONFIRMED",
        ).length,
        totalRevenue: allBookings.reduce(
          (sum: number, b: Booking) => sum + (b.totalPrice || 0),
          0,
        ),
        averageRating: 4.8,
        totalCustomers: uniqueCustomers,
        growthRate: 12.5,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalonInfo = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/auth/login");
        return;
      }
      const res = await fetch("/api/salons/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch salon info");
      const json = await res.json();
      if (json.user) setOwnerName(json.user.fullName);
      if (json.salons?.length > 0) setSalon(json.salons[0]);
      await fetchDashboardData();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "CONFIRMED":
        return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400";
      case "PENDING":
        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400";
      case "CANCELLED":
        return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400";
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
        return <span className="w-3 h-3">✕</span>;
      default:
        return null;
    }
  };

  const completionRate =
    stats.totalBookings > 0
      ? Math.round((stats.completedBookings / stats.totalBookings) * 100)
      : 0;

  const copyBookingLink = () => {
    if (!salon) return;
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/salon/${salon.slug}`
        : `/salon/${salon.slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "✅ Link copied!",
      description: "Your public booking page link has been copied.",
    });
  };

  if (loading) {
    return (
      <SalonAdminLayout>
        <div className="flex-1 flex items-center justify-center min-h-screen sm:min-h-[60vh] px-4">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm sm:text-base text-purple-600 dark:text-purple-400 font-medium">
              Loading your dashboard...
            </p>
          </div>
        </div>
      </SalonAdminLayout>
    );
  }

  return (
    <SalonAdminLayout>
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0 pb-20 sm:pb-6">
        {/* Error Message */}
        {error && (
          <div className="p-3 sm:p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 rounded-lg sm:rounded-xl flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm flex-1">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="w-full sm:w-auto text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-xs sm:text-sm"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 relative z-10">
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2 break-words">
                Welcome back, {ownerName?.split(" ")[0] || "Salon Owner"}! 👋
              </h2>
              <p className="text-purple-100 text-xs sm:text-base">
                Here's what's happening with your salon today.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30 flex-shrink-0">
              <Award className="w-5 h-5 text-amber-300" />
              <span className="text-sm font-medium">Premium Plan</span>
            </div>
          </div>
        </div>

        {/* Prominent Booking Link Card */}
        {salon && (
          <Card className="border border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <Store className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base sm:text-lg text-slate-800 dark:text-white">
                      Your Public Booking Page
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      Share this link with clients to accept bookings 24/7
                    </p>
                  </div>
                </div>

                {/* URL and Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-2 sm:p-3">
                  <span className="flex-1 text-xs sm:text-sm font-mono text-purple-700 dark:text-purple-300 truncate px-2 py-1 sm:py-0 break-all sm:break-normal">
                    {typeof window !== "undefined"
                      ? `${window.location.origin}/salon/${salon.slug}`
                      : `/salon/${salon.slug}`}
                  </span>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={copyBookingLink}
                      className="flex-1 sm:flex-none text-xs sm:text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    >
                      <Copy className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">Copy</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      asChild
                      className="flex-1 sm:flex-none text-xs sm:text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    >
                      <a
                        href={
                          typeof window !== "undefined"
                            ? `/salon/${salon.slug}`
                            : "#"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">Preview</span>
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {[
            {
              title: "Total Bookings",
              value: stats.totalBookings,
              icon: CalendarDays,
              color: "text-purple-500",
              trend: "+12%",
            },
            {
              title: "Revenue",
              value: `₦${(stats.totalRevenue / 1000).toFixed(1)}k`,
              icon: DollarSign,
              color: "text-pink-500",
              trend: `+${stats.growthRate}%`,
            },
            {
              title: "Customers",
              value: stats.totalCustomers,
              icon: Users,
              color: "text-purple-500",
              trend: "+8 new",
            },
            {
              title: "Completion",
              value: `${completionRate}%`,
              icon: CheckCircle,
              color: "text-pink-500",
              trend: "On track",
            },
          ].map((stat, idx) => (
            <Card
              key={idx}
              className="border-0 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all"
            >
              <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  {stat.title}
                  <stat.icon
                    className={`w-3 h-3 sm:w-4 sm:h-4 ${stat.color}`}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-white truncate">
                  {stat.value}
                </div>
                <p className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Bookings */}
        <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm">
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <CalendarDays className="w-4 sm:w-5 h-4 sm:h-5 text-purple-500 flex-shrink-0" />
                Recent Bookings
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/salon-admin/bookings")}
                className="w-full sm:w-auto text-xs sm:text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
              >
                View All <ChevronRight className="w-3 sm:w-4 h-3 sm:h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 pt-2 sm:pt-0">
            <div className="space-y-2 sm:space-y-3">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-lg gap-2 hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all"
                >
                  <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                    <Avatar className="h-7 sm:h-8 w-7 sm:w-8 border-2 border-purple-200 dark:border-purple-800 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-700 dark:text-purple-300 text-xs">
                        {getInitials("Guest")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-white truncate">
                        Guest Client
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                        {booking.service.name} •{" "}
                        {new Date(booking.bookingDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </p>
                      {booking.clientPhone && (
                        <p className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400 mt-0.5 truncate">
                          📞 {booking.clientPhone}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    className={`${getStatusColor(booking.status)} flex items-center gap-1 w-fit px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs flex-shrink-0 ml-auto sm:ml-0`}
                  >
                    {getStatusIcon(booking.status)}
                    {booking.status}
                  </Badge>
                </div>
              ))}

              {bookings.length === 0 && (
                <div className="text-center py-8">
                  <CalendarDays className="w-10 h-10 text-purple-300 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-slate-500">
                    No bookings yet
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Salon Details - Collapsible */}
        {salon && (
          <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm">
            <CardHeader
              className="p-3 sm:p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              onClick={() => setShowSalonInfo(!showSalonInfo)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Store className="w-4 sm:w-5 h-4 sm:h-5 text-purple-500 flex-shrink-0" />
                  <CardTitle className="text-base sm:text-lg truncate">
                    Salon Details
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-8 w-8 flex-shrink-0"
                >
                  {showSalonInfo ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardHeader>

            {showSalonInfo && (
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3">
                  <div className="p-2 sm:p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg">
                    <p className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400">
                      Salon Name
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-white truncate">
                      {salon.name}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-pink-50/50 dark:bg-pink-900/10 rounded-lg">
                    <p className="text-[10px] sm:text-xs text-pink-600 dark:text-pink-400">
                      Location
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-white truncate">
                      {salon.city}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg sm:col-span-2">
                    <p className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400">
                      Address
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-white truncate">
                      {salon.address}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg">
                    <p className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400">
                      Email
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-white truncate">
                      {salon.email}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-pink-50/50 dark:bg-pink-900/10 rounded-lg">
                    <p className="text-[10px] sm:text-xs text-pink-600 dark:text-pink-400">
                      Phone
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-white">
                      {salon.phone}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyBookingLink}
                    className="text-xs sm:text-sm gap-1 sm:gap-2"
                  >
                    <Share2 className="w-3 sm:w-4 h-3 sm:h-4" />
                    Share
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    className="text-xs sm:text-sm gap-1 sm:gap-2"
                  >
                    <a href={`tel:${salon.phone}`}>
                      <Phone className="w-3 sm:w-4 h-3 sm:h-4" />
                      Call
                    </a>
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Mobile Bottom Navigation */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-2">
          <div className="flex items-center justify-around max-w-6xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/salon-admin/bookings")}
              className="flex flex-col items-center gap-1 h-auto py-2 px-2"
            >
              <CalendarDays className="w-5 h-5" />
              <span className="text-[10px]">Bookings</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/salon-admin/analytics")}
              className="flex flex-col items-center gap-1 h-auto py-2 px-2"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-[10px]">Analytics</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyBookingLink}
              className="flex flex-col items-center gap-1 h-auto py-2 px-2"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-[10px]">Share</span>
            </Button>
          </div>
        </div>
      </div>
    </SalonAdminLayout>
  );
}
