"use client";

import { useMemo } from "react";
import { Chart } from "primereact/chart";
import useBreakpoint from "@/hooks/useBreakpoint";
import useDashboardYear from "@/context/DashboardYearContext";
import { useMonthlyCollections } from "@/hooks/useDashboardMetrics";
import DashboardWidget from "./DashboardWidget";
import {
  buildMonthlyCollectionsChartData,
  buildMonthlyCollectionsChartOptions,
} from "./monthlyCollectionsChartConfig";

export default function MonthlyCollectionsChart() {
  const { isMobile } = useBreakpoint();
  const { year, chartYear, setYear, setMonth } = useDashboardYear();
  const { data, loading, error, refresh } = useMonthlyCollections(year);

  const chartData = useMemo(
    () => buildMonthlyCollectionsChartData(data),
    [data]
  );

  const chartOptions = useMemo(
    () =>
      buildMonthlyCollectionsChartOptions({
        isMobile,
        data,
        year,
        chartYear,
        setYear,
        setMonth,
      }),
    [chartYear, data, isMobile, setMonth, setYear, year]
  );

  const displayYear = data?.year || chartYear;

  return (
    <DashboardWidget
      title={`Aylık tahsilat (${displayYear})`}
      loading={loading}
      error={error}
      onRetry={refresh}
    >
      <p className="text-muted small mb-3">
        Çubuğa tıklayınca ay seçilir; müşteri listesi ve ay detayı o aya göre güncellenir.
      </p>
      <div className="dashboard-chart">
        <Chart type="bar" data={chartData} options={chartOptions} />
      </div>
    </DashboardWidget>
  );
}
