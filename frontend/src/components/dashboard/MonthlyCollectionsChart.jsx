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
  monthlyTotalLabelPlugin,
} from "./monthlyCollectionsChartConfig";

export function MonthlyCollectionsChartView({
  data,
  loading = false,
  error = null,
  onRetry,
  title,
  hint = "Üzerine gelince dağılım açılır.",
  isMobile = false,
  year,
  chartYear,
  setYear,
  setMonth,
}) {
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
      title={title || `Aylık tahsilat (${displayYear})`}
      loading={loading}
      error={error}
      onRetry={onRetry}
    >
      <p className="text-muted small mb-3">{hint}</p>
      <div className="dashboard-chart dashboard-chart--monthly">
        <Chart
          type="bar"
          data={chartData}
          options={chartOptions}
          plugins={[monthlyTotalLabelPlugin]}
        />
        <div className="monthly-chart-tooltip" />
      </div>
    </DashboardWidget>
  );
}

export default function MonthlyCollectionsChart() {
  const { isMobile } = useBreakpoint();
  const { year, chartYear, setYear, setMonth } = useDashboardYear();
  const { data, loading, error, refresh } = useMonthlyCollections(year);

  return (
    <MonthlyCollectionsChartView
      data={data}
      loading={loading}
      error={error}
      onRetry={refresh}
      hint="Üzerine gelince dağılım açılır; çubuğa tıklayınca ay seçilir."
      isMobile={isMobile}
      year={year}
      chartYear={chartYear}
      setYear={setYear}
      setMonth={setMonth}
    />
  );
}
