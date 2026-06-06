import { API_V1 } from "@/config/api";

const BASE_URL = API_V1;

function getAuthHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  };
}

async function parseErrorResponse(response, fallbackMessage) {
  const errorText = await response.text();

  if (!errorText) {
    return fallbackMessage;
  }

  try {
    const parsed = JSON.parse(errorText);

    return parsed.message || parsed.error || errorText;
  } catch {
    return errorText;
  }
}

async function dashboardFetch(path, fallbackMessage) {
  const response = await fetch(`${BASE_URL}/dashboard${path}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response, fallbackMessage));
  }

  return response.json();
}

export function getDashboardMetrics() {
  return dashboardFetch("/metrics", "Dashboard metrikleri alınamadı");
}

export function getMonthlyCollections(year) {
  const query = year ? `?year=${year}` : "";

  return dashboardFetch(
    `/monthly-collections${query}`,
    "Aylık tahsilat verileri alınamadı"
  );
}

export function getPaymentTypeDistribution() {
  return dashboardFetch(
    "/payment-type-distribution",
    "Ödeme türü dağılımı alınamadı"
  );
}

export function getTopCustomers(limit = 10) {
  return dashboardFetch(
    `/top-customers?limit=${limit}`,
    "Firma bazlı tahsilat verileri alınamadı"
  );
}

export function getRecentCollections(limit = 10) {
  return dashboardFetch(
    `/recent-collections?limit=${limit}`,
    "Son tahsilatlar alınamadı"
  );
}
