"use client";

import { createContext, useContext, useMemo, useState } from "react";

const DashboardYearContext = createContext(null);

export const DASHBOARD_YEAR_OPTIONS = [
  { label: "Tümü", value: null },
  { label: "2025", value: 2025 },
  { label: "2026", value: 2026 },
];

export const DASHBOARD_MONTH_OPTIONS = [
  { label: "Tümü", value: null },
  { label: "Ocak", value: 1 },
  { label: "Şubat", value: 2 },
  { label: "Mart", value: 3 },
  { label: "Nisan", value: 4 },
  { label: "Mayıs", value: 5 },
  { label: "Haziran", value: 6 },
  { label: "Temmuz", value: 7 },
  { label: "Ağustos", value: 8 },
  { label: "Eylül", value: 9 },
  { label: "Ekim", value: 10 },
  { label: "Kasım", value: 11 },
  { label: "Aralık", value: 12 },
];

export function DashboardYearProvider({ children }) {
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);

  const value = useMemo(
    () => ({
      year,
      setYear,
      month,
      setMonth,
      chartYear: year ?? new Date().getFullYear(),
    }),
    [year, month]
  );

  return (
    <DashboardYearContext.Provider value={value}>
      {children}
    </DashboardYearContext.Provider>
  );
}

export default function useDashboardYear() {
  const context = useContext(DashboardYearContext);

  if (!context) {
    throw new Error("useDashboardYear must be used within DashboardYearProvider");
  }

  return context;
}
