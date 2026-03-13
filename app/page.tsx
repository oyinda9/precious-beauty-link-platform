"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarCheck,
  Users2,
  Clock,
  BarChart3,
  Bell,
  Smartphone,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star,
  Shield,
  Zap,
  Phone,
  Mail,
  Calendar,
  Scissors,
  UserCircle,
  Settings,
  CreditCard,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  Award,
  HeartHandshake,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [showDemoModal, setShowDemoModal] = useState(false);

  const navigation = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
    { name: "Testimonials", href: "#testimonials" },
  ];

  const features = [
    {
      icon: CalendarCheck,
      title: "Smart Booking Management",
      description:
        "Easily manage all appointments in one place. View, confirm, reschedule, or cancel bookings with a single click.",
      benefits: [
        "Real-time availability updates",
        "Automated scheduling",
        "Prevent double bookings",
      ],
      color: "from-blue-600 to-cyan-600",
      gradient: "bg-gradient-to-br from-blue-50 to-cyan-50",
    },
    {
      icon: Users2,
      title: "Staff & Resource Management",
      description:
        "Assign services to specific staff members, manage work schedules, and track staff performance.",
      benefits: [
        "Staff profiles & specialties",
        "Work hour management",
        "Commission tracking",
      ],
      color: "from-purple-600 to-pink-600",
      gradient: "bg-gradient-to-br from-purple-50 to-pink-50",
    },
    {
      icon: Bell,
      title: "Automated Notifications",
      description:
        "Keep your clients informed with automatic booking confirmations, reminders, and follow-ups.",
      benefits: [
        "SMS & email reminders",
        "Customizable templates",
        "Reduce no-shows by 80%",
      ],
      color: "from-amber-500 to-orange-600",
      gradient: "bg-gradient-to-br from-amber-50 to-orange-50",
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description:
        "Track your salon's performance with detailed reports on revenue, popular services, and customer trends.",
      benefits: [
        "Revenue reports",
        "Service popularity",
        "Customer retention metrics",
      ],
      color: "from-green-600 to-emerald-600",
      gradient: "bg-gradient-to-br from-green-50 to-emerald-50",
    },
    {
      icon: Smartphone,
      title: "Mobile-Friendly Dashboard",
      description:
        "Manage your salon on the go with our fully responsive dashboard that works on any device.",
      benefits: [
        "Access anywhere",
        "Real-time updates",
        "Instant notifications",
      ],
      color: "from-indigo-600 to-blue-600",
      gradient: "bg-gradient-to-br from-indigo-50 to-blue-50",
    },
    {
      icon: CreditCard,
      title: "Easy Payments",
      description:
        "Accept deposits and full payments online. Reduce no-shows and increase your revenue.",
      benefits: ["Secure payments", "Deposit collection", "Automated invoices"],
      color: "from-red-600 to-rose-600",
      gradient: "bg-gradient-to-br from-red-50 to-rose-50",
    },
  ];

  const stats = [
    { value: "10,000+", label: "Appointments Managed", icon: Calendar },
    { value: "500+", label: "Happy Salon Owners", icon: Users2 },
    { value: "98%", label: "Customer Satisfaction", icon: Star },
    { value: "50%", label: "Less No-Shows", icon: TrendingUp },
  ];

  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: 'Owner of "Glamour Studio"',
      content:
        "SalonBook transformed how I run my salon. I used to spend hours on the phone managing bookings. Now everything is automated, and I can focus on what really matters - my clients.",
      rating: 5,
      image: "SM",
      location: "Lagos, Nigeria",
    },
    {
      name: "James Okonkwo",
      role: 'Owner of "Executive Cuts"',
      content:
        "The staff management feature is a game-changer. I can easily track who's working when, and my staff love having their own schedules. No more confusion or missed appointments.",
      rating: 5,
      image: "JO",
      location: "Abuja, Nigeria",
    },
    {
      name: "Amara Eze",
      role: 'Owner of "Divine Spa & Beauty"',
      content:
        "The automated reminders cut my no-shows by more than half. My revenue has increased, and my clients appreciate the reminders. Best decision I made for my business.",
      rating: 5,
      image: "AE",
      location: "Port Harcourt, Nigeria",
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Save 15+ Hours Weekly",
      description:
        "Stop managing bookings manually. Automate scheduling, reminders, and follow-ups.",
    },
    {
      icon: Users2,
      title: "Grow Your Clientele",
      description:
        "Attract new customers and keep them coming back with a professional booking experience.",
    },
    {
      icon: Shield,
      title: "Reduce No-Shows",
      description:
        "Cut missed appointments by up to 80% with automated reminders and deposit options.",
    },
  ];

  const faqs = [
    {
      question: "How does the free trial work?",
      answer: "Start your 14-day free trial with no credit card required. You'll have access to all features to test drive SalonBook for your business.",
    },
    {
      question: "Can I import my existing client data?",
      answer: "Yes! We provide easy tools to import your client list and appointment history from spreadsheets or other booking systems.",
    },
    {
      question: "What payment methods do you support?",
      answer: "We support all major payment methods including cards, bank transfers, and mobile money. You can collect deposits or full payments online.",
    },
    {
      question: "Do you offer training for my staff?",
      answer: "Absolutely! We provide onboarding support, video tutorials, and documentation to get your entire team up to speed quickly.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 sticky top-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg lg:text-xl shadow-lg group-hover:scale-105 transition-transform">
                SB
              </div>
              <span className="font-bold text-xl lg:text-2xl text-slate-900">
                Salon<span className="text-purple-600">Book</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors"
              >
                Sign In
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/register-salon-owner">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mb-6 animate-fade-in">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">
                  Trusted by 500+ Salon Owners
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                The Complete Booking System for{" "}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Salon Owners
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-slate-600 mb-8 leading-relaxed">
                Stop juggling phone calls, texts, and paper calendars. Manage
                all your appointments, staff, and clients in one powerful
                platform. Save time, reduce no-shows, and grow your business.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/salon/register">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto px-8 group"
                  >
                    Start 14-Day Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 hover:bg-slate-50 w-full sm:w-auto px-8"
                  onClick={() => setShowDemoModal(true)}
                >
                  Schedule Demo
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6">
                {[
                  "No credit card required",
                  "14-day free trial",
                  "24/7 support",
                ].map((badge) => (
                  <div key={badge} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-slate-600">{badge}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="relative lg:block">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform hover:scale-105 transition-transform duration-500">
                <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-slate-600 ml-2">
                    Salon Dashboard
                  </span>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">
                        Today's Bookings
                      </p>
                      <p className="text-2xl font-bold text-slate-900">24</p>
                    </div>
                    <div className="bg-pink-50 p-4 rounded-lg">
                      <p className="text-sm text-pink-600 font-medium">
                        Revenue
                      </p>
                      <p className="text-2xl font-bold text-slate-900">₦124k</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Staff</p>
                      <p className="text-2xl font-bold text-slate-900">8</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full"></div>
                          <div>
                            <p className="font-medium text-sm">
                              Client Name {i}
                            </p>
                            <p className="text-xs text-slate-500">
                              Haircut • 10:30 AM
                            </p>
                          </div>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Confirmed
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full opacity-10 animate-pulse"></div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mt-16 lg:mt-24">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center group">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-slate-900">
                    {stat.value}
                  </div>
                  <div className="text-xs lg:text-sm text-slate-600">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Why Salon Owners Love SalonBook
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Join hundreds of salon owners who've transformed their business
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card
                  key={benefit.title}
                  className="border-2 border-slate-100 hover:border-purple-200 transition-all hover:shadow-lg group"
                >
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-16 lg:py-24 bg-gradient-to-b from-slate-50 to-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Run Your Salon
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Powerful tools designed specifically for salon owners to
              streamline operations and boost revenue.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="group hover:shadow-xl transition-all border-2 hover:border-transparent relative overflow-hidden"
                >
                  <div
                    className={`absolute inset-0 ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
                  />
                  <CardHeader className="relative">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base mt-2">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit) => (
                        <li
                          key={benefit}
                          className="flex items-start gap-2 text-sm"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-600">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Three simple steps to transform how you manage your salon
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: "1",
                title: "Create Your Account",
                description:
                  "Sign up for free and set up your salon profile. Add your services, staff, and business hours.",
                icon: UserCircle,
              },
              {
                step: "2",
                title: "Customize Your Settings",
                description:
                  "Set your booking rules, staff schedules, and notification preferences. Everything tailored to your needs.",
                icon: Settings,
              },
              {
                step: "3",
                title: "Start Accepting Bookings",
                description:
                  "Share your booking link with clients. Watch as appointments come in automatically, 24/7.",
                icon: CalendarCheck,
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="text-center relative group">
                  {index < 2 && (
                    <div className="absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-purple-200 to-pink-200 hidden md:block"></div>
                  )}
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-slate-600">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 lg:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Trusted by Salon Owners Like You
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              See what other salon owners are saying about SalonBook
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.name}
                className="hover:shadow-xl transition-all group"
              >
                <CardContent className="p-6 lg:p-8">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-slate-600 mb-6 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                      {testimonial.image}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-slate-500">
                        {testimonial.role}
                      </p>
                      <p className="text-xs text-slate-400">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Choose the perfect plan for your salon. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Free Plan */}
            <Card className="border-2 border-slate-200 hover:border-purple-200 transition-all group">
              <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50 rounded-t-lg">
                <CardTitle className="text-xl">Free Trial</CardTitle>
                <CardDescription className="text-slate-500">
                  Try before you buy
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <span className="text-4xl font-bold text-slate-900">₦0</span>
                  <span className="text-slate-500 text-base">/14 days</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Up to 2 staff members</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>5 bookings per month</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Basic dashboard</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-400">
                    <X className="h-4 w-4" />
                    <span className="line-through">SMS notifications</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full group-hover:border-purple-600" asChild>
                  <Link href="/register-salon-owner">Start Free Trial</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Basic Plan */}
            <Card className="border-2 border-purple-200 hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-purple-600 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                Popular
              </div>
              <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-t-lg">
                <CardTitle className="text-xl">Basic</CardTitle>
                <CardDescription className="text-slate-500">
                  For small teams
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <span className="text-4xl font-bold text-slate-900">₦15k</span>
                  <span className="text-slate-500 text-base">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Up to 5 staff members</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Unlimited bookings</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>WhatsApp notifications</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-400">
                    <X className="h-4 w-4" />
                    <span className="line-through">SMS notifications</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white" asChild>
                  <Link href="/register-salon-owner">Choose Basic</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Standard Plan */}
            <Card className="border-2 border-green-200 hover:shadow-xl transition-all group">
              <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-t-lg">
                <CardTitle className="text-xl">Standard</CardTitle>
                <CardDescription className="text-slate-500">
                  For growing salons
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <span className="text-4xl font-bold text-slate-900">₦25k</span>
                  <span className="text-slate-500 text-base">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Up to 15 staff members</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Unlimited bookings</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>WhatsApp notifications</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>SMS notifications</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white" asChild>
                  <Link href="/register-salon-owner">Choose Standard</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 border-yellow-200 hover:shadow-xl transition-all group">
              <CardHeader className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-t-lg">
                <CardTitle className="text-xl">Premium</CardTitle>
                <CardDescription className="text-slate-500">
                  For large teams
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <span className="text-4xl font-bold text-slate-900">₦50k</span>
                  <span className="text-slate-500 text-base">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Unlimited staff members</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Unlimited bookings</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>All notifications unlimited</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Dedicated account manager</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Custom integrations</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white" asChild>
                  <Link href="/register-salon-owner">Choose Premium</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-slate-600">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="grid gap-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                  <p className="text-slate-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-0 shadow-2xl overflow-hidden">
            <CardContent className="p-8 lg:p-16 text-center relative">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32 animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-32 translate-y-32 animate-pulse"></div>

              <div className="relative">
                <h3 className="text-2xl lg:text-4xl font-bold text-white mb-4">
                  Ready to Transform Your Salon Business?
                </h3>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  Join hundreds of salon owners who are saving time, reducing
                  no-shows, and growing their revenue with SalonBook.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/salon/register">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="bg-white text-purple-600 hover:bg-slate-100 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto px-8 group"
                    >
                      Start 14-Day Free Trial
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-pink-600 hover:bg-white/10 w-full sm:w-auto px-8"
                    onClick={() => setShowDemoModal(true)}
                  >
                    Schedule a Demo
                  </Button>
                </div>
                <p className="text-white/80 text-sm mt-6">
                  No credit card required • 14-day free trial • Cancel anytime
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-center text-slate-900 mb-2">
                Schedule a Demo
              </h3>
              
              <p className="text-center text-slate-600 mb-6">
                Choose how you'd like to connect with us:
              </p>

              <div className="space-y-3">
                <a
                  href="https://wa.me/2348132828531?text=Hi%20I'd%20like%20to%20schedule%20a%20demo%20for%20SalonBook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">WhatsApp</p>
                      <p className="text-sm text-slate-600">Chat with us instantly</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href="tel:+2348132828531"
                  className="flex items-center justify-between w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">Phone Call</p>
                      <p className="text-sm text-slate-600">+234 813 282 8531</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              <p className="text-xs text-center text-slate-500 mt-6">
                We'll respond within minutes during business hours
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Simple Footer with just copyright */}
      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© 2025 Prevo Tech. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
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
      `}</style>
    </div>
  );
}