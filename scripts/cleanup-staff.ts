/**
 * Cleanup script to fix staff count issues
 * Run: npx ts-node scripts/cleanup-staff.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupStaff() {
  try {
    console.log("🔍 Finding all salons and their staff...\n");

    const salons = await prisma.salon.findMany({
      include: {
        staff: true,
        subscription: true,
      },
    });

    console.log(`Found ${salons.length} salons\n`);

    for (const salon of salons) {
      const sub = salon.subscription;
      const staffCount = salon.staff.length;
      const limit = sub?.plan === "FREE" ? 1 : sub?.plan === "STARTER" ? 2 : 999;

      console.log(`📍 Salon: ${salon.name}`);
      console.log(`   Plan: ${sub?.plan || "NONE"}`);
      console.log(`   Status: ${sub?.status || "NONE"}`);
      console.log(`   Staff: ${staffCount}/${limit}`);

      // If exceeding limit, show which staff to remove
      if (staffCount > limit) {
        console.log(`   ⚠️  EXCEEDS LIMIT! Need to remove ${staffCount - limit} staff`);
        console.log(`   Staff members:`);

        salon.staff.forEach((s, i) => {
          console.log(`     ${i + 1}. ${s.id} (isActive: ${s.isActive})`);
        });

        // Remove excess staff
        const toRemove = salon.staff.slice(limit);
        for (const staff of toRemove) {
          await prisma.salonStaff.delete({
            where: { id: staff.id },
          });
          console.log(`   ✅ Removed staff: ${staff.id}`);
        }
      } else {
        console.log(`   ✓ Within limit`);
      }
      console.log();
    }

    console.log("✅ Cleanup complete! Subscription enforcement should now work correctly.");
    console.log("\n🧪 Testing: Try adding staff now. Should get error if limit reached.");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupStaff();
