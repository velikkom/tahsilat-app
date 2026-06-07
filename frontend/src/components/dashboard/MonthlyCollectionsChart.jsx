"use client";

import { useMemo } from "react";
import { Chart } from "primereact/chart";
import useBreakpoint from "@/hooks/useBreakpoint";
import { useMonthlyCollections } from "@/hooks/useDashboardMetrics";
import { buildBarChartScaleOptions } from "@/utils/chartResponsive";
import DashboardWidget from "./DashboardWidget";

export default function MonthlyCollectionsChart() {
  const { isMobile } = useBreakpoint();
  const currentYear = new Date().getFullYear();
  const { data, loading, error, refresh } = useMonthlyCollections(currentYear);

  const chartData = useMemo(() => {
    const months = data?.months || [];

    return {
      labels: months.map((item) => item.monthName),
      datasets: [
        {
          label: "Tahsilat",
          data: months.map((item) => Number(item.totalAmount ?? 0)),
          backgroundColor: "rgba(13, 110, 253, 0.7)",
          borderColor: "rgb(13, 110, 253)",
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    };
  }, [data]);

  const chartOptions = useMemo(
    () => ({
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label(context) {
              return new Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: "TRY",
              }).format(context.raw ?? 0);
            },
          },
        },
      },
      scales: buildBarChartScaleOptions(isMobile),
    }),
    [isMobile]
  );

  return (
    <DashboardWidget
      title={`Aylık Tahsilat (${data?.year || currentYear})`}
      loading={loading}
      error={error}
      onRetry={refresh}
    >
      <div className="dashboard-chart">
        <Chart type="bar" data={chartData} options={chartOptions} />
      </div>
    </DashboardWidget>
  );
}
