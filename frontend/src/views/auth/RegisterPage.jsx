"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FaCheck, FaEnvelope, FaUser } from "react-icons/fa";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthInput from "@/components/auth/AuthInput";
import PasswordInput from "@/components/auth/PasswordInput";
import AuthFooterLinks from "@/components/auth/AuthFooterLinks";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import {
  registerSchema,
  mapUsernameToRegisterNames,
} from "@/schemas/authSchemas";
import { register } from "@/services/authService";

export default function RegisterPage() {
  const [apiError, setApiError] = useState("");
  const [registered, setRegistered] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data) {
    try {
      setApiError("");
      const { firstName, lastName } = mapUsernameToRegisterNames(data.username);

      const response = await register({
        firstName,
        lastName,
        email: data.email,
        password: data.password,
      });

      setSuccessMessage(
        response.message ||
          "Kayıt talebiniz başarıyla oluşturuldu. Yönetici onayından sonra giriş yapabilirsiniz."
      );
      setRegistered(true);
    } catch (err) {
      setApiError(err.message || "Kayıt işlemi başarısız. Bilgilerinizi kontrol edin.");
    }
  }

  if (registered) {
    return (
      <AuthLayout>
        <AuthCard>
          <div className="auth-success-state">
            <div className="auth-success-state__icon">
              <FaCheck />
            </div>
            <h2 className="auth-success-state__title">
              Kayıt Talebi Oluşturuldu
            </h2>
            <p className="auth-success-state__text">{successMessage}</p>
            <Link href="/login" className="auth-btn text-decoration-none">
              Login Sayfasına Dön
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
          title="Sign up"
          subtitle="Yeni bir Tahsilat ERP hesabı oluşturun"
        />

        {apiError && (
          <div className="auth-alert auth-alert--error" role="alert">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <AuthInput
            id="register-username"
            label="Username"
            placeholder="Ad Soyad veya kullanıcı adı"
            icon={FaUser}
            autoComplete="username"
            error={errors.username?.message}
            registration={registerField("username")}
          />

          <AuthInput
            id="register-email"
            label="Email"
            type="email"
            placeholder="ornek@sirket.com"
            icon={FaEnvelope}
            autoComplete="email"
            error={errors.email?.message}
            registration={registerField("email")}
          />

          <PasswordInput
            id="register-password"
            label="Password"
            autoComplete="new-password"
            error={errors.password?.message}
            registration={registerField("password")}
          />

          <PasswordInput
            id="register-confirm-password"
            label="Confirm Password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            registration={registerField("confirmPassword")}
          />

          <AuthSubmitButton loading={isSubmitting}>Sign up</AuthSubmitButton>
        </form>

        <SocialAuthButtons />

        <AuthFooterLinks
          text="Already have an account?"
          linkText="Login"
          href="/login"
        />
      </AuthCard>
    </AuthLayout>
  );
}
