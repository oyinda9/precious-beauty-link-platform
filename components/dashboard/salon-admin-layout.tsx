"use client";

import { ReactNode, useState, useEffect } from "react";
import {
  DashboardNavClient,
  NavItem,
} from "@/components/dashboard/dashboard-nav-client";
import {
  BarChart2,
  CalendarDays,
  Scissors,
  User,
  Star,
  CreditCard,
  Settings,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

const navItems: NavItem[] = [
  {
    href: "/salon-admin/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    href: "/salon-admin/bookings",
    label: "Bookings",
    icon: <CalendarDays size={18} />,
  },
  {
    href: "/salon-admin/services",
    label: "Services",
    icon: <Scissors size={18} />,
  },
  { href: "/salon-admin/staff", label: "Staff", icon: <User size={18} /> },
  {
    href: "/salon-admin/analytics",
    label: "Analytics",
    icon: <BarChart2 size={18} />,
  },
  { href: "/salon-admin/reviews", label: "Reviews", icon: <Star size={18} /> },
  {
    href: "/salon-admin/payments",
    label: "Payments",
    icon: <CreditCard size={18} />,
  },
  {
    href: "/salon-admin/settings",
    label: "Settings",
    icon: <Settings size={18} />,
  },
];

export default function SalonAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex relative overflow-hidden">
      {/* Animated Balls Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-blob top-0 -left-20"></div>
        <div className="absolute w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-blob animation-delay-2000 top-1/2 -right-20"></div>
        <div className="absolute w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-blob animation-delay-4000 bottom-0 left-1/3"></div>
        <div className="absolute w-80 h-80 bg-pink-400/20 rounded-full blur-3xl animate-blob animation-delay-1000 top-20 right-1/4"></div>
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-purple-200 dark:border-purple-800 rounded-xl shadow-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
        >
          <Menu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </Button>
      </div>

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex lg:hidden">
          <div className="w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl h-full shadow-2xl p-4 flex flex-col border-r border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-linear-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SB</span>
                </div>
                <span className="font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  SalonBook
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:bg-purple-100 dark:hover:bg-purple-900/20"
              >
                <X className="w-5 h-5 text-purple-600" />
              </Button>
            </div>

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-linear-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-purple-500 group-hover:text-purple-600 transition-colors">
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </a>
              ))}
            </nav>

            <div className="pt-4 mt-4 border-t border-purple-200 dark:border-purple-800">
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

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-r border-purple-200 dark:border-purple-800 h-screen fixed top-0 left-0 z-30 transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
        style={{ minHeight: "100vh" }}
      >
        <div className="p-4 h-full flex flex-col">
          {/* Logo */}
          <div
            className={`flex items-center gap-3 mb-8 ${
              sidebarCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="bg-linear-to-r from-purple-600 to-pink-600 rounded-xl p-2.5 shrink-0 shadow-lg shadow-purple-600/20">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h2 className="font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
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
            className="absolute -right-3 top-20 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 rounded-full text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 shadow-lg"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                  sidebarCollapsed ? "justify-center" : ""
                } hover:bg-linear-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className="text-purple-500 group-hover:text-purple-600 transition-colors">
                  {item.icon}
                </span>
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                    {item.label}
                  </span>
                )}
              </a>
            ))}
          </nav>

          {/* User Profile */}
          <div
            className={`pt-4 mt-4 border-t border-purple-200 dark:border-purple-800 ${
              sidebarCollapsed ? "text-center" : ""
            }`}
          >
            <div
              className={`flex items-center ${
                sidebarCollapsed ? "justify-center" : "gap-3"
              }`}
            >
              <Avatar className="border-2 border-purple-200 dark:border-purple-800">
                <AvatarFallback className="bg-linear-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-700 dark:text-purple-300">
                  SA
                </AvatarFallback>
              </Avatar>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                    Salon Owner
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    Premium Plan
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
      <main
        className="flex-1 relative lg:ml-64"
        style={{ minHeight: "100vh", overflow: "auto" }}
      >
        <div className="px-4 lg:px-8 py-6 lg:py-8">{children}</div>
      </main>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
