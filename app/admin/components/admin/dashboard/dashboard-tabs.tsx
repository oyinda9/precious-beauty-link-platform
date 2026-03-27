"use client";

import { DashboardData } from "./types";
import { OverviewTab } from "./tabs/overview-tab";
import { SalonsTab } from "./tabs/salons-tab";
import { BookingsTab } from "./tabs/bookings-tab";
import { PaymentVerificationTab } from "./tabs/payment-verification-tab";
import {
  Building2,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import { Activity } from "react";

interface Props {
  data: DashboardData;
  activeTab: string;
  onTabChange: (value: string) => void;
  searchTerm: string;
  salonFilter: string;
  setSalonFilter: (value: string) => void;
  onViewSalon: (slug: string) => void;
  onEditSalon: (salon: any) => void;
  onDeleteSalon: (slug: string) => void;
}

const Placeholder = ({ label }: { label: string }) => (
  <div className="rounded-xl border border-purple-500/30 bg-slate-800/40 p-6 text-purple-200">
    {label} coming soon...
  </div>
);

export function DashboardTabs({
  data,
  activeTab,
  searchTerm,
  salonFilter,
  setSalonFilter,
  onViewSalon,
  onEditSalon,
  onDeleteSalon,
}: Props) {
  switch (activeTab) {
    case "overview":
      return <OverviewTab data={data} />;
    case "salons":
      return (
        <SalonsTab
          salons={data?.salons}
          searchTerm={searchTerm}
          onView={onViewSalon}
          onEdit={onEditSalon}
          onDelete={onDeleteSalon}
        />
      );
    case "bookings":
      return (
        <BookingsTab
          data={data}
          salonFilter={salonFilter}
          setSalonFilter={setSalonFilter}
        />
      );
    case "users":
      return <Placeholder label="Users" />;
    case "subscriptions":
      return <Placeholder label="Subscriptions" />;
    case "payments":
      return <PaymentVerificationTab />;
    case "analytics":
      return <Placeholder label="Analytics" />;
    case "settings":
      return <Placeholder label="Settings" />;
    default:
      return <OverviewTab data={data} />;
  }
}
