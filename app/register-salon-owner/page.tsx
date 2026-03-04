"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Phone,
  Store,
  MapPin,
  Globe,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Scissors,
  Building2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormData {
  // Account fields
  fullName: string;
  email: string;
  password: string;
  phone: string;

  // Salon fields
  salonName: string;
  salonSlug: string;
  salonAddress: string;
  salonCity: string;
  salonState: string;
  salonDescription: string;
  salonPhone: string;
}

export default function RegisterSalonOwnerPage() {
  const router = useRouter();
  const [step, setStep] = useState<"account" | "salon">("account");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Slug availability
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  const [formData, setFormData] = useState<FormData>({
    // Account
    fullName: "",
    email: "",
    password: "",
    phone: "",

    // Salon
    salonName: "",
    salonSlug: "",
    salonAddress: "",
    salonCity: "",
    salonState: "",
    salonDescription: "",
    salonPhone: "",
  });

  // Helper Functions
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    setSlugChecking(true);
    try {
      const res = await fetch(
        `/api/salons/check-slug?slug=${encodeURIComponent(slug)}`,
      );
      const data = await res.json();
      setSlugAvailable(data.available);
    } catch (err) {
      console.error("Error checking slug:", err);
      setSlugAvailable(null);
    } finally {
      setSlugChecking(false);
    }
  };

  // Event Handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSalonNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    handleChange(e);

    // Auto-generate slug
    if (
      !formData.salonSlug ||
      formData.salonSlug === generateSlug(formData.salonName)
    ) {
      const newSlug = generateSlug(name);
      setFormData((prev) => ({ ...prev, salonSlug: newSlug }));
      checkSlugAvailability(newSlug);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setFormData((prev) => ({ ...prev, salonSlug: slug }));
    checkSlugAvailability(slug);
  };

  // Validation
  const validateAccountStep = () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const validateSalonStep = () => {
    if (
      !formData.salonName ||
      !formData.salonSlug ||
      !formData.salonAddress ||
      !formData.salonCity
    ) {
      setError("Please fill in all required salon fields");
      return false;
    }
    if (slugAvailable === false) {
      setError("Salon URL is already taken. Please choose another one.");
      return false;
    }
    if (formData.salonSlug.length < 3) {
      setError("Salon URL must be at least 3 characters");
      return false;
    }
    return true;
  };

  // Form Submissions
  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAccountStep()) {
      setStep("salon");
    }
  };

  const handleSalonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSalonStep()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Account data
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
          role: "SALON_ADMIN",

          // Salon data
          salonName: formData.salonName,
          salonSlug: formData.salonSlug,
          salonAddress: formData.salonAddress,
          salonCity: formData.salonCity,
          salonState: formData.salonState,
          salonDescription: formData.salonDescription,
          salonPhone: formData.salonPhone,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      setSuccess(
        "Salon created successfully! Redirecting to your dashboard...",
      );
      setTimeout(() => router.push("/salon-admin/dashboard"), 1500);
    } catch (error: any) {
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      {/* Floating Icons */}
      <div className="absolute top-20 left-20 hidden lg:block animate-float">
        <div className="w-16 h-16 bg-white/80 backdrop-blur rounded-2xl shadow-xl flex items-center justify-center rotate-12">
          <Scissors className="w-8 h-8 text-purple-600" />
        </div>
      </div>

      <div className="absolute bottom-20 right-20 hidden lg:block animate-float animation-delay-2000">
        <div className="w-16 h-16 bg-white/80 backdrop-blur rounded-2xl shadow-xl flex items-center justify-center -rotate-12">
          <Building2 className="w-8 h-8 text-pink-600" />
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-2xl relative z-10">
        {/* Progress Steps - Desktop */}
        <div className="hidden lg:flex items-center justify-center gap-4 mb-8">
          <div
            className={`flex items-center gap-2 ${step === "account" ? "text-purple-600" : "text-gray-400"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step === "account"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </div>
            <span className="font-medium">Account Details</span>
          </div>
          <div
            className={`w-16 h-0.5 ${step === "salon" ? "bg-purple-600" : "bg-gray-200"}`}
          />
          <div
            className={`flex items-center gap-2 ${step === "salon" ? "text-purple-600" : "text-gray-400"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step === "salon"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </div>
            <span className="font-medium">Salon Setup</span>
          </div>
        </div>

        {/* Main Card */}
        <Card className="bg-white/80 backdrop-blur-xl border-2 border-white/50 shadow-2xl">
          <CardHeader className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl transform group-hover:scale-105 transition-transform">
                  SB
                </div>
              </div>
            </div>

            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {step === "account" ? "Start Your Journey" : "Setup Your Salon"}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {step === "account"
                ? "Create your account to begin managing your salon"
                : "Tell us about your salon to get started"}
            </CardDescription>

            {/* Mobile Progress Dots */}
            <div className="lg:hidden flex items-center justify-center gap-2 mt-4">
              <div
                className={`w-2 h-2 rounded-full ${step === "account" ? "bg-purple-600 w-4" : "bg-gray-300"}`}
              />
              <div
                className={`w-2 h-2 rounded-full ${step === "salon" ? "bg-purple-600 w-4" : "bg-gray-300"}`}
              />
            </div>
          </CardHeader>

          <CardContent>
            {/* Account Step Form */}
            {step === "account" ? (
              <form onSubmit={handleAccountSubmit} className="space-y-5">
                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 animate-shake">
                    <AlertCircle
                      className="text-red-500 mt-0.5 flex-shrink-0"
                      size={18}
                    />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Full Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="fullName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="pl-10 h-12 border-2 border-gray-200 focus:border-purple-600 focus:ring-purple-600 rounded-xl transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="pl-10 h-12 border-2 border-gray-200 focus:border-purple-600 focus:ring-purple-600 rounded-xl transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="pl-10 pr-10 h-12 border-2 border-gray-200 focus:border-purple-600 focus:ring-purple-600 rounded-xl transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Minimum 8 characters</p>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+234 123 456 7890"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10 h-12 border-2 border-gray-200 focus:border-purple-600 focus:ring-purple-600 rounded-xl transition-all"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 rounded-xl shadow-lg hover:shadow-xl transition-all text-base font-semibold group"
                >
                  Continue to Salon Setup
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>

                <p className="text-center text-sm text-gray-500">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            ) : (
              /* Salon Step Form */
              <form onSubmit={handleSalonSubmit} className="space-y-5">
                {/* Messages */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 animate-shake">
                    <AlertCircle
                      className="text-red-500 mt-0.5 flex-shrink-0"
                      size={18}
                    />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex gap-3">
                    <CheckCircle2
                      className="text-green-500 mt-0.5 flex-shrink-0"
                      size={18}
                    />
                    <p className="text-sm text-green-600">{success}</p>
                  </div>
                )}

                {/* Salon Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="salonName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Salon Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="salonName"
                      name="salonName"
                      placeholder="Beauty Haven Spa"
                      value={formData.salonName}
                      onChange={handleSalonNameChange}
                      required
                      className="pl-10 h-12 border-2 border-gray-200 focus:border-purple-600 focus:ring-purple-600 rounded-xl transition-all"
                    />
                  </div>
                </div>

                {/* Salon URL */}
                <div className="space-y-2">
                  <Label
                    htmlFor="salonSlug"
                    className="text-sm font-medium text-gray-700"
                  >
                    Salon URL <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="salonSlug"
                        name="salonSlug"
                        placeholder="beauty-haven-spa"
                        value={formData.salonSlug}
                        onChange={handleSlugChange}
                        required
                        className="pl-10 h-12 border-2 border-gray-200 focus:border-purple-600 focus:ring-purple-600 rounded-xl transition-all"
                      />
                    </div>
                    <div className="w-12 h-12 flex items-center justify-center">
                      {slugChecking && (
                        <Loader2
                          size={24}
                          className="animate-spin text-purple-600"
                        />
                      )}
                      {slugAvailable === true && (
                        <CheckCircle2 size={24} className="text-green-500" />
                      )}
                      {slugAvailable === false && (
                        <AlertCircle size={24} className="text-red-500" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Your salon will be at:{" "}
                    <span className="font-mono text-purple-600">
                      /salon/{formData.salonSlug || "your-salon"}
                    </span>
                  </p>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label
                    htmlFor="salonAddress"
                    className="text-sm font-medium text-gray-700"
                  >
                    Street Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="salonAddress"
                      name="salonAddress"
                      placeholder="123 Main Street"
                      value={formData.salonAddress}
                      onChange={handleChange}
                      required
                      className="pl-10 h-12 border-2 border-gray-200 focus:border-purple-600 focus:ring-purple-600 rounded-xl transition-all"
                    />
                  </div>
                </div>

                {/* City and State */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="salonCity"
                      className="text-sm font-medium text-gray-700"
                    >
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="salonCity"
                      name="salonCity"
                      placeholder="Lagos"
                      value={formData.salonCity}
                      onChange={handleChange}
                      required
                      className="h-12 border-2 border-gray-200 focus:border-purple-600 focus:ring-purple-600 rounded-xl transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="salonState"
                      className="text-sm font-medium text-gray-700"
                    >
                      State
                    </Label>
                    <Input
                      id="salonState"
                      name="salonState"
                      placeholder="Lagos State"
                      value={formData.salonState}
                      onChange={handleChange}
                      className="h-12 border-2 border-gray-200 focus:border-purple-600 focus:ring-purple-600 rounded-xl transition-all"
                    />
                  </div>
                </div>

                {/* Salon Phone */}
                <div className="space-y-2">
                  <Label
                    htmlFor="salonPhone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Salon Phone
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="salonPhone"
                      name="salonPhone"
                      type="tel"
                      placeholder="+234 123 456 7890"
                      value={formData.salonPhone}
                      onChange={handleChange}
                      className="pl-10 h-12 border-2 border-gray-200 focus:border-purple-600 focus:ring-purple-600 rounded-xl transition-all"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label
                    htmlFor="salonDescription"
                    className="text-sm font-medium text-gray-700"
                  >
                    About Your Salon
                  </Label>
                  <textarea
                    id="salonDescription"
                    name="salonDescription"
                    placeholder="Tell customers about your salon, your services, and what makes you special..."
                    value={formData.salonDescription}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 focus:border-purple-600 focus:ring-purple-600 rounded-xl transition-all text-sm bg-white/50 resize-none"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12 border-2 border-gray-200 hover:border-purple-600 hover:text-purple-600 rounded-xl transition-all"
                    onClick={() => setStep("account")}
                    disabled={false}
                  >
                    <ChevronLeft className="mr-2 w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
                    disabled={false}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Salon
                        <ChevronRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Benefits Card */}
        <Card className="mt-6 bg-white/80 backdrop-blur-xl border-2 border-white/50 shadow-xl">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600">14-day free trial</span>
              </div>
              <div className="hidden sm:block w-px h-8 bg-gray-200" />
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600">
                  No credit card required
                </span>
              </div>
              <div className="hidden sm:block w-px h-8 bg-gray-200" />
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600">Cancel anytime</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-2px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(2px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
