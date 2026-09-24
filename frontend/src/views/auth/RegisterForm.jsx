"use client";

import { FaEnvelope, FaUser } from "react-icons/fa";
import AuthInput from "@/components/auth/AuthInput";
import PasswordInput from "@/components/auth/PasswordInput";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";

export default function RegisterForm({
  registerField,
  errors,
  isSubmitting,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} noValidate>
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
  );
}
