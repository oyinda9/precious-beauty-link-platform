"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [anim, setAnim] = useState(false);

  const current =
    theme === "dark" ? "dark" : theme === "light" ? "light" : "system";

  const toggle = () => {
    setAnim(true);
    const next = current === "dark" ? "light" : "dark";
    setTheme(next);
    setTimeout(() => setAnim(false), 500);
  };

  return (
    <div className="fixed right-6 bottom-8 z-50">
      <Button
        onClick={toggle}
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        className="rounded-full shadow-lg ring-2 ring-primary/30 hover:ring-primary/60 transition-all duration-300 bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-700"
      >
        {current === "dark" ? (
          <Sun
            className={`w-12 h-12 text-yellow-400 drop-shadow-lg transition-transform duration-500 ${
              anim ? "scale-125 rotate-12" : ""
            }`}
          />
        ) : (
          <Moon
            className={`w-12 h-12 text-slate-700 dark:text-slate-200 drop-shadow-lg transition-transform duration-500 ${
              anim ? "scale-125 -rotate-12" : ""
            }`}
          />
        )}
      </Button>
    </div>
  );
}