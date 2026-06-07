"use client";

import { createContext, useContext, useMemo, useState } from "react";

const DashboardYearContext = createContext(null);

export const DASHBOARD_YEAR_OPTIONS = [
  { label: "Tümü", value: null },
  { label: "2025", value: 2025 },
  { label: "2026", value: 2026 },
];

export function DashboardYearProvider({ children }) {
  const [year, setYear] = useState(null);

  const value = useMemo(
    () => ({
      year,
      setYear,
      chartYear: year ?? new Date().getFullYear(),
    }),
    [year]
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
