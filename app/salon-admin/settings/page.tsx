"use client";

import { useEffect, useMemo, useState } from "react";
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

type SubscriptionData = {
  planName: string;
  amount: number;
  currency: string;
  billingCycle: "month" | "year" | string;
  status: string;
  nextPaymentDate?: string | null;
};

type DayKey =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

type BusinessHours = Record<DayKey, { open: string; close: string }>;

type SettingsData = {
  salonName: string;
  email: string;
  phone: string;
  salonAddress: string;
  salonCity: string;
  salonState: string;
  businessHours: BusinessHours;
};

const DEFAULT_HOURS: BusinessHours = {
  Monday: { open: "09:00", close: "18:00" },
  Tuesday: { open: "09:00", close: "18:00" },
  Wednesday: { open: "09:00", close: "18:00" },
  Thursday: { open: "09:00", close: "18:00" },
  Friday: { open: "09:00", close: "18:00" },
  Saturday: { open: "10:00", close: "16:00" },
  Sunday: { open: "", close: "" },
};

const DAYS: DayKey[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function SettingsPage() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null,
  );
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");

  const [settings, setSettings] = useState<SettingsData>({
    salonName: "",
    email: "",
    phone: "",
    salonAddress: "",
    salonCity: "",
    salonState: "",
    businessHours: DEFAULT_HOURS,
  });

  const [savingInfo, setSavingInfo] = useState(false);
  const [savingHours, setSavingHours] = useState(false);

  const normalizeBusinessHours = (
    hours?: Partial<BusinessHours> | null,
  ): BusinessHours => ({
    Monday: {
      open: hours?.Monday?.open ?? DEFAULT_HOURS.Monday.open,
      close: hours?.Monday?.close ?? DEFAULT_HOURS.Monday.close,
    },
    Tuesday: {
      open: hours?.Tuesday?.open ?? DEFAULT_HOURS.Tuesday.open,
      close: hours?.Tuesday?.close ?? DEFAULT_HOURS.Tuesday.close,
    },
    Wednesday: {
      open: hours?.Wednesday?.open ?? DEFAULT_HOURS.Wednesday.open,
      close: hours?.Wednesday?.close ?? DEFAULT_HOURS.Wednesday.close,
    },
    Thursday: {
      open: hours?.Thursday?.open ?? DEFAULT_HOURS.Thursday.open,
      close: hours?.Thursday?.close ?? DEFAULT_HOURS.Thursday.close,
    },
    Friday: {
      open: hours?.Friday?.open ?? DEFAULT_HOURS.Friday.open,
      close: hours?.Friday?.close ?? DEFAULT_HOURS.Friday.close,
    },
    Saturday: {
      open: hours?.Saturday?.open ?? DEFAULT_HOURS.Saturday.open,
      close: hours?.Saturday?.close ?? DEFAULT_HOURS.Saturday.close,
    },
    Sunday: {
      open: hours?.Sunday?.open ?? DEFAULT_HOURS.Sunday.open,
      close: hours?.Sunday?.close ?? DEFAULT_HOURS.Sunday.close,
    },
  });

  const loadSettings = async () => {
    const res = await fetch("/api/salon-admin/settings", {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error || "Failed to load settings");
    }

    const data = await res.json();

    setSettings({
      salonName: data.salonName ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      salonAddress: data.salonAddress ?? "",
      salonCity: data.salonCity ?? "",
      salonState: data.salonState ?? "",
      businessHours: normalizeBusinessHours(data.businessHours),
    });
  };

  const loadSubscription = async () => {
    const res = await fetch("/api/salon-admin/subscription", {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      setSubscription(null);
      return;
    }

    const sub = (await res.json()) as SubscriptionData;
    setSubscription(sub);
  };

  useEffect(() => {
    const loadAll = async () => {
      setFormError("");
      try {
        await Promise.all([loadSettings(), loadSubscription()]);
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "Failed to load settings",
        );
      } finally {
        setLoadingSettings(false);
        setLoadingSubscription(false);
      }
    };

    loadAll();
  }, []);

  const saveBusinessInfo = async () => {
    setSavingInfo(true);
    setFormError("");
    setFormMessage("");

    try {
      const res = await fetch("/api/salon-admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          salonName: settings.salonName,
          email: settings.email,
          phone: settings.phone,
          salonAddress: settings.salonAddress,
          salonCity: settings.salonCity,
          salonState: settings.salonState,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to save business information");
      }

      if (data) {
        setSettings((prev) => ({
          ...prev,
          salonName: data.salonName ?? prev.salonName,
          email: data.email ?? prev.email,
          phone: data.phone ?? prev.phone,
          salonAddress: data.salonAddress ?? prev.salonAddress,
          salonCity: data.salonCity ?? prev.salonCity,
          salonState: data.salonState ?? prev.salonState,
        }));
      }

      setFormMessage("Business information updated");
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to save business information",
      );
    } finally {
      setSavingInfo(false);
    }
  };

  const saveBusinessHours = async () => {
    setSavingHours(true);
    setFormError("");
    setFormMessage("");

    try {
      const res = await fetch("/api/salon-admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ businessHours: settings.businessHours }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to save business hours");
      }

      if (data?.businessHours) {
        setSettings((prev) => ({
          ...prev,
          businessHours: normalizeBusinessHours(data.businessHours),
        }));
      }

      setFormMessage("Business hours updated");
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to save business hours",
      );
    } finally {
      setSavingHours(false);
    }
  };

  const formattedAmount = useMemo(() => {
    if (!subscription) return "N/A";
    return `${new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: subscription.currency || "NGN",
      maximumFractionDigits: 0,
    }).format(
      subscription.amount || 0,
    )}/${subscription.billingCycle || "month"}`;
  }, [subscription]);

  const formattedNextPayment = useMemo(() => {
    if (!subscription?.nextPaymentDate) return "No upcoming payment";
    return `Next payment: ${new Date(
      subscription.nextPaymentDate,
    ).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`;
  }, [subscription]);

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
          {(formError || formMessage) && (
            <div
              className={`mb-4 rounded-md px-4 py-3 text-sm ${
                formError
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              {formError || formMessage}
            </div>
          )}

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
                  <Input
                    value={settings.salonName}
                    onChange={(e) =>
                      setSettings((p) => ({ ...p, salonName: e.target.value }))
                    }
                    className="mt-1"
                    disabled={loadingSettings || savingInfo}
                  />
                </div>
                <div>
                  <Label className="text-sm">Email</Label>
                  <Input
                    value={settings.email}
                    onChange={(e) =>
                      setSettings((p) => ({ ...p, email: e.target.value }))
                    }
                    className="mt-1"
                    disabled={loadingSettings || savingInfo}
                  />
                </div>
                <div>
                  <Label className="text-sm">Phone</Label>
                  <Input
                    value={settings.phone}
                    onChange={(e) =>
                      setSettings((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="mt-1"
                    disabled={loadingSettings || savingInfo}
                  />
                </div>
                <div>
                  <Label className="text-sm">Address</Label>
                  <Input
                    value={settings.salonAddress}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        salonAddress: e.target.value,
                      }))
                    }
                    className="mt-1"
                    disabled={loadingSettings || savingInfo}
                  />
                </div>
                <div>
                  <Label className="text-sm">City</Label>
                  <Input
                    value={settings.salonCity}
                    onChange={(e) =>
                      setSettings((p) => ({ ...p, salonCity: e.target.value }))
                    }
                    className="mt-1"
                    disabled={loadingSettings || savingInfo}
                  />
                </div>
                <div>
                  <Label className="text-sm">State</Label>
                  <Input
                    value={settings.salonState}
                    onChange={(e) =>
                      setSettings((p) => ({ ...p, salonState: e.target.value }))
                    }
                    className="mt-1"
                    disabled={loadingSettings || savingInfo}
                  />
                </div>

                <Button
                  onClick={saveBusinessInfo}
                  disabled={loadingSettings || savingInfo}
                  className="w-full bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600"
                >
                  {savingInfo ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-base">Business Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {DAYS.map((day) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {day}
                    </span>
                    <div className="flex items-center gap-2">
                      <Input
                        className="w-24"
                        value={settings.businessHours[day].open}
                        onChange={(e) =>
                          setSettings((p) => ({
                            ...p,
                            businessHours: {
                              ...p.businessHours,
                              [day]: {
                                ...p.businessHours[day],
                                open: e.target.value,
                              },
                            },
                          }))
                        }
                        disabled={loadingSettings || savingHours}
                      />
                      <span className="text-slate-500">-</span>
                      <Input
                        className="w-24"
                        value={settings.businessHours[day].close}
                        onChange={(e) =>
                          setSettings((p) => ({
                            ...p,
                            businessHours: {
                              ...p.businessHours,
                              [day]: {
                                ...p.businessHours[day],
                                close: e.target.value,
                              },
                            },
                          }))
                        }
                        disabled={loadingSettings || savingHours}
                      />
                    </div>
                  </div>
                ))}

                <Button
                  onClick={saveBusinessHours}
                  disabled={loadingSettings || savingHours}
                  className="w-full bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600"
                >
                  {savingHours ? "Saving..." : "Update Hours"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

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
            {loadingSubscription
              ? "Loading..."
              : (subscription?.planName ?? "No Plan")}
          </Badge>
        </CardHeader>

        <CardContent className="p-6 pt-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-slate-700 dark:text-slate-200 text-base font-medium mb-1">
              {loadingSubscription
                ? "Loading..."
                : (subscription?.planName ?? "No active plan")}
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">
              {loadingSubscription
                ? "Loading..."
                : subscription
                  ? `${formattedAmount} • Access all features`
                  : "No billing details found"}
            </p>
            <p className="text-xs text-slate-400">
              {loadingSubscription ? "Loading..." : formattedNextPayment}
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
                    {loadingSubscription
                      ? "Loading..."
                      : (subscription?.planName ?? "No Plan")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Amount:</span>
                  <span className="font-semibold">
                    {loadingSubscription ? "Loading..." : formattedAmount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span className="text-emerald-600 font-medium capitalize">
                    {loadingSubscription
                      ? "Loading..."
                      : (subscription?.status ?? "Unknown")}
                  </span>
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
