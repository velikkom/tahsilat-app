"use client";

import "@/styles/auth.css";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <div className="auth-page__inner">{children}</div>
    </div>
  );
}
