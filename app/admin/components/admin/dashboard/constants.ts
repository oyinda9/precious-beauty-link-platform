import {
  LayoutDashboard,
  Building2,
  Calendar,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  CircleDollarSign,
} from "lucide-react";

export const NAV_ITEMS = [
  {
    value: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    dataKey: null,
  },
  { value: "salons", label: "Salons", icon: Building2, dataKey: "salons" },
  {
    value: "bookings",
    label: "Bookings",
    icon: Calendar,
    dataKey: "recentBookings",
  },
  { value: "users", label: "Users", icon: Users, dataKey: "users" },
  {
    value: "subscriptions",
    label: "Subscriptions",
    icon: CreditCard,
    dataKey: "salons",
  },
  {
    value: "payments",
    label: "Payment Verification",
    icon: CircleDollarSign,
    dataKey: null,
  },
  { value: "analytics", label: "Analytics", icon: BarChart3, dataKey: null },
  { value: "settings", label: "Settings", icon: Settings, dataKey: null },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];
