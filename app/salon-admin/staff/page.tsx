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

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  DollarSign,
  Tag,
  Eye,
  EyeOff,
  X,
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
  password: string;
  confirmPassword: string;
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    specialties: "",
    hourlyRate: "",
  });

  const passwordsMatch = !!(
    formData.password && formData.confirmPassword === formData.password
  );
  const passwordMismatch = !!(
    formData.password &&
    formData.confirmPassword &&
    !passwordsMatch
  );

  // Fetch staff members
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
      password: "",
      confirmPassword: "",
      specialties: "",
      hourlyRate: "",
    });
    setEditingId(null);
  };

  const handleAddStaff = async () => {
    setError("");
    setSuccess("");

    // Validation
    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Full name, email, and password are required");
      return;
    }

    if (passwordMismatch) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
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
        password: formData.password,
        specialties: specialtiesArray,
        hourlyRate: formData.hourlyRate
          ? parseFloat(formData.hourlyRate)
          : null,
      };

      console.log("[handleAddStaff] Submitting payload:", payload);

      const res = await fetch("/api/salons/me/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("[handleAddStaff] Response status:", res.status, res.ok);

      if (!res.ok) {
        const data = await res.json();
        console.error("[handleAddStaff] Error response:", data);
        throw new Error(data.error || "Failed to add staff");
      }

      const responseData = await res.json();
      console.log("[handleAddStaff] Success response:", responseData);

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
    if (!confirm("Are you sure you want to remove this staff member?")) return;

    try {
      setDeleting(staffId);
      const res = await fetch(`/api/salons/me/staff/${staffId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete staff");

      setSuccess("Staff member removed successfully");
      fetchStaff();
    } catch (err) {
      setError("Failed to delete staff member");
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <SalonAdminLayout>
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Members</h1>
            <p className="text-gray-600 mt-1">Manage your salon team</p>
          </div>
          <Button
            onClick={() => setShowStaffForm(!showStaffForm)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Staff Member
          </Button>
        </div>

        {/* Main Grid Layout */}
        <div className={`grid gap-6 ${showStaffForm ? "lg:grid-cols-2" : ""}`}>
          {/* Add Staff Form Card - Inline & Collapsible */}
          {showStaffForm && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Add New Staff Member</CardTitle>
                  <CardDescription>
                    Create a new account for your staff member
                  </CardDescription>
                </div>
                <button
                  onClick={() => {
                    setShowStaffForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert className="border-destructive/50 bg-destructive/10 mb-4">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+234XXXXXXXXXX"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onInput={(e) => {
                        const input = e.currentTarget;
                        input.value = input.value.replace(/[^0-9+]/g, "");
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 8 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={passwordMismatch ? "border-destructive" : ""}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordMismatch && (
                      <p className="text-xs text-destructive mt-1">
                        Passwords do not match
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="specialties">
                      Specialties (comma-separated)
                    </Label>
                    <Input
                      id="specialties"
                      name="specialties"
                      placeholder="e.g. Haircut, Coloring, Extensions"
                      value={formData.specialties}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate (₦)</Label>
                    <Input
                      id="hourlyRate"
                      name="hourlyRate"
                      type="number"
                      placeholder="5000"
                      value={formData.hourlyRate}
                      onChange={handleInputChange}
                    />
                  </div>

                  <Button
                    onClick={handleAddStaff}
                    disabled={submitting || passwordMismatch}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Staff Member"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription className="text-green-700">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Staff List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Your Staff Team
              </CardTitle>
              <CardDescription>
                {staff.length} {staff.length === 1 ? "member" : "members"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
                  <p className="text-gray-600 mt-2">Loading staff...</p>
                </div>
              ) : staff.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No staff members yet</p>
                  <Button
                    onClick={() => setShowStaffForm(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Staff Member
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {staff.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-colors gap-4"
                    >
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {member.user.fullName}
                          </h3>
                          <div className="flex flex-col gap-1 text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {member.user.email}
                            </div>
                            {member.user.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {member.user.phone}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                          {member.specialties.length > 0 && (
                            <>
                              <Tag className="w-4 h-4 text-gray-400" />
                              <div className="flex flex-wrap gap-1">
                                {member.specialties.map((spec, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                                  >
                                    {spec}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                        {member.hourlyRate && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign className="w-4 h-4" />₦
                            {member.hourlyRate}
                            /hour
                          </div>
                        )}

                        <div className="text-xs text-gray-500">
                          Status:{" "}
                          <span
                            className={
                              member.isActive
                                ? "text-green-600 font-semibold"
                                : "text-gray-400 font-semibold"
                            }
                          >
                            {member.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteStaff(member.id)}
                          disabled={deleting === member.id}
                        >
                          {deleting === member.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SalonAdminLayout>
  );
}
