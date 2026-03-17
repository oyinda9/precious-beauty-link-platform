"use client";

import { useState } from "react";

type CardPayload = {
  cardHolderName: string;
  cardNumber: string;
  cvv: string;
  expiryMonth: string;
  expiryYear: string;
};

type Props = {
  planKey: "free" | "basic" | "standard" | "premium";
  productName: string;
  productDescription: string;
  card: CardPayload;
};

export default function PaystackButton({
  planKey,
  productName,
  productDescription,
  card,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/payments/opay/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          planKey,
          productName,
          productDescription,
          card,
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || "Failed to initialize payment");

      if (data?.free) {
        window.location.href = "/salon-admin/settings?subscription=activated";
        return;
      }

      if (!data?.redirectUrl) throw new Error("Missing OPay redirect URL");
      window.location.href = data.redirectUrl; // 3DS redirect
    } catch (error) {
      alert(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button type="button" onClick={handlePay} disabled={loading}>
      {loading ? "Processing..." : "Pay with OPay"}
    </button>
  );
}
