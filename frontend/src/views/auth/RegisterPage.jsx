"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthFooterLinks from "@/components/auth/AuthFooterLinks";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import RegisterForm from "./RegisterForm";
import RegisterSuccess from "./RegisterSuccess";
import useRegisterPage from "./useRegisterPage";

export default function RegisterPage() {
  const page = useRegisterPage();

  if (page.registered) {
    return <RegisterSuccess message={page.successMessage} />;
  }

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Sign up"
          subtitle="Yeni bir Tahsilat ERP hesabı oluşturun"
        />
        {page.apiError && (
          <div className="auth-alert auth-alert--error" role="alert">
            {page.apiError}
          </div>
        )}
        <RegisterForm
          registerField={page.registerField}
          errors={page.errors}
          isSubmitting={page.isSubmitting}
          onSubmit={page.handleSubmit(page.onSubmit)}
        />
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
