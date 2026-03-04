import Link from 'next/link';
import { LayoutDashboard, Building2, Users, BarChart3, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardNavClient } from '@/components/dashboard/dashboard-nav-client';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/salons', label: 'Salons', icon: Building2 },
    { href: '/dashboard/users', label: 'Users', icon: Users },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-background">
      <DashboardNavClient navItems={navItems} />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
