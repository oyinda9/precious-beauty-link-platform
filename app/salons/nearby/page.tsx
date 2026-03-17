"use client";

import Link from "next/link";
import { useState } from "react";

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

export default function NearbySalonsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [city, setCity] = useState("");
  const [detectedCity, setDetectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [matchedAreas, setMatchedAreas] = useState<string[]>([]);
  const [salons, setSalons] = useState<Salon[]>([]);

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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl mb-6 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <svg
              className="w-10 h-10 text-purple-600"
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
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-800 mb-3">
            Find Salons Near You
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover top-rated salons in your area and book your next
            appointment with ease
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter your city or area"
                className="w-full h-14 pl-12 pr-4 text-gray-700 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                onKeyDown={(e) => e.key === "Enter" && searchByCity(city)}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => searchByCity(city)}
                disabled={loading || !city.trim()}
                className="flex-1 md:flex-none px-8 h-14 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-lg flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span className="hidden md:inline">Search</span>
              </button>
              <button
                type="button"
                onClick={useMyLocation}
                disabled={loading}
                className="flex-1 md:flex-none px-8 h-14 bg-white border-2 border-purple-600 text-purple-600 font-semibold rounded-xl hover:bg-purple-50 hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="hidden md:inline">Use location</span>
              </button>
            </div>
          </div>
        </div>

        {/* Detected Area Badge */}
        {detectedCity && (
          <div className="mb-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 shadow-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm text-green-700 font-medium">
                Detected area: <span className="font-bold">{detectedCity}</span>
              </span>
            </div>
          </div>
        )}

        {/* Area Selection Chips */}
        {matchedAreas.length > 0 && (
          <div className="mb-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-[fadeIn_0.5s_ease-out]">
            <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Select your specific area
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
                    className={`px-5 py-2.5 text-sm font-medium rounded-full border-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${
                      active
                        ? "bg-purple-600 text-white border-purple-600 shadow-md"
                        : "bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600 hover:shadow-sm"
                    } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
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
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 animate-[shake_0.5s_ease-in-out]">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* No Results Found */}
        {!loading && !error && selectedArea && salons.length === 0 && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-8 text-center animate-[fadeIn_0.5s_ease-out]">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-amber-800 mb-2">
              No salons found in{" "}
              <span className="font-bold">{selectedArea}</span>
            </h3>
            <p className="text-amber-600">
              Try selecting another area above or expand your search to nearby
              locations.
            </p>
          </div>
        )}

        {/* Salon Grid */}
        <div className="grid gap-4 md:gap-6">
          {salons.map((salon, index) => (
            <div
              key={salon.id}
              className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-1 animate-[fadeInUp_0.6s_ease-out_forwards] opacity-0"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {salon.name}
                    </h2>
                  </div>

                  <div className="space-y-2 ml-13">
                    {salon.address && (
                      <p className="text-sm text-gray-600 flex items-start gap-2">
                        <svg
                          className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>{salon.address}</span>
                      </p>
                    )}

                    {salon.city && (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-4 h-4 flex-shrink-0" />
                        <span className="inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          {salon.city}
                        </span>
                      </p>
                    )}

                    {salon.phone && (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <a
                          href={`tel:${salon.phone}`}
                          className="hover:text-purple-600 transition-colors"
                        >
                          {salon.phone}
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 md:ml-4">
                  <Link
                    href={`/salons/${salon.slug}`}
                    className="px-6 py-2.5 bg-purple-50 text-purple-600 font-medium rounded-lg hover:bg-purple-100 transition-colors text-sm"
                  >
                    View Details
                  </Link>

                  <a
                    href={
                      salon.phone
                        ? `tel:${salon.phone}`
                        : `/salons/${salon.slug}`
                    }
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg"
                  >
                    Book Now
                  </a>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {!loading && !error && !selectedArea && salons.length === 0 && (
            <div className="text-center py-16 animate-[fadeIn_0.5s_ease-out]">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                <svg
                  className="w-12 h-12 text-gray-400"
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
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No salons to display
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Use your location or enter an area above to discover salons near
                you.
              </p>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 ml-13"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 ml-13"></div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
                      <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </main>

      {/* Add these animation keyframes to your global CSS or use a Tailwind plugin */}
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
        
        .ml-13 {
          margin-left: 3.25rem;
        }
      `}</style>
    </div>
  );
}
