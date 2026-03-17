import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function getAreaPartsFromCoords(lat: string, lng: string) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "precious-beauty-link-platform/1.0",
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);
  const address = data?.address || {};

  const parts = [
    address.city,
    address.town,
    address.village,
    address.county,
    address.state_district,
    address.state,
    address.suburb,
  ]
    .filter(Boolean)
    .map((value: string) => value.trim());

  return {
    parts: Array.from(new Set(parts)),
    country: String(address.country || ""),
    countryCode: String(address.country_code || "").toUpperCase(),
    rawAddress: address,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const cityParam = String(searchParams.get("city") || "").trim();
    const lat = String(searchParams.get("lat") || "").trim();
    const lng = String(searchParams.get("lng") || "").trim();

    let areaParts: string[] = [];
    let country = "";
    let countryCode = "";

    if (cityParam) {
      areaParts = [cityParam];
    } else if (lat && lng) {
      const geo = await getAreaPartsFromCoords(lat, lng);
      areaParts = geo.parts;
      country = geo.country;
      countryCode = geo.countryCode;

      if (countryCode && countryCode !== "NG") {
        return NextResponse.json(
          {
            error: `Detected location is outside Nigeria: ${country || "Unknown country"}`,
            lat,
            lng,
            country,
            countryCode,
            matchedAreas: areaParts,
          },
          { status: 400 },
        );
      }
    }

    if (areaParts.length === 0) {
      return NextResponse.json(
        { error: "City or coordinates are required" },
        { status: 400 },
      );
    }

    const salons = await prisma.salon.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        city: true,
        phone: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const normalizedAreas = areaParts.map(normalize);

    const matchedSalons = salons.filter((salon) => {
      const haystack = normalize(`${salon.city || ""} ${salon.address || ""}`);
      return normalizedAreas.some((area) => haystack.includes(area));
    });

    return NextResponse.json({
      city: areaParts[0],
      matchedAreas: areaParts,
      salons: matchedSalons,
      lat,
      lng,
      country,
      countryCode,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load nearby salons" },
      { status: 500 },
    );
  }
}
