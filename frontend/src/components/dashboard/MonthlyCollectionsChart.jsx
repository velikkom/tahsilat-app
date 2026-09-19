"use client";

import { useMemo } from "react";
import { Chart } from "primereact/chart";
import useBreakpoint from "@/hooks/useBreakpoint";
import useDashboardYear from "@/context/DashboardYearContext";
import { useMonthlyCollections } from "@/hooks/useDashboardMetrics";
import { buildBarChartScaleOptions } from "@/utils/chartResponsive";
import DashboardWidget from "./DashboardWidget";

export default function MonthlyCollectionsChart() {
  const { isMobile } = useBreakpoint();
  const { year, chartYear, setYear, setMonth } = useDashboardYear();
  const { data, loading, error, refresh } = useMonthlyCollections(year);

  const chartData = useMemo(() => {
    const months = data?.months || [];

    return {
      labels: months.map((item) => item.monthName),
      datasets: [
        {
          label: "Ödendi",
          data: months.map((item) => Number(item.paidAmount ?? item.totalAmount ?? 0)),
          backgroundColor: "rgba(22, 163, 74, 0.75)",
          borderColor: "rgb(22, 163, 74)",
          borderWidth: 1,
          borderRadius: 4,
          stack: "collections",
        },
        {
          label: "Ödenmedi",
          data: months.map((item) => Number(item.unpaidAmount ?? 0)),
          backgroundColor: "rgba(217, 119, 6, 0.75)",
          borderColor: "rgb(217, 119, 6)",
          borderWidth: 1,
          borderRadius: 4,
          stack: "collections",
        },
      ],
    };
  }, [data]);

  const chartOptions = useMemo(
    () => ({
      maintainAspectRatio: false,
      onClick: (_event, elements) => {
        if (!elements?.length || !data?.months?.length) {
          return;
        }

        const index = elements[0].index;
        const monthItem = data.months[index];

        if (monthItem) {
          if (year == null) {
            setYear(chartYear);
          }

          setMonth(monthItem.month);
        }
      },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label(context) {
              return `${context.dataset.label}: ${new Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: "TRY",
              }).format(context.raw ?? 0)}`;
            },
          },
        },
      },
      scales: {
        ...buildBarChartScaleOptions(isMobile),
        x: {
          ...buildBarChartScaleOptions(isMobile).x,
          stacked: true,
        },
        y: {
          ...buildBarChartScaleOptions(isMobile).y,
          stacked: true,
        },
      },
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
