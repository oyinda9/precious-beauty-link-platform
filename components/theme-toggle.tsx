"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const current =
    theme === "dark" ? "dark" : theme === "light" ? "light" : "system";

  const toggle = () => {
    const next = current === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <div className="fixed right-4 bottom-6 z-50">
      <Button
        onClick={toggle}
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
      >
        {current === "dark" ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
