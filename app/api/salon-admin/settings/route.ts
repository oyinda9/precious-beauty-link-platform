import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, extractToken } from "@/lib/auth";

const DEFAULT_HOURS = {
  Monday: { open: "09:00", close: "18:00" },
  Tuesday: { open: "09:00", close: "18:00" },
  Wednesday: { open: "09:00", close: "18:00" },
  Thursday: { open: "09:00", close: "18:00" },
  Friday: { open: "09:00", close: "18:00" },
  Saturday: { open: "10:00", close: "16:00" },
  Sunday: { open: "", close: "" },
};

function getToken(request: NextRequest) {
  return (
    request.cookies.get("token")?.value ||
    request.cookies.get("auth-token")?.value ||
    request.cookies.get("authToken")?.value ||
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("auth_token")?.value ||
    extractToken(request.headers.get("authorization"))
  );
}

function getUserIdFromToken(token: string) {
  const payload = verifyToken(token) as {
    userId?: string;
    id?: string;
    sub?: string;
  } | null;

  return payload?.userId || payload?.id || payload?.sub || null;
}

function normalizeBusinessHours(hours: any) {
  return {
    Monday: {
      open: hours?.Monday?.open ?? DEFAULT_HOURS.Monday.open,
      close: hours?.Monday?.close ?? DEFAULT_HOURS.Monday.close,
    },
    Tuesday: {
      open: hours?.Tuesday?.open ?? DEFAULT_HOURS.Tuesday.open,
      close: hours?.Tuesday?.close ?? DEFAULT_HOURS.Tuesday.close,
    },
    Wednesday: {
      open: hours?.Wednesday?.open ?? DEFAULT_HOURS.Wednesday.open,
      close: hours?.Wednesday?.close ?? DEFAULT_HOURS.Wednesday.close,
    },
    Thursday: {
      open: hours?.Thursday?.open ?? DEFAULT_HOURS.Thursday.open,
      close: hours?.Thursday?.close ?? DEFAULT_HOURS.Thursday.close,
    },
    Friday: {
      open: hours?.Friday?.open ?? DEFAULT_HOURS.Friday.open,
      close: hours?.Friday?.close ?? DEFAULT_HOURS.Friday.close,
    },
    Saturday: {
      open: hours?.Saturday?.open ?? DEFAULT_HOURS.Saturday.open,
      close: hours?.Saturday?.close ?? DEFAULT_HOURS.Saturday.close,
    },
    Sunday: {
      open: hours?.Sunday?.open ?? DEFAULT_HOURS.Sunday.open,
      close: hours?.Sunday?.close ?? DEFAULT_HOURS.Sunday.close,
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.salonAdmin.findFirst({
      where: { userId },
      include: {
        salon: true,
        user: true,
      },
    });

    if (!admin?.salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    return NextResponse.json({
      salonName: admin.salon.name ?? "",
      email: admin.user?.email ?? admin.salon.email ?? "",
      phone: admin.user?.phone ?? admin.salon.phone ?? "",
      salonAddress: admin.salon.address ?? "",
      salonCity: admin.salon.city ?? "",
      salonState: (admin.salon as any).state ?? "",
      businessHours: normalizeBusinessHours((admin.salon as any).businessHours),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.salonAdmin.findFirst({
      where: { userId },
      include: {
        salon: true,
        user: true,
      },
    });

    if (!admin?.salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    const body = await request.json();

    const salonUpdateData: Record<string, any> = {};
    const userUpdateData: Record<string, any> = {};

    if (typeof body.salonName === "string") {
      salonUpdateData.name = body.salonName.trim();
    }

    if (typeof body.salonAddress === "string") {
      salonUpdateData.address = body.salonAddress.trim();
    }

    if (typeof body.salonCity === "string") {
      salonUpdateData.city = body.salonCity.trim();
    }

    if (typeof body.salonState === "string") {
      salonUpdateData.state = body.salonState.trim();
    }

    if (typeof body.phone === "string") {
      salonUpdateData.phone = body.phone.trim();
      userUpdateData.phone = body.phone.trim();
    }

    if (typeof body.email === "string") {
      salonUpdateData.email = body.email.trim().toLowerCase();
      userUpdateData.email = body.email.trim().toLowerCase();
    }

    if (body.businessHours && typeof body.businessHours === "object") {
      salonUpdateData.businessHours = normalizeBusinessHours(
        body.businessHours,
      );
    }

    const [updatedSalon, updatedUser] = await prisma.$transaction([
      prisma.salon.update({
        where: { id: admin.salon.id },
        data: salonUpdateData,
      }),
      prisma.user.update({
        where: { id: admin.userId },
        data: userUpdateData,
      }),
    ]);

    return NextResponse.json({
      salonName: updatedSalon.name ?? "",
      email: updatedUser.email ?? updatedSalon.email ?? "",
      phone: updatedUser.phone ?? updatedSalon.phone ?? "",
      salonAddress: updatedSalon.address ?? "",
      salonCity: updatedSalon.city ?? "",
      salonState: (updatedSalon as any).state ?? "",
      businessHours: normalizeBusinessHours(
        (updatedSalon as any).businessHours,
      ),
      success: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
