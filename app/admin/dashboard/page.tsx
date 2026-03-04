"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  TrendingUp,
  Users,
  Building2,
  Calendar,
  DollarSign,
  BarChart3,
  Menu,
  X,
  Home,
  BarChart2,
  Settings,
  LogOut,
  Search,
  Star,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Shield,
  UserCog,
  Activity,
  CreditCard,
  Bell,
  HelpCircle,
} from "lucide-react";

interface DashboardData {
  overview: {
    totalSalons: number;
    activeSalons: number;
    totalClients: number;
    totalBookings: number;
    completedBookings: number;
    totalRevenue: number;
    pendingApprovals: number;
  };
  topSalons: Array<{
    salonId: string;
    salonName: string;
    totalRevenue: number;
    bookingCount: number;
  }>;
  subscriptionBreakdown: Array<{
    plan: string;
    _count: number;
    revenue?: number;
  }>;
  recentBookings: Array<{
    id: string;
    status: string;
    totalPrice: number;
    bookingDate: string;
    client?: {
      user?: {
        fullName: string;
        email: string;
      };
    };
    salon?: {
      name: string;
      id: string;
    };
    service?: {
      name: string;
    };
  }>;
  users?: Array<{
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    role: string;
    createdAt: string;
  }>;
  analytics?: {
    bookingsBySalon?: Array<{
      salonId: string;
      salonName: string;
      bookings: number;
    }>;
  };
  salons?: Array<{
    id: string;
    name: string;
    slug: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    rating: number;
    reviewCount: number;
    isActive: boolean;
    subscriptionStatus: string;
    createdAt: string;
  }>;
  recentActivities?: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [salonFilter, setSalonFilter] = useState<string | "all">("all");
  const [editingSalon, setEditingSalon] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const handleViewSalon = (slug: string) => {
    window.open(`/salon/${slug}`, "_blank");
  };

  const handleStartEdit = (s: any) => {
    setEditingSalon({ ...s });
    setShowEditModal(true);
  };

  const handleCancelEdit = () => {
    setEditingSalon(null);
    setShowEditModal(false);
  };

  const handleSaveEdit = async () => {
    if (!editingSalon) return;
    try {
      setEditSaving(true);
      const token = localStorage.getItem("authToken");
      const slug = editingSalon.slug;
      const res = await fetch(`/api/salons/${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingSalon.name,
          email: editingSalon.email,
          phone: editingSalon.phone,
          city: editingSalon.city,
          address: editingSalon.address,
        }),
      });
      if (!res.ok) throw new Error("Failed to update salon");
      await fetchDashboardData();
      setShowEditModal(false);
      setEditingSalon(null);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Update failed",
        variant: "destructive",
      });
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteSalon = async (slug: string) => {
    if (!confirm("Deactivate this salon?")) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/salons/${encodeURIComponent(slug)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j?.error || "Delete failed");
      }
      await fetchDashboardData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Delete failed",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.push("/login");
  };

  const filteredSalons = data?.salons?.filter(
    (salon) =>
      salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredBookings = (data?.recentBookings || []).filter((b) =>
    salonFilter === "all" ? true : b.salon?.id === salonFilter,
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
      case "COMPLETED":
        return "bg-green-500/20 text-green-300 border-green-500/50";
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
      case "CANCELLED":
        return "bg-red-500/20 text-red-300 border-red-500/50";
      case "CONFIRMED":
        return "bg-blue-500/20 text-blue-300 border-blue-500/50";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/50";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-white text-lg">Loading dashboard...</p>
          <p className="text-purple-300 text-sm mt-2">Fetching system data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-red-900/20 border-red-500/30 max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-400" size={24} />
              <CardTitle className="text-white">
                Error Loading Dashboard
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-red-200 mb-4">{error}</p>
            <Button onClick={() => router.push("/login")} className="w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const stats = data.overview;
  const completionRate =
    stats.totalBookings > 0
      ? ((stats.completedBookings / stats.totalBookings) * 100).toFixed(1)
      : 0;

  const menuItems = [
    { icon: Home, label: "Overview", value: "overview", count: null },
    {
      icon: Building2,
      label: "Salons",
      value: "salons",
      count: data.salons?.length,
    },
    {
      icon: Calendar,
      label: "Bookings",
      value: "bookings",
      count: stats.totalBookings,
    },
    { icon: Users, label: "Users", value: "users", count: stats.totalClients },
    {
      icon: CreditCard,
      label: "Subscriptions",
      value: "subscriptions",
      count: data.subscriptionBreakdown?.reduce(
        (acc, curr) => acc + curr._count,
        0,
      ),
    },
    { icon: Activity, label: "Analytics", value: "analytics", count: null },
    { icon: Settings, label: "Settings", value: "settings", count: null },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-slate-900/95 backdrop-blur-xl border-b border-purple-700/30 sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              SA
            </div>
            <div>
              <h1 className="font-bold text-white">Super Admin</h1>
              <p className="text-xs text-purple-300">System Dashboard</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:bg-purple-800/50"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-purple-700/30 p-4 space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.value}
                variant="ghost"
                className={`w-full justify-start gap-3 ${
                  activeTab === item.value
                    ? "bg-purple-600 text-white"
                    : "text-purple-200 hover:bg-purple-800/50"
                }`}
                onClick={() => {
                  setActiveTab(item.value);
                  setMobileMenuOpen(false);
                }}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                {item.count && (
                  <Badge className="ml-auto bg-purple-600 text-white">
                    {item.count}
                  </Badge>
                )}
              </Button>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-400 hover:bg-red-900/30 hover:text-red-300"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </Button>
          </div>
        )}
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:block bg-slate-900/80 backdrop-blur-xl border-r border-purple-700/30 h-screen sticky top-0 transition-all duration-300 ${
            sidebarOpen ? "w-64" : "w-20"
          }`}
        >
          <div className="p-4">
            {/* Logo */}
            <div
              className={`flex items-center gap-3 mb-8 ${!sidebarOpen && "justify-center"}`}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                SA
              </div>
              {sidebarOpen && (
                <div>
                  <h2 className="font-bold text-white">SuperAdmin</h2>
                  <p className="text-xs text-purple-300">v2.0.0</p>
                </div>
              )}
            </div>

            {/* Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="absolute -right-3 top-20 bg-slate-800 border border-purple-500/30 rounded-full text-white hover:bg-purple-600"
            >
              <ChevronRight
                className={`transform transition-transform ${sidebarOpen ? "rotate-180" : ""}`}
                size={16}
              />
            </Button>

            {/* Navigation */}
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Button
                  key={item.value}
                  variant="ghost"
                  className={`w-full justify-${sidebarOpen ? "start" : "center"} gap-3 ${
                    activeTab === item.value
                      ? "bg-purple-600 text-white"
                      : "text-purple-200 hover:bg-purple-800/50"
                  }`}
                  onClick={() => setActiveTab(item.value)}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <item.icon size={18} />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.count && (
                        <Badge className="bg-purple-600 text-white">
                          {item.count}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              ))}

