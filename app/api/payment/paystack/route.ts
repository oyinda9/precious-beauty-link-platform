import { NextResponse } from "next/server";
import Paystack from "paystack-api";

const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { amount, email, currency } = await req.json();
    // Paystack expects amount in kobo (NGN) or the lowest currency unit
    const response = await paystack.transaction.initialize({
      amount: amount, // already in kobo/lowest unit
      email,
      currency: currency || "NGN",
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
    });
    if (response.status && response.data && response.data.authorization_url) {
      return NextResponse.json({ url: response.data.authorization_url });
    } else {
      return NextResponse.json(
        { error: response.message || "Could not start Paystack payment." },
        { status: 400 },
      );
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
