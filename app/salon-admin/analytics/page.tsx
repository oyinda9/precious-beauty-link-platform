"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Zap,
  Calendar,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import SalonAdminLayout from "@/components/dashboard/salon-admin-layout";

interface Booking {
  id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  paymentStatus: string;
  totalPrice: number;
  service?: {
    name: string;
    duration: number;
    price?: number;
  };
  services?: Array<{
    name: string;
    duration: number;
    price?: number;
  }>;
}

interface AnalyticsData {
  totalRevenue: number;
  totalBookings: number;
  completedBookings: number;
  avgBookingValue: number;
  conversionRate: number;
  revenueByDate: Array<{ date: string; revenue: number }>;
  popularServices: Array<{ name: string; count: number; revenue: number }>;
  bookingsByStatus: Array<{ name: string; value: number }>;
  hourlyBookings: Array<{ hour: string; count: number }>;
}

export default function AnalyticsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log("AnalyticsPage mounted, fetching analytics...");
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.log("No auth token found, redirecting to login");
        router.push("/auth/login");
        return;
      }

      console.log("Fetching from /api/bookings with token");
      const res = await fetch("/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Response status:", res.status);
      if (!res.ok) {
        throw new Error(
          `Failed to fetch bookings: ${res.status} ${res.statusText}`,
        );
      }
      const data = await res.json();
      console.log("Received bookings data:", data);
      const bookingsArray = data.bookings || data || [];
      setBookings(bookingsArray);
      calculateAnalytics(bookingsArray);
    } catch (err: any) {
      console.error("Analytics fetch error:", err);
      const errorMsg = err.message || "Failed to load analytics";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const calculateAnalytics = (bookingsList: Booking[]) => {
    const completed = bookingsList.filter((b) => b.status === "COMPLETED");
    const totalRevenue = completed.reduce((sum, b) => sum + b.totalPrice, 0);

    // Revenue by date (last 30 days)
    const revenueByDate: { [key: string]: number } = {};
    const dateNow = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(dateNow);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      revenueByDate[dateStr] = 0;
    }

    completed.forEach((b) => {
      const bookDate = new Date(b.bookingDate);
      const dateStr = bookDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (dateStr in revenueByDate) {
        revenueByDate[dateStr] += b.totalPrice;
      }
    });

    // Popular services
    const serviceMap: { [key: string]: { count: number; revenue: number } } =
      {};
    bookingsList.forEach((b) => {
      const services = b.services || (b.service ? [b.service] : []);
      services.forEach((service) => {
        if (!serviceMap[service.name]) {
          serviceMap[service.name] = { count: 0, revenue: 0 };
        }
        serviceMap[service.name].count += 1;
        serviceMap[service.name].revenue += service.price || 0;
      });
    });

    const popularServices = Object.entries(serviceMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Bookings by status
    const statusCount = {
      COMPLETED: completed.length,
      CONFIRMED: bookingsList.filter((b) => b.status === "CONFIRMED").length,
      PENDING: bookingsList.filter((b) => b.status === "PENDING").length,
      CANCELLED: bookingsList.filter((b) => b.status === "CANCELLED").length,
    };

    const bookingsByStatus = Object.entries(statusCount).map(
      ([name, value]) => ({
        name,
        value,
      }),
    );

    // Hourly bookings
    const hourMap: { [key: string]: number } = {};
    for (let i = 0; i < 24; i++) {
      const hour = `${i.toString().padStart(2, "0")}:00`;
      hourMap[hour] = 0;
    }

    bookingsList.forEach((b) => {
      const [hour] = b.startTime.split(":");
      const hourStr = `${hour}:00`;
      if (hourStr in hourMap) {
        hourMap[hourStr] += 1;
      }
    });

    const hourlyBookings = Object.entries(hourMap).map(([hour, count]) => ({
      hour,
      count,
    }));

    setAnalytics({
      totalRevenue,
      totalBookings: bookingsList.length,
      completedBookings: completed.length,
      avgBookingValue:
        completed.length > 0 ? Math.round(totalRevenue / completed.length) : 0,
      conversionRate:
        bookingsList.length > 0
          ? Math.round((completed.length / bookingsList.length) * 100)
          : 0,
      revenueByDate: Object.entries(revenueByDate)
        .map(([date, revenue]) => ({ date, revenue }))
        .reverse(),
      popularServices,
      bookingsByStatus,
      hourlyBookings,
    });
  };

  if (loading) {
    return (
      <SalonAdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Loading analytics...
            </p>
          </div>
        </div>
      </SalonAdminLayout>
    );
  }

  if (error) {
    return (
      <SalonAdminLayout>
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">
            Error Loading Analytics
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
            {error}
          </p>
          <Button
            onClick={() => fetchAnalytics()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Try Again
          </Button>
        </div>
      </SalonAdminLayout>
    );
  }

  if (!analytics) {
    return (
      <SalonAdminLayout>
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            No analytics data available yet
          </p>
        </div>
      </SalonAdminLayout>
    );
  }

  const COLORS = ["#9333ea", "#ec4899", "#f59e0b", "#ef4444"];

  const statusColors: {
    [key: string]: string;
  } = {
    COMPLETED: "#10b981",
    CONFIRMED: "#9333ea",
    PENDING: "#f59e0b",
    CANCELLED: "#ef4444",
  };

  return (
    <SalonAdminLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 sm:gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-linear-to-br from-purple-600 to-pink-600 rounded-lg shadow-lg shadow-purple-600/20">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Analytics
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                Your salon performance overview
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
          >
            <RefreshCw
              className={`w-5 h-5 text-slate-600 dark:text-slate-400 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Total Revenue
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    ₦{analytics.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    Generated revenue
                  </p>
                </div>
                <div className="p-3 bg-linear-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Total Bookings
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    {analytics.totalBookings}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    {analytics.completedBookings} completed
                  </p>
                </div>
                <div className="p-3 bg-linear-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Avg Booking Value
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    ₦{analytics.avgBookingValue.toLocaleString()}
                  </p>
                  <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">
                    Per transaction
                  </p>
                </div>
                <div className="p-3 bg-linear-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 rounded-lg">
                  <Zap className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Conversion Rate
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    {analytics.conversionRate}%
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    Completed bookings
                  </p>
                </div>
                <div className="p-3 bg-linear-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-base">Revenue Trend</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.revenueByDate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#f1f5f9" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#9333ea"
                    strokeWidth={2}
                    dot={{ fill: "#9333ea", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Booking Status Distribution */}
          <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-base">Booking Status</CardTitle>
              <CardDescription>Distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.bookingsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} (${value})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.bookingsByStatus.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={statusColors[entry.name]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#f1f5f9" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Popular Services */}
          <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Popular Services</CardTitle>
              <CardDescription>Top services by bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.popularServices}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    stroke="#9ca3af"
                    style={{ fontSize: "12px" }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#f1f5f9" }}
                  />
                  <Bar dataKey="count" fill="#9333ea" name="Bookings" />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Hourly Booking Distribution */}
          <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">
                Booking Activity by Hour
              </CardTitle>
              <CardDescription>When bookings happen</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.hourlyBookings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="hour"
                    stroke="#9ca3af"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#f1f5f9" }}
                  />
                  <Bar dataKey="count" fill="#ec4899" name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </SalonAdminLayout>
  );
}
