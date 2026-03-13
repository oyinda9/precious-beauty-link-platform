"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import SalonAdminLayout from "@/components/dashboard/salon-admin-layout";

export default function ReviewsPage() {
  return (
    <SalonAdminLayout>
      <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm">
        <CardHeader className="p-6">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-slate-600" />
            Reviews
          </CardTitle>
          <CardDescription>Manage customer reviews and feedback</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="text-center py-16">
            <MessageSquare className="w-20 h-20 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
              No Reviews Yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              When customers leave reviews, they'll appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    </SalonAdminLayout>
  );
}
