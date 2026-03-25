"use client";

const accent: Record<string, string> = {
  purple: "border-purple-500/40 bg-purple-800/30",
  blue: "border-blue-500/40 bg-blue-800/30",
  green: "border-green-500/40 bg-green-800/30",
  orange: "border-orange-500/40 bg-orange-800/30",
  rose: "border-rose-500/40 bg-rose-800/30",
};

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: "purple" | "blue" | "green" | "orange" | "rose";
}

export function StatCard({
  label,
  value,
  sub,
  color = "purple",
}: StatCardProps) {
  return (
    <div className={`rounded-xl border p-5 ${accent[color]}`}>
      <p className="text-xs text-purple-300 mb-2">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-purple-400 mt-1">{sub}</p>}
    </div>
  );
}
