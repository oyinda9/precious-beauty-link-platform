"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { DashboardData } from "../types";
import { getStatusColor } from "../helpers";

interface Props {
  data: DashboardData;
  salonFilter: string | "all";
  setSalonFilter: (v: string | "all") => void;
}

export function BookingsTab({ data, salonFilter, setSalonFilter }: Props) {
  const filteredBookings = (data.recentBookings || []).filter((b) =>
    salonFilter === "all" ? true : b.salon?.id === salonFilter,
  );

  return (
    <Card className="bg-slate-800/40 border-purple-500/30">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar size={20} className="text-orange-400" />
              Recent Bookings
            </CardTitle>
            <CardDescription className="text-purple-200">
              Latest bookings across salons
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-purple-300">Filter:</label>
            <select
              value={salonFilter}
              onChange={(e) => setSalonFilter(e.target.value as string)}
              className="bg-slate-800 border border-purple-600 text-purple-200 p-2 rounded"
            >
              <option value="all">All Salons</option>
              {data.salons?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {filteredBookings.length > 0 ? (
            filteredBookings.slice(0, 10).map((booking) => (
              <div
                key={booking.id}
                className="p-4 bg-slate-700/30 rounded-lg border border-purple-500/20 hover:border-purple-500/50 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-white font-semibold">
                      {booking.client?.fullName || "Unknown Client"}
                    </p>
                    <p className="text-purple-300 text-sm">{booking.salon?.name}</p>
                    <p className="text-purple-200 text-sm mt-2">
                      Service: {booking.service?.name || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 lg:ml-auto">
                    <div className="text-right">
                      <p className="text-green-400 font-bold">₦{booking.totalPrice?.toLocaleString() || "0"}</p>
                      <p className="text-purple-300 text-xs">
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-purple-300 text-sm text-center py-4">
              No recent bookings for the selected salon
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}