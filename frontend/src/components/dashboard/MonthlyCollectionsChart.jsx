"use client";

import { useMemo, useState } from "react";
import { Chart } from "primereact/chart";
import useBreakpoint from "@/hooks/useBreakpoint";
import useDashboardYear from "@/context/DashboardYearContext";
import { useMonthlyCollections } from "@/hooks/useDashboardMetrics";
import { buildBarChartScaleOptions } from "@/utils/chartResponsive";
import DashboardWidget from "./DashboardWidget";
import MonthPaymentBreakdownModal from "./MonthPaymentBreakdownModal";

export default function MonthlyCollectionsChart() {
  const { isMobile } = useBreakpoint();
  const { year, chartYear } = useDashboardYear();
  const { data, loading, error, refresh } = useMonthlyCollections(year);
  const [selectedMonth, setSelectedMonth] = useState(null);

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
      onClick: (_event, elements) => {
        if (!elements?.length || !data?.months?.length) {
          return;
        }

        const index = elements[0].index;
        const monthItem = data.months[index];

        if (monthItem) {
          setSelectedMonth(monthItem);
        }
      },
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
    [data, isMobile]
  );

  const displayYear = data?.year || chartYear;

  return (
    <>
      <DashboardWidget
        title={`Aylık Tahsilat (${displayYear})`}
        loading={loading}
        error={error}
        onRetry={refresh}
      >
        <div className="dashboard-chart">
          <Chart type="bar" data={chartData} options={chartOptions} />
        </div>
      </DashboardWidget>

      <MonthPaymentBreakdownModal
        show={Boolean(selectedMonth)}
        onHide={() => setSelectedMonth(null)}
        year={displayYear}
        month={selectedMonth?.month}
        monthName={selectedMonth?.monthName}
      />
    </>
  );
}
