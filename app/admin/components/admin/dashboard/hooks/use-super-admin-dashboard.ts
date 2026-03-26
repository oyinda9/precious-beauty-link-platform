"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { DashboardData } from "../types";

export function useSuperAdminDashboard() {
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [salonFilter, setSalonFilter] = useState("all");

  const [editingSalon, setEditingSalon] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const res = await fetch("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      setData(await res.json());
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleViewSalon = (slug: string) => {
    window.open(`/salon/${slug}`, "_blank");
  };

  const handleDeleteSalon = async (slug: string) => {
    if (!confirm("Deactivate this salon?")) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/salons/${encodeURIComponent(slug)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      await fetchDashboardData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const openEditSalon = (salon: any) => {
    setEditingSalon({ ...salon });
    setShowEditModal(true);
  };

  const closeEditSalon = (open: boolean) => {
    setShowEditModal(open);
    if (!open) setEditingSalon(null);
  };

  const handleSaveEdit = async () => {
    if (!editingSalon) return;
    try {
      setEditSaving(true);
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `/api/salons/${encodeURIComponent(editingSalon.slug)}`,
        {
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
        },
      );

      if (!res.ok) throw new Error("Failed to update salon");
      await fetchDashboardData();
      setShowEditModal(false);
      setEditingSalon(null);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setEditSaving(false);
    }
  };

  return {
    data,
    loading,
    error,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    salonFilter,
    setSalonFilter,
    editingSalon,
    setEditingSalon,
    showEditModal,
    editSaving,
    handleViewSalon,
    handleDeleteSalon,
    openEditSalon,
    closeEditSalon,
    handleSaveEdit,
  };
}
