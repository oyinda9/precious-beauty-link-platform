"use client";

import { useMemo } from "react";
import { Building2, Edit, Eye, Mail, MapPin, Phone, Star, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { DashboardData } from "../types";

interface Props {
  salons: DashboardData["salons"];
  searchTerm: string;
  onView: (slug: string) => void;
  onEdit: (salon: any) => void;
  onDelete: (slug: string) => void;
}

type SalonRow = NonNullable<DashboardData["salons"]>[number];

const getStatusColor = (isActive: boolean) =>
  isActive
    ? "bg-green-500/20 text-green-300 border-green-500/50"
    : "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";

export function SalonsTab({
  salons,
  searchTerm,
  onView,
  onEdit,
  onDelete,
}: Props) {
  const rows = (salons ?? []).filter((salon) => {
    const q = searchTerm.toLowerCase();
    return (
      salon.name.toLowerCase().includes(q) ||
      salon.city.toLowerCase().includes(q) ||
      salon.email.toLowerCase().includes(q)
    );
  });

  const columns = useMemo<DataTableColumn<SalonRow>[]>(() => {
    return [
      {
        id: "salon",
        header: "Salon",
        headerClassName: "text-purple-200",
        cellClassName: "text-white font-medium",
        cell: (salon) => salon.name,
      },
      {
        id: "location",
        header: "Location",
        headerClassName: "text-purple-200",
        cellClassName: "text-purple-200",
        cell: (salon) => (
          <div className="flex items-center gap-1">
            <MapPin size={14} /> {salon.city}, {salon.state}
          </div>
        ),
      },
      {
        id: "contact",
        header: "Contact",
        headerClassName: "text-purple-200",
        cellClassName: "text-purple-200 text-xs",
        cell: (salon) => (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Mail size={12} /> {salon.email}
            </div>
            <div className="flex items-center gap-1">
              <Phone size={12} /> {salon.phone}
            </div>
          </div>
        ),
      },
      {
        id: "rating",
        header: "Rating",
        headerClassName: "text-purple-200",
        cellClassName: "text-white",
        cell: (salon) => (
          <div className="flex items-center gap-1">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            {salon.rating.toFixed(1)}
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        headerClassName: "text-purple-200",
        cell: (salon) => (
          <Badge className={getStatusColor(salon.isActive)}>
            {salon.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "subscription",
        header: "Subscription",
        headerClassName: "text-purple-200",
        cell: (salon) => (
          <Badge className="bg-purple-600/30 text-purple-200 border-purple-500/50">
            {salon.subscriptionStatus}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        headerClassName: "text-purple-200",
        cell: (salon) => (
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" onClick={() => onView(salon.slug)}>
              <Eye size={16} />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => onEdit(salon)}>
              <Edit size={16} />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => onDelete(salon.slug)}>
              <Trash2 size={16} />
            </Button>
          </div>
        ),
      },
    ];
  }, [onDelete, onEdit, onView]);

  return (
    <Card className="bg-slate-800/40 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Building2 size={20} className="text-blue-400" />
          All Registered Salons
        </CardTitle>
        <CardDescription className="text-purple-200">
          Manage and monitor all salons on the platform
        </CardDescription>
      </CardHeader>

      <CardContent>
        <DataTable
          data={rows}
          columns={columns}
          rowKey={(row) => row.id}
          emptyMessage={searchTerm ? "No salons match your search" : "No salons found"}
          wrapperClassName="border-purple-500/20"
          rowClassName="border-purple-500/20 hover:bg-slate-700/30"
        />
      </CardContent>
    </Card>
  );
}
