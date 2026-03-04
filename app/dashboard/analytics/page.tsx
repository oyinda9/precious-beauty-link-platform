'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const bookingsByStatus = [
    { name: 'Pending', value: 15, fill: '#f59e0b' },
    { name: 'Confirmed', value: 42, fill: '#10b981' },
    { name: 'Completed', value: 89, fill: '#3b82f6' },
    { name: 'Cancelled', value: 8, fill: '#ef4444' },
  ];

  const dailyBookings = [
    { day: 'Mon', bookings: 24 },
    { day: 'Tue', bookings: 13 },
    { day: 'Wed', bookings: 28 },
    { day: 'Thu', bookings: 39 },
    { day: 'Fri', bookings: 42 },
    { day: 'Sat', bookings: 51 },
    { day: 'Sun', bookings: 22 },
  ];

  const topSalons = [
    { name: 'Beauty Haven', bookings: 156, revenue: 15600 },
    { name: 'Hair Masters', bookings: 132, revenue: 13200 },
    { name: 'Spa Luxe', bookings: 108, revenue: 10800 },
    { name: 'Style Studio', bookings: 94, revenue: 9400 },
    { name: 'Nail Paradise', bookings: 76, revenue: 7600 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Detailed insights into your platform performance</p>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Status Distribution */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Booking Status Distribution</CardTitle>
            <CardDescription>Current state of all bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bookingsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {bookingsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Bookings */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Weekly Bookings</CardTitle>
            <CardDescription>Bookings by day of the week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyBookings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Salons */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Top Performing Salons</CardTitle>
          <CardDescription>Salons by number of bookings and revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left font-medium">Salon Name</th>
                  <th className="px-6 py-4 text-right font-medium">Bookings</th>
                  <th className="px-6 py-4 text-right font-medium">Revenue</th>
                  <th className="px-6 py-4 text-right font-medium">Avg per Booking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topSalons.map((salon, idx) => (
                  <tr key={idx} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{salon.name}</td>
                    <td className="px-6 py-4 text-right">{salon.bookings}</td>
                    <td className="px-6 py-4 text-right font-semibold text-green-600">
                      ${salon.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      ${(salon.revenue / salon.bookings).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Booking Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">$102.50</div>
            <p className="text-xs text-muted-foreground mt-2">↑ 5% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">4.6/5.0</div>
            <p className="text-xs text-muted-foreground mt-2">Based on 154 reviews</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Repeat Customer Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">68%</div>
            <p className="text-xs text-muted-foreground mt-2">↑ 12% from last month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
