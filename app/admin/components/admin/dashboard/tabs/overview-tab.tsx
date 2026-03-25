"use client";

import { Building2, Calendar, Users, DollarSign, TrendingUp, Activity, CreditCard } from "lucide-react";
import { DashboardData } from "../types";
import { fmt } from "../helpers";
import { StatCard } from "./stat-card";

export function OverviewTab({ data }: { data: DashboardData }) {
  const o = data.overview;
  const completionRate =
    o.totalBookings > 0
      ? ((o.completedBookings / o.totalBookings) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      {/* Top stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total Revenue"     value={fmt(o.totalRevenue)}              color="purple" />
        <StatCard label="Active Salons"     value={`${o.activeSalons}/${o.totalSalons}`} color="blue" />
        <StatCard label="Completion Rate"   value={`${completionRate}%`}             color="green" />
        <StatCard label="Pending Approvals" value={String(o.pendingApprovals)}       color="orange" />
        <StatCard label="Total Bookings"    value={String(o.totalBookings)}          color="rose" />
      </div>

      {/* Main metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-purple-500/30 bg-slate-800/40 p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between text-purple-300">
            <span className="text-sm">Total Salons</span>
            <Building2 size={20} className="text-blue-400" />
          </div>
          <p className="text-4xl font-bold text-white">{o.totalSalons}</p>
          <p className="text-xs text-green-400">{o.activeSalons} active</p>
        </div>

        <div className="rounded-xl border border-purple-500/30 bg-slate-800/40 p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between text-purple-300">
            <span className="text-sm">Total Clients</span>
            <Users size={20} className="text-teal-400" />
          </div>
          <p className="text-4xl font-bold text-white">{o.totalClients}</p>
          <p className="text-xs text-purple-400">Registered users</p>
        </div>

        <div className="rounded-xl border border-purple-500/30 bg-slate-800/40 p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between text-purple-300">
            <span className="text-sm">Total Bookings</span>
            <Calendar size={20} className="text-purple-400" />
          </div>
          <p className="text-4xl font-bold text-white">{o.totalBookings}</p>
          <p className="text-xs text-purple-400">{o.completedBookings} completed</p>
        </div>

        <div className="rounded-xl border border-purple-500/30 bg-slate-800/40 p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between text-purple-300">
            <span className="text-sm">Total Revenue</span>
            <DollarSign size={20} className="text-orange-400" />
          </div>
          <p className="text-4xl font-bold text-white">{fmt(o.totalRevenue)}</p>
          <p className="text-xs text-purple-400">All time</p>
        </div>
      </div>

      {/* Top salons + Recent activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-purple-500/30 bg-slate-800/40 p-6">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-green-400" />
            <h3 className="font-semibold text-white">Top Performing Salons</h3>
          </div>
          <p className="text-xs text-purple-300 mb-4">Highest revenue generating salons</p>
          <div className="space-y-3">
            {(data.topSalons ?? []).slice(0, 5).map((salon, i) => (
              <div key={salon.salonId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${i === 0 ? "bg-yellow-500" : "bg-slate-600"}`}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm text-white font-medium">{salon.salonName}</p>
                    <p className="text-xs text-purple-400">{salon.bookingCount} bookings</p>
                  </div>
                </div>
                <span className="text-green-400 font-semibold text-sm">{fmt(salon.totalRevenue)}</span>
              </div>
            ))}
            {(data.topSalons ?? []).length === 0 && (
              <p className="text-purple-400 text-sm">No data yet</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-purple-500/30 bg-slate-800/40 p-6">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={16} className="text-blue-400" />
            <h3 className="font-semibold text-white">Recent Activities</h3>
          </div>
          <p className="text-xs text-purple-300 mb-4">Latest system events</p>
          <div className="space-y-3">
            {(data.recentActivities ?? []).slice(0, 5).map((a) => (
              <div key={a.id} className="flex flex-col gap-0.5">
                <p className="text-sm text-white">{a.description}</p>
                <p className="text-xs text-purple-400">
                  {a.user} · {new Date(a.timestamp).toLocaleDateString()}
                </p>
              </div>
            ))}
            {(data.recentActivities ?? []).length === 0 && (
              <p className="text-purple-400 text-sm">No recent activities</p>
            )}
          </div>
        </div>
      </div>

      {/* Subscription breakdown */}
      <div className="rounded-xl border border-purple-500/30 bg-slate-800/40 p-6">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard size={16} className="text-purple-400" />
          <h3 className="font-semibold text-white">Subscription Plans Overview</h3>
        </div>
        <p className="text-xs text-purple-300 mb-4">Current subscription distribution</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {(data.subscriptionBreakdown ?? []).map((plan) => (
            <div key={plan.plan} className="rounded-lg bg-slate-700/30 border border-purple-500/20 p-4">
              <p className="text-xs text-purple-300 mb-1 uppercase tracking-wide">{plan.plan}</p>
              <p className="text-2xl font-bold text-white">{plan._count}</p>
              {plan.revenue !== undefined && (
                <p className="text-xs text-purple-400 mt-1">{fmt(plan.revenue)}</p>
              )}
            </div>
          ))}
          {(data.subscriptionBreakdown ?? []).length === 0 && (
            <p className="text-purple-400 text-sm col-span-full">No subscriptions yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
