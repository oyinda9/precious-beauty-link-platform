/**
 * Debug script to test subscription enforcement
 * Run: npx ts-node scripts/test-enforcement.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Plan limits
const PLAN_LIMITS: Record<string, number> = {
  FREE: 1,
  STARTER: 2,
  STANDARD: 5,
  GROWTH: 10,
  PREMIUM: 999999,
};

async function testEnforcement() {
  try {
    console.log("🔍 Testing Subscription Enforcement\n");
    console.log("=".repeat(60));

    // Get first salon
    const salon = await prisma.salon.findFirst({
      include: {
        subscription: true,
        staff: {
          where: { isActive: true },
        },
        _count: { select: { staff: true } },
      },
    });

    if (!salon) {
      console.log("❌ No salons found in database");
      return;
    }

    console.log(`\n📍 Salon: ${salon.name}`);
    console.log(`   ID: ${salon.id}`);

    // Check subscription
    const sub = salon.subscription;
    if (!sub) {
      console.log(`   ❌ NO SUBSCRIPTION!`);
      return;
    }

    const staffLimit = PLAN_LIMITS[sub.plan] || 1;
    const staffCount = salon.staff.length;

    console.log(`\n💳 Subscription:`);
    console.log(`   Plan: ${sub.plan}`);
    console.log(`   Status: ${sub.status}`);
    console.log(`   Period: ${sub.currentPeriodStart} to ${sub.currentPeriodEnd}`);

    console.log(`\n👥 Staff:`);
    console.log(`   Current: ${staffCount}`);
    console.log(`   Limit: ${staffLimit}`);
    console.log(`   At Limit? ${staffCount >= staffLimit ? "✓ YES" : "✗ NO"}`);

    if (staffCount > 0) {
      console.log(`   Staff IDs: ${salon.staff.map((s) => s.id).join(", ")}`);
    }

    // Test if enforcement would block
    console.log(`\n🧪 Enforcement Test:`);
    if (staffCount >= staffLimit) {
      console.log(`   ✅ WOULD BE BLOCKED (at limit)`);
    } else {
      console.log(
        `   ⚠️ WOULD BE ALLOWED (${staffLimit - staffCount} slots remaining)`,
      );
    }

    // Check for any staff without isActive set
    const allStaff = await prisma.salonStaff.findMany({
      where: { salonId: salon.id },
    });
    const inactiveStaff = allStaff.filter((s) => !s.isActive);

    if (inactiveStaff.length > 0) {
      console.log(
        `\n⚠️ WARNING: ${inactiveStaff.length} inactive staff found (not counted in limit)`,
      );
    }

    console.log("\n" + "=".repeat(60));
    console.log("\n📊 All Subscriptions Status:");

    const allSubs = await prisma.subscription.findMany({
      include: { salon: true },
    });

    allSubs.forEach((s) => {
      const limit = PLAN_LIMITS[s.plan] || 1;
      console.log(`   ${s.salon.name}: ${s.plan} (${s.status}), Limit: ${limit}`);
    });

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testEnforcement();
