"use client";

import { useMemo } from "react";
import { Chart } from "primereact/chart";
import useBreakpoint from "@/hooks/useBreakpoint";
import { useTopCustomers } from "@/hooks/useDashboardMetrics";
import { buildHorizontalBarScaleOptions } from "@/utils/chartResponsive";
import DashboardWidget from "./DashboardWidget";

export default function TopCustomersChart() {
  const { isMobile } = useBreakpoint();
  const { data, loading, error, refresh } = useTopCustomers(10);

  const chartData = useMemo(() => {
    const customers = data?.customers || [];

    return {
      labels: customers.map((item) => item.companyName),
      datasets: [
        {
          label: "Toplam Tahsilat",
          data: customers.map((item) => Number(item.totalAmount ?? 0)),
          backgroundColor: "rgba(25, 135, 84, 0.75)",
          borderColor: "rgb(25, 135, 84)",
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    };
  }, [data]);

  const chartOptions = useMemo(
    () => ({
      indexAxis: "y",
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
      scales: buildHorizontalBarScaleOptions(isMobile),
    }),
    [isMobile]
  );

  return (
    <DashboardWidget
      title="Firma Bazlı Tahsilat (Top 10)"
      loading={loading}
      error={error}
      onRetry={refresh}
    >
      <div className="dashboard-chart dashboard-chart--tall">
        <Chart type="bar" data={chartData} options={chartOptions} />
      </div>
    </DashboardWidget>
  );
}
