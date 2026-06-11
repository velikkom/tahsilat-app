import { apiFetch } from "@/services/apiClient";
import {
  clearSession,
  getToken,
  isAuthenticated,
  loadRememberMe,
  saveRememberMe,
  saveToken,
} from "@/utils/tokenStorage";

export {
  clearSession,
  getToken,
  isAuthenticated,
  loadRememberMe,
  saveRememberMe,
  saveToken,
};

export class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthError";
  }
}

async function parseAuthError(response, fallback) {
  try {
    const data = await response.json();
    return data?.message || fallback;
  } catch {
    return fallback;
  }
}

export async function login(email, password) {
  const response = await apiFetch("/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });

  if (!response.ok) {
    throw new AuthError(
      await parseAuthError(response, "Email veya şifre hatalı")
    );
  }

  return response.json();
}

export async function register(payload) {
  const response = await apiFetch("/auth/register", {
    method: "POST",
    auth: false,
    body: payload,
  });

  if (!response.ok) {
    throw new AuthError(
      await parseAuthError(response, "Kayıt işlemi başarısız")
    );
  }

  return response.json();
}

export function logout() {
  clearSession();
}
