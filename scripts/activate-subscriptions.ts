/**
 * Fix script to activate subscriptions for testing
 * Run this via: npx ts-node scripts/activate-subscriptions.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function activateSubscriptions() {
  try {
    console.log("🔍 Finding salons with inactive subscriptions...");

    // Get all subscriptions
    const subscriptions = await prisma.subscription.findMany({
      include: { salon: true },
    });

    console.log(`Found ${subscriptions.length} subscriptions\n`);

    if (subscriptions.length === 0) {
      console.log("❌ No subscriptions found in database!");
      console.log("Creating sample subscription...\n");

      // Try to create a sample if needed
      const salons = await prisma.salon.findMany({ take: 1 });
      
      if (salons.length > 0) {
        const salon = salons[0];
        const newSub = await prisma.subscription.create({
          data: {
            salonId: salon.id,
            plan: "STARTER",
            status: "ACTIVE",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        });
        console.log(`✅ Created subscription for ${salon.name}:`, newSub.id);
      }
      return;
    }

    // Activate all inactive subscriptions
    let activatedCount = 0;
    for (const sub of subscriptions) {
      console.log(`Salon: ${sub.salon.name}`);
      console.log(`  Current Plan: ${sub.plan}`);
      console.log(`  Current Status: ${sub.status}`);

      if (sub.status !== "ACTIVE") {
        const updated = await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            status: "ACTIVE",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
        console.log(`  ✅ Activated! New Status: ${updated.status}`);
        activatedCount++;
      } else {
        console.log(`  ✓ Already active`);
      }
      console.log();
    }

    console.log(`\n🎉 Done! Activated ${activatedCount} subscription(s)`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

activateSubscriptions();
