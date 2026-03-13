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
        router.push("/login");
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
        router.push("/login");
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
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            </div>
            <p className="text-purple-600 dark:text-purple-400 font-medium">
              Loading your dashboard...
            </p>
          </div>
        </div>
      </SalonAdminLayout>
    );
  }

  return (
    <SalonAdminLayout>
      <div className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 rounded-xl flex items-center gap-3">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

          <div className="flex items-center justify-between relative z-10">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {ownerName || "Salon Owner"}! 👋
              </h2>
              <p className="text-purple-100">
                Here's what's happening with your salon today.
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
              <Award className="w-5 h-5 text-amber-300" />
              <span className="text-sm font-medium">Premium Plan Active</span>
            </div>
          </div>
        </div>

        {/* Prominent Booking Link Card */}
        {salon && (
          <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-white">
                      Your Public Booking Page
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Share this link with your clients to accept bookings
                      online 24/7
                    </p>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg p-2 border border-slate-200 dark:border-slate-700">
                      <span className="flex-1 text-sm font-mono text-purple-700 dark:text-purple-300 truncate px-2">
                        {typeof window !== "undefined"
                          ? `${window.location.origin}/salon/${salon.slug}`
                          : `/salon/${salon.slug}`}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={copyBookingLink}
                        className="flex-shrink-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        asChild
                        className="flex-shrink-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
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
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Preview
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all group">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
                Total Bookings
                <CalendarDays className="w-4 h-4 text-purple-500 group-hover:text-purple-600 transition-colors" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">
                {stats.totalBookings}
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all group">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
                Revenue
                <DollarSign className="w-4 h-4 text-pink-500 group-hover:text-pink-600 transition-colors" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">
                ₦{stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />+{stats.growthRate}% growth
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all group">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
                Customers
                <Users className="w-4 h-4 text-purple-500 group-hover:text-purple-600 transition-colors" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">
                {stats.totalCustomers}
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                +8 new this month
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all group">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
                Completion Rate
                <CheckCircle className="w-4 h-4 text-pink-500 group-hover:text-pink-600 transition-colors" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">
                {completionRate}%
              </div>
              <Progress
                value={completionRate}
                className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-700 bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-purple-500" />
                Recent Bookings
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/salon-admin/bookings")}
                className="w-full sm:w-auto text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 pt-0">
            <div className="space-y-3">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-lg gap-2 hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border-2 border-purple-200 dark:border-purple-800">
                      <AvatarFallback className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-700 dark:text-purple-300 text-xs">
                        {getInitials("Guest")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">
                        Guest Client
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {booking.service.name} •{" "}
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </p>
                      {booking.clientPhone && (
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                          📞 {booking.clientPhone}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    className={`${getStatusColor(booking.status)} flex items-center gap-1 w-fit px-3 py-1`}
                  >
                    {getStatusIcon(booking.status)}
                    {booking.status}
                  </Badge>
                </div>
              ))}

              {bookings.length === 0 && (
                <div className="text-center py-12">
                  <CalendarDays className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                  <p className="text-slate-500">No bookings yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Minimized Salon Info */}
        {salon && (
          <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm">
            <CardHeader
              className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              onClick={() => setShowSalonInfo(!showSalonInfo)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-purple-500" />
                  <CardTitle className="text-lg">Salon Details</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                  {showSalonInfo ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardHeader>

            {showSalonInfo && (
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg">
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      Salon Name
                    </p>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">
                      {salon.name}
                    </p>
                  </div>
                  <div className="p-3 bg-pink-50/50 dark:bg-pink-900/10 rounded-lg">
                    <p className="text-xs text-pink-600 dark:text-pink-400">
                      Location
                    </p>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">
                      {salon.city}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg">
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      Email
                    </p>
                    <p className="text-sm font-medium text-slate-800 dark:text-white break-all">
                      {salon.email}
                    </p>
                  </div>
                  <div className="p-3 bg-pink-50/50 dark:bg-pink-900/10 rounded-lg">
                    <p className="text-xs text-pink-600 dark:text-pink-400">
                      Phone
                    </p>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">
                      {salon.phone}
                    </p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </div>
    </SalonAdminLayout>
  );
}
