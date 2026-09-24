"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  registerSchema,
  mapUsernameToRegisterNames,
} from "@/schemas/authSchemas";
import { register } from "@/services/authService";

export default function useRegisterPage() {
  const [apiError, setApiError] = useState("");
  const [registered, setRegistered] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const form = useForm({
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
      setApiError(
        err.message || "Kayıt işlemi başarısız. Bilgilerinizi kontrol edin."
      );
    }
  }

  return {
    apiError,
    registered,
    successMessage,
    registerField: form.register,
    handleSubmit: form.handleSubmit,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    onSubmit,
  };
}
