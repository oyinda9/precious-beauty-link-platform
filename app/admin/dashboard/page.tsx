"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { EditSalonDialog } from "../components/admin/dashboard/edit-salon-dialog";
import { DashboardHeader } from "../components/admin/dashboard/dashboard-header";
import { DashboardTabs } from "../components/admin/dashboard/dashboard-tabs";
import { Sidebar, MobileTopBar } from "../components/admin/dashboard/sidebar";
import { useSuperAdminDashboard } from "../components/admin/dashboard/hooks/use-super-admin-dashboard";

export default function SuperAdminDashboard() {
  const superadmin = useSuperAdminDashboard();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.push("/login");
  };

  if (superadmin.loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        Loading dashboard...
      </div>
    );
  }

  if (superadmin.error) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-red-400">
        <AlertCircle className="mr-2" /> {superadmin.error}
      </div>
    );
  }

  if (!superadmin.data) return null;

  const data = superadmin.data;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Sidebar
        activeTab={superadmin.activeTab}
        onTabChange={superadmin.setActiveTab}
        onLogout={handleLogout}
        data={data}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileOpen={setMobileOpen}
      />

      <main className="flex-1 overflow-auto p-4 lg:p-8">
        <MobileTopBar onOpen={() => setMobileOpen(true)} />

        <DashboardHeader
          searchTerm={superadmin.searchTerm}
          onSearchChange={superadmin.setSearchTerm}
        />

        <DashboardTabs
          data={data}
          activeTab={superadmin.activeTab}
          onTabChange={superadmin.setActiveTab}
          searchTerm={superadmin.searchTerm}
          salonFilter={superadmin.salonFilter}
          setSalonFilter={superadmin.setSalonFilter}
          onViewSalon={superadmin.handleViewSalon}
          onEditSalon={superadmin.openEditSalon}
          onDeleteSalon={superadmin.handleDeleteSalon}
        />

        <EditSalonDialog
          open={superadmin.showEditModal}
          salon={superadmin.editingSalon}
          saving={superadmin.editSaving}
          onOpenChange={superadmin.closeEditSalon}
          onChange={superadmin.setEditingSalon}
          onSave={superadmin.handleSaveEdit}
        />
      </main>
    </div>
  );
}

 

 