              <div className="border-t border-purple-700/30 my-4 pt-4">
                <Button
                  variant="ghost"
                  className={`w-full justify-${sidebarOpen ? "start" : "center"} gap-3 text-red-400 hover:bg-red-900/30 hover:text-red-300`}
                  onClick={handleLogout}
                  title={!sidebarOpen ? "Logout" : undefined}
                >
                  <LogOut size={18} />
                  {sidebarOpen && <span>Logout</span>}
                </Button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <div className="bg-slate-900/80 backdrop-blur-xl border-b border-purple-700/30 sticky top-0 z-20">
            <div className="px-4 lg:px-8 py-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">
                    Super Admin Dashboard
                  </h1>
                  <p className="text-purple-200 text-sm mt-1">
                    System-wide analytics and management
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400"
                    size={18}
                  />
                  <Input
                    placeholder="Search salons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800/50 border-purple-500/30 text-white placeholder:text-purple-300 w-full lg:w-64"
                  />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
                <div className="bg-purple-600/20 rounded-lg px-3 py-2 border border-purple-500/30">
                  <p className="text-xs text-purple-300">Total Revenue</p>
                  <p className="text-lg font-bold text-white">
                    ₦{(stats.totalRevenue || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-blue-600/20 rounded-lg px-3 py-2 border border-blue-500/30">
                  <p className="text-xs text-blue-300">Active Salons</p>
                  <p className="text-lg font-bold text-white">
                    {stats.activeSalons}/{stats.totalSalons}
                  </p>
                </div>
                <div className="bg-green-600/20 rounded-lg px-3 py-2 border border-green-500/30">
                  <p className="text-xs text-green-300">Completion Rate</p>
                  <p className="text-lg font-bold text-white">
                    {completionRate}%
                  </p>
                </div>
                <div className="bg-yellow-600/20 rounded-lg px-3 py-2 border border-yellow-500/30">
                  <p className="text-xs text-yellow-300">Pending Approvals</p>
                  <p className="text-lg font-bold text-white">
                    {stats.pendingApprovals || 0}
                  </p>
                </div>
                <div className="bg-pink-600/20 rounded-lg px-3 py-2 border border-pink-500/30">
                  <p className="text-xs text-pink-300">Total Bookings</p>
                  <p className="text-lg font-bold text-white">
                    {stats.totalBookings}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="px-4 lg:px-8 py-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-blue-600/20 to-blue-400/10 border-blue-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-blue-100 flex items-center justify-between">
                        Total Salons
                        <Building2 className="text-blue-400" size={18} />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">
                        {stats.totalSalons}
                      </div>
                      <p className="text-blue-200 text-xs mt-1">
                        {stats.activeSalons} active
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-600/20 to-green-400/10 border-green-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-green-100 flex items-center justify-between">
                        Total Clients
                        <Users className="text-green-400" size={18} />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">
                        {stats.totalClients}
                      </div>
                      <p className="text-green-200 text-xs mt-1">
                        Registered users
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-600/20 to-purple-400/10 border-purple-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-purple-100 flex items-center justify-between">
                        Total Bookings
                        <Calendar className="text-purple-400" size={18} />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">
                        {stats.totalBookings}
                      </div>
                      <p className="text-purple-200 text-xs mt-1">
                        {stats.completedBookings} completed
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-600/20 to-orange-400/10 border-orange-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-orange-100 flex items-center justify-between">
                        Total Revenue
                        <DollarSign className="text-orange-400" size={18} />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">
                        ₦{(stats.totalRevenue || 0).toLocaleString()}
                      </div>
                      <p className="text-orange-200 text-xs mt-1">All time</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Salons */}
                  <Card className="bg-slate-800/40 border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="text-green-400" size={20} />
                        Top Performing Salons
                      </CardTitle>
                      <CardDescription className="text-purple-200">
                        Highest revenue generating salons
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.topSalons && data.topSalons.length > 0 ? (
                          data.topSalons.map((salon, idx) => (
                            <div
                              key={salon.salonId}
                              className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-purple-500/20 hover:border-purple-500/50 transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                    idx === 0
                                      ? "bg-yellow-500"
                                      : idx === 1
                                        ? "bg-gray-400"
                                        : idx === 2
                                          ? "bg-orange-600"
                                          : "bg-purple-600"
                                  }`}
                                >
                                  {idx + 1}
                                </div>
                                <div>
                                  <p className="text-white font-medium">
                                    {salon.salonName}
                                  </p>
                                  <p className="text-xs text-purple-300">
                                    {salon.bookingCount} bookings
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-green-400 font-bold">
                                  ₦{salon.totalRevenue.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-purple-300 text-sm text-center py-4">
                            No data available
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Activities */}
                  <Card className="bg-slate-800/40 border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Activity className="text-blue-400" size={20} />
                        Recent Activities
                      </CardTitle>
                      <CardDescription className="text-purple-200">
                        Latest system events
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {data.recentActivities ? (
                          data.recentActivities.map((activity, idx) => (
                            <div
                              key={activity.id || idx}
                              className="flex items-start gap-3 p-2 hover:bg-slate-700/30 rounded-lg transition-colors"
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  activity.type === "booking"
                                    ? "bg-green-600/30"
                                    : activity.type === "salon"
                                      ? "bg-blue-600/30"
                                      : "bg-purple-600/30"
                                }`}
                              >
                                {activity.type === "booking" ? (
                                  <Calendar
                                    size={16}
                                    className="text-green-400"
                                  />
                                ) : activity.type === "salon" ? (
                                  <Building2
                                    size={16}
                                    className="text-blue-400"
                                  />
                                ) : (
                                  <Users
                                    size={16}
                                    className="text-purple-400"
                                  />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-white text-sm">
                                  {activity.description}
                                </p>
                                <p className="text-purple-300 text-xs mt-1">
                                  {activity.timestamp}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-purple-300 text-sm text-center py-4">
                            No recent activities
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Subscription Breakdown */}
                <Card className="bg-slate-800/40 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <CreditCard className="text-purple-400" size={20} />
                      Subscription Plans Overview
                    </CardTitle>
                    <CardDescription className="text-purple-200">
                      Current subscription distribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {data.subscriptionBreakdown &&
                      data.subscriptionBreakdown.length > 0 ? (
                        data.subscriptionBreakdown.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30"
                          >
                            <p className="text-purple-300 text-sm mb-1">
                              {item.plan}
                            </p>
                            <p className="text-3xl font-bold text-white mb-2">
                              {item._count}
                            </p>
                            <p className="text-purple-200 text-xs">
                              salons subscribed
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-purple-300 text-sm col-span-3 text-center py-4">
                          No subscription data
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Salons Tab */}
            {activeTab === "salons" && (
              <Card className="bg-slate-800/40 border-purple-500/30">
                <CardHeader>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Building2 size={20} className="text-blue-400" />
                        All Registered Salons
                      </CardTitle>
                      <CardDescription className="text-purple-200">
                        Manage and monitor all salons on the platform
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="border-purple-500/30 text-purple-200 hover:bg-purple-600/20"
                      >
                        <Filter size={16} className="mr-2" />
                        Filter
                      </Button>
                      <Button
                        variant="outline"
                        className="border-purple-500/30 text-purple-200 hover:bg-purple-600/20"
                      >
                        <Download size={16} className="mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-purple-500/30">
                          <th className="text-left py-4 px-4 text-purple-200 font-semibold">
                            Salon
                          </th>
                          <th className="text-left py-4 px-4 text-purple-200 font-semibold">
                            Location
                          </th>
                          <th className="text-left py-4 px-4 text-purple-200 font-semibold">
                            Contact
                          </th>
                          <th className="text-left py-4 px-4 text-purple-200 font-semibold">
                            Rating
                          </th>
                          <th className="text-left py-4 px-4 text-purple-200 font-semibold">
                            Status
                          </th>
                          <th className="text-left py-4 px-4 text-purple-200 font-semibold">
                            Subscription
                          </th>
                          <th className="text-left py-4 px-4 text-purple-200 font-semibold">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSalons && filteredSalons.length > 0 ? (
                          filteredSalons.map((salon) => (
                            <tr
                              key={salon.id}
                              className="border-b border-purple-500/20 hover:bg-slate-700/30 transition-colors"
                            >
                              <td className="py-4 px-4">
                                <div>
                                  <p className="text-white font-medium">
                                    {salon.name}
                                  </p>
                                  <p className="text-xs text-purple-300">
                                    Joined{" "}
                                    {new Date(
                                      salon.createdAt,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-1 text-purple-200">
                                  <MapPin size={14} />
                                  <span>
                                    {salon.city}, {salon.state}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-purple-200 text-xs">
                                    <Mail size={12} />
                                    <span className="truncate max-w-[150px]">
                                      {salon.email}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-purple-200 text-xs">
                                    <Phone size={12} />
                                    <span>{salon.phone}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-1">
                                  <Star
                                    size={14}
                                    className="text-yellow-400 fill-yellow-400"
                                  />
                                  <span className="text-white font-medium">
                                    {salon.rating.toFixed(1)}
                                  </span>
                                  <span className="text-purple-300 text-xs">
                                    ({salon.reviewCount})
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <Badge
                                  className={`${getStatusColor(salon.isActive ? "ACTIVE" : "PENDING")}`}
                                >
                                  {salon.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                              <td className="py-4 px-4">
                                <Badge className="bg-purple-600/30 text-purple-200 border-purple-500/50">
                                  {salon.subscriptionStatus}
                                </Badge>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
                                    onClick={() => handleViewSalon(salon.slug)}
                                  >
                                    <Eye size={16} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/30"
                                    onClick={() => handleStartEdit(salon)}
                                  >
                                    <Edit size={16} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                                    onClick={() =>
                                      handleDeleteSalon(salon.slug)
                                    }
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={7}
                              className="text-center py-8 text-purple-300"
                            >
                              {searchTerm
                                ? "No salons match your search"
                                : "No salons found"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <Card className="bg-slate-800/40 border-purple-500/30">
                <CardHeader>
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Calendar size={20} className="text-orange-400" />
                        Recent Bookings
                      </CardTitle>
                      <CardDescription className="text-purple-200">
                        Latest bookings across salons
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-sm text-purple-300">Filter:</label>
                      <select
                        value={salonFilter}
                        onChange={(e) =>
                          setSalonFilter(e.target.value as string)
                        }
                        className="bg-slate-800 border border-purple-600 text-purple-200 p-2 rounded"
                      >
                        <option value="all">All Salons</option>
                        {data?.salons?.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {filteredBookings && filteredBookings.length > 0 ? (
                      filteredBookings.slice(0, 10).map((booking) => (
                        <div
                          key={booking.id}
                          className="p-4 bg-slate-700/30 rounded-lg border border-purple-500/20 hover:border-purple-500/50 transition-all"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                                  {booking.client?.user?.fullName?.charAt(0) ||
                                    "U"}
                                </div>
                                <div>
                                  <p className="text-white font-semibold">
                                    {booking.client?.user?.fullName ||
                                      "Unknown Client"}
                                  </p>
                                  <p className="text-purple-300 text-sm">
                                    {booking.salon?.name}
                                  </p>
                                </div>
                              </div>
                              <p className="text-purple-200 text-sm mt-2 ml-13">
                                Service: {booking.service?.name}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 lg:ml-auto">
                              <div className="text-right">
                                <p className="text-green-400 font-bold">
                                  ₦{booking.totalPrice.toLocaleString()}
                                </p>
                                <p className="text-purple-300 text-xs">
                                  {new Date(
                                    booking.bookingDate,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-purple-300 text-sm text-center py-4">
                        No recent bookings for the selected salon
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <Card className="bg-slate-800/40 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users size={20} className="text-green-400" />
                    User Management
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    Manage all platform users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.users && data.users.length > 0 ? (
                    <div className="overflow-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 px-3 text-sm text-purple-200">
                              Name
                            </th>
                            <th className="py-2 px-3 text-sm text-purple-200">
                              Email
                            </th>
                            <th className="py-2 px-3 text-sm text-purple-200">
                              Phone
                            </th>
                            <th className="py-2 px-3 text-sm text-purple-200">
                              Role
                            </th>
                            <th className="py-2 px-3 text-sm text-purple-200">
                              Joined
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.users.map((u) => (
                            <tr
                              key={u.id}
                              className="border-b hover:bg-slate-700/30"
                            >
                              <td className="py-2 px-3 text-white">
                                {u.fullName}
                              </td>
                              <td className="py-2 px-3 text-purple-200 text-sm">
                                {u.email}
                              </td>
                              <td className="py-2 px-3 text-purple-200 text-sm">
                                {u.phone || "-"}
                              </td>
                              <td className="py-2 px-3 text-purple-200 text-sm">
                                {u.role}
                              </td>
                              <td className="py-2 px-3 text-purple-200 text-sm">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-purple-300 text-center py-8">
                      No users found
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Subscriptions Tab */}
            {activeTab === "subscriptions" && (
              <Card className="bg-slate-800/40 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard size={20} className="text-purple-400" />
                    Subscription Management
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    Manage subscription plans and tiers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.subscriptionBreakdown &&
                    data.subscriptionBreakdown.length > 0 ? (
                      data.subscriptionBreakdown.map((item, idx) => (
                        <Card
                          key={idx}
                          className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30"
                        >
                          <CardHeader>
                            <CardTitle className="text-white">
                              {item.plan}
                            </CardTitle>
                            <CardDescription className="text-purple-200">
                              {item._count} salons subscribed
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <p className="text-3xl font-bold text-white">
                                  {item._count}
                                </p>
                                <p className="text-sm text-purple-300">
                                  Active subscriptions
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                                  Manage
                                </Button>
                                <Button
                                  variant="outline"
                                  className="border-purple-500/30 text-purple-200"
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-purple-300 text-sm col-span-3 text-center py-4">
                        No subscription data
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <Card className="bg-slate-800/40 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 size={20} className="text-blue-400" />
                    Analytics Dashboard
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    Platform analytics and insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-300 text-center py-8">
                    Analytics dashboard coming soon...
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <Card className="bg-slate-800/40 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings size={20} className="text-gray-400" />
                    System Settings
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    Configure system preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-300 text-center py-8">
                    Settings interface coming soon...
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Edit Salon Modal */}
      {showEditModal && editingSalon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Salon</h3>
            <div className="grid grid-cols-1 gap-3">
              <label className="text-sm">Name</label>
              <input
                className="p-2 border rounded"
                value={editingSalon.name}
                onChange={(e) =>
                  setEditingSalon({ ...editingSalon, name: e.target.value })
                }
              />
              <label className="text-sm">Email</label>
              <input
                className="p-2 border rounded"
                value={editingSalon.email}
                onChange={(e) =>
                  setEditingSalon({ ...editingSalon, email: e.target.value })
                }
              />
              <label className="text-sm">Phone</label>
              <input
                className="p-2 border rounded"
                value={editingSalon.phone}
                onChange={(e) =>
                  setEditingSalon({ ...editingSalon, phone: e.target.value })
                }
              />
              <label className="text-sm">City</label>
              <input
                className="p-2 border rounded"
                value={editingSalon.city}
                onChange={(e) =>
                  setEditingSalon({ ...editingSalon, city: e.target.value })
                }
              />
              <label className="text-sm">Address</label>
              <input
                className="p-2 border rounded"
                value={editingSalon.address}
                onChange={(e) =>
                  setEditingSalon({ ...editingSalon, address: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={false}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={false}>
                {editSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .ml-13 {
          margin-left: 3.25rem;
        }
      `}</style>
    </div>
  );
}
