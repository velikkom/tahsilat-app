"use client";

import { useMemo } from "react";
import { Chart } from "primereact/chart";
import { usePaymentTypeDistribution } from "@/hooks/useDashboardMetrics";
import { formatPaymentType } from "@/utils/dashboardFormatters";
import DashboardWidget from "./DashboardWidget";

const CHART_COLORS = [
  "#0d6efd",
  "#ffc107",
  "#198754",
  "#0dcaf0",
  "#6f42c1",
];

export default function PaymentTypeChart() {
  const { data, loading, error, refresh } = usePaymentTypeDistribution();

  const chartData = useMemo(() => {
    const items = data?.items || [];

    return {
      labels: items.map((item) => formatPaymentType(item.paymentType)),
      datasets: [
        {
          data: items.map((item) => Number(item.totalAmount ?? 0)),
          backgroundColor: CHART_COLORS.slice(0, items.length),
        },
      ],
    };
  }, [data]);

  const chartOptions = useMemo(
    () => ({
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label(context) {
              const item = data?.items?.[context.dataIndex];
              const amount = new Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: "TRY",
              }).format(context.raw ?? 0);

              return `${amount} (${item?.percentage ?? 0}%)`;
            },
          },
        },
      },
    }),
    [data]
  );

  return (
    <DashboardWidget
      title="Ödeme Türü Dağılımı"
      loading={loading}
      error={error}
      onRetry={refresh}
    >
      <div className="dashboard-chart">
        <Chart type="pie" data={chartData} options={chartOptions} />
      </div>
    </DashboardWidget>
  );
}
