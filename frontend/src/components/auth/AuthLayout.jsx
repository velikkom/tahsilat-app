"use client";

import ThemeToggle from "@/components/layout/ThemeToggle";
import "@/styles/auth.css";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <ThemeToggle className="theme-toggle--auth" />
      <div className="auth-page__inner">{children}</div>
    </div>
  );
}
