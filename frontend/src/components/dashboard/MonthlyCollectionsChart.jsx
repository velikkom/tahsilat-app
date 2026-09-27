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
        Üzerine gelince dağılım açılır; çubuğa tıklayınca ay seçilir.
      </p>
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
