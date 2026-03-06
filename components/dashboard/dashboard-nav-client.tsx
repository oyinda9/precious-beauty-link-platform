'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function DashboardNavClient({ navItems }: { navItems: NavItem[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        setUser(data.user);
        setLoading(false);
      } catch (error) {
        console.error('[v0] Auth check failed:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error(' Logout failed:', error);
    }
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="w-64 bg-card border-r border-border flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div
      className={`${
        sidebarOpen ? 'w-64' : 'w-20'
      } bg-card border-r border-border transition-all duration-300 flex flex-col`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${!sidebarOpen && 'hidden'}`}>
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
              SB
            </div>
            <span className="font-bold text-lg">SalonBook</span>
          </div>
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 hover:bg-muted rounded"
            >
              <X size={20} />
            </button>
          )}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 hover:bg-muted rounded"
            >
              <Menu size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="text-muted-foreground">
                {item.icon}
              </div>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Menu */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          {sidebarOpen && (
            <div className="flex-1 text-sm">
              <p className="font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut size={18} />
          {sidebarOpen && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}
