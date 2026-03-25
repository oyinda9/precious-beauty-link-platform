"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function DashboardHeader({ searchTerm, onSearchChange }: Props) {
  return (
    <div className="flex items-center justify-between mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Super Admin Dashboard</h1>
        <p className="text-purple-200 text-sm">System-wide analytics and management</p>
      </div>

      <div className="relative w-full max-w-sm">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400"
          size={16}
        />
        <Input
          className="pl-9 bg-slate-800/50 border-purple-500/30 text-white placeholder:text-purple-300"
          placeholder="Search salons..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
