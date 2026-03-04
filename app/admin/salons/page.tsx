"use client";

import React, { useEffect, useState } from "react";

export default function AdminSalonsPage() {
  const [salons, setSalons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSalons() {
      const res = await fetch("/api/salons");
      const json = await res.json();
      setSalons(json.salons || []);
      setLoading(false);
    }
    fetchSalons();
  }, []);

  if (loading) return <p>Loading salons...</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">All Salons</h1>
      <table className="w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>City</th>
            <th>Status</th>
            <th>Subscription</th>
          </tr>
        </thead>
        <tbody>
          {salons.map((s) => (
            <tr key={s.id} className="border-t">
              <td>{s.name}</td>
              <td>{s.city}</td>
              <td>{s.isActive ? "Active" : "Inactive"}</td>
              <td>{s.subscriptionStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
