"use client";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

export default function ClientPaymentButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    setLoading(true);
    setError("");
    try {
      // Example: $20.00 payment
      const amount = 2000; // cents
      const currency = "usd";
      const email = "client@example.com"; // Replace with actual client email
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency, email }),
      });
      const data = await res.json();
      if (data.url) {
        const stripe = await stripePromise;
        window.location.href = data.url;
      } else {
        setError(data.error || "Could not start payment session.");
      }
    } catch (err: any) {
      setError(err.message || "Payment error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={loading}
        className="bg-green-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
      {error && <div className="mt-2 text-red-600">{error}</div>}
    </div>
  );
}
