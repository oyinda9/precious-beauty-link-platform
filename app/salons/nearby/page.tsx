"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Salon = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  phone: string | null;
};

type NearbyResponse = {
  city?: string;
  matchedAreas?: string[];
  salons?: Salon[];
  error?: string;
};

type AllSalonsResponse = {
  salons?: Salon[];
  error?: string;
};

export default function NearbySalonsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [city, setCity] = useState("");
  const [detectedCity, setDetectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [matchedAreas, setMatchedAreas] = useState<string[]>([]);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [allSalons, setAllSalons] = useState<Salon[]>([]);
  const [loadingAllSalons, setLoadingAllSalons] = useState(false);
  const [allSalonsError, setAllSalonsError] = useState("");

  useEffect(() => {
    const fetchAllSalons = async () => {
      setLoadingAllSalons(true);
      setAllSalonsError("");

      try {
        const res = await fetch("/api/salons");
        const data: AllSalonsResponse | Salon[] = await res.json();

        if (!res.ok) {
          throw new Error(
            (data as AllSalonsResponse)?.error || "Failed to load all salons",
          );
        }

        const parsed = Array.isArray(data)
          ? data
          : Array.isArray((data as AllSalonsResponse)?.salons)
            ? (data as AllSalonsResponse).salons!
            : [];

        setAllSalons(parsed);
      } catch (err: any) {
        setAllSalonsError(err?.message || "Failed to load all salons");
        setAllSalons([]);
      } finally {
        setLoadingAllSalons(false);
      }
    };

    fetchAllSalons();
  }, []);

  const applyResponse = (data: NearbyResponse, fallbackCity = "") => {
    const areas = Array.isArray(data?.matchedAreas) ? data.matchedAreas : [];
    const resolvedCity = data?.city || fallbackCity;

    setDetectedCity(resolvedCity);
    setMatchedAreas(areas);
    setSalons(data?.salons || []);

    if (selectedArea) return;

    if (resolvedCity) {
      setSelectedArea(resolvedCity);
      setCity(resolvedCity);
    }
  };

  const searchByCity = async (value: string) => {
    const area = value.trim();
    if (!area) return;

    setLoading(true);
    setError("");
    setSelectedArea(area);

    try {
      const res = await fetch(
        `/api/salons/nearby?city=${encodeURIComponent(area)}`,
      );
      const data: NearbyResponse = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load salons");
      }

      applyResponse(data, area);
    } catch (err: any) {
      setError(err?.message || "Failed to load salons");
      setSalons([]);
    } finally {
      setLoading(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported on this device");
      return;
    }

    setLoading(true);
    setError("");
    setMatchedAreas([]);
    setSelectedArea("");
    setSalons([]);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const res = await fetch(`/api/salons/nearby?lat=${lat}&lng=${lng}`);
          const data: NearbyResponse = await res.json();

          if (!res.ok) {
            throw new Error(data?.error || "Failed to load salons");
          }

          const areas = Array.isArray(data?.matchedAreas)
            ? data.matchedAreas
            : [];
          const firstArea = data?.city || areas[0] || "";

          setDetectedCity(firstArea);
          setMatchedAreas(areas);
          setCity(firstArea);
          setSelectedArea(firstArea);
          setSalons(data?.salons || []);
        } catch (err: any) {
          setError(err?.message || "Failed to load salons");
          setSalons([]);
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        setLoading(false);

        if (geoError.code === 1) {
          setError("Location permission was denied");
          return;
        }

        if (geoError.code === 2) {
          setError("Unable to detect your location");
          return;
        }

        if (geoError.code === 3) {
          setError("Location request timed out");
          return;
        }

        setError("Failed to get your location");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-purple-600 hover:border-purple-300 transition-all shadow-sm hover:shadow group"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl mb-6 shadow-xl transform rotate-3 hover:rotate-0 transition-all duration-500">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 mb-4">
            Find Your Perfect Salon
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover and book appointments at the best-rated salons in your area
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Search & Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search by Location
              </h2>
              
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter city or area"
                    className="w-full h-12 pl-12 pr-4 text-gray-700 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                    onKeyDown={(e) => e.key === "Enter" && searchByCity(city)}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => searchByCity(city)}
                    disabled={loading || !city.trim()}
                    className="flex-1 px-4 h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Search</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={useMyLocation}
                    disabled={loading}
                    className="px-4 h-12 bg-white border-2 border-purple-600 text-purple-600 font-medium rounded-xl hover:bg-purple-50 hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    title="Use my current location"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Detected Area Badge */}
              {detectedCity && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl animate-[fadeIn_0.5s_ease-out]">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-sm text-green-700">
                      Current location: <span className="font-semibold">{detectedCity}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Area Selection Chips */}
            {matchedAreas.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm animate-[fadeIn_0.5s_ease-out]">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Popular areas in {detectedCity}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {matchedAreas.map((area) => {
                    const active = selectedArea === area;
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => searchByCity(area)}
                        disabled={loading}
                        className={`px-4 py-2 text-sm font-medium rounded-full border-2 transition-all ${
                          active
                            ? "bg-purple-600 text-white border-purple-600 shadow-md"
                            : "bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600 hover:shadow-sm"
                        } disabled:opacity-50`}
                      >
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-[shake_0.5s_ease-in-out]">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Salon Results */}
          <div className="lg:col-span-2">
            {/* Results Header */}
            {selectedArea && (
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Salons in <span className="text-purple-600">{selectedArea}</span>
                  {salons.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({salons.length} {salons.length === 1 ? 'salon' : 'salons'})
                    </span>
                  )}
                </h2>
                {salons.length > 0 && (
                  <span className="text-sm text-gray-500">Sorted by relevance</span>
                )}
              </div>
            )}

            {/* Salon Grid */}
            <div className="space-y-4">
              {salons.map((salon, index) => (
                <div
                  key={salon.id}
                  className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-1 animate-[fadeInUp_0.6s_ease-out_forwards] opacity-0"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
                            {salon.name}
                          </h3>
                          
                          <div className="space-y-2">
                            {salon.address && (
                              <p className="text-sm text-gray-600 flex items-start gap-2">
                                <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{salon.address}</span>
                              </p>
                            )}

                            {salon.city && (
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <span className="w-4 h-4 flex-shrink-0" />
                                <span className="inline-flex items-center px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                  {salon.city}
                                </span>
                              </p>
                            )}

                            {salon.phone && (
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <a href={`tel:${salon.phone}`} className="hover:text-purple-600 transition-colors">
                                  {salon.phone}
                                </a>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 md:ml-4">
                      <Link
                        href={`/salons/${salon.slug}`}
                        className="px-5 py-2.5 bg-purple-50 text-purple-600 font-medium rounded-lg hover:bg-purple-100 transition-colors text-sm text-center"
                      >
                        View Details
                      </Link>
                      <a
                        href={salon.phone ? `tel:${salon.phone}` : `/salons/${salon.slug}`}
                        className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg text-center"
                      >
                        Book Now
                      </a>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading Skeleton */}
              {loading && (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                            <div className="flex-1 space-y-3">
                              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
                          <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* No Results Found */}
              {!loading && !error && selectedArea && salons.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-amber-800 mb-2">
                    No salons found in {selectedArea}
                  </h3>
                  <p className="text-amber-600">
                    Try selecting another area or use the location button to find salons near you.
                  </p>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && !selectedArea && salons.length === 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Start Your Search
                  </h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    Enter a location or use your current location to discover salons near you.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* All Registered Salons Section */}
        <section className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              All Registered Salons
            </h2>
            <p className="text-gray-600">
              Browse our complete directory of professional salons
            </p>
          </div>

          {loadingAllSalons && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600"></div>
              <p className="mt-2 text-sm text-gray-500">Loading salons...</p>
            </div>
          )}

          {!loadingAllSalons && allSalonsError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center max-w-md mx-auto">
              <p className="text-sm text-red-600">{allSalonsError}</p>
            </div>
          )}

          {!loadingAllSalons && !allSalonsError && allSalons.length === 0 && (
            <p className="text-center text-gray-500 py-8">No registered salons yet.</p>
          )}

          {!loadingAllSalons && !allSalonsError && allSalons.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {allSalons.map((salon) => (
                <Link
                  key={salon.id}
                  href={`/salons/${salon.slug}`}
                  className="group block rounded-xl border border-gray-200 bg-white p-5 hover:border-purple-300 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {salon.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {salon.address || "No address provided"}
                        {salon.city && `, ${salon.city}`}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}