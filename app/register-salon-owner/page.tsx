"use client";

import { useState, useEffect } from "react";
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
  Scissors,
  Building2,
} from "lucide-react";
import { NIGERIAN_STATES } from "@/lib/constants/nigerian-states";

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
  fullName: string;
  email: string;
  password: string;
  phone: string;
  salonName: string;
  salonSlug: string;
  salonAddress: string;
  salonCity: string;
  salonState: string;
  salonDescription: string;
  salonPhone: string;
}

type PlanKey = "FREE" | "STARTER" | "STANDARD" | "GROWTH" | "PREMIUM";

const PLANS = [
  {
    key: "FREE" as PlanKey,
    name: "Free / Trial",
    price: "₦0/mo",
    amount: 0,
    desc: "Up to 10 bookings/month, basic dashboard",
  },
  {
    key: "STARTER" as PlanKey,
    name: "Starter",
    price: "₦5,000/mo",
    amount: 5000,
    desc: "Up to 30 bookings/month, WhatsApp notifications",
  },
  {
    key: "STANDARD" as PlanKey,
    name: "Standard",
    price: "₦10,000/mo",
    amount: 10000,
    desc: "Up to 50 bookings/month, priority support",
  },
  {
    key: "GROWTH" as PlanKey,
    name: "Growth",
    price: "₦20,000/mo",
    amount: 20000,
    desc: "Up to 100 bookings/month, advanced analytics",
  },
  {
    key: "PREMIUM" as PlanKey,
    name: "Premium",
    price: "₦30,000/mo",
    amount: 30000,
    desc: "Unlimited bookings, all features, priority support",
  },
];

