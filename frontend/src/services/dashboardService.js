import { apiFetchJson } from "@/services/apiClient";

function buildYearQuery(year) {
  return year != null ? `year=${year}` : "";
}

function appendQuery(path, params) {
  const filtered = params.filter(Boolean);

  if (filtered.length === 0) {
    return path;
  }

  return `${path}?${filtered.join("&")}`;
}

function dashboardFetch(path, fallbackMessage) {
  return apiFetchJson(`/dashboard${path}`, {
    errorMessage: fallbackMessage,
  });
}

export function getDashboardMetrics(year) {
  return dashboardFetch(
    appendQuery("/metrics", [buildYearQuery(year)]),
    "Dashboard metrikleri alınamadı"
  );
}

export function getMonthlyCollections(year) {
  const targetYear = year ?? new Date().getFullYear();

  return dashboardFetch(
    `/monthly-collections?year=${targetYear}`,
    "Aylık tahsilat verileri alınamadı"
  );
}

export function getMonthPaymentBreakdown(year, month) {
  return dashboardFetch(
    `/monthly-collections/payment-breakdown?year=${year}&month=${month}`,
    "Aylık ödeme dağılımı alınamadı"
  );
}

export function getPaymentTypeDistribution(year) {
  return dashboardFetch(
    appendQuery("/payment-type-distribution", [buildYearQuery(year)]),
    "Ödeme türü dağılımı alınamadı"
  );
}

export function getPaymentTypeCustomers(paymentType, year, limit = 10) {
  const params = [`paymentType=${paymentType}`, `limit=${limit}`];

  if (year != null) {
    params.push(`year=${year}`);
  }

  return dashboardFetch(
    `/payment-type-distribution/customers?${params.join("&")}`,
    "Ödeme türü firmaları alınamadı"
  );
}

export function getTopCustomers(limit = 10, year) {
  const params = [`limit=${limit}`];

  if (year != null) {
    params.push(`year=${year}`);
  }

  return dashboardFetch(
    `/top-customers?${params.join("&")}`,
    "Firma bazlı tahsilat verileri alınamadı"
  );
}

export function getRecentCollections(limit = 10, year) {
  const params = [`limit=${limit}`];

  if (year != null) {
    params.push(`year=${year}`);
  }

  return dashboardFetch(
    `/recent-collections?${params.join("&")}`,
    "Son tahsilatlar alınamadı"
  );
}

export function getDashboardInsights(year) {
  return dashboardFetch(
    appendQuery("/insights", [buildYearQuery(year)]),
    "Dashboard insight verileri alınamadı"
  );
}
