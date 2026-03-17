"use client";
import { useEffect, useState } from "react";

export default function CallbackPage() {
  const [msg, setMsg] = useState("Verifying payment...");

  useEffect(() => {
    const run = async () => {
      const ref = new URLSearchParams(window.location.search).get("reference");
      if (!ref) return setMsg("Missing payment reference.");

      const res = await fetch(`/api/payments/opay/verify?reference=${encodeURIComponent(ref)}`, {
        credentials: "include",
      });
      const data = await res.json();

      setMsg(res.ok ? "Payment successful. Subscription activated." : (data?.error || "Payment failed."));
    };
    run();
  }, []);

  return <p>{msg}</p>;
}