export default function RegisterSalonOwnerPage() {
  const router = useRouter();
  const [step, setStep] = useState<"account" | "salon" | "plan" | "payment">(
    "account",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | "">("");
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    salonName: "",
    salonSlug: "",
    salonAddress: "",
    salonCity: "",
    salonState: "",
    salonDescription: "",
    salonPhone: "",
  });

  const [hasRegistered, setHasRegistered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

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
    } catch {
      setSlugAvailable(null);
    } finally {
      setSlugChecking(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSalonNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    handleChange(e);
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
      !formData.salonCity ||
      !formData.salonState
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

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAccountStep()) {
      setError("");
      setStep("salon");
    }
  };

  const handleSalonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateSalonStep()) {
      setError("");
      setStep("plan");
    }
  };

  // After plan selected: FREE → register directly, paid → show card form
  const handlePlanNext = () => {
    if (!selectedPlan) {
      setError("Please select a plan to continue");
      return;
    }
    setError("");
    if (selectedPlan === "FREE") {
      handleRegisterAndActivate("FREE");
    } else {
      setStep("payment");
    }
  };

  // Register account + process Monnify payment
  const handleRegisterAndActivate = async (planKey: PlanKey) => {
    setLoading(true);
    setError("");

    try {
      // Register only once
      if (!hasRegistered) {
        const regRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            phone: formData.phone,
            role: "SALON_ADMIN",
            salonName: formData.salonName,
            salonSlug: formData.salonSlug,
            salonAddress: formData.salonAddress,
            salonCity: formData.salonCity,
            salonState: formData.salonState,
            salonPhone: formData.salonPhone,
            plan: planKey,
          }),
        });

        const regData = await regRes.json().catch(() => ({}));
        if (!regRes.ok) {
          const msg = String(regData?.error || "");
          if (!msg.toLowerCase().includes("already registered")) {
            throw new Error(regData?.error || "Registration failed");
          }
        }
        setHasRegistered(true);
      }

      // login for auth cookie
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const loginData = await loginRes.json().catch(() => ({}));
      if (!loginRes.ok) {
        throw new Error(loginData?.error || "Login failed");
      }

      // ✅ get token from login response (if cookie is not set)
      const authToken =
        loginData?.token ||
        loginData?.accessToken ||
        loginData?.data?.token ||
        "";

      if (planKey === "FREE") {
        setSuccess("Registration successful! Redirecting...");
        setTimeout(() => router.push("/salon-admin/dashboard"), 1200);
        return;
      }

      const payRes = await fetch("/api/payments/monnify/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          planKey,
          productName: "Salon Subscription",
          productDescription: `${planKey} plan`,
        }),
      });

      const payData = await payRes.json();
      if (!payRes.ok) {
        throw new Error(payData?.error || "Payment initialization failed");
      }
      if (!payData?.redirectUrl) {
        throw new Error("Missing Monnify checkout URL");
      }

      window.location.href = payData.redirectUrl;
      return; // ✅ prevent falling through
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) {
      setError("Please select a plan");
      return;
    }
    handleRegisterAndActivate(selectedPlan as PlanKey);
  };

  const selectedPlanInfo = PLANS.find((p) => p.key === selectedPlan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Balls Background - Pure Tailwind */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-[blob_7s_infinite] top-0 -left-20"></div>
        <div className="absolute w-96 h-96 bg-pink-300/30 rounded-full blur-3xl animate-[blob_7s_infinite_2s] top-1/2 -right-20"></div>
        <div className="absolute w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-[blob_7s_infinite_4s] bottom-0 left-1/3"></div>
        <div className="absolute w-80 h-80 bg-pink-400/20 rounded-full blur-3xl animate-[blob_7s_infinite_1s] top-20 right-1/4"></div>

        {/* Floating small balls */}
        <div className="absolute w-16 h-16 bg-purple-400/30 rounded-full animate-[float-slow_8s_ease-in-out_infinite] top-1/4 left-1/4"></div>
        <div className="absolute w-24 h-24 bg-pink-400/30 rounded-full animate-[float-medium_6s_ease-in-out_infinite] top-2/3 left-1/5"></div>
        <div className="absolute w-12 h-12 bg-purple-500/30 rounded-full animate-[float-fast_4s_ease-in-out_infinite] top-1/2 left-3/4"></div>
        <div className="absolute w-20 h-20 bg-pink-500/30 rounded-full animate-[float-slow_8s_ease-in-out_infinite] top-3/4 left-2/3"></div>
        <div className="absolute w-32 h-32 bg-purple-300/30 rounded-full animate-[float-medium_6s_ease-in-out_infinite] top-1/5 right-1/5"></div>
        <div className="absolute w-16 h-16 bg-pink-300/30 rounded-full animate-[float-fast_4s_ease-in-out_infinite] top-4/5 right-1/4"></div>
      </div>

      {/* Interactive ball that follows mouse */}
      <div
        className="absolute w-40 h-40 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-20 transition-all duration-300 ease-out pointer-events-none"
        style={{
          transform: `translate(${mousePosition.x - 80}px, ${mousePosition.y - 80}px)`,
        }}
      ></div>

      {/* Floating Icons */}
      <div className="absolute top-20 left-20 hidden lg:block animate-[float_6s_ease-in-out_infinite]">
        <div className="w-16 h-16 bg-white/80 backdrop-blur rounded-2xl shadow-xl flex items-center justify-center rotate-12">
          <Scissors className="w-8 h-8 text-purple-600" />
        </div>
      </div>

      <div className="absolute bottom-20 right-20 hidden lg:block animate-[float_6s_ease-in-out_infinite_2s]">
        <div className="w-16 h-16 bg-white/80 backdrop-blur rounded-2xl shadow-xl flex items-center justify-center -rotate-12">
          <Building2 className="w-8 h-8 text-pink-600" />
        </div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Progress Steps - Desktop */}
        <div className="hidden lg:flex items-center justify-center gap-4 mb-8">
          {[
            { label: "Account Details", key: "account" },
            { label: "Salon Setup", key: "salon" },
            { label: "Select Plan", key: "plan" },
            { label: "Payment", key: "payment" },
          ].map((s, idx, arr) => (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 ${
                  step === s.key ? "text-purple-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    step === s.key
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {idx + 1}
                </div>
                <span className="font-medium">{s.label}</span>
              </div>
              {idx < arr.length - 1 && (
                <div
                  className={`w-16 h-0.5 ${
                    arr.findIndex((x) => x.key === step) > idx
                      ? "bg-gradient-to-r from-purple-600 to-pink-600"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Main Card */}
        <Card className="bg-white/90 backdrop-blur-xl border-2 border-white/50 shadow-2xl relative overflow-hidden">
          {/* Card Decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-pink-200/30 to-purple-200/30 rounded-full blur-3xl -ml-20 -mb-20"></div>

          <CardHeader className="text-center relative">
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
              {step === "account" && "Start Your Journey"}
              {step === "salon" && "Setup Your Salon"}
              {step === "plan" && "Choose Your Plan"}
              {step === "payment" && "Complete Payment"}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {step === "account" &&
                "Create your account to begin managing your salon"}
              {step === "salon" && "Tell us about your salon to get started"}
              {step === "plan" &&
                "Select the plan that fits your business. You can upgrade later."}
              {step === "payment" &&
                "You will be redirected to Monnify secure checkout."}
            </CardDescription>

            {/* Mobile Progress Dots */}
            <div className="lg:hidden flex items-center justify-center gap-2 mt-4">
              {["account", "salon", "plan", "payment"].map((s, idx) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    step === s
                      ? "w-8 bg-gradient-to-r from-purple-600 to-pink-600"
                      : "w-2 bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent className="relative">
            {/* Account Step Form */}
            {step === "account" && (
              <form onSubmit={handleAccountSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 animate-[shake_0.5s_ease-in-out]">
                    <AlertCircle
                      className="text-red-500 mt-0.5 shrink-0"
                      size={18}
                    />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

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
            )}

            {/* Salon Step Form */}
            {step === "salon" && (
              <form onSubmit={handleSalonSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 animate-[shake_0.5s_ease-in-out]">
                    <AlertCircle
                      className="text-red-500 mt-0.5 shrink-0"
                      size={18}
                    />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

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
                      {!slugChecking && slugAvailable === true && (
                        <CheckCircle2 size={24} className="text-green-500" />
                      )}
                      {!slugChecking && slugAvailable === false && (
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
                      State <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="salonState"
                      name="salonState"
                      value={formData.salonState}
                      onChange={handleChange}
                      required
                      className="w-full h-12 px-4 border-2 border-gray-200 focus:border-purple-600 focus:ring-purple-600 rounded-xl transition-all bg-white"
                    >
                      <option value="">Select state</option>
                      {NIGERIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

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

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12 border-2 border-gray-200 hover:border-purple-600 hover:text-purple-600 rounded-xl transition-all"
                    onClick={() => setStep("account")}
                  >
                    <ChevronLeft className="mr-2 w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
                  >
                    Continue to Plan Selection
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* Plan Step Form */}
            {step === "plan" && (
              <div className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
                    <AlertCircle
                      className="text-red-500 mt-0.5 shrink-0"
                      size={18}
                    />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PLANS.map((plan) => (
                    <label
                      key={plan.key}
                      className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        selectedPlan === plan.key
                          ? "border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-purple-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value={plan.key}
                        checked={selectedPlan === plan.key}
                        onChange={() => {
                          setSelectedPlan(plan.key);
                          setError("");
                        }}
                        className="absolute opacity-0"
                      />
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                            selectedPlan === plan.key
                              ? "border-purple-600 bg-purple-600"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedPlan === plan.key && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-lg">
                              {plan.name}
                            </span>
                            <span className="text-purple-600 font-semibold">
                              {plan.price}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {plan.desc}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12 border-2 border-gray-200 hover:border-purple-600 hover:text-purple-600 rounded-xl transition-all"
                    onClick={() => setStep("salon")}
                    disabled={loading}
                  >
                    <ChevronLeft className="mr-2 w-4 h-4" /> Back
                  </Button>

                  <Button
                    type="button"
                    onClick={handlePlanNext}
                    disabled={!selectedPlan || loading}
                    className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : selectedPlan === "FREE" ? (
                      <>
                        Complete Registration
                        <ChevronRight className="ml-2 w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Continue to Payment
                        <ChevronRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Payment Step — Monnify hosted checkout */}
            {step === "payment" && (
              <form onSubmit={handlePaymentSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
                    <AlertCircle
                      className="text-red-500 mt-0.5 shrink-0"
                      size={18}
                    />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-purple-700">
                      {selectedPlanInfo?.name} Plan
                    </p>
                    <p className="text-sm text-purple-500">
                      {selectedPlanInfo?.desc}
                    </p>
                  </div>
                  <span className="text-xl font-bold text-purple-700">
                    {selectedPlanInfo?.price}
                  </span>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
                  Payment is completed on{" "}
                  <strong>Monnify secure checkout</strong>. Click continue to
                  proceed.
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12 border-2 border-gray-200 hover:border-purple-600 hover:text-purple-600 rounded-xl transition-all"
                    onClick={() => setStep("plan")}
                    disabled={loading}
                  >
                    <ChevronLeft className="mr-2 w-4 h-4" /> Back
                  </Button>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Continue to Monnify
                        <ChevronRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6 bg-white/80 backdrop-blur-xl border-2 border-white/50 shadow-xl">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600">No hidden fees</span>
              </div>
              <div className="hidden sm:block w-px h-8 bg-gray-200" />
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600">
                  Secured by Monnify Checkout
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

      {/* Full-page loader */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Processing Payment
              </h3>
              <p className="text-sm text-gray-600">
                Please wait while we redirect you to Monnify secure checkout...
              </p>
            </div>
          </div>
        </div>
      )}

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
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
        @keyframes float-medium {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-30px) translateX(-15px);
          }
        }
        @keyframes float-fast {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-40px) translateX(20px);
          }
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
      `}</style>
    </div>
  );
}
