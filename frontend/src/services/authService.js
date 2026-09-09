import { API_V1 } from "@/config/api";
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

export async function logout() {
  const { forceStopSessionMonitor } = await import("@/services/sessionMonitor");
  forceStopSessionMonitor();

  const token = getToken();

  if (token) {
    try {
      await fetch(`${API_V1}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Local session must still be cleared if the API call fails.
    }
  }

  clearSession();
}

export async function checkSession() {
  const response = await apiFetch("/auth/session", {
    method: "GET",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || "Session check failed");
  }

  return response.json();
}
