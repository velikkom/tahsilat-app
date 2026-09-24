import { API_V1 } from "@/config/api";
import { apiFetch } from "@/services/apiClient";
import { clearSession, getToken } from "@/utils/tokenStorage";

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
  const response = await apiFetch("/auth/session", { method: "GET" });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || "Session check failed");
  }

  return response.json();
}
