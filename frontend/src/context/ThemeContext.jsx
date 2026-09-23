"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  applyTheme,
  getResolvedTheme,
  persistTheme,
} from "@/utils/theme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("light");

  useEffect(() => {
    const resolved = getResolvedTheme();
    applyTheme(resolved);
    setThemeState(resolved);
  }, []);

  const value = useMemo(() => {
    function setTheme(next) {
      const resolved = next === "dark" ? "dark" : "light";
      applyTheme(resolved);
      persistTheme(resolved);
      setThemeState(resolved);
    }

    function toggleTheme() {
      setTheme(theme === "dark" ? "light" : "dark");
    }

    return {
      theme,
      isDark: theme === "dark",
      setTheme,
      toggleTheme,
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export default function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
