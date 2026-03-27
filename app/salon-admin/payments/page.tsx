"use client";
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
import { PaymentReceiptsView } from "@/components/admin/payment-receipts-view";

export default function PaymentsPage() {
  return (
    <SalonAdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Payments
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage and verify customer payment receipts
          </p>
        </div>

        <PaymentReceiptsView />
      </div>
    </SalonAdminLayout>
  );
}
