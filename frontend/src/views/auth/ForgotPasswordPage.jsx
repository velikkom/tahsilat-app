"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FaCheck, FaEnvelope } from "react-icons/fa";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthInput from "@/components/auth/AuthInput";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import { forgotPasswordSchema } from "@/schemas/authSchemas";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data) {
    // UI-only: backend integration (SMTP, token, reset API) will be added later.
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubmittedEmail(data.email);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <AuthLayout>
        <AuthCard>
          <div className="auth-success-state">
            <div className="auth-success-state__icon">
              <FaCheck />
            </div>
            <h2 className="auth-success-state__title">Talebiniz alındı</h2>
            <p className="auth-success-state__text">
              <strong>{submittedEmail}</strong> adresine şifre sıfırlama
              bağlantısı gönderilecek. (SMTP entegrasyonu yakında)
            </p>
            <Link href="/login" className="auth-btn text-decoration-none">
              Login sayfasına dön
            </Link>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Forgot Password"
          subtitle="Email adresinize sıfırlama bağlantısı göndereceğiz"
        />

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <AuthInput
            id="forgot-email"
            label="Email"
            type="email"
            placeholder="ornek@sirket.com"
            icon={FaEnvelope}
            autoComplete="email"
            error={errors.email?.message}
            registration={register("email")}
          />

          <AuthSubmitButton loading={isSubmitting}>
            Reset Link Gönder
          </AuthSubmitButton>
        </form>

        <p className="auth-footer">
          <Link href="/login" className="auth-footer__link">
            ← Login sayfasına dön
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
