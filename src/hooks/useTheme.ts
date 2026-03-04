"use client";

import { useTheme as useNextTheme } from "next-themes";
import { themes, type ThemeName } from "@/lib/themes";
import { useEffect, useState } from "react";

export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = (theme === "system" ? systemTheme : theme) as ThemeName;

  // Apply theme CSS variables to document
  useEffect(() => {
    if (!mounted || !currentTheme) return;

    const root = document.documentElement;
    const themeColors = themes[currentTheme]?.colors;

    if (themeColors) {
      Object.entries(themeColors).forEach(([key, value]) => { 
        const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        root.style.setProperty(`--${cssKey}`, value);
      });
    }
  }, [currentTheme, mounted]);

  return {
    theme: currentTheme,
    setTheme,
    themes: Object.keys(themes) as ThemeName[],
    mounted,
    // Helper functions
    isLight: currentTheme === "light",
    isDark: currentTheme === "dark",
    getThemeConfig: () => themes[currentTheme],
  };
}
