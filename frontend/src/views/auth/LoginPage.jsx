"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FaEnvelope } from "react-icons/fa";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthInput from "@/components/auth/AuthInput";
import PasswordInput from "@/components/auth/PasswordInput";
import RememberMe from "@/components/auth/RememberMe";
import AuthFooterLinks from "@/components/auth/AuthFooterLinks";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import { loginSchema } from "@/schemas/authSchemas";
import {
  login,
  saveToken,
  saveRememberMe,
  loadRememberMe,
} from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: loadRememberMe(),
    },
  });

  const rememberMe = watch("rememberMe");

  async function onSubmit(data) {
    try {
      setApiError("");
      const response = await login(data.email, data.password);
      saveToken(response.accessToken);
      saveRememberMe(data.rememberMe);
      router.push("/dashboard");
    } catch (err) {
      setApiError(err.message || "Email veya şifre hatalı");
    }
  }

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Log in"
          subtitle="Tahsilat ERP hesabınıza giriş yapın"
        />

        {apiError && (
          <div className="auth-alert auth-alert--error" role="alert">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <AuthInput
            id="login-email"
            label="Email"
            type="email"
            placeholder="ornek@sirket.com"
            icon={FaEnvelope}
            autoComplete="email"
            error={errors.email?.message}
            registration={register("email")}
          />

          <PasswordInput
            id="login-password"
            label="Password"
            autoComplete="current-password"
            error={errors.password?.message}
            registration={register("password")}
          />

          <div className="auth-row">
            <RememberMe
              checked={rememberMe}
              onChange={(e) => setValue("rememberMe", e.target.checked)}
            />
            <Link href="/forgot-password" className="auth-link">
              Forgot Password?
            </Link>
          </div>

          <AuthSubmitButton loading={isSubmitting}>Log in</AuthSubmitButton>
        </form>

        <SocialAuthButtons />

        <AuthFooterLinks
          text="Don't have an account?"
          linkText="Sign Up"
          href="/register"
        />
      </AuthCard>
    </AuthLayout>
  );
}
