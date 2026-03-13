"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import SalonAdminLayout from "@/components/dashboard/salon-admin-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle,
  Scissors,
  AlertCircle,
} from "lucide-react";
import { Label } from "@radix-ui/react-label";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  category: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SalonInfo {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  email: string;
  phone: string;
  rating?: number;
  reviewCount?: number;
  logo?: string;
}

export default function ServicesPage() {
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const emptyForm = {
    name: "",
    description: "",
    price: 0,
    duration: 30,
    category: "",
  };
  const [serviceForm, setServiceForm] = useState(emptyForm);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [savingService, setSavingService] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [serviceSuccess, setServiceSuccess] = useState<string | null>(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [salon, setSalon] = useState<SalonInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchSalonInfo();
  }, []);

  useEffect(() => {
    if (salon) loadServices();
  }, [salon]);

  const fetchSalonInfo = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await fetch("/api/salons/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch salon info");
      const json = await res.json();
      if (json.salons?.length > 0) setSalon(json.salons[0]);
    } catch (err: any) {
      setServiceError(err.message);
    }
  };

  const loadServices = async () => {
    if (!salon) return;
    setLoadingServices(true);
    setServiceError(null);
    try {
      const slug = salon.slug.toLowerCase();
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await fetch(`/api/salons/${slug}/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to load services");
      }
      const json = await res.json();
      setServicesList(json.services || []);
    } catch (err: any) {
      setServiceError(err.message || "Failed to load services");
    } finally {
      setLoadingServices(false);
    }
  };

  const startEditService = (service: Service) => {
    setEditingServiceId(service.id);
    setServiceForm({
      name: service.name,
      description: service.description || "",
      price: service.price,
      duration: service.duration,
      category: service.category || "",
    });
    setShowServiceForm(true);
    setServiceError(null);
    setServiceSuccess(null);
  };

  const handleSaveService = async () => {
    setServiceError(null);
    setServiceSuccess(null);

    if (!serviceForm.name.trim()) {
      setServiceError("Service name is required.");
      return;
    }
    if (!serviceForm.price || serviceForm.price <= 0) {
      setServiceError("Price must be greater than 0.");
      return;
    }
    if (!serviceForm.duration || serviceForm.duration <= 0) {
      setServiceError("Duration must be greater than 0.");
      return;
    }
    if (!salon) {
      setServiceError("Salon information not available.");
      return;
    }

    try {
      setSavingService(true);
      const slug = salon.slug.toLowerCase();
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }
      const url = editingServiceId
        ? `/api/salons/${slug}/services/${editingServiceId}`
        : `/api/salons/${slug}/services`;
      const method = editingServiceId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(serviceForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save service");

      setEditingServiceId(null);
      setServiceForm(emptyForm);
      setShowServiceForm(false);
      setServiceSuccess(
        editingServiceId
          ? "Service updated successfully!"
          : "Service created successfully!",
      );
      await loadServices();
      setTimeout(() => setServiceSuccess(null), 3000);
    } catch (err: any) {
      setServiceError(
        err.message || "Failed to save service. Please try again.",
      );
    } finally {
      setSavingService(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this service? This action cannot be undone.",
      )
    ) {
      return;
    }

    if (!salon) return;

    try {
      const slug = salon.slug.toLowerCase();
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await fetch(`/api/salons/${slug}/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete service");
      }
      setServiceSuccess("Service deleted successfully!");
      await loadServices();
      setTimeout(() => setServiceSuccess(null), 3000);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete service",
        variant: "destructive",
      });
    }
  };

  return (
    <SalonAdminLayout>
      <Card className="border-0 bg-white dark:bg-slate-800 shadow-sm">
        <CardHeader className="p-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Scissors className="w-5 h-5 text-slate-600" />
                Services
              </CardTitle>
              <CardDescription>Manage your salon services</CardDescription>
            </div>
            <Button
              onClick={() => {
                setShowServiceForm(!showServiceForm);
                setEditingServiceId(null);
                setServiceForm(emptyForm);
                setServiceError(null);
                setServiceSuccess(null);
              }}
              className="bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-2 sm:p-6 pt-0">
          {loadingServices && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading services...</p>
            </div>
          )}

          {serviceSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5" />
              {serviceSuccess}
            </div>
          )}

          {!loadingServices && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {showServiceForm && (
                <Card className="border border-slate-200 dark:border-slate-700 shadow-sm mb-4 lg:mb-0">
                  <CardHeader className="bg-slate-50 dark:bg-slate-700/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {editingServiceId ? "Edit Service" : "Add New Service"}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setShowServiceForm(false);
                          setEditingServiceId(null);
                          setServiceForm(emptyForm);
                          setServiceError(null);
                          setServiceSuccess(null);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {serviceError && (
                      <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 rounded-lg text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {serviceError}
                      </div>
                    )}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Service Name *
                        </Label>
                        <Input
                          value={serviceForm.name}
                          onChange={(e) => {
                            setServiceForm({
                              ...serviceForm,
                              name: e.target.value,
                            });
                            setServiceError(null);
                          }}
                          placeholder="e.g., Haircut, Manicure"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">
                          Description
                        </Label>
                        <textarea
                          className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-slate-900"
                          value={serviceForm.description}
                          onChange={(e) =>
                            setServiceForm({
                              ...serviceForm,
                              description: e.target.value,
                            })
                          }
                          rows={3}
                          placeholder="Brief description of the service"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">
                            Price (₦) *
                          </Label>
                          <Input
                            type="number"
                            value={serviceForm.price}
                            onChange={(e) =>
                              setServiceForm({
                                ...serviceForm,
                                price: Number(e.target.value),
                              })
                            }
                            placeholder="0"
                            min="0"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            Duration (mins) *
                          </Label>
                          <Input
                            type="number"
                            value={serviceForm.duration}
                            onChange={(e) =>
                              setServiceForm({
                                ...serviceForm,
                                duration: Number(e.target.value),
                              })
                            }
                            placeholder="30"
                            min="0"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Category</Label>
                        <Input
                          value={serviceForm.category}
                          onChange={(e) =>
                            setServiceForm({
                              ...serviceForm,
                              category: e.target.value,
                            })
                          }
                          placeholder="e.g., Hair, Nails, Spa"
                          className="mt-1"
                        />
                      </div>

                      <Button
                        onClick={handleSaveService}
                        className="w-full bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600"
                      >
                        {savingService ? (
                          <span className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Saving...
                          </span>
                        ) : editingServiceId ? (
                          "Update Service"
                        ) : (
                          "Create Service"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div
                className={showServiceForm ? "lg:col-span-1" : "lg:col-span-2"}
              >
                <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">
                  Your Services ({servicesList.length})
                </h3>

                {servicesList.length === 0 && !loadingServices ? (
                  <div className="text-center py-8 sm:py-12 bg-slate-50 dark:bg-slate-700/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <Scissors className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-500">No services yet</p>
                    <Button
                      variant="link"
                      onClick={() => setShowServiceForm(true)}
                      className="text-slate-600 mt-2"
                    >
                      Add your first service
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {servicesList.map((service) => (
                      <Card
                        key={service.id}
                        className="border border-slate-200 dark:border-slate-700 hover:shadow-sm transition-all"
                      >
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-slate-800 dark:text-white text-base sm:text-lg">
                                  {service.name}
                                </h4>
                                <Badge className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-0">
                                  {service.duration} mins
                                </Badge>
                              </div>
                              {service.description && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                  {service.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-slate-800 dark:text-white">
                                  ₦{service.price.toLocaleString()}
                                </span>
                                {service.category && (
                                  <Badge
                                    variant="outline"
                                    className="border-slate-200 dark:border-slate-700"
                                  >
                                    {service.category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 mt-2 sm:mt-0 ml-0 sm:ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEditService(service)}
                                className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteService(service.id)}
                                className="border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </SalonAdminLayout>
  );
}
