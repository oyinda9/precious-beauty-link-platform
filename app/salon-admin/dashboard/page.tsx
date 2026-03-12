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
import { Progress } from "@/components/ui/progress";
import {
  CalendarDays,
  DollarSign,
  LogOut,
  Eye,
  Users,
  Settings,
  Scissors,
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Menu,
  LayoutDashboard,
  Clock,
  Phone,
  Mail,
  MapPin,
  BarChart3,
  Calendar,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Download,
  Bell,
  Award,
  CreditCard,
  MessageSquare,
} from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { Dialog } from "@radix-ui/react-dialog";

// ------------------------------
// TYPES
// ------------------------------

interface Subscription {
  id: string;
  plan: string;
  status: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Booking {
  id: string;
  bookingDate: string;
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
  rating?: number;
  reviewCount?: number;
  logo?: string;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  category: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------
// COMPONENT
// ------------------------------

export default function SalonAdminDashboard() {
  // Payment modal state and logic
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [transferProof, setTransferProof] = useState<File | null>(null);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  function canPay() {
    if (selectedMethod === "card") {
      return (
        cardNumber.length >= 12 && cardExpiry.length >= 4 && cardCvc.length >= 3
      );
    }
    if (selectedMethod === "transfer") {
      return !!transferProof;
    }
    return true;
  }

  async function handleCompletePayment() {
    setPaying(true);
    setPaymentError("");
    setTimeout(() => {
      setPaying(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentModalOpen(false);
        setPaymentSuccess(false);
        setCardNumber("");
        setCardExpiry("");
        setCardCvc("");
        setTransferProof(null);
        setPaymentError("");
      }, 1500);
    }, 1200);
  }

  function handlePaystack() {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentModalOpen(false);
        setPaymentSuccess(false);
      }, 1500);
    }, 1200);
  }
  // Payment modal state

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);

  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [salon, setSalon] = useState<SalonInfo | null>(null);
  const [ownerName, setOwnerName] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<
    "today" | "week" | "month" | "all"
  >("all");
  const [activeTab, setActiveTab] = useState("dashboard");

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

  // ------------------------------
  // SERVICE MANAGEMENT
  // ------------------------------

  const [servicesList, setServicesList] = useState<Service[]>([]);
  const emptyForm = {
    name: "",
    description: "",
    price: 0,
    duration: 30,
    category: "",
  };
  const [serviceForm, setServiceForm] = useState(emptyForm);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [savingService, setSavingService] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [serviceSuccess, setServiceSuccess] = useState<string | null>(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);

  // Fetch subscription info for the salon
  const fetchSubscription = async (salonId: string) => {
    setLoadingSubscription(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      const res = await fetch(`/api/subscription?salonId=${salonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const json = await res.json();
      setSubscription(json.subscription);
    } finally {
      setLoadingSubscription(false);
    }
  };

  // Load salon first
  useEffect(() => {
    fetchSalonInfo();
  }, []);

  // ------------------------------
  // LOAD SERVICES
  // ------------------------------

  const loadServices = async () => {
    if (!salon) return;

    setLoadingServices(true);
    setServiceError(null);

    try {
      const slug = salon.slug.toLowerCase();
      const token = localStorage.getItem("authToken");

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`/api/salons/${slug}/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to load services");
      }

      const json = await res.json();
      setServicesList(json.services || []);
    } catch (err: any) {
      console.error("Load services error", err);
      setServiceError(err.message || "Failed to load services");
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    if (salon) {
      loadServices();
    }
  }, [salon]);

  // ------------------------------
  // SERVICE: START EDIT
  // ------------------------------

  const startEditService = (service: Service) => {
    setEditingServiceId(service.id);
    setServiceForm({
      name: service.name,
      description: service.description || "",
      price: service.price,
      duration: service.duration,
      category: service.category || "",
    });
    setShowServiceForm(true);
    setServiceError(null);
    setServiceSuccess(null);
  };

  // ------------------------------
  // SERVICE: SAVE (CREATE or UPDATE)
  // ------------------------------

  const handleSaveService = async () => {
    setServiceError(null);
    setServiceSuccess(null);

    if (!serviceForm.name.trim()) {
      setServiceError("Service name is required.");
      return;
    }
    if (!serviceForm.price || serviceForm.price <= 0) {
      setServiceError("Price must be greater than 0.");
      return;
    }
    if (!serviceForm.duration || serviceForm.duration <= 0) {
      setServiceError("Duration must be greater than 0.");
      return;
    }

    if (!salon) {
      setServiceError("Salon information not available.");
      return;
    }

    try {
      setSavingService(true);
      const slug = salon.slug.toLowerCase();
      const token = localStorage.getItem("authToken");

      if (!token) {
        router.push("/login");
        return;
      }

      const url = editingServiceId
        ? `/api/salons/${slug}/services/${editingServiceId}`
        : `/api/salons/${slug}/services`;

      const method = editingServiceId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(serviceForm),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to save service");
      }

      setEditingServiceId(null);
      setServiceForm(emptyForm);
      setShowServiceForm(false);
      setServiceSuccess(
        editingServiceId
          ? "Service updated successfully!"
          : "Service created successfully!",
      );

      await loadServices();
      setTimeout(() => setServiceSuccess(null), 3000);
    } catch (err: any) {
      console.error("Save service error:", err);
      setServiceError(
        err.message || "Failed to save service. Please try again.",
      );
    } finally {
      setSavingService(false);
    }
  };

  // ------------------------------
  // SERVICE: DELETE
  // ------------------------------

  const handleDeleteService = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this service? This action cannot be undone.",
      )
    ) {
      return;
    }

    if (!salon) return;

    try {
      const slug = salon.slug.toLowerCase();
      const token = localStorage.getItem("authToken");

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`/api/salons/${slug}/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete service");
      }

      setServiceSuccess("Service deleted successfully!");
      await loadServices();
      setTimeout(() => setServiceSuccess(null), 3000);
    } catch (err: any) {
      console.error("Delete service error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete service",
        variant: "destructive",
      });
    }
  };

  // ------------------------------
  // FETCH DASHBOARD / BOOKINGS
  // ------------------------------

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

  // ------------------------------
  // FETCH SALON INFO FIRST
  // ------------------------------

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
      if (json.salons?.length > 0) {
        setSalon(json.salons[0]);
        // Fetch subscription for this salon
        fetchSubscription(json.salons[0].id);
      } else {
        setError("No salon found for this account");
      }

      await fetchDashboardData();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // ------------------------------
  // BOOKING STATUS UPDATE
  // ------------------------------

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    if (updatingBookingId === bookingId) return;

    try {
      setUpdatingBookingId(bookingId);

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

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || "Failed to update booking";

        if (response.status === 403) {
          toast({
            title: "Forbidden",
            description: "You don't have permission to update this booking.",
            variant: "destructive",
          });
        } else if (response.status === 400) {
          toast({
            title: "Invalid",
            description: data.error || "Invalid status transition.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }

        throw new Error(errorMessage);
      }

      toast({
        title: "Success",
        description: "Booking status updated successfully!",
      });

      // WhatsApp automation: open WhatsApp with pre-filled message if confirmed
      if (newStatus === "CONFIRMED" && data.booking) {
        const clientPhone = data.booking.clientPhone;
        const salon = data.booking.salon;
        const service = data.booking.service;

        if (clientPhone && salon?.name && service?.name) {
          // Format phone number for WhatsApp
          let phone = clientPhone.replace(/[^\d]/g, "");
          if (phone.startsWith("0")) {
            phone = "234" + phone.slice(1);
          }

          const message = `Hello 👋\n\nYour booking at ${salon.name} has been confirmed.\n\nService: ${service.name}\nDate: ${new Date(data.booking.bookingDate).toLocaleDateString()}\nTime: ${data.booking.startTime}\n\nThank you for booking with SalonBook.`;
          const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
          window.open(url, "_blank");
        }
      }
      await fetchDashboardData();
    } catch (err: any) {
      console.error("Status update error:", err);
    } finally {
      setUpdatingBookingId(null);
    }
  };

  // ------------------------------
  // LOGOUT
  // ------------------------------

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.push("/login");
  };

  // Filter bookings
  const filteredBookings = bookings
    .filter((b) => statusFilter === "ALL" || b.status === statusFilter)
    .filter(
      (b) =>
        searchTerm === "" ||
        b.clientPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.service.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  const getDateFilteredBookings = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return filteredBookings.filter((b) => {
      const bookingDate = new Date(b.bookingDate);

      switch (dateRange) {
        case "today":
          return bookingDate >= today;
        case "week":
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return bookingDate >= weekAgo;
        case "month":
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return bookingDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const displayBookings = getDateFilteredBookings();

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

  const completionRate =
    stats.totalBookings > 0
      ? Math.round((stats.completedBookings / stats.totalBookings) * 100)
      : 0;

  // Sidebar menu items
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", value: "dashboard" },
    {
      icon: CalendarDays,
      label: "Bookings",
      value: "bookings",
      count: stats.pendingBookings,
    },
    {
      icon: Scissors,
      label: "Services",
      value: "services",
      count: servicesList.length,
    },
    { icon: Users, label: "Staff", value: "staff" },
    { icon: BarChart3, label: "Analytics", value: "analytics" },
    { icon: MessageSquare, label: "Reviews", value: "reviews", count: 12 },
    { icon: CreditCard, label: "Payments", value: "payments" },
    { icon: Settings, label: "Settings", value: "settings" },
  ];

  // WhatsApp message function
  const sendWhatsAppMessage = (booking: Booking) => {
    if (!booking.clientPhone) {
      alert("No client phone number available.");
      return;
    }

    // Remove spaces and symbols, keep only digits
    let phone = booking.clientPhone.replace(/[^\d]/g, "");

    // Convert Nigerian number to international format if it starts with 0
    if (phone.startsWith("0")) {
      phone = "234" + phone.slice(1);
    }

    const clientName = "Client"; // Default since client may not be registered

    const message = encodeURIComponent(
      `Hello ${clientName}, your booking for ${booking.service.name} at ${booking.salon?.name || "the salon"} on ${new Date(booking.bookingDate).toLocaleDateString()} at ${booking.startTime} has been received!`,
    );

    const url = `https://wa.me/${phone}?text=${message}`;
    window.open(url, "_blank");
  };

  // Payment Modal Component
  const PaymentModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">
          Pay for Plan
        </h2>
        <p className="mb-4 text-slate-600 dark:text-slate-300">
          Plan: <span className="font-semibold">{selectedPlan}</span>
          <br />
          Amount:{" "}
          <span className="font-semibold">
            ₦{selectedAmount?.toLocaleString()}
          </span>
        </p>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Payment Method</label>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg border ${selectedMethod === "card" ? "bg-slate-800 text-white" : "bg-slate-100"}`}
              onClick={() => setSelectedMethod("card")}
            >
              Card
            </button>
            <button
              className={`px-4 py-2 rounded-lg border ${selectedMethod === "transfer" ? "bg-slate-800 text-white" : "bg-slate-100"}`}
              onClick={() => setSelectedMethod("transfer")}
            >
              Bank Transfer
            </button>
            <button
              className={`px-4 py-2 rounded-lg border ${selectedMethod === "paystack" ? "bg-slate-800 text-white" : "bg-slate-100"}`}
              onClick={() => setSelectedMethod("paystack")}
            >
              Paystack
            </button>
          </div>
        </div>
        {/* Payment form placeholder */}
        {selectedMethod === "card" && (
          <div className="mb-4">
            <label className="block mb-1">Card Number</label>
            <input
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="1234 5678 9012 3456"
            />
            <div className="flex gap-2">
              <input
                className="w-1/2 border rounded px-3 py-2"
                placeholder="MM/YY"
              />
              <input
                className="w-1/2 border rounded px-3 py-2"
                placeholder="CVC"
              />
            </div>
          </div>
        )}
        {selectedMethod === "transfer" && (
          <div className="mb-4 text-slate-700 dark:text-slate-200">
            <p>Bank: GTBank</p>
            <p>Account Name: Precious Beauty Link</p>
            <p>Account Number: 0249077051</p>
            <p className="text-xs mt-2 text-slate-500">
              Send the exact amount and upload proof after payment.
            </p>
            <input type="file" className="mt-2" />
          </div>
        )}
        {selectedMethod === "paystack" && (
          <div className="mb-4 text-slate-700 dark:text-slate-200">
            <p>Click below to pay securely with Paystack.</p>
            <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded">
              Pay with Paystack
            </button>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 rounded bg-slate-200 text-slate-800 hover:bg-slate-300"
            onClick={() => setPaymentModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-slate-800 text-white hover:bg-slate-700"
            onClick={() => setPaymentModalOpen(false)}
          >
            Complete Payment
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile Top Nav Bar */}
      <div className="lg:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 flex items-center justify-between px-4 py-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-slate-800 dark:text-white" />
          <span className="font-bold text-slate-800 dark:text-white">
            Salon Admin
          </span>
        </div>
        <div className="w-6 h-6" /> {/* Spacer for symmetry */}
      </div>

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex">
          <div className="w-64 bg-white dark:bg-slate-800 h-full shadow-lg p-4 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-slate-800 dark:text-white">
                Menu
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {menuItems.map((item) => (
              <Button
                key={item.value}
                variant={activeTab === item.value ? "secondary" : "ghost"}
                className="w-full justify-start gap-3 mb-2"
                onClick={() => {
                  setActiveTab(item.value);
                  setMobileMenuOpen(false);
                }}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex items-center gap-2">
                  {item.label}
                  {item.count && item.count > 0 ? (
                    <Badge className="ml-2 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {item.count}
                    </Badge>
                  ) : null}
                </span>
              </Button>
            ))}
            <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
              {salon && (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  onClick={() => window.open(`/salon/${salon.slug}`, "_blank")}
                >
                  <Eye className="w-4 h-4" />
                  View Public Page
                </Button>
              )}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Desktop Layout with Sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`hidden lg:block bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-screen sticky top-0 transition-all duration-300 ${
            sidebarCollapsed ? "w-20" : "w-64"
          }`}
        >
          <div className="p-4 h-full flex flex-col">
            {/* Logo */}
            <div
              className={`flex items-center gap-3 mb-8 ${sidebarCollapsed ? "justify-center" : ""}`}
            >
              <div className="bg-slate-800 dark:bg-slate-700 rounded-xl p-2.5 flex-shrink-0">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h2 className="font-bold text-slate-800 dark:text-white">
                    SalonBook
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Admin Dashboard
                  </p>
                </div>
              )}
            </div>

            {/* Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="absolute -right-3 top-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
              {menuItems.map((item) => (
                <Button
                  key={item.value}
                  variant="ghost"
                  className={`w-full ${sidebarCollapsed ? "justify-center px-2" : "justify-start"} gap-3 ${
                    activeTab === item.value
                      ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  }`}
                  onClick={() => setActiveTab(item.value)}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.count && item.count > 0 && (
                        <Badge className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300">
                          {item.count}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              ))}
            </nav>

            {/* User Profile */}
            <div
              className={`pt-4 mt-4 border-t border-slate-200 dark:border-slate-700 ${sidebarCollapsed ? "text-center" : ""}`}
            >
              <div
                className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"}`}
              >
                <Avatar>
                  <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {ownerName ? getInitials(ownerName) : "SA"}
                  </AvatarFallback>
                </Avatar>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                      {ownerName || "Salon Owner"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {salon?.name || "Salon"}
                    </p>
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full mt-3 justify-start gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Desktop Header */}
          <div className="hidden lg:block bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
            <div className="px-8 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                    {menuItems.find((item) => item.value === activeTab)
                      ?.label || "Dashboard"}
                  </h1>
                  {salon && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {salon.name} • {salon.city}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {salon && (
                    <Button
                      onClick={() =>
                        window.open(`/salon/${salon.slug}`, "_blank")
                      }
                      variant="outline"
                      className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Public Page
                    </Button>
                  )}
                </div>
              </div>

              {salon && (
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-full">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>
                      {salon.address}, {salon.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>{salon.email}</span>
                  </div>
                  {salon.phone && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Phone className="w-4 h-4 text-slate-500" />
                      <span>{salon.phone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="px-4 lg:px-8 py-6 lg:py-8">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
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
            <div className="mb-8 bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Welcome back, {ownerName || "Salon Owner"}! 👋
                  </h2>
                  <p className="text-slate-300">
                    Here's what's happening with your salon today.
                  </p>
                </div>
                <div className="hidden lg:flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-medium">Pro Plan Active</span>
                </div>
              </div>
            </div>

            {/* Dashboard Stats */}
            {activeTab === "dashboard" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
                        Total Bookings
                        <CalendarDays className="w-4 h-4 text-slate-500" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-800 dark:text-white">
                        {stats.totalBookings}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        +12% from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
                        Revenue
                        <DollarSign className="w-4 h-4 text-slate-500" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-800 dark:text-white">
                        ₦{stats.totalRevenue.toLocaleString()}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        +{stats.growthRate}% growth
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
                        Customers
                        <Users className="w-4 h-4 text-slate-500" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-800 dark:text-white">
                        {stats.totalCustomers}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        +8 new this month
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
                        Completion Rate
                        <CheckCircle className="w-4 h-4 text-slate-500" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-800 dark:text-white">
                        {completionRate}%
                      </div>
                      <Progress
                        value={completionRate}
                        className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-700"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Bookings */}
                <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <CardTitle className="text-lg">Recent Bookings</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("bookings")}
                        className="w-full sm:w-auto"
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
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg gap-2"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-slate-200 dark:bg-slate-600 text-xs">
                                {getInitials("Guest")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-slate-800 dark:text-white">
                                Guest Client
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {booking.service.name} •{" "}
                                {new Date(
                                  booking.bookingDate,
                                ).toLocaleDateString()}
                              </p>
                              {booking.clientPhone && (
                                <p className="text-xs text-slate-400 mt-1">
                                  📞 {booking.clientPhone}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* BOOKINGS TAB */}
            {activeTab === "bookings" && (
              <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm">
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
                        onValueChange={(value: any) => setDateRange(value)}
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

                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
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
                      displayBookings.map((booking) => (
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
                                    {booking.service.name}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-1">
                                    {booking.clientPhone ? (
                                      `📞 ${booking.clientPhone}`
                                    ) : (
                                      <span className="text-rose-500">
                                        No phone
                                      </span>
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
                                  {new Date(
                                    booking.bookingDate,
                                  ).toLocaleDateString()}
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
                                <p className="text-xs text-slate-500">
                                  Total Amount
                                </p>
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
                                >
                                  <SelectTrigger className="w-full xs:w-32 h-9">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="PENDING">
                                      Pending
                                    </SelectItem>
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
                                  size="sm"
                                  variant="outline"
                                  onClick={() => sendWhatsAppMessage(booking)}
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
                          displayBookings.slice(0, 10).map((booking) => (
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
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      No email
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                      {booking.clientPhone ? (
                                        `📞 ${booking.clientPhone}`
                                      ) : (
                                        <span className="text-rose-500">
                                          No phone
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div>
                                  <p className="font-medium">
                                    {booking.service.name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {booking.service.duration} mins
                                  </p>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4 text-slate-500" />
                                    {new Date(
                                      booking.bookingDate,
                                    ).toLocaleDateString()}
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
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="PENDING">
                                        Pending
                                      </SelectItem>
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

                    {/* Pagination */}
                    <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                      <p>
                        Showing {Math.min(10, displayBookings.length)} of{" "}
                        {bookings.length} bookings
                      </p>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Previous
                        </Button>
                        <Button variant="outline" size="sm">
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SERVICES TAB */}
            {activeTab === "services" && (
              <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm">
                <CardHeader className="p-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Scissors className="w-5 h-5 text-slate-600" />
                        Services
                      </CardTitle>
                      <CardDescription>
                        Manage your salon services
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => {
                        setShowServiceForm(!showServiceForm);
                        setEditingServiceId(null);
                        setServiceForm(emptyForm);
                        setServiceError(null);
                        setServiceSuccess(null);
                      }}
                      className="bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Service
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-2 sm:p-6 pt-0">
                  {loadingServices && (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto"></div>
                      <p className="mt-4 text-slate-600">Loading services...</p>
                    </div>
                  )}

                  {serviceSuccess && (
                    <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl flex items-center gap-3">
                      <CheckCircle className="w-5 h-5" />
                      {serviceSuccess}
                    </div>
                  )}

                  {!loadingServices && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {showServiceForm && (
                        <Card className="border border-slate-200 dark:border-slate-700 shadow-sm mb-4 lg:mb-0">
                          <CardHeader className="bg-slate-50 dark:bg-slate-700/50">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">
                                {editingServiceId
                                  ? "Edit Service"
                                  : "Add New Service"}
                              </CardTitle>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setShowServiceForm(false);
                                  setEditingServiceId(null);
                                  setServiceForm(emptyForm);
                                  setServiceError(null);
                                  setServiceSuccess(null);
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="p-6">
                            {serviceError && (
                              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 rounded-lg text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {serviceError}
                              </div>
                            )}

                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">
                                  Service Name *
                                </Label>
                                <Input
                                  value={serviceForm.name}
                                  onChange={(e) => {
                                    setServiceForm({
                                      ...serviceForm,
                                      name: e.target.value,
                                    });
                                    setServiceError(null);
                                  }}
                                  placeholder="e.g., Haircut, Manicure"
                                  className="mt-1"
                                />
                              </div>

                              <div>
                                <Label className="text-sm font-medium">
                                  Description
                                </Label>
                                <textarea
                                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-slate-900"
                                  value={serviceForm.description}
                                  onChange={(e) =>
                                    setServiceForm({
                                      ...serviceForm,
                                      description: e.target.value,
                                    })
                                  }
                                  rows={3}
                                  placeholder="Brief description of the service"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">
                                    Price (₦) *
                                  </Label>
                                  <Input
                                    type="number"
                                    value={serviceForm.price}
                                    onChange={(e) =>
                                      setServiceForm({
                                        ...serviceForm,
                                        price: Number(e.target.value),
                                      })
                                    }
                                    placeholder="0"
                                    min="0"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">
                                    Duration (mins) *
                                  </Label>
                                  <Input
                                    type="number"
                                    value={serviceForm.duration}
                                    onChange={(e) =>
                                      setServiceForm({
                                        ...serviceForm,
                                        duration: Number(e.target.value),
                                      })
                                    }
                                    placeholder="30"
                                    min="0"
                                    className="mt-1"
                                  />
                                </div>
                              </div>

                              <div>
                                <Label className="text-sm font-medium">
                                  Category
                                </Label>
                                <Input
                                  value={serviceForm.category}
                                  onChange={(e) =>
                                    setServiceForm({
                                      ...serviceForm,
                                      category: e.target.value,
                                    })
                                  }
                                  placeholder="e.g., Hair, Nails, Spa"
                                  className="mt-1"
                                />
                              </div>

                              <Button
                                onClick={handleSaveService}
                                className="w-full bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600"
                              >
                                {savingService ? (
                                  <span className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Saving...
                                  </span>
                                ) : editingServiceId ? (
                                  "Update Service"
                                ) : (
                                  "Create Service"
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <div
                        className={
                          showServiceForm ? "lg:col-span-1" : "lg:col-span-2"
                        }
                      >
                        <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">
                          Your Services ({servicesList.length})
                        </h3>

                        {servicesList.length === 0 && !loadingServices ? (
                          <div className="text-center py-8 sm:py-12 bg-slate-50 dark:bg-slate-700/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <Scissors className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                            <p className="text-slate-500">No services yet</p>
                            <Button
                              variant="link"
                              onClick={() => setShowServiceForm(true)}
                              className="text-slate-600 mt-2"
                            >
                              Add your first service
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {servicesList.map((service) => (
                              <Card
                                key={service.id}
                                className="border border-slate-200 dark:border-slate-700 hover:shadow-sm transition-all"
                              >
                                <CardContent className="p-3 sm:p-4">
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-semibold text-slate-800 dark:text-white text-base sm:text-lg">
                                          {service.name}
                                        </h4>
                                        <Badge className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-0">
                                          {service.duration} mins
                                        </Badge>
                                      </div>
                                      {service.description && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                          {service.description}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold text-slate-800 dark:text-white">
                                          ₦{service.price.toLocaleString()}
                                        </span>
                                        {service.category && (
                                          <Badge
                                            variant="outline"
                                            className="border-slate-200 dark:border-slate-700"
                                          >
                                            {service.category}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex gap-2 mt-2 sm:mt-0 ml-0 sm:ml-4">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          startEditService(service)
                                        }
                                        className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleDeleteService(service.id)
                                        }
                                        className="border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* STAFF TAB */}
            {activeTab === "staff" && (
              <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm">
                <CardHeader className="p-6">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-600" />
                    Staff Members
                  </CardTitle>
                  <CardDescription>Manage your salon team</CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="text-center py-16">
                    <div className="relative inline-block">
                      <Users className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                      Coming Soon!
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                      We're working on powerful staff management features to
                      help you manage your team efficiently.
                    </p>
                    <Button className="bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600">
                      <Bell className="w-4 h-4 mr-2" />
                      Notify Me
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === "analytics" && (
              <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm">
                <CardHeader className="p-6">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-slate-600" />
                    Analytics
                  </CardTitle>
                  <CardDescription>
                    View detailed insights about your salon performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <Card className="border border-slate-200 dark:border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-base">
                          Revenue Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-12 h-12 text-slate-400" />
                          <span className="ml-2 text-slate-500">
                            Chart coming soon
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-slate-200 dark:border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-base">
                          Popular Services
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {servicesList.slice(0, 5).map((service, idx) => (
                            <div
                              key={service.id}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-500">
                                  #{idx + 1}
                                </span>
                                <span className="text-slate-700 dark:text-slate-300">
                                  {service.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-slate-600">
                                  ₦{service.price.toLocaleString()}
                                </span>
                                <Badge className="bg-slate-100 dark:bg-slate-700">
                                  {service.duration} min
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-slate-200 dark:border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-base">
                          Customer Growth
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8">
                          <div className="text-4xl font-bold text-slate-800 dark:text-white mb-2">
                            +{stats.growthRate}%
                          </div>
                          <p className="text-slate-600">
                            Growth rate this month
                          </p>
                          <p className="text-sm text-slate-500 mt-4">
                            {stats.totalCustomers} total customers
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-slate-200 dark:border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-base">
                          Booking Trends
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-slate-600">
                                Pending
                              </span>
                              <span className="text-sm font-semibold">
                                {stats.pendingBookings}
                              </span>
                            </div>
                            <Progress
                              value={
                                (stats.pendingBookings / stats.totalBookings) *
                                100
                              }
                              className="h-2"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-slate-600">
                                Confirmed
                              </span>
                              <span className="text-sm font-semibold">
                                {stats.confirmedBookings}
                              </span>
                            </div>
                            <Progress
                              value={
                                (stats.confirmedBookings /
                                  stats.totalBookings) *
                                100
                              }
                              className="h-2"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-slate-600">
                                Completed
                              </span>
                              <span className="text-sm font-semibold">
                                {stats.completedBookings}
                              </span>
                            </div>
                            <Progress
                              value={
                                (stats.completedBookings /
                                  stats.totalBookings) *
                                100
                              }
                              className="h-2"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* REVIEWS TAB */}
            {activeTab === "reviews" && (
              <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm">
                <CardHeader className="p-6">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-slate-600" />
                    Reviews
                  </CardTitle>
                  <CardDescription>
                    Manage customer reviews and feedback
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="text-center py-16">
                    <MessageSquare className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                      No Reviews Yet
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                      When customers leave reviews, they'll appear here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* PAYMENTS TAB */}
            {activeTab === "payments" && (
              <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm">
                <CardHeader className="p-6">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-slate-600" />
                    Payments
                  </CardTitle>
                  <CardDescription>
                    Manage transactions and payouts
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="text-center py-16">
                    <CreditCard className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                      Payment History
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                      View and manage all your transactions.
                    </p>
                    <Button className="bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600">
                      <Download className="w-4 h-4 mr-2" />
                      Export Transactions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm">
                <CardHeader className="p-6">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-600" />
                    Salon Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your business information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <Card className="border border-slate-200 dark:border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-base">
                          Business Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm">Salon Name</Label>
                          <Input value={salon?.name || ""} className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-sm">Email</Label>
                          <Input value={salon?.email || ""} className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-sm">Phone</Label>
                          <Input value={salon?.phone || ""} className="mt-1" />
                        </div>
                        <Button className="w-full bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600">
                          Save Changes
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border border-slate-200 dark:border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-base">
                          Business Hours
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                          "Sunday",
                        ].map((day) => (
                          <div
                            key={day}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                              {day}
                            </span>
                            <div className="flex items-center gap-2">
                              <Input className="w-20" placeholder="9:00" />
                              <span className="text-slate-500">-</span>
                              <Input className="w-20" placeholder="18:00" />
                            </div>
                          </div>
                        ))}
                        <Button className="w-full bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600">
                          Update Hours
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border border-slate-200 dark:border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-base">
                          Subscription Plan
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-slate-800 text-white p-4 rounded-lg">
                          {loadingSubscription ? (
                            <p>Loading plan...</p>
                          ) : subscription ? (
                            <>
                              <p className="text-sm opacity-90">Current Plan</p>
                              <p className="text-2xl font-bold mb-2">
                                {subscription.plan}
                              </p>
                              <p className="text-sm opacity-90 mb-2">
                                Status: {subscription.status}
                              </p>
                              {subscription.endDate && (
                                <p className="text-sm opacity-90 mb-2">
                                  Next Payment Due:{" "}
                                  {new Date(
                                    subscription.endDate,
                                  ).toLocaleDateString()}
                                </p>
                              )}
                              <div className="space-y-2">
                                <Button
                                  variant="secondary"
                                  className="w-full bg-white text-slate-800 hover:bg-slate-100"
                                  onClick={() => {
                                    setSelectedPlan(subscription.plan);
                                    setSelectedAmount(
                                      subscription.plan === "PROFESSIONAL"
                                        ? 25000
                                        : subscription.plan === "ENTERPRISE"
                                          ? 50000
                                          : 0,
                                    );
                                    setSelectedMethod("card");
                                    setPaymentModalOpen(true);
                                  }}
                                >
                                  Pay Now
                                </Button>
                                <div className="mt-4">
                                  <p className="text-sm font-semibold mb-2">
                                    Upgrade Plan
                                  </p>
                                  <div className="space-y-2">
                                    <Button
                                      variant="outline"
                                      className="w-full bg-white text-slate-800 hover:bg-slate-100 border-slate-300"
                                      onClick={() => {
                                        setSelectedPlan("PROFESSIONAL");
                                        setSelectedAmount(25000);
                                        setSelectedMethod("card");
                                        setPaymentModalOpen(true);
                                      }}
                                    >
                                      Upgrade to Standard (₦25,000/mo)
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="w-full bg-white text-slate-800 hover:bg-slate-100 border-slate-300"
                                      onClick={() => {
                                        setSelectedPlan("ENTERPRISE");
                                        setSelectedAmount(50000);
                                        setSelectedMethod("card");
                                        setPaymentModalOpen(true);
                                      }}
                                    >
                                      Upgrade to Premium (₦50,000/mo)
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <p>No subscription found.</p>
                              <Button
                                variant="secondary"
                                className="w-full bg-white text-slate-800 hover:bg-slate-100 mt-2"
                                onClick={() => {
                                  setSelectedPlan("PROFESSIONAL");
                                  setSelectedAmount(25000);
                                  setSelectedMethod("card");
                                  setPaymentModalOpen(true);
                                }}
                              >
                                Choose Plan
                              </Button>
                              {/* Payment Modal */}
                              <Dialog
                                open={paymentModalOpen}
                                onOpenChange={(open) => {
                                  setPaymentModalOpen(open);
                                  if (!open) {
                                    setCardNumber("");
                                    setCardExpiry("");
                                    setCardCvc("");
                                    setTransferProof(null);
                                    setPaymentSuccess(false);
                                    setPaymentError("");
                                  }
                                }}
                              >
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                                  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6 w-full max-w-md">
                                    <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">
                                      Pay for Plan
                                    </h2>
                                    <p className="mb-4 text-slate-600 dark:text-slate-300">
                                      Plan:{" "}
                                      <span className="font-semibold">
                                        {selectedPlan}
                                      </span>
                                      <br />
                                      Amount:{" "}
                                      <span className="font-semibold">
                                        ₦{selectedAmount?.toLocaleString()}
                                      </span>
                                    </p>
                                    <div className="mb-4">
                                      <label className="block mb-1 font-medium">
                                        Payment Method
                                      </label>
                                      <div className="flex gap-2">
                                        <button
                                          className={`px-4 py-2 rounded-lg border ${selectedMethod === "card" ? "bg-slate-800 text-white" : "bg-slate-100"}`}
                                          onClick={() =>
                                            setSelectedMethod("card")
                                          }
                                        >
                                          Card
                                        </button>
                                        <button
                                          className={`px-4 py-2 rounded-lg border ${selectedMethod === "transfer" ? "bg-slate-800 text-white" : "bg-slate-100"}`}
                                          onClick={() =>
                                            setSelectedMethod("transfer")
                                          }
                                        >
                                          Bank Transfer
                                        </button>
                                        <button
                                          className={`px-4 py-2 rounded-lg border ${selectedMethod === "paystack" ? "bg-slate-800 text-white" : "bg-slate-100"}`}
                                          onClick={() =>
                                            setSelectedMethod("paystack")
                                          }
                                        >
                                          Paystack
                                        </button>
                                      </div>
                                    </div>
                                    {paymentSuccess ? (
                                      <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-center">
                                        Payment successful! Thank you.
                                      </div>
                                    ) : (
                                      <>
                                        {paymentError && (
                                          <div className="mb-2 p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded text-sm text-center">
                                            {paymentError}
                                          </div>
                                        )}
                                        {selectedMethod === "card" && (
                                          <div className="mb-4">
                                            <label className="block mb-1">
                                              Card Number
                                            </label>
                                            <input
                                              className="w-full border rounded px-3 py-2 mb-2"
                                              placeholder="1234 5678 9012 3456"
                                              value={cardNumber}
                                              onChange={(e) =>
                                                setCardNumber(e.target.value)
                                              }
                                            />
                                            <div className="flex gap-2">
                                              <input
                                                className="w-1/2 border rounded px-3 py-2"
                                                placeholder="MM/YY"
                                                value={cardExpiry}
                                                onChange={(e) =>
                                                  setCardExpiry(e.target.value)
                                                }
                                              />
                                              <input
                                                className="w-1/2 border rounded px-3 py-2"
                                                placeholder="CVC"
                                                value={cardCvc}
                                                onChange={(e) =>
                                                  setCardCvc(e.target.value)
                                                }
                                              />
                                            </div>
                                          </div>
                                        )}
                                        {selectedMethod === "transfer" && (
                                          <div className="mb-4 text-slate-700 dark:text-slate-200">
                                            <p>Bank: GTBank</p>
                                            <p>
                                              Account Name: Precious Beauty Link
                                            </p>
                                            <p>Account Number: 0249077051</p>
                                            <p className="text-xs mt-2 text-slate-500">
                                              Send the exact amount and upload
                                              proof after payment.
                                            </p>
                                            <input
                                              type="file"
                                              className="mt-2"
                                              onChange={(e) =>
                                                setTransferProof(
                                                  e.target.files?.[0] || null,
                                                )
                                              }
                                            />
                                          </div>
                                        )}
                                        {selectedMethod === "paystack" && (
                                          <div className="mb-4 text-slate-700 dark:text-slate-200">
                                            <p>
                                              Click below to pay securely with
                                              Paystack.
                                            </p>
                                            <button
                                              className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
                                              onClick={handlePaystack}
                                            >
                                              Pay with Paystack
                                            </button>
                                          </div>
                                        )}
                                        <div className="flex justify-end gap-2 mt-4">
                                          <button
                                            className="px-4 py-2 rounded bg-slate-200 text-slate-800 hover:bg-slate-300"
                                            onClick={() =>
                                              setPaymentModalOpen(false)
                                            }
                                            disabled={paying}
                                          >
                                            Cancel
                                          </button>
                                          {selectedMethod !== "paystack" && (
                                            <button
                                              className="px-4 py-2 rounded bg-slate-800 text-white hover:bg-slate-700"
                                              onClick={handleCompletePayment}
                                              disabled={paying || !canPay()}
                                            >
                                              {paying
                                                ? "Processing..."
                                                : "Complete Payment"}
                                            </button>
                                          )}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </Dialog>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-slate-200 dark:border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-base text-rose-600">
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button
                          variant="outline"
                          className="w-full border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                        >
                          Deactivate Account
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                        >
                          Delete Salon
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Payment Modal */}
      {paymentModalOpen && <PaymentModal />}
    </div>
  );
}
