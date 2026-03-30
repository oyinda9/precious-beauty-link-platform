"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  DollarSign,
  Tag,
  X,
  Award,
  Shield,
  ChevronRight,
  Menu,
  Search,
  Filter,
  MoreVertical,
  StarIcon,
  Activity,
  UserCheck,
  UserX,
} from "lucide-react";
import SalonAdminLayout from "@/components/dashboard/salon-admin-layout";

interface StaffMember {
  id: string;
  userId: string;
  salonId: string;
  specialties: string[];
  hourlyRate: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  specialties: string;
  hourlyRate: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    specialties: "",
    hourlyRate: "",
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/salons/me/staff");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to fetch staff (Status: ${res.status})`,
        );
      }
      const data = await res.json();
      setStaff(data.staff || []);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to load staff members";
      setError(errorMsg);
      console.error(`[fetchStaff] ${errorMsg}`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      specialties: "",
      hourlyRate: "",
    });
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const handleAddStaff = async () => {
    setError("");
    setSuccess("");

    if (!formData.fullName || !formData.email) {
      setError("Full name and email are required");
      return;
    }

    try {
      setSubmitting(true);
      const specialtiesArray = formData.specialties
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);

      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || null,
        specialties: specialtiesArray,
        hourlyRate: formData.hourlyRate
          ? parseFloat(formData.hourlyRate)
          : null,
      };

      const res = await fetch("/api/salons/me/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add staff");
      }

      setSuccess("Staff member added successfully!");
      resetForm();
      setShowStaffForm(false);
      fetchStaff();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      console.error("[handleAddStaff] Error:", errorMsg, err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    setStaffToDelete(staffId);
  };

  const confirmDelete = async () => {
    if (!staffToDelete) return;

    try {
      setConfirmingDelete(true);
      setDeleting(staffToDelete);
      const res = await fetch(`/api/salons/me/staff/${staffToDelete}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete staff");

      setSuccess("Staff member removed successfully");
      fetchStaff();
      setStaffToDelete(null);
    } catch (err) {
      setError("Failed to delete staff member");
      console.error(err);
      setStaffToDelete(null);
    } finally {
      setDeleting(null);
      setConfirmingDelete(false);
    }
  };

  const filteredStaff = staff.filter(
    (member) =>
      member.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.specialties.some((spec) =>
        spec.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  const stats = {
    total: staff.length,
    active: staff.filter((m) => m.isActive).length,
    totalSpecialties: staff.reduce((acc, m) => acc + m.specialties.length, 0),
    avgRate:
      staff.reduce((acc, m) => acc + (m.hourlyRate || 0), 0) / staff.length ||
      0,
  };

  return (
    <SalonAdminLayout>
      <div className="bg-gradient-to-br from-slate-50 via-white to-purple-50/20 min-h-screen">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                      Team Management
                    </h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                      Manage your salon professionals and their expertise
                    </p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setShowStaffForm(!showStaffForm)}
                className={`${
                  showStaffForm
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                }`}
              >
                {showStaffForm ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Team Member
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Alerts */}
          {(success || error) && (
            <div className="mb-6 animate-in slide-in-from-top duration-300">
              {success && (
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert className="border-red-200 bg-red-50 text-red-800">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Add Staff Form */}
          {showStaffForm && (
            <div className="mb-8 animate-in slide-in-from-top duration-300">
              <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="border-b border-slate-200 bg-gradient-to-r from-purple-50/50 to-pink-50/50 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-sm">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-slate-900">
                        New Staff Member
                      </h2>
                      <p className="text-sm text-slate-500">
                        Create a new staff account
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label className="text-sm font-medium text-slate-700">
                        Full Name *
                      </Label>
                      <Input
                        name="fullName"
                        placeholder="e.g., Sarah Johnson"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-700">
                        Email Address *
                      </Label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="sarah@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-700">
                        Phone Number
                      </Label>
                      <Input
                        name="phone"
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-700">
                        Hourly Rate (₦)
                      </Label>
                      <Input
                        name="hourlyRate"
                        type="number"
                        placeholder="5000"
                        value={formData.hourlyRate}
                        onChange={handleInputChange}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium text-slate-700">
                        Specialties
                      </Label>
                      <Input
                        name="specialties"
                        placeholder="Hair Styling, Color Treatment, Bridal Makeup"
                        value={formData.specialties}
                        onChange={handleInputChange}
                        className="mt-1.5"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        Separate multiple specialties with commas
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowStaffForm(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddStaff}
                      disabled={submitting}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Staff Account"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and View Toggle */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white border-slate-200 focus:border-purple-300"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-slate-900" : ""}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-slate-900" : ""}
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Staff Display */}
          {loading ? (
            <div className="text-center py-16">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-purple-500" />
              <p className="text-slate-500 mt-4">Loading team members...</p>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No team members found
              </h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                {searchQuery
                  ? "No results match your search criteria"
                  : "Get started by adding your first team member"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setShowStaffForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Team Member
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredStaff.map((member) => (
                <div
                  key={member.id}
                  className="group bg-white rounded-xl border border-slate-200 hover:border-purple-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5"></div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                          <span className="text-white font-bold text-lg">
                            {member.user.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {member.user.fullName}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={`mt-1 text-xs ${
                              member.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {member.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStaff(member.id)}
                        disabled={deleting === member.id}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        {deleting === member.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-purple-500" />
                        <span className="truncate">{member.user.email}</span>
                      </div>
                      {member.user.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-pink-500" />
                          <span>{member.user.phone}</span>
                        </div>
                      )}
                    </div>

                    {member.specialties.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
                          Specialties
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {member.specialties.slice(0, 2).map((spec, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full"
                            >
                              {spec}
                            </span>
                          ))}
                          {member.specialties.length > 2 && (
                            <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                              +{member.specialties.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {member.hourlyRate && (
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-sm text-slate-600">
                          Hourly Rate
                        </span>
                        <span className="font-semibold text-purple-600">
                          ₦{member.hourlyRate}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Enhanced List/Row View */
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Table Header */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-600">
                <div className="col-span-4">Staff Member</div>
                <div className="col-span-3">Contact</div>
                <div className="col-span-3">Specialties</div>
                <div className="col-span-1">Rate</div>
                <div className="col-span-1">Status</div>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredStaff.map((member) => (
                  <div
                    key={member.id}
                    className="group hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-pink-50/30 transition-all duration-200"
                  >
                    <div className="p-6 lg:p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Left Section - Staff Info */}
                        <div className="flex items-start gap-4 flex-1 min-w-0 lg:col-span-4">
                          <div className="w-12 h-12 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                            <span className="font-bold text-white text-base">
                              {member.user.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-semibold text-slate-900 text-base">
                                {member.user.fullName}
                              </h3>
                              {/* Mobile-only status badge */}
                              <Badge
                                className={`lg:hidden ${
                                  member.isActive
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}
                              >
                                {member.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-purple-500" />
                                <span className="truncate">
                                  {member.user.email}
                                </span>
                              </div>
                              {member.user.phone && (
                                <div className="flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-pink-500" />
                                  <span>{member.user.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Specialties Section */}
                        <div className="flex-1 min-w-0 lg:col-span-3">
                          {member.specialties.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {member.specialties.map((spec, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2.5 py-1 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-full font-medium border border-purple-100"
                                >
                                  {spec}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">
                              No specialties listed
                            </span>
                          )}
                        </div>

                        {/* Rate Section */}
                        <div className="lg:col-span-1">
                          {member.hourlyRate ? (
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-bold text-purple-600">
                                ₦{member.hourlyRate}
                              </span>
                              <span className="text-xs text-slate-400">
                                /hr
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              Not set
                            </span>
                          )}
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center justify-between lg:justify-end gap-4 lg:col-span-1">
                          {/* Desktop status badge */}
                          <Badge
                            className={`hidden lg:inline-flex ${
                              member.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              {member.isActive ? (
                                <Activity className="w-3 h-3" />
                              ) : (
                                <UserX className="w-3 h-3" />
                              )}
                              <span>
                                {member.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </Badge>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStaff(member.id)}
                            disabled={deleting === member.id}
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            {deleting === member.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 lg:mr-1" />
                                <span className="hidden lg:inline">Remove</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Mobile-only additional info */}
                      <div className="lg:hidden mt-3 pt-3 border-t border-slate-100">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                          {member.hourlyRate && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5 text-purple-500" />
                              <span className="font-medium text-purple-600">
                                ₦{member.hourlyRate}/hr
                              </span>
                            </div>
                          )}
                          <Badge
                            className={
                              member.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }
                          >
                            {member.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={staffToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !confirmingDelete) {
            setStaffToDelete(null);
          }
        }}
      >
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              Remove team member?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {staffToDelete &&
                staff.find((s) => s.id === staffToDelete)?.user.fullName && (
                  <span>
                    This will permanently remove{" "}
                    <strong className="text-red-600">
                      {staff.find((s) => s.id === staffToDelete)?.user.fullName}
                    </strong>{" "}
                    from your staff list. This action cannot be undone.
                  </span>
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <AlertDialogCancel disabled={confirmingDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={confirmingDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {confirmingDelete ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Member"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </SalonAdminLayout>
  );
}
