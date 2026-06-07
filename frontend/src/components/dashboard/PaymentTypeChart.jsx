"use client";

import { useMemo, useState } from "react";
import { Chart } from "primereact/chart";
import useBreakpoint from "@/hooks/useBreakpoint";
import useDashboardYear from "@/context/DashboardYearContext";
import { usePaymentTypeDistribution } from "@/hooks/useDashboardMetrics";
import { formatPaymentType } from "@/utils/dashboardFormatters";
import { buildLegendOptions } from "@/utils/chartResponsive";
import DashboardWidget from "./DashboardWidget";
import PaymentTypeCustomersModal from "./PaymentTypeCustomersModal";

const CHART_COLORS = [
  "#0d6efd",
  "#ffc107",
  "#198754",
  "#0dcaf0",
  "#6f42c1",
];

export default function PaymentTypeChart() {
  const { isMobile } = useBreakpoint();
  const { year } = useDashboardYear();
  const { data, loading, error, refresh } = usePaymentTypeDistribution(year);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);

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
      onClick: (_event, elements) => {
        if (!elements?.length || !data?.items?.length) {
          return;
        }

        const index = elements[0].index;
        const item = data.items[index];

        if (item?.paymentType) {
          setSelectedPaymentType(item.paymentType);
        }
      },
      plugins: {
        legend: buildLegendOptions(isMobile),
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
    [data, isMobile]
  );

  return (
    <>
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

      <PaymentTypeCustomersModal
        show={Boolean(selectedPaymentType)}
        onHide={() => setSelectedPaymentType(null)}
        paymentType={selectedPaymentType}
        year={year}
      />
    </>
  );
}
