"use client"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Download } from "lucide-react";
import SalonAdminLayout from "@/components/dashboard/salon-admin-layout";

export default function PaymentsPage() {
  return (
    <SalonAdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Payments</h1>
        {/* Payments content goes here */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4">
          <p className="text-slate-600 dark:text-slate-300">
            Payments feature coming soon.
          </p>
        </div>
      </div>
    </SalonAdminLayout>
  );
}
