import { NextResponse } from "next/server";
import { getAllSubscriptionPlans } from "@/lib/services/subscription-service";

/**
 * GET /api/subscriptions/plans
 * Get all available subscription plans
 * Public endpoint, no auth required
 */
export async function GET() {
  try {
    const plans = getAllSubscriptionPlans();

    // Format plans for frontend
    const formattedPlans = Object.entries(plans).map(([key, plan]) => ({
      id: key,
      name: plan.name,
      price: plan.price,
      bookingLimit: plan.bookingLimit,
      features: plan.features,
      period: "monthly",
      currency: "NGN",
      description: getDescriptionForPlan(key),
      popular: key === "STANDARD",
    }));

    return NextResponse.json({ plans: formattedPlans });
  } catch (error) {
    console.error("Get plans error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get plan descriptions
 */
function getDescriptionForPlan(planName: string): string {
  const descriptions: Record<string, string> = {
    FREE: "Perfect for trying out SalonBook",
    STARTER: "Ideal for salon owners just starting out",
    STANDARD: "Great for growing salons with steady traffic",
    GROWTH: "For established salons with many bookings",
    PREMIUM: "For multi-location salons and enterprises",
  };

  return descriptions[planName] || "";
}
