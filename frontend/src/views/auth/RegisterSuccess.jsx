"use client";

import Link from "next/link";
import { FaCheck } from "react-icons/fa";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";

export default function RegisterSuccess({ message }) {
  return (
    <AuthLayout>
      <AuthCard>
        <div className="auth-success-state">
          <div className="auth-success-state__icon">
            <FaCheck />
          </div>
          <h2 className="auth-success-state__title">Kayıt Talebi Oluşturuldu</h2>
          <p className="auth-success-state__text">{message}</p>
          <Link href="/login" className="auth-btn text-decoration-none">
            Login Sayfasına Dön
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
