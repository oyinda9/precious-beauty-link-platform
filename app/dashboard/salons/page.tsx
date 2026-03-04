"use client";

import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Edit2,
  MapPin,
  Phone,
  Mail,
  Search,
  Filter,
  Star,
  Calendar,
  Users,
  Building2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Salon {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  description?: string;
  slug?: string;
  services?: any[];
  _count?: {
    bookings: number;
    reviews: number;
  };
}

export default function SalonsPage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [filteredSalons, setFilteredSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [cities, setCities] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSalons = async () => {
    try {
      setError(null);
      const res = await fetch("/api/salons?limit=100");

      if (!res.ok) {
        throw new Error("Failed to fetch salons");
      }

      const data = await res.json();
      const salonsData = data.salons || [];
      setSalons(salonsData);

      // Extract unique cities for filter
      const uniqueCities = [...new Set(salonsData.map((s: Salon) => s.city))];
      setCities(uniqueCities as string[]);
    } catch (error) {
      console.error("Failed to fetch salons:", error);
      setError("Failed to load salons. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSalons();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...salons];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (salon) =>
          salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          salon.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          salon.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          salon.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((salon) =>
        statusFilter === "active" ? salon.isActive : !salon.isActive,
      );
    }

    // City filter
    if (cityFilter !== "all") {
      filtered = filtered.filter((salon) => salon.city === cityFilter);
    }

    setFilteredSalons(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, cityFilter, salons]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSalons();
  };

  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this salon? This action cannot be undone.",
      )
    ) {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`/api/salons/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          setSalons(salons.filter((s) => s.id !== id));
        } else {
          throw new Error("Failed to delete salon");
        }
      } catch (error) {
        console.error("Failed to delete salon:", error);
        toast({
          title: "Error",
          description: "Failed to delete salon. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSalons.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSalons.length / itemsPerPage);

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-500/20 text-green-300 border-green-500/50">
        <CheckCircle size={12} className="mr-1" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-red-500/20 text-red-300 border-red-500/50">
        <XCircle size={12} className="mr-1" />
        Inactive
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-500 animate-pulse" />
            </div>
          </div>
          <p className="text-purple-300">Loading salons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Salon Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all salons on the platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={false}
            className="border-purple-500/30 text-purple-200 hover:bg-purple-600/20"
          >
            <RefreshCw
              size={16}
              className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Link href="/dashboard/salons/new">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
              disabled={false}
              Add Salon
            </Button>
          </Link>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-600/20 to-blue-400/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Total Salons</p>
                <p className="text-2xl font-bold text-white">{salons.length}</p>
              </div>
              <Building2 className="text-blue-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-600/20 to-green-400/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Active Salons</p>
                <p className="text-2xl font-bold text-white">
                  {salons.filter((s) => s.isActive).length}
                </p>
              </div>
              <CheckCircle className="text-green-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600/20 to-purple-400/10 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300">Total Cities</p>
                <p className="text-2xl font-bold text-white">{cities.length}</p>
              </div>
              <MapPin className="text-purple-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-600/20 to-orange-400/10 border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-300">Avg Rating</p>
                <p className="text-2xl font-bold text-white">
                  {(
                    salons.reduce((acc, s) => acc + s.rating, 0) /
                      salons.length || 0
                  ).toFixed(1)}
                </p>
              </div>
              <Star className="text-orange-400" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Filters */}
      <Card className="bg-slate-800/40 border-purple-500/30">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400"
                size={18}
              />
              <Input
                placeholder="Search salons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>

            {/* City Filter */}
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                <SelectValue placeholder="Filter by city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Results count */}
            <div className="flex items-center justify-end text-purple-300">
              <Filter size={16} className="mr-2" />
              <span>{filteredSalons.length} salons found</span>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-400" size={20} />
          <p className="text-red-300">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSalons}
            className="ml-auto border-red-500/30 text-red-300 hover:bg-red-500/20"
          >
            Try Again
          </Button>
        </div>
      )}
      disabled={false}
      {/* Salons Grid */}
      {filteredSalons.length === 0 ? (
        <Card className="bg-slate-800/40 border-purple-500/30">
          <CardContent className="py-12 text-center">
            <Building2 className="w-16 h-16 text-purple-500/50 mx-auto mb-4" />
            <p className="text-purple-300 text-lg mb-2">No salons found</p>
            <p className="text-purple-400 text-sm mb-6">
              {searchTerm || statusFilter !== "all" || cityFilter !== "all"
                ? "Try adjusting your filters"
                : "Get started by adding your first salon"}
            </p>
            {searchTerm || statusFilter !== "all" || cityFilter !== "all" ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setCityFilter("all");
                }}
                className="border-purple-500/30 text-purple-200"
              >
                Clear Filters
              </Button>
            ) : (
              <Link href="/dashboard/salons/new">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <Plus size={18} className="mr-2" />
                  Add Your First Salon
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map((salon) => (
              <Card
                key={salon.id}
                className="bg-slate-800/40 border-purple-500/30 hover:border-purple-500/60 transition-all hover:shadow-xl group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg group-hover:text-purple-400 transition-colors">
                        {salon.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm text-white ml-1">
                            {salon.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-purple-300 text-sm">
                          ({salon.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(salon.isActive)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-purple-200">
                      <MapPin
                        size={14}
                        className="text-purple-400 flex-shrink-0"
                      />
                      <span className="truncate">
                        {salon.address}, {salon.city}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-200">
                      <Phone
                        size={14}
                        className="text-purple-400 flex-shrink-0"
                      />
                      <span>{salon.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-200">
                      <Mail
                        size={14}
                        className="text-purple-400 flex-shrink-0"
                      />
                      <span className="truncate">{salon.email}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                      <Calendar
                        size={14}
                        className="mx-auto text-purple-400 mb-1"
                      />
                      <p className="text-xs text-purple-300">Bookings</p>
                      <p className="text-sm font-bold text-white">
                        {salon._count?.bookings || 0}
                      </p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                      <Users
                        size={14}
                        className="mx-auto text-purple-400 mb-1"
                      />
                      <p className="text-xs text-purple-300">Services</p>
                      <p className="text-sm font-bold text-white">
                        {salon.services?.length || 0}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link
                      href={`/dashboard/salons/${salon.id}`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-purple-500/30 text-purple-200 hover:bg-purple-600/20"
                      >
                        <Eye size={14} className="mr-2" />
                        View
                      </Button>
                    </Link>
                    <Link
                      href={`/dashboard/salons/${salon.id}/edit`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-purple-500/30 text-purple-200 hover:bg-purple-600/20"
                      >
                        <Edit2 size={14} className="mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(salon.id)}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={false}
                className="border-purple-500/30 text-purple-200"
              >
                <ChevronLeft size={16} />
              </Button>

              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className={
                    currentPage === i + 1
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "border-purple-500/30 text-purple-200"
                  }
                >
                  {i + 1}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={false}
                className="border-purple-500/30 text-purple-200"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
