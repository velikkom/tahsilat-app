import { apiFetchJson } from "@/services/apiClient";

export function getDashboardSummary() {
  return apiFetchJson("/reports/dashboard-summary", {
    errorMessage: "Dashboard summary fetch failed",
  });
}
