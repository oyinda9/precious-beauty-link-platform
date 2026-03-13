"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import SalonAdminLayout from "@/components/dashboard/salon-admin-layout";

export default function AnalyticsPage() {
  return (
    <SalonAdminLayout>
      <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm">
        <CardHeader className="p-6">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-slate-600" />
            Analytics
          </CardTitle>
          <CardDescription>
            View detailed insights about your salon performance
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-base">Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-12 h-12 text-slate-400" />
                  <span className="ml-2 text-slate-500">Chart coming soon</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-base">Popular Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-12 h-12 text-slate-400" />
                  <span className="ml-2 text-slate-500">Chart coming soon</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </SalonAdminLayout>
  );
}
