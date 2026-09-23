"use client";

import { FaMoon, FaSun } from "react-icons/fa";
import useTheme from "@/context/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={`theme-toggle touch-target ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
      title={isDark ? "Açık tema" : "Koyu tema"}
    >
      {isDark ? <FaSun aria-hidden /> : <FaMoon aria-hidden />}
    </button>
  );
}
