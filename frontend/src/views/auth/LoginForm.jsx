"use client";

import Link from "next/link";
import { FaEnvelope } from "react-icons/fa";
import AuthInput from "@/components/auth/AuthInput";
import PasswordInput from "@/components/auth/PasswordInput";
import RememberMe from "@/components/auth/RememberMe";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";

export default function LoginForm({
  register,
  errors,
  isSubmitting,
  rememberMe,
  onRememberMeChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} noValidate>
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
        <RememberMe checked={rememberMe} onChange={onRememberMeChange} />
        <Link href="/forgot-password" className="auth-link">
          Forgot Password?
        </Link>
      </div>

      <AuthSubmitButton loading={isSubmitting}>Log in</AuthSubmitButton>
    </form>
  );
}
