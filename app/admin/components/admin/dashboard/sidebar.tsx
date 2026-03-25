"use client";

import { LogOut, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { NAV_ITEMS } from "./constants";
import { DashboardData } from "./types";

interface SidebarProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  onLogout: () => void;
  data: DashboardData;
  collapsed: boolean;
  onCollapse: (value: boolean) => void;
  mobileOpen: boolean;
  onMobileOpen: (value: boolean) => void;
}

function getBadge(data: DashboardData, dataKey: string | null): number | null {
  if (!dataKey) return null;
  const arr = (data as any)[dataKey];
  return Array.isArray(arr) ? arr.length : null;
}

function SidebarContent({
  activeTab,
  onTabChange,
  onLogout,
  data,
  collapsed,
  isMobile,
}: {
  activeTab: string;
  onTabChange: (value: string) => void;
  onLogout: () => void;
  data: DashboardData;
  collapsed: boolean;
  isMobile: boolean;
}) {
  const showLabels = !collapsed || isMobile;

  return (
    <>
      {/* Avatar + name */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">
          SA
        </div>

        {showLabels && (
          <div className="overflow-hidden">
            <p className="truncate text-sm font-bold text-white">SuperAdmin</p>
            <p className="truncate text-[11px] text-purple-400">v2.0.0</p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 px-2 py-2">
        {NAV_ITEMS.map(({ value, label, icon: Icon, dataKey }) => {
          const badge = getBadge(data, dataKey);
          const isActive = activeTab === value;

          return (
            <button
              key={value}
              onClick={() => onTabChange(value)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-purple-600/40 text-white"
                  : "text-purple-300 hover:bg-purple-500/10 hover:text-white"
              }`}
            >
              <Icon size={18} className="shrink-0" />

              {showLabels && (
                <>
                  <span className="flex-1 text-left">{label}</span>

                  {badge !== null && (
                    <span className="rounded bg-purple-700/60 px-1.5 py-0.5 text-[10px] font-medium">
                      {badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 py-4">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut size={18} className="shrink-0" />
          {showLabels && <span>Logout</span>}
        </button>
      </div>
    </>
  );
}

export function Sidebar({
  activeTab,
  onTabChange,
  onLogout,
  data,
  collapsed,
  onCollapse,
  mobileOpen,
  onMobileOpen,
}: SidebarProps) {
  const handleTabChange = (value: string) => {
    onTabChange(value);
    onMobileOpen(false);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    onMobileOpen(false);
  };

  const sharedProps = {
    activeTab,
    onTabChange: handleTabChange,
    onLogout,
    data,
    collapsed,
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={handleClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-slate-950/95 border-r border-purple-500/20 transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={handleClose}
          className="absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-lg text-purple-400 hover:bg-purple-500/20 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        <SidebarContent {...sharedProps} isMobile={true} />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`relative hidden lg:flex flex-col bg-slate-950/80 border-r border-purple-500/20 transition-all duration-300 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <button
          onClick={() => onCollapse(!collapsed)}
          className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-500"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        <SidebarContent {...sharedProps} isMobile={false} />
      </aside>

      {/* Mobile top bar trigger */}
      <div
        id="mobile-topbar"
        className="hidden"
        data-mobile-open-trigger="true"
      />
    </>
  );
}

export function MobileTopBar({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-4 lg:hidden">
      <button
        onClick={onOpen}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/60 text-purple-300 hover:text-white border border-purple-500/20"
      >
        <Menu size={20} />
      </button>

      <h1 className="text-lg font-bold text-white">Super Admin</h1>
    </div>
  );
}