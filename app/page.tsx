'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  CreditCard
} from 'lucide-react';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  const features = [
    {
      icon: CalendarCheck,
      title: 'Smart Booking Management',
      description: 'Easily manage all appointments in one place. View, confirm, reschedule, or cancel bookings with a single click.',
      benefits: ['Real-time availability updates', 'Automated scheduling', 'Prevent double bookings'],
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: Users2,
      title: 'Staff & Resource Management',
      description: 'Assign services to specific staff members, manage work schedules, and track staff performance.',
      benefits: ['Staff profiles & specialties', 'Work hour management', 'Commission tracking'],
      color: 'from-purple-600 to-pink-600'
    },
    {
      icon: Bell,
      title: 'Automated Notifications',
      description: 'Keep your clients informed with automatic booking confirmations, reminders, and follow-ups.',
      benefits: ['SMS & email reminders', 'Customizable templates', 'Reduce no-shows by 80%'],
      color: 'from-amber-500 to-orange-600'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Track your salon\'s performance with detailed reports on revenue, popular services, and customer trends.',
      benefits: ['Revenue reports', 'Service popularity', 'Customer retention metrics'],
      color: 'from-green-600 to-emerald-600'
    },
    {
      icon: Smartphone,
      title: 'Mobile-Friendly Dashboard',
      description: 'Manage your salon on the go with our fully responsive dashboard that works on any device.',
      benefits: ['Access anywhere', 'Real-time updates', 'Instant notifications'],
      color: 'from-indigo-600 to-blue-600'
    },
    {
      icon: CreditCard,
      title: 'Easy Payments',
      description: 'Accept deposits and full payments online. Reduce no-shows and increase your revenue.',
      benefits: ['Secure payments', 'Deposit collection', 'Automated invoices'],
      color: 'from-red-600 to-rose-600'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Appointments Managed', icon: Calendar },
    { value: '500+', label: 'Happy Salon Owners', icon: Users2 },
    { value: '98%', label: 'Customer Satisfaction', icon: Star },
    { value: '50%', label: 'Less No-Shows', icon: Zap },
  ];

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Owner of "Glamour Studio"',
      content: 'SalonBook transformed how I run my salon. I used to spend hours on the phone managing bookings. Now everything is automated, and I can focus on what really matters - my clients.',
      rating: 5,
      image: 'SM',
      location: 'Lagos, Nigeria'
    },
    {
      name: 'James Okonkwo',
      role: 'Owner of "Executive Cuts"',
      content: 'The staff management feature is a game-changer. I can easily track who\'s working when, and my staff love having their own schedules. No more confusion or missed appointments.',
      rating: 5,
      image: 'JO',
      location: 'Abuja, Nigeria'
    },
    {
      name: 'Amara Eze',
      role: 'Owner of "Divine Spa & Beauty"',
      content: 'The automated reminders cut my no-shows by more than half. My revenue has increased, and my clients appreciate the reminders. Best decision I made for my business.',
      rating: 5,
      image: 'AE',
      location: 'Port Harcourt, Nigeria'
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: 'Save 15+ Hours Weekly',
      description: 'Stop managing bookings manually. Automate scheduling, reminders, and follow-ups.'
    },
    {
      icon: Users2,
      title: 'Grow Your Clientele',
      description: 'Attract new customers and keep them coming back with a professional booking experience.'
    },
    {
      icon: Shield,
      title: 'Reduce No-Shows',
      description: 'Cut missed appointments by up to 80% with automated reminders and deposit options.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 sticky top-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg lg:text-xl shadow-lg">
                SB
              </div>
              <span className="font-bold text-xl lg:text-2xl text-slate-900 hidden sm:inline">
                Salon<span className="text-purple-600">Book</span>
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium ml-2 hidden lg:inline">
                For Salon Owners
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors">
                How It Works
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors">
                Pricing
              </Link>
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors">
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

      {/* Hero Section - Focused on Salon Owners */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mb-6">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">Trusted by 500+ Salon Owners</span>
              </div>

              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                The Complete Booking System for{' '}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Salon Owners
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-slate-600 mb-8">
                Stop juggling phone calls, texts, and paper calendars. Manage all your appointments, staff, and clients in one powerful platform. Save time, reduce no-shows, and grow your business.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/salon/register">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto px-8">
                    Start 14-Day Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button size="lg" variant="outline" className="border-2 hover:bg-slate-50 w-full sm:w-auto px-8">
                    Watch Demo
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4">
                {['No credit card required', '14-day free trial', '24/7 support'].map((badge, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-slate-600">{badge}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="relative lg:block hidden">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-slate-600 ml-2">Salon Dashboard</span>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">Today's Bookings</p>
                      <p className="text-2xl font-bold text-slate-900">24</p>
                    </div>
                    <div className="bg-pink-50 p-4 rounded-lg">
                      <p className="text-sm text-pink-600 font-medium">Revenue</p>
                      <p className="text-2xl font-bold text-slate-900">₦124k</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Staff</p>
                      <p className="text-2xl font-bold text-slate-900">8</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[1,2,3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-200 rounded-full"></div>
                          <div>
                            <p className="font-medium text-sm">Client Name {i}</p>
                            <p className="text-xs text-slate-500">Haircut • 10:30 AM</p>
                          </div>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Confirmed</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full opacity-10"></div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mt-16 lg:mt-24">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-3">
                    <Icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-xs lg:text-sm text-slate-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <Card key={idx} className="border-2 border-slate-100 hover:border-purple-200 transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-4">
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
      <section id="features" className="py-16 lg:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Run Your Salon
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Powerful tools designed specifically for salon owners to streamline operations and boost revenue.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="group hover:shadow-xl transition-all border-2 hover:border-transparent relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base mt-2">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
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
                step: '1',
                title: 'Create Your Account',
                description: 'Sign up for free and set up your salon profile. Add your services, staff, and business hours.',
                icon: UserCircle
              },
              {
                step: '2',
                title: 'Customize Your Settings',
                description: 'Set your booking rules, staff schedules, and notification preferences. Everything tailored to your needs.',
                icon: Settings
              },
              {
                step: '3',
                title: 'Start Accepting Bookings',
                description: 'Share your booking link with clients. Watch as appointments come in automatically, 24/7.',
                icon: CalendarCheck
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="text-center relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-200 to-transparent hidden md:block" style={{ left: '75%' }} />
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
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
      <section className="py-16 lg:py-24 bg-gradient-to-b from-slate-50 to-white">
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
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="hover:shadow-xl transition-all">
                <CardContent className="p-6 lg:p-8">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.image}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-slate-500">{testimonial.role}</p>
                      <p className="text-xs text-slate-400">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section id="pricing" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                No hidden fees. No complicated tiers. Just one simple plan that includes everything you need to run your salon.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited bookings',
                  'Staff management',
                  'Automated reminders',
                  'Analytics & reports',
                  '24/7 support',
                  'Free updates'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/salon/register">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
                  Start Your Free Trial
                </Button>
              </Link>
              <p className="text-sm text-slate-500 mt-4">
                No credit card required • 14-day free trial
              </p>
            </div>
            <div className="relative">
              <Card className="border-2 border-purple-200 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                  <CardTitle className="text-2xl">Professional Plan</CardTitle>
                  <CardDescription className="text-white/90">Everything you need to grow</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <span className="text-5xl font-bold text-slate-900">₦25,000</span>
                    <span className="text-slate-500">/month</span>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 mb-4">
                    Get Started
                  </Button>
                  <p className="text-xs text-center text-slate-500">
                    Save 20% with annual billing
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-0 shadow-2xl overflow-hidden">
            <CardContent className="p-8 lg:p-16 text-center relative">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-32 translate-y-32"></div>
              
              <div className="relative">
                <h3 className="text-2xl lg:text-4xl font-bold text-white mb-4">
                  Ready to Transform Your Salon Business?
                </h3>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  Join hundreds of salon owners who are saving time, reducing no-shows, and growing their revenue with SalonBook.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/salon/register">
                    <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-slate-100 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto px-8">
                      Start 14-Day Free Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto px-8">
                      Schedule a Demo
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                  SB
                </div>
                <span className="font-bold text-lg text-white">SalonBook</span>
              </div>
              <p className="text-sm leading-relaxed">
                The complete booking and management platform for salon owners.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/api-docs" className="hover:text-white transition-colors">API Docs</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">System Status</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              © 2024 SalonBook. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
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
      `}</style>
    </div>
  );
}