'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Building2, Users, Calendar, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalSalons: number;
  totalUsers: number;
  totalBookings: number;
  monthlyRevenue: number;
  bookingsTrend: Array<{ month: string; bookings: number; revenue: number }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [salonsRes, usersRes, bookingsRes] = await Promise.all([
          fetch('/api/salons?limit=1'),
          fetch('/api/users?limit=1'),
          fetch('/api/bookings'),
        ]);

        if (salonsRes.ok && usersRes.ok && bookingsRes.ok) {
          const salonsData = await salonsRes.json();
          const usersData = await usersRes.json();
          const bookingsData = await bookingsRes.json();

          setStats({
            totalSalons: salonsData.total || 0,
            totalUsers: usersData.total || 0,
            totalBookings: bookingsData.bookings?.length || 0,
            monthlyRevenue: bookingsData.bookings?.reduce((sum: number, b: any) => sum + b.totalPrice, 0) || 0,
            bookingsTrend: [
              { month: 'Jan', bookings: 45, revenue: 4500 },
              { month: 'Feb', bookings: 52, revenue: 5200 },
              { month: 'Mar', bookings: 48, revenue: 4800 },
              { month: 'Apr', bookings: 61, revenue: 6100 },
              { month: 'May', bookings: 55, revenue: 5500 },
              { month: 'Jun', bookings: 67, revenue: 6700 },
            ],
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const statCards = [
    { label: 'Total Salons', value: stats?.totalSalons || 0, icon: Building2, color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'bg-purple-100 text-purple-600' },
    { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: Calendar, color: 'bg-green-100 text-green-600' },
    { label: 'Monthly Revenue', value: `$${stats?.monthlyRevenue.toFixed(2) || 0}`, icon: TrendingUp, color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome to your salon booking admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="bg-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings Chart */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Bookings Trend</CardTitle>
            <CardDescription>Monthly bookings overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.bookingsTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bookings" stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Monthly revenue overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.bookingsTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
