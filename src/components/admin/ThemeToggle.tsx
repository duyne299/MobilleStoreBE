"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  // Use a placeholder with the same structure during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="p-2">
        <div className="h-4 w-4" />
      </div>
    );
  }
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg border border-border bg-card text-card-foreground hover:bg-accent transition-colors"
      suppressHydrationWarning
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
