import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const secretKey = String(process.env.PAYSTACK_SECRET_KEY || "").trim();
    const baseUrl = String(
      process.env.PAYSTACK_BASE_URL || "https://api.paystack.co",
    ).trim();

    if (!secretKey) {
      return NextResponse.json(
        { error: "Missing PAYSTACK_SECRET_KEY" },
        { status: 500 },
      );
    }

    // Verify Paystack signature
    const signature = request.headers.get("x-paystack-signature");
    const body = await request.text();

    const hash = crypto
      .createHmac("sha512", secretKey)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event === "charge.success") {
      const { reference, status } = event.data;

      if (status === "success") {
        // Find subscription by reference
        const subscription = await prisma.subscription.findFirst({
          where: { reference: reference || undefined },
        });

        if (!subscription) {
          console.warn(`Subscription not found for reference: ${reference}`);
          return NextResponse.json({ success: true }); // Return success to avoid webhook retries
        }

        // Update subscription status to ACTIVE
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: "ACTIVE",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            paymentVerifiedAt: new Date(),
          },
        });

        console.log(
          `Subscription ${subscription.id} activated via Paystack webhook`,
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Paystack webhook error:", e);
    return NextResponse.json(
      { error: e?.message || "Webhook processing failed" },
      { status: 500 },
    );
  }
}
