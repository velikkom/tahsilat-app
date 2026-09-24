"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthFooterLinks from "@/components/auth/AuthFooterLinks";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import { loginSchema } from "@/schemas/authSchemas";
import {
  login,
  saveToken,
  saveRememberMe,
  loadRememberMe,
} from "@/services/authService";
import LoginForm from "./LoginForm";

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
        <LoginForm
          register={register}
          errors={errors}
          isSubmitting={isSubmitting}
          rememberMe={watch("rememberMe")}
          onRememberMeChange={(e) => setValue("rememberMe", e.target.checked)}
          onSubmit={handleSubmit(onSubmit)}
        />
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
