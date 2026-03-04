"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import {
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Scissors,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed");
        return;
      }

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }

      // Redirect based on user role
      if (data.user.role === "SUPER_ADMIN") {
        router.push("/admin/dashboard");
      } else if (
        data.user.role === "SALON_ADMIN" ||
        data.user.role === "SALON_OWNER"
      ) {
        router.push("/salon-admin/dashboard");
      } else if (data.user.role === "SALON_STAFF") {
        router.push("/staff/dashboard");
      } else {
        router.push("/bookings");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 hidden lg:block">
        <div className="relative">
          <div className="w-16 h-16 bg-white/80 backdrop-blur rounded-2xl shadow-xl flex items-center justify-center rotate-12">
            <Scissors className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-20 right-20 hidden lg:block">
        <div className="relative">
          <div className="w-16 h-16 bg-white/80 backdrop-blur rounded-2xl shadow-xl flex items-center justify-center -rotate-12">
            <Sparkles className="w-8 h-8 text-pink-600" />
          </div>
        </div>
      </div>

      {/* Main Card */}
      <Card className="w-full max-w-md relative bg-white/80 backdrop-blur-xl border-2 border-white/50 shadow-2xl">
        {/* Gradient Border Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-10 -z-10 blur-xl"></div>

        <CardHeader className="text-center relative">
          {/* Logo with Animation */}
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl transform group-hover:scale-105 transition-transform">
                SB
              </div>
            </div>
          </div>

          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Sign in to continue your beauty journey
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
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

            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
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

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-purple-600 hover:text-purple-700 hover:underline transition-all"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 rounded-xl shadow-lg hover:shadow-xl transition-all text-base font-semibold relative overflow-hidden group"
              disabled={false}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white/80 text-gray-500">
                New to SalonBook?
              </span>
            </div>
          </div>

          <Link href="/register-salon-owner">
            <Button
              variant="outline"
              className="w-full h-12 border-2 hover:bg-purple-50 hover:border-purple-600 hover:text-purple-600 rounded-xl transition-all font-medium"
            >
              Create an Account
            </Button>
          </Link>

          {/* Demo Credentials */}
          <div className="mt-6 p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
            <p className="text-xs font-semibold text-purple-700 mb-3 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Demo Credentials
            </p>
            <div className="space-y-2">
              {[
                {
                  role: "Salon Admin",
                  email: "admin@salon.com",
                  password: "password123",
                },
                {
                  role: "Super Admin",
                  email: "superadmin@salon.com",
                  password: "password123",
                },
                {
                  role: "Client",
                  email: "client@salon.com",
                  password: "password123",
                },
              ].map((demo, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-3 gap-2 text-xs p-2 bg-white/50 rounded-lg hover:bg-white/80 transition-colors cursor-pointer group"
                  onClick={() => {
                    setFormData({ email: demo.email, password: demo.password });
                    setError("");
                  }}
                >
                  <span className="font-medium text-purple-600">
                    {demo.role}:
                  </span>
                  <span className="text-gray-600 col-span-2 font-mono text-[10px] sm:text-xs truncate">
                    {demo.email} / {demo.password}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-3 text-center">
              Click on any demo account to auto-fill credentials
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
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
