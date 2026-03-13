"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Bell } from "lucide-react";
import SalonAdminLayout from "@/components/dashboard/salon-admin-layout";

export default function StaffPage() {
  return (
    <SalonAdminLayout>
      <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm">
        <CardHeader className="p-6">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-600" />
            Staff Members
          </CardTitle>
          <CardDescription>Manage your salon team</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="text-center py-16">
            <div className="relative inline-block">
              <Users className="w-20 h-20 text-slate-300 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
              Coming Soon!
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              We're working on powerful staff management features to help you
              manage your team efficiently.
            </p>
            <Button className="bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600">
              <Bell className="w-4 h-4 mr-2" />
              Notify Me
            </Button>
          </div>
        </CardContent>
      </Card>
    </SalonAdminLayout>
  );
}
