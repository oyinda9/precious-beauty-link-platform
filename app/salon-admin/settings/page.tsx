"use client";
"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import SalonAdminLayout from "@/components/dashboard/salon-admin-layout";

export default function SettingsPage() {
  return (
    <SalonAdminLayout>
      <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm mb-8">
        <CardHeader className="p-6">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-600" />
            Salon Settings
          </CardTitle>
          <CardDescription>
            Manage your business information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-base">
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm">Salon Name</Label>
                  <Input value={""} className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">Email</Label>
                  <Input value={""} className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">Phone</Label>
                  <Input value={""} className="mt-1" />
                </div>
                <Button className="w-full bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-base">Business Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {day}
                    </span>
                    <div className="flex items-center gap-2">
                      <Input className="w-20" placeholder="9:00" />
                      <span className="text-slate-500">-</span>
                      <Input className="w-20" placeholder="18:00" />
                    </div>
                  </div>
                ))}
                <Button className="w-full bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600">
                  Update Hours
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Plan Section */}
      <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm mb-8">
        <CardHeader className="p-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              Subscription Plan
            </CardTitle>
            <CardDescription>
              Your current plan and payment status
            </CardDescription>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
            Pro
          </Badge>
        </CardHeader>
        <CardContent className="p-6 pt-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-slate-700 dark:text-slate-200 text-base font-medium mb-1">
              Pro Plan
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">
              ₦5,000/month • Access all features
            </p>
            <p className="text-xs text-slate-400">
              Next payment: April 12, 2026
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600">
                Manage Subscription
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Manage Subscription</DialogTitle>
                <DialogDescription>
                  Update your plan or payment method.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 my-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Current Plan:</span>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                    Pro
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Amount:</span>
                  <span className="font-semibold">₦5,000/month</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span className="text-emerald-600 font-medium">Active</span>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
                <Button className="bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600">
                  Update Payment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </SalonAdminLayout>
  );
}
