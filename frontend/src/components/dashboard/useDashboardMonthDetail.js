"use client";

import { useEffect, useState } from "react";
import { getMonthPaymentBreakdown } from "@/services/dashboardService";

export default function useDashboardMonthDetail(chartYear, month) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (month == null) {
      return;
    }

    let cancelled = false;

    getMonthPaymentBreakdown(chartYear, month)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setData(result);
        setError("");
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }

        setError(err.message || "Ay detayı alınamadı");
        setData(null);
      });

    return () => {
      cancelled = true;
    };
  }, [chartYear, month]);

  const loading =
    !error && (!data || data.year !== chartYear || data.month !== month);

  return { data, error, loading };
}
