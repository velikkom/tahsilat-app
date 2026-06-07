"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getDashboardInsights,
  getDashboardMetrics,
  getMonthlyCollections,
  getPaymentTypeDistribution,
  getRecentCollections,
  getTopCustomers,
} from "@/services/dashboardService";

function useDashboardQuery(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();

      if (requestId !== requestIdRef.current) {
        return;
      }

      setData(result);
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setError(err.message || "Veri yüklenirken hata oluştu.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, deps);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function useDashboardMetrics(year) {
  return useDashboardQuery(() => getDashboardMetrics(year), [year]);
}

export function useMonthlyCollections(year) {
  const chartYear = year ?? new Date().getFullYear();

  return useDashboardQuery(() => getMonthlyCollections(chartYear), [chartYear]);
}

export function usePaymentTypeDistribution(year) {
  return useDashboardQuery(() => getPaymentTypeDistribution(year), [year]);
}

export function useTopCustomers(limit = 10, year) {
  return useDashboardQuery(() => getTopCustomers(limit, year), [limit, year]);
}

export function useRecentCollections(limit = 10, year) {
  return useDashboardQuery(() => getRecentCollections(limit, year), [limit, year]);
}

export function useDashboardInsights(year) {
  return useDashboardQuery(() => getDashboardInsights(year), [year]);
}
