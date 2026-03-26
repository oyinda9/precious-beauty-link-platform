import { NextRequest, NextResponse } from "next/server";
import {
  autoCancelExpiredBookingsCron,
  resetMonthlyQuotasCron,
  subscriptionRemindersCron,
  enforceSubscriptionStatusesCron,
} from "@/lib/cron-jobs";

/**
 * GET /api/cron/auto-cancel-bookings
 * Trigger manual auto-cancel of expired bookings
 * Should only be accessible from authorized sources (GitHub Actions, etc.)
 */
export async function GET(request: NextRequest) {
  // Verify authorization (check for secret token)
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await autoCancelExpiredBookingsCron();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/cron/reset-quotas
 * Trigger monthly quota reset
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { jobType } = await request.json();

    if (jobType === "reset-quotas") {
      const result = await resetMonthlyQuotasCron();
      return NextResponse.json(result);
    } else if (jobType === "send-reminders") {
      const result = await subscriptionRemindersCron();
      return NextResponse.json(result);
    } else if (jobType === "enforce-statuses") {
      const result = await enforceSubscriptionStatusesCron();
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: "Invalid jobType" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}
